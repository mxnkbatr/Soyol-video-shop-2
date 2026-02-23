import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { userId, phone } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orders = await getCollection('orders');

    // Find orders by userId OR by matching phone number (catches pre-registration guest orders)
    const query = phone
      ? { $or: [{ userId }, { phone, userId: 'guest' }] }
      : { userId };

    const results = await orders
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders: results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: authUserId } = await auth();
    const userId = authUserId || 'guest';

    const body = await req.json();
    const orders = await getCollection('orders');
    const products = await getCollection('products');

    // Extract phone from shipping info for guest order tracking
    const phone = body.shipping?.phone || body.phone || null;

    const result = await orders.insertOne({
      userId,
      phone, // Store phone at top level for easy querying
      items: body.items || [],
      total: body.total || 0,
      status: body.status || 'pending',
      deliveryMethod: body.deliveryMethod || 'delivery',
      shipping: body.shipping || {},
      shippingCost: body.shippingCost || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Decrement inventory for each purchased item
    for (const item of (body.items || [])) {
      const productId = item.productId || item.id;
      if (!productId) continue;

      let objectId: ObjectId;
      try {
        objectId = new ObjectId(productId);
      } catch {
        continue; // Skip invalid IDs
      }

      // Decrement the inventory
      await products.updateOne(
        { _id: objectId },
        { $inc: { inventory: -(item.quantity || 1) } }
      );

      // Check if inventory hit 0 or below — if so, delete the product
      const updatedProduct = await products.findOne({ _id: objectId });
      if (updatedProduct && (updatedProduct.inventory ?? 0) <= 0) {
        await products.deleteOne({ _id: objectId });
        console.log(`[Orders API] Product ${productId} deleted — inventory reached 0`);
      }
    }

    // Silent Registration: Save address if requested
    if (userId !== 'guest' && body.saveAddress && body.shipping) {
      try {
        const users = await getCollection<User>('users');
        const userObjectId = new ObjectId(userId);
        
        // Construct new address object
        const newAddress = {
          id: new ObjectId().toString(),
          city: body.shipping.city || '',
          district: body.shipping.district || '',
          label: body.shipping.label || 'Home', // Default label if not provided
          khoroo: '1', // Default, as form doesn't have it explicitly yet
          street: body.shipping.address || '',
          note: body.shipping.notes || '',
          isDefault: true, // User requested "Save as primary"
        };

        // Unset previous default if exists
        await users.updateOne(
          { _id: userObjectId, 'addresses.isDefault': true },
          { $set: { 'addresses.$.isDefault': false } }
        );

        // Add new address
        await users.updateOne(
          { _id: userObjectId },
          { 
            $push: { addresses: newAddress } as any,
            $set: { phone: phone || undefined } // Update phone if provided
          }
        );
      } catch (err) {
        console.error('Failed to save address silently:', err);
        // Don't fail the order if address save fails
      }
    }

    return NextResponse.json({ orderId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
