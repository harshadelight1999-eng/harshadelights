'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  Truck,
  HeadphonesIcon
} from 'lucide-react';

interface ContactInfo {
  type: 'phone' | 'email' | 'address' | 'hours';
  icon: any;
  title: string;
  details: string[];
  primary?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiry_type: string;
}

const contactInfo: ContactInfo[] = [
  {
    type: 'phone',
    icon: Phone,
    title: 'Phone Numbers',
    details: [
      '+91 98765 43210 (Customer Care)',
      '+91 98765 43211 (Bulk Orders)',
      '+91 98765 43212 (B2B Partnerships)'
    ],
    primary: true,
  },
  {
    type: 'email',
    icon: Mail,
    title: 'Email Addresses',
    details: [
      'info@harshadelights.com',
      'orders@harshadelights.com',
      'support@harshadelights.com'
    ],
    primary: true,
  },
  {
    type: 'address',
    icon: MapPin,
    title: 'Our Location',
    details: [
      'Harsha Delights Pvt. Ltd.',
      '123, Sweet Street, Confectionery Hub',
      'Mumbai, Maharashtra 400001',
      'India'
    ],
  },
  {
    type: 'hours',
    icon: Clock,
    title: 'Business Hours',
    details: [
      'Monday - Saturday: 9:00 AM - 8:00 PM',
      'Sunday: 10:00 AM - 6:00 PM',
      '24/7 Online Ordering Available'
    ],
  },
];

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry', icon: MessageSquare },
  { value: 'orders', label: 'Order Support', icon: Truck },
  { value: 'bulk', label: 'Bulk Orders', icon: Building },
  { value: 'partnership', label: 'B2B Partnership', icon: Users },
  { value: 'feedback', label: 'Feedback', icon: HeadphonesIcon },
];

const quickActions = [
  {
    title: 'Track Your Order',
    description: 'Check the status of your recent orders',
    action: 'Track Order',
    icon: Truck,
    color: 'blue',
  },
  {
    title: 'Bulk Order Inquiry',
    description: 'Special pricing for large quantities',
    action: 'Get Quote',
    icon: Building,
    color: 'green',
  },
  {
    title: 'B2B Partnership',
    description: 'Join our business partner network',
    action: 'Apply Now',
    icon: Users,
    color: 'purple',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiry_type: 'general',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-harsha-orange-100 rounded-full px-4 py-2 text-sm font-medium text-harsha-orange-700">
            <MessageSquare className="h-4 w-4" />
            <span>Get In Touch</span>
          </div>

          <h2 className="heading-responsive font-bold text-gray-900">
            We'd Love to
            <span className="hero-text-gradient"> Hear From You</span>
          </h2>

          <p className="body-responsive text-gray-600 max-w-3xl mx-auto">
            Whether you have questions about our products, need help with an order, or want to
            explore business partnerships, our friendly team is here to help.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <div
              key={action.title}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                action.color === 'blue' ? 'bg-blue-100' :
                action.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <action.icon className={`h-6 w-6 ${
                  action.color === 'blue' ? 'text-blue-600' :
                  action.color === 'green' ? 'text-green-600' : 'text-purple-600'
                }`} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{action.description}</p>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                {action.action}
              </Button>
            </div>
          ))}
        </div>

        {/* Main Contact Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <p className="text-gray-600 mb-8">
                Choose the most convenient way to reach us. Our customer support team is
                available to assist you with any questions or concerns.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div
                  key={info.type}
                  className={`p-6 rounded-xl transition-all duration-300 hover:shadow-md ${
                    info.primary ? 'bg-harsha-orange-50 border-2 border-harsha-orange-200' : 'bg-gray-50'
                  } animate-slide-up`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      info.primary ? 'bg-harsha-orange-100' : 'bg-white'
                    }`}>
                      <info.icon className={`h-6 w-6 ${
                        info.primary ? 'text-harsha-orange-600' : 'text-gray-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 ${
                        info.primary ? 'text-harsha-orange-900' : 'text-gray-900'
                      }`}>
                        {info.title}
                      </h4>

                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p
                            key={idx}
                            className={`text-sm ${
                              info.primary ? 'text-harsha-orange-700' : 'text-gray-600'
                            }`}
                          >
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h4>
              <p className="text-gray-500 text-sm">
                Find us easily with our interactive location map
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                View on Google Maps
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h3>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Message Sent Successfully!</h4>
                  <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Message Failed to Send</h4>
                  <p className="text-red-700 text-sm">Please try again or contact us directly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  name="inquiry_type"
                  value={formData.inquiry_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                  required
                >
                  {inquiryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name and Email Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone and Subject Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                    placeholder="Brief subject of your message"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent resize-none"
                  placeholder="Please provide details about your inquiry..."
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Privacy Note */}
              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you agree to our privacy policy. We'll never share your information with third parties.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}