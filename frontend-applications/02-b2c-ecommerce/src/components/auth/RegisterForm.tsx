'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { register } from '@/store/slices/authSlice'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return
    }
    if (!acceptTerms) {
      return
    }

    try {
      await dispatch(register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      })).unwrap()
    } catch (error) {
      // Error handled by Redux
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0
  const isPasswordValid = formData.password.length >= 8
  const isNameValid = formData.first_name.trim() && formData.last_name.trim()
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && passwordsMatch && acceptTerms

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
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
            placeholder="John"
            disabled={isLoading}
            autoComplete="given-name"
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
            placeholder="Doe"
            disabled={isLoading}
            autoComplete="family-name"
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
          className={`form-input w-full ${formData.email && !isEmailValid ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder="john.doe@example.com"
          disabled={isLoading}
          autoComplete="email"
        />
        {formData.email && !isEmailValid && (
          <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="form-input w-full pr-12"
            placeholder="Create a strong password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="mt-2 space-y-1">
          <div className={`flex items-center text-sm ${isPasswordValid ? 'text-green-600' : 'text-gray-500'}`}>
            {isPasswordValid ? <Check className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border rounded-full border-current" />}
            At least 8 characters
          </div>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`form-input w-full pr-12 ${
              formData.confirmPassword && !passwordsMatch ? 'border-red-300 focus:border-red-500' : ''
            }`}
            placeholder="Confirm your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {formData.confirmPassword && !passwordsMatch && (
          <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            disabled={isLoading}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="acceptTerms" className="text-gray-700">
            I agree to the{' '}
            <Link href="#" className="text-yellow-600 hover:text-yellow-500 font-medium" tabIndex={isLoading ? -1 : 0}>
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="#" className="text-yellow-600 hover:text-yellow-500 font-medium" tabIndex={isLoading ? -1 : 0}>
              Privacy Policy
            </Link>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className={`w-full btn-primary flex items-center justify-center ${
          isLoading || !isFormValid
            ? 'opacity-70 cursor-not-allowed'
            : 'hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Additional Actions */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-yellow-600 hover:text-yellow-500"
            tabIndex={isLoading ? -1 : 0}
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  )
}
