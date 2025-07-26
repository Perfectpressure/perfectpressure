import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertContactSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MessageSquare, MapPin, Send } from "lucide-react";
import type { InsertContact } from "@shared/schema";

export default function ContactSection() {
  const { toast } = useToast();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Message Sent!",
        description: "We will get back to you as soon as possible.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    contactMutation.mutate(data);
  };

  const serviceAreas = [
    "Bentonville", "Rogers", "Little Flock", "Bella Vista",
    "Centerton", "Cave Springs", "Lowell", "Springdale",
    "Fayetteville", "Tontitown", "Gravette", "Pea Ridge"
  ];

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-lg text-gray-600">Ready to transform your property? Contact us today!</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Phone className="text-primary text-xl mr-4" />
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <a href="tel:(479) 399-8717" className="text-primary hover:text-primary-dark">
                    (479) 399-8717
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <MessageSquare className="text-primary text-xl mr-4" />
                <div>
                  <p className="font-semibold text-gray-900">Text Message</p>
                  <a href="sms:(479) 399-8717" className="text-primary hover:text-primary-dark">
                    (479) 399-8717
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="text-primary text-xl mr-4" />
                <div>
                  <p className="font-semibold text-gray-900">Service Areas</p>
                  <p className="text-gray-600">
                    Bentonville, Rogers, Little Flock, Bella Vista, & Surrounding Areas
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Service Areas Include:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                {serviceAreas.map((area, index) => (
                  <div key={index}>• {area}</div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us A Message</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
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
                      <FormLabel>Email</FormLabel>
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(479) 399-8717" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Tell us about your project..."
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
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
