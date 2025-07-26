import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  service: text("service").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  author: text("author").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  featured: boolean("featured").default(false),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").notNull().default(0),
  active: boolean("active").default(true),
});

export const serviceAreas = pgTable("service_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  active: boolean("active").default(true),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  beforeImage: text("before_image").notNull(),
  afterImage: text("after_image").notNull(),
  description: text("description"),
  featured: boolean("featured").default(false),
  order: integer("order").notNull().default(0),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull().default("text"), // text, number, boolean, json
  category: text("category").notNull().default("general"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const servicePricing = pgTable("service_pricing", {
  id: serial("id").primaryKey(),
  serviceKey: text("service_key").notNull().unique(),
  name: text("name").notNull(),
  basePrice: integer("base_price").notNull(),
  enabled: boolean("enabled").default(true),
  requiresStories: boolean("requires_stories").default(false),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: integer("discount").notNull(), // percentage discount
  isActive: boolean("is_active").notNull().default(true),
  usageLimit: integer("usage_limit"), // null = unlimited
  usageCount: integer("usage_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  accessCode: text("access_code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const imageAssets = pgTable("image_assets", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  category: text("category").notNull(), // "hero", "gallery", "team", "logo", etc.
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const colorThemes = pgTable("color_themes", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull(), // "primary", "secondary", "accent", etc.
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
});

export const insertServiceAreaSchema = createInsertSchema(serviceAreas).omit({
  id: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertServicePricingSchema = createInsertSchema(servicePricing).omit({
  id: true,
  updatedAt: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  usageCount: true,
  createdAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
});

export const insertImageAssetSchema = createInsertSchema(imageAssets).omit({
  id: true,
  updatedAt: true,
});

export const insertColorThemeSchema = createInsertSchema(colorThemes).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;
export type ServiceArea = typeof serviceAreas.$inferSelect;
export type InsertServiceArea = z.infer<typeof insertServiceAreaSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type ServicePricing = typeof servicePricing.$inferSelect;
export type InsertServicePricing = z.infer<typeof insertServicePricingSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type ImageAsset = typeof imageAssets.$inferSelect;
export type InsertImageAsset = z.infer<typeof insertImageAssetSchema>;
export type ColorTheme = typeof colorThemes.$inferSelect;
export type InsertColorTheme = z.infer<typeof insertColorThemeSchema>;
