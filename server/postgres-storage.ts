import { eq } from 'drizzle-orm';
import { db } from './db';
import { 
  users, 
  quotes, 
  blogPosts, 
  faqs, 
  serviceAreas, 
  contacts, 
  galleryImages,
  siteSettings,
  servicePricing,
  promoCodes,
  adminSettings,
  imageAssets,
  colorThemes,
  type User, 
  type InsertUser,
  type Quote,
  type InsertQuote,
  type BlogPost,
  type InsertBlogPost,
  type FAQ,
  type InsertFAQ,
  type ServiceArea,
  type InsertServiceArea,
  type Contact,
  type InsertContact,
  type GalleryImage,
  type InsertGalleryImage,
  type SiteSetting,
  type InsertSiteSetting,
  type ServicePricing,
  type InsertServicePricing,
  type PromoCode,
  type InsertPromoCode,
  type AdminSetting,
  type InsertAdminSetting,
  type ImageAsset,
  type InsertImageAsset,
  type ColorTheme,
  type InsertColorTheme
} from "@shared/schema";
import { IStorage } from './storage';

export class PostgresStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Quotes
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const result = await db.insert(quotes).values(quote).returning();
    return result[0];
  }

  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(quotes.id);
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const result = await db.update(quotes).set({ status }).where(eq(quotes.id, id)).returning();
    return result[0];
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(blogPosts.id);
  }

  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.featured, true));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  // FAQs
  async getFAQs(): Promise<FAQ[]> {
    return await db.select().from(faqs).orderBy(faqs.id);
  }

  async createFAQ(faq: InsertFAQ): Promise<FAQ> {
    const result = await db.insert(faqs).values(faq).returning();
    return result[0];
  }

  async updateFAQ(id: number, updates: Partial<InsertFAQ>): Promise<FAQ | undefined> {
    const result = await db.update(faqs).set(updates).where(eq(faqs.id, id)).returning();
    return result[0];
  }

  async deleteFAQ(id: number): Promise<boolean> {
    const result = await db.delete(faqs).where(eq(faqs.id, id)).returning();
    return result.length > 0;
  }

  // Service Areas
  async getServiceAreas(): Promise<ServiceArea[]> {
    return await db.select().from(serviceAreas).orderBy(serviceAreas.id);
  }

  async createServiceArea(area: InsertServiceArea): Promise<ServiceArea> {
    const result = await db.insert(serviceAreas).values(area).returning();
    return result[0];
  }

  // Contacts
  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(contacts.id);
  }

  // Gallery
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(galleryImages.id);
  }

  async getFeaturedGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.featured, true));
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const result = await db.insert(galleryImages).values(image).returning();
    return result[0];
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(siteSettings.id);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    return result[0];
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(key);
    if (existing) {
      const result = await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key)).returning();
      return result[0];
    } else {
      const result = await db.insert(siteSettings).values({ key, value, category: 'general' }).returning();
      return result[0];
    }
  }

  async createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const result = await db.insert(siteSettings).values(setting).returning();
    return result[0];
  }

  // Service Pricing
  async getServicePricing(): Promise<ServicePricing[]> {
    return await db.select().from(servicePricing).orderBy(servicePricing.id);
  }

  async getServicePricingByKey(key: string): Promise<ServicePricing | undefined> {
    const result = await db.select().from(servicePricing).where(eq(servicePricing.serviceKey, key)).limit(1);
    return result[0];
  }

  async updateServicePricing(key: string, updates: Partial<InsertServicePricing>): Promise<ServicePricing> {
    const existing = await this.getServicePricingByKey(key);
    if (existing) {
      const result = await db.update(servicePricing).set(updates).where(eq(servicePricing.serviceKey, key)).returning();
      return result[0];
    } else {
      const result = await db.insert(servicePricing).values({ serviceKey: key, ...updates } as InsertServicePricing).returning();
      return result[0];
    }
  }

  async createServicePricing(pricing: InsertServicePricing): Promise<ServicePricing> {
    const result = await db.insert(servicePricing).values(pricing).returning();
    return result[0];
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodes).orderBy(promoCodes.id);
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
    return result[0];
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const result = await db.insert(promoCodes).values(promoCode).returning();
    return result[0];
  }

  async updatePromoCode(id: number, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const result = await db.update(promoCodes).set(updates).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }

  async deletePromoCode(id: number): Promise<boolean> {
    const result = await db.delete(promoCodes).where(eq(promoCodes.id, id)).returning();
    return result.length > 0;
  }

  async incrementPromoCodeUsage(id: number): Promise<PromoCode | undefined> {
    const result = await db.update(promoCodes).set({ usageCount: db.select().from(promoCodes).where(eq(promoCodes.id, id)) }).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }

  // Admin Settings
  async getAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings).orderBy(adminSettings.id);
  }

  async getAdminSettingByCode(code: string): Promise<AdminSetting | undefined> {
    const result = await db.select().from(adminSettings).where(eq(adminSettings.code, code)).limit(1);
    return result[0];
  }

  async createAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    const result = await db.insert(adminSettings).values(setting).returning();
    return result[0];
  }

  async updateAdminSetting(id: number, updates: Partial<InsertAdminSetting>): Promise<AdminSetting | undefined> {
    const result = await db.update(adminSettings).set(updates).where(eq(adminSettings.id, id)).returning();
    return result[0];
  }

  // Image Assets
  async getImageAssets(): Promise<ImageAsset[]> {
    return await db.select().from(imageAssets).orderBy(imageAssets.id);
  }

  async getImageAssetsByCategory(category: string): Promise<ImageAsset[]> {
    return await db.select().from(imageAssets).where(eq(imageAssets.category, category));
  }

  async getImageAssetByKey(key: string): Promise<ImageAsset | undefined> {
    const result = await db.select().from(imageAssets).where(eq(imageAssets.key, key)).limit(1);
    return result[0];
  }

  async createImageAsset(asset: InsertImageAsset): Promise<ImageAsset> {
    const result = await db.insert(imageAssets).values(asset).returning();
    return result[0];
  }

  async updateImageAsset(id: number, updates: Partial<InsertImageAsset>): Promise<ImageAsset | undefined> {
    const result = await db.update(imageAssets).set(updates).where(eq(imageAssets.id, id)).returning();
    return result[0];
  }

  async deleteImageAsset(id: number): Promise<boolean> {
    const result = await db.delete(imageAssets).where(eq(imageAssets.id, id)).returning();
    return result.length > 0;
  }

  // Color Themes
  async getColorThemes(): Promise<ColorTheme[]> {
    return await db.select().from(colorThemes).orderBy(colorThemes.id);
  }

  async getColorThemesByCategory(category: string): Promise<ColorTheme[]> {
    return await db.select().from(colorThemes).where(eq(colorThemes.category, category));
  }

  async getColorThemeByKey(key: string): Promise<ColorTheme | undefined> {
    const result = await db.select().from(colorThemes).where(eq(colorThemes.key, key)).limit(1);
    return result[0];
  }

  async createColorTheme(theme: InsertColorTheme): Promise<ColorTheme> {
    const result = await db.insert(colorThemes).values(theme).returning();
    return result[0];
  }

  async updateColorTheme(id: number, updates: Partial<InsertColorTheme>): Promise<ColorTheme | undefined> {
    const result = await db.update(colorThemes).set(updates).where(eq(colorThemes.id, id)).returning();
    return result[0];
  }

  async deleteColorTheme(id: number): Promise<boolean> {
    const result = await db.delete(colorThemes).where(eq(colorThemes.id, id)).returning();
    return result.length > 0;
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Check if data already exists
    const existingSettings = await this.getSiteSettings();
    if (existingSettings.length > 0) {
      return; // Data already initialized
    }

    // Initialize site settings
    const defaultSettings: InsertSiteSetting[] = [
      { key: "site_title", value: "Eco Clean Power Washing", category: "general" },
      { key: "site_description", value: "Professional Power Washing Services in Harrisburg & Mechanicsburg", category: "general" },
      { key: "phone_number", value: "(479) 399-8717", category: "contact" },
      { key: "email", value: "perfectpreasure@gmail.com", category: "contact" },
      { key: "address", value: "Harrisburg, PA", category: "contact" },
      { key: "service_area", value: "Harrisburg, Mechanicsburg, Camp Hill, Carlisle & Surrounding Areas", category: "general" },
      { key: "hero_title", value: "Professional Power Washing Services", category: "homepage" },
      { key: "hero_subtitle", value: "Transform your property with our eco-friendly cleaning solutions", category: "homepage" },
      { key: "cta_button_text", value: "Get Free Quote", category: "homepage" },
      { key: "about_title", value: "Why Choose Eco Clean?", category: "homepage" },
      { key: "about_description", value: "We provide professional, reliable, and eco-friendly power washing services that restore your property's beauty while protecting the environment.", category: "homepage" },
    ];

    for (const setting of defaultSettings) {
      await this.createSiteSetting(setting);
    }

    // Initialize service pricing
    const defaultPricing: InsertServicePricing[] = [
      { serviceKey: "house-washing", name: "House Washing", basePrice: 200, description: "Complete exterior house cleaning", requiresStories: true },
      { serviceKey: "driveway-cleaning", name: "Driveway Cleaning", basePrice: 150, description: "Concrete and asphalt driveway cleaning", requiresStories: false },
      { serviceKey: "deck-cleaning", name: "Deck Cleaning", basePrice: 175, description: "Wood and composite deck restoration", requiresStories: false },
      { serviceKey: "roof-cleaning", name: "Roof Cleaning", basePrice: 250, description: "Safe roof cleaning and moss removal", requiresStories: true },
      { serviceKey: "commercial-cleaning", name: "Commercial Cleaning", basePrice: 300, description: "Professional commercial property cleaning", requiresStories: true },
      { serviceKey: "gutter-cleaning", name: "Gutter Cleaning", basePrice: 125, description: "Complete gutter cleaning and maintenance", requiresStories: true },
      { serviceKey: "fence-cleaning", name: "Fence Cleaning", basePrice: 100, description: "Fence washing and restoration", requiresStories: false },
      { serviceKey: "patio-cleaning", name: "Patio Cleaning", basePrice: 125, description: "Patio and outdoor living space cleaning", requiresStories: false },
    ];

    for (const pricing of defaultPricing) {
      await this.createServicePricing(pricing);
    }

    // Initialize promo codes
    const defaultPromoCodes: InsertPromoCode[] = [
      { code: "SAVE10", discount: 10, isActive: true, usageLimit: 100, expiresAt: new Date('2025-12-31') },
      { code: "NEWCUSTOMER20", discount: 20, isActive: true, usageLimit: 50, expiresAt: new Date('2025-12-31') },
      { code: "SPRING25", discount: 25, isActive: true, usageLimit: 30, expiresAt: new Date('2025-06-30') },
    ];

    for (const promoCode of defaultPromoCodes) {
      await this.createPromoCode(promoCode);
    }

    // Initialize default image assets
    const defaultImages: InsertImageAsset[] = [
      { key: "hero_background", url: "/api/placeholder/1920/1080", altText: "Professional power washing service", category: "homepage", isActive: true },
      { key: "about_image", url: "/api/placeholder/600/400", altText: "Power washing equipment", category: "homepage", isActive: true },
      { key: "service_house", url: "/api/placeholder/400/300", altText: "House washing service", category: "services", isActive: true },
      { key: "service_driveway", url: "/api/placeholder/400/300", altText: "Driveway cleaning service", category: "services", isActive: true },
      { key: "service_deck", url: "/api/placeholder/400/300", altText: "Deck cleaning service", category: "services", isActive: true },
      { key: "logo", url: "/api/placeholder/200/100", altText: "Eco Clean Power Washing Logo", category: "branding", isActive: true },
    ];

    for (const image of defaultImages) {
      await this.createImageAsset(image);
    }

    // Initialize default color themes
    const defaultColors: InsertColorTheme[] = [
      { key: "primary", value: "#2563eb", category: "brand", description: "Primary brand color" },
      { key: "secondary", value: "#059669", category: "brand", description: "Secondary brand color" },
      { key: "accent", value: "#dc2626", category: "brand", description: "Accent color for highlights" },
      { key: "background", value: "#ffffff", category: "layout", description: "Main background color" },
      { key: "text_primary", value: "#1f2937", category: "layout", description: "Primary text color" },
      { key: "text_secondary", value: "#6b7280", category: "layout", description: "Secondary text color" },
      { key: "button_primary", value: "#2563eb", category: "interactive", description: "Primary button color" },
      { key: "button_hover", value: "#1d4ed8", category: "interactive", description: "Button hover color" },
    ];

    for (const color of defaultColors) {
      await this.createColorTheme(color);
    }

    // Initialize FAQs
    const defaultFAQs: InsertFAQ[] = [
      { question: "Is Soft Washing Safe For Plants?", answer: "Yes, we use eco-friendly cleaning solutions that are safe for your plants and landscaping." },
      { question: "How Often Should I Have My House Washed?", answer: "We recommend annual house washing to maintain your home's appearance and prevent damage from mold and mildew." },
      { question: "Do You Offer Free Estimates?", answer: "Yes, we provide free, no-obligation estimates for all our services." },
      { question: "What's Included in Your House Washing Service?", answer: "Our house washing service includes exterior walls, windows, gutters, and trim cleaning." },
      { question: "Are You Licensed and Insured?", answer: "Yes, we are fully licensed and insured for your peace of mind." },
    ];

    for (const faq of defaultFAQs) {
      await this.createFAQ(faq);
    }

    // Initialize blog posts
    const defaultBlogPosts: InsertBlogPost[] = [
      { 
        title: "Power Washing a Wooden Fence: A Complete Guide", 
        slug: "power-washing-wooden-fence-guide",
        excerpt: "Learn the best techniques for safely power washing your wooden fence without causing damage.",
        content: "Power washing a wooden fence requires careful technique and the right equipment. Here's your complete guide to achieving professional results...",
        author: "Eco Clean Team",
        featured: true,
        published: true
      },
      { 
        title: "Spring Cleaning: Why Your Driveway Needs Professional Attention", 
        slug: "spring-driveway-cleaning-guide",
        excerpt: "Discover why professional driveway cleaning is essential for maintaining your property's curb appeal.",
        content: "After a long winter, your driveway has likely accumulated dirt, stains, and debris. Professional cleaning can restore its appearance...",
        author: "Eco Clean Team",
        featured: true,
        published: true
      },
      { 
        title: "The Benefits of Regular House Washing", 
        slug: "benefits-regular-house-washing",
        excerpt: "Regular house washing isn't just about appearance – it's about protecting your investment.",
        content: "Many homeowners underestimate the importance of regular house washing. Beyond aesthetics, it provides significant benefits...",
        author: "Eco Clean Team",
        featured: false,
        published: true
      },
    ];

    for (const post of defaultBlogPosts) {
      await this.createBlogPost(post);
    }

    // Initialize gallery images
    const defaultGalleryImages: InsertGalleryImage[] = [
      { title: "House Washing Before & After", beforeImage: "/api/placeholder/400/300", afterImage: "/api/placeholder/400/300", description: "Complete house exterior transformation", featured: true },
      { title: "Driveway Restoration", beforeImage: "/api/placeholder/400/300", afterImage: "/api/placeholder/400/300", description: "Concrete driveway deep cleaning", featured: true },
      { title: "Deck Cleaning Project", beforeImage: "/api/placeholder/400/300", afterImage: "/api/placeholder/400/300", description: "Wood deck restoration and staining", featured: true },
    ];

    for (const image of defaultGalleryImages) {
      await this.createGalleryImage(image);
    }

    // Initialize service areas
    const defaultServiceAreas: InsertServiceArea[] = [
      { name: "Harrisburg", state: "PA", zipCode: "17101", isActive: true },
      { name: "Mechanicsburg", state: "PA", zipCode: "17055", isActive: true },
      { name: "Camp Hill", state: "PA", zipCode: "17011", isActive: true },
      { name: "Carlisle", state: "PA", zipCode: "17013", isActive: true },
    ];

    for (const area of defaultServiceAreas) {
      await this.createServiceArea(area);
    }
  }
}