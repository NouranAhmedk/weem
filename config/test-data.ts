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


