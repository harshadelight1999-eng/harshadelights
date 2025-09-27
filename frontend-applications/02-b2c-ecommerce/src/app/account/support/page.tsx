'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  Send,
  User,
  Shield,
  Search,
  MessageCircle as MessageCircle2,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react'

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: string
  lastUpdated: string
  messages: {
    id: string
    content: string
    sender: 'customer' | 'agent'
    timestamp: string
    agentName?: string
  }[]
}

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'chat' | 'faq' | 'contact'>('tickets')
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketMessage, setNewTicketMessage] = useState('')
  const [newTicketCategory, setNewTicketCategory] = useState('')
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  // Mock data - in real app would come from API
  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-001',
      subject: 'Delivery delay for order ORD-001',
      status: 'in-progress',
      priority: 'medium',
      category: 'Delivery Issues',
      createdAt: '2025-09-20',
      lastUpdated: '2025-09-21',
      messages: [
        {
          id: 'msg1',
          content: 'My order ORD-001 was supposed to arrive yesterday but still shows as in transit.',
          sender: 'customer',
          timestamp: '2025-09-20 10:30 AM'
        },
        {
          id: 'msg2',
          content: 'Thank you for reaching out. We\'re investigating a minor delay with your package. It should arrive by end of day.',
          sender: 'agent',
          agentName: 'Sarah (Customer Support)',
          timestamp: '2025-09-20 11:15 AM'
        },
        {
          id: 'msg3',
          content: 'Thank you for the update. Can you provide the tracking number?',
          sender: 'customer',
          timestamp: '2025-09-20 2:00 PM'
        }
      ]
    },
    {
      id: 'TKT-002',
      subject: 'Wrong item received in order ORD-002',
      status: 'resolved',
      priority: 'high',
      category: 'Order Issues',
      createdAt: '2025-09-18',
      lastUpdated: '2025-09-19',
      messages: [
        {
          id: 'msg4',
          content: 'I received the wrong chocolate box in my order. This was supposed to be dark chocolate but I got milk chocolate.',
          sender: 'customer',
          timestamp: '2025-09-18 9:00 AM'
        },
        {
          id: 'msg5',
          content: 'I apologize for the inconvenience. We\'ll ship out the correct item immediately and provide a prepaid return label. Your order has been credited ₹250 as compensation.',
          sender: 'agent',
          agentName: 'Mike (Quality Assurance)',
          timestamp: '2025-09-18 10:30 AM'
        },
        {
          id: 'msg6',
          content: 'Thank you for the quick resolution. I appreciate the compensation.',
          sender: 'customer',
          timestamp: '2025-09-18 3:00 PM'
        },
        {
          id: 'msg7',
          content: 'The correct item has been shipped. Tracking number: HD123456789. Let us know if you have any other concerns.',
          sender: 'agent',
          agentName: 'Mike (Quality Assurance)',
          timestamp: '2025-09-19 9:30 AM'
        }
      ]
    }
  ])

  const faqCategories = [
    {
      category: 'Orders & Shipping',
      items: [
        {
          id: 'faq1',
          question: 'How do I track my order?',
          answer: 'You can track your order by visiting the account dashboard and clicking on any recent order. Alternatively, use the tracking number provided in your shipping confirmation email.'
        },
        {
          id: 'faq2',
          question: 'When will my order arrive?',
          answer: 'Normal delivery takes 3-5 business days within India. Express delivery (2-3 business days) is available. International shipping takes 7-14 business days depending on destination.'
        },
        {
          id: 'faq3',
          question: 'Can I change my delivery address?',
          answer: 'If your order hasn\'t shipped yet, you can update the delivery address in your account settings. For shipped orders, contact customer support immediately for assistance.'
        }
      ]
    },
    {
      category: 'Products & Quality',
      items: [
        {
          id: 'faq4',
          question: 'Are your products gluten-free?',
          answer: 'Most of our products are gluten-free. Individual product packaging includes detailed allergen information. Our walnut and peanut products contain nuts - please check labels carefully.'
        },
        {
          id: 'faq5',
          question: 'How should I store chocolate?',
          answer: 'Store chocolate in a cool, dry place (60-70°F/15-21°C) away from direct sunlight. Our properly stored chocolate maintains quality for 12-18 months.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      items: [
        {
          id: 'faq6',
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days for unopened products. Custom-order items are final sale. Opened chocolates cannot be returned for health and safety reasons.'
        },
        {
          id: 'faq7',
          question: 'How do I return an item?',
          answer: 'Contact customer support with your order number. We\'ll provide a prepaid return label and processing instructions. Returns typically take 7-10 business days to process.'
        }
      ]
    }
  ]

  const handleCreateTicket = async () => {
    if (!newTicketSubject || !newTicketMessage || !newTicketCategory) return

    // Mock ticket creation - in real app would call API
    alert('Support ticket created successfully! We\'ll respond within 24 hours.')
    setNewTicketSubject('')
    setNewTicketMessage('')
    setNewTicketCategory('')
    setIsCreatingTicket(false)
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    // Mock chat message - in real app would call API
    alert('Message sent! Our support team will respond within a few minutes.')
    setChatMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/account"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Response time: <strong>24 hours</strong></span>
              </div>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Live Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          {[
            { key: 'tickets', label: 'Support Tickets', icon: HelpCircle },
            { key: 'chat', label: 'Live Chat', icon: MessageCircle2 },
            { key: 'faq', label: 'FAQ', icon: Search },
            { key: 'contact', label: 'Contact Info', icon: Phone }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-yellow-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Support Tickets */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Your Support Tickets</h2>
                <button
                  onClick={() => setIsCreatingTicket(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>New Ticket</span>
                </button>
              </div>

              {/* Create New Ticket Modal */}
              {isCreatingTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-2xl w-full p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Create Support Ticket</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Category
                        </label>
                        <select
                          value={newTicketCategory}
                          onChange={(e) => setNewTicketCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="">Select Category</option>
                          <option value="delivery">Delivery Issues</option>
                          <option value="order">Order Problems</option>
                          <option value="product">Product Questions</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="account">Account Issues</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={newTicketSubject}
                          onChange={(e) => setNewTicketSubject(e.target.value)}
                          placeholder="Brief description of your issue"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newTicketMessage}
                          onChange={(e) => setNewTicketMessage(e.target.value)}
                          rows={6}
                          placeholder="Please provide detailed information about your issue..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsCreatingTicket(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateTicket}
                          disabled={!newTicketSubject || !newTicketMessage || !newTicketCategory}
                          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md disabled:bg-gray-300"
                        >
                          Create Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tickets List */}
              <div className="grid grid-cols-1 gap-4">
                {supportTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.replace('-', ' ').toUpperCase()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{ticket.category}</span>
                          <span>Created: {ticket.createdAt}</span>
                          <span>Last Updated: {ticket.lastUpdated}</span>
                        </div>
                        <p className="text-gray-600 text-sm">Click to view conversation</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <div className={`w-3 h-3 rounded-full ${
                          ticket.priority === 'urgent' ? 'bg-red-500' :
                          ticket.priority === 'high' ? 'bg-orange-500' :
                          ticket.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="text-sm text-gray-600 capitalize">{ticket.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ticket Details Modal */}
              {selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-20 z-50 overflow-y-auto">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>#{selectedTicket.id}</span>
                            <span>{selectedTicket.category}</span>
                            <span>Created: {selectedTicket.createdAt}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ArrowLeft className="w-6 h-6" />
                        </button>
                      </div>

                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTicket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        selectedTicket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTicket.status.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Messages */}
                      <div className="space-y-4 mb-6">
                        {selectedTicket.messages.map((message) => (
                          <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg p-4 rounded-lg ${
                              message.sender === 'customer'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium text-sm">
                                  {message.sender === 'customer' ? 'You' : (message.agentName || 'Support Agent')}
                                </span>
                                <span className="text-xs opacity-75">{message.timestamp}</span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex space-x-3">
                          <textarea
                            placeholder="Type your message here..."
                            rows={3}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Chat */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center">
                <MessageCircle2 className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Chat Support</h2>
                <p className="text-gray-600 mb-6">
                  Get instant help from our customer support team
                </p>
                <div className="bg-yellow-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-gray-900">Customer Support Online</span>
                  </div>
                  <p className="text-gray-600">Average response time: 2 minutes</p>
                </div>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Start Live Chat
                </button>

                <div className="mt-6 text-sm text-gray-500">
                  <p>Chat available 24/7. For complex issues, we recommend creating a support ticket above.</p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {faqCategories.map((category) => (
                <div key={category.category} className="bg-white rounded-lg shadow-sm">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h3>
                    <div className="space-y-4">
                      {category.items.map((faq) => (
                        <div key={faq.id} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            className="w-full text-left px-6 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-medium text-gray-900">{faq.question}</h4>
                              {expandedFaq === faq.id ? (
                                <ChevronUp className="w-5 h-5 text-yellow-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-yellow-600" />
                              )}
                            </div>
                          </button>
                          {expandedFaq === faq.id && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-600 mt-2">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Information */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Our Support Team</h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
                      <p className="text-gray-600 mb-2">Call our friendly support team</p>
                      <p className="font-mono text-gray-900">+91 123-456-7890</p>
                      <p className="text-sm text-gray-500 mt-1">Mon-Fri: 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                      <p className="text-gray-600 mb-2">Send us an email for detailed issues</p>
                      <p className="font-mono text-gray-900">support@harshadelights.com</p>
                      <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Support Hours</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium text-gray-900">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium text-gray-900">10:00 AM - 4:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium text-red-600">Closed</span>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Emergency Contact</h3>
                      <p className="text-sm text-gray-600">
                        For urgent delivery issues, call our 24/7 emergency hotline:
                      </p>
                      <p className="font-mono text-gray-900 font-semibold mt-1">+91 987-654-3210</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Chat Widget */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-40">
          <div className="bg-yellow-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Live Support Chat</h3>
                <p className="text-sm opacity-90">Support Agent Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="p-4 h-80 overflow-y-auto">
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-500 mb-4">
                Welcome to live chat! How can we help you today?
              </div>
              {/* Chat messages would go here */}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Typical response time: 2 minutes
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
