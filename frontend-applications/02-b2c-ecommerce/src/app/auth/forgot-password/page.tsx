'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { resetPassword } from '@/store/slices/authSlice'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await dispatch(resetPassword(email)).unwrap()
      setIsEmailSent(true)
      // Don't reset email so user can see what email it was sent to
    } catch (error) {
      // Error is handled by the slice
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header with back button */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-gray-600 hover:text-yellow-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>

          {/* Logo */}
          <div className="brand-primary px-6 py-3 rounded-lg font-bold text-xl mb-8 inline-block">
            Harsha Delights
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Success State */}
        {isEmailSent ? (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="brand-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h3>

            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-yellow-600 hover:text-yellow-500 font-medium"
              >
                try again
              </button>
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full btn-primary inline-flex items-center justify-center"
              >
                Back to Sign In
              </Link>

              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-yellow-600 hover:text-yellow-500 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Reset Password Form */
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input w-full pl-10"
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
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
                disabled={isLoading || !email}
                className={`w-full btn-primary flex items-center justify-center ${
                  isLoading || !email
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>

            {/* Additional Helpers */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-yellow-600 hover:text-yellow-500 font-medium"
                >
                  Sign in here
                </Link>
              </p>

              <p className="text-sm text-gray-600 mt-3">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-yellow-600 hover:text-yellow-500 font-medium"
                >
                  Create one here
                </Link>
              </p>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Security Note:</strong> The password reset link will expire in 1 hour for your safety.
                Never share your reset link with anyone.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
