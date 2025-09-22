'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Home,
  Building,
  Briefcase,
  Check
} from 'lucide-react'

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  isDefault: boolean
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  landmark?: string
  instructions?: string
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr_1',
      type: 'home',
      isDefault: true,
      name: 'Rahul Patel',
      phone: '+91 98765 43210',
      addressLine1: 'A-101, Sunshine Apartments',
      addressLine2: 'Sector 12, Plot No. 45',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      landmark: 'Near Metro Station',
      instructions: 'Ring doorbell twice, delivery at gate'
    },
    {
      id: 'addr_2',
      type: 'work',
      isDefault: false,
      name: 'Rahul Patel',
      phone: '+91 98765 43211',
      addressLine1: 'Office Block C, 4th Floor',
      addressLine2: 'Tech Park, Phase 2',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      landmark: 'Opposite Main Gate',
      instructions: 'Deliver to security reception'
    }
  ])

  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
    instructions: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) newErrors.name = 'Name is required'
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required'
    if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone || '')) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!formData.addressLine1?.trim()) newErrors.addressLine1 = 'Address line 1 is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    if (!formData.state?.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode?.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!/^\d{6}$/.test(formData.zipCode || '')) {
      newErrors.zipCode = 'Please enter a valid 6-digit ZIP code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddAddress = () => {
    if (!validateForm()) return

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      type: formData.type as 'home' | 'work' | 'other',
      isDefault: addresses.length === 0, // Make first address default
      ...formData,
    } as Address

    setAddresses(prev => [...prev, newAddress])
    resetForm()
    setIsAddingAddress(false)
  }

  const handleUpdateAddress = (addressId: string) => {
    if (!validateForm()) return

    setAddresses(prev =>
      prev.map(addr =>
        addr.id === addressId
          ? { ...addr, ...formData } as Address
          : addr
      )
    )
    setEditingAddress(null)
    resetForm()
  }

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
    }
  }

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    )
  }

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      landmark: '',
      instructions: '',
    })
    setErrors({})
  }

  const startEditing = (address: Address) => {
    setEditingAddress(address.id)
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      landmark: address.landmark || '',
      instructions: address.instructions || '',
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5 text-gray-600" />
      case 'work': return <Briefcase className="w-5 h-5 text-gray-600" />
      default: return <MapPin className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'home': return 'Home'
      case 'work': return 'Work'
      default: return 'Other'
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Address Book</h1>
            </div>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address List */}
          <div className="lg:col-span-2 space-y-4">
            {addresses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
                <p className="text-gray-600 mb-6">Add your delivery addresses for faster checkout</p>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="btn-primary"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(address.type)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{getTypeLabel(address.type)}</span>
                          {address.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Default
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600">{address.name} • {address.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditing(address)}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Edit address"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-900">{address.addressLine1}</p>
                    {address.addressLine2 && <p className="text-gray-900">{address.addressLine2}</p>}
                    <p className="text-gray-900">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    {address.landmark && (
                      <p className="text-gray-600 text-sm">Near: {address.landmark}</p>
                    )}
                    {address.instructions && (
                      <p className="text-gray-600 text-sm bg-yellow-50 p-2 rounded mt-2">
                        📝 {address.instructions}
                      </p>
                    )}
                  </div>

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-yellow-600 hover:text-yellow-500 text-sm font-medium"
                    >
                      Set as Default Address
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add/Edit Address Form */}
          <div className="lg:col-span-1">
            {(isAddingAddress || editingAddress) && (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsAddingAddress(false)
                      setEditingAddress(null)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Address Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'home', label: 'Home', icon: Home },
                        { value: 'work', label: 'Work', icon: Briefcase },
                        { value: 'other', label: 'Other', icon: MapPin }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setFormData(prev => ({ ...prev, type: value as 'home' | 'work' | 'other' }))}
                          className={`flex flex-col items-center p-3 border rounded-lg text-sm transition-colors ${
                            formData.type === value
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter full name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="+91 XXXXX XXXXX"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Address Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.addressLine1 ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="House/Flat/Office number"
                    />
                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Street, Area, Locality"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.zipCode ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="XXXXXX"
                      />
                      {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.state ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Near Metro, Opposite Park, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        if (editingAddress) {
                          handleUpdateAddress(editingAddress)
                        } else {
                          handleAddAddress()
                        }
                      }}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingAddress(false)
                        setEditingAddress(null)
                        resetForm()
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Help Text */}
            {!isAddingAddress && !editingAddress && (
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Address Management Tips</h3>
                    <ul className="text-blue-800 space-y-1 text-sm">
                      <li>• Add multiple addresses for home, work, and delivery</li>
                      <li>• Set your most used address as default</li>
                      <li>• Include landmarks and delivery instructions for faster delivery</li>
                      <li>• Ensure phone number is always reachable</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
