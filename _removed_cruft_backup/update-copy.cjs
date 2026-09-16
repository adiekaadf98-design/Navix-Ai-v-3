const fs = require('fs');
let code = fs.readFileSync('src/components/ChatArea.tsx', 'utf8');

const copyHelper = `
const fallbackCopyTextToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback below
    }
  }
  return new Promise<boolean>((resolve) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      resolve(true);
    } catch (err) {
      resolve(false);
    } finally {
      document.body.removeChild(textArea);
    }
  });
};
`;

code = code.replace("export function ChatArea", copyHelper + "\nexport function ChatArea");

// Update handleCopy
code = code.replace(/const handleCopy = async \(id: string, text: string\) => \{[\s\S]*?  \};/, `const handleCopy = async (id: string, text: string) => {
    try {
      const success = await fallbackCopyTextToClipboard(text);
      if (success) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        showErrorBox("Gagal melakukan copy teks (perangkat tidak mendukung).");
      }
    } catch (err) {
      console.error("Gagal melakukan copy:", err);
      showErrorBox("Gagal melakukan copy teks.");
    }
  };`);

// Update handleShare
code = code.replace(/const handleShare = async \(text: string\) => \{[\s\S]*?      \} catch \(clipErr\) \{[\s\S]*?showErrorBox\("Gagal membagikan pesan."\);\n      \}\n    \}\n  \};/, `const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Navix AI',
          text: text
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.name === 'NotAllowedError' || String(err?.message).includes('cancel')) {
          return;
        }
        console.warn("Share notice:", err);
      }
    }
    
    // Fallback to copying to clipboard if Web Share API is not supported or failed
    try {
      const success = await fallbackCopyTextToClipboard(text);
      if (success) {
        showToast("Teks disalin ke clipboard untuk dibagikan!");
      } else {
        showErrorBox("Fitur share/copy tidak didukung.");
      }
    } catch (clipErr) {
      showErrorBox("Gagal membagikan pesan.");
    }
  };`);

// Also fix CodeBlock copy
code = code.replace(/const handleCopy = \(\) => \{\n    navigator.clipboard.writeText\(codeString\);\n    setCopied\(true\);\n    setTimeout\(\(\) => setCopied\(false\), 2000\);\n  \};/, `const handleCopy = async () => {
    await fallbackCopyTextToClipboard(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };`);


// Fix observer warning
code = code.replace(/\[messages\.length > 0\]\);/g, `[messages.length]);`);

fs.writeFileSync('src/components/ChatArea.tsx', code);
console.log("Updated ChatArea.tsx");
