const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  const app = express();
  import { authenticateJWT } from './src/backend/middleware/auth';
import { taskEngine } from './src/backend/engines/TaskEngine';
import { knowledgeEngine } from './src/backend/engines/KnowledgeEngine';
import jwt from 'jsonwebtoken';

const PORT = 3000;`;

const replaceStr = `  const app = express();
  const PORT = 3000;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  console.log("Removed nested imports.");
}

const topImports = `import { authenticateJWT } from './src/backend/middleware/auth';
import { taskEngine } from './src/backend/engines/TaskEngine';
import { knowledgeEngine } from './src/backend/engines/KnowledgeEngine';
import jwt from 'jsonwebtoken';
`;

code = topImports + code;
fs.writeFileSync('server.ts', code);
console.log("Moved imports to top.");

