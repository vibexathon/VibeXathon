# Firebase Authentication Setup

## Required Firebase Configuration

Your Firebase project (Vibexathon-26) needs the following services enabled:

### 1. Firestore Database

- Go to **Firestore Database** in Firebase Console
- Create database in **Test Mode** (allows read/write access)
- Set up security rules as shown below

### 2. Authentication

- Go to **Authentication** → **Sign-in method**
- Enable **Email/Password** provider
- Save changes

## Firestore Security Rules

In Firebase Console → Firestore Database → Rules, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Testing Authentication

**Pre-configured Test Accounts:**

- Admin: admin@Vibexathon.com / admin123
- Judge: judge@Vibexathon.com / judge123

**New User Registration:**

- Use the registration form to create participant accounts
- All data is stored in Firebase Firestore and Authentication

## Data Structure

The application now uses these Firebase collections:

- **users** - User authentication profiles
- **teams** - Team registration data
- **submissions** - Project submissions
- **config** - System settings
- **tests** - Connection testing

## Verification

When properly configured, you should see:

- Green "Firebase Connected" indicator
- Successful login with test credentials
- Real-time data synchronization
- No authentication errors

## Troubleshooting

If login fails:

1. Check Firebase Authentication has Email/Password enabled
2. Verify Firestore rules are published
3. Ensure correct API keys in `src/firebase.ts`
4. Check browser console for specific error messages
