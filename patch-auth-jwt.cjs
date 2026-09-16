const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const jwtOriginal = `      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: isDev ? '30d' : '7d' }
      );`;

const jwtNew = `      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, plan: user.plan },
        JWT_SECRET,
        { expiresIn: isDev ? '30d' : '7d' }
      );`;

content = content.replace(jwtOriginal, jwtNew);
fs.writeFileSync('server.ts', content);
console.log("Patched auth JWT token");
