const fs = require('fs');

// 1. Fix AdminDashboard.tsx
let adminCode = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');
adminCode = adminCode.replace("import { useAuth } from '../../store/useAuthStore';", "import { useAuthStore } from '../../store/useAuthStore';");
fs.writeFileSync('src/components/admin/AdminDashboard.tsx', adminCode);


// 2. Fix quota.ts
let quotaCode = fs.readFileSync('src/backend/middleware/quota.ts', 'utf8');

// We'll replace the limit logic and ensure userLimit is available early
const newLimitLogic = `
function getUserLimit(identity) {
  if (identity.isDeveloper || identity.plan === 'developer') return 999999;
  if (identity.plan === 'pro') return 500;
  if (identity.plan === 'ultra') return 1000;
  return DAILY_FREE_CHAT_LIMIT;
}
`;

if (!quotaCode.includes('function getUserLimit')) {
  // Insert the helper function before checkAndConsumeQuota
  quotaCode = quotaCode.replace(
    'export async function checkAndConsumeQuota', 
    newLimitLogic + '\nexport async function checkAndConsumeQuota'
  );
  
  // Fix checkAndConsumeQuota
  const oldCheckConsume = `  const identity = resolveIdentity(req);
  if (identity.isDeveloper) {
    return { allowed: true, isDeveloper: true, used: 0, limit: userLimit, remaining: 999999, identityKind: identity.kind };
  }

  
  let userLimit = DAILY_FREE_CHAT_LIMIT;
  if (identity.plan === 'pro') {
    userLimit = 500; // Example pro limit
  } else if (identity.plan === 'developer' || identity.isDeveloper) {
    userLimit = 999999;
  }`;

  const newCheckConsume = `  const identity = resolveIdentity(req);
  const userLimit = getUserLimit(identity);

  if (identity.isDeveloper) {
    return { allowed: true, isDeveloper: true, used: 0, limit: userLimit, remaining: 999999, identityKind: identity.kind };
  }`;

  quotaCode = quotaCode.replace(oldCheckConsume, newCheckConsume);
  
  // Fix quotaStatusHandler
  quotaCode = quotaCode.replace(
    '  const identity = resolveIdentity(req);\n  if (identity.isDeveloper) {',
    '  const identity = resolveIdentity(req);\n  const userLimit = getUserLimit(identity);\n  if (identity.isDeveloper) {'
  );

  // In quotaStatusHandler, update the remaining logic which uses DAILY_FREE_CHAT_LIMIT directly
  quotaCode = quotaCode.replace('Math.max(0, DAILY_FREE_CHAT_LIMIT - used);', 'Math.max(0, userLimit - used);');
  quotaCode = quotaCode.replace('remaining > 0\n      ? `Free Tier: ${remaining}/${DAILY_FREE_CHAT_LIMIT} chat gratis hari ini`\n      : `Kuota Gratis Harian (${DAILY_FREE_CHAT_LIMIT}/${DAILY_FREE_CHAT_LIMIT}) telah habis`', 'remaining > 0\n      ? `Tersedia: ${remaining}/${userLimit} request hari ini`\n      : `Kuota (${userLimit}/${userLimit}) telah habis`');

  fs.writeFileSync('src/backend/middleware/quota.ts', quotaCode);
  console.log("Fixed quota.ts");
} else {
  console.log("quota.ts already fixed");
}
