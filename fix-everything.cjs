const fs = require('fs');

// 1. Fix server.ts to accept plan from frontend
let serverCode = fs.readFileSync('server.ts', 'utf8');

// For /api/auth/oauth-login
serverCode = serverCode.replace(
  "const { provider = 'google', email, name, avatar } = req.body;",
  "const { provider = 'google', email, name, avatar, plan } = req.body;"
);
serverCode = serverCode.replace(
  "plan: isDev ? 'developer' : 'free',",
  "plan: isDev ? 'developer' : (plan || 'free'),"
);

// For /api/auth/login
serverCode = serverCode.replace(
  "const { email, password } = req.body;",
  "const { email, password, plan } = req.body;"
);

fs.writeFileSync('server.ts', serverCode);
console.log("Patched server.ts");


// 2. Fix App.tsx to handle 429 by opening Payment Modal
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Find the 429 handler in App.tsx
if (appCode.includes("if (data.isRateLimit || data.error === '429') {")) {
  appCode = appCode.replace(
    "if (data.isRateLimit || data.error === '429') {\n        throw new Error('429');\n      }",
    "if (data.isRateLimit || data.error === '429') {\n        setIsPaymentOpen(true);\n        throw new Error('429');\n      }"
  );
}

fs.writeFileSync('src/App.tsx', appCode);
console.log("Patched App.tsx");


// 3. Fix auth.ts to read from Firestore before sending to server
let authCode = fs.readFileSync('src/services/auth.ts', 'utf8');

// Update loginOAuthDirect signature
authCode = authCode.replace(
  "loginOAuthDirect: async (provider: 'google' | 'github' | 'apple', email: string, name?: string, avatar?: string): Promise<AuthResponse> => {",
  "loginOAuthDirect: async (provider: 'google' | 'github' | 'apple', email: string, name?: string, avatar?: string, plan?: string): Promise<AuthResponse> => {"
);
authCode = authCode.replace(
  "body: JSON.stringify({ provider, email, name, avatar })",
  "body: JSON.stringify({ provider, email, name, avatar, plan })"
);

// We need getDoc from firestore
if (!authCode.includes('getDoc')) {
  authCode = authCode.replace("import { doc, setDoc }", "import { doc, setDoc, getDoc }");
  if (!authCode.includes('getDoc')) {
     authCode = authCode.replace("from 'firebase/firestore';", ", getDoc } from 'firebase/firestore';");
  }
}

// Update loginWithFirebaseGoogle
const googleMatch = `      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user && result.user.email) {
        const serverAuthRes = await AuthService.loginOAuthDirect(
          'google',
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined
        );`;

const googleReplacement = `      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user && result.user.email) {
        let existingPlan = 'free';
        try {
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().plan) {
            existingPlan = userSnap.data().plan;
          }
        } catch(e) {}
        
        const serverAuthRes = await AuthService.loginOAuthDirect(
          'google',
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          existingPlan
        );`;

if (authCode.includes(googleMatch)) {
  authCode = authCode.replace(googleMatch, googleReplacement);
} else {
  // Try alternative regex replacement if spacing differs
  authCode = authCode.replace(
    /const serverAuthRes = await AuthService\.loginOAuthDirect\(\s*'google',\s*result\.user\.email,\s*result\.user\.displayName \|\| undefined,\s*result\.user\.photoURL \|\| undefined\s*\);/,
    `let existingPlan = 'free';
        try {
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().plan) {
            existingPlan = userSnap.data().plan;
          }
        } catch(e) {}
        
        const serverAuthRes = await AuthService.loginOAuthDirect(
          'google',
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          existingPlan
        );`
  );
}

// Update loginOAuth (github/apple)
const oauthMatch = `      const result = await signInWithPopup(auth, authProvider);
      if (result.user && result.user.email) {
        const serverAuthRes = await AuthService.loginOAuthDirect(
          provider,
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined
        );`;

const oauthReplacement = `      const result = await signInWithPopup(auth, authProvider);
      if (result.user && result.user.email) {
        let existingPlan = 'free';
        try {
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().plan) {
            existingPlan = userSnap.data().plan;
          }
        } catch(e) {}

        const serverAuthRes = await AuthService.loginOAuthDirect(
          provider,
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          existingPlan
        );`;

if (authCode.includes(oauthMatch)) {
  authCode = authCode.replace(oauthMatch, oauthReplacement);
} else {
  authCode = authCode.replace(
    /const serverAuthRes = await AuthService\.loginOAuthDirect\(\s*provider,\s*result\.user\.email,\s*result\.user\.displayName \|\| undefined,\s*result\.user\.photoURL \|\| undefined\s*\);/,
    `let existingPlan = 'free';
        try {
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().plan) {
            existingPlan = userSnap.data().plan;
          }
        } catch(e) {}

        const serverAuthRes = await AuthService.loginOAuthDirect(
          provider,
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          existingPlan
        );`
  );
}

fs.writeFileSync('src/services/auth.ts', authCode);
console.log("Patched auth.ts");

