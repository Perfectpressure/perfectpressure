import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, DollarSign, Type, Save, RefreshCw } from "lucide-react";

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

  // Group settings by category
  const groupedSettings = siteSettings.reduce((acc: any, setting: any) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  if (settingsLoading || pricingLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 pb-16 bg-gradient-to-br from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <Settings className="inline-block mr-3 mb-2" />
              Admin Dashboard
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Customize your website content and pricing
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content" className="flex items-center">
                <Type className="mr-2 h-4 w-4" />
                Content Management
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Service Pricing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6">
              <div className="grid gap-6">
                {Object.entries(groupedSettings).map(([category, settings]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category} Settings</CardTitle>
                      <CardDescription>
                        Customize {category} content and text
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {settings.map((setting: any) => (
                          <div key={setting.key} className="space-y-2">
                            <Label htmlFor={setting.key} className="text-sm font-medium">
                              {setting.description || setting.key}
                            </Label>
                            <div className="flex gap-2">
                              {setting.type === "text" && setting.value.length > 100 ? (
                                <Textarea
                                  id={setting.key}
                                  defaultValue={setting.value}
                                  className="flex-1"
                                  onBlur={(e) => {
                                    if (e.target.value !== setting.value) {
                                      handleSettingUpdate(setting.key, e.target.value);
                                    }
                                  }}
                                />
                              ) : (
                                <Input
                                  id={setting.key}
                                  defaultValue={setting.value}
                                  className="flex-1"
                                  onBlur={(e) => {
                                    if (e.target.value !== setting.value) {
                                      handleSettingUpdate(setting.key, e.target.value);
                                    }
                                  }}
                                />
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const input = document.getElementById(setting.key) as HTMLInputElement | HTMLTextAreaElement;
                                  if (input) {
                                    handleSettingUpdate(setting.key, input.value);
                                  }
                                }}
                                disabled={updateSettingMutation.isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <div className="grid gap-6">
                {servicePricing.map((service: any) => (
                  <Card key={service.serviceKey}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{service.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={service.enabled ? "default" : "secondary"}>
                            {service.enabled ? "Active" : "Inactive"}
                          </Badge>
                          {service.requiresStories && (
                            <Badge variant="outline">Stories Required</Badge>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`price-${service.serviceKey}`}>Base Price ($)</Label>
                          <Input
                            id={`price-${service.serviceKey}`}
                            type="number"
                            defaultValue={service.basePrice}
                            onBlur={(e) => {
                              const newPrice = parseInt(e.target.value);
                              if (newPrice !== service.basePrice) {
                                handlePricingUpdate(service.serviceKey, { basePrice: newPrice });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`enabled-${service.serviceKey}`}>Service Enabled</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`enabled-${service.serviceKey}`}
                              checked={service.enabled}
                              onCheckedChange={(checked) => {
                                handlePricingUpdate(service.serviceKey, { enabled: checked });
                              }}
                            />
                            <Label htmlFor={`enabled-${service.serviceKey}`} className="text-sm">
                              {service.enabled ? "Active" : "Inactive"}
                            </Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`stories-${service.serviceKey}`}>Requires Stories</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`stories-${service.serviceKey}`}
                              checked={service.requiresStories}
                              onCheckedChange={(checked) => {
                                handlePricingUpdate(service.serviceKey, { requiresStories: checked });
                              }}
                            />
                            <Label htmlFor={`stories-${service.serviceKey}`} className="text-sm">
                              {service.requiresStories ? "Required" : "Not Required"}
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <Label htmlFor={`desc-${service.serviceKey}`}>Description</Label>
                        <Textarea
                          id={`desc-${service.serviceKey}`}
                          defaultValue={service.description || ""}
                          onBlur={(e) => {
                            if (e.target.value !== service.description) {
                              handlePricingUpdate(service.serviceKey, { description: e.target.value });
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}