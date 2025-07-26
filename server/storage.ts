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

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quotes
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotes(): Promise<Quote[]>;
  updateQuoteStatus(id: number, status: string): Promise<Quote | undefined>;
  
  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getFeaturedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // FAQs
  getFAQs(): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  updateFAQ(id: number, faq: Partial<InsertFAQ>): Promise<FAQ | undefined>;
  deleteFAQ(id: number): Promise<boolean>;
  
  // Service Areas
  getServiceAreas(): Promise<ServiceArea[]>;
  createServiceArea(area: InsertServiceArea): Promise<ServiceArea>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
  // Gallery
  getGalleryImages(): Promise<GalleryImage[]>;
  getFeaturedGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  
  // Site Settings
  getSiteSettings(): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  updateSiteSetting(key: string, value: string): Promise<SiteSetting>;
  createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  
  // Service Pricing
  getServicePricing(): Promise<ServicePricing[]>;
  getServicePricingByKey(key: string): Promise<ServicePricing | undefined>;
  updateServicePricing(key: string, updates: Partial<InsertServicePricing>): Promise<ServicePricing>;
  createServicePricing(pricing: InsertServicePricing): Promise<ServicePricing>;
  
  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
  incrementPromoCodeUsage(id: number): Promise<PromoCode | undefined>;
  
  // Admin Settings
  getAdminSettings(): Promise<AdminSetting[]>;
  getAdminSettingByCode(code: string): Promise<AdminSetting | undefined>;
  createAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  updateAdminSetting(id: number, updates: Partial<InsertAdminSetting>): Promise<AdminSetting | undefined>;
  
  // Image Assets
  getImageAssets(): Promise<ImageAsset[]>;
  getImageAssetsByCategory(category: string): Promise<ImageAsset[]>;
  getImageAssetByKey(key: string): Promise<ImageAsset | undefined>;
  createImageAsset(asset: InsertImageAsset): Promise<ImageAsset>;
  updateImageAsset(id: number, updates: Partial<InsertImageAsset>): Promise<ImageAsset | undefined>;
  deleteImageAsset(id: number): Promise<boolean>;
  
  // Color Themes
  getColorThemes(): Promise<ColorTheme[]>;
  getColorThemesByCategory(category: string): Promise<ColorTheme[]>;
  getColorThemeByKey(key: string): Promise<ColorTheme | undefined>;
  createColorTheme(theme: InsertColorTheme): Promise<ColorTheme>;
  updateColorTheme(id: number, updates: Partial<InsertColorTheme>): Promise<ColorTheme | undefined>;
  deleteColorTheme(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quotes: Map<number, Quote>;
  private blogPosts: Map<number, BlogPost>;
  private faqs: Map<number, FAQ>;
  private serviceAreas: Map<number, ServiceArea>;
  private contacts: Map<number, Contact>;
  private galleryImages: Map<number, GalleryImage>;
  private siteSettings: Map<string, SiteSetting>;
  private servicePricing: Map<string, ServicePricing>;
  private promoCodes: Map<number, PromoCode>;
  private adminSettings: Map<number, AdminSetting>;
  private imageAssets: Map<number, ImageAsset>;
  private colorThemes: Map<number, ColorTheme>;
  private currentUserId: number;
  private currentQuoteId: number;
  private currentBlogPostId: number;
  private currentFaqId: number;
  private currentServiceAreaId: number;
  private currentContactId: number;
  private currentGalleryImageId: number;
  private currentSiteSettingId: number;
  private currentServicePricingId: number;
  private currentPromoCodeId: number;
  private currentAdminSettingId: number;
  private currentImageAssetId: number;
  private currentColorThemeId: number;

  constructor() {
    this.users = new Map();
    this.quotes = new Map();
    this.blogPosts = new Map();
    this.faqs = new Map();
    this.serviceAreas = new Map();
    this.contacts = new Map();
    this.galleryImages = new Map();
    this.siteSettings = new Map();
    this.servicePricing = new Map();
    this.promoCodes = new Map();
    this.adminSettings = new Map();
    this.imageAssets = new Map();
    this.colorThemes = new Map();
    this.currentUserId = 1;
    this.currentQuoteId = 1;
    this.currentBlogPostId = 1;
    this.currentFaqId = 1;
    this.currentServiceAreaId = 1;
    this.currentContactId = 1;
    this.currentGalleryImageId = 1;
    this.currentSiteSettingId = 1;
    this.currentServicePricingId = 1;
    this.currentPromoCodeId = 1;
    this.currentAdminSettingId = 1;
    this.currentImageAssetId = 1;
    this.currentColorThemeId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize FAQs
    const defaultFAQs: InsertFAQ[] = [
      {
        question: "Is Soft Washing Safe For Plants?",
        answer: "Yes, soft washing is safe for plants if it is performed correctly and safely. Our eco-friendly approach protects your landscaping while effectively cleaning your home's exterior.",
        order: 1,
        active: true,
      },
      {
        question: "How Long Does It Take To Pressure Wash a Driveway?",
        answer: "Most normal 2 car driveways take roughly 45 minutes using our concrete pressure washing machine.",
        order: 2,
        active: true,
      },
      {
        question: "Is Pressure Washing Safe For House Washing?",
        answer: "Compared to soft washing, pressure washing is not considered safe for your house. Pressure washing can cause leaks in windows, and damage the color of the surface being washed. This is why we recommend soft washing for cleaning houses.",
        order: 3,
        active: true,
      },
      {
        question: "How Much Does It Cost To Wash A House?",
        answer: "The average price to wash a normal two-story house is $400. Use our cost calculator for a more accurate estimate based on your specific needs.",
        order: 4,
        active: true,
      },
      {
        question: "What Methods Of Payment Do You Accept?",
        answer: "Eco Clean Power Washing accepts all forms of payment including cash, check, and all major credit cards.",
        order: 5,
        active: true,
      },
    ];

    defaultFAQs.forEach(faq => this.createFAQ(faq));

    // Initialize Service Areas
    const defaultServiceAreas: InsertServiceArea[] = [
      { name: "Harrisburg", slug: "harrisburg", description: "Professional power washing services in Harrisburg, PA", active: true },
      { name: "Mechanicsburg", slug: "mechanicsburg", description: "Expert cleaning services in Mechanicsburg, PA", active: true },
      { name: "Camp Hill", slug: "camp-hill", description: "Residential and commercial cleaning in Camp Hill, PA", active: true },
      { name: "Carlisle", slug: "carlisle", description: "Power washing services in Carlisle, PA", active: true },
      { name: "New Cumberland", slug: "new-cumberland", description: "Exterior cleaning services in New Cumberland, PA", active: true },
      { name: "Enola", slug: "enola", description: "House washing and pressure washing in Enola, PA", active: true },
      { name: "Lemoyne", slug: "lemoyne", description: "Professional cleaning services in Lemoyne, PA", active: true },
      { name: "Middletown", slug: "middletown", description: "Power washing services in Middletown, PA", active: true },
      { name: "Hummelstown", slug: "hummelstown", description: "Exterior cleaning in Hummelstown, PA", active: true },
      { name: "Boiling Springs", slug: "boiling-springs", description: "Cleaning services in Boiling Springs, PA", active: true },
      { name: "Wormleysburg", slug: "wormleysburg", description: "Power washing in Wormleysburg, PA", active: true },
      { name: "Steelton", slug: "steelton", description: "Professional cleaning services in Steelton, PA", active: true },
    ];

    defaultServiceAreas.forEach(area => this.createServiceArea(area));

    // Initialize Blog Posts
    const defaultBlogPosts: InsertBlogPost[] = [
      {
        title: "Power Washing a Wooden Fence",
        slug: "power-washing-wooden-fence",
        excerpt: "Watch how professional pressure washing can transform your wooden fence in Middletown, PA. See the difference in just one minute with our expert fence cleaning services!",
        content: "Watch how professional pressure washing can transform your wooden fence in Middletown, PA. See the difference in just one minute with our expert fence cleaning services!",
        image: "https://lirp.cdn-website.com/6c98a53d/dms3rep/multi/opt/PRESSURE+WASHING+A+WOODEN+FENCE-1920w.png",
        author: "Nevin Shields",
        featured: true,
      },
      {
        title: "Roof Cleaning Demo | Eco Clean",
        slug: "roof-cleaning-demo-eco-clean",
        excerpt: "If you've noticed black streaks, moss, or algae on your roof in Mechanicsburg, PA, you're not alone. These unsightly stains are more than just cosmetic — they can shorten the lifespan of your shingles and even affect your home insurance.",
        content: "If you've noticed black streaks, moss, or algae on your roof in Mechanicsburg, PA, you're not alone. These unsightly stains are more than just cosmetic — they can shorten the lifespan of your shingles and even affect your home insurance. That's why more homeowners are turning to professional roof cleaning services like Eco Clean Power Washing to safely restore their roofs.",
        image: "https://lirp.cdn-website.com/6c98a53d/dms3rep/multi/opt/IMG_1844-1920w.jpg",
        author: "Nevin Shields",
        featured: true,
      },
      {
        title: "Full Exterior Cleaning Service in Camp Hill",
        slug: "full-exterior-cleaning-service-camp-hill",
        excerpt: "See how Eco Clean Power Washing restored a Camp Hill, PA property with driveway cleaning, gutter brightening, deck washing, and more. Full exterior transformation!",
        content: "See how Eco Clean Power Washing restored a Camp Hill, PA property with driveway cleaning, gutter brightening, deck washing, and more. Full exterior transformation!",
        image: "https://lirp.cdn-website.com/6c98a53d/dms3rep/multi/opt/IMG_1663-1920w.jpg",
        author: "Nevin Shields",
        featured: true,
      },
    ];

    defaultBlogPosts.forEach(post => this.createBlogPost(post));

    // Initialize Gallery Images
    const defaultGalleryImages: InsertGalleryImage[] = [
      {
        title: "House Washing Before & After",
        beforeImage: "https://lirp.cdn-website.com/27a33988/dms3rep/multi/opt/IMG_0762-1920w.JPG",
        afterImage: "https://lirp.cdn-website.com/27a33988/dms3rep/multi/opt/IMG_0763-8670e297-70943cb1-1920w.JPG",
        description: "Complete house washing transformation",
        featured: true,
        order: 1,
      },
      {
        title: "Deck Cleaning Transformation",
        beforeImage: "https://lirp.cdn-website.com/27a33988/dms3rep/multi/opt/146274618_3601086496654898_6312641077567797856_n-1efd4695-1920w.jpg",
        afterImage: "https://lirp.cdn-website.com/27a33988/dms3rep/multi/opt/146274618_3601086496654898_6312641077567797856_n-bfe514c6-1920w.jpg",
        description: "Wooden deck restoration",
        featured: true,
        order: 2,
      },
      {
        title: "Concrete Walkway Cleaning",
        beforeImage: "https://lirp.cdn-website.com/27a33988/dms3rep/multi/opt/146087791_3601086976654850_4601059488513042451_n%2B-281-29-1920w.jpg",
        afterImage: "https://lirp.cdn-website.com/27a33988/dms3rep/multi/opt/146087791_3601086976654850_4601059488513042451_n-2B-281-29-1920w.jpg",
        description: "Concrete pressure washing results",
        featured: true,
        order: 3,
      },
    ];

    defaultGalleryImages.forEach(image => this.createGalleryImage(image));

    // Initialize Site Settings
    const defaultSiteSettings: InsertSiteSetting[] = [
      { key: "site_title", value: "Eco Clean Power Washing", type: "text", category: "general", description: "Main site title" },
      { key: "site_subtitle", value: "Professional Power Washing Services", type: "text", category: "general", description: "Site subtitle" },
      { key: "hero_title", value: "POWER WASHING SERVICE IN Harrisburg & Mechanicsburg", type: "text", category: "hero", description: "Hero section title" },
      { key: "hero_subtitle", value: "Professional Eco-Friendly Power Washing Services", type: "text", category: "hero", description: "Hero section subtitle" },
      { key: "phone_number", value: "(479) 399-8717", type: "text", category: "contact", description: "Primary phone number" },
      { key: "email", value: "perfectpreasure@gmail.com", type: "text", category: "contact", description: "Primary email address" },
      { key: "service_area", value: "Harrisburg, Mechanicsburg, Camp Hill, Carlisle & Surrounding Areas", type: "text", category: "contact", description: "Service area description" },
      { key: "company_description", value: "Professional power washing services in Harrisburg, Mechanicsburg, and surrounding areas. Eco-friendly cleaning solutions for your home and business.", type: "text", category: "general", description: "Company description" },
      { key: "team_description", value: "Meet Nevin and Terrance, the dynamic duo behind Eco Clean Power Washing! Specializing in pressure and soft washing, they're dedicated to revitalizing homes in Harrisburg and Mechanicsburg.", type: "text", category: "team", description: "Team section description" },
      { key: "quote_form_title", value: "Get A Free Quote!", type: "text", category: "forms", description: "Quote form title" },
      { key: "contact_form_title", value: "Send Us A Message", type: "text", category: "forms", description: "Contact form title" },
      { key: "services_section_title", value: "HOW CAN WE HELP YOU TODAY?", type: "text", category: "services", description: "Services section title" },
      { key: "process_section_title", value: "How Our System Works:", type: "text", category: "process", description: "Process section title" },
      { key: "gallery_section_title", value: "Before & After Gallery", type: "text", category: "gallery", description: "Gallery section title" },
      { key: "faq_section_title", value: "Eco Clean Power Washing FAQ's", type: "text", category: "faq", description: "FAQ section title" },
      { key: "blog_section_title", value: "Latest Blog Posts", type: "text", category: "blog", description: "Blog section title" },
    ];

    defaultSiteSettings.forEach(setting => this.createSiteSetting(setting));

    // Initialize Service Pricing
    const defaultServicePricing: InsertServicePricing[] = [
      { serviceKey: "house-washing", name: "House Washing", basePrice: 200, enabled: true, requiresStories: true, description: "Professional soft washing for home exteriors" },
      { serviceKey: "pressure-washing", name: "Pressure Washing", basePrice: 150, enabled: true, requiresStories: false, description: "High-pressure cleaning for hard surfaces" },
      { serviceKey: "roof-cleaning", name: "Roof Cleaning", basePrice: 300, enabled: true, requiresStories: true, description: "Safe roof cleaning and maintenance" },
      { serviceKey: "gutter-cleaning", name: "Gutter Cleaning", basePrice: 100, enabled: true, requiresStories: true, description: "Complete gutter cleaning services" },
      { serviceKey: "deck-cleaning", name: "Deck Cleaning", basePrice: 150, enabled: true, requiresStories: false, description: "Deck and fence cleaning" },
      { serviceKey: "commercial-cleaning", name: "Commercial Cleaning", basePrice: 250, enabled: true, requiresStories: false, description: "Commercial property cleaning" },
    ];

    defaultServicePricing.forEach(pricing => this.createServicePricing(pricing));

    // Initialize admin settings
    const defaultAdminSettings: InsertAdminSetting[] = [
      { accessCode: "admin2025", isActive: true },
    ];
    defaultAdminSettings.forEach(setting => this.createAdminSetting(setting));

    // Initialize default promo codes
    const defaultPromoCodes: InsertPromoCode[] = [
      { code: "SAVE10", discount: 10, isActive: true, usageLimit: 100, expiresAt: new Date("2025-12-31") },
      { code: "NEWCUSTOMER20", discount: 20, isActive: true, usageLimit: 50, expiresAt: new Date("2025-12-31") },
    ];
    defaultPromoCodes.forEach(code => this.createPromoCode(code));

    // Initialize default image assets
    const defaultImageAssets: InsertImageAsset[] = [
      { key: "hero_background", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80", altText: "Professional power washing service", category: "hero", isActive: true },
      { key: "company_logo", url: "https://lirp.cdn-website.com/27a33988/dms3rep/multi/opt/Eco+Clean+Logo-141w.PNG", altText: "Eco Clean Power Washing Logo", category: "logo", isActive: true },
      { key: "team_photo", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80", altText: "Professional cleaning team", category: "team", isActive: true },
    ];
    defaultImageAssets.forEach(asset => this.createImageAsset(asset));

    // Initialize default color themes
    const defaultColorThemes: InsertColorTheme[] = [
      { key: "primary", value: "#2563eb", category: "primary", description: "Main brand color" },
      { key: "secondary", value: "#64748b", category: "secondary", description: "Secondary brand color" },
      { key: "accent", value: "#059669", category: "accent", description: "Accent color for highlights" },
      { key: "background", value: "#ffffff", category: "background", description: "Main background color" },
      { key: "text", value: "#111827", category: "text", description: "Primary text color" },
    ];
    defaultColorThemes.forEach(theme => this.createColorTheme(theme));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const quote: Quote = { 
      ...insertQuote, 
      id, 
      status: "pending",
      createdAt: new Date(),
      message: insertQuote.message || null
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (quote) {
      quote.status = status;
      this.quotes.set(id, quote);
      return quote;
    }
    return undefined;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort((a, b) => 
      (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0)
    );
  }

  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.featured)
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const blogPost: BlogPost = { 
      ...insertBlogPost, 
      id, 
      publishedAt: new Date(),
      image: insertBlogPost.image || null,
      featured: insertBlogPost.featured || null
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  async getFAQs(): Promise<FAQ[]> {
    return Array.from(this.faqs.values())
      .filter(faq => faq.active)
      .sort((a, b) => a.order - b.order);
  }

  async createFAQ(insertFAQ: InsertFAQ): Promise<FAQ> {
    const id = this.currentFaqId++;
    const faq: FAQ = { 
      ...insertFAQ, 
      id,
      order: insertFAQ.order || 0,
      active: insertFAQ.active || null
    };
    this.faqs.set(id, faq);
    return faq;
  }

  async updateFAQ(id: number, updates: Partial<InsertFAQ>): Promise<FAQ | undefined> {
    const faq = this.faqs.get(id);
    if (faq) {
      Object.assign(faq, updates);
      this.faqs.set(id, faq);
      return faq;
    }
    return undefined;
  }

  async deleteFAQ(id: number): Promise<boolean> {
    return this.faqs.delete(id);
  }

  async getServiceAreas(): Promise<ServiceArea[]> {
    return Array.from(this.serviceAreas.values())
      .filter(area => area.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createServiceArea(insertServiceArea: InsertServiceArea): Promise<ServiceArea> {
    const id = this.currentServiceAreaId++;
    const serviceArea: ServiceArea = { 
      ...insertServiceArea, 
      id,
      description: insertServiceArea.description || null,
      active: insertServiceArea.active || null
    };
    this.serviceAreas.set(id, serviceArea);
    return serviceArea;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt: new Date(),
      phone: insertContact.phone || null
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values()).sort((a, b) => a.order - b.order);
  }

  async getFeaturedGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values())
      .filter(image => image.featured)
      .sort((a, b) => a.order - b.order);
  }

  async createGalleryImage(insertGalleryImage: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.currentGalleryImageId++;
    const galleryImage: GalleryImage = { 
      ...insertGalleryImage, 
      id,
      order: insertGalleryImage.order || 0,
      description: insertGalleryImage.description || null,
      featured: insertGalleryImage.featured || null
    };
    this.galleryImages.set(id, galleryImage);
    return galleryImage;
  }

  // Site Settings methods
  async getSiteSettings(): Promise<SiteSetting[]> {
    return Array.from(this.siteSettings.values());
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.siteSettings.get(key);
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const existing = this.siteSettings.get(key);
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date();
      this.siteSettings.set(key, existing);
      return existing;
    }
    
    // Create new setting if it doesn't exist
    const newSetting: SiteSetting = {
      id: this.currentSiteSettingId++,
      key,
      value,
      type: "text",
      category: "general",
      description: null,
      updatedAt: new Date()
    };
    this.siteSettings.set(key, newSetting);
    return newSetting;
  }

  async createSiteSetting(insertSiteSetting: InsertSiteSetting): Promise<SiteSetting> {
    const id = this.currentSiteSettingId++;
    const siteSetting: SiteSetting = {
      ...insertSiteSetting,
      id,
      type: insertSiteSetting.type || "text",
      category: insertSiteSetting.category || "general",
      description: insertSiteSetting.description || null,
      updatedAt: new Date()
    };
    this.siteSettings.set(siteSetting.key, siteSetting);
    return siteSetting;
  }

  // Service Pricing methods
  async getServicePricing(): Promise<ServicePricing[]> {
    return Array.from(this.servicePricing.values())
      .filter(pricing => pricing.enabled)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getServicePricingByKey(key: string): Promise<ServicePricing | undefined> {
    return this.servicePricing.get(key);
  }

  async updateServicePricing(key: string, updates: Partial<InsertServicePricing>): Promise<ServicePricing> {
    const existing = this.servicePricing.get(key);
    if (existing) {
      Object.assign(existing, updates, { updatedAt: new Date() });
      this.servicePricing.set(key, existing);
      return existing;
    }
    throw new Error(`Service pricing not found: ${key}`);
  }

  async createServicePricing(insertServicePricing: InsertServicePricing): Promise<ServicePricing> {
    const id = this.currentServicePricingId++;
    const servicePricing: ServicePricing = {
      ...insertServicePricing,
      id,
      description: insertServicePricing.description || null,
      enabled: insertServicePricing.enabled || null,
      requiresStories: insertServicePricing.requiresStories || null,
      updatedAt: new Date()
    };
    this.servicePricing.set(servicePricing.serviceKey, servicePricing);
    return servicePricing;
  }

  // Promo Code methods
  async getPromoCodes(): Promise<PromoCode[]> {
    return Array.from(this.promoCodes.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    return Array.from(this.promoCodes.values()).find(pc => pc.code === code);
  }

  async createPromoCode(insertPromoCode: InsertPromoCode): Promise<PromoCode> {
    const id = this.currentPromoCodeId++;
    const promoCode: PromoCode = {
      ...insertPromoCode,
      id,
      usageCount: 0,
      createdAt: new Date(),
      expiresAt: insertPromoCode.expiresAt || null,
      usageLimit: insertPromoCode.usageLimit || null,
      isActive: insertPromoCode.isActive ?? true,
    };
    this.promoCodes.set(id, promoCode);
    return promoCode;
  }

  async updatePromoCode(id: number, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const existing = this.promoCodes.get(id);
    if (existing) {
      Object.assign(existing, updates);
      this.promoCodes.set(id, existing);
      return existing;
    }
    return undefined;
  }

  async deletePromoCode(id: number): Promise<boolean> {
    return this.promoCodes.delete(id);
  }

  async incrementPromoCodeUsage(id: number): Promise<PromoCode | undefined> {
    const promoCode = this.promoCodes.get(id);
    if (promoCode) {
      promoCode.usageCount++;
      this.promoCodes.set(id, promoCode);
      return promoCode;
    }
    return undefined;
  }

  // Admin Settings methods
  async getAdminSettings(): Promise<AdminSetting[]> {
    return Array.from(this.adminSettings.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAdminSettingByCode(code: string): Promise<AdminSetting | undefined> {
    return Array.from(this.adminSettings.values()).find(as => as.accessCode === code);
  }

  async createAdminSetting(insertAdminSetting: InsertAdminSetting): Promise<AdminSetting> {
    const id = this.currentAdminSettingId++;
    const adminSetting: AdminSetting = {
      ...insertAdminSetting,
      id,
      createdAt: new Date(),
      isActive: insertAdminSetting.isActive ?? true,
    };
    this.adminSettings.set(id, adminSetting);
    return adminSetting;
  }

  async updateAdminSetting(id: number, updates: Partial<InsertAdminSetting>): Promise<AdminSetting | undefined> {
    const existing = this.adminSettings.get(id);
    if (existing) {
      Object.assign(existing, updates);
      this.adminSettings.set(id, existing);
      return existing;
    }
    return undefined;
  }

  // Image Asset methods
  async getImageAssets(): Promise<ImageAsset[]> {
    return Array.from(this.imageAssets.values())
      .filter(asset => asset.isActive)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getImageAssetsByCategory(category: string): Promise<ImageAsset[]> {
    return Array.from(this.imageAssets.values())
      .filter(asset => asset.category === category && asset.isActive)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getImageAssetByKey(key: string): Promise<ImageAsset | undefined> {
    return Array.from(this.imageAssets.values()).find(asset => asset.key === key);
  }

  async createImageAsset(insertImageAsset: InsertImageAsset): Promise<ImageAsset> {
    const id = this.currentImageAssetId++;
    const imageAsset: ImageAsset = {
      ...insertImageAsset,
      id,
      altText: insertImageAsset.altText || null,
      updatedAt: new Date(),
      isActive: insertImageAsset.isActive ?? true,
    };
    this.imageAssets.set(id, imageAsset);
    return imageAsset;
  }

  async updateImageAsset(id: number, updates: Partial<InsertImageAsset>): Promise<ImageAsset | undefined> {
    const existing = this.imageAssets.get(id);
    if (existing) {
      Object.assign(existing, updates, { updatedAt: new Date() });
      this.imageAssets.set(id, existing);
      return existing;
    }
    return undefined;
  }

  async deleteImageAsset(id: number): Promise<boolean> {
    return this.imageAssets.delete(id);
  }

  // Color Theme methods
  async getColorThemes(): Promise<ColorTheme[]> {
    return Array.from(this.colorThemes.values())
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  async getColorThemesByCategory(category: string): Promise<ColorTheme[]> {
    return Array.from(this.colorThemes.values())
      .filter(theme => theme.category === category)
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  async getColorThemeByKey(key: string): Promise<ColorTheme | undefined> {
    return Array.from(this.colorThemes.values()).find(theme => theme.key === key);
  }

  async createColorTheme(insertColorTheme: InsertColorTheme): Promise<ColorTheme> {
    const id = this.currentColorThemeId++;
    const colorTheme: ColorTheme = {
      ...insertColorTheme,
      id,
      description: insertColorTheme.description || null,
      updatedAt: new Date(),
    };
    this.colorThemes.set(id, colorTheme);
    return colorTheme;
  }

  async updateColorTheme(id: number, updates: Partial<InsertColorTheme>): Promise<ColorTheme | undefined> {
    const existing = this.colorThemes.get(id);
    if (existing) {
      Object.assign(existing, updates, { updatedAt: new Date() });
      this.colorThemes.set(id, existing);
      return existing;
    }
    return undefined;
  }

  async deleteColorTheme(id: number): Promise<boolean> {
    return this.colorThemes.delete(id);
  }
}

import { PostgresStorage } from './postgres-storage';

export const storage = new PostgresStorage();
