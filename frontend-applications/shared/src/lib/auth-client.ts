import { z } from 'zod'

// Authentication schemas
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string(),
  organization_id: z.string(),
  applications: z.array(z.string()),
  permissions: z.array(z.string()),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    company: z.string().optional(),
  }),
})

const AuthResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  applicationContext: z.string(),
})

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  application: z.enum(['b2c', 'b2b', 'admin']).optional(),
  rememberMe: z.boolean().optional(),
})

const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  company: z.string().optional(),
  application: z.enum(['b2c', 'b2b']).optional(),
  organizationType: z.enum(['individual', 'business']).optional(),
})

// Types
export type User = z.infer<typeof UserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

// Unified Authentication Client
class AuthClient {
  private baseURL: string
  private applicationContext: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private user: User | null = null

  constructor(applicationContext: 'b2c' | 'b2b' | 'admin' = 'b2c') {
    this.baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000'
    this.applicationContext = applicationContext

    // Load tokens from storage on initialization
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage()
    }
  }

  // Storage helpers
  private saveTokensToStorage(accessToken: string, refreshToken: string, user: User) {
    if (typeof window === 'undefined') return

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('applicationContext', this.applicationContext)

    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.user = user
  }

  private loadTokensFromStorage() {
    if (typeof window === 'undefined') return

    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const userStr = localStorage.getItem('user')
    const appContext = localStorage.getItem('applicationContext')

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr)
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.user = UserSchema.parse(user)

        // Update application context if it doesn't match
        if (appContext !== this.applicationContext) {
          this.applicationContext = appContext || this.applicationContext
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        this.clearTokensFromStorage()
      }
    }
  }

  private clearTokensFromStorage() {
    if (typeof window === 'undefined') return

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('applicationContext')

    this.accessToken = null
    this.refreshToken = null
    this.user = null
  }

  // API helpers
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}/auth${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Application-Context': this.applicationContext,
      ...options.headers,
    }

    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Public methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const validatedData = LoginRequestSchema.parse({
      ...data,
      application: data.application || this.applicationContext,
    })

    const response = await this.makeRequest<AuthResponse>(
      '/login',
      {
        method: 'POST',
        body: JSON.stringify(validatedData),
      },
      false
    )

    const authResponse = AuthResponseSchema.parse(response)
    this.saveTokensToStorage(authResponse.accessToken, authResponse.refreshToken, authResponse.user)

    return authResponse
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const validatedData = RegisterRequestSchema.parse({
      ...data,
      application: data.application || this.applicationContext,
    })

    const response = await this.makeRequest<AuthResponse>(
      '/register',
      {
        method: 'POST',
        body: JSON.stringify(validatedData),
      },
      false
    )

    const authResponse = AuthResponseSchema.parse(response)
    this.saveTokensToStorage(authResponse.accessToken, authResponse.refreshToken, authResponse.user)

    return authResponse
  }

  async refreshTokens(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await this.makeRequest<{ accessToken: string; refreshToken: string }>(
        '/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        },
        false
      )

      this.accessToken = response.accessToken
      if (response.refreshToken) {
        this.refreshToken = response.refreshToken
      }

      if (this.user) {
        this.saveTokensToStorage(this.accessToken, this.refreshToken, this.user)
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      throw error
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.makeRequest<{ user: User }>('/profile')
    const user = UserSchema.parse(response.user)
    this.user = user

    if (this.accessToken && this.refreshToken) {
      this.saveTokensToStorage(this.accessToken, this.refreshToken, user)
    }

    return user
  }

  async updateProfile(updates: Partial<User['profile']>): Promise<User> {
    const response = await this.makeRequest<{ user: User }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })

    const user = UserSchema.parse(response.user)
    this.user = user

    if (this.accessToken && this.refreshToken) {
      this.saveTokensToStorage(this.accessToken, this.refreshToken, user)
    }

    return user
  }

  async checkApplicationAccess(app: string): Promise<{
    application: string
    hasAccess: boolean
    userApplications: string[]
    userRole: string
    permissions: string[]
  }> {
    return this.makeRequest(`/applications/${app}/access`)
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      this.clearTokensFromStorage()
    }
  }

  // Auto-refresh token on API calls
  async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      return await this.makeRequest<T>(endpoint, options)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // If unauthorized and we have a refresh token, try to refresh
      if (errorMessage.includes('401') && this.refreshToken) {
        try {
          await this.refreshTokens()
          return await this.makeRequest<T>(endpoint, options)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          this.logout()
          throw new Error('Authentication failed')
        }
      }

      throw error
    }
  }

  // Getters
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user
  }

  getCurrentUser(): User | null {
    return this.user
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  hasPermission(permission: string): boolean {
    if (!this.user) return false
    return this.user.permissions.includes('*') || this.user.permissions.includes(permission)
  }

  hasRole(role: string): boolean {
    return this.user?.role === role
  }

  hasApplicationAccess(app: string): boolean {
    return this.user?.applications.includes(app) || false
  }

  getApplicationContext(): string {
    return this.applicationContext
  }

  setApplicationContext(context: 'b2c' | 'b2b' | 'admin') {
    this.applicationContext = context
    if (typeof window !== 'undefined') {
      localStorage.setItem('applicationContext', context)
    }
  }
}

// Export singleton instances for each application
export const b2cAuthClient = new AuthClient('b2c')
export const b2bAuthClient = new AuthClient('b2b')
export const adminAuthClient = new AuthClient('admin')

// Export the class for custom instances
export { AuthClient }

// Convenience hooks for React applications
export const useAuthClient = (context?: 'b2c' | 'b2b' | 'admin') => {
  if (context === 'b2b') return b2bAuthClient
  if (context === 'admin') return adminAuthClient
  return b2cAuthClient
}