const fs = require('fs');
const content = fs.readFileSync('src/components/ChatArea.tsx', 'utf-8');

// We need to find the start of markdownComponents inside ChatArea
const startMarker = `  const markdownComponents: any = {`;
const startIdx = content.indexOf(startMarker);

// We need to find the end of MemoizedMessageContent
const endMarker = `    }, [text, role, msgId]);\n  });\n`;
const endIdx = content.indexOf(endMarker) + endMarker.length;

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find markers!");
  process.exit(1);
}

const extractedCode = content.substring(startIdx, endIdx);

// We want to move this outside. We'll place it right above `export function ChatArea`
const chatAreaMarker = `export function ChatArea({`;
const chatAreaIdx = content.indexOf(chatAreaMarker);

if (chatAreaIdx === -1) {
  console.error("Could not find ChatArea marker!");
  process.exit(1);
}

let newContent = content.substring(0, startIdx) + content.substring(endIdx);

// Modify extractedCode
// 1. Remove the indentation if we want, or just leave it.
// 2. Add messagesRef to the props of MemoizedMessageContent
let modifiedCode = extractedCode.replace(
  /const MemoizedMessageContent = memo\(\(\{ text, role, msgId \}: \{ text: string, role: string, msgId\?: string \}\) => \{/,
  `const MemoizedMessageContent = memo(({ text, role, msgId, messagesRef }: { text: string, role: string, msgId?: string, messagesRef: React.MutableRefObject<ChatMessage[]> }) => {`
);

// 3. Add `pre` to `markdownComponents`
modifiedCode = modifiedCode.replace(
  `    code: CodeBlock,`,
  `    code: CodeBlock,\n    pre: ({children}: any) => <>{children}</>,`
);

// 4. Remove `const messagesRef = useRef(messages);\n  useEffect(() => {\n    messagesRef.current = messages;\n  }, [messages]);\n\n` from extractedCode
modifiedCode = modifiedCode.replace(
  /  const messagesRef = useRef\(messages\);\n  useEffect\(\(\) => \{\n    messagesRef\.current = messages;\n  \}, \[messages\]\);\n\n/,
  ''
);

// We need to put the `messagesRef` definition BACK into ChatArea!
const messagesRefCode = `\n  const messagesRef = useRef(messages);\n  useEffect(() => {\n    messagesRef.current = messages;\n  }, [messages]);\n`;

const chatAreaBodyIdx = newContent.indexOf('{', chatAreaIdx) + 1;
newContent = newContent.substring(0, chatAreaBodyIdx) + messagesRefCode + newContent.substring(chatAreaBodyIdx);

// 5. Update the usages of `<MemoizedMessageContent ... />` in newContent to pass messagesRef={messagesRef}
newContent = newContent.replace(
  /<MemoizedMessageContent text=\{msg\.text\} role=\{msg\.role\} msgId=\{msg\.id\} \/>/g,
  `<MemoizedMessageContent text={msg.text} role={msg.role} msgId={msg.id} messagesRef={messagesRef} />`
);
newContent = newContent.replace(
  /<MemoizedMessageContent text=\{msg\.text\} role=\{msg\.role\} \/>/g,
  `<MemoizedMessageContent text={msg.text} role={msg.role} messagesRef={messagesRef} />`
);

// Now put modifiedCode BEFORE `export function ChatArea`
const finalContent = newContent.substring(0, chatAreaIdx) + modifiedCode + '\n' + newContent.substring(chatAreaIdx);

fs.writeFileSync('src/components/ChatArea.tsx', finalContent);
console.log("Rewrite successful!");
