import clientPromise from '@/lib/mongodb';
import { Collection, MongoClient } from 'mongodb';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  imageUrl: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  isActive: boolean;
}

interface AffiliateLink {
  id: string;
  code: string;
  productId: string;
  affiliatorId: string;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password might not always be needed or should be handled securely
  role: 'admin' | 'affiliator';
  status: 'approved' | 'pending';
  createdAt: Date;
}

let client: MongoClient;
let productsCollection: Collection<Product>;
let affiliateLinksCollection: Collection<AffiliateLink>;
let usersCollection: Collection<User>;

async function init() {
  if (client && client.isConnected()) {
    return;
  }
  try {
    client = await clientPromise;
    const db = client.db('affiliate_hub'); // Assuming database name is 'affiliate_hub'
    productsCollection = db.collection<Product>('products');
    affiliateLinksCollection = db.collection<AffiliateLink>('affiliateLinks');
    usersCollection = db.collection<User>('users');
  } catch (error) {
    console.error('Failed to connect to DB or get collections:', error);
    throw new Error('Database initialization failed');
  }
}

export async function getProducts(): Promise<Product[]> {
  await init();
  return productsCollection.find({}).toArray();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await init();
  return productsCollection.findOne({ slug });
}

export async function getAffiliateLinks(): Promise<AffiliateLink[]> {
  await init();
  return affiliateLinksCollection.find({}).toArray();
}

export async function getAffiliateLinkByCode(code: string): Promise<AffiliateLink | null> {
  await init();
  return affiliateLinksCollection.findOne({ code });
}

export async function getUsers(): Promise<User[]> {
  await init();
  return usersCollection.find({}).toArray();
}

export async function getUserById(id: string): Promise<User | null> {
  await init();
  return usersCollection.findOne({ id });
}
