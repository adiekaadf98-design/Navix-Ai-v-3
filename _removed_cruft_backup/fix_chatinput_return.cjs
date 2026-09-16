const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInput.tsx', 'utf8');

// Find the return statement and replace it entirely
const returnMatch = code.indexOf('  return (');
if (returnMatch !== -1) {
  const newReturn = `  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pt-20 shrink-0 z-20">
      <div className="max-w-3xl mx-auto pb-safe">
        {attachments.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {attachments.map((att, i) => (
              <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700">
                {att.type === 'image' && <img src={att.url} className="w-full h-full object-cover" />}
                {att.type === 'video' && <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-400"><Video size={24} /></div>}
                {att.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-red-500"><Mic size={24} /></div>}
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-neutral-900/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors backdrop-blur-sm"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isRefVideoPanelOpen && (
          <div className="mb-4 bg-neutral-900/80 backdrop-blur-md border border-indigo-500/30 p-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-indigo-400" />
                <span className="text-sm font-medium text-neutral-200">Video Referensi Gerakan (Image-to-Video)</span>
              </div>
              <button onClick={() => setIsRefVideoPanelOpen(false)} className="text-neutral-500 hover:text-neutral-300">
                <X size={16} />
              </button>
            </div>
            
            {!refVideo ? (
              <div 
                onClick={() => refVideoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-neutral-700 hover:border-indigo-500/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 bg-neutral-800 group-hover:bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
                  <ArrowUp size={20} className="text-neutral-400 group-hover:text-indigo-400" />
                </div>
                <p className="text-sm text-neutral-300 font-medium mb-1">Unggah Video Referensi</p>
                <p className="text-xs text-neutral-500 text-center max-w-[80%]">AI akan menganalisis gerakan dari video ini dan menerapkannya pada gambar yang Anda kirim.</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-neutral-800 p-3 rounded-lg border border-neutral-700">
                <div className="w-12 h-12 bg-neutral-900 rounded flex items-center justify-center shrink-0">
                  <Film size={20} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200 truncate">{refVideo.name || 'Video Referensi'}</p>
                  <p className="text-xs text-neutral-500">Siap diproses</p>
                </div>
                <button 
                  onClick={() => setRefVideo(null)}
                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-700/50 rounded-lg transition-colors"
                  title="Hapus referensi"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-2 px-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-1.5 text-neutral-600">
            <span className="hidden sm:inline">Shortcuts:</span>
            <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">Enter</kbd>
            <span className="lowercase text-neutral-700">or</span>
            <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">⌘↵</kbd>
            <span className="lowercase text-neutral-700">to send</span>
            <span className="text-neutral-800 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">Esc</kbd>
              <span className="lowercase text-neutral-700 ml-1">close sidebar</span>
            </span>
          </div>

          {input.length > 0 && (
            <div className="flex gap-3 text-[10px] tracking-[0.15em] animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                <span>{input.length} chars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500/30" />
                <span>~{Math.ceil(input.length / 4)} tokens</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative bg-[#1c1c1c] rounded-[24px] border border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-end p-2 focus-within:border-red-500/50 focus-within:ring-1 focus-within:ring-red-500/20 transition-all duration-300">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            multiple 
            accept="image/*,video/*,audio/*"
          />
          <input 
            type="file" 
            ref={refVideoInputRef} 
            onChange={handleRefVideoUpload} 
            className="hidden" 
            accept="video/*"
          />
          
          <div className="flex gap-1 mb-1 ml-1 shrink-0">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-full transition-colors"
              title="Attach Photo/Video"
            >
              <Paperclip size={20} />
            </button>
            <button 
              onClick={() => setIsRefVideoPanelOpen(!isRefVideoPanelOpen)}
              className={\`w-10 h-10 flex items-center justify-center rounded-full transition-colors \${isRefVideoPanelOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'}\`}
              title="Image-to-Video Reference"
            >
              <Film size={20} />
            </button>
            <button 
              onClick={toggleRecording}
              className={\`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 \${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'}\`}
              title="Voice Note"
            >
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording audio..." : "Ask Navix Ai..."}
            className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 placeholder:whitespace-nowrap resize-none outline-none py-3 px-3 max-h-[200px] overflow-y-auto text-base sm:text-sm md:text-base disabled:opacity-50"
            disabled={isRecording}
            rows={1}
          />
          
          <div className="shrink-0 pb-1 pr-1 pl-2">
            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0 && !refVideo) || isLoading}
              className="w-10 h-10 rounded-full bg-neutral-100 disabled:opacity-50 hover:bg-neutral-300 disabled:hover:bg-neutral-100 flex items-center justify-center text-neutral-900 transition-colors"
              aria-label="Send message"
            >
              {isLoading ? <StopCircle size={20} /> : <ArrowUp size={20} className="stroke-[2.5px]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

  code = code.substring(0, returnMatch) + newReturn;
  fs.writeFileSync('src/components/ChatInput.tsx', code);
  console.log("Fixed return statement of ChatInput.tsx");
}
