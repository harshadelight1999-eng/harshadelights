'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, Calendar, ThumbsUp, MessageCircle } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  review: string;
  product: string;
  image?: string;
  verified: boolean;
  helpful: number;
  category: 'sweets' | 'chocolates' | 'namkeens' | 'service' | 'delivery';
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    date: '2024-01-15',
    review: 'The Kaju Katli from Harsha Delights is absolutely divine! It reminds me of the sweets my grandmother used to make. The texture is perfect, melts in your mouth, and the silver leaf adds such an elegant touch. Ordered for Diwali and everyone loved it.',
    product: 'Premium Kaju Katli',
    verified: true,
    helpful: 24,
    category: 'sweets',
  },
  {
    id: '2',
    name: 'Rajesh Patel',
    location: 'Ahmedabad, Gujarat',
    rating: 5,
    date: '2024-01-10',
    review: 'Outstanding quality and taste! I ordered a variety box for my daughter\'s wedding and the guests couldn\'t stop praising the sweets. The packaging was beautiful and delivery was right on time. Harsha Delights has become our go-to for all celebrations.',
    product: 'Wedding Special Box',
    verified: true,
    helpful: 31,
    category: 'service',
  },
  {
    id: '3',
    name: 'Meera Reddy',
    location: 'Hyderabad, Telangana',
    rating: 5,
    date: '2024-01-08',
    review: 'The Belgian chocolate collection is exceptional! Each piece is a work of art. The flavors are rich and authentic. Perfect for gifting to someone special. The temperature-controlled delivery ensured they arrived in perfect condition.',
    product: 'Belgian Chocolate Collection',
    verified: true,
    helpful: 18,
    category: 'chocolates',
  },
  {
    id: '4',
    name: 'Amit Singh',
    location: 'Delhi, NCR',
    rating: 5,
    date: '2024-01-05',
    review: 'Amazing mixture namkeen! The perfect blend of spices and crunch. It\'s become our family\'s favorite tea-time snack. The quality is consistent and the packaging keeps it fresh for weeks. Highly recommend!',
    product: 'Special Mixture Namkeen',
    verified: true,
    helpful: 15,
    category: 'namkeens',
  },
  {
    id: '5',
    name: 'Deepika Joshi',
    location: 'Pune, Maharashtra',
    rating: 5,
    date: '2024-01-03',
    review: 'Incredible customer service! When my order got delayed due to weather, they immediately called to inform me and offered a compensation. The team went above and beyond to ensure I received my order in perfect condition. This is what customer care should be like!',
    product: 'Dry Fruits Combo',
    verified: true,
    helpful: 22,
    category: 'service',
  },
  {
    id: '6',
    name: 'Suresh Kumar',
    location: 'Bangalore, Karnataka',
    rating: 5,
    date: '2023-12-28',
    review: 'The dry fruits are of premium quality! Fresh, crunchy, and perfectly packed. You can tell they source the best ingredients. The almonds and cashews are particularly excellent. Great value for money.',
    product: 'Premium Dry Fruits Box',
    verified: true,
    helpful: 19,
    category: 'sweets',
  },
];

const categories = [
  { id: 'all', label: 'All Reviews', count: testimonials.length },
  { id: 'sweets', label: 'Sweets', count: testimonials.filter(t => t.category === 'sweets').length },
  { id: 'chocolates', label: 'Chocolates', count: testimonials.filter(t => t.category === 'chocolates').length },
  { id: 'service', label: 'Service', count: testimonials.filter(t => t.category === 'service').length },
  { id: 'namkeens', label: 'Namkeens', count: testimonials.filter(t => t.category === 'namkeens').length },
];

const overallStats = [
  { label: 'Average Rating', value: '4.9', icon: Star, color: 'text-yellow-600' },
  { label: 'Total Reviews', value: '2,547', icon: MessageCircle, color: 'text-blue-600' },
  { label: 'Verified Buyers', value: '98%', icon: ThumbsUp, color: 'text-green-600' },
  { label: 'Recommend Us', value: '97%', icon: ThumbsUp, color: 'text-purple-600' },
];

export default function Testimonials() {
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const filteredTestimonials = currentCategory === 'all'
    ? testimonials
    : testimonials.filter(t => t.category === currentCategory);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        (prevIndex + 1) % Math.min(filteredTestimonials.length, 3)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredTestimonials.length, isAutoPlay]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [currentCategory]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex + 1) % Math.min(filteredTestimonials.length, 3)
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.min(filteredTestimonials.length, 3) - 1 : prevIndex - 1
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayedTestimonials = filteredTestimonials.slice(currentIndex, currentIndex + 3);

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-harsha-orange-100 rounded-full px-4 py-2 text-sm font-medium text-harsha-orange-700">
            <Quote className="h-4 w-4" />
            <span>Customer Reviews</span>
          </div>

          <h2 className="heading-responsive font-bold text-gray-900">
            What Our Customers
            <span className="hero-text-gradient"> Say About Us</span>
          </h2>

          <p className="body-responsive text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what thousands of satisfied customers
            across India have to say about their experience with Harsha Delights.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 p-6 bg-white rounded-2xl shadow-sm">
          {overallStats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center space-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                currentCategory === category.id
                  ? 'bg-harsha-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-harsha-orange-50 hover:text-harsha-orange-600'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Testimonials Display */}
        <div className="relative">
          {/* Navigation Controls */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentCategory === 'all' ? 'Latest Reviews' : `${categories.find(c => c.id === currentCategory)?.label} Reviews`}
              </h3>
              <span className="text-sm text-gray-500">
                ({filteredTestimonials.length} reviews)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isAutoPlay ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isAutoPlay ? 'Auto' : 'Manual'}
              </button>

              <div className="flex space-x-1">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-full bg-white shadow-md hover:bg-harsha-orange-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-full bg-white shadow-md hover:bg-harsha-orange-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {displayedTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      {testimonial.verified && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                          <ThumbsUp className="h-3 w-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{testimonial.location}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(testimonial.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Product */}
                <div className="mb-4">
                  <span className="inline-block bg-harsha-orange-100 text-harsha-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                    {testimonial.product}
                  </span>
                </div>

                {/* Review Text */}
                <blockquote className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                  "{testimonial.review}"
                </blockquote>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{testimonial.helpful} found helpful</span>
                  </div>
                  <button className="text-harsha-orange-600 hover:text-harsha-orange-700 font-medium">
                    Helpful?
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: Math.ceil(filteredTestimonials.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 3) === index
                    ? 'bg-harsha-orange-500 w-6'
                    : 'bg-gray-300 hover:bg-harsha-orange-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-white rounded-2xl shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Share Your Experience
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We love hearing from our customers! Share your experience and help others
            discover the joy of authentic flavors from Harsha Delights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg">
              Write a Review
            </Button>
            <Button variant="outline" size="lg">
              View All Reviews
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}