import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ImageAsset } from "@/../../shared/schema";

export default function ServicesSection() {
  const { data: imageAssets = [] } = useQuery<ImageAsset[]>({
    queryKey: ["/api/image-assets", "services"],
    queryFn: async () => {
      const response = await fetch("/api/image-assets/services");
      if (!response.ok) {
        throw new Error("Failed to fetch service images");
      }
      return response.json();
    },
  });

  // Helper function to get image URL by key
  const getImageUrl = (key: string, fallback: string) => {
    const asset = imageAssets.find(img => img.key === key && img.isActive);
    return asset?.url || fallback;
  };

  const services = [
    {
      title: "Pressure Washing",
      description: "Professional pressure washing for driveways, sidewalks, and hard surfaces.",
      image: getImageUrl("service_pressure", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"),
      href: "/services#pressure-washing",
    },
    {
      title: "House Washing",
      description: "Gentle soft washing to clean your home's exterior siding safely.",
      image: getImageUrl("service_house", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"),
      href: "/services#house-washing",
    },
    {
      title: "Gutter Cleaning",
      description: "Complete gutter cleaning and maintenance services.",
      image: getImageUrl("service_gutter", "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"),
      href: "/services#gutter-cleaning",
    },
  ];

  return (
    <section id="services" className="py-16 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">HOW CAN WE HELP YOU TODAY?</h2>
          <p className="text-lg text-gray-600">Professional exterior cleaning services for your home or business</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary-dark">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
