'use client'

import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { User } from '@/store/slices/authSlice'

interface ProfileFormProps {
  initialUser: User | null
  onSave?: (userData: Partial<User>) => Promise<void>
  loading?: boolean
}

export default function ProfileForm({
  initialUser,
  onSave,
  loading = false
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: initialUser?.first_name || '',
    last_name: initialUser?.last_name || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
  })
  const [isDirty, setIsDirty] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSave && isDirty) {
      try {
        await onSave(formData)
        setIsDirty(false)
      } catch (error) {
        // Error handled by parent
      }
    }
  }

  const isFormValid = formData.first_name.trim() && formData.last_name.trim() && formData.email

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Enter your first name"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Enter your last name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input w-full"
              placeholder="Enter your email"
              disabled={true} // Email should not be editable for security
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="form-input w-full"
              placeholder="Enter your phone number"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !isFormValid || !isDirty}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                loading || !isFormValid || !isDirty
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-yellow-600 hover:bg-yellow-500 text-white focus:ring-2 focus:ring-yellow-500'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
