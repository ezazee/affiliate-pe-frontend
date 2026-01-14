export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

/* ===========================
   STATIC PRODUCT MAP (OG SAFE)
=========================== */

const PRODUCT_MAP: Record<
  string,
  {
    name: string;
    description: string;
    price: number;
    image: string;
  }
> = {
  'honey-cleansing-gel': {
    name: 'Honey Cleansing Gel',
    description:
      'Facial cleanser berbahan madu untuk membersihkan wajah dengan lembut tanpa membuat kulit kering.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/HONEY-CLEANSING-GEL.jpg',
  },
  'hydro-restorative-cream': {
    name: 'Hydro Restorative Cream',
    description:
      'Moisturizer untuk membantu memperbaiki skin barrier dan menjaga hidrasi kulit.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_HYDRO-RESTORATIVE-CREAM.jpg',
  },
};

/* ===========================
   Utils
=========================== */

const getBaseUrl = () =>
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000');

/* ===========================
   Metadata (NO DB, NO CACHE)
=========================== */

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { productSlug: string };
  searchParams: { ref?: string };
}): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const product = PRODUCT_MAP[params.productSlug];

  // ❌ TANPA REF = INVALID (RULE KAMU)
  if (!searchParams.ref || !product) {
    return {
      title: 'Link Checkout Tidak Valid',
      description: 'Link checkout tidak valid atau tidak lengkap.',
      openGraph: {
        title: 'Link Checkout Tidak Valid',
        description: 'Link checkout tidak valid atau tidak lengkap.',
        images: [
          {
            url: `${baseUrl}/Logo.png`,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }

  // ✅ DENGAN REF = OG PRODUK
  const title = `${product.name} - Checkout Resmi PE Skinpro`;
  const description = `Beli ${product.name} hanya Rp ${product.price.toLocaleString(
    'id-ID'
  )}. ${product.description} ✨ Original PE Skinpro`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/checkout/${params.productSlug}?ref=${searchParams.ref}`,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
  };
}

/* ===========================
   Page
=========================== */

export default function CheckoutPage() {
  return <CheckoutClient />;
}
