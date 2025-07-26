import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Save, DollarSign, FileText, Zap, Eye, EyeOff, Shield, Palette, Image, Gift, Plus, Trash2, Edit, Calendar, CheckCircle, XCircle, Copy, Upload } from "lucide-react";
import type { SiteSetting, ServicePricing, PromoCode, ImageAsset, ColorTheme } from "@shared/schema";

// Form schemas
const accessCodeSchema = z.object({
  accessCode: z.string().min(1, "Access code is required"),
});

const promoCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  discount: z.number().min(1, "Discount must be at least 1%").max(100, "Discount cannot exceed 100%"),
  isActive: z.boolean(),
  usageLimit: z.number().optional(),
  expiresAt: z.string().optional(),
});

const imageAssetSchema = z.object({
  key: z.string().min(1, "Key is required"),
  url: z.string().min(1, "Image is required"),
  altText: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
});

const colorThemeSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Color value is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

type AccessCodeForm = z.infer<typeof accessCodeSchema>;
type PromoCodeForm = z.infer<typeof promoCodeSchema>;
type ImageAssetForm = z.infer<typeof imageAssetSchema>;
type ColorThemeForm = z.infer<typeof colorThemeSchema>;

// Access Control Component
function AccessControl({ onAccessGranted }: { onAccessGranted: () => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<AccessCodeForm>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: {
      accessCode: "",
    },
  });

  const onSubmit = async (data: AccessCodeForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin/access", data);
      const result = await response.json();
      
      if (result.success) {
        onAccessGranted();
        toast({
          title: "Access Granted",
          description: "Welcome to the admin dashboard",
        });
      } else {
        toast({
          title: "Access Denied",
          description: result.message || "Invalid access code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify access code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Admin Access
          </CardTitle>
          <CardDescription>
            Enter your access code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Code</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter access code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Access Dashboard"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Image Asset Management Component
function ImageAssetManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ImageAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: imageAssets = [], isLoading } = useQuery({
    queryKey: ["/api/admin/image-assets"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/image-assets");
      return response.json();
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: ImageAssetForm) => {
      const response = await apiRequest("POST", "/api/admin/image-assets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/image-assets"] });
      handleDialogClose();
      toast({
        title: "Image Asset Created",
        description: "New image asset has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create image asset",
        variant: "destructive",
      });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ImageAssetForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/image-assets/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/image-assets"] });
      handleDialogClose();
      toast({
        title: "Image Asset Updated",
        description: "Image asset has been updated successfully",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/image-assets/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/image-assets"] });
      toast({
        title: "Image Asset Deleted",
        description: "Image asset has been deleted successfully",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Auto-fill the URL field with the uploaded image URL
      form.setValue('url', data.url);
      toast({
        title: "Image Uploaded",
        description: "Image uploaded successfully. URL has been filled in automatically.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ImageAssetForm>({
    resolver: zodResolver(imageAssetSchema),
    defaultValues: {
      key: "",
      url: "",
      altText: "",
      category: "",
      isActive: true,
    },
  });

  const onSubmit = (data: ImageAssetForm) => {
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data });
    } else {
      createAssetMutation.mutate(data);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Auto-upload the file
      uploadImageMutation.mutate(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        // Auto-upload the file
        uploadImageMutation.mutate(file);
      }
    }
  };

  const handleEdit = (asset: ImageAsset) => {
    setEditingAsset(asset);
    form.reset({
      key: asset.key,
      url: asset.url,
      altText: asset.altText || "",
      category: asset.category,
      isActive: asset.isActive,
    });
    // Set preview for existing images
    if (asset.url) {
      setPreviewUrl(asset.url);
    }
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this image asset?")) {
      deleteAssetMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setEditingAsset(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    form.reset({
      key: "",
      url: "",
      altText: "",
      category: "",
      isActive: true,
    });
  };

  const categories = [...new Set(imageAssets.map((asset: ImageAsset) => asset.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Assets
              </CardTitle>
              <CardDescription>
                Manage website images and visual assets
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { 
              if (!open) handleDialogClose(); 
              else setIsCreateDialogOpen(true); 
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => { 
                  setEditingAsset(null); 
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  form.reset(); 
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingAsset ? "Edit Image" : "Upload New Image"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAsset ? "Update image details and replace the image if needed" : "Upload an image and add it to your website"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., hero_background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Upload</FormLabel>
                          <FormControl>
                            <div
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                              onClick={handleUploadClick}
                            >
                              {previewUrl ? (
                                <div className="space-y-4">
                                  <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-48 mx-auto rounded-lg"
                                  />
                                  <p className="text-sm text-gray-600">
                                    {selectedFile?.name}
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFile(null);
                                      setPreviewUrl(null);
                                      field.onChange("");
                                    }}
                                  >
                                    Remove Image
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                                  <div>
                                    <p className="text-lg font-medium">
                                      {uploadImageMutation.isPending ? "Uploading..." : "Upload an image"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Drag and drop or click to select
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      JPG, PNG, GIF up to 10MB
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <input type="hidden" {...field} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="altText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Description of the image" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="homepage">Homepage</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="branding">Branding</SelectItem>
                              <SelectItem value="gallery">Gallery</SelectItem>
                              <SelectItem value="blog">Blog</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Show this image asset on the website
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createAssetMutation.isPending || updateAssetMutation.isPending}>
                        {editingAsset ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading image assets...</div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-lg capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imageAssets
                      .filter((asset: ImageAsset) => asset.category === category)
                      .map((asset: ImageAsset) => (
                        <Card key={asset.id} className="overflow-hidden">
                          <div className="aspect-video bg-gray-100 flex items-center justify-center">
                            <img
                              src={asset.url}
                              alt={asset.altText || asset.key}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center bg-gray-100 text-gray-400">
                              <Image className="h-8 w-8" />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{asset.key}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant={asset.isActive ? "default" : "secondary"}>
                                  {asset.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{asset.altText}</p>
                            <div className="text-xs text-gray-500 mb-3 break-all">
                              URL: {asset.url}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(asset)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(asset.url);
                                  toast({
                                    title: "URL Copied",
                                    description: "Image URL copied to clipboard",
                                  });
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(asset.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Color Theme Management Component
function ColorThemeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ColorTheme | null>(null);

  const { data: colorThemes = [], isLoading } = useQuery({
    queryKey: ["/api/admin/color-themes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/color-themes");
      return response.json();
    },
  });

  const createThemeMutation = useMutation({
    mutationFn: async (data: ColorThemeForm) => {
      const response = await apiRequest("POST", "/api/admin/color-themes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/color-themes"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Color Theme Created",
        description: "New color theme has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create color theme",
        variant: "destructive",
      });
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ColorThemeForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/color-themes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/color-themes"] });
      setEditingTheme(null);
      toast({
        title: "Color Theme Updated",
        description: "Color theme has been updated successfully",
      });
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/color-themes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/color-themes"] });
      toast({
        title: "Color Theme Deleted",
        description: "Color theme has been deleted successfully",
      });
    },
  });

  const form = useForm<ColorThemeForm>({
    resolver: zodResolver(colorThemeSchema),
    defaultValues: {
      key: "",
      value: "",
      category: "",
      description: "",
    },
  });

  const onSubmit = (data: ColorThemeForm) => {
    if (editingTheme) {
      updateThemeMutation.mutate({ id: editingTheme.id, data });
    } else {
      createThemeMutation.mutate(data);
    }
  };

  const handleEdit = (theme: ColorTheme) => {
    setEditingTheme(theme);
    form.reset({
      key: theme.key,
      value: theme.value,
      category: theme.category,
      description: theme.description || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this color theme?")) {
      deleteThemeMutation.mutate(id);
    }
  };

  const categories = [...new Set(colorThemes.map((theme: ColorTheme) => theme.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Themes
              </CardTitle>
              <CardDescription>
                Customize website colors and visual themes
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingTheme(null); form.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTheme ? "Edit Color Theme" : "Create New Color Theme"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTheme ? "Update color theme details" : "Add a new color to your website theme"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., primary_button" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Value</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                className="w-20"
                                {...field}
                              />
                              <Input
                                placeholder="#2563eb"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="brand">Brand</SelectItem>
                              <SelectItem value="layout">Layout</SelectItem>
                              <SelectItem value="interactive">Interactive</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="background">Background</SelectItem>
                              <SelectItem value="accent">Accent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Description of where this color is used" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createThemeMutation.isPending || updateThemeMutation.isPending}>
                        {editingTheme ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading color themes...</div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-lg capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colorThemes
                      .filter((theme: ColorTheme) => theme.category === category)
                      .map((theme: ColorTheme) => (
                        <Card key={theme.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-8 h-8 rounded border"
                                style={{ backgroundColor: theme.value }}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{theme.key}</h4>
                                <p className="text-sm text-gray-600">{theme.value}</p>
                              </div>
                            </div>
                            {theme.description && (
                              <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(theme)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(theme.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Promo Code Management Component
function PromoCodeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);

  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ["/api/admin/promo-codes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/promo-codes");
      return response.json();
    },
  });

  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: PromoCodeForm) => {
      const payload = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      };
      const response = await apiRequest("POST", "/api/admin/promo-codes", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Promo Code Created",
        description: "New promo code has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create promo code",
        variant: "destructive",
      });
    },
  });

  const updatePromoCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PromoCodeForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/promo-codes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setEditingPromoCode(null);
      toast({
        title: "Promo Code Updated",
        description: "Promo code has been updated successfully",
      });
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/promo-codes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Promo Code Deleted",
        description: "Promo code has been deleted successfully",
      });
    },
  });

  const form = useForm<PromoCodeForm>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
      discount: 0,
      isActive: true,
      usageLimit: undefined,
      expiresAt: "",
    },
  });

  const onSubmit = (data: PromoCodeForm) => {
    if (editingPromoCode) {
      updatePromoCodeMutation.mutate({ id: editingPromoCode.id, data });
    } else {
      createPromoCodeMutation.mutate(data);
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    form.reset({
      code: promoCode.code,
      discount: promoCode.discount,
      isActive: promoCode.isActive,
      usageLimit: promoCode.usageLimit || undefined,
      expiresAt: promoCode.expiresAt ? new Date(promoCode.expiresAt).toISOString().split('T')[0] : "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPromoCode(null);
    form.reset();
    setIsCreateDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading promo codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Promo Code Management</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promo Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Promo Codes</CardTitle>
          <CardDescription>
            Manage discount codes for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promoCode: PromoCode) => (
                <TableRow key={promoCode.id}>
                  <TableCell className="font-medium">{promoCode.code}</TableCell>
                  <TableCell>{promoCode.discount}%</TableCell>
                  <TableCell>
                    {promoCode.usageCount} / {promoCode.usageLimit || "∞"}
                  </TableCell>
                  <TableCell>
                    {promoCode.expiresAt ? new Date(promoCode.expiresAt).toLocaleDateString() : "No expiration"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={promoCode.isActive ? "default" : "secondary"}>
                      {promoCode.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(promoCode)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePromoCodeMutation.mutate(promoCode.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromoCode ? "Edit Promo Code" : "Create New Promo Code"}
            </DialogTitle>
            <DialogDescription>
              {editingPromoCode ? "Update the promo code details" : "Create a new discount code for customers"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="SAVE10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Leave empty for unlimited"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this promo code for use
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createPromoCodeMutation.isPending || updatePromoCodeMutation.isPending}>
                  {editingPromoCode ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Enable real-time updates via WebSocket
  useWebSocket("/ws");

  // Fetch site settings
  const { data: siteSettings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/site-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/site-settings");
      return response.json();
    },
  });

  // Fetch service pricing
  const { data: servicePricing = [], isLoading: pricingLoading } = useQuery({
    queryKey: ["/api/admin/service-pricing"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/service-pricing");
      return response.json();
    },
  });

  // Fetch image assets
  const { data: imageAssets = [] } = useQuery({
    queryKey: ["/api/admin/image-assets"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/image-assets");
      return response.json();
    },
  });

  // Fetch color themes
  const { data: colorThemes = [] } = useQuery({
    queryKey: ["/api/admin/color-themes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/color-themes");
      return response.json();
    },
  });

  // Mutation for updating site settings
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", `/api/admin/site-settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({
        title: "Setting Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating service pricing
  const updatePricingMutation = useMutation({
    mutationFn: async ({ key, updates }: { key: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/admin/service-pricing/${key}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-pricing"] });
      toast({
        title: "Pricing Updated",
        description: "Service pricing has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pricing. Please try again.",
        variant: "destructive",
      });
    },
  });



  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handlePricingUpdate = (key: string, updates: any) => {
    updatePricingMutation.mutate({ key, updates });
  };

  const groupedSettings = siteSettings.reduce((acc: any, setting: SiteSetting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Manage your website content, pricing, and settings
              </p>
            </div>
            <Button 
              onClick={() => window.open('/page-builder', '_blank')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Edit className="h-5 w-5 mr-2" />
              Visual Page Builder
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="promo-codes" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Promo Codes
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Content Management
                </CardTitle>
                <CardDescription>
                  Update website content and settings in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedSettings).map(([category, settings]) => (
                      <div key={category} className="space-y-4">
                        <h3 className="text-lg font-semibold capitalize border-b pb-2">
                          {category.replace(/_/g, ' ')}
                        </h3>
                        <div className="grid gap-4">
                          {(settings as SiteSetting[]).map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              <Label htmlFor={setting.key} className="text-sm font-medium">
                                {setting.description || setting.key.replace(/_/g, ' ')}
                              </Label>
                              {setting.type === 'textarea' ? (
                                <Textarea
                                  id={setting.key}
                                  defaultValue={setting.value}
                                  onBlur={(e) => handleSettingUpdate(setting.key, e.target.value)}
                                  className="min-h-[100px]"
                                />
                              ) : (
                                <Input
                                  id={setting.key}
                                  defaultValue={setting.value}
                                  onBlur={(e) => handleSettingUpdate(setting.key, e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Service Pricing
                </CardTitle>
                <CardDescription>
                  Manage pricing for all your services
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pricingLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {servicePricing.map((service: ServicePricing) => (
                      <div key={service.serviceKey} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{service.name}</h3>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={service.enabled}
                              onCheckedChange={(checked) => 
                                handlePricingUpdate(service.serviceKey, { enabled: checked })
                              }
                            />
                            <Badge variant={service.enabled ? "default" : "secondary"}>
                              {service.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Base Price ($)</Label>
                            <Input
                              type="number"
                              defaultValue={service.basePrice}
                              onBlur={(e) => 
                                handlePricingUpdate(service.serviceKey, { 
                                  basePrice: Number(e.target.value) 
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              defaultValue={service.description || ""}
                              onBlur={(e) => 
                                handlePricingUpdate(service.serviceKey, { 
                                  description: e.target.value 
                                })
                              }
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={service.requiresStories}
                              onCheckedChange={(checked) => 
                                handlePricingUpdate(service.serviceKey, { requiresStories: checked })
                              }
                            />
                            <Label>Requires number of stories</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promo-codes">
            <PromoCodeManagement />
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <ImageAssetManagement />
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <ColorThemeManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}