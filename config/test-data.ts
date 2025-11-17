/**
 * Test Data Configuration
 * Centralized test data for Weem automation tests
 */

import { generateRandomPhoneNumber } from '../utils/phone-number.utils';

// Test Phone Number - Random last 3 digits (500000XXX)
export function getRandomPhoneNumber(): string {
  return generateRandomPhoneNumber();
}

// OTP - Always use '00000'
export const TEST_OTP = '00000';

/**
 * Runtime storage for phone numbers used in tests.
 * This is in-memory only (per worker) and is intended for sharing
 * a generated phone number across helpers/tests within the same run.
 */
let lastRegisteredPhoneNumber: string | null = null;

export function setLastRegisteredPhoneNumber(phoneNumber: string): void {
  lastRegisteredPhoneNumber = phoneNumber;
}

export function getLastRegisteredPhoneNumber(): string | null {
  return lastRegisteredPhoneNumber;
}

