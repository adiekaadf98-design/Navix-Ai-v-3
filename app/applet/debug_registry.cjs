const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/services/EngineRegistry.ts');
const content = fs.readFileSync(filePath, 'utf8');

console.log("File length:", content.length);
const startIndex = content.indexOf("export function renderMarkdownFromSchema(");
console.log("startIndex of renderMarkdownFromSchema:", startIndex);

const firstExecIndex = content.indexOf("export async function executeInstitutionalMarketAnalysis(");
console.log("firstExecIndex:", firstExecIndex);

const secondExecIndex = content.indexOf("export async function executeInstitutionalMarketAnalysis(", firstExecIndex + 1);
console.log("secondExecIndex:", secondExecIndex);
