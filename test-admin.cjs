const admin = require('firebase-admin');
const fs = require('fs');

try {
  const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  admin.initializeApp({
    projectId: cfg.projectId,
  });
  console.log("Firebase admin initialized");
} catch(e) {
  console.error("Error:", e);
}
