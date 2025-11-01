/**
 * User Data Builder
 * Builder pattern for creating user data with fluent API
 */

import { UserData, UserProfile, Address, UserPreferences } from '../types/user.types';
import { UserGenerator } from '../generators/user.generator';

export class UserBuilder {
  private user: UserData;

  constructor() {
    this.user = UserGenerator.generateUser();
  }

  /**
   * Set phone number
   */
  withPhone(phone: string): this {
    this.user.phone = phone;
    return this;
  }

  /**
   * Set country code
   */
  withCountryCode(code: string): this {
    this.user.countryCode = code;
    return this;
  }

  /**
   * Set email
   */
  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  /**
   * Set first name
   */
  withFirstName(firstName: string): this {
    this.user.firstName = firstName;
    return this;
  }

  /**
   * Set last name
   */
  withLastName(lastName: string): this {
    this.user.lastName = lastName;
    return this;
  }

  /**
   * Set password
   */
  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  /**
   * Generate unique phone
   */
  withUniquePhone(): this {
    this.user.phone = UserGenerator.generateUniquePhoneNumber();
    return this;
  }

  /**
   * Generate random email
   */
  withRandomEmail(prefix?: string): this {
    this.user.email = UserGenerator.generateEmail(prefix);
    return this;
  }

  /**
   * Build and return the user data
   */
  build(): UserData {
    return { ...this.user };
  }

  /**
   * Reset builder to default state
   */
  reset(): this {
    this.user = UserGenerator.generateUser();
    return this;
  }
}

export class UserProfileBuilder {
  private profile: UserProfile;

  constructor() {
    this.profile = UserGenerator.generateProfile();
  }

  /**
   * Set user ID
   */
  withUserId(userId: string): this {
    this.profile.userId = userId;
    return this;
  }

  /**
   * Set phone number
   */
  withPhone(phone: string): this {
    this.profile.phone = phone;
    return this;
  }

  /**
   * Set email
   */
  withEmail(email: string): this {
    this.profile.email = email;
    return this;
  }

  /**
   * Set full name
   */
  withName(firstName: string, lastName: string): this {
    this.profile.firstName = firstName;
    this.profile.lastName = lastName;
    return this;
  }

  /**
   * Add an address
   */
  withAddress(address: Address): this {
    if (!this.profile.addresses) {
      this.profile.addresses = [];
    }
    this.profile.addresses.push(address);
    return this;
  }

  /**
   * Add default address
   */
  withDefaultAddress(): this {
    const address = UserGenerator.generateAddress({ isDefault: true });
    return this.withAddress(address);
  }

  /**
   * Set preferences
   */
  withPreferences(preferences: UserPreferences): this {
    this.profile.preferences = preferences;
    return this;
  }

  /**
   * Set language preference
   */
  withLanguage(language: 'en' | 'ar'): this {
    if (!this.profile.preferences) {
      this.profile.preferences = UserGenerator.generatePreferences();
    }
    this.profile.preferences.language = language;
    return this;
  }

  /**
   * Build and return the profile
   */
  build(): UserProfile {
    return { ...this.profile };
  }
}

export class AddressBuilder {
  private address: Address;

  constructor() {
    this.address = UserGenerator.generateAddress();
  }

  /**
   * Set address type
   */
  withType(type: 'home' | 'work' | 'other'): this {
    this.address.type = type;
    return this;
  }

  /**
   * Set street address
   */
  withStreet(street: string): this {
    this.address.street = street;
    return this;
  }

  /**
   * Set city
   */
  withCity(city: string): this {
    this.address.city = city;
    return this;
  }

  /**
   * Set zip code
   */
  withZipCode(zipCode: string): this {
    this.address.zipCode = zipCode;
    return this;
  }

  /**
   * Set country
   */
  withCountry(country: string): this {
    this.address.country = country;
    return this;
  }

  /**
   * Set as default address
   */
  asDefault(isDefault: boolean = true): this {
    this.address.isDefault = isDefault;
    return this;
  }

  /**
   * Build and return the address
   */
  build(): Address {
    return { ...this.address };
  }
}
