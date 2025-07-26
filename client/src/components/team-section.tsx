export default function TeamSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet The Eco Clean Team:</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet Nevin and Terrance, the dynamic duo behind Eco Clean Power Washing! 
            Specializing in pressure and soft washing, they're dedicated to revitalizing 
            homes in Harrisburg and Mechanicsburg. With their eco-friendly approach, 
            they'll leave your surfaces sparkling clean while caring for the planet.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="text-center">
            <img 
              src="https://lirp.cdn-website.com/6c98a53d/dms3rep/multi/opt/IMG_0731-1070w.JPG" 
              alt="Nevin - Eco Clean Team Member" 
              className="w-64 h-64 rounded-full mx-auto mb-4 object-cover shadow-lg"
            />
            <h3 className="text-xl font-bold text-gray-900">Nevin Shields</h3>
            <p className="text-gray-600">Co-Owner & Power Washing Expert</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <iframe 
                width="100%" 
                height="200" 
                src="https://www.youtube.com/embed/9yydvEsRnxc" 
                frameBorder="0" 
                allowFullScreen 
                className="rounded-lg"
                title="Meet the Eco Clean Team"
              ></iframe>
            </div>
            <p className="text-gray-600 italic">"Let the Eco Clean team brighten your day!"</p>
          </div>
          
          <div className="text-center">
            <img 
              src="https://lirp.cdn-website.com/6c98a53d/dms3rep/multi/opt/IMG_0730-1070w.jpg" 
              alt="Terrance - Eco Clean Team Member" 
              className="w-64 h-64 rounded-full mx-auto mb-4 object-cover shadow-lg"
            />
            <h3 className="text-xl font-bold text-gray-900">Terrance</h3>
            <p className="text-gray-600">Co-Owner & Cleaning Specialist</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <img 
                src="https://irp.cdn-website.com/6c98a53d/dms3rep/multi/neighborhood_fave_2021.svg" 
                alt="Nextdoor Neighborhood Favorite 2021" 
                className="h-24 mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">Neighborhood Fave 2021</p>
            </div>
            <div className="text-center">
              <img 
                src="https://irp.cdn-website.com/6c98a53d/dms3rep/multi/neighborhood_fave_2023.svg" 
                alt="Nextdoor Neighborhood Favorite 2023" 
                className="h-24 mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">Neighborhood Fave 2023</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
