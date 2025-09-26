import { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Award, Users, TrendingUp, Heart, Clock, Leaf, Shield, Star, Factory, Truck, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Harsha Delights | Premium Confectionery Since 1998',
  description: 'Learn about Harsha Delights heritage in creating premium traditional sweets, chocolates, and confectionery. Discover our journey, values, and commitment to quality.',
  keywords: 'about harsha delights, confectionery heritage, traditional sweets history, premium chocolates manufacturer',
  openGraph: {
    title: 'About Harsha Delights - Heritage & Quality Since 1998',
    description: 'Discover the story behind premium confectionery excellence and our commitment to traditional flavors with modern quality.',
    url: 'https://harshadelights.com/about',
    images: ['/images/og-about.jpg'],
  },
};

const milestones = [
  {
    year: '1998',
    title: 'Founded with Passion',
    description: 'Started as a small family business with a passion for creating authentic traditional sweets',
    icon: Heart,
  },
  {
    year: '2005',
    title: 'Quality Certification',
    description: 'Achieved FSSAI certification and established quality control processes',
    icon: Shield,
  },
  {
    year: '2012',
    title: 'Expansion & Growth',
    description: 'Expanded product range to include premium chocolates and namkeens',
    icon: TrendingUp,
  },
  {
    year: '2018',
    title: 'Modern Facility',
    description: 'Upgraded to state-of-the-art manufacturing facility with advanced equipment',
    icon: Factory,
  },
  {
    year: '2022',
    title: 'Digital Transformation',
    description: 'Embraced technology for better customer experience and operational efficiency',
    icon: Star,
  },
  {
    year: '2025',
    title: 'Future Vision',
    description: 'Launching comprehensive digital platform for enhanced customer experience',
    icon: Truck,
  },
];

const values = [
  {
    title: 'Quality First',
    description: 'We never compromise on the quality of ingredients and manufacturing processes',
    icon: Award,
    color: 'text-harsha-orange-500',
  },
  {
    title: 'Traditional Heritage',
    description: 'Preserving authentic recipes and traditional methods passed down through generations',
    icon: Heart,
    color: 'text-red-500',
  },
  {
    title: 'Customer Focus',
    description: 'Every decision we make puts our customers satisfaction and health first',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Innovation',
    description: 'Combining traditional flavors with modern technology and presentation',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    title: 'Sustainability',
    description: 'Committed to environmentally responsible practices and sustainable sourcing',
    icon: Leaf,
    color: 'text-emerald-500',
  },
  {
    title: 'Trust & Transparency',
    description: 'Building lasting relationships through honest business practices',
    icon: CheckCircle,
    color: 'text-indigo-500',
  },
];

const stats = [
  { label: 'Years of Excellence', value: '25+', icon: Clock },
  { label: 'Products Varieties', value: '500+', icon: Star },
  { label: 'Happy Customers', value: '10,000+', icon: Users },
  { label: 'Quality Certifications', value: '15+', icon: Award },
];

const certifications = [
  'FSSAI Licensed',
  'ISO 22000:2018',
  'HACCP Certified',
  'Organic Certified',
  'Halal Certified',
  'Export Certified',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-harsha-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Journey of
                <span className="text-harsha-orange-500"> Excellence</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                For over 25 years, Harsha Delights has been crafting premium confectionery that brings joy to millions of customers.
                Our commitment to quality, tradition, and innovation has made us a trusted name in the industry.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Heart className="w-5 h-5" />
                  Our Story
                </Button>
                <Button variant="outline" size="lg">
                  Quality Standards
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-harsha-orange-200 to-harsha-orange-400 flex items-center justify-center">
                  <Factory className="w-32 h-32 text-white" />
                </div>
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-harsha-orange-500">25+</div>
                  <div className="text-sm text-gray-600">Years</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-harsha-orange-500">10K+</div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-harsha-orange-100 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-harsha-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey Through Time
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to becoming a trusted name in confectionery,
              each milestone represents our commitment to excellence.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-harsha-orange-200 h-full"></div>

            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-16 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="text-harsha-orange-500 font-bold text-lg mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-harsha-orange-500 rounded-full flex items-center justify-center z-10">
                  <milestone.icon className="w-6 h-6 text-white" />
                </div>

                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide every decision we make and every product we create.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group p-6 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-harsha-orange-200">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${value.color} bg-gray-50 group-hover:bg-white`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Certifications */}
      <section className="py-20 bg-gradient-to-br from-harsha-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Quality &amp; Certifications
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our commitment to quality is backed by rigorous standards and certifications that ensure
                every product meets the highest safety and quality benchmarks.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{cert}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="gap-2">
                <Shield className="w-5 h-5" />
                View Certificates
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Manufacturing Excellence</h3>
                <p className="text-gray-600 mb-4">
                  Our state-of-the-art facility combines traditional methods with modern technology to ensure
                  consistent quality and safety in every batch.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Temperature-controlled production areas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automated quality testing at every stage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Hygienic packaging in controlled environment
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ingredient Sourcing</h3>
                <p className="text-gray-600 mb-4">
                  We source only the finest ingredients from trusted suppliers, ensuring authenticity and quality in every product.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-harsha-orange-100 text-harsha-orange-700 rounded-full text-sm">Premium Nuts</span>
                  <span className="px-3 py-1 bg-harsha-orange-100 text-harsha-orange-700 rounded-full text-sm">Pure Ghee</span>
                  <span className="px-3 py-1 bg-harsha-orange-100 text-harsha-orange-700 rounded-full text-sm">Organic Sugar</span>
                  <span className="px-3 py-1 bg-harsha-orange-100 text-harsha-orange-700 rounded-full text-sm">Natural Colors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-harsha-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience Our Quality?
          </h2>
          <p className="text-xl text-harsha-orange-100 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Harsha Delights for their confectionery needs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="secondary" size="lg" className="gap-2">
              <Star className="w-5 h-5" />
              View Products
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-harsha-orange-600">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}