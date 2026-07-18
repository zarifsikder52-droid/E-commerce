import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop', children: [
    { name: 'Smartphones', slug: 'smartphones', description: 'Latest smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
    { name: 'Laptops', slug: 'laptops', description: 'Gaming and work laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
    { name: 'Headphones', slug: 'headphones', description: 'Wireless and wired headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
    { name: 'Cameras', slug: 'cameras', description: 'DSLR and mirrorless cameras', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop' },
    { name: 'Wearables', slug: 'wearables', description: 'Smartwatches and fitness trackers', image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=400&fit=crop' },
  ]},
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', children: [
    { name: "Men's Clothing", slug: 'mens-clothing', description: "Men's fashion", image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=400&fit=crop' },
    { name: "Women's Clothing", slug: 'womens-clothing', description: "Women's fashion", image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop' },
    { name: 'Shoes', slug: 'shoes', description: 'Sneakers, boots and more', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { name: 'Accessories', slug: 'accessories', description: 'Bags, watches, jewelry', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
  ]},
  { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor and more', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', children: [
    { name: 'Furniture', slug: 'furniture', description: 'Modern furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
    { name: 'Kitchen', slug: 'kitchen', description: 'Kitchen essentials', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Decor', slug: 'decor', description: 'Home decoration', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
  ]},
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400&h=400&fit=crop', children: [
    { name: 'Exercise Equipment', slug: 'exercise-equipment', description: 'Gym and fitness equipment', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop' },
    { name: 'Outdoor Gear', slug: 'outdoor-gear', description: 'Camping and hiking gear', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=400&fit=crop' },
  ]},
  { name: 'Beauty & Health', slug: 'beauty-health', description: 'Skincare, makeup and wellness', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', children: [
    { name: 'Skincare', slug: 'skincare', description: 'Face and body care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop' },
    { name: 'Makeup', slug: 'makeup', description: 'Cosmetics and beauty tools', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop' },
  ]},
  { name: 'Books & Stationery', slug: 'books-stationery', description: 'Books, notebooks and office supplies', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop', children: [] },
];

const BRANDS = [
  { name: 'TechNova', slug: 'technova', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop', description: 'Premium technology brand' },
  { name: 'StyleCraft', slug: 'stylecraft', logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', description: 'Fashion and lifestyle brand' },
  { name: 'HomeBliss', slug: 'homebliss', logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop', description: 'Home and living essentials' },
  { name: 'FitPro', slug: 'fitpro', logo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop', description: 'Sports and fitness equipment' },
  { name: 'GlowUp', slug: 'glowup', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop', description: 'Beauty and wellness products' },
  { name: 'AudioMax', slug: 'audiomax', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', description: 'Premium audio equipment' },
  { name: 'VisionPro', slug: 'visionpro', logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop', description: 'Professional camera equipment' },
  { name: 'QuickReads', slug: 'quickreads', logo: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop', description: 'Books and stationery' },
];

interface ProductSeed {
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  categoryId: string; // will be set dynamically
  brandId: string; // will be set dynamically
  price: number;
  discountPrice?: number;
  stock: number;
  images: { url: string; alt: string }[];
  variants: { name: string; value: string; price?: number; stock: number }[];
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags?: string;
}

const PRODUCTS: Omit<ProductSeed, 'categoryId' | 'brandId'>[] = [
  // Smartphones
  {
    name: 'TechNova X1 Pro Max',
    slug: 'technova-x1-pro-max',
    shortDesc: '6.7" AMOLED, 200MP Camera, A18 Chip',
    description: 'Experience the pinnacle of mobile technology with the TechNova X1 Pro Max. Featuring a stunning 6.7-inch Super AMOLED display with 120Hz refresh rate, a revolutionary 200MP camera system, and the most powerful mobile processor ever created. With 512GB storage, 12GB RAM, and all-day battery life, this phone redefines what a smartphone can do.',
    price: 129999,
    discountPrice: 109999,
    stock: 45,
    images: [
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop', alt: 'TechNova X1 Pro Max Front' },
      { url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop', alt: 'TechNova X1 Pro Max Back' },
      { url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&h=600&fit=crop', alt: 'TechNova X1 Pro Max Side' },
    ],
    variants: [
      { name: 'Color', value: 'Midnight Black', stock: 20 },
      { name: 'Color', value: 'Ocean Blue', stock: 15 },
      { name: 'Color', value: 'Sunset Gold', stock: 10 },
      { name: 'Storage', value: '256GB', price: 99999, stock: 30 },
      { name: 'Storage', value: '512GB', price: 109999, stock: 15 },
    ],
    isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: false,
    rating: 4.8, reviewCount: 2341, soldCount: 8920,
    tags: 'smartphone, 5g, camera, flagship'
  },
  {
    name: 'TechNova S24 Ultra',
    slug: 'technova-s24-ultra',
    shortDesc: 'Galaxy AI, 50MP, S Pen Included',
    description: 'The TechNova S24 Ultra brings Galaxy AI to the forefront of mobile computing. With its 6.8-inch Dynamic AMOLED display, built-in S Pen, and intelligent AI features, it is the ultimate productivity and creativity tool.',
    price: 149999,
    discountPrice: 134999,
    stock: 32,
    images: [
      { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop', alt: 'TechNova S24 Ultra' },
      { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop', alt: 'TechNova S24 Ultra Side' },
    ],
    variants: [
      { name: 'Color', value: 'Titanium Gray', stock: 12 },
      { name: 'Color', value: 'Titanium Black', stock: 10 },
      { name: 'Color', value: 'Titanium Violet', stock: 10 },
    ],
    isFeatured: true, isTrending: true, isBestSeller: false, isNewArrival: true,
    rating: 4.7, reviewCount: 1876, soldCount: 5640,
    tags: 'smartphone, galaxy, ai, s-pen'
  },
  // Laptops
  {
    name: 'TechNova ProBook 16',
    slug: 'technova-probook-16',
    shortDesc: 'M3 Pro, 18GB RAM, 512GB SSD',
    description: 'Designed for professionals who demand the best. The ProBook 16 features the revolutionary M3 Pro chip with 12-core CPU and 18-core GPU, a stunning 16.2-inch Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for video editing, 3D rendering, and software development.',
    price: 249999,
    discountPrice: 219999,
    stock: 18,
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop', alt: 'TechNova ProBook 16' },
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', alt: 'TechNova ProBook Open' },
      { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop', alt: 'TechNova ProBook Keyboard' },
    ],
    variants: [
      { name: 'Storage', value: '512GB SSD', price: 219999, stock: 10 },
      { name: 'Storage', value: '1TB SSD', price: 249999, stock: 8 },
    ],
    isFeatured: true, isTrending: false, isBestSeller: true, isNewArrival: false,
    rating: 4.9, reviewCount: 1234, soldCount: 3450,
    tags: 'laptop, macbook, professional, m3'
  },
  {
    name: 'TechNova Gaming X15',
    slug: 'technova-gaming-x15',
    shortDesc: 'i9-14900H, RTX 4070, 240Hz Display',
    description: 'Dominate every game with the Gaming X15. Equipped with Intel i9-14900H processor, NVIDIA RTX 4070 GPU, 32GB DDR5 RAM, and a blazing 240Hz QHD display. Advanced cooling system keeps temperatures low during intense gaming sessions.',
    price: 199999,
    discountPrice: 179999,
    stock: 12,
    images: [
      { url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&h=600&fit=crop', alt: 'TechNova Gaming X15' },
      { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop', alt: 'TechNova Gaming Keyboard' },
    ],
    variants: [
      { name: 'RAM', value: '16GB', price: 159999, stock: 5 },
      { name: 'RAM', value: '32GB', price: 179999, stock: 7 },
    ],
    isFeatured: false, isTrending: true, isBestSeller: true, isNewArrival: false,
    rating: 4.6, reviewCount: 876, soldCount: 2100,
    tags: 'laptop, gaming, rtx, intel'
  },
  // Headphones
  {
    name: 'AudioMax Pro ANC 700',
    slug: 'audiomax-pro-anc-700',
    shortDesc: 'Active Noise Cancellation, 40hr Battery',
    description: 'Immerse yourself in pure sound with the AudioMax Pro ANC 700. Industry-leading Active Noise Cancellation, 40-hour battery life, and premium 40mm drivers deliver studio-quality audio. Lightweight and comfortable for all-day wear.',
    price: 29999,
    discountPrice: 24999,
    stock: 78,
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', alt: 'AudioMax Pro ANC 700' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop', alt: 'AudioMax Pro Side' },
    ],
    variants: [
      { name: 'Color', value: 'Matte Black', stock: 30 },
      { name: 'Color', value: 'Silver', stock: 28 },
      { name: 'Color', value: 'Midnight Blue', stock: 20 },
    ],
    isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: false,
    rating: 4.7, reviewCount: 3456, soldCount: 12800,
    tags: 'headphones, anc, wireless, bluetooth'
  },
  {
    name: 'AudioMax Sport Buds',
    slug: 'audiomax-sport-buds',
    shortDesc: 'IP67 Waterproof, 8hr Battery',
    description: 'Perfect for workouts and active lifestyles. These truly wireless earbuds feature IP67 water and sweat resistance, secure fit with ear hooks, 8-hour battery life, and powerful bass for motivation.',
    price: 8999,
    discountPrice: 6999,
    stock: 150,
    images: [
      { url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop', alt: 'AudioMax Sport Buds' },
    ],
    variants: [
      { name: 'Color', value: 'Black', stock: 50 },
      { name: 'Color', value: 'White', stock: 50 },
      { name: 'Color', value: 'Neon Green', stock: 50 },
    ],
    isFeatured: false, isTrending: true, isBestSeller: false, isNewArrival: true,
    rating: 4.4, reviewCount: 2134, soldCount: 15600,
    tags: 'earbuds, wireless, sport, waterproof'
  },
  // Cameras
  {
    name: 'VisionPro Alpha A7 IV',
    slug: 'visionpro-alpha-a7-iv',
    shortDesc: '33MP Full-Frame, 4K 60fps Video',
    description: 'The professional camera for creators. 33-megapixel full-frame sensor, advanced AI autofocus with 759 phase-detection points, 4K 60fps video recording, and 5-axis in-body stabilization. Weather-sealed magnesium alloy body.',
    price: 329999,
    discountPrice: 299999,
    stock: 8,
    images: [
      { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop', alt: 'VisionPro Alpha A7 IV' },
      { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop', alt: 'VisionPro Alpha with Lens' },
    ],
    variants: [
      { name: 'Kit', value: 'Body Only', price: 299999, stock: 4 },
      { name: 'Kit', value: 'With 24-70mm f/2.8', price: 389999, stock: 4 },
    ],
    isFeatured: true, isTrending: false, isBestSeller: false, isNewArrival: true,
    rating: 4.9, reviewCount: 567, soldCount: 890,
    tags: 'camera, full-frame, mirrorless, 4k'
  },
  // Wearables
  {
    name: 'TechNova Watch Ultra 2',
    slug: 'technova-watch-ultra-2',
    shortDesc: '49mm Titanium, GPS, 36hr Battery',
    description: 'The most rugged and capable smartwatch ever. 49mm titanium case, precision dual-frequency GPS, up to 36 hours of battery life, 100m water resistance, and advanced health monitoring including ECG, SpO2, and temperature sensing.',
    price: 79999,
    discountPrice: 72999,
    stock: 25,
    images: [
      { url: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=600&fit=crop', alt: 'TechNova Watch Ultra 2' },
      { url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop', alt: 'TechNova Watch on Wrist' },
    ],
    variants: [
      { name: 'Size', value: '49mm', stock: 15 },
      { name: 'Band', value: 'Alpine Loop', stock: 10 },
      { name: 'Band', value: 'Ocean Band', stock: 10 },
    ],
    isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: false,
    rating: 4.8, reviewCount: 1890, soldCount: 5670,
    tags: 'smartwatch, fitness, gps, health'
  },
  // Fashion - Men's
  {
    name: 'StyleCraft Premium Cotton T-Shirt',
    slug: 'stylecraft-premium-cotton-tshirt',
    shortDesc: '100% Organic Cotton, Relaxed Fit',
    description: 'Premium quality organic cotton t-shirt with a relaxed fit. Pre-shrunk fabric, reinforced stitching, and a modern silhouette. Available in multiple colors. Perfect for everyday wear.',
    price: 2499,
    discountPrice: 1799,
    stock: 500,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', alt: 'StyleCraft T-Shirt White' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop', alt: 'StyleCraft T-Shirt Black' },
    ],
    variants: [
      { name: 'Size', value: 'S', stock: 100 },
      { name: 'Size', value: 'M', stock: 150 },
      { name: 'Size', value: 'L', stock: 150 },
      { name: 'Size', value: 'XL', stock: 100 },
      { name: 'Color', value: 'White', stock: 150 },
      { name: 'Color', value: 'Black', stock: 150 },
      { name: 'Color', value: 'Navy', stock: 100 },
    ],
    isFeatured: false, isTrending: false, isBestSeller: true, isNewArrival: false,
    rating: 4.5, reviewCount: 5678, soldCount: 45600,
    tags: 'tshirt, cotton, organic, casual'
  },
  {
    name: 'StyleCraft Slim Fit Denim Jacket',
    slug: 'stylecraft-slim-fit-denim-jacket',
    shortDesc: 'Premium Denim, Classic Wash',
    description: 'Timeless denim jacket with a modern slim fit. Made from premium heavyweight denim with a classic indigo wash. Features copper button closures, dual chest pockets, and adjustable waist tabs.',
    price: 5999,
    discountPrice: 4499,
    stock: 85,
    images: [
      { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop', alt: 'StyleCraft Denim Jacket' },
    ],
    variants: [
      { name: 'Size', value: 'S', stock: 15 },
      { name: 'Size', value: 'M', stock: 25 },
      { name: 'Size', value: 'L', stock: 25 },
      { name: 'Size', value: 'XL', stock: 20 },
    ],
    isFeatured: false, isTrending: true, isBestSeller: false, isNewArrival: true,
    rating: 4.6, reviewCount: 1234, soldCount: 8900,
    tags: 'jacket, denim, mens, fashion'
  },
  // Fashion - Women's
  {
    name: 'StyleCraft Elegant Maxi Dress',
    slug: 'stylecraft-elegant-maxi-dress',
    shortDesc: 'Floral Print, Flowy Silhouette',
    description: 'Stunning floral print maxi dress perfect for any occasion. Features a flattering V-neckline, adjustable waist tie, and a flowing silhouette. Made from lightweight, breathable fabric.',
    price: 4999,
    discountPrice: 3499,
    stock: 120,
    images: [
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop', alt: 'StyleCraft Maxi Dress' },
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop', alt: 'StyleCraft Maxi Dress Detail' },
    ],
    variants: [
      { name: 'Size', value: 'S', stock: 25 },
      { name: 'Size', value: 'M', stock: 35 },
      { name: 'Size', value: 'L', stock: 35 },
      { name: 'Size', value: 'XL', stock: 25 },
    ],
    isFeatured: true, isTrending: true, isBestSeller: false, isNewArrival: true,
    rating: 4.7, reviewCount: 890, soldCount: 6700,
    tags: 'dress, maxi, floral, womens'
  },
  // Shoes
  {
    name: 'StyleCraft Air Runner Pro',
    slug: 'stylecraft-air-runner-pro',
    shortDesc: 'Lightweight, Responsive Cushioning',
    description: 'Engineered for performance and comfort. Features responsive foam cushioning, breathable knit upper, and a durable rubber outsole. Weighs only 250g for effortless running.',
    price: 8999,
    discountPrice: 6999,
    stock: 200,
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', alt: 'StyleCraft Air Runner Pro' },
      { url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop', alt: 'StyleCraft Air Runner Side' },
    ],
    variants: [
      { name: 'Size', value: '7', stock: 20 },
      { name: 'Size', value: '8', stock: 30 },
      { name: 'Size', value: '9', stock: 40 },
      { name: 'Size', value: '10', stock: 40 },
      { name: 'Size', value: '11', stock: 30 },
      { name: 'Size', value: '12', stock: 20 },
      { name: 'Color', value: 'Red', stock: 60 },
      { name: 'Color', value: 'Black', stock: 70 },
      { name: 'Color', value: 'White', stock: 70 },
    ],
    isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: false,
    rating: 4.6, reviewCount: 3456, soldCount: 23400,
    tags: 'shoes, running, sneakers, athletic'
  },
  // Home - Furniture
  {
    name: 'HomeBliss Scandinavian Sofa Set',
    slug: 'homebliss-scandinavian-sofa-set',
    shortDesc: '3+2 Seater, Premium Fabric',
    description: 'Elevate your living room with this elegant Scandinavian-designed sofa set. Includes a 3-seater and 2-seater sofa. Features premium high-density foam cushions, solid wood frame, and stain-resistant fabric.',
    price: 89999,
    discountPrice: 74999,
    stock: 10,
    images: [
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', alt: 'HomeBliss Sofa Set' },
      { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop', alt: 'HomeBliss Sofa Detail' },
    ],
    variants: [
      { name: 'Color', value: 'Gray', stock: 4 },
      { name: 'Color', value: 'Beige', stock: 3 },
      { name: 'Color', value: 'Navy', stock: 3 },
    ],
    isFeatured: true, isTrending: false, isBestSeller: false, isNewArrival: false,
    rating: 4.8, reviewCount: 345, soldCount: 560,
    tags: 'sofa, furniture, scandinavian, living room'
  },
  // Home - Kitchen
  {
    name: 'HomeBliss Smart Coffee Maker',
    slug: 'homebliss-smart-coffee-maker',
    shortDesc: 'WiFi Enabled, 12-Cup, Built-in Grinder',
    description: 'Wake up to perfect coffee every morning. WiFi-enabled for scheduling from your phone, built-in conical burr grinder, 12-cup capacity, and customizable brew strength. Compatible with Alexa and Google Home.',
    price: 19999,
    discountPrice: 15999,
    stock: 65,
    images: [
      { url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop', alt: 'HomeBliss Smart Coffee Maker' },
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop', alt: 'HomeBliss Coffee' },
    ],
    variants: [
      { name: 'Color', value: 'Stainless Steel', stock: 30 },
      { name: 'Color', value: 'Matte Black', stock: 35 },
    ],
    isFeatured: false, isTrending: true, isBestSeller: true, isNewArrival: false,
    rating: 4.5, reviewCount: 2345, soldCount: 8900,
    tags: 'coffee, kitchen, smart home, appliance'
  },
  // Sports
  {
    name: 'FitPro Adjustable Dumbbell Set',
    slug: 'fitpro-adjustable-dumbbell-set',
    shortDesc: '5-52.5 lbs, Quick-Change System',
    description: 'Replace 15 sets of weights with one compact dumbbell. Quick-change dial system adjusts from 5 to 52.5 lbs in 2.5-lb increments. Durable steel construction with anti-slip grip.',
    price: 29999,
    discountPrice: 24999,
    stock: 35,
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop', alt: 'FitPro Dumbbell Set' },
    ],
    variants: [
      { name: 'Weight', value: '5-25 lbs', price: 15999, stock: 20 },
      { name: 'Weight', value: '5-52.5 lbs', price: 24999, stock: 15 },
    ],
    isFeatured: false, isTrending: false, isBestSeller: true, isNewArrival: false,
    rating: 4.7, reviewCount: 1567, soldCount: 4560,
    tags: 'dumbbell, fitness, weight, home gym'
  },
  {
    name: 'FitPro Yoga Mat Premium',
    slug: 'fitpro-yoga-mat-premium',
    shortDesc: '6mm Thick, Non-Slip, Eco-Friendly',
    description: 'Premium yoga mat made from natural tree rubber. 6mm thickness provides excellent joint cushioning. Non-slip surface on both sides, alignment markings, and carrying strap included.',
    price: 3999,
    discountPrice: 2999,
    stock: 200,
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop', alt: 'FitPro Yoga Mat' },
    ],
    variants: [
      { name: 'Color', value: 'Purple', stock: 50 },
      { name: 'Color', value: 'Teal', stock: 50 },
      { name: 'Color', value: 'Black', stock: 50 },
      { name: 'Color', value: 'Pink', stock: 50 },
    ],
    isFeatured: false, isTrending: true, isBestSeller: false, isNewArrival: true,
    rating: 4.6, reviewCount: 2890, soldCount: 18900,
    tags: 'yoga, mat, fitness, exercise'
  },
  // Beauty
  {
    name: 'GlowUp Vitamin C Serum',
    slug: 'glowup-vitamin-c-serum',
    shortDesc: '20% Vitamin C, Hyaluronic Acid',
    description: 'Brighten and rejuvenate your skin with our potent Vitamin C serum. 20% L-Ascorbic Acid combined with Hyaluronic Acid, Vitamin E, and Ferulic Acid for maximum antioxidant protection and collagen production.',
    price: 2499,
    discountPrice: 1999,
    stock: 300,
    images: [
      { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop', alt: 'GlowUp Vitamin C Serum' },
      { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop', alt: 'GlowUp Serum Application' },
    ],
    variants: [
      { name: 'Size', value: '30ml', price: 1999, stock: 150 },
      { name: 'Size', value: '60ml', price: 3499, stock: 150 },
    ],
    isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: false,
    rating: 4.8, reviewCount: 5678, soldCount: 45600,
    tags: 'serum, skincare, vitamin c, anti-aging'
  },
  {
    name: 'GlowUp Matte Lipstick Set',
    slug: 'glowup-matte-lipstick-set',
    shortDesc: '6 Colors, Long-Lasting, Vegan',
    description: 'Set of 6 stunning matte lipsticks in versatile shades. Long-lasting 12-hour formula, vegan and cruelty-free. Enriched with vitamin E and shea butter for comfortable all-day wear.',
    price: 3999,
    discountPrice: 2999,
    stock: 180,
    images: [
      { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop', alt: 'GlowUp Lipstick Set' },
    ],
    variants: [
      { name: 'Set', value: 'Nude Collection', stock: 60 },
      { name: 'Set', value: 'Bold Collection', stock: 60 },
      { name: 'Set', value: 'Complete Set (6 colors)', stock: 60 },
    ],
    isFeatured: false, isTrending: true, isBestSeller: false, isNewArrival: true,
    rating: 4.5, reviewCount: 3456, soldCount: 21300,
    tags: 'lipstick, makeup, matte, vegan'
  },
  // Books
  {
    name: 'The Art of Modern Programming',
    slug: 'the-art-of-modern-programming',
    shortDesc: 'Complete Guide to Software Development',
    description: 'A comprehensive guide covering modern programming paradigms, algorithms, data structures, and software architecture. Written by industry experts with real-world examples and practical exercises.',
    price: 1599,
    discountPrice: 1199,
    stock: 450,
    images: [
      { url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop', alt: 'The Art of Modern Programming' },
    ],
    variants: [
      { name: 'Format', value: 'Paperback', price: 1199, stock: 250 },
      { name: 'Format', value: 'Hardcover', price: 1899, stock: 150 },
      { name: 'Format', value: 'E-book', price: 799, stock: 50 },
    ],
    isFeatured: false, isTrending: false, isBestSeller: true, isNewArrival: false,
    rating: 4.9, reviewCount: 4567, soldCount: 34500,
    tags: 'book, programming, software, technology'
  },
  // Accessories
  {
    name: 'StyleCraft Leather Crossbody Bag',
    slug: 'stylecraft-leather-crossbody-bag',
    shortDesc: 'Genuine Leather, Multiple Compartments',
    description: 'Elegant crossbody bag crafted from genuine Italian leather. Features multiple compartments, adjustable strap, RFID-blocking pocket, and premium gold-tone hardware.',
    price: 7999,
    discountPrice: 5999,
    stock: 65,
    images: [
      { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', alt: 'StyleCraft Leather Bag' },
      { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop', alt: 'StyleCraft Bag Interior' },
    ],
    variants: [
      { name: 'Color', value: 'Tan', stock: 25 },
      { name: 'Color', value: 'Black', stock: 20 },
      { name: 'Color', value: 'Burgundy', stock: 20 },
    ],
    isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: true,
    rating: 4.7, reviewCount: 678, soldCount: 3400,
    tags: 'bag, leather, accessories, crossbody'
  },
  // Outdoor
  {
    name: 'FitPro Ultra Light Tent 4P',
    slug: 'fitpro-ultra-light-tent-4p',
    shortDesc: '4-Person, 3-Season, Waterproof',
    description: 'Ultra-light 4-person tent perfect for camping adventures. 3-season rated with 3000mm waterproof rating. Quick setup in under 5 minutes, includes footprint and gear loft.',
    price: 19999,
    discountPrice: 15999,
    stock: 28,
    images: [
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop', alt: 'FitPro Tent' },
      { url: 'https://images.unsplash.com/photo-1478131143263-27a1afd38a4f?w=600&h=600&fit=crop', alt: 'FitPro Tent Camping' },
    ],
    variants: [
      { name: 'Size', value: '2-Person', price: 11999, stock: 15 },
      { name: 'Size', value: '4-Person', price: 15999, stock: 13 },
    ],
    isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: true,
    rating: 4.6, reviewCount: 456, soldCount: 1800,
    tags: 'tent, camping, outdoor, waterproof'
  },
  // Decor
  {
    name: 'HomeBliss Ceramic Plant Pot Set',
    slug: 'homebliss-ceramic-plant-pot-set',
    shortDesc: 'Set of 3, Minimalist Design, Drainage',
    description: 'Set of 3 minimalist ceramic plant pots in different sizes. Features drainage holes with matching saucers. Available in matte finish with a clean, modern aesthetic.',
    price: 3999,
    discountPrice: 2999,
    stock: 95,
    images: [
      { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop', alt: 'HomeBliss Plant Pots' },
    ],
    variants: [
      { name: 'Color', value: 'White', stock: 35 },
      { name: 'Color', value: 'Terracotta', stock: 30 },
      { name: 'Color', value: 'Charcoal', stock: 30 },
    ],
    isFeatured: false, isTrending: true, isBestSeller: false, isNewArrival: false,
    rating: 4.4, reviewCount: 1234, soldCount: 7890,
    tags: 'plant pot, decor, ceramic, home'
  },
  // More Electronics
  {
    name: 'TechNova 27" 4K Monitor',
    slug: 'technova-27-4k-monitor',
    shortDesc: 'IPS Panel, 165Hz, USB-C Hub',
    description: 'Professional-grade 27-inch 4K UHD monitor with IPS panel, 165Hz refresh rate, 1ms response time, and built-in USB-C hub. Factory calibrated with Delta E < 2 for accurate color reproduction.',
    price: 59999,
    discountPrice: 49999,
    stock: 22,
    images: [
      { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop', alt: 'TechNova 4K Monitor' },
      { url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&h=600&fit=crop', alt: 'TechNova Monitor Setup' },
    ],
    variants: [
      { name: 'Size', value: '24"', price: 34999, stock: 10 },
      { name: 'Size', value: '27"', price: 49999, stock: 12 },
    ],
    isFeatured: true, isTrending: false, isBestSeller: false, isNewArrival: true,
    rating: 4.7, reviewCount: 890, soldCount: 2340,
    tags: 'monitor, 4k, display, usb-c'
  },
  {
    name: 'TechNova Wireless Charging Pad',
    slug: 'technova-wireless-charging-pad',
    shortDesc: '15W Fast Charge, Qi Compatible',
    description: 'Sleek wireless charging pad with 15W fast charging support. Compatible with all Qi-enabled devices. Features LED indicator, anti-slip surface, and overheat protection.',
    price: 2999,
    discountPrice: 1999,
    stock: 350,
    images: [
      { url: 'https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=600&h=600&fit=crop', alt: 'TechNova Wireless Charger' },
    ],
    variants: [
      { name: 'Color', value: 'Black', stock: 150 },
      { name: 'Color', value: 'White', stock: 200 },
    ],
    isFeatured: false, isTrending: false, isBestSeller: true, isNewArrival: false,
    rating: 4.3, reviewCount: 4567, soldCount: 34500,
    tags: 'charger, wireless, qi, fast charge'
  },
];

const COUPONS = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minPurchase: 2000, maxDiscount: 5000, usageLimit: 1000, startDate: '2024-01-01', endDate: '2025-12-31' },
  { code: 'FLAT500', type: 'fixed', value: 500, minPurchase: 5000, usageLimit: 500, startDate: '2024-01-01', endDate: '2025-12-31' },
  { code: 'FLASH20', type: 'percentage', value: 20, minPurchase: 3000, maxDiscount: 8000, usageLimit: 200, startDate: '2024-01-01', endDate: '2025-12-31' },
  { code: 'FREESHIP', type: 'free_shipping', value: 0, minPurchase: 1000, usageLimit: 10000, startDate: '2024-01-01', endDate: '2025-12-31' },
  { code: 'SUMMER15', type: 'percentage', value: 15, minPurchase: 5000, maxDiscount: 10000, usageLimit: 300, startDate: '2024-06-01', endDate: '2025-08-31' },
];

const REVIEWS = [
  { rating: 5, title: 'Excellent product!', comment: 'Exceeded my expectations. Quality is outstanding and delivery was super fast.', productId_suffix: 0, verified: true },
  { rating: 4, title: 'Great value', comment: 'Very good product for the price. Would recommend to friends.', productId_suffix: 0, verified: true },
  { rating: 5, title: 'Best purchase ever', comment: 'I am extremely satisfied with this purchase. The quality is top-notch.', productId_suffix: 1, verified: true },
  { rating: 4, title: 'Good but could be better', comment: 'Overall a solid product. Minor improvements could make it perfect.', productId_suffix: 2, verified: true },
  { rating: 5, title: 'Perfect for daily use', comment: 'Use it every day and it works flawlessly. Highly recommended.', productId_suffix: 4, verified: true },
  { rating: 3, title: 'Decent', comment: 'Average product. Does what it says but nothing extraordinary.', productId_suffix: 5, verified: false },
  { rating: 5, title: 'Absolutely love it!', comment: 'The quality is amazing. Will definitely buy again.', productId_suffix: 8, verified: true },
  { rating: 4, title: 'Comfortable and stylish', comment: 'Great fit and looks amazing. The material is very comfortable.', productId_suffix: 11, verified: true },
  { rating: 5, title: 'Worth every penny', comment: 'Premium quality that justifies the price tag. Very satisfied.', productId_suffix: 15, verified: true },
  { rating: 5, title: 'Game changer', comment: 'This product has completely transformed my daily routine. Amazing!', productId_suffix: 16, verified: true },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create Users
  const adminPassword = await hash('admin123', 12);
  const customerPassword = await hash('customer123', 12);
  const sellerPassword = await hash('seller123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nextshop.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@nextshop.com', password: adminPassword, role: 'admin', isActive: true, emailVerified: true },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@nextshop.com' },
    update: {},
    create: { name: 'John Doe', email: 'customer@nextshop.com', phone: '+8801712345678', password: customerPassword, role: 'customer', isActive: true, emailVerified: true },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@nextshop.com' },
    update: {},
    create: { name: 'Store Owner', email: 'seller@nextshop.com', phone: '+8801798765432', password: sellerPassword, role: 'seller', isActive: true, emailVerified: true },
  });

  console.log('✅ Users created');

  // Create Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        status: 'active',
      },
    });
    categoryMap[cat.slug] = created.id;

    if (cat.children) {
      for (const child of cat.children) {
        const childCreated = await prisma.category.upsert({
          where: { slug: child.slug },
          update: {},
          create: {
            name: child.name,
            slug: child.slug,
            description: child.description,
            image: child.image,
            parentId: created.id,
            status: 'active',
          },
        });
        categoryMap[child.slug] = childCreated.id;
      }
    }
  }

  console.log('✅ Categories created');

  // Create Brands
  const brandMap: Record<string, string> = {};
  for (const brand of BRANDS) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description,
        status: 'active',
      },
    });
    brandMap[brand.slug] = created.id;
  }

  console.log('✅ Brands created');

  // Map products to categories and brands
  const productCategoryMap: Record<number, string> = {
    0: 'smartphones', 1: 'smartphones', 2: 'laptops', 3: 'laptops',
    4: 'headphones', 5: 'headphones', 6: 'cameras', 7: 'wearables',
    8: 'mens-clothing', 9: 'mens-clothing', 10: 'womens-clothing', 11: 'shoes',
    12: 'furniture', 13: 'kitchen', 14: 'exercise-equipment', 15: 'exercise-equipment',
    16: 'skincare', 17: 'makeup', 18: 'books-stationery', 19: 'accessories',
    20: 'outdoor-gear', 21: 'decor', 22: 'cameras', 23: 'wearables',
  };

  const productBrandMap: Record<number, string> = {
    0: 'technova', 1: 'technova', 2: 'technova', 3: 'technova',
    4: 'audiomax', 5: 'audiomax', 6: 'visionpro', 7: 'technova',
    8: 'stylecraft', 9: 'stylecraft', 10: 'stylecraft', 11: 'stylecraft',
    12: 'homebliss', 13: 'homebliss', 14: 'fitpro', 15: 'fitpro',
    16: 'glowup', 17: 'glowup', 18: 'quickreads', 19: 'stylecraft',
    20: 'fitpro', 21: 'homebliss', 22: 'technova', 23: 'technova',
  };

  // Create Products
  const productIds: string[] = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const catSlug = productCategoryMap[i] || 'electronics';
    const brandSlug = productBrandMap[i] || 'technova';
    const categoryId = categoryMap[catSlug];
    const brandId = brandMap[brandSlug];

    if (!categoryId) {
      console.log(`⚠️  Skipping product ${p.name}: category ${catSlug} not found`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        shortDesc: p.shortDesc,
        description: p.description,
        categoryId,
        brandId,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        tags: p.tags,
        status: 'active',
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isBestSeller: p.isBestSeller,
        isNewArrival: p.isNewArrival,
        rating: p.rating,
        reviewCount: p.reviewCount,
        soldCount: p.soldCount,
        warranty: '1 Year Manufacturer Warranty',
        returnPolicy: '7 Days Return Policy',
        shippingInfo: 'Free shipping on orders above ৳2000',
        images: {
          create: p.images.map((img, idx) => ({
            url: img.url,
            alt: img.alt,
            sort_order: idx,
          })),
        },
        variants: {
          create: p.variants.map((v) => ({
            name: v.name,
            value: v.value,
            price: v.price,
            stock: v.stock,
          })),
        },
      },
    });

    productIds.push(product.id);
  }

  console.log('✅ Products created');

  // Create Coupons
  for (const c of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        type: c.type,
        value: c.value,
        minPurchase: c.minPurchase,
        maxDiscount: c.maxDiscount,
        usageLimit: c.usageLimit,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
        status: 'active',
      },
    });
  }

  console.log('✅ Coupons created');

  // Create Reviews
  for (let i = 0; i < REVIEWS.length; i++) {
    const r = REVIEWS[i];
    if (productIds[r.productId_suffix]) {
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: productIds[r.productId_suffix],
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          isVerified: r.verified,
          isApproved: true,
        },
      });
    }
  }

  console.log('✅ Reviews created');

  // Create Analytics data for the past 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    await prisma.analytics.upsert({
      where: { id: `analytics-${dateStr}` },
      update: {},
      create: {
        id: `analytics-${dateStr}`,
        date: dateStr,
        revenue: Math.floor(Math.random() * 500000) + 200000,
        orders: Math.floor(Math.random() * 100) + 30,
        visitors: Math.floor(Math.random() * 5000) + 1000,
        pageViews: Math.floor(Math.random() * 15000) + 5000,
        conversions: Math.floor(Math.random() * 50) + 10,
      },
    });
  }

  console.log('✅ Analytics data created');

  // Create sample orders for the customer
  const orderStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];
  for (let i = 0; i < 5; i++) {
    const productIdx = i * 4;
    if (!productIds[productIdx]) continue;
    const product = await prisma.product.findUnique({ where: { id: productIds[productIdx] }, include: { images: true } });
    if (!product) continue;

    const subtotal = product.discountPrice || product.price;
    const shipping = subtotal > 2000 ? 0 : 150;
    const total = subtotal + shipping;

    await prisma.order.create({
      data: {
        orderNumber: `NS-${String(10000 + i).slice(1)}${Date.now().toString().slice(-4)}`,
        userId: customer.id,
        status: orderStatuses[i],
        subtotal,
        discount: 0,
        shippingCharge: shipping,
        tax: 0,
        total,
        paymentMethod: i % 2 === 0 ? 'cod' : 'bkash',
        paymentStatus: i >= 3 ? 'paid' : 'pending',
        shippingMethod: 'Standard Delivery',
        trackingNumber: i >= 4 ? `TRK${Date.now().toString().slice(-8)}` : null,
        items: {
          create: {
            productId: product.id,
            productName: product.name,
            productImage: product.images[0]?.url,
            quantity: 1,
            price: product.discountPrice || product.price,
            total: product.discountPrice || product.price,
          },
        },
      },
    });
  }

  console.log('✅ Sample orders created');

  // Create a cart for the customer
  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  console.log('✅ Cart created');

  // Create addresses for the customer
  for (const addr of [
    { label: 'Home', fullName: 'John Doe', phone: '+8801712345678', address: 'House 12, Road 5, Dhanmondi', city: 'Dhaka', zipCode: '1205', country: 'Bangladesh', isDefault: true },
    { label: 'Office', fullName: 'John Doe', phone: '+8801798765432', address: 'Floor 8, Gulshan Tower, Gulshan Avenue', city: 'Dhaka', zipCode: '1212', country: 'Bangladesh', isDefault: false },
  ]) {
    await prisma.address.create({ data: { userId: customer.id, ...addr } });
  }

  console.log('✅ Addresses created');

  // Create notifications
  for (const notif of [
    { title: 'Welcome to NextShop!', message: 'Thank you for joining NextShop. Start exploring our amazing products!', type: 'info' },
    { title: 'Order Confirmed', message: 'Your order NS-0001 has been confirmed and is being processed.', type: 'order' },
    { title: 'Flash Sale Alert!', message: 'Up to 50% off on electronics. Limited time offer!', type: 'promo' },
  ]) {
    await prisma.notification.create({ data: { userId: customer.id, ...notif } });
  }

  console.log('✅ Notifications created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });