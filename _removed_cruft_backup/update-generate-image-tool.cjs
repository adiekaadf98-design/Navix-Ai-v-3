const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `              prompt: { type: "STRING", description: "Deskripsi detail gambar baru. Untuk logo/banner tambahkan kata kunci 'desain logo', 'banner', 'spanduk', dll." },
              operation: { type: "STRING", description: "Jenis operasi: 'create' (buat baru) atau 'edit' (edit gambar)", enum: ["create", "edit"] },
              imageUrl: { type: "STRING", description: "URL gambar asli jika mengedit/referensi gambar yang sudah ada (diambil dari lampiran sebelumnya)." }`;

const replacementStr = `              prompt: { type: "STRING", description: "Deskripsi detail gambar baru. Sertakan format Rasio Aspek (misal '1:1', '16:9') jika user memintanya. Untuk logo/banner tambahkan kata kunci yang sesuai." },
              aspectRatio: { type: "STRING", description: "Rasio Aspek yang diminta user. Default 1:1 jika tidak diminta. Contoh: 1:1, 16:9, 9:16, 4:3, 3:4", enum: ["1:1", "16:9", "9:16", "4:3", "3:4"] },
              operation: { type: "STRING", description: "Jenis operasi: 'create' (buat baru) atau 'edit' (edit gambar)", enum: ["create", "edit"] },
              imageUrl: { type: "STRING", description: "URL gambar asli jika mengedit/referensi gambar yang sudah ada (diambil dari lampiran sebelumnya)." }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated server.ts generate_image tool successfully");
} else {
  console.log("Target string not found in server.ts (generate_image tool).");
}
