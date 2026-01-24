/**
 * Shared test data for E2E tests
 * Contains test credentials and mock data used across all test suites
 */

export const TEST_CUSTOMER = {
  email: 'customer@test.cleanly.com',
  password: 'TestPass123!',
};

export const TEST_BUSINESS = {
  email: 'business@test.cleanly.com',
  password: 'TestPass123!',
};

export const TEST_ADMIN = {
  email: 'admin@test.cleanly.com',
  password: 'TestPass123!',
};

export const STRIPE_TEST_CARD = {
  number: '4242424242424242',
  expiry: '1230',
  cvc: '123',
};

export const TEST_SERVICE = {
  name: 'Standard Home Cleaning',
  price: 45,
  category: 'CLEANING',
};
