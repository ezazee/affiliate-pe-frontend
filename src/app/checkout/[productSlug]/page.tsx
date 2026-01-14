import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';
import {
  getUserByReferralCode,
  getAffiliateLinkByAffiliatorProduct,
  getProductBySlug,
} from '@/services/dataService';

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
  'cica-b5-refreshing-toner': {
    name: 'CICA-B5 Refreshing Toner',
    description:
      'Toner dengan CICA dan Vitamin B5 untuk menenangkan kulit, menjaga kelembapan, dan memperkuat skin barrier.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/CICA-B5-REFRESHING.jpg',
  },
  'vit-c-tone-up-daycream-spf-50': {
    name: 'Vit C Tone-Up Daycream SPF 50',
    description:
      'Day cream dengan Vitamin C dan SPF 50 untuk mencerahkan kulit sekaligus melindungi dari sinar UV.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_VIT-C-TONE-UP--DAY-CREAM-SPF50.jpg',
  },
  'honey-cleansing-gel': {
    name: 'Honey Cleansing Gel',
    description:
      'Facial cleanser berbahan madu untuk membersihkan wajah dengan lembut tanpa membuat kulit kering.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/HONEY-CLEANSING-GEL.jpg',
  },
  'pe-prebiotic-pore-ex-facial-pad': {
    name: 'PE Prebiotic Pore-EX Facial Pad',
    description:
      'Facial pad dengan prebiotic untuk membantu membersihkan pori dan menjaga keseimbangan mikrobioma kulit.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_PREBIOTIC-PORE-EX.jpg',
  },
  'hydro-restorative-cream': {
    name: 'Hydro Restorative Cream',
    description:
      'Moisturizer untuk membantu memperbaiki skin barrier dan menjaga hidrasi kulit sepanjang hari.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_HYDRO-RESTORATIVE-CREAM.jpg',
  },
  'skin-awakening-glow-serum': {
    name: 'Skin Awakening Glow Serum',
    description:
      'Serum pencerah yang membantu membuat kulit tampak lebih glowing dan sehat.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_SKIN-AWAKENING-GLOW-SERUM.jpg',
  },
  'intimate-feminine-mousse-cleanser': {
    name: 'Intimate Feminine Mousse Cleanser',
    description:
      'Pembersih area kewanitaan berbentuk mousse dengan formula lembut untuk penggunaan harian.',
    price: 144000,
    image:
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_PREBIOTIC-FEMININE-MOUSSE-CLEANSER.jpg',
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
   Metadata
=========================== */

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { productSlug: string };
  searchParams: { ref?: string };
}): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const refCode = searchParams.ref;

  const productOG = PRODUCT_MAP[params.productSlug];

  /* ===========================
     RULE KAMU: TANPA REF = INVALID
  =========================== */
  if (!refCode || !productOG) {
    return {
      title: 'Link Checkout Tidak Valid',
      description: 'Link checkout tidak valid atau sudah kedaluwarsa.',
      openGraph: {
        title: 'Link Checkout Tidak Valid',
        description: 'Link checkout tidak valid atau sudah kedaluwarsa.',
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

  /* ===========================
     VALIDASI AFFILIATOR
  =========================== */
  const affiliator = await getUserByReferralCode(refCode);
  if (!affiliator) {
    return {
      title: 'Link Checkout Tidak Valid',
      description: 'Link checkout tidak valid.',
    };
  }

  /* ===========================
     🔥 FIX UTAMA: AMBIL PRODUCT ID
  =========================== */
  const productFromDb = await getProductBySlug(params.productSlug);
  if (!productFromDb) {
    return {
      title: 'Link Checkout Tidak Valid',
      description: 'Produk tidak ditemukan.',
    };
  }

  const affiliateLink = await getAffiliateLinkByAffiliatorProduct(
    affiliator.id,
    productFromDb.id
  );

  if (!affiliateLink || !affiliateLink.isActive) {
    return {
      title: 'Link Checkout Tidak Valid',
      description: 'Link checkout tidak aktif.',
    };
  }

  /* ===========================
     VALID METADATA
  =========================== */

  const title = `${productOG.name} - Rekomendasi ${affiliator.name}`;
  const description = `Beli ${productOG.name} hanya Rp ${productOG.price.toLocaleString(
    'id-ID'
  )}. ${productOG.description} ✨ Original PE Skinpro`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/checkout/${params.productSlug}?ref=${refCode}`,
      images: [
        {
          url: productOG.image,
          width: 1200,
          height: 630,
          alt: productOG.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [productOG.image],
    },
  };
}

/* ===========================
   Page
=========================== */

export default function CheckoutPage() {
  return <CheckoutClient />;
}
