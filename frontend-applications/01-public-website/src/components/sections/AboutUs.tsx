'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Award, Users, TrendingUp, Heart, Clock, Leaf, Shield, Star } from 'lucide-react';

const milestones = [
  {
    year: '1998',
    title: 'Founded with Passion',
    description: 'Started as a small family business with traditional recipes passed down through generations.',
  },
  {
    year: '2005',
    title: 'First Major Expansion',
    description: 'Opened our flagship store and began wholesale operations across the region.',
  },
  {
    year: '2012',
    title: 'Quality Certification',
    description: 'Received FSSAI certification and implemented international quality standards.',
  },
  {
    year: '2018',
    title: 'Digital Transformation',
    description: 'Launched online platform and expanded delivery network across India.',
  },
  {
    year: '2023',
    title: 'Premium Recognition',
    description: 'Recognized as one of India\'s top confectionery brands with 10,000+ satisfied customers.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Authentic Flavors',
    description: 'Every product is crafted with traditional recipes that have been perfected over generations.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    icon: Leaf,
    title: 'Pure Ingredients',
    description: 'We source only the finest, natural ingredients to ensure the highest quality in every bite.',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Shield,
    title: 'Food Safety',
    description: 'Strict hygiene standards and FSSAI certification guarantee safe, clean production.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Clock,
    title: 'Fresh Daily',
    description: 'Most products are made fresh daily to deliver the best taste and texture.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
];

const achievements = [
  { icon: Users, label: 'Happy Customers', value: '10,000+', color: 'text-blue-600' },
  { icon: Award, label: 'Years of Excellence', value: '25+', color: 'text-purple-600' },
  { icon: TrendingUp, label: 'Products Delivered', value: '1M+', color: 'text-green-600' },
  { icon: Star, label: 'Average Rating', value: '4.9/5', color: 'text-yellow-600' },
];

export default function AboutUs() {
  const [currentMilestone, setCurrentMilestone] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMilestone((prev) => (prev + 1) % milestones.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-harsha-orange-100 rounded-full px-4 py-2 text-sm font-medium text-harsha-orange-700">
            <Heart className="h-4 w-4" />
            <span>Our Story</span>
          </div>

          <h2 className="heading-responsive font-bold text-gray-900">
            25 Years of Sweet Traditions
          </h2>

          <p className="body-responsive text-gray-600 max-w-3xl mx-auto">
            From a small family kitchen to one of India's trusted confectionery brands,
            our journey has been sweetened by the love and trust of thousands of families.
          </p>
        </div>

        {/* Hero Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Story Content */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">
              A Legacy Built on
              <span className="hero-text-gradient"> Authentic Flavors</span>
            </h3>

            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded in 1998 by the Sharma family, Harsha Delights began as a humble venture
                driven by passion for traditional Indian confectionery. What started in a small
                kitchen with grandmother's recipes has grown into a beloved brand across India.
              </p>

              <p>
                Our commitment to authenticity means every sweet, chocolate, and namkeen is
                crafted using time-honored techniques combined with modern food safety standards.
                We believe that the best flavors come from the heart, pure ingredients, and
                unwavering dedication to quality.
              </p>

              <p>
                Today, we're proud to serve over 10,000 customers nationwide, delivering not just
                products, but memories and traditions that bring families together during
                celebrations and everyday moments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="primary" size="lg">
                Learn More About Us
              </Button>
              <Button variant="outline" size="lg">
                Visit Our Store
              </Button>
            </div>
          </div>

          {/* Visual Content */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-harsha-orange-100 to-harsha-yellow-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-harsha-orange-200 rounded-full mx-auto flex items-center justify-center">
                    <div className="w-20 h-20 bg-harsha-orange-500 rounded-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold text-gray-800">Since 1998</h4>
                    <p className="text-gray-600">Crafting Sweet Memories</p>
                  </div>
                </div>
              </div>

              {/* Floating Achievement Cards */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-float">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-sm font-bold">FSSAI Certified</div>
                    <div className="text-xs text-gray-600">Quality Assured</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-float animate-delay-300">
                <div className="text-center">
                  <div className="text-lg font-bold text-harsha-orange-600">10,000+</div>
                  <div className="text-xs text-gray-600">Happy Families</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.label}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${achievement.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{achievement.value}</div>
              <div className="text-sm text-gray-600">{achievement.label}</div>
            </div>
          ))}
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from sourcing ingredients to delivering the final product.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={`${value.bgColor} rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 animate-slide-up`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${value.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                  <value.icon className={`h-8 w-8 ${value.color}`} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h3>
            <p className="text-gray-600">Key milestones that shaped Harsha Delights</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-harsha-orange-200" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} animate-slide-up`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className={`${index === currentMilestone ? 'scale-105 shadow-lg' : ''} bg-gray-50 rounded-xl p-6 transition-all duration-500`}>
                      <div className="text-2xl font-bold text-harsha-orange-600 mb-2">{milestone.year}</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className={`w-4 h-4 rounded-full border-4 border-white shadow-lg transition-all duration-500 ${
                    index === currentMilestone ? 'bg-harsha-orange-500 scale-150' : 'bg-harsha-orange-300'
                  }`} />

                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}