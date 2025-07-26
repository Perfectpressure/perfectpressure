import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 pb-16 bg-gradient-to-br from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog & News
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Stay informed with our latest cleaning tips, project showcases, and industry insights
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-xl transition-shadow">
                  {post.image && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {post.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <a 
                        href={`#blog-post-${post.slug}`}
                        className="text-primary hover:text-primary-dark font-medium text-sm flex items-center"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">No blog posts found</div>
            </div>
          )}
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Follow our blog for the latest tips, project showcases, and industry news
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/#contact"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Subscribe to Updates
            </a>
            <a 
              href="/#contact"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
