'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Settings,
  Bell,
  Mail,
  Phone,
  MapPin,
  Award,
  Edit3,
  Shield,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle,
  Info
} from 'lucide-react'
import { AppDispatch, RootState } from '@/store/store'
import { updateProfile } from '@/store/slices/authSlice'

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const [activeSection, setActiveSection] = useState<'personal' | 'preferences' | 'loyalty' | 'privacy'>('personal')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    // Communication preferences
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: true,
    order_updates: true,
    special_offers: false,
    // Privacy settings
    profile_visibility: 'private',
    data_sharing: false,
    third_party_tracking: false,
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        // Mock additional data - in real app would come from API
        date_of_birth: '1990-01-01',
        gender: 'prefer_not_to_say',
      }))
    }
  }, [user, isAuthenticated, router])

  const handleSaveChanges = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap()
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      // Handle error
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      return
    }
    // Would dispatch password change action
    alert('Password change functionality would be implemented here')
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    })
    setShowPasswordFields(false)
  }

  const loyaltyData = {
    tier: 'Gold',
    points: 245,
    nextTierPoints: 500,
    expirationMonth: 'December 2025',
    joinedDate: 'January 2024',
    totalEarned: 850,
  }

  const tierBenefits = {
    Gold: [
      'Free standard shipping on orders over ₹500',
      '10% off on all products (excluding special offers)',
      'Early access to new products',
      'Priority customer support',
      'Birthday month surprise gift',
    ],
    Platinum: [
      'All Gold benefits plus...',
      'Free express shipping on all orders',
      '15% off on all products',
      'Exclusive member events access',
      'Personal shopping assistant',
      'Dedicated account manager',
    ]
  }

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <nav className="space-y-2">
                {[
                  { key: 'personal', label: 'Personal Information', icon: Settings },
                  { key: 'preferences', label: 'Communication & Privacy', icon: Bell },
                  { key: 'loyalty', label: 'Loyalty Program', icon: Award },
                  { key: 'privacy', label: 'Data & Privacy', icon: Shield },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeSection === item.key
                        ? 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {!isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              )}

              {isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <button
                    onClick={handleSaveChanges}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="w-8 h-8 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing || true} // Email can't be changed for security
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email address cannot be changed for security reasons
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                    >
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                    <button
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-yellow-600 hover:text-yellow-500 text-sm font-medium"
                    >
                      {showPasswordFields ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Current password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="New password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>

                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirm_new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_new_password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />

                      {passwordData.new_password && passwordData.confirm_new_password && passwordData.new_password !== passwordData.confirm_new_password && (
                        <p className="text-sm text-red-600">Passwords do not match</p>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={handlePasswordChange}
                          disabled={!passwordData.current_password || !passwordData.new_password || passwordData.new_password !== passwordData.confirm_new_password}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordFields(false)
                            setPasswordData({ current_password: '', new_password: '', confirm_new_password: '' })
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
