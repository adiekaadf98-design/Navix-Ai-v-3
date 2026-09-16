const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

if (code.includes("../../hooks/useAuth")) {
  code = code.replace("../../hooks/useAuth", "../../store/useAuthStore");
  code = code.replace("const { user } = useAuth();", "const { user } = useAuthStore();");
}

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', code);
console.log("Fixed AdminDashboard import");
