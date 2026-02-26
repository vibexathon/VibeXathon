import { PaymentOrder, PaymentStatus } from './types';

// UPI Configuration - Update these with your actual UPI details
const UPI_CONFIG = {
  pa: import.meta.env.VITE_UPI_ID || 'yourupi@bank', // UPI ID
  pn: import.meta.env.VITE_UPI_NAME || 'YourName', // Payee Name
  cu: 'INR' // Currency
};

/**
 * Generates a unique order ID
 * Format: ORD + timestamp + random number
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD${timestamp}${random}`;
};

/**
 * Creates a UPI payment link
 */
export const createUpiLink = (amount: number, orderId: string): string => {
  const params = new URLSearchParams({
    pa: UPI_CONFIG.pa,
    pn: UPI_CONFIG.pn,
    am: amount.toString(),
    cu: UPI_CONFIG.cu,
    tn: orderId
  });
  
  return `upi://pay?${params.toString()}`;
};

/**
 * Creates a UPI Intent URL (for Android)
 * This works better with Google Pay and PhonePe
 */
export const createUpiIntentUrl = (amount: number, orderId: string): string => {
  const upiString = `pa=${UPI_CONFIG.pa}&pn=${encodeURIComponent(UPI_CONFIG.pn)}&am=${amount}&cu=${UPI_CONFIG.cu}&tn=${encodeURIComponent(orderId)}`;
  return `intent://pay?${upiString}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
};

/**
 * Generates a QR code data URL from UPI link
 * Uses QR Server API as primary, with Google Charts as fallback
 */
export const generateQRCode = async (upiLink: string): Promise<string> => {
  const size = 300;
  
  // Try QR Server API first (no CORS issues)
  try {
    const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiLink)}`;
    const response = await fetch(qrServerUrl);
    
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.warn('QR Server API failed, trying Google Charts:', error);
  }
  
  // Fallback to Google Charts API
  try {
    const googleChartsUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(upiLink)}`;
    const response = await fetch(googleChartsUrl);
    
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.warn('Google Charts API failed:', error);
  }
  
  // Final fallback: return direct URL (will work but might have CORS issues in some browsers)
  console.warn('Using direct QR code URL as fallback');
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiLink)}`;
};

/**
 * Creates a payment order with QR code
 */
export const createPaymentOrder = async (amount: number): Promise<PaymentOrder> => {
  // Validate amount - FOR TESTING: Allow ₹2
  if (amount !== 2 && amount !== 400 && amount !== 500) {
    throw new Error('Invalid amount. Only ₹2 (testing), ₹400 or ₹500 allowed.');
  }

  const orderId = generateOrderId();
  const upiLink = createUpiLink(amount, orderId);
  const qrCodeDataUrl = await generateQRCode(upiLink);

  const order: PaymentOrder = {
    orderId,
    amount,
    status: PaymentStatus.PENDING,
    createdAt: Date.now(),
    qrCodeDataUrl
  };

  return order;
};

/**
 * Validates UTR number format
 * UTR is typically 12 digits
 */
export const validateUTR = (utr: string): boolean => {
  // Remove spaces and check if it's alphanumeric and 12 characters
  const cleaned = utr.replace(/\s/g, '');
  return /^[A-Z0-9]{12}$/i.test(cleaned);
};

/**
 * Updates payment order with UTR and screenshot
 */
export const submitPaymentProof = (
  order: PaymentOrder,
  utr: string,
  screenshotUrl: string
): PaymentOrder => {
  if (!validateUTR(utr)) {
    throw new Error('Invalid UTR format. UTR should be 12 alphanumeric characters.');
  }

  return {
    ...order,
    utr: utr.toUpperCase().replace(/\s/g, ''),
    screenshotUrl,
    status: PaymentStatus.PENDING_VERIFICATION
  };
};

/**
 * Admin: Verify payment
 */
export const verifyPayment = (
  order: PaymentOrder,
  adminId: string
): PaymentOrder => {
  return {
    ...order,
    status: PaymentStatus.PAID,
    verifiedAt: Date.now(),
    verifiedBy: adminId
  };
};

/**
 * Admin: Reject payment
 */
export const rejectPayment = (
  order: PaymentOrder,
  reason: string,
  adminId: string
): PaymentOrder => {
  return {
    ...order,
    status: PaymentStatus.REJECTED,
    rejectionReason: reason,
    verifiedAt: Date.now(),
    verifiedBy: adminId
  };
};
