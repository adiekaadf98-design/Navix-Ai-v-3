const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('ForgotPassword')) {
  code = code.replace(
    "import { Login } from './components/auth/Login';",
    "import { Login } from './components/auth/Login';\nimport { ForgotPassword } from './components/auth/ForgotPassword';"
  );
  code = code.replace(
    "<Route path=\"/login\" element={<Login />} />",
    "<Route path=\"/login\" element={<Login />} />\n        <Route path=\"/forgot-password\" element={<ForgotPassword />} />"
  );
  fs.writeFileSync('src/App.tsx', code);
}
