'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  Star,
  Image as ImageIcon,
  Share2,
  Users,
  Gift,
  Trophy,
  TrendingUp,
  Upload,
  Camera,
  Facebook,
  Instagram,
  MessageCircle as WhatsApp,
  Copy,
  Flag,
  Heart,
  Clock,
  Award,
  UserCheck,
  PieChart,
  Target,
  Zap
} from 'lucide-react'

interface Review {
  id: string
  customerName: string
  customerAvatar: string
  productId: string
  productName: string
  rating: number
  title: string
  content: string
  images: string[]
  verified: boolean
  helpful: number
  reported: boolean
  createdAt: string
  purchaseVerified: boolean
}

interface Testimonial {
  id: string
  customerName: string
  customerAvatar: string
  title: string
  content: string
  verified: boolean
  featured: boolean
  createdAt: string
}

interface Referral {
  id: string
  friendName: string
  friendEmail: string
  status: 'invited' | 'signed_up' | 'first_purchase' | 'reward_earned'
  invitedDate: string
  rewardAmount: number
  rewardEarned: boolean
}

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'referrals' | 'testimonials'>('reviews')
  const [reviewFilter, setReviewFilter] = useState<'all' | 'verified' | 'with_images' | 'high_rating'>('all')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewProduct, setReviewProduct] = useState('')

  // Mock data for reviews
  const [reviews] = useState<Review[]>([
    {
      id: 'rev_1',
      customerName: 'Priya Sharma',
      customerAvatar: '/api/placeholder/32/32',
      productId: 'prod_001',
      productName: 'Single Origin Colombian Dark Chocolate',
      rating: 5,
      title: 'Absolutely Divine Chocolate Experience!',
      content: 'This chocolate exceeded all my expectations! The smooth texture and rich flavor profile is simply outstanding. Perfect for special occasions or just treating yourself. The packaging was premium and the shipping was incredibly fast. Will definitely be ordering more!',
      images: ['/api/placeholder/150/150', '/api/placeholder/150/150'],
      verified: true,
      helpful: 23,
      reported: false,
      createdAt: '2024-01-15',
      purchaseVerified: true
    },
    {
      id: 'rev_2',
      customerName: 'Rahul Patel',
      customerAvatar: '/api/placeholder/32/32',
      productId: 'prod_002',
      productName: 'Festive Assortment Gift Box',
      rating: 5,
      title: 'Perfect Diwali Gift - Everyone Loved It!',
      content: 'Sent this to my family and they couldn\'t stop raving about it. The assortment was perfect - dark chocolate, milk chocolate, and unique flavors all in one beautiful box. The quality was exceptional and the presentation made it feel luxurious. Definitely worth every penny!',
      images: ['/api/placeholder/150/150'],
      verified: true,
      helpful: 18,
      reported: false,
      createdAt: '2024-01-14',
      purchaseVerified: true
    },
    {
      id: 'rev_3',
      customerName: 'Anjali Desai',
      customerAvatar: '/api/placeholder/32/32',
      productId: 'prod_003',
      productName: 'Gold Member Exclusive Collection',
      rating: 4,
      title: 'Great Value for Gold Members',
      content: 'As a Gold member, I love having access to exclusive products. The quality is consistent with Harsha Delights\' standards. The bonus points earned from this purchase will help me get closer to Platinum status. Shipping was free and arrived well-packaged.',
      images: [],
      verified: true,
      helpful: 12,
      reported: false,
      createdAt: '2024-01-13',
      purchaseVerified: true
    },
    {
      id: 'rev_4',
      customerName: 'Karan Singh',
      customerAvatar: '/api/placeholder/32/32',
      productId: 'prod_004',
      productName: 'DIY Chocolate Making Kit',
      rating: 5,
      title: 'Amazing Interactive Experience!',
      content: 'This kit made for such a memorable afternoon! The recipes were easy to follow and the results were professional-quality. My kids loved participating too. Everything was fresh and well-packaged. The quality of ingredients really shows Harsha Delights cares about their customers.',
      images: ['/api/placeholder/150/150', '/api/placeholder/150/150', '/api/placeholder/150/150'],
      verified: false,
      helpful: 31,
      reported: false,
      createdAt: '2024-01-12',
      purchaseVerified: true
    }
  ])

  // Mock testimonials
  const [testimonials] = useState<Testimonial[]>([
    {
      id: 'test_1',
      customerName: 'Dr. Meera Joshi',
      customerAvatar: '/api/placeholder/40/40',
      title: 'Premium Quality for Gift Giving',
      content: 'For the past 3 years, Harsha Delights has been my go-to for all chocolate needs. The quality is consistently excellent and their customer service is outstanding. Perfect for both personal indulgences and thoughtful gifts.',
      verified: true,
      featured: true,
      createdAt: '2024-01-10'
    },
    {
      id: 'test_2',
      customerName: 'Rajesh Kumar',
      customerAvatar: '/api/placeholder/40/40',
      title: 'Exceptional Business Partnerships',
      content: 'As a corporate client, we\'ve worked with Harsha Delights on bulk orders and custom products. Their reliability and attention to detail made them our preferred chocolate supplier. Highly professional and trustworthy.',
      verified: true,
      featured: true,
      createdAt: '2024-01-08'
    }
  ])

  // Mock referral data
  const [referrals] = useState({
    totalReferrals: 12,
    successfulReferrals: 7,
    totalEarnings: 1750,
    pendingRewards: 3,
    referralCode: 'HARSHDEL123',
    stats: {
      friendsInvited: 12,
      friendsSignedUp: 7,
      firstPurchases: 5,
      rewardsEarned: 4
    }
  })

  const [referralFriends] = useState<Referral[]>([
    { id: 'ref_1', friendName: 'Amit Gupta', friendEmail: 'amit.gupta@example.com', status: 'reward_earned', invitedDate: '2024-01-01', rewardAmount: 500, rewardEarned: true },
    { id: 'ref_2', friendName: 'Sara Khan', friendEmail: 'sara.khan@example.com', status: 'first_purchase', invitedDate: '2024-01-05', rewardAmount: 500, rewardEarned: false },
    { id: 'ref_3', friendName: 'Deepak Singh', friendEmail: 'deepak.singh@example.com', status: 'signed_up', invitedDate: '2024-01-08', rewardAmount: 500, rewardEarned: false },
    { id: 'ref_4', friendName: 'Priya Mehta', friendEmail: 'priya.mehta@example.com', status: 'invited', invitedDate: '2024-01-12', rewardAmount: 500, rewardEarned: false },
    { id: 'ref_5', friendName: 'Rajesh Kumar', friendEmail: 'rajesh.kumar@example.com', status: 'reward_earned', invitedDate: '2024-01-03', rewardAmount: 500, rewardEarned: true }
  ])

  const filteredReviews = useMemo(() => {
    let filtered = reviews

    switch (reviewFilter) {
      case 'verified':
        filtered = filtered.filter(r => r.verified)
        break
      case 'with_images':
        filtered = filtered.filter(r => r.images.length > 0)
        break
      case 'high_rating':
        filtered = filtered.filter(r => r.rating >= 4)
        break
      default:
        break
    }

    return filtered
  }, [reviews, reviewFilter])

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referrals.referralCode)
    alert('Referral code copied to clipboard!')
  }

  const handleShareViaSocial = (platform: string) => {
    const shareUrl = `https://harshadelights.com/ref/${referrals.referralCode}`
    const shareText = `Check out Harsha Delights - Premium chocolates that taste like heaven! Use my referral code ${referrals.referralCode} for ₹500 off your first order! 🎁🍫 ${shareUrl}`

    alert(`${platform} share simulated! Would share: "${shareText}"`)
  }

  const handleReportReview = (reviewId: string) => {
    if (confirm('Are you sure you want to report this review for inappropriate content?')) {
      alert('Review reported. Our moderation team will review it within 24 hours.')
    }
  }

  const handleMarkHelpful = (reviewId: string) => {
    alert('Thank you for marking this review as helpful!')
  }

  const averageRating = useMemo(() => {
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reward_earned': return 'bg-green-100 text-green-800 border-green-200'
      case 'first_purchase': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'signed_up': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'invited': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reward_earned': return 'Reward Earned'
      case 'first_purchase': return 'First Purchase'
      case 'signed_up': return 'Signed Up'
      case 'invited': return 'Invited'
      default: return status
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const renderReviewsTab = () => (
    <div className="space-y-6">
      {/* Review Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Review Analytics</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>{averageRating}/5 rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>{reviews.length} reviews</span>
            </div>
            <div className="flex items-center space-x-1">
              <UserCheck className="w-4 h-4 text-green-500" />
              <span>{reviews.filter(r => r.verified).length} verified</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setReviewFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${reviewFilter === 'all' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setReviewFilter('verified')}
            className={`px-3 py-1 rounded-full text-sm ${reviewFilter === 'verified' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
          >
            Verified ({reviews.filter(r => r.verified).length})
          </button>
          <button
            onClick={() => setReviewFilter('with_images')}
            className={`px-3 py-1 rounded-full text-sm ${reviewFilter === 'with_images' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
          >
            With Images ({reviews.filter(r => r.images.length > 0).length})
          </button>
          <button
            onClick={() => setReviewFilter('high_rating')}
            className={`px-3 py-1 rounded-full text-sm ${reviewFilter === 'high_rating' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
          >
            4+ Stars ({reviews.filter(r => r.rating >= 4).length})
          </button>
        </div>

        <button
          onClick={() => setShowReviewForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={review.customerAvatar}
                  alt={review.customerName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                    {review.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>For {review.productName}</span>
                    <span>•</span>
                    <span>{review.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
                <span className="text-sm font-medium ml-1">{review.rating}/5</span>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
              <p className="text-gray-700 leading-relaxed">{review.content}</p>
            </div>

            {/* Review Images */}
            {review.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                    onClick={() => alert(`Viewing full-size image ${index + 1}`)}
                  />
                ))}
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                >
                  <Heart className="w-4 h-4" />
                  <span>{review.helpful} Helpful</span>
                </button>

                <button
                  onClick={() => handleReportReview(review.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 text-xs">Share review</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderReferralsTab = () => (
    <div className="space-y-8">
      {/* Referral Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-green-100 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">₹{referrals.totalEarnings}</p>
            </div>
            <Award className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-xs text-green-200">From {referrals.stats.rewardsEarned} friends</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-blue-100 text-sm">Friends Referred</p>
              <p className="text-2xl font-bold">{referrals.stats.friendsInvited}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
          <p className="text-xs text-blue-200">{referrals.successfulReferrals} successful</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-purple-100 text-sm">Success Rate</p>
              <p className="text-2xl font-bold">{Math.round((referrals.successfulReferrals / referrals.stats.friendsInvited) * 100)}%</p>
            </div>
            <Target className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-xs text-purple-200">Conversion rate</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-orange-100 text-sm">Pending Rewards</p>
              <p className="text-2xl font-bold">{referrals.pendingRewards}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-xs text-orange-200">Processing</p>
        </div>
      </div>

      {/* Referral Code & Sharing */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Share this code:</p>
              <p className="text-xl font-mono font-bold text-gray-900">{referrals.referralCode}</p>
            </div>
            <button
              onClick={handleCopyReferralCode}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Code</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">Share via social media:</p>
          <div className="flex space-x-3">
            <button
              onClick={() => handleShareViaSocial('WhatsApp')}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            >
              <WhatsApp className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShareViaSocial('Instagram')}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md text-sm"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </button>
            <button
              onClick={() => handleShareViaSocial('Facebook')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Share your referral code with friends</li>
            <li>2. They get ₹500 off their first order</li>
            <li>3. You earn ₹500 when they complete their first purchase</li>
            <li>4. Rewards are credited to your account instantly</li>
          </ol>
        </div>
      </div>

      {/* Referral Tracking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Referral Tracking</h3>
          <p className="text-sm text-gray-600">Track your friends' progress and pending rewards</p>
        </div>

        <div className="divide-y divide-gray-200">
          {referralFriends.map((friend) => (
            <div key={friend.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{friend.friendName}</h4>
                    <p className="text-sm text-gray-600">{friend.friendEmail}</p>
                    <p className="text-xs text-gray-500">Invited: {friend.invitedDate}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(friend.status)}`}>
                    {getStatusLabel(friend.status)}
                  </span>
                  {friend.rewardEarned && (
                    <p className="text-sm font-medium text-green-600 mt-1">₹{friend.rewardAmount} earned!</p>
                  )}
                  {!friend.rewardEarned && friend.status !== 'invited' && (
                    <p className="text-sm text-orange-600 mt-1">₹{friend.rewardAmount} pending</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTestimonialsTab = () => (
    <div className="space-y-6">
      {/* Featured Testimonials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testimonials.filter(t => t.featured).map((testimonial) => (
          <div key={testimonial.id} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={testimonial.customerAvatar}
                alt={testimonial.customerName}
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
              />
              <div>
                <h4 className="font-semibold">{testimonial.customerName}</h4>
                {testimonial.verified && (
                  <div className="flex items-center space-x-1 text-xs text-indigo-200">
                    <UserCheck className="w-3 h-3" />
                    <span>Verified Customer</span>
                  </div>
                )}
              </div>
            </div>

            <h5 className="text-lg font-semibold mb-3 opacity-95">{testimonial.title}</h5>
            <p className="text-indigo-100 leading-relaxed">
              "{testimonial.content}"
            </p>

            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <p className="text-xs text-indigo-200">{testimonial.createdAt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">2,847</p>
              <p className="text-sm text-gray-600">Community Members</p>
            </div>
          </div>
          <div className="text-xs text-green-600 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <MessageSquare className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">8,932</p>
              <p className="text-sm text-gray-600">Reviews Posted</p>
            </div>
          </div>
          <div className="text-xs text-green-600 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <ImageIcon className="w-8 h-8 text-pink-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">3,421</p>
              <p className="text-sm text-gray-600">Photo Reviews</p>
            </div>
          </div>
          <div className="text-xs text-green-600 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+15% this month</span>
          </div>
        </div>
      </div>

      {/* Submit Testimonial CTA */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white text-center">
        <Star className="w-12 h-12 mx-auto mb-4 opacity-90" />
        <h3 className="text-2xl font-bold mb-2">Share Your Story</h3>
        <p className="text-purple-100 mb-6">
          Help other customers discover Harsha Delights by sharing your experience.
          Your testimonial could be featured and help others find their perfect chocolate!
        </p>
        <button className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
          Submit Your Testimonial
        </button>
      </div>

      {/* Other Testimonials */}
      <div className="space-y-4">
        {testimonials.filter(t => !t.featured).map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={testimonial.customerAvatar}
                alt={testimonial.customerName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-medium text-gray-900">{testimonial.customerName}</h4>
                {testimonial.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                )}
              </div>
            </div>

            <h5 className="font-semibold text-gray-900 mb-2">{testimonial.title}</h5>
            <p className="text-gray-700 mb-4">"{testimonial.content}"</p>

            <div className="text-sm text-gray-500">
              {testimonial.createdAt}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

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
              <h1 className="text-3xl font-bold text-gray-900">Social & Community</h1>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Community features & social sharing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Product Reviews</span>
                <span className={`${activeTab === 'reviews' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs ml-2`}>
                  {reviews.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('referrals')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === 'referrals'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Referral Program</span>
                <span className={`${activeTab === 'referrals' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs ml-2`}>
                  ₹{referrals.totalEarnings}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('testimonials')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === 'testimonials'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Testimonials</span>
                <span className={`${activeTab === 'testimonials' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs ml-2`}>
                  {testimonials.length}
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-0">
            {activeTab === 'reviews' && renderReviewsTab()}
            {activeTab === 'referrals' && renderReferralsTab()}
            {activeTab === 'testimonials' && renderTestimonialsTab()}
          </div>
        </div>
      </div>
    </div>
  )
}
