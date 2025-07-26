import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calculator, Phone, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Hero() {
  // Enable real-time updates via WebSocket
  useWebSocket("/ws");
  
  // Get site settings for dynamic content
  const { data: siteSettings = [] } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const response = await fetch("/api/site-settings");
      return response.json();
    },
  });
  
  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: string = "") => {
    const setting = siteSettings.find((s: any) => s.key === key);
    return setting?.value || defaultValue;
  };
  
  return (
    <section 
      className="bg-gradient-to-br from-primary to-blue-600 text-white py-20 bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/uploads/image-1753243531214-598432578.png')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            POWER WASHING SERVICE IN<br />Bentonville, Rogers, Little Flock, Bella Vista
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Professional Perfect Pressure Power Washing Services
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Link href="/cost-calculator">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all"
              >
                <Calculator className="mr-2 h-5 w-5" />
                ONLINE HOUSE WASH ESTIMATE
              </Button>
            </Link>
            
            <a href={`tel:${getSetting("phone_number", "(479) 399-8717")}`}>
              <Button
                size="lg"
                className="bg-success text-white hover:bg-green-600 transform hover:scale-105 transition-all"
              >
                <Phone className="mr-2 h-5 w-5" />
                CALL NOW
              </Button>
            </a>
            
            <a href={`sms:${getSetting("phone_number", "(479) 399-8717")}`}>
              <Button
                size="lg"
                className="bg-warning text-white hover:bg-orange-600 transform hover:scale-105 transition-all"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                TEXT US
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
