# Quick Start Guide - Manual UPI Payment System

## ✅ Implementation Complete!

The manual UPI payment flow has been successfully implemented and tested.

## 🚀 Get Started in 3 Steps

### Step 1: Configure UPI Details
Edit `.env` file and update these two lines:

```env
VITE_UPI_ID=yourupi@bank    # Replace with your UPI ID (e.g., 9876543210@paytm)
VITE_UPI_NAME=YourName      # Replace with your name
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test the Flow

#### As User:
1. Go to `http://localhost:5173/register`
2. Fill registration form
3. Select IEEE (₹400) or General (₹500)
4. Click "Proceed to Payment"
5. You'll see a QR code
6. Enter test UTR: `TEST12345678`
7. Upload any image
8. Complete registration

#### As Admin:
1. Login with admin credentials
2. Go to Admin Dashboard
3. Click "Requests" tab
4. You'll see the payment verification card
5. Click "Verify & Approve" to approve

## 📋 What Changed?

### Removed:
- ❌ Razorpay integration
- ❌ Automatic payment verification
- ❌ Payment gateway dependencies

### Added:
- ✅ Manual UPI QR code generation
- ✅ UTR-based verification
- ✅ Screenshot upload
- ✅ Admin verification interface
- ✅ Payment order tracking

## 🔑 Key Features

1. **Fixed Amounts**: Only ₹400 (IEEE) or ₹500 (General)
2. **Unique Order IDs**: Format `ORD{timestamp}{random}`
3. **QR Code**: Generated using Google Charts API
4. **UTR Validation**: Must be 12 alphanumeric characters
5. **Manual Verification**: Admin checks bank statement
6. **No Auto-Approval**: Every payment needs admin action

## 📱 Payment Flow

```
User Registration
    ↓
Generate QR Code
    ↓
User Scans & Pays
    ↓
User Enters UTR + Screenshot
    ↓
Admin Verifies in Bank App
    ↓
Admin Approves/Rejects
    ↓
User Gets Portal Access
```

## 🔍 Admin Verification Process

When a payment comes in:
1. Open Admin Dashboard → Requests
2. View payment details (Order ID, Amount, UTR, Screenshot)
3. Open your bank/UPI app
4. Find transaction with matching UTR
5. Verify:
   - ✓ UTR matches
   - ✓ Amount is correct (₹400 or ₹500)
   - ✓ Payment received in your UPI ID
6. Click "Verify & Approve" if all match
7. Or "Reject" with reason if mismatch

## 📂 New Files

- `src/paymentService.ts` - Payment logic
- `src/components/PaymentVerification.tsx` - Admin UI
- `PAYMENT_FLOW_SETUP.md` - Detailed docs
- `IMPLEMENTATION_CHECKLIST.md` - Setup checklist

## 🐛 Common Issues

### QR Code Not Showing
- Check internet connection (uses Google Charts API)
- Verify UPI details in `.env`

### UTR Validation Error
- Must be exactly 12 characters
- Only letters and numbers
- No spaces

### Upload Failing
- Check Firebase Storage rules
- Verify file size < 5MB

## 📞 Need Help?

1. Check `PAYMENT_FLOW_SETUP.md` for detailed documentation
2. Review browser console for errors
3. Check Firebase Console for storage/database issues

## ✨ You're All Set!

The system is ready to accept manual UPI payments. Just update your UPI details in `.env` and start testing!
