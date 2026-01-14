import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';
import { getProductBySlug, getUserByReferralCode, getAffiliateLinkByAffiliatorProduct } from '@/services/dataService';

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params, searchParams }: { 
  params: { productSlug: string }; 
  searchParams: { ref?: string } 
}): Promise<Metadata> {
  try {
    const refCode = searchParams.ref;
    
    if (!refCode) {
      return {
        title: 'Checkout - Affiliate PE Skinpro',
        description: 'Selesaikan pesanan produk Anda',
      };
    }

    // 1. Find the affiliator by their referral code
    const affiliator = await getUserByReferralCode(refCode);
    
    if (!affiliator || affiliator.status !== 'approved') {
      return {
        title: 'Checkout - Affiliate PE Skinpro',
        description: 'Selesaikan pesanan produk Anda',
      };
    }

    // 2. Find the product by its slug
    const product = await getProductBySlug(params.productSlug);
    
    if (!product) {
      return {
        title: 'Checkout - Affiliate PE Skinpro',
        description: 'Selesaikan pesanan produk Anda',
      };
    }

    // 3. Check if affiliate link exists
    const affiliateLink = await getAffiliateLinkByAffiliatorProduct(affiliator.id, product.id);
    
    if (!affiliateLink || !affiliateLink.isActive) {
      return {
        title: 'Checkout - Affiliate PE Skinpro',
        description: 'Selesaikan pesanan produk Anda',
      };
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const imageUrl = product.imageUrl;

    return {
      title: `Beli ${product.name} - ${affiliator.name} | Affiliate PE Skinpro`,
      description: `Beli ${product.name} melalui ${affiliator.name}. ${product.description?.substring(0, 160)}...`,
      keywords: [product.name, 'affiliate', 'PE Skinpro', 'skincare', affiliator.name],
      authors: [{ name: affiliator.name }],
      openGraph: {
        title: `Beli ${product.name} - ${affiliator.name}`,
        description: `${product.description?.substring(0, 160)}...`,
        images: imageUrl ? [
          {
            url: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ] : [],
        type: 'website',
        url: `${baseUrl}/checkout/${params.productSlug}?ref=${refCode}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Beli ${product.name} - ${affiliator.name}`,
        description: `${product.description?.substring(0, 160)}...`,
        images: imageUrl ? [imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Checkout - Affiliate PE Skinpro',
      description: 'Selesaikan pesanan produk Anda',
    };
  }
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}