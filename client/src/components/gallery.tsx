import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { GalleryImage } from "@shared/schema";

export default function Gallery() {
  const { data: images, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery/featured"],
  });

  if (isLoading) {
    return (
      <section id="gallery" className="py-16 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Before & After Gallery</h2>
            <p className="text-lg text-gray-600">See the amazing transformations we've achieved for our clients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="h-64 bg-gray-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-16 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Before & After Gallery</h2>
          <p className="text-lg text-gray-600">See the amazing transformations we've achieved for our clients</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images?.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={image.beforeImage} 
                  alt={`${image.title} - Before`}
                  className="w-full h-64 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                  BEFORE
                </Badge>
              </div>
              <div className="relative">
                <img 
                  src={image.afterImage} 
                  alt={`${image.title} - After`}
                  className="w-full h-64 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-success text-white">
                  AFTER
                </Badge>
              </div>
              {image.description && (
                <div className="p-4">
                  <p className="text-sm text-gray-600 text-center">{image.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
