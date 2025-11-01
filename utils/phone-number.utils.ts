import { PHONE_BASE, PHONE_RANDOM_DIGITS } from './app-config';

export function generateRandomPhoneNumber(): string {
  const max = Math.pow(10, PHONE_RANDOM_DIGITS);
  const random = Math.floor(Math.random() * max)
    .toString()
    .padStart(PHONE_RANDOM_DIGITS, '0');
  return `${PHONE_BASE}${random}`;
}

export function generateInvalidPhoneNumber(): string {
  const invalidTypes = [
    () => '123', // Too short
    () => '12', // Very short
    () => 'abc', // Contains letters
    () => '12345', // Too short for full number
    () => '123456', // Still too short
    () => `${PHONE_BASE}`, // Missing random digits
  ];
  
  const randomType = invalidTypes[Math.floor(Math.random() * invalidTypes.length)];
  return randomType();
}