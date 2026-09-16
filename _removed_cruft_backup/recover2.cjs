const fs = require('fs');
try {
    const map = JSON.parse(fs.readFileSync('dist/server.cjs.map', 'utf8'));
    const sourceIndex = map.sources.indexOf('../server.ts');
    if (sourceIndex !== -1) {
        fs.writeFileSync('server.ts', map.sourcesContent[sourceIndex]);
        console.log('RECOVERED server.ts from sourcemap!');
    } else {
        console.log('server.ts not found in sourcemap sources:', map.sources);
    }
} catch (e) {
    console.log('Error parsing sourcemap:', e);
}
