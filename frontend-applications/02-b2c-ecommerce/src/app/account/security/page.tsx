'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  Lock,
  Key,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Monitor,
  MapPin,
  Settings,
  UserCheck,
  FileText,
  Bell,
  ToggleLeft,
  ToggleRight,
  QrCode,
  Copy
} from 'lucide-react'

interface Device {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  location: string
  lastSeen: string
  isCurrent: boolean
  isTrusted: boolean
}

interface LoginHistory {
  id: string
  timestamp: string
  device: string
  location: string
  ipAddress: string
  status: 'success' | 'failed'
  suspicious: boolean
}

interface SecurityAlert {
  id: string
  type: 'login_attempt' | 'password_change' | 'device_added' | 'suspicious_activity'
  title: string
  description: string
  timestamp: string
  severity: 'high' | 'medium' | 'low'
  resolved: boolean
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'password' | '2fa' | 'devices' | 'privacy' | 'activity'>('password')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)

  // Mock security data
  const [securityStats] = useState({
    loginAttempts: 45,
    successfulLogins: 43,
    failedAttempts: 2,
    devicesRegistered: 3,
    alertsUnread: 2,
    lastPasswordChange: '2024-01-10',
    accountAge: '8 months'
  })

  const [devices] = useState<Device[]>([
    {
      id: 'dev_1',
      name: 'MacBook Pro',
      type: 'desktop',
      browser: 'Chrome 119.0',
      location: 'Mumbai, Maharashtra',
      lastSeen: 'Now',
      isCurrent: true,
      isTrusted: true
    },
    {
      id: 'dev_2',
      name: 'iPhone SE',
      type: 'mobile',
      browser: 'Safari Mobile',
      location: 'Mumbai, Maharashtra',
      lastSeen: '2 hours ago',
      isCurrent: false,
      isTrusted: true
    },
    {
      id: 'dev_3',
      name: 'iPad Air',
      type: 'tablet',
      browser: 'Safari',
      location: 'Delhi, Delhi',
      lastSeen: '3 days ago',
      isCurrent: false,
      isTrusted: false
    }
  ])

  const [loginHistory] = useState<LoginHistory[]>([
    {
      id: 'login_1',
      timestamp: '2024-01-15 10:30:45',
      device: 'MacBook Pro (Chrome)',
      location: 'Mumbai, Maharashtra',
      ipAddress: '112.196.45.123',
      status: 'success',
      suspicious: false
    },
    {
      id: 'login_2',
      timestamp: '2024-01-15 08:15:22',
      device: 'iPhone SE (Safari)',
      location: 'Mumbai, Maharashtra',
      ipAddress: '112.196.45.123',
      status: 'success',
      suspicious: false
    },
    {
      id: 'login_3',
      timestamp: '2024-01-14 18:45:10',
      device: 'Unknown Device (Chrome)',
      location: 'Delhi, Delhi',
      ipAddress: '157.51.234.89',
      status: 'failed',
      suspicious: true
    }
  ])

  const [securityAlerts] = useState<SecurityAlert[]>([
    {
      id: 'alert_1',
      type: 'login_attempt',
      title: 'Unusual login attempt detected',
      description: 'A login attempt was made from Delhi, Delhi which is different from your usual location. The attempt was blocked.',
      timestamp: '2024-01-14 18:45:10',
      severity: 'high',
      resolved: false
    },
    {
      id: 'alert_2',
      type: 'device_added',
      title: 'New device registered',
      description: 'A new iPad was added to your trusted devices. If this wasn\'t you, please review and remove the device.',
      timestamp: '2024-01-12 14:20:30',
      severity: 'medium',
      resolved: false
    },
    {
      id: 'alert_3',
      type: 'password_change',
      title: 'Password changed successfully',
      description: 'Your account password was changed from your MacBook Pro.',
      timestamp: '2024-01-10 09:15:22',
      severity: 'low',
      resolved: true
    }
  ])

  const [privacySettings] = useState({
    marketingEmails: false,
    orderUpdates: true,
    securityAlerts: true,
    productRecommendations: true,
    profileVisible: false,
    dataAnalytics: false
  })

  const handleEnable2FA = () => {
    const codes = [
      'ABCD-1234-EFGH',
      'IJKL-5678-MNOP',
      'QRST-9012-UVWX',
      'YZAB-3456-CDEF',
      'GHIJ-7890-KLMN'
    ]
    setBackupCodes(codes)
    setTwoFactorEnabled(true)
    setShowQR(true)
  }

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      setTwoFactorEnabled(false)
      setBackupCodes([])
      setShowQR(false)
    }
  }

  const handleRemoveDevice = (deviceId: string) => {
    if (confirm('Are you sure you want to remove this device? You may need to sign in again if you access Harsha Delights from this device.')) {
      alert('Device removed successfully. If this was a trusted device, security has been enhanced.')
    }
  }

  const handleToggleTrust = (deviceId: string) => {
    alert('Device trust settings updated successfully.')
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.')
      return
    }
    alert('Password changed successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDataExport = () => {
    alert('Data export request has been submitted. You will receive your data via email within 30 days as per GDPR regulations.')
  }

  const handleDataDeletion = () => {
    if (confirm('Are you sure you want to request account deletion? This action cannot be undone and will permanently remove all your data.')) {
      alert('Account deletion request submitted. You will be contacted within 24 hours to confirm this action.')
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return Monitor
      case 'mobile': return Smartphone
      case 'tablet': return Monitor
      default: return Monitor
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800'
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800'
      default: return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  const renderPasswordTab = () => (
    <div className="space-y-6">
      {/* Password Change Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                placeholder="Enter current password"
              />
              <button
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            className="btn-primary w-full"
          >
            Change Password
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-600">Last password change:</p>
              <p className="font-medium">{securityStats.lastPasswordChange}</p>
            </div>
            <div>
              <p className="text-gray-600">Password strength:</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 ml-1">Strong</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password History */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Security Tips</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Use at least 8 characters with uppercase, lowercase, numbers, and symbols</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Don't reuse passwords from other websites</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Change passwords regularly and immediately if compromised</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Enable two-factor authentication for maximum security</span>
          </li>
        </ul>
      </div>
    </div>
  )

  const render2FATab = () => (
    <div className="space-y-6">
      {/* 2FA Status Card */}
      <div className={`rounded-lg p-6 ${twoFactorEnabled ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {twoFactorEnabled ?
              <CheckCircle2 className="w-8 h-8 text-green-500" /> :
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            }
            <div>
              <h3 className={`text-lg font-semibold ${twoFactorEnabled ? 'text-green-900' : 'text-yellow-900'}`}>
                Two-Factor Authentication
              </h3>
              <p className={`text-sm ${twoFactorEnabled ? 'text-green-700' : 'text-yellow-700'}`}>
                {twoFactorEnabled ? 'Enabled - Your account is protected' : 'Disabled - Enable for better security'}
              </p>
            </div>
          </div>

          <button
            onClick={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
            className={`px-6 py-2 rounded-md text-sm font-medium ${
              twoFactorEnabled
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Setup Instructions */}
      {!twoFactorEnabled && !showQR && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">How to Enable 2FA</h4>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">1</span>
              <span>Click "Enable 2FA" above</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">2</span>
              <span>Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">3</span>
              <span>Scan the QR code we'll show you</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">4</span>
              <span>Save your backup codes in a safe place</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">5</span>
              <span>Enter the 6-digit code from your app to verify</span>
            </li>
          </ol>
        </div>
      )}

      {/* QR Code Setup */}
      {showQR && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Scan QR Code</h4>

          <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">
            <div className="flex-1 text-center">
              <div className="bg-gray-100 w-48 h-48 mx-auto rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Scan with your authenticator app</p>
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Backup Codes</h5>
                <p className="text-xs text-gray-600 mb-3">
                  Save these codes in a safe place. You can use them to access your account if you lose your phone:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white p-2 rounded flex items-center justify-between">
                      <span>{code}</span>
                      <Copy className="w-3 h-3 text-gray-400 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => alert('2FA setup completed! Your account is now protected.')}
                className="btn-primary w-full"
              >
                Complete Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Methods */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Available 2FA Methods</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-8 h-8 text-blue-500" />
              <div>
                <h5 className="font-medium text-gray-900">Authenticator App</h5>
                <p className="text-sm text-gray-600">Google Authenticator, Authy, Microsoft Authenticator</p>
              </div>
            </div>
            <ToggleRight className="w-6 h-6 text-green-500" />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-orange-500" />
              <div>
                <h5 className="font-medium text-gray-900">SMS Code</h5>
                <p className="text-sm text-gray-600">Receive codes via SMS to +91 98765 43210</p>
              </div>
            </div>
            <ToggleLeft className="w-6 h-6 text-gray-400" />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-8 h-8 text-purple-500" />
                <div>
                  <h5 className="font-medium text-gray-900">Email Code</h5>
                  <p className="text-sm text-gray-600">Receive codes via customer service email</p>
                </div>
              </div>
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDevicesTab = () => (
    <div className="space-y-8">
      {/* Current Session */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-3">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-green-900">Current Session</h3>
        </div>
        <div className="text-sm text-green-800">
          <p>• <strong>Device:</strong> MacBook Pro (Chrome 119.0)</p>
          <p>• <strong>Location:</strong> Mumbai, Maharashtra</p>
          <p>• <strong>IP:</strong> 112.196.45.123</p>
          <p>• <strong>Last Activity:</strong> Now</p>
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Trusted Devices</h3>
          <p className="text-sm text-gray-600">Manage devices that remember your login</p>
        </div>

        <div className="divide-y divide-gray-200">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type)
            return (
              <div key={device.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DeviceIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{device.name}</h4>
                        {device.isCurrent && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Current</span>
                        )}
                        {device.isTrusted && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trusted</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {device.browser} • {device.location}
                      </p>
                      <p className="text-xs text-gray-500">Last seen: {device.lastSeen}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!device.isTrusted && (
                      <button
                        onClick={() => handleToggleTrust(device.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Trust Device
                      </button>
                    )}
                    {!device.isCurrent && (
                      <button
                        onClick={() => handleRemoveDevice(device.id)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Advice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Device Security Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep your devices updated with the latest security patches</li>
              <li>• Use strong passwords and enable biometric authentication where available</li>
              <li>• Regularly review and remove unused trusted devices</li>
              <li>• Sign out from public computers and shared devices</li>
              <li>• Monitor unusual device activity in your account security logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Data & Privacy Settings</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Marketing Emails</h4>
              <p className="text-sm text-gray-600">Receive promotional offers and newsletters</p>
            </div>
            <ToggleRight className="w-6 h-6 text-green-500" />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Order Updates</h4>
              <p className="text-sm text-gray-600">Updates on your orders and deliveries</p>
            </div>
            <ToggleRight className="w-6 h-6 text-green-500" />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Security Alerts</h4>
              <p className="text-sm text-gray-600">Important security notifications for your account</p>
            </div>
            <ToggleRight className="w-6 h-6 text-green-500" />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Product Recommendations</h4>
              <p className="text-sm text-gray-600">Personalized product suggestions and offers</p>
            </div>
            <ToggleRight className="w-6 h-6 text-green-500" />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Profile Visibility</h4>
              <p className="text-sm text-gray-600">Show your profile information to other customers</p>
            </div>
            <ToggleLeft className="w-6 h-6 text-gray-400" />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="font-medium text-gray-900">Analytics Data</h4>
              <p className="text-sm text-gray-600">Help improve our services with usage analytics</p>
            </div>
            <ToggleLeft className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* GDPR Data Rights */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Data Rights (GDPR)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleDataExport}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Export My Data</p>
              <p className="text-sm text-gray-600">Download all your personal data</p>
            </div>
          </button>

          <button
            onClick={() => alert('Privacy preferences updated. You can manage specific data collection settings above.')}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Data Preferences</p>
              <p className="text-sm text-gray-600">Control data collection and usage</p>
            </div>
          </button>

          <button
            onClick={() => alert('Data correction form opened. You can update any personal information from your profile.')}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Correct Data</p>
              <p className="text-sm text-gray-600">Update inaccurate personal data</p>
            </div>
          </button>

          <button
            onClick={handleDataDeletion}
            className="flex items-center justify-center space-x-2 p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-red-600">Permanently remove your data</p>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="mb-2"><strong>GDPR Compliance:</strong> Under GDPR, you have the right to:</p>
          <ul className="space-y-1 ml-4">
            <li>• Access and download your personal data</li>
            <li>• Correct inaccurate or incomplete data</li>
            <li>• Delete your data (right to erasure)</li>
            <li>• Restrict or object to data processing</li>
            <li>• Data portability to another service</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderActivityTab = () => (
    <div className="space-y-8">
      {/* Login Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Login Activity</h3>
          <p className="text-sm text-gray-600">Monitor all login attempts to your account</p>
        </div>

        <div className="divide-y divide-gray-200">
          {loginHistory.slice(0, 5).map((login) => (
            <div key={login.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    login.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {login.status === 'success' ?
                      <CheckCircle2 className={`w-5 h-5 ${login.status === 'success' ? 'text-green-600' : 'text-red-600'}`} /> :
                      <AlertTriangle className={`w-5 h-5 ${login.status === 'failed' ? 'text-red-600' : 'text-green-600'}`} />
                    }
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{login.device}</h4>
                      {login.suspicious && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Suspicious</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {login.location} • IP: {login.ipAddress}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    login.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {login.status === 'success' ? 'Successful' : 'Failed'}
                  </div>
                  <div className="text-xs text-gray-500">{login.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            View Full Login History →
          </button>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
              {securityAlerts.filter(a => !a.resolved).length} unread
            </span>
          </div>
          <p className="text-sm text-gray-600">Important security notifications and activity</p>
        </div>

        <div className="divide-y divide-gray-200">
          {securityAlerts.map((alert) => (
            <div key={alert.id} className={`p-6 hover:bg-gray-50 ${!alert.resolved ? 'bg-yellow-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 w-full">
                  <div className={`p-1 rounded ${
                    alert.severity === 'high' ? 'bg-red-100' :
                    alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {alert.type === 'login_attempt' ? <AlertTriangle className="w-4 h-4 text-current" /> :
                     alert.type === 'device_added' ? <Smartphone className="w-4 h-4 text-current" /> :
                     alert.type === 'password_change' ? <Key className="w-4 h-4 text-current" /> :
                     <Shield className="w-4 h-4 text-current" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-gray-500">{alert.timestamp}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Risk
                      </span>
                      {!alert.resolved && (
                        <button className="text-purple-600 hover:text-purple-800 font-medium">
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {!alert.resolved && (
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 ml-4"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            View All Security Activity →
          </button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{securityStats.loginAttempts}</div>
          <div className="text-sm text-gray-600">Total Logins</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{securityStats.successfulLogins}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-600">{securityStats.failedAttempts}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{securityStats.devicesRegistered}</div>
          <div className="text-sm text-gray-600">Devices</div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Security & Privacy</h1>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-purple-500" />
              <span>Enterprise-grade security for your account</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Lock className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className="text-lg font-bold text-green-600">Secure</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Key className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">2FA Status</p>
                <p className="text-lg font-bold text-purple-600">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Monitor className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Trusted Devices</p>
                <p className="text-lg font-bold text-blue-600">{devices.filter(d => d.isTrusted).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Bell className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-lg font-bold text-yellow-600">{securityAlerts.filter(a => !a.resolved).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === 'password'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Password</span>
              </button>

              <button
                onClick={() => setActiveTab('2fa')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === '2fa'
                    ? `border-b-2 border-${twoFactorEnabled ? 'green' : 'orange'}-500 text-${twoFactorEnabled ? 'green' : 'orange'}-600`
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Two-Factor Auth</span>
                {twoFactorEnabled && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab('devices')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === 'devices'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Devices</span>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === 'privacy'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Privacy</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Activity</span>
                {securityAlerts.filter(a => !a.resolved).length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{securityAlerts.filter(a => !a.resolved).length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-0">
            {activeTab === 'password' && renderPasswordTab()}
            {activeTab === '2fa' && render2FATab()}
            {activeTab === 'devices' && renderDevicesTab()}
            {activeTab === 'privacy' && renderPrivacyTab()}
            {activeTab === 'activity' && renderActivityTab()}
          </div>
        </div>
      </div>
    </div>
  )
}
