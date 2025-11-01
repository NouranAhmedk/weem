/**
 * User-related test data types
 */

export interface UserData {
  phone: string;
  countryCode?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

export interface OTPData {
  code: string;
  phone: string;
}

export interface UserCredentials {
  phone: string;
  otp: string;
}

export interface UserProfile {
  userId?: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  addresses?: Address[];
  preferences?: UserPreferences;
}

export interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UserPreferences {
  language: 'en' | 'ar';
  currency: 'SAR' | 'USD';
  notifications: boolean;
  newsletter: boolean;
}

export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface UserSession {
  userId: string;
  phone: string;
  token?: string;
  expiresAt?: Date;
}
