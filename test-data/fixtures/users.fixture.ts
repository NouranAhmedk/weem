/**
 * User Fixtures
 * Pre-defined user test data for consistent testing
 */

import { UserData, UserProfile, Address } from '../types/user.types';

/**
 * Test users for different scenarios
 */
export const TEST_USERS = {
  /**
   * New user for registration testing
   */
  newUser: (): UserData => ({
    phone: `5${Date.now().toString().slice(-8)}`,
    countryCode: '+966',
    email: `newuser-${Date.now()}@weem-test.com`,
    firstName: 'Test',
    lastName: 'User',
  }),

  /**
   * Valid registered user
   */
  registeredUser: {
    phone: '500000001',
    countryCode: '+966',
    email: 'registered@weem-test.com',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
  } as UserData,

  /**
   * Admin user (if applicable)
   */
  adminUser: {
    phone: '500000999',
    countryCode: '+966',
    email: 'admin@weem-test.com',
    firstName: 'Admin',
    lastName: 'User',
  } as UserData,

  /**
   * Guest user (no registration)
   */
  guestUser: {
    phone: '',
    email: 'guest@weem-test.com',
  } as UserData,
};

/**
 * Test addresses for different cities
 */
export const TEST_ADDRESSES = {
  riyadh: {
    type: 'home',
    street: '123 King Fahd Road',
    city: 'Riyadh',
    zipCode: '12345',
    country: 'Saudi Arabia',
    isDefault: true,
  } as Address,

  jeddah: {
    type: 'work',
    street: '456 Tahlia Street',
    city: 'Jeddah',
    zipCode: '23456',
    country: 'Saudi Arabia',
    isDefault: false,
  } as Address,

  dammam: {
    type: 'other',
    street: '789 King Abdullah Road',
    city: 'Dammam',
    zipCode: '34567',
    country: 'Saudi Arabia',
    isDefault: false,
  } as Address,
};

/**
 * Complete user profiles for testing
 */
export const USER_PROFILES = {
  complete: {
    userId: 'user-001',
    phone: '500000001',
    email: 'complete@weem-test.com',
    firstName: 'Mohammed',
    lastName: 'Al-Mutairi',
    addresses: [TEST_ADDRESSES.riyadh, TEST_ADDRESSES.jeddah],
    preferences: {
      language: 'en',
      currency: 'SAR',
      notifications: true,
      newsletter: true,
    },
  } as UserProfile,

  minimal: {
    phone: '500000002',
    email: 'minimal@weem-test.com',
  } as UserProfile,
};

/**
 * Invalid user data for negative testing
 */
export const INVALID_USERS = {
  invalidPhone: {
    phone: '123', // Too short
    email: 'invalid@weem-test.com',
  } as UserData,

  invalidEmail: {
    phone: '500000003',
    email: 'invalid-email', // Invalid format
  } as UserData,

  emptyFields: {
    phone: '',
    email: '',
  } as UserData,
};

/**
 * OTP codes for testing
 */
export const TEST_OTP_CODES = {
  valid: '00000',
  invalid: '99999',
  expired: '11111',
};
