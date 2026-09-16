const admin = require('firebase-admin');
const fs = require('fs');

try {
  const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  admin.initializeApp({
    projectId: cfg.projectId,
  });
  
  const db = admin.firestore();
  
  db.collection('test_admin').add({ test: 'hello' }).then((doc) => {
    console.log('Doc written:', doc.id);
    process.exit(0);
  }).catch(e => {
    console.error('Firestore write error:', e);
    process.exit(1);
  });
} catch(e) {
  console.error("Error:", e);
  process.exit(1);
}
