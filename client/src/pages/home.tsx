import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import QuoteForm from "@/components/quote-form";

import ServicesSection from "@/components/services-section";
import ProcessSection from "@/components/process-section";
import Gallery from "@/components/gallery";
import FAQSection from "@/components/faq-section";
import BlogSection from "@/components/blog-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <QuoteForm />
      <ServicesSection />
      <ProcessSection />
      <Gallery />
      <FAQSection />
      <BlogSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
