/**
 * ============================================
 * RAZORPAY SERVICE
 * ============================================
 * Handles payment processing with Razorpay
 * 
 * HOW TO SETUP:
 * 1. Get API keys from https://dashboard.razorpay.com/app/keys
 * 2. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env
 * 3. Enable webhooks at https://dashboard.razorpay.com/app/webhooks
 * 4. Set webhook URL to: https://your-domain.com/api/payments/webhook
 */

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Check if Razorpay is configured
 */
export function isRazorpayConfigured() {
  return RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && 
         !RAZORPAY_KEY_ID.includes('mock') && 
         !RAZORPAY_KEY_SECRET.includes('mock');
}

/**
 * Create a payment order (one-time donation)
 * @param {number} amount - Amount in INR
 * @param {string} currency - Currency code (default: INR)
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} Order object
 */
export async function createOrder(amount, currency = 'INR', notes = {}) {
  // MOCKED: Return mock order if Razorpay not configured
  if (!isRazorpayConfigured()) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: amount * 100,
      currency,
      status: 'created',
      notes,
      isMocked: true,
    };
  }

  // REAL IMPLEMENTATION: Uncomment when Razorpay is configured
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to paise
      currency,
      notes,
    }),
  });

  return await response.json();
}

/**
 * Create a subscription (recurring membership)
 * @param {string} planId - Razorpay plan ID
 * @param {string} customerId - Razorpay customer ID
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} Subscription object
 */
export async function createSubscription(planId, customerId, notes = {}) {
  // MOCKED: Return mock subscription if Razorpay not configured
  if (!isRazorpayConfigured()) {
    return {
      id: `sub_mock_${Date.now()}`,
      plan_id: planId,
      customer_id: customerId,
      status: 'created',
      notes,
      isMocked: true,
    };
  }

  // REAL IMPLEMENTATION: Uncomment when Razorpay is configured
  const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      customer_id: customerId,
      total_count: 12, // 12 months
      notes,
    }),
  });

  return await response.json();
}

/**
 * Create a customer
 * @param {string} name - Customer name
 * @param {string} email - Customer email
 * @param {string} phone - Customer phone
 * @returns {Promise<object>} Customer object
 */
export async function createCustomer(name, email, phone) {
  // MOCKED: Return mock customer if Razorpay not configured
  if (!isRazorpayConfigured()) {
    return {
      id: `cust_mock_${Date.now()}`,
      name,
      email,
      contact: phone,
      isMocked: true,
    };
  }

  // REAL IMPLEMENTATION: Uncomment when Razorpay is configured
  const response = await fetch('https://api.razorpay.com/v1/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      name,
      email,
      contact: phone,
    }),
  });

  return await response.json();
}

/**
 * Verify payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
  // MOCKED: Always return true if Razorpay not configured
  if (!isRazorpayConfigured()) {
    return true;
  }

  // REAL IMPLEMENTATION: Uncomment when Razorpay is configured
  const crypto = require('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  return generatedSignature === signature;
}

/**
 * Membership plans
 */
export const MEMBERSHIP_PLANS = {
  basic: {
    id: 'plan_basic',
    name: 'Basic Membership',
    amount: 199,
    currency: 'INR',
    period: 'monthly',
    description: 'Support our cause with monthly contributions',
  },
  core: {
    id: 'plan_core',
    name: 'Core Membership',
    amount: 499,
    currency: 'INR',
    period: 'monthly',
    description: 'Be a core supporter of our initiatives',
  },
  premium: {
    id: 'plan_premium',
    name: 'Premium Membership',
    amount: 999,
    currency: 'INR',
    period: 'monthly',
    description: 'Premium support with exclusive benefits',
  },
};
