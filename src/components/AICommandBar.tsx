'use client';

import { useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import s from '@/app/dashboard.module.css';

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const PLACEHOLDERS = [
  "Ask anything… 'Add Maths every Monday 9am'",
  "'Log ₹150 for lunch today'",
  "'Remind me to submit assignment at 6pm'",
  "'Mark Morning Run as done'",
  "'What's on my schedule tomorrow?'",
];

export default function AICommandBar() {
  const { user } = useUser();
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Voice input ── */
  const toggleVoice = useCallback(() => {
    const SR = (window.SpeechRecognition || window.webkitSpeechRecognition) as
      | (new () => SpeechRecognitionInstance)
      | undefined;

    if (!SR) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setValue(transcript);
      inputRef.current?.focus();
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    if (!value.trim() || isSending) return;
    setIsSending(true);
    setResponse(null);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("n8n webhook URL not configured");
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: value.trim(),
          userId: user?.id || 'anonymous',
        }),
      });

      const rawText = await res.text();
      
      if (!res.ok) {
        console.error("Webhook Error Response:", rawText);
        throw new Error(`Webhook request failed (${res.status}): ${rawText}`);
      }

      try {
        const data = JSON.parse(rawText);
        setResponse(data.reply || `Processed: "${value.trim()}"`);
      } catch (parseErr) {
        console.error("Failed to parse n8n response. Raw response was:", rawText);
        setResponse("⚠️ n8n connected, but didn't return valid JSON. Check n8n execution logs.");
      }
    } catch (err: any) {
      console.error(err);
      setResponse(`❌ Error: ${err.message || "Failed to process command."}`);
    } finally {
      setValue('');
      setIsSending(false);
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
      setTimeout(() => setResponse(null), 4000);
    }
  }, [value, isSending, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') setValue('');
  };

  return (
    <motion.div
      className={s.aiBarWrap}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5, ease: 'easeOut' }}
    >
      <div className={s.aiBarInner}>
        <div className={s.aiBarGlow} />

        {/* Response toast */}
        <AnimatePresence>
          {response && (
            <motion.div
              className={s.aiResponse}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <span className={s.aiResponseDot} />
              {response}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={s.aiBar}>
          {/* Mic button */}
          <button
            id="ai-mic-btn"
            className={`${s.aiMicBtn} ${isListening ? s.aiMicActive : ''}`}
            onClick={toggleVoice}
            title={isListening ? 'Stop recording' : 'Voice input'}
          >
            {isListening ? (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <MicOff size={14} />
              </motion.span>
            ) : (
              <Mic size={15} />
            )}
          </button>

          <div className={s.aiDivider} />

          {/* Text input */}
          <input
            ref={inputRef}
            id="ai-command-input"
            className={s.aiInput}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Kbd hint */}
          {!value && (
            <span className={s.aiKbd}>⌘ K</span>
          )}

          {/* Send button */}
          <button
            id="ai-send-btn"
            className={s.aiSendBtn}
            onClick={handleSubmit}
            disabled={!value.trim() || isSending}
            title="Send"
          >
            {isSending ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                <Loader2 size={14} />
              </motion.span>
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
