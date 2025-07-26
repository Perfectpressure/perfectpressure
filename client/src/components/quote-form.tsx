import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertQuoteSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import type { InsertQuote } from "@shared/schema";

export default function QuoteForm() {
  const { toast } = useToast();

  const form = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      service: "",
      message: "",
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async (data: InsertQuote) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Quote Request Sent!",
        description: "We will get back to you as soon as possible.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertQuote) => {
    quoteMutation.mutate(data);
  };

  return (
    <section className="py-16 bg-gray-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-gray-900">
              Get A Free Quote!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name:</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email:</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="perfectpreasure@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone:</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(479) 399-8717" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address:</FormLabel>
                        <FormControl>
                          <Input placeholder="Service Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Needed:</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="House Washing">House Washing</SelectItem>
                          <SelectItem value="Pressure Washing">Pressure Washing</SelectItem>
                          <SelectItem value="Roof Cleaning">Roof Cleaning</SelectItem>
                          <SelectItem value="Gutter Cleaning">Gutter Cleaning</SelectItem>
                          <SelectItem value="Deck Cleaning">Deck Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (Optional):</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your project..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={quoteMutation.isPending}
                >
                  {quoteMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      GET FREE QUOTE
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Protected by reCAPTCHA -{" "}
                  <a href="#" className="text-primary hover:underline">Privacy</a> -{" "}
                  <a href="#" className="text-primary hover:underline">Terms</a>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
