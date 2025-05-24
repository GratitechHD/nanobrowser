import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import React from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, files?: File[]) => void;
  onStopTask: () => void;
  disabled: boolean;
  showStopButton: boolean;
  setContent?: (setter: (text: string) => void) => void;
  isDarkMode?: boolean;
}

export default function ChatInput({
  onSendMessage,
  onStopTask,
  disabled,
  showStopButton,
  setContent,
  isDarkMode = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const isSendButtonDisabled = useMemo(() => disabled || text.trim() === '', [disabled, text]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text changes and resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  };

  // Expose a method to set content from outside
  useEffect(() => {
    if (setContent) {
      setContent(setText);
    }
  }, [setContent]);

  // Initial resize when component mounts
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  }, []);

  // Handle file selection
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList);
    // Optionally filter by type/size here
    setFiles(prev => [...prev, ...arr]);
  };

  // Remove file
  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // File picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (text.trim() || files.length > 0) {
        onSendMessage(text, files);
        setText('');
        setFiles([]);
      }
    },
    [text, files, onSendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`overflow-hidden rounded-lg border transition-colors ${disabled ? 'cursor-not-allowed' : 'focus-within:border-sky-400 hover:border-sky-400'} ${isDarkMode ? 'border-slate-700' : ''}`}
      aria-label="Chat input form"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      >
      <div className="flex flex-col gap-2">
        {/* Drag-and-drop area */}
        <div
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-md transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-gray-200 bg-gray-50'} py-2 px-2 mb-1`}
          onClick={openFilePicker}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
            disabled={disabled}
            accept=".txt,.json,.pdf,.csv,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.html,.xml,.yaml,.yml,.log,.tsv,.ini,.conf,.js,.ts,.py,.java,.c,.cpp,.h,.hpp,.go,.rb,.php,.sh,.bat,.ps1,.md,.tex,.rst,.csv,.tsv,.json,.pdf"
          />
          <span className="text-sm text-gray-500 select-none">
            {dragActive ? 'Drop files here...' : 'Attach files (click or drag & drop)'}
          </span>
        </div>
        {/* File preview list */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center bg-gray-100 dark:bg-slate-700 rounded px-2 py-1 text-xs">
                <span className="truncate max-w-[120px]" title={file.name}>{file.name}</span>
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={e => { e.stopPropagation(); removeFile(idx); }}
                  aria-label={`Remove ${file.name}`}
                  tabIndex={-1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-disabled={disabled}
          rows={5}
          className={`w-full resize-none border-none p-2 focus:outline-none ${
            disabled
              ? isDarkMode
                ? 'cursor-not-allowed bg-slate-800 text-gray-400'
                : 'cursor-not-allowed bg-gray-100 text-gray-500'
              : isDarkMode
                ? 'bg-slate-800 text-gray-200'
                : 'bg-white'
          }`}
          placeholder="What can I help with?"
          aria-label="Message input"
        />
        <div
          className={`flex items-center justify-between px-2 py-1.5 ${
            disabled ? (isDarkMode ? 'bg-slate-800' : 'bg-gray-100') : isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
          <div className="flex gap-2 text-gray-500">{/* Icons can go here */}</div>
          {showStopButton ? (
            <button
              type="button"
              onClick={onStopTask}
              className="rounded-md bg-red-500 px-3 py-1 text-white transition-colors hover:bg-red-600">
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSendButtonDisabled && files.length === 0}
              aria-disabled={isSendButtonDisabled && files.length === 0}
              className={`rounded-md bg-[#19C2FF] px-3 py-1 text-white transition-colors hover:enabled:bg-[#0073DC] ${isSendButtonDisabled && files.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}>
              Send
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
