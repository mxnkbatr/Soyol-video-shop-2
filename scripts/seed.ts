
import { MongoClient, ServerApiVersion } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGO_DB || 'Buddha';

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set in .env file');
    process.exit(1);
}

const products = [
    {
        name: 'Sony A7 IV Mirrorless Camera',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 2498,
        rating: 5,
        category: 'Cameras',
        featured: true,
        stockStatus: 'in-stock',
        inventory: 15,
        wholesale: false,
        createdAt: new Date(),
    },
    {
        name: 'Canon EOS R5',
        image: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 3899,
        rating: 4.8,
        category: 'Cameras',
        featured: true,
        stockStatus: 'in-stock',
        inventory: 8,
        wholesale: false,
        createdAt: new Date(),
    },
    {
        name: 'DJI Mavic 3 Cine',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 4999,
        rating: 4.9,
        category: 'Drones',
        featured: true,
        stockStatus: 'pre-order',
        wholesale: true,
        createdAt: new Date(),
    },
    {
        name: 'Sigma 24-70mm f/2.8 Art DG DN',
        image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 1099,
        rating: 4.7,
        category: 'Lenses',
        featured: false,
        stockStatus: 'in-stock',
        inventory: 25,
        wholesale: false,
        createdAt: new Date(),
    },
    {
        name: 'Aputure 120d II',
        image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 745,
        rating: 4.6,
        category: 'Lighting',
        featured: false,
        stockStatus: 'in-stock',
        inventory: 10,
        wholesale: true,
        createdAt: new Date(),
    },
    {
        name: 'Rode Wireless GO II',
        image: 'https://images.unsplash.com/photo-1520529986492-5b52661e312d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 299,
        rating: 4.5,
        category: 'Audio',
        featured: true,
        stockStatus: 'in-stock',
        inventory: 50,
        wholesale: false,
        createdAt: new Date(),
    },
    {
        name: 'Blackmagic Pocket Cinema Camera 6K Pro',
        image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 2535,
        rating: 4.8,
        category: 'Cameras',
        featured: true,
        stockStatus: 'in-stock',
        inventory: 5,
        wholesale: false,
        createdAt: new Date(),
    },
    {
        name: 'Atomos Ninja V',
        image: 'https://images.unsplash.com/photo-1561089489-f13d5e730d72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 599,
        rating: 4.4,
        category: 'Monitors',
        featured: false,
        stockStatus: 'in-stock',
        inventory: 20,
        wholesale: true,
        createdAt: new Date(),
    },
    {
        name: 'Schoeps CMIT 5U',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 2199,
        rating: 5,
        category: 'Audio',
        featured: false,
        stockStatus: 'pre-order',
        wholesale: false,
        createdAt: new Date(),
    },
    {
        name: 'GoPro HERO12 Black',
        image: 'https://images.unsplash.com/photo-1564466136373-c3d80951131c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 399,
        rating: 4.7,
        category: 'Action Cameras',
        featured: true,
        stockStatus: 'in-stock',
        inventory: 100,
        wholesale: true,
        createdAt: new Date(),
    }
];

async function seed() {
    const client = new MongoClient(MONGODB_URI!, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        tls: true,
        tlsAllowInvalidCertificates: true,
    });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(MONGO_DB);
        const collection = db.collection('products');

        // Optional: Clear existing products
        await collection.deleteMany({});
        console.log('Cleared existing products');

        const result = await collection.insertMany(products);
        console.log(`Inserted ${result.insertedCount} products`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await client.close();
    }
}

seed();
