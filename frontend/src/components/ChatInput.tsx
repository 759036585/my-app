import type { RefObject } from 'react'

interface ChatInputProps {
  inputValue: string
  isTyping: boolean
  inputRef: RefObject<HTMLTextAreaElement | null>
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSend: () => void
}

export default function ChatInput({
  inputValue,
  isTyping,
  inputRef,
  onInputChange,
  onKeyDown,
  onSend,
}: ChatInputProps) {
  return (
    <div className="chat-input-area">
      <div className="chat-input-wrapper">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="给小李助手发消息..."
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          rows={1}
        />
        <button
          className={`chat-send-btn ${inputValue.trim() ? 'active' : ''}`}
          onClick={onSend}
          disabled={!inputValue.trim() || isTyping}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p className="chat-disclaimer">小李助手可能会犯错，请核实重要信息。</p>
    </div>
  )
}
