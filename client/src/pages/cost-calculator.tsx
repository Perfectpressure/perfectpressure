import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, DollarSign, Home, Zap } from "lucide-react";

const calculatorSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  squareFootage: z.coerce.number().min(100, "Square footage must be at least 100"),
  windowCount: z.coerce.number().optional(),
  stories: z.string().optional(),
  extras: z.array(z.string()).optional(),
  promoCode: z.string().optional(),
});

type CalculatorForm = z.infer<typeof calculatorSchema>;

interface CostResult {
  basePrice: number;
  sizeFactor: number;
  storyMultiplier: number;
  extrasTotal: number;
  subtotal: number;
  discount: number;
  discountAmount: number;
  totalCost: number;
  promoCode?: string;
  adminAccess?: boolean;
}

interface CostCalculatorProps {
  onAdminUnlock?: () => void;
}

export default function CostCalculator({ onAdminUnlock }: CostCalculatorProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<CostResult | null>(null);
  const [, setLocation] = useLocation();
  
  // Enable real-time updates via WebSocket
  useWebSocket("/ws");
  
  // Get service pricing data
  const { data: servicePricing = [] } = useQuery({
    queryKey: ["/api/service-pricing"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/service-pricing");
      return response.json();
    },
  });

  const form = useForm<CalculatorForm>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      service: "",
      squareFootage: 1500,
      windowCount: 10,
      stories: "1",
      extras: [],
      promoCode: "",
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: CalculatorForm) => {
      console.log("Calculating cost with data:", data);
      const response = await apiRequest("POST", "/api/calculate-cost", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to calculate cost");
      }
      const result = await response.json();
      console.log("API response:", result);
      return result;
    },
    onSuccess: (data: CostResult | null) => {
      if (data) {
        // Check if this is an admin access response
        if (data.adminAccess && data.promoCode === "ADMIN2025") {
          console.log("Admin access detected, redirecting to admin panel");
          if (onAdminUnlock) {
            onAdminUnlock();
          }
          return;
        }
        
        setResult(data);
        toast({
          title: "Cost Calculated",
          description: `Estimated cost: $${data.totalCost}`,
        });
      }
    },
    onError: (error: Error) => {
      // Check for specific promo code validation errors
      if (error.message.includes("Invalid promo code") || error.message.includes("promo code")) {
        toast({
          title: "Invalid",
          description: "The promo code you entered is not valid or has expired.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to calculate cost. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: CalculatorForm) => {
    calculateMutation.mutate(data);
  };

  // Check if selected service requires stories
  const watchedService = form.watch("service");
  const selectedServiceData = servicePricing.find((s: any) => s.serviceKey === watchedService);
  const showStoriesField = selectedServiceData?.requiresStories;

  const extraServices = [
    { id: "gutter-cleaning", label: "Gutter Cleaning (+$50)" },
    { id: "deck-cleaning", label: "Deck Cleaning (+$50)" },
    { id: "driveway-cleaning", label: "Driveway Cleaning (+$50)" },
    { id: "window-cleaning", label: "Window Cleaning (+$50)" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 pb-16 bg-gradient-to-br from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <Calculator className="inline-block mr-3 mb-2" />
              Cost Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Get an instant estimate for your power washing project
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="mr-2" />
                  Project Details
                </CardTitle>
                <CardDescription>
                  Tell us about your property and the services you need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {servicePricing.map((service: any) => (
                                <SelectItem key={service.serviceKey} value={service.serviceKey}>
                                  {service.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="squareFootage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Footage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1500"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedService === "window-cleaning" && (
                      <FormField
                        control={form.control}
                        name="windowCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Windows</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {showStoriesField && (
                      <FormField
                        control={form.control}
                        name="stories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Stories</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stories" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 Story</SelectItem>
                                <SelectItem value="2">2 Stories</SelectItem>
                                <SelectItem value="3">3+ Stories</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}



                    <FormField
                      control={form.control}
                      name="promoCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promo Code (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter promo code"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={calculateMutation.isPending}
                    >
                      {calculateMutation.isPending ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="mr-2 h-4 w-4" />
                          Calculate Cost
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2" />
                  Cost Estimate
                </CardTitle>
                <CardDescription>
                  {result ? "Your project estimate" : "Fill out the form to get your estimate"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          ${result.totalCost}
                        </div>
                        <div className="text-sm text-gray-600">Estimated Total</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Base Price:</span>
                        <span className="font-medium">${result.basePrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Size Factor:</span>
                        <span className="font-medium">x{result.sizeFactor}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Story Multiplier:</span>
                        <span className="font-medium">x{result.storyMultiplier}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Extras:</span>
                        <span className="font-medium">+${result.extrasTotal}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="font-medium">${result.subtotal}</span>
                      </div>
                      {result.discount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">Discount ({result.discount}%):</span>
                          <span className="font-medium text-green-600">-${result.discountAmount}</span>
                        </div>
                      )}
                      {result.promoCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">Promo Code:</span>
                          <span className="font-medium text-green-600">{result.promoCode}</span>
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span className="text-primary">${result.totalCost}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>This is an estimate.</strong> Final pricing may vary based on property condition, 
                        accessibility, and specific requirements. Contact us for a detailed quote.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <a href="tel:(479) 399-8717">
                          Call Now: (479) 399-8717
                        </a>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <a href="/#contact">Get Free Quote</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      Enter your project details to see an estimated cost
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
