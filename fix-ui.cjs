const fs = require('fs');
let content = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

const buggyText = `<div className="flex justify-between text-[11px] text-neutral-500">
                    <span>{usage.requests} Requests used</span>
                    
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-3">
                    <span>{usage.requests} Requests used</span>
                    <span>{usage.limit} Limit</span>
                  </div>`;
                  
const fixedText = `<div className="flex justify-between text-[11px] text-neutral-500 mb-3">
                    <span>{usage.requests} Requests used</span>
                    <span>{usage.limit} Limit</span>
                  </div>`;
                  
content = content.replace(buggyText, fixedText);
fs.writeFileSync('src/components/studios/PluginsStudio.tsx', content);
console.log("Fixed UI syntax error");
