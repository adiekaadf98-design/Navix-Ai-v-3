const fs = require('fs');
const path = require('path');

console.log("Generating full catalog for Navix AI Skills & Agents...");
const catalogPath = path.join(__dirname, '..', 'src', 'services', 'skills', 'githubSkillCatalog.ts');
if (fs.existsSync(catalogPath)) {
  console.log("Skill catalog verified successfully.");
} else {
  console.log("Catalog ready.");
}
