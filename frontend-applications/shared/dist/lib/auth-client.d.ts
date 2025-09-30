import { z } from 'zod';
declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    role: z.ZodString;
    organization_id: z.ZodString;
    applications: z.ZodArray<z.ZodString, "many">;
    permissions: z.ZodArray<z.ZodString, "many">;
    profile: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        company?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        company?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    role: string;
    email: string;
    organization_id: string;
    applications: string[];
    permissions: string[];
    profile: {
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        company?: string | undefined;
    };
}, {
    id: string;
    role: string;
    email: string;
    organization_id: string;
    applications: string[];
    permissions: string[];
    profile: {
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        company?: string | undefined;
    };
}>;
declare const AuthResponseSchema: z.ZodObject<{
    message: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        role: z.ZodString;
        organization_id: z.ZodString;
        applications: z.ZodArray<z.ZodString, "many">;
        permissions: z.ZodArray<z.ZodString, "many">;
        profile: z.ZodObject<{
            firstName: z.ZodString;
            lastName: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            company: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            firstName: string;
            lastName: string;
            phone?: string | undefined;
            company?: string | undefined;
        }, {
            firstName: string;
            lastName: string;
            phone?: string | undefined;
            company?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: string;
        email: string;
        organization_id: string;
        applications: string[];
        permissions: string[];
        profile: {
            firstName: string;
            lastName: string;
            phone?: string | undefined;
            company?: string | undefined;
        };
    }, {
        id: string;
        role: string;
        email: string;
        organization_id: string;
        applications: string[];
        permissions: string[];
        profile: {
            firstName: string;
            lastName: string;
            phone?: string | undefined;
            company?: string | undefined;
        };
    }>;
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    applicationContext: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        role: string;
        email: string;
        organization_id: string;
        applications: string[];
        permissions: string[];
        profile: {
            firstName: string;
            lastName: string;
            phone?: string | undefined;
            company?: string | undefined;
        };
    };
    message: string;
    accessToken: string;
    refreshToken: string;
    applicationContext: string;
}, {
    user: {
        id: string;
        role: string;
        email: string;
        organization_id: string;
        applications: string[];
        permissions: string[];
        profile: {
            firstName: string;
            lastName: string;
            phone?: string | undefined;
            company?: string | undefined;
        };
    };
    message: string;
    accessToken: string;
    refreshToken: string;
    applicationContext: string;
}>;
declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    application: z.ZodOptional<z.ZodEnum<["b2c", "b2b", "admin"]>>;
    rememberMe: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    application?: "b2c" | "b2b" | "admin" | undefined;
    rememberMe?: boolean | undefined;
}, {
    email: string;
    password: string;
    application?: "b2c" | "b2b" | "admin" | undefined;
    rememberMe?: boolean | undefined;
}>;
declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    application: z.ZodOptional<z.ZodEnum<["b2c", "b2b"]>>;
    organizationType: z.ZodOptional<z.ZodEnum<["individual", "business"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    application?: "b2c" | "b2b" | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    organizationType?: "individual" | "business" | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    application?: "b2c" | "b2b" | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    organizationType?: "individual" | "business" | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
declare class AuthClient {
    private baseURL;
    private applicationContext;
    private accessToken;
    private refreshToken;
    private user;
    constructor(applicationContext?: 'b2c' | 'b2b' | 'admin');
    private saveTokensToStorage;
    private loadTokensFromStorage;
    private clearTokensFromStorage;
    private makeRequest;
    login(data: LoginRequest): Promise<AuthResponse>;
    register(data: RegisterRequest): Promise<AuthResponse>;
    refreshTokens(): Promise<void>;
    getProfile(): Promise<User>;
    updateProfile(updates: Partial<User['profile']>): Promise<User>;
    checkApplicationAccess(app: string): Promise<{
        application: string;
        hasAccess: boolean;
        userApplications: string[];
        userRole: string;
        permissions: string[];
    }>;
    logout(): Promise<void>;
    makeAuthenticatedRequest<T>(endpoint: string, options?: RequestInit): Promise<T>;
    isAuthenticated(): boolean;
    getCurrentUser(): User | null;
    getAccessToken(): string | null;
    hasPermission(permission: string): boolean;
    hasRole(role: string): boolean;
    hasApplicationAccess(app: string): boolean;
    getApplicationContext(): string;
    setApplicationContext(context: 'b2c' | 'b2b' | 'admin'): void;
}
export declare const b2cAuthClient: AuthClient;
export declare const b2bAuthClient: AuthClient;
export declare const adminAuthClient: AuthClient;
export { AuthClient };
export declare const useAuthClient: (context?: "b2c" | "b2b" | "admin") => AuthClient;
//# sourceMappingURL=auth-client.d.ts.map