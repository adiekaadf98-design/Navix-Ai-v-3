const fs = require('fs');
let code = fs.readFileSync('src/components/MediaCard.tsx', 'utf8');

const targetStr = `          const pollData = await pollRes.json();
          if (pollData.success && pollData.state === 'SUCCEEDED') {
            isDone = true;
          }`;

const replacementStr = `          const pollData = await pollRes.json();
          if (pollData.success && (pollData.state === 'SUCCEEDED' || pollData.done === true)) {
            isDone = true;
          }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/MediaCard.tsx', code);
  console.log("Updated MediaCard.tsx poll check successfully");
} else {
  console.log("Target string not found in MediaCard.tsx.");
}
