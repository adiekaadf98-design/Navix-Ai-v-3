const fs = require('fs');
let code = fs.readFileSync('src/components/ThinkingIndicator.tsx', 'utf8');

code = code.replace(/const newPath = \['Request'\];[\s\S]*?if \(newProgress > 70\) newPath\.push\('Verification'\);/, `const newPath = ['User Request'];
        if (newProgress > 5) newPath.push('Intent Analysis');
        if (newProgress > 15) newPath.push('Search Query');
        if (newProgress > 25) newPath.push('Website Discovery');
        if (newProgress > 35) newPath.push('Open Website');
        if (newProgress > 45) newPath.push('Read Documentation');
        if (newProgress > 60) newPath.push('App/APK Public Analysis');
        if (newProgress > 75) newPath.push('Source Verification');
        if (newProgress > 85) newPath.push('Evidence Collection');`);

code = code.replace(/path: \['Request', 'Search', 'Web', 'App Analysis', 'Verification', 'Answer'\]/, `path: ['User Request', 'Intent Analysis', 'Search Query', 'Website Discovery', 'Open Website', 'Read Documentation', 'App/APK Public Analysis', 'Source Verification', 'Evidence Collection', 'Final Answer']`);

code = code.replace(/path: \['Request'\]/, `path: ['User Request']`);

fs.writeFileSync('src/components/ThinkingIndicator.tsx', code);
console.log("Updated ThinkingIndicator.tsx path");
