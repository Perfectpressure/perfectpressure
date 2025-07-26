import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Zap, Droplets, Wind, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ImageAsset } from "@/../../shared/schema";

export default function Services() {
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
      id: "pressure-washing",
      title: "Pressure Washing",
      icon: Zap,
      description: "High-pressure cleaning for driveways, sidewalks, and other hard surfaces.",
      features: [
        "Removes years of dirt buildup",
        "Effective oil stain removal",
        "Concrete and paver cleaning",
        "Driveway and walkway restoration",
        "Commercial-grade equipment"
      ],
      startingPrice: "$0.10 per sq ft",
      image: getImageUrl("service_pressure", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400")
    },
    {
      id: "house-washing",
      title: "House Washing",
      icon: Home,
      description: "Professional soft washing to clean your home's exterior safely and effectively.",
      features: [
        "Eco-friendly cleaning solutions",
        "Safe for plants and landscaping",
        "Removes algae, mold, and mildew",
        "Protects your home's value",
        "Professional equipment and techniques"
      ],
      startingPrice: "$200+",
      image: getImageUrl("service_house", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400")
    },
    {
      id: "gutter-cleaning",
      title: "Gutter Cleaning",
      icon: Wind,
      description: "Complete gutter cleaning and maintenance to protect your home.",
      features: [
        "Prevents water damage",
        "Removes debris and blockages",
        "Gutter brightening service",
        "Downspout cleaning",
        "Seasonal maintenance available"
      ],
      startingPrice: "$100+",
      image: getImageUrl("service_gutter", "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400")
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 pb-16 bg-gradient-to-br from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Professional exterior cleaning services for residential and commercial properties
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="hover:shadow-xl transition-shadow">
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconComponent className="mr-2 h-5 w-5 text-primary" />
                      {service.title}
                    </CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-500">Starting at</span>
                        <div className="text-2xl font-bold text-primary">{service.startingPrice}</div>
                      </div>
                      <Button asChild>
                        <a href="/#contact">Get Quote</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Perfect Pressure Power Washing?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We're committed to providing the highest quality exterior cleaning services while protecting your property and the environment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Insured</h3>
              <p className="text-gray-600">Licensed and insured for your peace of mind</p>
            </div>
            
            <div className="text-center">
              <div className="bg-success/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Perfect Pressure</h3>
              <p className="text-gray-600">Safe for your family, pets, and landscaping</p>
            </div>
            
            <div className="text-center">
              <div className="bg-warning/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Results</h3>
              <p className="text-gray-600">Expert techniques and commercial-grade equipment</p>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button size="lg" asChild>
              <a href="/cost-calculator">Get Instant Quote</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="tel:(479) 399-8717">Call (479) 399-8717</a>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
