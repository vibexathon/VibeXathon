# QR Code Generation Troubleshooting Guide

## Issue: QR Code Not Generating

### Quick Fixes

#### 1. Test QR Code Generation
Navigate to: `http://localhost:5173/test-qr`

This test page will:
- Show your UPI configuration
- Generate a test QR code
- Display detailed error messages
- Show the QR code URL

#### 2. Check Environment Variables
Verify `.env` file has:
```env
VITE_UPI_ID=7892408670@ibl
VITE_UPI_NAME=Vibexathon
```

**Important**: After changing `.env`, restart the dev server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### 3. Check Browser Console
Open browser DevTools (F12) and check Console tab for errors:
- Look for "QR code generation failed"
- Check for network errors
- Look for CORS errors

### Common Issues & Solutions

#### Issue 1: QR Code Shows Loading Forever
**Cause**: API request failed or CORS issue

**Solution**:
1. Check internet connection
2. Try the test page: `/test-qr`
3. Check browser console for errors
4. The system now has 2 fallback APIs:
   - Primary: QR Server API
   - Fallback: Google Charts API

#### Issue 2: QR Code Shows Error Image
**Cause**: Image failed to load

**Solution**:
1. Check if the QR code URL is valid (visible in test page)
2. Try refreshing the page
3. Check if the URL starts with `data:image` or `https://`
4. If it's a URL, try opening it directly in a new tab

#### Issue 3: Environment Variables Not Loading
**Cause**: Vite didn't pick up `.env` changes

**Solution**:
1. Stop dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)
4. Check test page to verify variables loaded

#### Issue 4: "Invalid amount" Error
**Cause**: Amount is not ₹400 or ₹500

**Solution**:
- Only ₹400 (IEEE) and ₹500 (General) are allowed
- Check the `calculateAmount()` function

### Manual Payment Option

If QR code fails, users can still pay manually using the UPI details shown on the payment page:
- UPI ID: `7892408670@ibl`
- Name: `Vibexathon`
- Amount: ₹400 or ₹500
- Note: Order ID (e.g., ORD1234567890123)

Users should:
1. Open any UPI app
2. Enter the UPI ID manually
3. Enter the amount
4. Add Order ID in the note/remark field
5. Complete payment
6. Enter UTR and upload screenshot

### Testing Steps

1. **Test QR Generation**:
   ```
   Navigate to: http://localhost:5173/test-qr
   ```

2. **Check Console Logs**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for:
     - "Creating payment order for amount: 500"
     - "Payment order created: {orderId: ...}"
     - "QR code generation failed" (if error)

3. **Verify UPI Link**:
   The UPI link should look like:
   ```
   upi://pay?pa=7892408670@ibl&pn=Vibexathon&am=500&cu=INR&tn=ORD1234567890123
   ```

4. **Test QR Code APIs**:
   Try these URLs directly in browser:
   
   QR Server API:
   ```
   https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=7892408670@ibl&pn=Vibexathon&am=500&cu=INR&tn=TEST123
   ```
   
   Google Charts API:
   ```
   https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=upi://pay?pa=7892408670@ibl&pn=Vibexathon&am=500&cu=INR&tn=TEST123
   ```

### Code Changes Made

1. **Improved QR Generation** (`src/paymentService.ts`):
   - Added QR Server API as primary
   - Google Charts API as fallback
   - Better error handling
   - Console logging for debugging

2. **Enhanced UI** (`src/pages/Register.tsx`):
   - Loading state for QR code
   - Error handling with fallback message
   - Manual payment details displayed
   - Better error messages

3. **Test Page** (`src/pages/TestQR.tsx`):
   - Dedicated QR testing page
   - Shows environment variables
   - Displays order details
   - Shows QR code URL length
   - Regenerate button

### Still Not Working?

If QR code still doesn't generate:

1. **Check Network Tab**:
   - Open DevTools → Network tab
   - Look for requests to `qrserver.com` or `googleapis.com`
   - Check if they return 200 OK

2. **Try Different Browser**:
   - Some browsers block third-party APIs
   - Try Chrome, Firefox, or Edge

3. **Check Firewall/Antivirus**:
   - May be blocking API requests
   - Temporarily disable and test

4. **Use Manual Payment**:
   - Users can always pay manually
   - Just need to enter UPI details in their app
   - System will work with UTR verification

### Contact Support

If issue persists:
1. Check browser console and copy error messages
2. Try the test page and screenshot results
3. Verify `.env` configuration
4. Check if APIs are accessible from your network
