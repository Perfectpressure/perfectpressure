import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertQuoteSchema, insertContactSchema, insertPromoCodeSchema, insertAdminSettingSchema, insertImageAssetSchema, insertColorThemeSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// WebSocket clients for real-time updates
const wsClients = new Set<WebSocket>();

function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Quote endpoints
  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create quote" });
      }
    }
  });

  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Contact endpoints
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Blog endpoints
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/featured", async (req, res) => {
    try {
      const posts = await storage.getFeaturedBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // FAQ endpoints
  app.get("/api/faqs", async (req, res) => {
    try {
      const faqs = await storage.getFAQs();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  // Service Areas endpoints
  app.get("/api/service-areas", async (req, res) => {
    try {
      const serviceAreas = await storage.getServiceAreas();
      res.json(serviceAreas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service areas" });
    }
  });

  // Gallery endpoints
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/gallery/featured", async (req, res) => {
    try {
      const images = await storage.getFeaturedGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured gallery images" });
    }
  });

  // Image assets endpoints
  app.get("/api/image-assets", async (req, res) => {
    try {
      const imageAssets = await storage.getImageAssets();
      res.json(imageAssets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch image assets" });
    }
  });

  app.get("/api/image-assets/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const imageAssets = await storage.getImageAssetsByCategory(category);
      res.json(imageAssets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch image assets by category" });
    }
  });

  // Cost calculator endpoint
  app.post("/api/calculate-cost", async (req, res) => {
    const calculatorSchema = z.object({
      service: z.string(),
      squareFootage: z.number(),
      stories: z.string().optional(),
      extras: z.array(z.string()).optional(),
      promoCode: z.string().optional(),
    });

    try {
      const data = calculatorSchema.parse(req.body);
      const { service, squareFootage, stories, extras = [], promoCode } = data;

      // Get service pricing
      const servicePricing = await storage.getServicePricingByKey(service);
      if (!servicePricing) {
        return res.status(400).json({ message: "Invalid service selected" });
      }

      const basePrice = servicePricing.basePrice;
      
      // Calculate size factor (based on square footage)
      const sizeFactor = Math.max(1, Math.ceil(squareFootage / 1000));
      
      // Calculate story multiplier
      let storyMultiplier = 1;
      if (stories && parseInt(stories) > 1) {
        storyMultiplier = 1 + (parseInt(stories) - 1) * 0.5; // 50% increase per additional story
      }
      
      // Calculate extras total
      let extrasTotal = 0;
      for (const extra of extras) {
        const extraPricing = await storage.getServicePricingByKey(extra);
        if (extraPricing) {
          extrasTotal += extraPricing.basePrice * 0.5; // 50% of base price for extras
        }
      }
      
      // Calculate subtotal
      const subtotal = Math.round((basePrice * sizeFactor * storyMultiplier) + extrasTotal);
      
      // Apply promo code if provided
      let discount = 0;
      let discountAmount = 0;
      if (promoCode && promoCode.trim() !== "") {
        // Check if it's the admin access code - handle it specially
        if (promoCode === "ADMIN2025") {
          // Return a special response for admin access
          return res.json({
            basePrice,
            sizeFactor,
            storyMultiplier,
            extrasTotal,
            subtotal,
            discount: 0,
            discountAmount: 0,
            totalCost: subtotal,
            promoCode: "ADMIN2025",
            adminAccess: true
          });
        }
        
        const promo = await storage.getPromoCodeByCode(promoCode);
        if (!promo || !promo.isActive) {
          return res.status(400).json({ message: "Invalid promo code" });
        }
        
        const now = new Date();
        const isExpired = promo.expiresAt && promo.expiresAt < now;
        const isUsageLimitReached = promo.usageLimit && promo.usageCount >= promo.usageLimit;
        
        if (isExpired) {
          return res.status(400).json({ message: "Invalid promo code" });
        }
        
        if (isUsageLimitReached) {
          return res.status(400).json({ message: "Invalid promo code" });
        }
        
        discount = promo.discount;
        discountAmount = Math.round(subtotal * (discount / 100));
      }
      
      const totalCost = subtotal - discountAmount;
      
      res.json({
        basePrice,
        sizeFactor,
        storyMultiplier,
        extrasTotal,
        subtotal,
        discount,
        discountAmount,
        totalCost,
        promoCode: promoCode || null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid calculation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to calculate cost" });
      }
    }
  });

  // Admin - Site Settings endpoints
  app.get("/api/admin/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.put("/api/admin/site-settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.updateSiteSetting(key, value);
      
      // Broadcast update to all connected clients
      broadcastUpdate("site-setting-updated", setting);
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update site setting" });
    }
  });

  // Admin - Service Pricing endpoints
  app.get("/api/admin/service-pricing", async (req, res) => {
    try {
      const pricing = await storage.getServicePricing();
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service pricing" });
    }
  });

  app.put("/api/admin/service-pricing/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const updates = req.body;
      const pricing = await storage.updateServicePricing(key, updates);
      
      // Broadcast update to all connected clients
      broadcastUpdate("service-pricing-updated", pricing);
      
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service pricing" });
    }
  });



  // Promo code endpoints
  app.get("/api/admin/promo-codes", async (req, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/admin/promo-codes", async (req, res) => {
    try {
      const promoCodeData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(promoCodeData);
      
      // Broadcast update to all connected clients
      broadcastUpdate("promo-code-created", promoCode);
      
      res.json(promoCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid promo code data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create promo code" });
      }
    }
  });

  app.put("/api/admin/promo-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const promoCode = await storage.updatePromoCode(id, updates);
      
      if (promoCode) {
        // Broadcast update to all connected clients
        broadcastUpdate("promo-code-updated", promoCode);
        res.json(promoCode);
      } else {
        res.status(404).json({ message: "Promo code not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update promo code" });
    }
  });

  app.delete("/api/admin/promo-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePromoCode(id);
      
      if (deleted) {
        // Broadcast update to all connected clients
        broadcastUpdate("promo-code-deleted", { id });
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Promo code not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete promo code" });
    }
  });

  // Image asset endpoints
  app.get("/api/admin/image-assets", async (req, res) => {
    try {
      const imageAssets = await storage.getImageAssets();
      res.json(imageAssets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch image assets" });
    }
  });

  app.get("/api/admin/image-assets/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const imageAssets = await storage.getImageAssetsByCategory(category);
      res.json(imageAssets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch image assets by category" });
    }
  });

  // File upload endpoint for page builder
  app.post("/api/admin/image-assets/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { category, key } = req.body;
      if (!category || !key) {
        return res.status(400).json({ message: "Category and key are required" });
      }

      // Check if image asset already exists and update it, otherwise create new one
      const existingAsset = await storage.getImageAssetByKey(key);
      
      let imageAsset;
      if (existingAsset) {
        // Update existing asset
        imageAsset = await storage.updateImageAsset(existingAsset.id, {
          url: `/uploads/${req.file.filename}`,
          category: category,
          altText: `Uploaded image for ${key}`
        });
      } else {
        // Create new asset
        const imageAssetData = {
          key: key,
          url: `/uploads/${req.file.filename}`,
          category: category,
          altText: `Uploaded image for ${key}`
        };
        imageAsset = await storage.createImageAsset(imageAssetData);
      }
      
      // Broadcast update to all connected clients
      broadcastUpdate("image-asset-created", imageAsset);
      
      res.json(imageAsset);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.post("/api/admin/image-assets", async (req, res) => {
    try {
      const imageAssetData = insertImageAssetSchema.parse(req.body);
      const imageAsset = await storage.createImageAsset(imageAssetData);
      
      // Broadcast update to all connected clients
      broadcastUpdate("image-asset-created", imageAsset);
      
      res.json(imageAsset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid image asset data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create image asset" });
      }
    }
  });

  app.put("/api/admin/image-assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const imageAsset = await storage.updateImageAsset(id, updates);
      
      if (imageAsset) {
        // Broadcast update to all connected clients
        broadcastUpdate("image-asset-updated", imageAsset);
        res.json(imageAsset);
      } else {
        res.status(404).json({ message: "Image asset not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update image asset" });
    }
  });

  app.delete("/api/admin/image-assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteImageAsset(id);
      
      if (deleted) {
        // Broadcast update to all connected clients
        broadcastUpdate("image-asset-deleted", { id });
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Image asset not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image asset" });
    }
  });

  // Color theme endpoints
  app.get("/api/admin/color-themes", async (req, res) => {
    try {
      const colorThemes = await storage.getColorThemes();
      res.json(colorThemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch color themes" });
    }
  });

  app.post("/api/admin/color-themes", async (req, res) => {
    try {
      const colorThemeData = insertColorThemeSchema.parse(req.body);
      const colorTheme = await storage.createColorTheme(colorThemeData);
      
      // Broadcast update to all connected clients
      broadcastUpdate("color-theme-created", colorTheme);
      
      res.json(colorTheme);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid color theme data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create color theme" });
      }
    }
  });

  app.put("/api/admin/color-themes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const colorTheme = await storage.updateColorTheme(id, updates);
      
      if (colorTheme) {
        // Broadcast update to all connected clients
        broadcastUpdate("color-theme-updated", colorTheme);
        res.json(colorTheme);
      } else {
        res.status(404).json({ message: "Color theme not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update color theme" });
    }
  });

  // Get service pricing for public use
  app.get("/api/service-pricing", async (req, res) => {
    try {
      const pricing = await storage.getServicePricing();
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service pricing" });
    }
  });

  // Get site settings for public use
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // File upload endpoint for images
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Generate the URL for the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        message: "File uploaded successfully",
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    next();
  });

  const httpServer = createServer(app);
  
  // Add WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('[ws] Client connected');
    wsClients.add(ws);
    
    ws.on('close', () => {
      console.log('[ws] Client disconnected');
      wsClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('[ws] WebSocket error:', error);
      wsClients.delete(ws);
    });
  });
  
  return httpServer;
}
