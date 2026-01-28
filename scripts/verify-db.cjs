require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const verify = async () => {
    if (!uri) {
        console.error('MONGODB_URI is missing');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        console.log(`Connected to database: ${db.databaseName}`);

        const userCount = await db.collection('users').countDocuments();
        const productCount = await db.collection('products').countDocuments();
        const affiliateLinkCount = await db.collection('affiliateLinks').countDocuments();

        console.log('--- Database Verification ---');
        console.log(`Users: ${userCount}`);
        console.log(`Products: ${productCount}`);
        console.log(`Affiliate Links: ${affiliateLinkCount}`);
        console.log('-----------------------------');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await client.close();
    }
};

verify();
