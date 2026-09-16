const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

try {
  const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  const app = initializeApp({
    projectId: cfg.projectId,
  });
  
  const db = getFirestore(app, cfg.firestoreDatabaseId);
  
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
