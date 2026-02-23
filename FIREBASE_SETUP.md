# Firebase Setup Instructions

## Firestore Security Rules Setup

To enable database access, you need to set up Firestore security rules in your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Vibexathon-26**
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the following:

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

5. Click **Publish** to save the rules

## Testing the Connection

After setting up the rules:

1. Refresh your application at http://localhost:3001
2. You should see:
   - Green "Firebase Connected" status in top-right corner
   - Connection test results in bottom-left corner
   - No error messages

## Data Structure

The application uses the following Firestore collections:

- **teams** - Team registration data
- **submissions** - Project submissions
- **config** - System settings
- **tests** - Connection testing (temporary)

## Troubleshooting

If you see connection errors:

1. Verify your Firebase configuration in `src/firebase.ts`
2. Check that Firestore rules are published
3. Ensure your Firebase project has Firestore enabled
4. Check browser console for detailed error messages
