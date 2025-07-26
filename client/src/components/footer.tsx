import { Star } from "lucide-react";
import { SiTiktok } from "react-icons/si";
// import perfectPressureLogo from "../assets/perfect-pressure-logo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img 
              src="/perfect-pressure-logo.png" 
              alt="Perfect Pressure Power Washing Logo" 
              className="h-16 mb-4"
            />
            <p className="text-gray-300 mb-4">
              Professional power washing services in Bentonville, Bella Vista, and surrounding areas. 
              Perfect Pressure solutions for your home and business.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61576002187320" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@aquawashco" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <SiTiktok className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Star className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/services#pressure-washing" className="hover:text-white">Pressure Washing</a></li>
              <li><a href="/services#house-washing" className="hover:text-white">House Washing</a></li>
              <li><a href="/services#gutter-cleaning" className="hover:text-white">Gutter Cleaning</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="inline-block mr-2">📞</span>
                <a href="tel:(479) 399-8717" className="hover:text-white">(479) 399-8717</a>
              </p>
              <p>
                <span className="inline-block mr-2">📧</span>
                <a href="mailto:perfectpreasure@gmail.com" className="hover:text-white">perfectpreasure@gmail.com</a>
              </p>
              <p>
                <span className="inline-block mr-2">📍</span>
                Serving Bentonville, Rogers, Little Flock, Bella Vista & Surrounding Areas
              </p>
              <p>
                <span className="inline-block mr-2">🕒</span>
                Mon-Fri: 8AM-6PM
              </p>
              <p>
                <span className="inline-block mr-2">🕒</span>
                Sat: 9AM-4PM
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Perfect Pressure Power Washing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
