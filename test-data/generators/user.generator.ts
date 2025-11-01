/**
 * User Data Generator
 * Generates random user data for testing
 */

import { UserData, UserCredentials, Address, UserProfile, UserPreferences } from '../types/user.types';
import { PHONE_BASE, PHONE_RANDOM_DIGITS, TEST_OTP } from '../../utils/app-config';

export class UserGenerator {
  /**
   * Generate a random Saudi phone number
   * Format: 5XXXXXXXX (9 digits starting with 5)
   */
  static generatePhoneNumber(): string {
    const randomDigits = Math.floor(Math.random() * Math.pow(10, PHONE_RANDOM_DIGITS))
      .toString()
      .padStart(PHONE_RANDOM_DIGITS, '0');
    return `${PHONE_BASE}${randomDigits}`;
  }

  /**
   * Generate a unique phone number with timestamp
   */
  static generateUniquePhoneNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `5${timestamp.slice(0, 4)}${randomPart}`;
  }

  /**
   * Generate random user data
   */
  static generateUser(overrides?: Partial<UserData>): UserData {
    return {
      phone: this.generatePhoneNumber(),
      countryCode: '+966',
      email: this.generateEmail(),
      firstName: this.generateFirstName(),
      lastName: this.generateLastName(),
      ...overrides,
    };
  }

  /**
   * Generate user credentials for authentication
   */
  static generateCredentials(overrides?: Partial<UserCredentials>): UserCredentials {
    return {
      phone: this.generatePhoneNumber(),
      otp: TEST_OTP,
      ...overrides,
    };
  }

  /**
   * Generate random email
   */
  static generateEmail(prefix?: string): string {
    const randomString = Math.random().toString(36).substring(2, 10);
    const domain = 'weem-test.com';
    return `${prefix || 'user'}-${randomString}@${domain}`;
  }

  /**
   * Generate random first name
   */
  static generateFirstName(): string {
    const names = [
      'Ahmed', 'Mohammed', 'Ali', 'Omar', 'Khalid',
      'Fatima', 'Aisha', 'Mariam', 'Sara', 'Noor',
      'Abdullah', 'Hassan', 'Ibrahim', 'Youssef', 'Zaid'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generate random last name
   */
  static generateLastName(): string {
    const names = [
      'Al-Rashid', 'Al-Mutairi', 'Al-Otaibi', 'Al-Dosari', 'Al-Ghamdi',
      'Al-Zahrani', 'Al-Qahtani', 'Al-Shammari', 'Al-Harbi', 'Al-Maliki',
      'Al-Saud', 'Al-Khaled', 'Al-Subaie', 'Al-Anazi', 'Al-Tamimi'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generate Saudi address
   */
  static generateAddress(overrides?: Partial<Address>): Address {
    const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Tabuk'];
    const streets = [
      'King Fahd Road', 'King Abdullah Road', 'Prince Mohammed Road',
      'Al Olaya Street', 'Tahlia Street', 'Al Madinah Road'
    ];

    return {
      type: 'home',
      street: `${Math.floor(Math.random() * 999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      zipCode: this.generateZipCode(),
      country: 'Saudi Arabia',
      isDefault: true,
      ...overrides,
    };
  }

  /**
   * Generate Saudi zip code
   */
  static generateZipCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  /**
   * Generate user profile
   */
  static generateProfile(overrides?: Partial<UserProfile>): UserProfile {
    return {
      phone: this.generatePhoneNumber(),
      email: this.generateEmail(),
      firstName: this.generateFirstName(),
      lastName: this.generateLastName(),
      addresses: [this.generateAddress()],
      preferences: this.generatePreferences(),
      ...overrides,
    };
  }

  /**
   * Generate user preferences
   */
  static generatePreferences(overrides?: Partial<UserPreferences>): UserPreferences {
    return {
      language: 'en',
      currency: 'SAR',
      notifications: true,
      newsletter: true,
      ...overrides,
    };
  }

  /**
   * Generate multiple users
   */
  static generateUsers(count: number, overrides?: Partial<UserData>): UserData[] {
    return Array.from({ length: count }, () => this.generateUser(overrides));
  }

  /**
   * Generate test user with specific characteristics
   */
  static generateTestUser(scenario: 'new' | 'existing' | 'guest' = 'new'): UserData {
    switch (scenario) {
      case 'new':
        return this.generateUser({
          phone: this.generateUniquePhoneNumber(),
        });
      case 'existing':
        // Use a known test phone number
        return this.generateUser({
          phone: '500000001',
        });
      case 'guest':
        return {
          phone: '',
        };
      default:
        return this.generateUser();
    }
  }
}
