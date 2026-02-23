import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getCollection } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { User } from '@/models/User';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });

  // Allow streaming responses up to 30 seconds
  export const maxDuration = 30;

  export async function POST(req: Request) {
    try {
      const { messages } = await req.json();
      const session = await auth();
      let userContext = '';

      if (session?.userId) {
        try {
          const users = await getCollection<User>('users');
          const user = await users.findOne({ _id: new ObjectId(session.userId) });
          if (user?.addresses?.length) {
            userContext = `
          Хэрэглэгчийн хадгалсан хаягууд:
          ${user.addresses.map((a, i) => `
          ${i + 1}. ID: ${a.id} | [${a.label || 'Хаяг ' + (i + 1)}] ${a.isDefault ? '(Үндсэн)' : ''}
             - ${a.city}, ${a.district}, ${a.street}
          `).join('\n')}
          Утас: ${user.phone || 'Бүртгэлгүй'}
          `;
          }
        } catch (err) {
          console.error('Failed to fetch user context:', err);
        }
      }

      let result;
      
      // Attempt to stream text
      console.log('Starting streamText with model: models/gemini-flash-lite-latest');
      try {
        result = await streamText({
            model: google('models/gemini-flash-lite-latest'), // Switch to working LITE model
            // @ts-ignore
            maxSteps: 3, // Allow multi-step tool execution
            maxRetries: 1, // Allow 1 retry for transient errors
            messages,
            tools: {
             addToCart: tool({
              description: 'Add a product to the shopping cart. You MUST provide the productId.',
              parameters: z.object({
                productId: z.string(),
              }),
              execute: async ({ productId }: { productId: string }) => {
                console.log('Executing addToCart tool with args:', { productId });
                if (!productId) return 'Error: productId is missing.';
                
                try {
                  const productsCollection = await getCollection('products');
                  let product;
                  try {
                       const { ObjectId } = await import('mongodb');
                       product = await productsCollection.findOne({ _id: new ObjectId(productId) });
                  } catch (e) {
                       product = await productsCollection.findOne({ _id: productId as any });
                  }

                  if (!product) {
                      console.log('Product not found for addToCart:', productId);
                      return 'Product not found with that ID.';
                  }

                  const productData = {
                      id: product._id.toString(),
                      name: product.name,
                      price: product.price,
                      image: product.image || '',
                      quantity: 1
                  };
                  
                  return `[ACTION:ADD_TO_CART_DATA:${JSON.stringify(productData)}:END_ACTION] Added ${product.name} to cart.`;
                } catch (error) {
                  console.error('Add to cart error:', error);
                  return 'Error adding to cart.';
                }
              },
            } as any),
            navigateToPage: tool({
              description: 'Navigate to a specific page. You MUST provide the page name.',
              parameters: z.object({
                page: z.string().describe('The page to navigate to (home, cart, orders, checkout, profile, wishlist). REQUIRED.'),
              }),
              execute: async ({ page }: { page: string }) => {
                console.log('Executing navigateToPage tool with args:', { page });
                if (!page) return 'Error: page argument is missing.';
                
                let path = '/';
                const p = page.toLowerCase();
                if (p.includes('cart')) path = '/cart';
                else if (p.includes('order')) path = '/orders';
                else if (p.includes('checkout')) path = '/checkout';
                else if (p.includes('profile')) path = '/profile';
                else if (p.includes('wishlist')) path = '/wishlist';
                else path = '/';
                
                return `[ACTION:NAVIGATE:${path}:END_ACTION] Navigating to ${path}.`;
              },
            } as any),
            checkInventory: tool({
              description: 'Check inventory stock level for a product.',
              parameters: z.object({
                productName: z.string().describe('The name of the product to check. REQUIRED.'),
              }),
              execute: async ({ productName }: { productName: string }) => {
                console.log('Executing checkInventory tool with args:', { productName });
                if (!productName) return 'Error: productName is missing.';
                try {
                  const productsCollection = await getCollection('products');
                  const product = await productsCollection.findOne({ 
                      $or: [
                          { name: { $regex: new RegExp(productName, 'i') } }
                      ]
                  });
                  
                  if (product) {
                    return `Inventory Status for ${product.name}: ${product.inventory ?? 0} units available. Price: ${product.price}₮.`;
                  } else {
                    return `Product ${productName} not found in inventory.`;
                  }
                } catch (error) {
                  return 'Error checking inventory.';
                }
              },
            } as any),
            searchProducts: tool({
              description: 'Search for products. You MUST provide the searchQuery.',
              parameters: z.object({
                searchQuery: z.string().describe('The search query. REQUIRED. e.g. "Sony", "camera"'),
              }),
              execute: async ({ searchQuery }: { searchQuery: string }) => {
                console.log('Executing searchProducts tool with args:', { searchQuery });
                let query = searchQuery;
                if (!query) {
                    console.error('Search query is missing in args');
                    return [];
                }
                try {
                  const productsCollection = await getCollection('products');
                  const regex = new RegExp(query.split(' ').join('|'), 'i'); 
                  const products = await productsCollection.find({
                    $or: [
                      { name: { $regex: regex } },
                      { description: { $regex: regex } },
                      { category: { $regex: regex } }
                    ]
                  }).limit(5).toArray();
                  console.log(`Found ${products.length} products for query "${query}"`);
                  return products.map(p => ({
                    id: p._id.toString(),
                    name: p.name,
                    price: p.price,
                    stock: p.inventory ?? 0,
                    description: p.description || '',
                    image: p.image || ''
                  }));
                } catch (error) {
                  console.error('Search error:', error);
                  return [];
                }
              },
            } as any),
          },
        system: `
          Чи бол 'Soyol' их дэлгүүрийн ухаалаг туслах 'Soyol AI' юм. Чи зөвхөн видео тоног төхөөрөмж биш, бүх төрлийн бараа зардаг дэлгүүрийн туслах.

          Үндсэн зарчмууд:
          1. Борлуулалтын арга барил (Sales-Oriented):
             - Дэлгүүрээ хоосон магтах хэрэггүй ("Манайх хамгийн шилдэг нь", "Бүх зүйл бий" гэх мэт ерөнхий магтаал БҮҮ хэл).
             - Үүний оронд бараа бүтээгдэхүүнийг идэвхтэй санал болгож, хэрэглэгчийг худалдан авалт хийхэд "шахсан", ятгасан хариулт өг.
             - Жишээ нь: "Энэ загвар танд яг тохирно, одоо л авахгүй бол дуусах магадлалтай", "Таны хайж байгаа чанар яг энд байна".

          2. Чанар ба Сэтгэл ханамж:
             - Барааны чанарт бүрэн итгэлтэй байж, хэрэглэгчийн сэтгэл ханамжийг амла ("Таны сэтгэлд 100% нийцнэ", "Чанарын хувьд эргэлзэх хэрэггүй", "Амьдралд тань бодит үнэ цэнэ нэмнэ").
             - Хэрэглэгчид барааны давуу талыг мэдрүүлж, авах хүслийг нь төрүүл.
             - Баталгаат хугацааны талаар асуувал: "Албан ёсны цаасан баталгаа байхгүй ч, барааны чанарт бид бүрэн итгэлтэй байдаг. Таны сэтгэл ханамж бидний баталгаа юм" гэсэн утгаар хариул.

          3. Харилцааны хэв маяг: 
             - Өөрийгөө 'Soyol AI' гэж танилцуул.
             - Үргэлж 'Та' гэж хүндэтгэлтэй харьц.
             - Өөртөө итгэлтэй, ятган үнэмшүүлэх (persuasive), шийдэмгий өнгө аястай бай.

          4. Ажиллах логик (Autonomous Function Calling):
             - Хэрэглэгч бараа хайх, үнэ асуух үед: ЗААВАЛ 'searchProducts' функцийг ашигла.
             - Хэрэглэгч "Захиалгаа харъя", "Сагсаа үзье", "Нүүр хуудас руу буцъя" гэх мэтээр хуудас шилжихийг хүсвэл: ЗААВАЛ 'navigateToPage' функцийг ашигла.
             - Хэрэглэгч "Сагсанд хийе", "Авъя" гэж тодорхой барааг хэлвэл:
               a. Хэрэв барааны ID мэдэгдэж байвал 'addToCart' функцийг шууд ашигла.
               b. Хэрэв барааны ID мэдэгдэхгүй байвал эхлээд 'searchProducts' ашиглаж олоод, дараа нь 'addToCart' ашигла.
             - Барааны үлдэгдэл шалгах бол 'checkInventory' ашигла.
             
             АНХААР: Үйлдлийг гүйцэтгэхийн тулд зөвхөн Function Call ашигла. JSON форматтай текст хариулт хэзээ ч бүү бич.
             Функцийн хариуг хэрэглэгчид дамжуулахдаа [ACTION:...] хэсгийг өөрчлөхгүйгээр оруул.

          5. Хариултын бүтэц:
             - Олдсон барааны мэдээллийг харуулахдаа:
           [PRODUCT_CARD: {"id": "барааны_id", "name": "барааны_нэр", "price": үнэ, "image": "зургийн_холбоос"}]
             - Функцээс ирсэн [ACTION:...] кодыг хэрэглэгч рүү илгээх хариултдаа ЗААВАЛ хэвээр нь дамжуул.
           
        6. Хүргэлт, захиалгын мэдээлэл:
           - Хүргэлтийн захиалга авах утас: 77-181818
           - Бэлэн байгаа барааг өдөрт нь хүргэнэ.
           - Захиалгаар ирэх бараа 7-14 хоногт ирнэ.
           
        7. Хаяг бүртгүүлэх, баталгаажуулах:
           - Хэрэглэгчээс хаяг асуухдаа: "Та өмнөх хаяг болох [Хадгалсан хаяг] дээрээ авах уу, эсвэл шинэ хаяг бүртгүүлэх үү?" гэж асуу.
           - Хэрэглэгч хаягаа асуувал хадгалсан хаягуудыг жагсааж хэл.
           - Хэрэглэгч тодорхой хаягаар авахыг хүсвэл [ADDRESS_CONFIRMATION] карт харуул:
             [ADDRESS_CONFIRMATION: {"id": "address_id", "label": "хаягийн_нэр", "fullText": "бүрэн_хаяг"}]
           - Хэрэглэгч шинэ хаяг оруулахыг хүсвэл 'navigateToPage' ашиглан checkout хуудас руу шилжүүл.

        ${userContext ? `8. Хэрэглэгчийн мэдээлэл:${userContext}
           Хэрэглэгч "Миний хаяг хаана билээ?" гэж асуувал дээрх хаягийг хэлж өгнө үү.` : ''}
      `,
    });
      } catch (error) { 
        console.error('streamText error:', error);
        throw error;
      }

    return result.toDataStreamResponse();
  } catch (error: any) {
    // Enhanced Error Logging
    console.error('Chat API Error Details:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
      stack: error.stack,
    });
    
    // Check for specific error types
    if (error.message?.includes('API key')) {
        console.error('CRITICAL: API Key missing or invalid');
    } else if (error.status === 429 || error.message?.includes('Quota') || error.message?.includes('429')) {
        console.error('CRITICAL: Quota exceeded (429)');
        return new Response("Уучлаарай, систем хэт ачаалалтай байна. Та хэсэг хугацааны дараа дахин оролдоно уу. (Quota Exceeded)", { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Failed to process chat', details: error.message, stack: error.stack }), { status: 500 });
  }
}
