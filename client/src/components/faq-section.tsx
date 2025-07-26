import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { FAQ } from "@shared/schema";

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect Pressure Power Washing FAQ's</h2>
            <p className="text-lg text-gray-600">Common questions about our services</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg animate-pulse">
                <div className="h-16 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect Pressure Power Washing FAQ's</h2>
          <p className="text-lg text-gray-600">Common questions about our services</p>
        </div>
        
        <div className="space-y-4">
          {faqs?.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg">
              <button
                className="w-full text-left px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary flex justify-between items-center"
                onClick={() => toggleFAQ(faq.id)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openFAQ === faq.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 transition-transform" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform" />
                )}
              </button>
              {openFAQ === faq.id && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
