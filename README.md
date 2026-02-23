# Vibexathon 1.0 - Hackathon Management Platform

A comprehensive hackathon management platform built with React, TypeScript, Firebase, and Razorpay for handling team registrations, payments, submissions, and judging.

## 🚀 Features

- **User Authentication**: Firebase Authentication with role-based access (Participant, Judge, Admin)
- **Payment Integration**: Razorpay payment gateway with two pricing tiers (IEEE/General)
- **Team Management**: Register teams with 2-4 members
- **Project Submissions**: Upload projects with GitHub, demo, and video links
- **Judging System**: Multi-criteria scoring system for judges
- **Admin Dashboard**: Verify payments, approve teams, manage submissions
- **Real-time Updates**: Firestore database for live data synchronization
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 📋 Tech Stack

- **Frontend**: React 19.2.4 + TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 7.13.0
- **Icons**: Lucide React 0.575.0
- **Backend**: Firebase (Authentication + Firestore)
- **Payments**: Razorpay
- **AI Integration**: Google Gemini API

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Razorpay account (for payment integration)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibexthon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your actual credentials:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Razorpay Configuration
   VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY

   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at `http://localhost:3000`

## 🔧 Configuration Guides

### Firebase Setup
See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed Firebase configuration instructions.

### Firebase Authentication Setup
See [FIREBASE_AUTH_SETUP.md](FIREBASE_AUTH_SETUP.md) for setting up authentication.

### Razorpay Payment Integration
See [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md) for complete Razorpay setup and testing guide.

## 📁 Project Structure

```
vibexthon/
├── public/
│   └── assets/           # Static assets (poster, images)
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Logo.tsx
│   │   ├── Navbar.tsx
│   │   ├── CountdownTimer.tsx
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ParticipantDashboard.tsx
│   │   ├── JudgeDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── App.tsx          # Main app component with routing
│   ├── store.ts         # Global state management
│   ├── types.ts         # TypeScript type definitions
│   ├── constants.tsx    # App constants and configuration
│   ├── firebase.ts      # Firebase initialization
│   ├── geminiService.ts # Gemini AI integration
│   └── index.css        # Global styles
├── .env                 # Environment variables (not in repo)
├── .env.example         # Example environment file
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🎯 User Roles

### Participant
- Register team with payment
- Submit projects
- View submission status
- Track scores

### Judge
- View assigned submissions
- Score projects based on criteria
- Provide feedback
- Submit final scores

### Admin
- Verify payments
- Approve/reject teams
- Manage submissions
- View all teams and scores
- Control system settings

## 💳 Payment Flow

1. User fills registration form
2. Selects pricing tier (IEEE ₹400 / General ₹500)
3. Razorpay checkout opens
4. Payment is processed
5. Payment ID is captured
6. User uploads payment screenshot
7. Admin verifies and approves
8. Team gets access to dashboard

## 🧪 Testing

### Test Payment Details (Razorpay Test Mode)

**Credit/Debit Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `1234`

**UPI:**
- UPI ID: `success@razorpay`

**Net Banking:**
- Select any bank
- Username: `test`
- Password: `test`

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The build files will be in the `dist/` directory.

### Deploy to Hosting

You can deploy to various platforms:

**Firebase Hosting:**
```bash
firebase deploy
```

**Vercel:**
```bash
vercel deploy
```

**Netlify:**
```bash
netlify deploy
```

## 🔒 Security

- Environment variables for sensitive data
- Firebase security rules for database access
- Role-based access control
- Payment verification workflow
- Admin approval system

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🎨 Customization

### Changing Brand Colors

Update `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ... other colors
    }
  }
}
```

### Updating Payment Amounts

Edit `src/pages/Register.tsx`:
```typescript
const calculateAmount = () => formData.isIeeeMember ? 400 : 500;
```

### Modifying Judging Criteria

Edit `src/constants.tsx`:
```typescript
export const JUDGING_CRITERIA = [
  { criteria: "Problem Understanding", score: 15 },
  // ... add or modify criteria
];
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Development server won't start**
- Solution: Delete `node_modules` and run `npm install` again

**Issue: Firebase connection error**
- Solution: Check your Firebase configuration in `.env`
- Ensure Firebase is initialized correctly

**Issue: Razorpay not loading**
- Solution: Check internet connection
- Verify Razorpay key in `.env`
- Check browser console for errors

**Issue: Payment succeeds but registration fails**
- Solution: Check Firebase Firestore rules
- Verify user authentication
- Check browser console for errors

## 📞 Support

For issues or questions:
- Check the documentation files in the repository
- Review browser console for error messages
- Check Firebase console for Firestore errors
- Refer to [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md) for payment issues

## 📄 License

This project is private and proprietary to Vibexathon 1.0.

## 👥 Credits

**Designed By**: [Samrak Production](https://samrakproduction.com)

**Built With**:
- React
- TypeScript
- Firebase
- Razorpay
- Tailwind CSS
- Vite

---

**Version**: 1.0  
**Last Updated**: February 21, 2026
