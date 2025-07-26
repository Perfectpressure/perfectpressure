import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, Home } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      icon: MessageCircle,
      title: "Reach Out Online",
      description: "Request a free online quote from our website or give us a call.",
    },
    {
      icon: Calendar,
      title: "Schedule The Job",
      description: "We will reach out to you to determine what you would like cleaned and set up a date.",
    },
    {
      icon: Home,
      title: "Enjoy Your Clean Property!",
      description: "Sit back and admire your beautifully cleaned home's siding!",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Our System Works:</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-primary-light text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="transform hover:scale-105 transition-all"
            asChild
          >
            <a href="#contact">Free Quote →</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
