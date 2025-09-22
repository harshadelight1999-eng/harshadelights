'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import {
  Shield,
  Truck,
  Clock,
  Award,
  Leaf,
  Heart,
  Phone,
  Star,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface Feature {
  id: string;
  icon: any;
  title: string;
  description: string;
  highlights: string[];
  color: string;
  bgColor: string;
  stats?: {
    value: string;
    label: string;
  };
}

const features: Feature[] = [
  {
    id: 'quality',
    icon: Shield,
    title: 'Uncompromising Quality',
    description: 'FSSAI certified production with international quality standards and rigorous testing.',
    highlights: [
      'FSSAI certified facilities',
      'International quality standards',
      'Regular quality audits',
      'Premium ingredient sourcing'
    ],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    stats: {
      value: '99.9%',
      label: 'Quality Score'
    }
  },
  {
    id: 'freshness',
    icon: Clock,
    title: 'Made Fresh Daily',
    description: 'Most products are prepared fresh daily to ensure optimal taste and texture.',
    highlights: [
      'Daily fresh preparation',
      'Same-day delivery options',
      'No preservatives in traditional items',
      'Optimal storage conditions'
    ],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    stats: {
      value: '24hrs',
      label: 'Maximum Age'
    }
  },
  {
    id: 'delivery',
    icon: Truck,
    title: 'Fast & Reliable Delivery',
    description: 'Pan-India delivery network with temperature-controlled transportation.',
    highlights: [
      'Same-day delivery in major cities',
      'Temperature-controlled vehicles',
      'Secure packaging',
      'Real-time tracking'
    ],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    stats: {
      value: '200+',
      label: 'Daily Deliveries'
    }
  },
  {
    id: 'heritage',
    icon: Award,
    title: '25+ Years Experience',
    description: 'A quarter-century of expertise in traditional and modern confectionery.',
    highlights: [
      'Traditional family recipes',
      'Master craftsmen',
      'Time-tested processes',
      'Continuous innovation'
    ],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    stats: {
      value: '25+',
      label: 'Years Experience'
    }
  },
  {
    id: 'natural',
    icon: Leaf,
    title: 'Pure & Natural Ingredients',
    description: 'Carefully sourced natural ingredients with no artificial additives.',
    highlights: [
      'No artificial colors',
      'Pure ghee and milk',
      'Premium nuts and dry fruits',
      'Natural flavoring'
    ],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    stats: {
      value: '100%',
      label: 'Pure Ingredients'
    }
  },
  {
    id: 'service',
    icon: Heart,
    title: 'Exceptional Customer Care',
    description: 'Dedicated support team ensuring every customer has a delightful experience.',
    highlights: [
      '24/7 customer support',
      'Easy returns and refunds',
      'Custom gift packaging',
      'Personal recommendations'
    ],
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    stats: {
      value: '4.9/5',
      label: 'Customer Rating'
    }
  }
];

const testimonialStats = [
  { icon: Star, label: 'Customer Rating', value: '4.9/5', color: 'text-yellow-600' },
  { icon: TrendingUp, label: 'Repeat Customers', value: '85%', color: 'text-blue-600' },
  { icon: CheckCircle, label: 'Satisfaction Rate', value: '98%', color: 'text-green-600' },
  { icon: Phone, label: 'Support Rating', value: '4.8/5', color: 'text-purple-600' },
];

export default function WhyChooseUs() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-harsha-orange-100 rounded-full px-4 py-2 text-sm font-medium text-harsha-orange-700">
            <Star className="h-4 w-4 fill-current" />
            <span>Why Choose Us</span>
          </div>

          <h2 className="heading-responsive font-bold text-gray-900">
            What Makes Us
            <span className="hero-text-gradient"> India's Trusted Choice</span>
          </h2>

          <p className="body-responsive text-gray-600 max-w-3xl mx-auto">
            With over 25 years of expertise and 10,000+ satisfied customers, we've built our
            reputation on quality, authenticity, and exceptional service that goes beyond expectations.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 p-6 bg-gray-50 rounded-2xl">
          {testimonialStats.map((stat, index) => (
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`relative group p-6 rounded-2xl transition-all duration-300 hover:shadow-lg ${feature.bgColor} animate-slide-up`}
              style={{ animationDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Feature Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${feature.color.replace('text-', 'bg-').replace('-600', '-100')} transition-transform duration-300 ${
                  hoveredFeature === feature.id ? 'scale-110' : ''
                }`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>

                {/* Stats Badge */}
                {feature.stats && (
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${feature.color}`}>{feature.stats.value}</div>
                    <div className="text-xs text-gray-600">{feature.stats.label}</div>
                  </div>
                )}
              </div>

              {/* Feature Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>

                {/* Feature Highlights */}
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className={`h-4 w-4 ${feature.color} flex-shrink-0`} />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 ${
                hoveredFeature === feature.id ? 'opacity-100' : ''
              }`} />
            </div>
          ))}
        </div>

        {/* Quality Assurance Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  Quality Assurance
                  <span className="hero-text-gradient"> You Can Trust</span>
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  Every product that leaves our facility undergoes rigorous quality checks.
                  From ingredient sourcing to final packaging, we maintain the highest
                  standards to ensure you receive only the best.
                </p>
              </div>

              {/* Quality Features */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Shield, text: 'FSSAI Certified' },
                  { icon: Leaf, text: 'Natural Ingredients' },
                  { icon: Award, text: 'Quality Awards' },
                  { icon: CheckCircle, text: 'Regular Audits' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <item.icon className="h-5 w-5 text-harsha-orange-600" />
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button variant="primary" size="lg">
                  Learn About Our Process
                </Button>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-harsha-orange-100 to-harsha-yellow-100 p-8">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    {/* Central Quality Badge */}
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-12 h-12 text-harsha-orange-600" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-gray-800">FSSAI Certified</h4>
                      <p className="text-gray-600 text-sm">License No: 12345678901234</p>
                    </div>

                    {/* Quality Indicators */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-harsha-orange-600">A+</div>
                        <div className="text-xs text-gray-600">Hygiene Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-xs text-gray-600">Pure Ingredients</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Quality Badges */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md animate-float">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xs font-bold">ISO 22000</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md animate-float animate-delay-300">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold">Quality Assured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}