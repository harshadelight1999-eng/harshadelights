import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Globe,
  Users,
  Building,
  Truck,
  HeadphonesIcon,
  MessageCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Harsha Delights | Get in Touch for Premium Confectionery',
  description: 'Contact Harsha Delights for premium confectionery inquiries, bulk orders, and business partnerships. Multiple ways to reach us including phone, email, and visit our facility.',
  keywords: 'contact harsha delights, confectionery inquiry, bulk orders, business partnership, traditional sweets supplier',
  openGraph: {
    title: 'Contact Harsha Delights - Premium Confectionery Supplier',
    description: 'Get in touch for premium confectionery needs, bulk orders, and business partnerships.',
    url: 'https://harshadelights.com/contact',
    images: ['/images/og-contact.jpg'],
  },
};

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    primary: '+91 98765 43210',
    secondary: '+91 79 2555 1234',
    description: 'Call us for immediate assistance',
    action: 'Call Now',
    href: 'tel:+919876543210',
    available: 'Mon-Sat, 9 AM - 7 PM',
  },
  {
    icon: Mail,
    title: 'Email',
    primary: 'info@harshadelights.com',
    secondary: 'orders@harshadelights.com',
    description: 'Send us your detailed inquiry',
    action: 'Send Email',
    href: 'mailto:info@harshadelights.com',
    available: 'Response within 24 hours',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    primary: '+91 98765 43210',
    secondary: 'Quick support available',
    description: 'Chat with us instantly',
    action: 'Chat Now',
    href: 'https://wa.me/919876543210',
    available: 'Mon-Sat, 9 AM - 9 PM',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    primary: 'Manufacturing Facility',
    secondary: 'Ahmedabad, Gujarat',
    description: 'Schedule a facility tour',
    action: 'Get Directions',
    href: '#location',
    available: 'Mon-Fri, 10 AM - 5 PM',
  },
];

const departments = [
  {
    icon: Building,
    title: 'B2B Sales',
    description: 'Wholesale orders, distributor partnerships',
    contact: 'b2b@harshadelights.com',
    phone: '+91 98765 43211',
  },
  {
    icon: Users,
    title: 'Customer Service',
    description: 'Order support, product inquiries',
    contact: 'support@harshadelights.com',
    phone: '+91 98765 43212',
  },
  {
    icon: Truck,
    title: 'Logistics',
    description: 'Shipping, delivery, tracking',
    contact: 'logistics@harshadelights.com',
    phone: '+91 98765 43213',
  },
  {
    icon: HeadphonesIcon,
    title: 'Quality Assurance',
    description: 'Product quality, feedback, complaints',
    contact: 'quality@harshadelights.com',
    phone: '+91 98765 43214',
  },
];

const faqs = [
  {
    question: 'What is the minimum order quantity for bulk orders?',
    answer: 'Minimum order quantities vary by product. For traditional sweets, it\'s typically 5kg per variety. For chocolates, it\'s 2kg per variety. Contact our B2B team for specific requirements.',
  },
  {
    question: 'Do you offer custom packaging for corporate gifts?',
    answer: 'Yes, we provide custom packaging solutions for corporate gifts and special occasions. We can customize boxes, labels, and even create bespoke product combinations.',
  },
  {
    question: 'What are your delivery areas?',
    answer: 'We deliver across India. Same-day delivery in Ahmedabad, next-day delivery in Gujarat, and 2-5 days for other states. International shipping is available to select countries.',
  },
  {
    question: 'How do you ensure product freshness during delivery?',
    answer: 'We use temperature-controlled packaging and partner with reliable logistics providers. All products are shipped within 24 hours of production for maximum freshness.',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-harsha-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in
              <span className="text-harsha-orange-500"> Touch</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Have questions about our products? Need bulk orders for your business? Want to become a partner?
              We're here to help you with all your confectionery needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <MessageSquare className="w-5 h-5" />
                Quick Inquiry
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Phone className="w-5 h-5" />
                Call Us Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Multiple Ways to Reach Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the most convenient way to connect with us. We're committed to responding promptly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-harsha-orange-200 text-center"
              >
                <div className="w-16 h-16 bg-harsha-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-harsha-orange-500 transition-colors">
                  <method.icon className="w-8 h-8 text-harsha-orange-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="font-semibold text-gray-900">{method.primary}</div>
                  <div className="text-sm text-gray-600">{method.secondary}</div>
                  <div className="text-xs text-harsha-orange-500 font-medium">{method.available}</div>
                </div>

                <a
                  href={method.href}
                  className="inline-flex items-center gap-2 text-harsha-orange-500 font-medium hover:text-harsha-orange-600 transition-colors"
                >
                  {method.action}
                  <Send className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                    >
                      <option value="">Select inquiry type</option>
                      <option value="product">Product Information</option>
                      <option value="bulk">Bulk Orders</option>
                      <option value="partnership">Business Partnership</option>
                      <option value="quality">Quality Concerns</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                    placeholder="Brief subject of your message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent resize-none"
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    className="mt-1 w-5 h-5 text-harsha-orange-500 border-gray-300 rounded focus:ring-harsha-orange-500"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to receive communications from Harsha Delights and understand that I can unsubscribe at any time.
                  </label>
                </div>

                <Button size="lg" className="w-full gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Departments & Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Department Contacts
                </h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-harsha-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <dept.icon className="w-6 h-6 text-harsha-orange-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{dept.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                          <div className="space-y-1">
                            <a
                              href={`mailto:${dept.contact}`}
                              className="text-sm text-harsha-orange-500 hover:text-harsha-orange-600 block"
                            >
                              {dept.contact}
                            </a>
                            <a
                              href={`tel:${dept.phone}`}
                              className="text-sm text-gray-700 hover:text-harsha-orange-600 block"
                            >
                              {dept.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Business Hours
                </h3>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-harsha-orange-500" />
                    <span className="font-semibold text-gray-900">Operating Hours</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="font-medium">9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-medium text-red-500">Closed</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      * Customer service available via WhatsApp until 9:00 PM on weekdays
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Map */}
      <section id="location" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Visit Our Facility
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We welcome visitors to our state-of-the-art manufacturing facility. Schedule a tour to see our
                quality processes and meet our team.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-harsha-orange-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Manufacturing Facility</h3>
                    <p className="text-gray-600">
                      Plot No. 123, GIDC Industrial Estate,<br />
                      Vatva, Ahmedabad - 382445,<br />
                      Gujarat, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Building className="w-6 h-6 text-harsha-orange-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Corporate Office</h3>
                    <p className="text-gray-600">
                      402, Business Hub,<br />
                      CG Road, Navrangpura,<br />
                      Ahmedabad - 380009, Gujarat, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-harsha-orange-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Service Areas</h3>
                    <p className="text-gray-600">
                      Pan-India delivery with same-day service in Ahmedabad,
                      next-day in Gujarat, and 2-5 days nationwide.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button size="lg" className="gap-2">
                  <MapPin className="w-5 h-5" />
                  Get Directions
                </Button>
              </div>
            </div>

            <div>
              {/* Map Placeholder */}
              <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive Map</p>
                  <p className="text-sm text-gray-400">Google Maps integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions about our products and services.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help!
            </p>
            <Button variant="outline" size="lg" className="gap-2">
              <MessageSquare className="w-5 h-5" />
              View All FAQs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}