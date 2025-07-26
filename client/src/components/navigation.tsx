import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Calculator, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
// import perfectPressureLogo from "../assets/perfect-pressure-logo.png";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  
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

  const navItems = [
    { href: "/services", label: "Services" },
    { href: "/#about", label: "About" },
    { href: "/#gallery", label: "Gallery" },
    { href: "/blog", label: "Blog" },
    { href: "/#contact", label: "Contact" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    
    // Handle anchor links
    if (href.startsWith("/#")) {
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/perfect-pressure-logo.png" 
              alt="Perfect Pressure Power Washing Logo" 
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">
                Perfect Pressure
              </h1>
              <p className="text-sm text-gray-600">
                Professional Power Washing Services
              </p>
            </div>
          </Link>
          
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith("/#")) {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }
                }}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/cost-calculator">
              <Button className="bg-primary text-white hover:bg-primary-dark">
                <Calculator className="mr-2 h-4 w-4" />
                Cost Calculator
              </Button>
            </Link>
            <a href={`tel:${getSetting("phone_number", "(479) 399-8717")}`}>
              <Button className="bg-success text-white hover:bg-green-600">
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
            </a>
          </div>
          
          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t">
            <div className="flex flex-col space-y-2 pt-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith("/#")) {
                      e.preventDefault();
                      handleNavClick(item.href);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                  className="px-3 py-2 text-gray-700 hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
