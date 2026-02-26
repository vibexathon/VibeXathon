# Payment State Persistence - LocalStorage

## ✅ Feature Added

The payment page now saves its state to localStorage, so users can close the page, refresh, or come back later and continue from where they left off!

## What Gets Saved

### Automatically Saved to LocalStorage:

1. **Form Data**
   - Team name
   - Leader details
   - Email
   - Password
   - Team size
   - IEEE member status
   - IEEE number

2. **Team Members**
   - All member names and emails

3. **Payment Order** ⭐ NEW!
   - Order ID
   - Amount
   - QR code data URL
   - Status
   - Created timestamp

4. **OTP Verification**
   - Generated OTP
   - OTP sent status
   - OTP verified status

5. **Current Step**
   - Form / Payment / Verification

6. **UTR Number** ⭐ NEW!
   - Entered UTR (if any)

7. **Receipt** ⭐ NEW!
   - Generated receipt data

## User Experience

### Scenario 1: User Closes Page During Payment

```
1. User fills form
2. Verifies email
3. Proceeds to payment
4. Sees QR code
5. Accidentally closes browser ❌
6. Opens website again
7. ✅ Automatically returns to payment page
8. ✅ Same QR code displayed
9. ✅ Same order ID
10. Can continue payment
```

### Scenario 2: User Refreshes Page

```
1. User on payment page
2. Refreshes browser (F5)
3. ✅ Payment page loads instantly
4. ✅ Same QR code
5. ✅ Same order details
6. No need to fill form again
```

### Scenario 3: User Pays and Comes Back Later

```
1. User scans QR and pays
2. Closes page before entering UTR
3. Comes back hours later
4. ✅ Payment page still there
5. ✅ Same order ID
6. Enters UTR and screenshot
7. Completes registration
```

### Scenario 4: User Switches Devices

```
⚠️ LocalStorage is per-device/browser
- Data saved on Phone A
- Won't be available on Phone B
- User needs to complete on same device
```

## Visual Indicator

On the payment page, users see:

```
✅ Payment details saved - Safe to close page
```

This green badge appears below the page title, reassuring users that their progress is saved.

## Technical Details

### Storage Key:
```javascript
const REGISTRATION_DRAFT_KEY = 'VBX_REGISTRATION_DRAFT';
```

### Saved Data Structure:
```javascript
{
  formData: {
    teamName: "...",
    leaderName: "...",
    email: "...",
    // ... etc
  },
  members: [...],
  step: "payment",
  paymentOrder: {
    orderId: "ORD1234567890123",
    amount: 500,
    qrCodeDataUrl: "data:image/png;base64,...",
    status: "pending",
    createdAt: 1234567890
  },
  utrNumber: "",
  receipt: null,
  generatedOtp: "123456",
  isOtpSent: true,
  isOtpVerified: true
}
```

### Auto-Save Trigger:
```javascript
useEffect(() => {
  // Saves whenever any of these change:
  // formData, members, step, paymentOrder, 
  // utrNumber, receipt, generatedOtp, 
  // isOtpSent, isOtpVerified
  
  localStorage.setItem(KEY, JSON.stringify(data));
}, [dependencies]);
```

## Benefits

### For Users:
- ✅ **No data loss** - Can close page anytime
- ✅ **Resume anytime** - Come back later
- ✅ **No re-entry** - Don't fill form again
- ✅ **Same QR code** - Order ID persists
- ✅ **Peace of mind** - Visual confirmation

### For Admins:
- ✅ **Fewer support requests** - Users don't lose progress
- ✅ **Better UX** - Smooth registration flow
- ✅ **Higher completion rate** - Users can take their time

## Data Lifecycle

### When Data is Saved:
- ✅ After filling form
- ✅ After OTP verification
- ✅ After generating QR code
- ✅ After entering UTR
- ✅ On every state change

### When Data is Cleared:
- ✅ After successful registration
- ✅ When user clicks "Clear Draft"
- ✅ When user manually clears browser data
- ❌ NOT cleared on page refresh
- ❌ NOT cleared on browser close

### Manual Clear:
Users can click "Clear Draft" button on the form page to start fresh.

## Security Considerations

### What's Safe:
- ✅ Form data (names, emails)
- ✅ Payment order (public info)
- ✅ QR code (public UPI link)
- ✅ Order ID (public reference)

### What's NOT Saved:
- ❌ File objects (IEEE proof, screenshot)
- ❌ Sensitive payment details
- ❌ Bank account info
- ❌ Card details

### Privacy:
- Data stored locally on user's device
- Not sent to any server
- Only accessible on same browser
- Cleared after registration

## Testing

### Test Persistence:

1. **Fill Form Test:**
   ```
   1. Fill registration form
   2. Close browser
   3. Open again
   4. ✅ Form data should be filled
   ```

2. **Payment Page Test:**
   ```
   1. Proceed to payment
   2. See QR code
   3. Refresh page (F5)
   4. ✅ Same QR code appears
   5. ✅ Same order ID
   ```

3. **UTR Entry Test:**
   ```
   1. Enter UTR number
   2. Close page
   3. Open again
   4. ✅ UTR still entered
   ```

4. **Clear Draft Test:**
   ```
   1. Fill form
   2. Click "Clear Draft"
   3. Confirm
   4. ✅ All data cleared
   5. ✅ Fresh form
   ```

## Browser Compatibility

### Supported:
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ All modern browsers

### Storage Limits:
- LocalStorage: ~5-10MB per domain
- Our data: ~50-100KB per registration
- Can store 50-100 registrations easily

## Troubleshooting

### Data Not Persisting:
1. Check if browser allows localStorage
2. Check if in private/incognito mode
3. Check browser storage settings
4. Try different browser

### Data Lost:
1. User cleared browser data
2. User used different browser
3. User used different device
4. Private/incognito mode

### Can't Clear Data:
1. Click "Clear Draft" button
2. Or manually clear browser data
3. Or use different browser

## Summary

The payment page now automatically saves all progress to localStorage, allowing users to:
- Close the page anytime
- Refresh without losing data
- Come back later to continue
- See the same QR code and order ID
- Complete registration at their own pace

Users see a green "Payment details saved" badge for peace of mind! ✅
