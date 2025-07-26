import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  Edit, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Image, 
  Layout, 
  Palette,
  Monitor,
  Smartphone,
  Upload,
  FolderOpen,
  Check
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PageSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'services' | 'contact' | 'testimonial';
  title: string;
  content: any;
  styles: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    margin: string;
  };
  order: number;
  isVisible: boolean;
}

interface PageBuilderProps {
  onSave: (sections: PageSection[]) => void;
  initialSections?: PageSection[];
}

const defaultSections: PageSection[] = [
  {
    id: 'hero-1',
    type: 'hero',
    title: 'Hero Section',
    content: {
      headline: 'Professional Power Washing Services',
      subheadline: 'Transform your property with our eco-friendly cleaning solutions',
      buttonText: 'Get Free Quote',
      backgroundImage: '/api/placeholder/1920/1080'
    },
    styles: {
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      padding: '4rem 0',
      margin: '0'
    },
    order: 0,
    isVisible: true
  },
  {
    id: 'services-1',
    type: 'services',
    title: 'Services Section',
    content: {
      headline: 'Our Services',
      description: 'Professional exterior cleaning for your home and business',
      services: [
        { name: 'House Washing', description: 'Gentle soft washing for your home', image: '/api/placeholder/400/300' },
        { name: 'Pressure Washing', description: 'High-pressure cleaning for driveways', image: '/api/placeholder/400/300' },
        { name: 'Roof Cleaning', description: 'Safe roof cleaning and maintenance', image: '/api/placeholder/400/300' }
      ]
    },
    styles: {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      padding: '3rem 0',
      margin: '0'
    },
    order: 1,
    isVisible: true
  }
];

export default function PageBuilder({ onSave, initialSections = defaultSections }: PageBuilderProps) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [showCostCalculatorEditor, setShowCostCalculatorEditor] = useState(false);
  
  // Fetch service pricing for cost calculator editing
  const { data: servicePricing = [] } = useQuery({
    queryKey: ["/api/admin/service-pricing"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/service-pricing");
      return response.json();
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newSections = Array.from(sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);

    // Update order numbers
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(updatedSections);
  };

  const addSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: getDefaultContent(type),
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        padding: '2rem 0',
        margin: '0'
      },
      order: sections.length,
      isVisible: true
    };

    setSections([...sections, newSection]);
    setSelectedSection(newSection);
    setIsEditing(true);
  };

  const getDefaultContent = (type: PageSection['type']) => {
    switch (type) {
      case 'hero':
        return {
          headline: 'Perfect Pressure Power Washing',
          subheadline: 'Transform your property with our professional cleaning solutions',
          buttonText: 'Get Free Quote',
          backgroundImage: '/uploads/image-1753242494685-918863683.png'
        };
      case 'text':
        return {
          headline: 'Text Section',
          content: 'Add your content here...'
        };
      case 'image':
        return {
          imageUrl: '/api/placeholder/800/600',
          alt: 'Image description',
          caption: 'Image caption'
        };
      case 'services':
        return {
          headline: 'Perfect Pressure Services',
          description: 'Professional power washing services for your home and business',
          services: []
        };
      case 'contact':
        return {
          headline: 'Contact Perfect Pressure',
          description: 'Get your free estimate today - Little Flock, AR',
          phone: '(479) 399-8717',
          email: 'perfectpreasure@gmail.com'
        };
      case 'testimonial':
        return {
          headline: 'What Perfect Pressure Customers Say',
          testimonials: []
        };
      default:
        return {};
    }
  };

  const updateSection = (sectionId: string, updates: Partial<PageSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  // Service pricing update mutation
  const updateServicePricingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/service-pricing/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-pricing"] });
      toast({
        title: "Success",
        description: "Service pricing updated successfully",
      });
    },
  });

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageField, setSelectedImageField] = useState<string>('');

  // Fetch image assets from database
  const { data: imageAssets = [] } = useQuery({
    queryKey: ["/api/admin/image-assets"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/image-assets");
      return response.json();
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSection) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'homepage');
    formData.append('key', `section_${selectedSection.id}_image`);

    try {
      const response = await fetch('/api/admin/image-assets/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.url;

        // Update the section with the new image
        if (selectedSection.type === 'hero') {
          updateSection(selectedSection.id, {
            content: { ...selectedSection.content, backgroundImage: imageUrl }
          });
        } else if (selectedSection.type === 'image') {
          updateSection(selectedSection.id, {
            content: { ...selectedSection.content, imageUrl: imageUrl }
          });
        }
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (!selectedSection || !selectedImageField) return;
    
    // Update the section with the selected image
    if (selectedImageField === 'backgroundImage') {
      updateSection(selectedSection.id, {
        content: { ...selectedSection.content, backgroundImage: imageUrl }
      });
    } else if (selectedImageField === 'imageUrl') {
      updateSection(selectedSection.id, {
        content: { ...selectedSection.content, imageUrl: imageUrl }
      });
    }
    
    setShowImageGallery(false);
    setSelectedImageField('');
  };

  const openImageGallery = (field: string) => {
    setSelectedImageField(field);
    setShowImageGallery(true);
  };

  const ImageGalleryDialog = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const categories = ['all', 'homepage', 'services', 'branding', 'gallery', 'blog'];
    
    const filteredImages = selectedCategory === 'all' 
      ? imageAssets 
      : imageAssets.filter((img: any) => img.category === selectedCategory);

    return (
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Select Image - Shopify Style Gallery</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery">
              {/* Category Filter */}
              <div className="mb-4 border-b pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category} ({category === 'all' ? imageAssets.length : imageAssets.filter((img: any) => img.category === category).length})
                    </Button>
                  ))}
                </div>
              </div>
              
              <ScrollArea className="h-[55vh] w-full">
                <div className="grid grid-cols-5 gap-3 p-2">
                  {filteredImages.map((image: any) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden transition-all duration-200"
                      onClick={() => handleImageSelect(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={image.description || image.key}
                        className="w-full h-28 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <Check className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-2">
                        <p className="text-xs font-medium truncate">{image.key}</p>
                        <p className="text-xs opacity-75 capitalize">{image.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredImages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <FolderOpen className="h-16 w-16 mb-3" />
                    <p className="text-lg font-medium">No images in {selectedCategory} category</p>
                    <p className="text-sm">Upload some images to get started.</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Upload New Image</h3>
                  <p className="text-gray-600 mb-4">Drag and drop an image here, or click to browse</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <div className="flex items-center justify-center gap-2 text-blue-600 mt-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Uploading image...</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  // Cost Calculator Editor Component
  const CostCalculatorEditor = () => (
    <Dialog open={showCostCalculatorEditor} onOpenChange={setShowCostCalculatorEditor}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Edit Cost Calculator - Perfect Pressure</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] p-4">
          <div className="space-y-6">
            {servicePricing.map((service: any) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {service.name}
                    <Badge variant={service.enabled ? "default" : "secondary"}>
                      {service.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`basePrice-${service.id}`}>Base Price ($)</Label>
                      <Input
                        id={`basePrice-${service.id}`}
                        type="number"
                        value={service.basePrice}
                        onChange={(e) => {
                          updateServicePricingMutation.mutate({
                            id: service.id,
                            data: { basePrice: parseFloat(e.target.value) || 0 }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`enabled-${service.id}`}>Service Enabled</Label>
                      <div className="flex items-center mt-2">
                        <input
                          id={`enabled-${service.id}`}
                          type="checkbox"
                          checked={service.enabled}
                          onChange={(e) => {
                            updateServicePricingMutation.mutate({
                              id: service.id,
                              data: { enabled: e.target.checked }
                            });
                          }}
                          className="mr-2"
                        />
                        <span>{service.enabled ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`description-${service.id}`}>Description</Label>
                    <Textarea
                      id={`description-${service.id}`}
                      value={service.description || ''}
                      onChange={(e) => {
                        updateServicePricingMutation.mutate({
                          id: service.id,
                          data: { description: e.target.value }
                        });
                      }}
                      placeholder="Service description..."
                      rows={2}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Pricing Formula:</strong> Base Price × Size Factor (based on sq ft) × Story Multiplier</p>
                    <p><strong>Size Factors:</strong> 0-500 sq ft = 1x, 501-1000 = 1.5x, 1001-2000 = 2x, 2000+ = 2.5x</p>
                    {service.requiresStories && <p><strong>Story Multipliers:</strong> 1 story = 1x, 2 stories = 1.3x, 3+ stories = 1.6x</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  const renderSection = (section: PageSection, isBuilder = false) => {
    const sectionStyle = {
      backgroundColor: section.styles.backgroundColor,
      color: section.styles.textColor,
      padding: section.styles.padding,
      margin: section.styles.margin,
      position: 'relative' as const,
      border: isBuilder && selectedSection?.id === section.id ? '2px dashed #3b82f6' : 'none',
      opacity: section.isVisible ? 1 : 0.5,
      cursor: isBuilder ? 'pointer' : 'default'
    };

    const handleSectionClick = (e: React.MouseEvent) => {
      if (isBuilder) {
        e.stopPropagation();
        setSelectedSection(section);
      }
    };

    const handleInlineEdit = (field: string, value: string) => {
      updateSection(section.id, {
        content: { ...section.content, [field]: value }
      });
    };

    const content = (() => {
      switch (section.type) {
        case 'hero':
          return (
            <div className="relative min-h-[400px] flex items-center justify-center text-center"
                 style={{ backgroundImage: `url(${section.content.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="bg-black bg-opacity-50 p-8 rounded-lg">
                <h1 
                  className="text-4xl md:text-6xl font-bold mb-4"
                  contentEditable={isBuilder}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => isBuilder && handleInlineEdit('headline', e.target.innerText)}
                  style={{ outline: isBuilder ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none' }}
                >
                  {section.content.headline}
                </h1>
                <p 
                  className="text-xl mb-6"
                  contentEditable={isBuilder}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => isBuilder && handleInlineEdit('subheadline', e.target.innerText)}
                  style={{ outline: isBuilder ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none' }}
                >
                  {section.content.subheadline}
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <span
                    contentEditable={isBuilder}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => isBuilder && handleInlineEdit('buttonText', e.target.innerText)}
                    style={{ outline: isBuilder ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none' }}
                  >
                    {section.content.buttonText}
                  </span>
                </Button>
              </div>
            </div>
          );
        
        case 'text':
          return (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <h2 
                className="text-3xl font-bold mb-6"
                contentEditable={isBuilder}
                suppressContentEditableWarning={true}
                onBlur={(e) => isBuilder && handleInlineEdit('headline', e.target.innerText)}
                style={{ outline: isBuilder ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none' }}
              >
                {section.content.headline}
              </h2>
              <div 
                className="text-lg leading-relaxed"
                contentEditable={isBuilder}
                suppressContentEditableWarning={true}
                onBlur={(e) => isBuilder && handleInlineEdit('content', e.target.innerHTML)}
                style={{ outline: isBuilder ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none' }}
                dangerouslySetInnerHTML={{ __html: section.content.content }}
              />
            </div>
          );
        
        case 'image':
          return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
              <img src={section.content.imageUrl || section.content.src} alt={section.content.alt} className="w-full h-auto rounded-lg mb-4" />
              {section.content.caption && (
                <p className="text-sm text-gray-600">{section.content.caption}</p>
              )}
            </div>
          );
        
        case 'services':
          return (
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{section.content.headline}</h2>
                <p className="text-lg">{section.content.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.content.services.map((service: any, index: number) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                    </div>
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          );
        
        case 'contact':
          return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
              <h2 className="text-3xl font-bold mb-6">{section.content.headline}</h2>
              <p className="text-lg mb-8">{section.content.description}</p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Phone:</span>
                  <span>{section.content.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Email:</span>
                  <span>{section.content.email}</span>
                </div>
              </div>
            </div>
          );
        
        default:
          return <div className="p-8 text-center">Unknown section type</div>;
      }
    })();

    return (
      <div style={sectionStyle} onClick={handleSectionClick}>
        {isBuilder && (
          <>
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSection(section);
                  setIsEditing(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSection(section.id, { isVisible: !section.isVisible });
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSection(section.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {selectedSection?.id === section.id && (
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="default" className="bg-blue-600">
                  Selected: {section.title}
                </Badge>
              </div>
            )}
          </>
        )}
        {content}
      </div>
    );
  };

  const renderSectionEditor = () => {
    if (!selectedSection) return null;

    return (
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {selectedSection.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Section Content Editor */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Content</Label>
              {selectedSection.type === 'hero' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={selectedSection.content.headline}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, headline: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subheadline">Subheadline</Label>
                    <Input
                      id="subheadline"
                      value={selectedSection.content.subheadline}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, subheadline: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={selectedSection.content.buttonText}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, buttonText: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backgroundImage">Background Image</Label>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openImageGallery('backgroundImage')}
                        className="w-full"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Choose from Gallery
                      </Button>
                      {selectedSection.content.backgroundImage && (
                        <div className="relative">
                          <img
                            src={selectedSection.content.backgroundImage}
                            alt="Background preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => updateSection(selectedSection.id, {
                              content: { ...selectedSection.content, backgroundImage: '/api/placeholder/1920/1080' }
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedSection.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={selectedSection.content.headline}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, headline: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      rows={6}
                      value={selectedSection.content.content}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, content: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}

              {selectedSection.type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imageFile">Image</Label>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openImageGallery('imageUrl')}
                        className="w-full"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Choose from Gallery
                      </Button>
                      {selectedSection.content.imageUrl && (
                        <div className="relative">
                          <img
                            src={selectedSection.content.imageUrl}
                            alt="Section preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => updateSection(selectedSection.id, {
                              content: { ...selectedSection.content, imageUrl: '/api/placeholder/800/600' }
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="imageAlt">Alt Text</Label>
                    <Input
                      id="imageAlt"
                      value={selectedSection.content.alt}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, alt: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageCaption">Caption</Label>
                    <Input
                      id="imageCaption"
                      value={selectedSection.content.caption}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, caption: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Style Editor */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Styling</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={selectedSection.styles.backgroundColor}
                    onChange={(e) => updateSection(selectedSection.id, {
                      styles: { ...selectedSection.styles, backgroundColor: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={selectedSection.styles.textColor}
                    onChange={(e) => updateSection(selectedSection.id, {
                      styles: { ...selectedSection.styles, textColor: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="padding">Padding</Label>
                  <Input
                    id="padding"
                    value={selectedSection.styles.padding}
                    onChange={(e) => updateSection(selectedSection.id, {
                      styles: { ...selectedSection.styles, padding: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="margin">Margin</Label>
                  <Input
                    id="margin"
                    value={selectedSection.styles.margin}
                    onChange={(e) => updateSection(selectedSection.id, {
                      styles: { ...selectedSection.styles, margin: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Perfect Pressure - Page Builder</h1>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView('desktop')}
                  className="text-xs"
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop (1920px)
                </Button>
                <Button
                  variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView('mobile')}
                  className="text-xs"
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile (375px)
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCostCalculatorEditor(true)}
                size="sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Cost Calculator
              </Button>
              <Button
                variant={isPreviewMode ? 'default' : 'outline'}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPreviewMode ? 'Exit Preview' : 'Preview'}
              </Button>
              <Button onClick={() => onSave(sections)} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save Page
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Component Library */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r min-h-screen p-4 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Add Components</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('hero')}
                    className="h-20 flex-col gap-2"
                  >
                    <Layout className="h-6 w-6" />
                    Hero
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('text')}
                    className="h-20 flex-col gap-2"
                  >
                    <Type className="h-6 w-6" />
                    Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('image')}
                    className="h-20 flex-col gap-2"
                  >
                    <Image className="h-6 w-6" />
                    Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('services')}
                    className="h-20 flex-col gap-2"
                  >
                    <Layout className="h-6 w-6" />
                    Services
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('contact')}
                    className="h-20 flex-col gap-2"
                  >
                    <Type className="h-6 w-6" />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('testimonial')}
                    className="h-20 flex-col gap-2"
                  >
                    <Type className="h-6 w-6" />
                    Testimonial
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Page Structure</h3>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 ${
                                  selectedSection?.id === section.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedSection(section)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <span className="font-medium">{section.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSection(section);
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Badge variant={section.isVisible ? 'default' : 'secondary'}>
                                      {section.isVisible ? 'Visible' : 'Hidden'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Section Quick Actions */}
              {selectedSection && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected: {selectedSection.title}</h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateSection(selectedSection.id, {
                          isVisible: !selectedSection.isVisible
                        });
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {selectedSection.isVisible ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSections(sections.filter(s => s.id !== selectedSection.id));
                        setSelectedSection(null);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className={`mx-auto bg-white shadow-lg ${
            deviceView === 'mobile' 
              ? 'max-w-sm border rounded-lg overflow-hidden' 
              : 'w-full max-w-7xl border rounded-lg overflow-hidden'
          }`}>
            <div className={`${deviceView === 'mobile' ? 'text-sm' : ''}`}>
              {sections
                .filter(section => section.isVisible || !isPreviewMode)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className={`${deviceView === 'mobile' ? 'text-sm' : ''}`}>
                    {renderSection(section, !isPreviewMode)}
                  </div>
                ))}
            </div>
          </div>
          
          {/* Device View Indicator */}
          <div className="text-center mt-4 text-gray-500 text-sm">
            {deviceView === 'desktop' 
              ? '🖥️ Desktop View (1920px width)' 
              : '📱 Mobile View (375px width) - Your site automatically adjusts for all devices'
            }
          </div>
        </div>
      </div>

      {/* Section Editor Dialog */}
      {renderSectionEditor()}
      
      {/* Image Gallery Dialog */}
      <ImageGalleryDialog />
      
      {/* Cost Calculator Editor */}
      <CostCalculatorEditor />
    </div>
  );
}