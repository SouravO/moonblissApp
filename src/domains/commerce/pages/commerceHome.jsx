import { useState, useEffect } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { IonCard, IonCardContent, IonButton, IonHeader } from "@ionic/react";
import { IonIcon } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";

// Import images
// import img1 from "/images/product/product1.jpg";
// import img2 from "/images/product/product2.jpg";
// import img3 from "/images/product/product3.jpg";
import img1 from "../../../../public/images/product/product1.jpg";
import img2 from "../../../../public/images/product/product2.png";
import img3 from "../../../../public/images/product/product3.png";
const CommerceHome = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const product = {
    title: "Moonbliss Wellness Kit",
    description:
      "A thoughtfully curated wellness kit designed to support comfort and balance during your cycle.",
    price: "₹1,299",
    images: [
      img1,
      img2,
      img3,

      //   "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop",
      //   "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      //   "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    ],
  };

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [product.images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % product.images.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  return (
    <PageLayout title="Store">
      <IonHeader>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Welcome to the Moonbliss Store! 🛍️
        </h1>
        <p className="text-gray-600 text-center">
          Discover products designed for your wellness journey
        </p>
      </IonHeader>
      <div className="p-10 shadow-2xl m-4 rounded-3xl bg-gradient-to-br from-green-100 to-green-200  ">
        <IonCard className="rounded-2xl overflow-hidden ">
          {/* 🔹 Image Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-400 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-full h-56 object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md"
            >
              <IonIcon icon={chevronBackOutline} className="text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md"
            >
              <IonIcon icon={chevronForwardOutline} className="text-gray-700" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 🔹 Product Content */}
          <IonCardContent className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {product.title}
            </h2>

            <p className="text-sm text-gray-600">{product.description}</p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-bold text-emerald-600">
                {product.price}
              </span>

              <button
                shape="round"
                className="bg-emerald-500 text-white p-10 px-12 rounded-full shadow-md hover:bg-emerald-600 transition-colors"
              >
                Buy Now
              </button>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    </PageLayout>
  );
};

export default CommerceHome;
