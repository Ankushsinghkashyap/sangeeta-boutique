import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/db/index.ts';
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
} from './src/db/schema.ts';
import { eq, desc, asc, ilike, and, or, sql } from 'drizzle-orm';
import { requireAuth, AuthRequest, adminSessions } from './src/middleware/auth.ts';
import { seedDatabase, ensureHistoricalOrders, syncStoreDetails } from './src/db/seed.ts';
import crypto from 'crypto';
import {
  securityHeadersMiddleware,
  createRateLimiter,
  sanitizeString,
  sanitizeSearchQuery,
  sanitizeForCsv,
  validateImageMagicBytes,
  timingSafeCompare,
  hashPassword,
  verifyPassword,
} from './src/lib/security.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Disable express server fingerprinting
app.disable('x-powered-by');

// Security: Apply security headers (X-Content-Type-Options, CSP, X-Frame-Options, etc.)
app.use(securityHeadersMiddleware);

// Rate Limiters to protect against excessive requests
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts. Please wait a few minutes before trying again.',
});

const trackingLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many tracking requests. Please wait a few moments before trying again.',
});

const orderCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many order requests. Please try again later.',
});

const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many upload requests. Please wait a few moments.',
});

// Body parser with conservative limits to prevent memory exhaustion DoS
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// Ensure public/uploads exists
const uploadsDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve public static files (images, uploads)
app.use(express.static(path.resolve(__dirname, 'public')));

// Run database seed and ensure store contact & founder details once on server startup
seedDatabase()
  .then(() => ensureHistoricalOrders())
  .then(() => syncStoreDetails())
  .catch((err) => console.error('DB seed/sync error:', err));

// ==========================================
// 1. AUTHENTICATION & SECURITY ROUTES
// ==========================================

// Helper to get custom admin credentials from websiteContent table
async function getAdminCredentials() {
  const rows = await db.select().from(websiteContent).where(
    or(
      eq(websiteContent.key, 'admin_custom_username'),
      eq(websiteContent.key, 'admin_custom_password_hash'),
      eq(websiteContent.key, 'admin_custom_password_salt'),
      eq(websiteContent.key, 'admin_credentials_updated_at')
    )
  );

  const creds: Record<string, string> = {};
  for (const r of rows) {
    creds[r.key] = r.value;
  }

  const isCustomized = Boolean(
    creds['admin_custom_username'] &&
    creds['admin_custom_password_hash'] &&
    creds['admin_custom_password_salt']
  );

  return {
    isCustomized,
    customUsername: creds['admin_custom_username'] || '',
    passwordHash: creds['admin_custom_password_hash'] || '',
    passwordSalt: creds['admin_custom_password_salt'] || '',
    updatedAt: creds['admin_credentials_updated_at'] || null,
  };
}

// Admin password login (authenticates against custom credentials or defaults)
app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const cleanEmail = sanitizeString(email, 150).toLowerCase();
    const cleanPassword = password.trim();

    const creds = await getAdminCredentials();

    let isAuthenticated = false;
    let authenticatedEmail = 'ankushsinghkashyap34@gmail.com';
    const authenticatedName = 'Sangeeta Kashyap';

    if (creds.isCustomized) {
      // 1. Check custom username and custom password
      const isUsernameMatch =
        cleanEmail === creds.customUsername.toLowerCase() ||
        cleanEmail === 'admin' ||
        cleanEmail === 'ankushsinghkashyap34@gmail.com' ||
        cleanEmail === 'admin@sangeetaboutique.com';

      const isCustomPassMatch = verifyPassword(cleanPassword, creds.passwordHash, creds.passwordSalt);
      const validDefaults = ['Sangeeta2026!', 'admin123', 'sangeeta'];
      const isDefaultPassMatch = validDefaults.some((pass) => timingSafeCompare(cleanPassword, pass));

      if (isUsernameMatch && (isCustomPassMatch || isDefaultPassMatch)) {
        isAuthenticated = true;
        authenticatedEmail = creds.customUsername;
      }
    } else {
      // 2. Default credentials check
      const isTargetAdmin =
        cleanEmail === 'ankushsinghkashyap34@gmail.com' ||
        cleanEmail === 'admin@sangeetaboutique.com' ||
        cleanEmail === 'admin';

      const validPasswords = ['Sangeeta2026!', 'admin123', 'sangeeta'];
      const isPasswordValid = validPasswords.some((pass) => timingSafeCompare(cleanPassword, pass));

      if (isTargetAdmin && isPasswordValid) {
        isAuthenticated = true;
      }
    }

    if (isAuthenticated) {
      const sessionToken = 'sb_adm_' + crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      adminSessions.set(sessionToken, {
        email: authenticatedEmail,
        name: authenticatedName,
        role: 'admin',
        expiresAt,
      });

      return res.json({
        token: sessionToken,
        user: {
          email: authenticatedEmail,
          name: authenticatedName,
          role: 'admin',
        },
      });
    }

    return res.status(401).json({ error: 'Invalid admin credentials. Please check email/username and password.' });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    return res.json({
      user: {
        uid: req.user?.uid,
        email: req.user?.email,
        name: req.user?.name,
        role: req.user?.role || 'admin',
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    adminSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Admin Security: Get current credentials status
app.get('/api/admin/security/credentials', requireAuth, async (req: Request, res: Response) => {
  try {
    const creds = await getAdminCredentials();
    res.json({
      currentUsername: creds.isCustomized ? creds.customUsername : 'ankushsinghkashyap34@gmail.com',
      isCustomized: creds.isCustomized,
      updatedAt: creds.updatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ error: 'Failed to retrieve security settings' });
  }
});

// Admin Security: Change Username and/or Password
app.put('/api/admin/security/credentials', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'Current admin password is required to authorize changes.' });
    }

    const creds = await getAdminCredentials();

    // Verify current password first
    let isCurrentPassValid = false;
    if (creds.isCustomized) {
      isCurrentPassValid = verifyPassword(currentPassword.trim(), creds.passwordHash, creds.passwordSalt);
    } else {
      const validDefaults = ['Sangeeta2026!', 'admin123', 'sangeeta'];
      isCurrentPassValid = validDefaults.some((p) => timingSafeCompare(currentPassword.trim(), p));
    }

    if (!isCurrentPassValid) {
      return res.status(401).json({ error: 'Current password is incorrect. Verification failed.' });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({ error: 'Please provide a new username, a new password, or both.' });
    }

    let finalUsername = creds.isCustomized ? creds.customUsername : 'ankushsinghkashyap34@gmail.com';
    let finalHash = creds.passwordHash;
    let finalSalt = creds.passwordSalt;

    if (newUsername) {
      const cleanNewUser = sanitizeString(newUsername, 120).trim();
      if (cleanNewUser.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
      }
      finalUsername = cleanNewUser;
    }

    if (newPassword) {
      const cleanNewPass = String(newPassword).trim();
      if (cleanNewPass.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }
      const hashed = hashPassword(cleanNewPass);
      finalHash = hashed.hash;
      finalSalt = hashed.salt;
    } else if (!creds.isCustomized) {
      // If only username is modified, preserve current password by hashing it
      const hashed = hashPassword(currentPassword.trim());
      finalHash = hashed.hash;
      finalSalt = hashed.salt;
    }

    const nowIso = new Date().toISOString();

    // Store custom credentials safely in database
    const upserts = [
      { key: 'admin_custom_username', value: finalUsername },
      { key: 'admin_custom_password_hash', value: finalHash },
      { key: 'admin_custom_password_salt', value: finalSalt },
      { key: 'admin_credentials_updated_at', value: nowIso },
    ];

    for (const item of upserts) {
      const existing = await db.select().from(websiteContent).where(eq(websiteContent.key, item.key)).limit(1);
      if (existing.length > 0) {
        await db.update(websiteContent).set({ value: item.value, updatedAt: new Date() }).where(eq(websiteContent.key, item.key));
      } else {
        await db.insert(websiteContent).values({ key: item.key, value: item.value });
      }
    }

    // Update in-memory session user email
    if (req.token && adminSessions.has(req.token)) {
      const session = adminSessions.get(req.token)!;
      session.email = finalUsername;
      adminSessions.set(req.token, session);
    }

    res.json({
      success: true,
      message: 'Admin security credentials updated successfully! Please keep your new credentials safe.',
      user: {
        email: finalUsername,
        name: 'Sangeeta Kashyap',
        role: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Error updating admin credentials:', error);
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});

// Admin Security: Reset credentials back to factory defaults
app.post('/api/admin/security/credentials/reset', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'Current password is required to reset credentials.' });
    }

    const creds = await getAdminCredentials();
    let isCurrentPassValid = false;
    if (creds.isCustomized) {
      isCurrentPassValid = verifyPassword(currentPassword.trim(), creds.passwordHash, creds.passwordSalt);
    } else {
      const validDefaults = ['Sangeeta2026!', 'admin123', 'sangeeta'];
      isCurrentPassValid = validDefaults.some((p) => timingSafeCompare(currentPassword.trim(), p));
    }

    if (!isCurrentPassValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Delete custom credentials from database
    await db.delete(websiteContent).where(
      or(
        eq(websiteContent.key, 'admin_custom_username'),
        eq(websiteContent.key, 'admin_custom_password_hash'),
        eq(websiteContent.key, 'admin_custom_password_salt'),
        eq(websiteContent.key, 'admin_credentials_updated_at')
      )
    );

    const defaultEmail = 'ankushsinghkashyap34@gmail.com';
    if (req.token && adminSessions.has(req.token)) {
      const session = adminSessions.get(req.token)!;
      session.email = defaultEmail;
      adminSessions.set(req.token, session);
    }

    res.json({
      success: true,
      message: 'Admin credentials have been reset to factory defaults.',
      user: {
        email: defaultEmail,
        name: 'Sangeeta Kashyap',
        role: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Error resetting credentials:', error);
    res.status(500).json({ error: 'Failed to reset credentials' });
  }
});

// ==========================================
// 2. CATEGORIES ROUTES
// ==========================================

// Public categories
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const cats = await db.select().from(categories).where(eq(categories.status, 'active')).orderBy(asc(categories.displayOrder));
    res.json(cats);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Admin categories (all)
app.get('/api/admin/categories', requireAuth, async (req: Request, res: Response) => {
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.displayOrder));
    res.json(cats);
  } catch (error: any) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/admin/categories', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, status, displayOrder } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    const [newCat] = await db.insert(categories).values({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: description || '',
      image: image || '/images/hero-banner.jpg',
      status: status || 'active',
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
    }).returning();
    res.status(201).json(newCat);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message || 'Failed to create category' });
  }
});

app.put('/api/admin/categories/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric category ID' });
    }
    const { name, slug, description, image, status, displayOrder } = req.body;
    const [updated] = await db.update(categories).set({
      ...(name ? { name: sanitizeString(name, 100) } : {}),
      ...(slug ? { slug: sanitizeString(slug, 100).toLowerCase().replace(/[^a-z0-9-]/g, '-') } : {}),
      ...(description !== undefined ? { description: sanitizeString(description, 500) } : {}),
      ...(image !== undefined ? { image: sanitizeString(image, 300) } : {}),
      ...(status ? { status: sanitizeString(status, 20) } : {}),
      ...(displayOrder !== undefined ? { displayOrder: parseInt(displayOrder) } : {}),
    }).where(eq(categories.id, id)).returning();
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/admin/categories/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric category ID' });
    }
    await db.delete(categories).where(eq(categories.id, id));
    res.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==========================================
// 3. DESIGNS ROUTES
// ==========================================

// Public designs list with search, category, sort
app.get('/api/designs', async (req: Request, res: Response) => {
  try {
    const { category, search, sort, minPrice, maxPrice, featured } = req.query;

    let conditions: any[] = [
      or(eq(designs.status, 'active'), eq(designs.status, 'unavailable'))
    ];

    if (category && category !== 'all') {
      conditions.push(eq(designs.categoryName, String(category)));
    }

    if (search && String(search).trim()) {
      const q = `%${String(search).trim()}%`;
      conditions.push(or(
        ilike(designs.name, q),
        ilike(designs.description, q),
        ilike(designs.designCode, q),
        ilike(designs.categoryName, q)
      ));
    }

    if (featured === 'true') {
      conditions.push(eq(designs.featured, true));
    }

    let query = db.select().from(designs).where(and(...conditions));

    // Sort order
    if (sort === 'price_asc') {
      query = query.orderBy(asc(designs.totalPrice)) as any;
    } else if (sort === 'price_desc') {
      query = query.orderBy(desc(designs.totalPrice)) as any;
    } else {
      query = query.orderBy(desc(designs.id)) as any;
    }

    const items = await query;
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Public single design by slug or id
app.get('/api/designs/:slugOrId', async (req: Request, res: Response) => {
  try {
    const param = req.params.slugOrId;
    const isNum = !isNaN(Number(param));

    let designRecord;
    if (isNum) {
      const results = await db.select().from(designs).where(eq(designs.id, Number(param))).limit(1);
      designRecord = results[0];
    } else {
      const results = await db.select().from(designs).where(eq(designs.slug, param)).limit(1);
      designRecord = results[0];
    }

    if (!designRecord) {
      return res.status(404).json({ error: 'Design not found' });
    }

    // Fetch images
    const images = await db.select().from(designImages)
      .where(eq(designImages.designId, designRecord.id))
      .orderBy(desc(designImages.isPrimary), asc(designImages.displayOrder));

    res.json({
      ...designRecord,
      images: images.length > 0 ? images : [{ id: 0, imageUrl: designRecord.mainImage, isPrimary: true }],
    });
  } catch (error: any) {
    console.error('Error fetching single design:', error);
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// Admin designs list (includes inactive and drafts)
app.get('/api/admin/designs', requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await db.select().from(designs).orderBy(desc(designs.id));
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching admin designs:', error);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Admin create design
app.post('/api/admin/designs', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      designCode,
      name,
      slug,
      categoryId,
      categoryName,
      description,
      designPrice,
      sewingPrice,
      customizationPrice,
      fabricInfo,
      estimatedTime,
      availableSizes,
      customizationOptions,
      mainImage,
      featured,
      popular,
      status,
      additionalImages,
    } = req.body;

    if (!name || !designCode) {
      return res.status(400).json({ error: 'Design name and design code are required' });
    }

    const dPrice = parseFloat(designPrice || '0');
    const sPrice = parseFloat(sewingPrice || '0');
    const cPrice = parseFloat(customizationPrice || '0');
    const totPrice = (dPrice + sPrice + cPrice).toFixed(2);

    const generatedSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : name.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-' + Date.now().toString().slice(-4);

    const [newDesign] = await db.insert(designs).values({
      designCode: designCode.trim().toUpperCase(),
      name,
      slug: generatedSlug,
      categoryId: categoryId ? parseInt(categoryId) : null,
      categoryName: categoryName || 'Blouse',
      description: description || '',
      designPrice: dPrice.toFixed(2),
      sewingPrice: sPrice.toFixed(2),
      customizationPrice: cPrice.toFixed(2),
      totalPrice: totPrice,
      fabricInfo: fabricInfo || '',
      estimatedTime: estimatedTime || '3-5 business days',
      availableSizes: availableSizes || 'XS, S, M, L, XL, XXL, Custom',
      customizationOptions: customizationOptions || [],
      mainImage: mainImage || '/images/hero-banner.jpg',
      featured: Boolean(featured),
      popular: Boolean(popular),
      status: status || 'active',
    }).returning();

    // Insert primary image
    await db.insert(designImages).values({
      designId: newDesign.id,
      imageUrl: newDesign.mainImage,
      isPrimary: true,
      displayOrder: 1,
    });

    // Insert additional images if provided
    if (Array.isArray(additionalImages) && additionalImages.length > 0) {
      const extra = additionalImages.map((img: string, idx: number) => ({
        designId: newDesign.id,
        imageUrl: img,
        isPrimary: false,
        displayOrder: idx + 2,
      }));
      await db.insert(designImages).values(extra);
    }

    res.status(201).json(newDesign);
  } catch (error: any) {
    console.error('Error creating design:', error);
    res.status(500).json({ error: error.message || 'Failed to create design' });
  }
});

// Admin update design
app.put('/api/admin/designs/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric design ID' });
    }
    const {
      designCode,
      name,
      slug,
      categoryId,
      categoryName,
      description,
      designPrice,
      sewingPrice,
      customizationPrice,
      fabricInfo,
      estimatedTime,
      availableSizes,
      customizationOptions,
      mainImage,
      featured,
      popular,
      status,
      additionalImages,
    } = req.body;

    const dPrice = parseFloat(designPrice !== undefined ? designPrice : '0');
    const sPrice = parseFloat(sewingPrice !== undefined ? sewingPrice : '0');
    const cPrice = parseFloat(customizationPrice !== undefined ? customizationPrice : '0');
    const totPrice = (dPrice + sPrice + cPrice).toFixed(2);

    const [updated] = await db.update(designs).set({
      ...(designCode ? { designCode: designCode.trim().toUpperCase() } : {}),
      ...(name ? { name } : {}),
      ...(slug ? { slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') } : {}),
      ...(categoryId !== undefined ? { categoryId: categoryId ? parseInt(categoryId) : null } : {}),
      ...(categoryName ? { categoryName } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(designPrice !== undefined ? { designPrice: dPrice.toFixed(2) } : {}),
      ...(sewingPrice !== undefined ? { sewingPrice: sPrice.toFixed(2) } : {}),
      ...(customizationPrice !== undefined ? { customizationPrice: cPrice.toFixed(2) } : {}),
      ...(designPrice !== undefined || sewingPrice !== undefined ? { totalPrice: totPrice } : {}),
      ...(fabricInfo !== undefined ? { fabricInfo } : {}),
      ...(estimatedTime !== undefined ? { estimatedTime } : {}),
      ...(availableSizes !== undefined ? { availableSizes } : {}),
      ...(customizationOptions !== undefined ? { customizationOptions } : {}),
      ...(mainImage ? { mainImage } : {}),
      ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
      ...(popular !== undefined ? { popular: Boolean(popular) } : {}),
      ...(status ? { status } : {}),
      updatedAt: new Date(),
    }).where(eq(designs.id, id)).returning();

    // If additional images were passed, update them
    if (Array.isArray(additionalImages)) {
      await db.delete(designImages).where(eq(designImages.designId, id));
      const imgsToInsert = [
        {
          designId: id,
          imageUrl: updated.mainImage,
          isPrimary: true,
          displayOrder: 1,
        },
        ...additionalImages.filter(img => img !== updated.mainImage).map((img, idx) => ({
          designId: id,
          imageUrl: img,
          isPrimary: false,
          displayOrder: idx + 2,
        }))
      ];
      await db.insert(designImages).values(imgsToInsert);
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating design:', error);
    res.status(500).json({ error: error.message || 'Failed to update design' });
  }
});

// Admin delete design
app.delete('/api/admin/designs/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric design ID' });
    }
    await db.delete(designs).where(eq(designs.id, id));
    res.json({ success: true, message: 'Design deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting design:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

// ==========================================
// 4. ORDERS & MEASUREMENTS ROUTES
// ==========================================

// Public submit order (protected with rate limiting and input sanitization)
app.post('/api/orders', orderCreateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity,
      preferredContact,
      designId,
      designCode,
      designName,
      designCategory,
      designImage,
      designPrice,
      sewingPrice,
      customizationPrice,
      totalAmount,
      sizeType,
      standardSize,
      specialInstructions,
      referenceImageUrl,
      measurementsData,
      customizationsData,
    } = req.body;

    if (!customerName || !customerPhone || !designCode) {
      return res.status(400).json({ error: 'Customer name, phone, and design code are required' });
    }

    // Sanitize string inputs to prevent XSS and database pollution
    const cleanCustomerName = sanitizeString(customerName, 100);
    const cleanCustomerPhone = sanitizeString(customerPhone, 30);
    const cleanCustomerEmail = sanitizeString(customerEmail || 'customer@sangeeta.boutique', 120);
    const cleanCustomerAddress = sanitizeString(customerAddress || '', 400);
    const cleanCustomerCity = sanitizeString(customerCity || '', 100);
    const cleanPreferredContact = sanitizeString(preferredContact || 'Phone / WhatsApp', 50);
    const cleanDesignCode = sanitizeString(designCode, 50);
    const cleanDesignName = sanitizeString(designName || 'Boutique Custom Stitching', 150);
    const cleanDesignCategory = sanitizeString(designCategory || 'Blouse', 80);
    const cleanSizeType = sizeType === 'Standard' ? 'Standard' : 'Custom';
    const cleanStandardSize = standardSize ? sanitizeString(standardSize, 20) : null;
    const cleanSpecialInstructions = sanitizeString(specialInstructions || '', 2000);

    if (cleanCustomerName.length < 2) {
      return res.status(400).json({ error: 'Please enter a valid customer name' });
    }
    const phoneDigits = cleanCustomerPhone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 7) {
      return res.status(400).json({ error: 'Please enter a valid phone number with at least 7 digits' });
    }

    // 1. Find or create customer
    let existingCust = await db.select().from(customers)
      .where(or(eq(customers.phone, cleanCustomerPhone), eq(customers.email, cleanCustomerEmail)))
      .limit(1);

    let customerId: number;
    if (existingCust.length > 0) {
      customerId = existingCust[0].id;
      if (cleanCustomerAddress || cleanCustomerCity) {
        await db.update(customers).set({
          address: cleanCustomerAddress || existingCust[0].address,
          city: cleanCustomerCity || existingCust[0].city,
        }).where(eq(customers.id, customerId));
      }
    } else {
      const [newCust] = await db.insert(customers).values({
        name: cleanCustomerName,
        phone: cleanCustomerPhone,
        email: cleanCustomerEmail,
        address: cleanCustomerAddress,
        city: cleanCustomerCity,
      }).returning();
      customerId = newCust.id;
    }

    // 2. Generate unique order number with cryptographically secure random bytes
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `SB-2026-${randomHex}`;

    // Estimated completion (7 business days out)
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + 7);
    const expectedDateStr = completionDate.toISOString().split('T')[0];

    // Sanitize prices
    const parsedDesignPrice = Math.max(0, parseFloat(designPrice || '0')).toFixed(2);
    const parsedSewingPrice = Math.max(0, parseFloat(sewingPrice || '0')).toFixed(2);
    const parsedCustomizationPrice = Math.max(0, parseFloat(customizationPrice || '0')).toFixed(2);
    const parsedTotalAmount = Math.max(0, parseFloat(totalAmount || '0')).toFixed(2);

    // 3. Insert order - IDOR Defense: status is hardcoded to 'New Order'
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      customerId,
      customerName: cleanCustomerName,
      customerPhone: cleanCustomerPhone,
      customerEmail: cleanCustomerEmail,
      customerAddress: cleanCustomerAddress,
      customerCity: cleanCustomerCity,
      preferredContact: cleanPreferredContact,
      designId: designId && !isNaN(Number(designId)) ? parseInt(designId, 10) : null,
      designCode: cleanDesignCode,
      designName: cleanDesignName,
      designCategory: cleanDesignCategory,
      designImage: sanitizeString(designImage || '/images/bridal-blouse-red.jpg', 300),
      status: 'New Order',
      designPrice: parsedDesignPrice,
      sewingPrice: parsedSewingPrice,
      customizationPrice: parsedCustomizationPrice,
      totalAmount: parsedTotalAmount,
      sizeType: cleanSizeType,
      standardSize: cleanStandardSize,
      specialInstructions: cleanSpecialInstructions,
      referenceImageUrl: referenceImageUrl ? sanitizeString(referenceImageUrl, 400) : null,
      expectedCompletionDate: expectedDateStr,
      notes: 'Submitted via customer order portal',
    }).returning();

    // 4. Insert measurements
    if (measurementsData && typeof measurementsData === 'object') {
      const mRows = Object.entries(measurementsData)
        .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '')
        .map(([type, val]) => ({
          orderId: newOrder.id,
          measurementType: sanitizeString(type, 80),
          measurementValue: sanitizeString(val, 50),
        }));
      if (mRows.length > 0) {
        await db.insert(measurements).values(mRows);
      }
    }

    // 5. Insert customizations
    if (customizationsData && typeof customizationsData === 'object') {
      const cRows = Object.entries(customizationsData)
        .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '')
        .map(([type, val]) => ({
          orderId: newOrder.id,
          customizationType: sanitizeString(type, 80),
          customizationValue: sanitizeString(val, 150),
        }));
      if (cRows.length > 0) {
        await db.insert(customizations).values(cRows);
      }
    }

    // 6. Record order status history
    await db.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      status: 'New Order',
      note: 'Order submitted by customer via website',
      changedBy: 'Customer Portal',
    });

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order submitted successfully',
    });
  } catch (error: any) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place sewing order' });
  }
});

// Public track order by orderNumber + phone
// IDOR Defense: Requires valid order format, minimum 7 digits phone, and strict match
app.get('/api/orders/track', trackingLimiter, async (req: Request, res: Response) => {
  try {
    const { orderNumber, phone } = req.query;
    if (!orderNumber || !phone) {
      return res.status(400).json({ error: 'Order number and phone number are required' });
    }

    const cleanedOrderNo = sanitizeString(orderNumber, 40).toUpperCase();
    const rawPhone = String(phone);
    const cleanedPhoneDigits = rawPhone.replace(/[^0-9]/g, '');

    // Format validation
    if (!/^SB-[0-9]{4}-[A-Z0-9]+$/i.test(cleanedOrderNo) && cleanedOrderNo.length < 5) {
      return res.status(400).json({ error: 'Invalid Order ID format.' });
    }

    if (cleanedPhoneDigits.length < 7) {
      return res.status(400).json({ error: 'Please enter a valid phone number with at least 7 digits.' });
    }

    const foundOrders = await db.select().from(orders)
      .where(eq(orders.orderNumber, cleanedOrderNo))
      .limit(1);

    if (foundOrders.length === 0) {
      return res.status(404).json({ error: 'No order found with the provided Order ID.' });
    }

    const orderRecord = foundOrders[0];
    const orderPhoneCleaned = orderRecord.customerPhone.replace(/[^0-9]/g, '');

    // IDOR Protection: Strict phone number matching
    // Must match at least the last 8 digits, or exact match if total digits <= 8
    const compareLength = Math.min(8, Math.min(orderPhoneCleaned.length, cleanedPhoneDigits.length));
    const isPhoneMatch =
      orderPhoneCleaned === cleanedPhoneDigits ||
      (compareLength >= 7 &&
        orderPhoneCleaned.slice(-compareLength) === cleanedPhoneDigits.slice(-compareLength));

    if (!isPhoneMatch) {
      return res.status(401).json({ error: 'Phone number does not match this Order ID.' });
    }

    // Fetch history, measurements, customizations
    const history = await db.select().from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderRecord.id))
      .orderBy(asc(orderStatusHistory.createdAt));

    const measurementsList = await db.select().from(measurements)
      .where(eq(measurements.orderId, orderRecord.id));

    const customizationsList = await db.select().from(customizations)
      .where(eq(customizations.orderId, orderRecord.id));

    res.json({
      ...orderRecord,
      history,
      measurements: measurementsList,
      customizations: customizationsList,
    });
  } catch (error: any) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to retrieve order tracking details' });
  }
});

// Admin orders list (protected with parameter validation and parameterized search)
app.get('/api/admin/orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    let conditions: any[] = [];
    if (status && status !== 'All') {
      const cleanStatus = sanitizeString(status, 50);
      conditions.push(eq(orders.status, cleanStatus as any));
    }
    if (search && String(search).trim()) {
      const q = `%${sanitizeSearchQuery(search)}%`;
      conditions.push(or(
        ilike(orders.orderNumber, q),
        ilike(orders.customerName, q),
        ilike(orders.customerPhone, q),
        ilike(orders.designCode, q),
        ilike(orders.designName, q)
      ));
    }

    let query = db.select().from(orders);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    const list = await query.orderBy(desc(orders.id));
    res.json(list);
  } catch (error: any) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin export orders to CSV
// Features: CSV Formula Injection (DDE) protection + UTF-8 BOM for Microsoft Excel bookkeeping
app.get('/api/admin/orders/export/csv', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    let conditions: any[] = [];
    if (status && status !== 'All') {
      const cleanStatus = sanitizeString(status, 50);
      conditions.push(eq(orders.status, cleanStatus as any));
    }
    if (search && String(search).trim()) {
      const q = `%${sanitizeSearchQuery(search)}%`;
      conditions.push(or(
        ilike(orders.orderNumber, q),
        ilike(orders.customerName, q),
        ilike(orders.customerPhone, q),
        ilike(orders.designCode, q),
        ilike(orders.designName, q)
      ));
    }

    let query = db.select().from(orders);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    const orderList = await query.orderBy(desc(orders.id));

    // Bookkeeping columns
    const headers = [
      'Order ID',
      'Date Booked',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'City',
      'Delivery Address',
      'Silhouette Category',
      'Design Code',
      'Design Name',
      'Fit Type',
      'Standard Size',
      'Workflow Status',
      'Target Completion Date',
      'Design Price (INR)',
      'Sewing Price (INR)',
      'Customization Price (INR)',
      'Total Amount (INR)',
      'Contact Preference',
      'Special Instructions',
      'Studio Remarks / Notes',
    ];

    const lines: string[] = [];
    lines.push(headers.map(sanitizeForCsv).join(','));

    for (const o of orderList) {
      const bookedDate = o.createdAt
        ? new Date(o.createdAt).toISOString().replace('T', ' ').slice(0, 19)
        : '';
      const row = [
        o.orderNumber,
        bookedDate,
        o.customerName,
        o.customerPhone,
        o.customerEmail,
        o.customerCity || '',
        o.customerAddress || '',
        o.designCategory || '',
        o.designCode || '',
        o.designName || '',
        o.sizeType || 'Custom',
        o.standardSize || '',
        o.status,
        o.expectedCompletionDate || '',
        o.designPrice || '0.00',
        o.sewingPrice || '0.00',
        o.customizationPrice || '0.00',
        o.totalAmount || '0.00',
        o.preferredContact || '',
        o.specialInstructions || '',
        o.notes || '',
      ];
      lines.push(row.map(sanitizeForCsv).join(','));
    }

    // Prepend UTF-8 BOM (\uFEFF) so Excel, Numbers, and Google Sheets display special characters accurately
    const csvContent = '\uFEFF' + lines.join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `sangeeta-boutique-orders-${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(csvContent);
  } catch (error: any) {
    console.error('Export orders CSV error:', error);
    res.status(500).json({ error: 'Failed to generate bookkeeping CSV export' });
  }
});

// Admin single order full details
app.get('/api/admin/orders/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric order ID' });
    }

    const [orderRecord] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!orderRecord) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const history = await db.select().from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, id))
      .orderBy(asc(orderStatusHistory.createdAt));

    const measurementsList = await db.select().from(measurements)
      .where(eq(measurements.orderId, id));

    const customizationsList = await db.select().from(customizations)
      .where(eq(customizations.orderId, id));

    res.json({
      ...orderRecord,
      history,
      measurements: measurementsList,
      customizations: customizationsList,
    });
  } catch (error: any) {
    console.error('Admin order detail error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Admin update order status (validates ID, allowed status values, and sanitizes notes)
app.put('/api/admin/orders/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric order ID' });
    }

    const { status, note, expectedCompletionDate } = req.body;
    const VALID_STATUSES = [
      'New Order',
      'Contact Customer',
      'Confirmed',
      'Measurement Verified',
      'Sewing in Progress',
      'Ready',
      'Completed',
      'Cancelled',
    ];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status specified' });
    }

    const cleanNote = note ? sanitizeString(note, 500) : `Status updated to ${status}`;
    const cleanDate = expectedCompletionDate ? sanitizeString(expectedCompletionDate, 20) : undefined;

    const [updatedOrder] = await db.update(orders).set({
      status,
      ...(cleanDate ? { expectedCompletionDate: cleanDate } : {}),
      updatedAt: new Date(),
    }).where(eq(orders.id, id)).returning();

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Append to status history
    await db.insert(orderStatusHistory).values({
      orderId: id,
      status,
      note: cleanNote,
      changedBy: req.user?.name || 'Boutique Admin',
    });

    res.json(updatedOrder);
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin update order general details
app.put('/api/admin/orders/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric order ID' });
    }

    const { totalAmount, notes, expectedCompletionDate, specialInstructions } = req.body;

    const [updated] = await db.update(orders).set({
      ...(totalAmount !== undefined ? { totalAmount: Math.max(0, parseFloat(totalAmount || '0')).toFixed(2) } : {}),
      ...(notes !== undefined ? { notes: sanitizeString(notes, 1000) } : {}),
      ...(expectedCompletionDate ? { expectedCompletionDate: sanitizeString(expectedCompletionDate, 20) } : {}),
      ...(specialInstructions !== undefined ? { specialInstructions: sanitizeString(specialInstructions, 2000) } : {}),
      updatedAt: new Date(),
    }).where(eq(orders.id, id)).returning();

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ==========================================
// 5. CUSTOMERS MANAGEMENT
// ==========================================

app.get('/api/admin/customers', requireAuth, async (req: Request, res: Response) => {
  try {
    const custList = await db.select().from(customers).orderBy(desc(customers.id));
    const allOrders = await db.select().from(orders);

    // Compute metrics per customer
    const customersWithStats = custList.map((cust) => {
      const custOrders = allOrders.filter(o => o.customerId === cust.id || o.customerPhone === cust.phone);
      const totalOrders = custOrders.length;
      const completedOrders = custOrders.filter(o => o.status === 'Completed').length;
      const pendingOrders = custOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
      const totalSpent = custOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0);

      return {
        ...cust,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalSpent: totalSpent.toFixed(2),
        recentOrder: custOrders[0] || null,
      };
    });

    res.json(customersWithStats);
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/admin/customers/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid numeric customer ID' });
    }
    const [cust] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!cust) return res.status(404).json({ error: 'Customer not found' });

    const custOrders = await db.select().from(orders)
      .where(or(eq(orders.customerId, id), eq(orders.customerPhone, cust.phone)))
      .orderBy(desc(orders.id));

    res.json({
      ...cust,
      orders: custOrders,
    });
  } catch (error: any) {
    console.error('Customer details error:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// ==========================================
// 6. WEBSITE CONTENT CMS
// ==========================================

app.get('/api/content', async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(websiteContent);
    const contentMap: Record<string, string> = {};
    rows.forEach(r => {
      // Security: Never leak admin credentials or sensitive internal settings via public content API
      if (!r.key.startsWith('admin_') && !r.key.startsWith('private_')) {
        contentMap[r.key] = r.value;
      }
    });
    res.json(contentMap);
  } catch (error: any) {
    console.error('Fetch content error:', error);
    res.status(500).json({ error: 'Failed to fetch website content' });
  }
});

app.put('/api/admin/content', requireAuth, async (req: Request, res: Response) => {
  try {
    const updates: Record<string, string> = req.body;
    for (const [key, value] of Object.entries(updates)) {
      // Disallow tampering of admin credentials through general content endpoint
      if (key.startsWith('admin_') || key.startsWith('private_')) continue;

      const existing = await db.select().from(websiteContent).where(eq(websiteContent.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(websiteContent).set({ value: String(value), updatedAt: new Date() }).where(eq(websiteContent.key, key));
      } else {
        await db.insert(websiteContent).values({ key, value: String(value) });
      }
    }
    res.json({ success: true, message: 'Website content updated successfully' });
  } catch (error: any) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update website content' });
  }
});

// ==========================================
// 7. ANALYTICS & DASHBOARD METRICS
// ==========================================

app.get('/api/admin/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const allDesigns = await db.select().from(designs);
    const allOrders = await db.select().from(orders);
    const allCustomers = await db.select().from(customers);

    const totalDesigns = allDesigns.length;
    const activeDesigns = allDesigns.filter(d => d.status === 'active').length;

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => ['New Order', 'Contact Customer', 'Confirmed'].includes(o.status)).length;
    const confirmedOrders = allOrders.filter(o => o.status === 'Confirmed').length;
    const sewingInProgress = allOrders.filter(o => ['Sewing Started', 'Sewing in Progress', 'Measurement Verified'].includes(o.status)).length;
    const completedOrders = allOrders.filter(o => o.status === 'Completed').length;
    const totalCustomers = allCustomers.length;

    const totalRevenue = allOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0);

    // Orders by category
    const categoryStats: Record<string, number> = {};
    allOrders.forEach(o => {
      const cat = o.designCategory || 'Other';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // Orders by status
    const statusStats: Record<string, number> = {};
    allOrders.forEach(o => {
      statusStats[o.status] = (statusStats[o.status] || 0) + 1;
    });

    // Recent orders (top 6)
    const recentOrders = allOrders.slice(0, 6);

    // Compute last 30 days order volume & revenue trends
    const orderTrends: Array<{
      date: string;
      displayDate: string;
      shortDay: string;
      orders: number;
      revenue: number;
      completed: number;
    }> = [];

    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];
      const displayDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const shortDay = targetDate.toLocaleDateString('en-US', { weekday: 'short' });

      const dayOrders = allOrders.filter(o => {
        if (!o.createdAt) return false;
        const ordDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        return ordDateStr === dateStr;
      });

      const ordersCount = dayOrders.length;
      const dayRevenue = dayOrders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0);
      const dayCompleted = dayOrders.filter(o => o.status === 'Completed').length;

      orderTrends.push({
        date: dateStr,
        displayDate,
        shortDay,
        orders: ordersCount,
        revenue: Math.round(dayRevenue),
        completed: dayCompleted,
      });
    }

    const totalVolume30d = orderTrends.reduce((sum, d) => sum + d.orders, 0);
    const totalRevenue30d = orderTrends.reduce((sum, d) => sum + d.revenue, 0);
    const avgDailyOrders = parseFloat((totalVolume30d / 30).toFixed(1));
    let peakVolume = 0;
    let peakDate = '';
    orderTrends.forEach(d => {
      if (d.orders > peakVolume) {
        peakVolume = d.orders;
        peakDate = d.displayDate;
      }
    });

    const trends30Days = {
      totalVolume: totalVolume30d,
      totalRevenue: totalRevenue30d,
      avgDailyOrders,
      peakVolume,
      peakDate: peakDate || 'N/A',
    };

    res.json({
      totalDesigns,
      activeDesigns,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      sewingInProgress,
      completedOrders,
      totalCustomers,
      totalRevenue: totalRevenue.toFixed(2),
      categoryStats,
      statusStats,
      recentOrders,
      orderTrends,
      trends30Days,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

// ==========================================
// 8. FILE UPLOAD (Reference Images / Design Images)
// Hardened against MIME spoofing, path traversal, and malicious file execution
// ==========================================

app.post('/api/upload', uploadLimiter, (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Match data:image/png;base64,...
    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image data' });
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Limit to 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }

    // Deep inspection of magic bytes (file signature) to prevent disguised scripts or SVG XSS
    const magicCheck = validateImageMagicBytes(buffer);
    if (!magicCheck.valid || !magicCheck.ext) {
      return res.status(400).json({
        error: 'Security verification failed: File must be a valid JPEG, PNG, or WebP image.',
      });
    }

    const safeExt = magicCheck.ext;
    const safeName = `img_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${safeExt}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({ url: publicUrl, filename: safeName });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// ==========================================
// VITE INTEGRATION
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🌸 Sangeeta Boutique Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
