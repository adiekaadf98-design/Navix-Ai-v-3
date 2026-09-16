const fs = require('fs');
let code = fs.readFileSync('src/components/ChatArea.tsx', 'utf8');

// Fix scroll handling
code = code.replace(/const handleScroll = \(\) => \{[\s\S]*?    \} else \{\n      setShowScrollToBottom\(false\);\n      isUserScrollingRef.current = false;\n    \}\n  \};/, `const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom > 300) {
      setShowScrollToBottom(true);
      isUserScrollingRef.current = true;
    } else {
      setShowScrollToBottom(false);
      // Only release scroll lock if we are REALLY at the bottom
      if (distanceFromBottom < 10) {
        isUserScrollingRef.current = false;
      }
    }
  };`);

// Increase pointer-events surface for buttons
code = code.replace(`className="flex items-center gap-1 mt-1 px-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity relative z-10 pointer-events-auto"`, `className="flex items-center gap-2 mt-2 px-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity relative z-[100] pointer-events-auto"`);

fs.writeFileSync('src/components/ChatArea.tsx', code);
console.log("Updated ChatArea.tsx");
