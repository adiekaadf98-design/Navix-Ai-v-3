const fs = require('fs');
let content = fs.readFileSync('src/backend/middleware/quota.ts', 'utf8');

// Update Identity interface
if (!content.includes('plan?: string;')) {
  content = content.replace(
    'isDeveloper: boolean;\n  kind: \'user\' | \'ip\';',
    'isDeveloper: boolean;\n  plan?: string;\n  kind: \'user\' | \'ip\';'
  );
}

// Update resolveIdentity to extract plan from JWT
content = content.replace(
  'return { key: `user:${email.toLowerCase()}`, email, isDeveloper: isDeveloperEmail(email), kind: \'user\' };',
  'return { key: `user:${email.toLowerCase()}`, email, isDeveloper: isDeveloperEmail(email), plan: decoded?.plan || \'free\', kind: \'user\' };'
);
content = content.replace(
  'return { key: `user:${decoded.id}`, isDeveloper: false, kind: \'user\' };',
  'return { key: `user:${decoded.id}`, isDeveloper: false, plan: decoded?.plan || \'free\', kind: \'user\' };'
);
content = content.replace(
  'return { key: `ip:${ip}`, isDeveloper: false, kind: \'ip\' };',
  'return { key: `ip:${ip}`, isDeveloper: false, plan: \'free\', kind: \'ip\' };'
);

// Update checkAndConsumeQuota to respect plan limits
const limitLogic = `
  let userLimit = DAILY_FREE_CHAT_LIMIT;
  if (identity.plan === 'pro') {
    userLimit = 500; // Example pro limit
  } else if (identity.plan === 'developer' || identity.isDeveloper) {
    userLimit = 999999;
  }
`;

if (!content.includes('let userLimit = DAILY_FREE_CHAT_LIMIT;')) {
  content = content.replace(
    'const today = getTodayString();\n  const usedSoFar = await getUsedCount(identity.key, today, feature);',
    limitLogic + '\n  const today = getTodayString();\n  const usedSoFar = await getUsedCount(identity.key, today, feature);'
  );
  
  // Replace DAILY_FREE_CHAT_LIMIT with userLimit in the rest of checkAndConsumeQuota
  content = content.replace(/usedSoFar >= DAILY_FREE_CHAT_LIMIT/g, 'usedSoFar >= userLimit');
  content = content.replace(/limit: DAILY_FREE_CHAT_LIMIT/g, 'limit: userLimit');
  content = content.replace(/remaining: Math.max\(0, DAILY_FREE_CHAT_LIMIT/g, 'remaining: Math.max(0, userLimit');
}

fs.writeFileSync('src/backend/middleware/quota.ts', content);
console.log("Patched quota middleware");
