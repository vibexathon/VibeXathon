# Manual UPI Payment Flow - Setup Guide

This document explains the manual UPI payment flow implementation for the Vibexathon registration system.

## Overview

The payment system uses a **manual verification approach** without any payment gateway integration. This is designed for small-scale usage (up to 50 users) where admin manually verifies payments using UTR numbers.

## Payment Flow

### 1. User Registration Flow

1. User fills registration form with team details
2. User selects payment amount:
   - ₹400 for IEEE members
   - ₹500 for general participants
3. System generates:
   - Unique Order ID: `ORD{timestamp}{random}`
   - UPI payment link: `upi://pay?pa={UPI_ID}&pn={NAME}&am={AMOUNT}&cu=INR&tn={ORDER_ID}`
   - QR code from the UPI link
4. QR code is displayed to user
5. User scans QR code with any UPI app and completes payment
6. User enters:
   - UTR number (12-digit transaction reference)
   - Uploads payment screenshot
7. System stores order with status: `pending_verification`

### 2. Admin Verification Flow

1. Admin opens Admin Dashboard → Requests tab
2. Admin sees all pending payment verifications
3. For each payment, admin:
   - Views Order ID, Amount, UTR, and Screenshot
   - Opens bank app/statement
   - Verifies:
     - UTR exists in bank statement
     - Amount matches
     - Payment received in correct UPI ID
4. Admin actions:
   - **Approve**: Updates status to `paid`, grants portal access
   - **Reject**: Provides reason, deletes registration (user can re-register)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# UPI Payment Configuration
VITE_UPI_ID=yourupi@bank
VITE_UPI_NAME=YourName
```

Replace with your actual UPI details:
- `VITE_UPI_ID`: Your UPI ID (e.g., `9876543210@paytm`)
- `VITE_UPI_NAME`: Payee name as registered with UPI

## Database Schema

### PaymentOrder Interface

```typescript
interface PaymentOrder {
  orderId: string;           // Unique order ID
  amount: number;            // 400 or 500
  status: PaymentStatus;     // pending | pending_verification | paid | rejected
  createdAt: number;         // Timestamp
  utr?: string;              // UTR number from user
  screenshotUrl?: string;    // Firebase Storage URL
  qrCodeDataUrl?: string;    // QR code image data URL
  verifiedAt?: number;       // Verification timestamp
  verifiedBy?: string;       // Admin ID
  rejectionReason?: string;  // Reason if rejected
}
```

### Team Interface Updates

```typescript
interface Team {
  // ... existing fields
  paymentOrder?: PaymentOrder;  // Payment order details
}
```

## Key Features

### Security & Validation

1. **Amount Validation**: Only ₹400 or ₹500 allowed
2. **UTR Validation**: Must be 12 alphanumeric characters
3. **Screenshot Required**: Mandatory upload for verification
4. **Manual Verification**: Admin must manually check bank statement
5. **No Auto-Approval**: All payments require manual admin verification

### QR Code Generation

- Uses Google Charts API for QR code generation
- Fallback to direct URL if image fetch fails
- QR code contains complete UPI payment link

### File Storage

- Payment screenshots: `payment_proofs/{orderId}_{timestamp}.jpg`
- IEEE proofs: `ieee_proofs/{teamName}_{timestamp}_{filename}`
- All stored in Firebase Storage

## Admin Dashboard

### Payment Verification Component

Located at: `src/components/PaymentVerification.tsx`

Features:
- View all payment details
- Expand/collapse screenshot
- Approve with confirmation
- Reject with reason input
- IEEE member badge display

### Admin Actions

1. **Verify & Approve**:
   - Confirms UTR, amount, and UPI ID match
   - Updates order status to `paid`
   - Grants team portal access
   - Sets `isVerified: true`

2. **Reject**:
   - Requires rejection reason
   - Deletes team registration
   - User can re-register if needed

## Important Rules

1. **No Payment Gateway**: No Razorpay, Stripe, or any automated payment processing
2. **No Auto-Verification**: All payments verified manually by admin
3. **UTR is Primary**: UTR number is the main verification method
4. **Screenshot is Supporting**: Screenshot is additional evidence only
5. **Small Scale Only**: Designed for ~50 users maximum
6. **Manual Bank Check**: Admin must check bank app/statement for each payment

## Testing

### Test Flow

1. Register a test team
2. Generate QR code (will show test UPI details)
3. Enter dummy UTR: `TEST12345678`
4. Upload any screenshot
5. Login as admin
6. Verify the payment in Admin Dashboard

### Test UPI Details

For testing, update `.env`:
```env
VITE_UPI_ID=test@upi
VITE_UPI_NAME=Test User
```

## Migration from Razorpay

If migrating from Razorpay:

1. Old teams with `paymentId` and `amountPaid` will continue to work
2. New registrations use `paymentOrder` structure
3. Admin dashboard handles both old and new formats
4. No data migration required

## Troubleshooting

### QR Code Not Generating
- Check internet connection (uses Google Charts API)
- Verify UPI details in `.env`
- Check browser console for errors

### UTR Validation Failing
- UTR must be exactly 12 characters
- Only alphanumeric characters allowed
- Remove spaces before submitting

### Screenshot Upload Failing
- Check Firebase Storage rules
- Verify storage bucket configuration
- Ensure file size < 5MB

## Support

For issues or questions:
1. Check Firebase Console for storage/database errors
2. Verify environment variables are set correctly
3. Check browser console for client-side errors
4. Review Admin Dashboard for pending verifications

## Security Notes

1. **Never expose UPI credentials** in client-side code
2. **Validate all inputs** on both client and server
3. **Store screenshots securely** in Firebase Storage
4. **Implement proper access control** for admin functions
5. **Log all verification actions** for audit trail
