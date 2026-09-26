import { db } from './index.ts';
import {
  categories,
  designs,
  designImages,
  customers,
  orders,
  measurements,
  customizations,
  orderStatusHistory,
  websiteContent,
  users,
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // 1. Check if categories already seeded
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) {
      console.log('Database already initialized. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding Sangeeta Boutique database...');

    // Default admin user
    const existingAdmin = await db.select().from(users).where(eq(users.uid, 'admin-sangeeta')).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        uid: 'admin-sangeeta',
        name: 'Sangeeta Kashyap',
        email: 'ankushsinghkashyap34@gmail.com',
        role: 'admin',
      });
    }

    // 2. Insert Categories
    const categoryData = [
      {
        name: 'Blouse',
        slug: 'blouse',
        description: 'Bridal, Designer, Embroidered, and Custom Fit Handcrafted Blouses',
        image: '/images/bridal-blouse-red.jpg',
        displayOrder: 1,
        status: 'active',
      },
      {
        name: 'Suits',
        slug: 'suits',
        description: 'Anarkali, Salwar, Straight Cut, and Designer Party Suits',
        image: '/images/anarkali-suit-royal.jpg',
        displayOrder: 2,
        status: 'active',
      },
      {
        name: 'Lehenga',
        slug: 'lehenga',
        description: 'Grand Bridal, Reception, and Sangeet Lehengas Tailored to Perfection',
        image: '/images/bridal-lehenga-luxury.jpg',
        displayOrder: 3,
        status: 'active',
      },
      {
        name: 'Kurti',
        slug: 'kurti',
        description: 'Chic Daily, Formal & Festive Designer Kurtis',
        image: '/images/kurti-ivory.jpg',
        displayOrder: 4,
        status: 'active',
      },
      {
        name: 'Saree & Drapes',
        slug: 'saree',
        description: 'Pre-pleated Ready-to-wear Sarees, Falls & Designer Blouse Pairing',
        image: '/images/saree-drapes.jpg',
        displayOrder: 5,
        status: 'active',
      },
      {
        name: 'Gowns & Indo-Western',
        slug: 'gown',
        description: 'Graceful Evening Gowns and Contemporary Ethnic Silhouettes',
        image: '/images/gown-indowestern.jpg',
        displayOrder: 6,
        status: 'active',
      },
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    const catMap = new Map(insertedCategories.map((c) => [c.slug, c.id]));

    // 3. Insert Designs
    const designsData = [
      {
        designCode: 'SB-BL-101',
        name: 'Royal Heritage Velvet Bridal Blouse',
        slug: 'royal-heritage-velvet-bridal-blouse',
        categoryId: catMap.get('blouse'),
        categoryName: 'Blouse',
        description: 'Exquisite deep crimson micro-velvet blouse embellished with authentic zardozi, kundan stones, and delicate pearl tassels. Designed with structured cups, reinforced seams, and custom back cutout.',
        designPrice: '3200.00',
        sewingPrice: '1800.00',
        customizationPrice: '500.00',
        totalPrice: '5000.00',
        fabricInfo: 'Pure Royal Silk Velvet with Butter Crepe Lining & Cotton Interlining',
        estimatedTime: '4-6 business days',
        availableSizes: 'XS, S, M, L, XL, XXL, Custom',
        customizationOptions: ['Sweetheart Neck', 'Deep U Neck', 'Elbow Sleeves', 'Cap Sleeves', 'Padded Cups', 'Handmade Dori Latkans'],
        mainImage: '/images/bridal-blouse-red.jpg',
        featured: true,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-BL-102',
        name: 'Contemporary Cutwork Silk Blouse',
        slug: 'contemporary-cutwork-silk-blouse',
        categoryId: catMap.get('blouse'),
        categoryName: 'Blouse',
        description: 'Modern blouse in soft raw silk featuring handcrafted floral cutwork along the deep illusion back neckline. Delicate hand-stitched beads, sheer organza paneling, and scalloped edges.',
        designPrice: '2500.00',
        sewingPrice: '1500.00',
        customizationPrice: '400.00',
        totalPrice: '4000.00',
        fabricInfo: 'Handloom Raw Silk with Soft Cotton Malmal Lining',
        estimatedTime: '3-5 business days',
        availableSizes: 'XS, S, M, L, XL, XXL, Custom',
        customizationOptions: ['Boat Neck', 'Keyhole Back', 'Sleeveless', 'Full Net Sleeves', 'Back Hook / Side Zipper'],
        mainImage: '/images/designer-blouse-back.jpg',
        featured: true,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-BL-103',
        name: 'Intricate Floral Aari Embroidered Blouse',
        slug: 'intricate-floral-aari-embroidered-blouse',
        categoryId: catMap.get('blouse'),
        categoryName: 'Blouse',
        description: 'Bespoke hand-embroidered blouse with authentic Lucknowi style fine Aari threadwork and muted antique gold sequins. Perfect pairing with festive sarees and heirloom silks.',
        designPrice: '2800.00',
        sewingPrice: '1600.00',
        customizationPrice: '350.00',
        totalPrice: '4400.00',
        fabricInfo: 'Chanderi Matka Silk with Breathable Cotton Lining',
        estimatedTime: '4-5 business days',
        availableSizes: 'XS, S, M, L, XL, Custom',
        customizationOptions: ['Round Neck', 'Deep V Neck', 'Three-Quarter Sleeves', 'Contrast Piping'],
        mainImage: '/images/bridal-blouse-red.jpg',
        featured: false,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-ST-201',
        name: 'Emerald Kalidar Chanderi Anarkali Suit',
        slug: 'emerald-kalidar-chanderi-anarkali-suit',
        categoryId: catMap.get('suits'),
        categoryName: 'Suits',
        description: 'Regal 16-kali flared Anarkali suit handcrafted in bottle green pure Chanderi silk. Features authentic gota patti work on yoke and hemline, churidar pants, and a scalloped organza dupatta.',
        designPrice: '5200.00',
        sewingPrice: '2200.00',
        customizationPrice: '600.00',
        totalPrice: '7400.00',
        fabricInfo: 'Pure Chanderi Silk with Santoon Bottom & Pure Silk Organza Dupatta',
        estimatedTime: '5-7 business days',
        availableSizes: 'S, M, L, XL, XXL, Custom',
        customizationOptions: ['Angrakha Cut', 'Regular Anarkali', 'Straight Pants', 'Churidar', 'Full Sleeves with Churis'],
        mainImage: '/images/anarkali-suit-royal.jpg',
        featured: true,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-ST-202',
        name: 'Pastel Peach Pakistani Straight Cut Suit',
        slug: 'pastel-peach-pakistani-straight-cut-suit',
        categoryId: catMap.get('suits'),
        categoryName: 'Suits',
        description: 'Elegant long straight silhouette with delicate crochet lace borders, organza hem insertions, and pintucks detailing. Paired with wide-leg culotte pants and digital floral print dupatta.',
        designPrice: '3800.00',
        sewingPrice: '1600.00',
        customizationPrice: '400.00',
        totalPrice: '5400.00',
        fabricInfo: 'Premium Georgette with Pure Cotton Inner Lining',
        estimatedTime: '3-5 business days',
        availableSizes: 'XS, S, M, L, XL, XXL, Custom',
        customizationOptions: ['Straight Kurta', 'A-Line Kurta', 'Palazzo Bottom', 'Cigarette Pants', 'Bell Sleeves'],
        mainImage: '/images/anarkali-suit-royal.jpg',
        featured: false,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-LH-301',
        name: 'Maharani Crimson Gold Bridal Lehenga',
        slug: 'maharani-crimson-gold-bridal-lehenga',
        categoryId: catMap.get('lehenga'),
        categoryName: 'Lehenga',
        description: 'Masterpiece 24-kali flared bridal lehenga in rich crimson raw silk. Hand-embroidered with antique gold dabka, marodi work, and real mirrors. Comes with double dupatta drape and heavy bridal blouse.',
        designPrice: '18500.00',
        sewingPrice: '6500.00',
        customizationPrice: '1500.00',
        totalPrice: '25000.00',
        fabricInfo: 'Heavy Banarasi Brocade & Raw Silk with Multi-layer Can-can and Micro-velvet Borders',
        estimatedTime: '10-14 business days',
        availableSizes: 'Custom Measurement Tailoring',
        customizationOptions: ['Double Dupatta Drape', 'Extra Can-Can Flare (4-layer)', 'Pocket Add-on', 'Custom Couple Monogram / Date Embroidery'],
        mainImage: '/images/bridal-lehenga-luxury.jpg',
        featured: true,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-LH-302',
        name: 'Blush Rose Floral Sangeet Lehenga',
        slug: 'blush-rose-floral-sangeet-lehenga',
        categoryId: catMap.get('lehenga'),
        categoryName: 'Lehenga',
        description: 'Romantic lightweight lehenga set in dusty blush organza with multi-color threadwork, subtle shimmer sequins, off-shoulder sweetheart blouse, and lightweight ruffled dupatta.',
        designPrice: '12000.00',
        sewingPrice: '4500.00',
        customizationPrice: '800.00',
        totalPrice: '16500.00',
        fabricInfo: 'Tissue Organza with Satin Silk Lining and Structured Flare',
        estimatedTime: '7-10 business days',
        availableSizes: 'XS, S, M, L, XL, Custom',
        customizationOptions: ['Sweetheart Neck Blouse', 'Corset Style Blouse', 'Standard Can-Can', 'High Slit Overlay'],
        mainImage: '/images/bridal-lehenga-luxury.jpg',
        featured: false,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-KT-401',
        name: 'Handcrafted Ivory Chikankari Festive Kurti',
        slug: 'handcrafted-ivory-chikankari-festive-kurti',
        categoryId: catMap.get('kurti'),
        categoryName: 'Kurti',
        description: 'Timeless long A-line kurti with fine shadow work, bakhiya stitches, mukaish highlights, and faux pearl buttons. Breathable, elegant, and versatile for work or celebrations.',
        designPrice: '1800.00',
        sewingPrice: '900.00',
        customizationPrice: '200.00',
        totalPrice: '2700.00',
        fabricInfo: 'Pure Mulmul Cotton with Handmade Crochet Finishes',
        estimatedTime: '2-4 business days',
        availableSizes: 'XS, S, M, L, XL, XXL, Custom',
        customizationOptions: ['Side Slits', 'Front Slit', 'Three-Quarter Sleeves', 'Mandarin Collar', 'V-Neck'],
        mainImage: '/images/kurti-ivory.jpg',
        featured: true,
        popular: false,
        status: 'active',
      },
      {
        designCode: 'SB-SR-501',
        name: 'Custom Pre-Pleated Ready Saree & Blouse Set',
        slug: 'custom-pre-pleated-ready-saree-blouse-set',
        categoryId: catMap.get('saree'),
        categoryName: 'Saree & Drapes',
        description: 'Zero hassle, 1-minute drape pre-pleated saree tailored precisely to your waist and height. Includes matching reinforced underskirt, fall, pico, and custom padded blouse.',
        designPrice: '3500.00',
        sewingPrice: '1800.00',
        customizationPrice: '400.00',
        totalPrice: '5300.00',
        fabricInfo: 'Fluid Satin Crepe with Zari Border Accent',
        estimatedTime: '3-5 business days',
        availableSizes: 'Waist & Height Customization',
        customizationOptions: ['Waistband Elastic + Hooks', 'Front Slit Option', 'Concealed Zipper', 'Matching Shapewear'],
        mainImage: '/images/saree-drapes.jpg',
        featured: false,
        popular: true,
        status: 'active',
      },
      {
        designCode: 'SB-GW-601',
        name: 'Rose Gold Shimmer Cape Indo-Western Gown',
        slug: 'rose-gold-shimmer-cape-indo-western-gown',
        categoryId: catMap.get('gown'),
        categoryName: 'Gowns & Indo-Western',
        description: 'Floor-length contemporary gown featuring an attached asymmetrical sheer cape sleeve, metallic thread accents, built-in corset boning, and flowing flared georgette drape.',
        designPrice: '8500.00',
        sewingPrice: '3500.00',
        customizationPrice: '800.00',
        totalPrice: '12000.00',
        fabricInfo: 'Imported Metallic Shimmer Georgette with Satin Lining',
        estimatedTime: '6-8 business days',
        availableSizes: 'XS, S, M, L, XL, Custom',
        customizationOptions: ['Detachable Cape', 'Concealed Side Zipper', 'Padded Bust Support', 'Train Length Adjustment'],
        mainImage: '/images/gown-indowestern.jpg',
        featured: true,
        popular: true,
        status: 'active',
      },
    ];

    const insertedDesigns = await db.insert(designs).values(designsData).returning();

    // 4. Insert Design Images (multi-image support)
    const imagesToInsert: any[] = [];
    insertedDesigns.forEach((d) => {
      imagesToInsert.push({
        designId: d.id,
        imageUrl: d.mainImage,
        isPrimary: true,
        displayOrder: 1,
      });
      // Add a secondary detail image
      imagesToInsert.push({
        designId: d.id,
        imageUrl: d.categoryName === 'Blouse' ? '/images/designer-blouse-back.jpg' : '/images/hero-banner.jpg',
        isPrimary: false,
        displayOrder: 2,
      });
    });
    await db.insert(designImages).values(imagesToInsert);

    // 5. Insert Sample Customers
    const customerData = [
      {
        name: 'Ankita Sharma',
        phone: '+91 98231 45678',
        email: 'ankita.sharma@example.com',
        address: 'Flat 402, Green Valley Apartments, Aundh',
        city: 'Pune',
        notes: 'Regular customer. Prefers slightly loose armholes.',
      },
      {
        name: 'Priya Verma',
        phone: '+91 97112 34567',
        email: 'priya.verma@example.com',
        address: 'B-14, Shivalik Enclave, Malviya Nagar',
        city: 'New Delhi',
        notes: 'Bridal order for upcoming wedding in November.',
      },
      {
        name: 'Meera Patel',
        phone: '+91 99045 67890',
        email: 'meera.patel@example.com',
        address: '10, Sanskar Society, Drive-In Road',
        city: 'Ahmedabad',
        notes: 'Requested fabric swatch approval via WhatsApp.',
      },
    ];
    const insertedCustomers = await db.insert(customers).values(customerData).returning();

    // 6. Insert Sample Orders
    const sampleOrdersData = [
      {
        orderNumber: 'SB-2026-00101',
        customerId: insertedCustomers[0].id,
        customerName: 'Ankita Sharma',
        customerPhone: '+91 98231 45678',
        customerEmail: 'ankita.sharma@example.com',
        customerAddress: 'Flat 402, Green Valley Apartments, Aundh',
        customerCity: 'Pune',
        preferredContact: 'WhatsApp',
        designId: insertedDesigns[0].id,
        designCode: insertedDesigns[0].designCode,
        designName: insertedDesigns[0].name,
        designCategory: 'Blouse',
        designImage: insertedDesigns[0].mainImage,
        status: 'Sewing in Progress',
        designPrice: '3200.00',
        sewingPrice: '1800.00',
        customizationPrice: '500.00',
        totalAmount: '5500.00',
        sizeType: 'Custom',
        standardSize: null,
        specialInstructions: 'Deep back cutout with elbow-length sleeves and double latkan dori.',
        referenceImageUrl: '/images/designer-blouse-back.jpg',
        expectedCompletionDate: '2026-10-02',
        notes: 'Customer visited shop for fabric touch-and-feel. Verified bust 36.',
      },
      {
        orderNumber: 'SB-2026-00102',
        customerId: insertedCustomers[1].id,
        customerName: 'Priya Verma',
        customerPhone: '+91 97112 34567',
        customerEmail: 'priya.verma@example.com',
        customerAddress: 'B-14, Shivalik Enclave, Malviya Nagar',
        customerCity: 'New Delhi',
        preferredContact: 'Phone Call',
        designId: insertedDesigns[5].id,
        designCode: insertedDesigns[5].designCode,
        designName: insertedDesigns[5].name,
        designCategory: 'Lehenga',
        designImage: insertedDesigns[5].mainImage,
        status: 'Confirmed',
        designPrice: '18500.00',
        sewingPrice: '6500.00',
        customizationPrice: '1500.00',
        totalAmount: '26500.00',
        sizeType: 'Custom',
        standardSize: null,
        specialInstructions: 'Bridal reception lehenga. Extra 4-layer cancan requested.',
        referenceImageUrl: null,
        expectedCompletionDate: '2026-10-15',
        notes: 'Measurements collected via video call consultation.',
      },
      {
        orderNumber: 'SB-2026-00103',
        customerId: insertedCustomers[2].id,
        customerName: 'Meera Patel',
        customerPhone: '+91 99045 67890',
        customerEmail: 'meera.patel@example.com',
        customerAddress: '10, Sanskar Society, Drive-In Road',
        customerCity: 'Ahmedabad',
        preferredContact: 'WhatsApp',
        designId: insertedDesigns[3].id,
        designCode: insertedDesigns[3].designCode,
        designName: insertedDesigns[3].name,
        designCategory: 'Suits',
        designImage: insertedDesigns[3].mainImage,
        status: 'New Order',
        designPrice: '5200.00',
        sewingPrice: '2200.00',
        customizationPrice: '0.00',
        totalAmount: '7400.00',
        sizeType: 'Standard',
        standardSize: 'M',
        specialInstructions: 'Standard M size fit with pant length 38 inches.',
        referenceImageUrl: null,
        expectedCompletionDate: '2026-10-06',
        notes: 'Needs call confirmation on dupatta border design.',
      },
    ];

    const insertedOrders = await db.insert(orders).values(sampleOrdersData).returning();

    // 7. Insert Order Measurements
    const order1Measurements = [
      { orderId: insertedOrders[0].id, measurementType: 'Bust', measurementValue: '36' },
      { orderId: insertedOrders[0].id, measurementType: 'Waist', measurementValue: '30' },
      { orderId: insertedOrders[0].id, measurementType: 'Shoulder', measurementValue: '14' },
      { orderId: insertedOrders[0].id, measurementType: 'Armhole', measurementValue: '16' },
      { orderId: insertedOrders[0].id, measurementType: 'Sleeve Length', measurementValue: '11' },
      { orderId: insertedOrders[0].id, measurementType: 'Blouse Length', measurementValue: '14.5' },
      { orderId: insertedOrders[0].id, measurementType: 'Neck Depth Front', measurementValue: '7' },
      { orderId: insertedOrders[0].id, measurementType: 'Neck Depth Back', measurementValue: '10.5' },
    ];
    await db.insert(measurements).values(order1Measurements);

    const order2Measurements = [
      { orderId: insertedOrders[1].id, measurementType: 'Waist', measurementValue: '32' },
      { orderId: insertedOrders[1].id, measurementType: 'Hip', measurementValue: '39' },
      { orderId: insertedOrders[1].id, measurementType: 'Lehenga Length', measurementValue: '42' },
      { orderId: insertedOrders[1].id, measurementType: 'Bust', measurementValue: '35' },
      { orderId: insertedOrders[1].id, measurementType: 'Blouse Length', measurementValue: '15' },
    ];
    await db.insert(measurements).values(order2Measurements);

    // 8. Insert Customizations
    const order1Customizations = [
      { orderId: insertedOrders[0].id, customizationType: 'Neck Style', customizationValue: 'Deep Sweetheart Front' },
      { orderId: insertedOrders[0].id, customizationType: 'Back Design', customizationValue: 'Diamond Cutout with Latkan Dori' },
      { orderId: insertedOrders[0].id, customizationType: 'Padding', customizationValue: 'Bra Cups Inserted' },
    ];
    await db.insert(customizations).values(order1Customizations);

    // 9. Insert Order Status History
    const statusHistoryData = [
      { orderId: insertedOrders[0].id, status: 'New Order', note: 'Order placed by customer online', changedBy: 'System' },
      { orderId: insertedOrders[0].id, status: 'Contact Customer', note: 'Discussed sleeve lining on phone', changedBy: 'Admin' },
      { orderId: insertedOrders[0].id, status: 'Confirmed', note: 'Advance received & fabric cut ready', changedBy: 'Admin' },
      { orderId: insertedOrders[0].id, status: 'Measurement Verified', note: 'Bust 36 verified with blouse sample', changedBy: 'Master Tailor' },
      { orderId: insertedOrders[0].id, status: 'Sewing in Progress', note: 'Zardozi embroidery completed, stitching underway', changedBy: 'Master Tailor' },

      { orderId: insertedOrders[1].id, status: 'New Order', note: 'Bridal inquiry submitted', changedBy: 'System' },
      { orderId: insertedOrders[1].id, status: 'Confirmed', note: 'Booking confirmed for Nov wedding', changedBy: 'Admin' },

      { orderId: insertedOrders[2].id, status: 'New Order', note: 'Order submitted via website', changedBy: 'System' },
    ];
    await db.insert(orderStatusHistory).values(statusHistoryData);

    // 10. Insert Website Content CMS defaults
    const contentData = [
      { key: 'hero_title', value: 'Sangeeta Boutique' },
      { key: 'hero_tagline', value: '“Elegant Designs. Perfect Fit. Made for You.”' },
      { key: 'hero_description', value: 'Crafting bespoke bridal blouses, royal suits, festive lehengas, and designer silhouettes with master precision and timeless artistry since 2012.' },
      { key: 'phone_number', value: '+9779702742100' },
      { key: 'whatsapp_number', value: '+9779702742100' },
      { key: 'email_address', value: 'ankushsinghkashyap34@gmail.com' },
      { key: 'physical_address', value: 'Dumara chowk kapilvastu nepal' },
      { key: 'opening_hours', value: 'Monday - Saturday: 10:30 AM - 8:30 PM | Sunday: By Appointment' },
      { key: 'announcement_banner', value: 'Festive Season Bookings Open! Complimentary bridal styling consultation with every sewing booking.' },
      { key: 'about_story', value: 'Founded by master couturier Sangeeta Kashyap, Sangeeta Boutique has tailored over 15,000 bespoke ensembles. Every cut, pleat, and embroidery stitch is thoughtfully planned to celebrate your unique grace, ensuring an immaculate silhouette that feels effortlessly comfortable.' },
    ];

    for (const item of contentData) {
      const existing = await db.select().from(websiteContent).where(eq(websiteContent.key, item.key)).limit(1);
      if (existing.length > 0) {
        await db.update(websiteContent).set({ value: item.value, updatedAt: new Date() }).where(eq(websiteContent.key, item.key));
      } else {
        await db.insert(websiteContent).values(item);
      }
    }

    console.log('✅ Seed data successfully populated!');
  } catch (error) {
    console.error('Seed database error:', error);
  }
}

export async function syncStoreDetails() {
  try {
    const contentUpdates = [
      { key: 'phone_number', value: '+9779702742100' },
      { key: 'whatsapp_number', value: '+9779702742100' },
      { key: 'email_address', value: 'ankushsinghkashyap34@gmail.com' },
      { key: 'physical_address', value: 'Dumara chowk kapilvastu nepal' },
      {
        key: 'about_story',
        value: 'Founded by master couturier Sangeeta Kashyap, Sangeeta Boutique has tailored over 15,000 bespoke ensembles. Every cut, pleat, and embroidery stitch is thoughtfully planned to celebrate your unique grace, ensuring an immaculate silhouette that feels effortlessly comfortable.',
      },
    ];

    for (const item of contentUpdates) {
      const existing = await db.select().from(websiteContent).where(eq(websiteContent.key, item.key)).limit(1);
      if (existing.length > 0) {
        await db.update(websiteContent).set({ value: item.value, updatedAt: new Date() }).where(eq(websiteContent.key, item.key));
      } else {
        await db.insert(websiteContent).values(item);
      }
    }

    // Update admin user if exists, or insert
    const adminRec = await db.select().from(users).where(eq(users.uid, 'admin-sangeeta')).limit(1);
    if (adminRec.length > 0) {
      await db.update(users).set({
        name: 'Sangeeta Kashyap',
        email: 'ankushsinghkashyap34@gmail.com',
      }).where(eq(users.uid, 'admin-sangeeta'));
    } else {
      await db.insert(users).values({
        uid: 'admin-sangeeta',
        name: 'Sangeeta Kashyap',
        email: 'ankushsinghkashyap34@gmail.com',
        role: 'admin',
      });
    }

    console.log('✅ Store details synced: Phone: +9779702742100, Email: ankushsinghkashyap34@gmail.com, Address: Dumara chowk kapilvastu nepal, Founder: Sangeeta Kashyap');
  } catch (err) {
    console.error('Error syncing store details:', err);
  }
}

export async function ensureHistoricalOrders() {
  try {
    const existing = await db.select().from(orders);
    if (existing.length >= 10) return;

    const custs = await db.select().from(customers);
    const des = await db.select().from(designs);
    if (custs.length === 0 || des.length === 0) return;

    const samplePastOrders = [
      { daysAgo: 28, designIdx: 0, custIdx: 0, status: 'Completed', notes: 'Anniversary reception blouse' },
      { daysAgo: 26, designIdx: 3, custIdx: 1, status: 'Completed', notes: 'Festive suit set' },
      { daysAgo: 24, designIdx: 1, custIdx: 2, status: 'Completed', notes: 'Silk blouse cutwork' },
      { daysAgo: 22, designIdx: 4, custIdx: 0, status: 'Completed', notes: 'Designer party kurti' },
      { daysAgo: 21, designIdx: 2, custIdx: 1, status: 'Completed', notes: 'Aari embroidered blouse' },
      { daysAgo: 19, designIdx: 0, custIdx: 2, status: 'Completed', notes: 'Velvet bridal fit' },
      { daysAgo: 18, designIdx: 5, custIdx: 0, status: 'Completed', notes: 'Lehenga alteration & stitching' },
      { daysAgo: 16, designIdx: 3, custIdx: 1, status: 'Completed', notes: 'Anarkali green suit' },
      { daysAgo: 15, designIdx: 1, custIdx: 2, status: 'Completed', notes: 'Raw silk blouse' },
      { daysAgo: 13, designIdx: 4, custIdx: 0, status: 'Completed', notes: 'Silk kurti tailored' },
      { daysAgo: 12, designIdx: 2, custIdx: 1, status: 'Ready', notes: 'Trial fitting complete' },
      { daysAgo: 10, designIdx: 0, custIdx: 2, status: 'Ready', notes: 'Ready for pick up' },
      { daysAgo: 9, designIdx: 3, custIdx: 0, status: 'Sewing in Progress', notes: 'Neck piping and lace border' },
      { daysAgo: 7, designIdx: 5, custIdx: 1, status: 'Sewing in Progress', notes: 'Cancan attachment in progress' },
      { daysAgo: 6, designIdx: 1, custIdx: 2, status: 'Sewing Started', notes: 'Cutting stage passed' },
      { daysAgo: 5, designIdx: 4, custIdx: 0, status: 'Sewing in Progress', notes: 'Hemming and sleeves attached' },
      { daysAgo: 4, designIdx: 2, custIdx: 1, status: 'Measurement Verified', notes: 'Shoulder width adjusted to 14.5' },
      { daysAgo: 3, designIdx: 0, custIdx: 2, status: 'Confirmed', notes: 'Advance payment received' },
      { daysAgo: 2, designIdx: 3, custIdx: 0, status: 'Confirmed', notes: 'Fabric swatch approved' },
      { daysAgo: 1, designIdx: 1, custIdx: 1, status: 'New Order', notes: 'Ordered through online gallery' },
    ];

    for (let i = 0; i < samplePastOrders.length; i++) {
      const item = samplePastOrders[i];
      const d = new Date();
      d.setDate(d.getDate() - item.daysAgo);
      d.setHours(10 + (i % 8), (i * 17) % 60, 0, 0);

      const targetCust = custs[item.custIdx % custs.length];
      const targetDes = des[item.designIdx % des.length];
      const orderNum = `SB-2026-0${104 + i}`;

      await db.insert(orders).values({
        orderNumber: orderNum,
        customerId: targetCust.id,
        customerName: targetCust.name,
        customerPhone: targetCust.phone,
        customerEmail: targetCust.email,
        customerAddress: targetCust.address,
        customerCity: targetCust.city,
        preferredContact: 'WhatsApp',
        designId: targetDes.id,
        designCode: targetDes.designCode,
        designName: targetDes.name,
        designCategory: targetDes.categoryName,
        designImage: targetDes.mainImage,
        status: item.status as any,
        designPrice: targetDes.designPrice,
        sewingPrice: targetDes.sewingPrice,
        customizationPrice: targetDes.customizationPrice || '0.00',
        totalAmount: targetDes.totalPrice,
        sizeType: 'Custom',
        standardSize: null,
        specialInstructions: item.notes,
        expectedCompletionDate: new Date(d.getTime() + 7 * 86400000).toISOString().split('T')[0],
        notes: item.notes,
        createdAt: d,
        updatedAt: d,
      });
    }
    console.log('✅ Historical 30-day sewing orders populated successfully');
  } catch (err) {
    console.error('Error generating historical orders:', err);
  }
}
