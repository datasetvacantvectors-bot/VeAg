import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Copy, Check, ClipboardPaste, RotateCcw, Clock, CheckCheck, AlertCircle, Leaf, MessageCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Lightweight inline markdown renderer for AI responses
const MarkdownText = ({ content }) => {
  const processInline = (text, baseKey = 0) => {
    const patterns = [
      { re: /\*\*(.+?)\*\*/, render: (m, k) => <strong key={k} className="font-semibold text-white">{m[1]}</strong> },
      { re: /`([^`]+)`/, render: (m, k) => <code key={k} className="px-1 py-0.5 rounded bg-white/10 text-green-300 text-[11px] font-mono">{m[1]}</code> },
      { re: /\*([^*\n]+)\*/, render: (m, k) => <em key={k} className="italic text-white/90">{m[1]}</em> },
    ];
    const result = [];
    let txt = text;
    let key = baseKey;
    while (txt.length > 0) {
      let best = null;
      for (const pat of patterns) {
        const m = pat.re.exec(txt);
        if (m && (!best || m.index < best.m.index)) best = { m, render: pat.render };
      }
      if (!best) { result.push(<span key={key++}>{txt}</span>); break; }
      if (best.m.index > 0) result.push(<span key={key++}>{txt.slice(0, best.m.index)}</span>);
      result.push(best.render(best.m, key++));
      txt = txt.slice(best.m.index + best.m[0].length);
    }
    return result;
  };

  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(
        <pre key={`cb-${i}`} className="my-2 p-3 rounded-xl overflow-x-auto text-left" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {lang && <div className="text-[9px] text-green-400/60 uppercase tracking-wider mb-1.5 font-mono">{lang}</div>}
          <code className="text-[11px] text-green-300 font-mono whitespace-pre">{codeLines.join('\n')}</code>
        </pre>
      );
      i++; continue;
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={`h1-${i}`} className="text-sm font-bold text-white mt-3 mb-1">{processInline(line.slice(2), i * 100)}</h1>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <div key={`h2-${i}`} className="flex items-center gap-2 mt-3 mb-1.5">
          <div className="w-0.5 h-4 rounded-full bg-green-400 flex-shrink-0" />
          <h2 className="text-sm font-bold text-white">{processInline(line.slice(3), i * 100)}</h2>
        </div>
      );
      i++; continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} className="text-xs font-semibold text-green-300/90 mt-2 mb-1 uppercase tracking-wide">{processInline(line.slice(4), i * 100)}</h3>);
      i++; continue;
    }
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="border-white/10 my-2" />);
      i++; continue;
    }
    if (/^[-*•] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*•] /.test(lines[i])) { items.push(lines[i].replace(/^[-*•] /, '')); i++; }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1.5 ml-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/70 mt-1.5 flex-shrink-0" />
              <span className="text-sm text-white/85 leading-relaxed">{processInline(item, idx * 1000)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-1.5 ml-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-green-300 flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}>
                {idx + 1}
              </span>
              <span className="text-sm text-white/85 leading-relaxed">{processInline(item, idx * 1000)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    if (line.trim() === '') { elements.push(<div key={`sp-${i}`} className="h-1" />); i++; continue; }
    elements.push(<p key={`p-${i}`} className="text-sm text-white/85 leading-relaxed">{processInline(line, i * 100)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
};

const AskVeAg = ({ isOpen, onClose, caseId, userId, diseaseName, t }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorToast, setErrorToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const errorTimerRef = useRef(null);
  const pollingTimerRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const forceScrollRef = useRef(false); // set true when user sends a message

  // Show error toast
  const showError = useCallback((msg) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorToast(msg);
    errorTimerRef.current = setTimeout(() => setErrorToast(null), 3500);
  }, []);

  // Load initial messages
  useEffect(() => {
    if (isOpen && caseId) {
      isFirstLoadRef.current = true;
      loadMessages();
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, [isOpen, caseId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!loadingOlder && bottomRef.current) {
      if (isFirstLoadRef.current) {
        // Instant jump on initial open — no janky smooth-scroll over all loaded msgs
        bottomRef.current.scrollIntoView({ behavior: 'auto' });
        isFirstLoadRef.current = false;
      } else if (forceScrollRef.current) {
        // User just sent a message — always scroll to bottom regardless of position
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        forceScrollRef.current = false;
      } else {
        // Background update (poll, etc.) — only scroll if already near the bottom
        const container = chatContainerRef.current;
        const isNearBottom = !container ||
          container.scrollHeight - container.scrollTop - container.clientHeight < 250;
        if (isNearBottom) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, loadingOlder]);

  // Poll for pending AI responses when the popup is reopened mid-processing
  useEffect(() => {
    if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    if (initialLoading || sending) return;
    const hasPending = messages.some(
      m => (m.status === 'analyzing' || m.status === 'sent') && !m.reply && !m._id.startsWith('temp-')
    );
    if (!hasPending) return;
    pollingTimerRef.current = setTimeout(() => loadMessages(null, true), 2000);
    return () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, [messages, initialLoading, sending]);

  const loadMessages = async (before = null, silent = false) => {
    try {
      if (before) setLoadingOlder(true);
      else if (!silent) setInitialLoading(true);

      const params = { userId };
      if (before) params.before = before;

      const res = await axios.get(`${API_BASE_URL}/ask/${caseId}/messages`, { params });

      if (res.data.success) {
        if (before) {
          const container = chatContainerRef.current;
          const prevScrollHeight = container?.scrollHeight || 0;
          setMessages(prev => [...res.data.messages, ...prev]);
          // Maintain scroll position
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
          });
        } else {
          setMessages(res.data.messages);
        }
        setHasMore(res.data.hasMore);
      }
    } catch (err) {
      if (!silent) showError(t.caseDetail?.askVeAgError || 'Something went wrong');
    } finally {
      setInitialLoading(false);
      setLoadingOlder(false);
    }
  };

  // Handle scroll: load older messages + show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollDown(distFromBottom > 200);

    if (loadingOlder || !hasMore) return;
    if (container.scrollTop < 60 && messages.length > 0) {
      const oldest = messages[0];
      if (oldest?.createdAt) {
        loadMessages(oldest.createdAt);
      }
    }
  }, [loadingOlder, hasMore, messages]);

  // Validate input
  const validateInput = (text) => {
    if (!text || text.trim().length === 0) {
      showError(t.caseDetail?.askVeAgEmpty || 'Please type a message');
      return false;
    }
    if (text.trim().length > 2000) {
      showError(t.caseDetail?.askVeAgTooLong || 'Message too long (max 2000 characters)');
      return false;
    }
    // Check for non-text content (images, files pasted as data)
    if (/<[^>]+>/.test(text) || /data:(image|application|video|audio)\//.test(text)) {
      showError(t.caseDetail?.askVeAgTextOnly || 'Only text messages are allowed');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (sending) return;
    const hasPendingAI = messages.some(
      m => (m.status === 'analyzing' || m.status === 'sent') && !m.reply && !m._id.startsWith('temp-')
    );
    if (hasPendingAI) return;
    if (!validateInput(input)) return;

    if (!navigator.onLine) {
      showError(t.caseDetail?.askVeAgNoInternet || 'No internet connection');
      return;
    }

    const text = input.trim();
    setInput('');
    setSending(true);
    forceScrollRef.current = true; // always scroll down when user sends

    // Optimistic: add temporary message
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      caseId,
      userId,
      message: text,
      reply: null,
      status: 'sending',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await axios.post(`${API_BASE_URL}/ask/${caseId}/messages`, {
        userId,
        message: text
      });

      if (res.data.success) {
        setMessages(prev => prev.map(m => m._id === tempId ? res.data.message : m));
      } else {
        setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' } : m));
        showError(res.data.error || t.caseDetail?.askVeAgError || 'Something went wrong');
      }
    } catch (err) {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' } : m));
      showError(err.response?.data?.error || t.caseDetail?.askVeAgError || 'Something went wrong');
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleRetry = async (messageId, originalText = null) => {
    // If the message never reached the server, re-send from scratch
    if (messageId.startsWith('temp-')) {
      if (!originalText) return;
      const newTempId = `temp-${Date.now()}`;
      setMessages(prev => [
        ...prev.filter(m => m._id !== messageId),
        { _id: newTempId, caseId, userId, message: originalText, reply: null, status: 'sending', createdAt: new Date().toISOString() }
      ]);
      setSending(true);
      try {
        const res = await axios.post(`${API_BASE_URL}/ask/${caseId}/messages`, { userId, message: originalText });
        if (res.data.success) {
          setMessages(prev => prev.map(m => m._id === newTempId ? res.data.message : m));
        } else {
          setMessages(prev => prev.map(m => m._id === newTempId ? { ...m, status: 'failed' } : m));
          showError(res.data.error || t.caseDetail?.askVeAgError || 'Something went wrong');
        }
      } catch (err) {
        setMessages(prev => prev.map(m => m._id === newTempId ? { ...m, status: 'failed' } : m));
        showError(err.response?.data?.error || t.caseDetail?.askVeAgError || 'Something went wrong');
      } finally {
        setSending(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return;
    }

    // Message was saved to DB but AI response failed – use retry endpoint
    setSending(true);
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: 'analyzing' } : m));

    try {
      const res = await axios.post(`${API_BASE_URL}/ask/messages/${messageId}/retry`, { userId });
      if (res.data.success) {
        setMessages(prev => prev.map(m => m._id === messageId ? res.data.message : m));
      } else {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: 'failed' } : m));
        showError(res.data.error || t.caseDetail?.askVeAgError || 'Something went wrong');
      }
    } catch (err) {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: 'failed' } : m));
      showError(t.caseDetail?.askVeAgError || 'Something went wrong');
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showError('Failed to copy');
    } finally {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && typeof text === 'string') {
        if (!text.trim() && text.length === 0) return;
        if (/data:(image|application|video|audio)\//.test(text)) {
          showError(t.caseDetail?.askVeAgTextOnly || 'Only text messages are allowed');
          return;
        }
        const combined = input + text;
        if (combined.length > 2000) {
          showError(t.caseDetail?.askVeAgTooLong || 'Message too long (max 2000 characters)');
          return;
        }
        setInput(combined);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
            inputRef.current.focus();
          }
        }, 0);
      }
    } catch {
      showError('Failed to access clipboard. Please use Ctrl+V to paste.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Block files/images from paste, allow all text/* types (plain, html, rtf)
  const handleInputPaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.kind === 'file' || (item.type && !item.type.startsWith('text/'))) {
          e.preventDefault();
          showError(t.caseDetail?.askVeAgTextOnly || 'Only text messages are allowed');
          return;
        }
      }
    }
    // Check if combined length would exceed limit
    const pasted = e.clipboardData?.getData('text') || '';
    if ((input + pasted).length > 2000) {
      e.preventDefault();
      showError(t.caseDetail?.askVeAgTooLong || 'Message too long (max 2000 characters)');
    }
  };

  // Date separator helper
  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t.caseDetail?.askVeAgToday || 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t.caseDetail?.askVeAgYesterday || 'Yesterday';
    }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTimeLabel = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Status icon for user messages
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-white/40" />;
      case 'sent':
        return <Check className="w-3 h-3 text-white/50" />;
      case 'analyzing':
        return <CheckCheck className="w-3 h-3 text-white/50" />;
      case 'answered':
        return <CheckCheck className="w-3 h-3 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-white/40" />;
    }
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const dateLabel = getDateLabel(msg.createdAt);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: 'date', label: dateLabel, key: `date-${msg.createdAt}` });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: 'message', data: msg, key: msg._id });
  });

  // System messages (always shown at top)
  const systemMessages = [
    { id: 'sys-1', text: t.caseDetail?.askVeAgWelcome || 'Welcome to Ask VeAg!' },
    { id: 'sys-2', text: (t.caseDetail?.askVeAgWelcomeMsg || "I'm your AI assistant specialized in helping with the disease detected in your crop.").replace('{disease}', diseaseName) },
    { id: 'sys-3', text: t.caseDetail?.askVeAgRules || 'Important: I can only answer questions related to the detected disease. Text messages only.' },
    { id: 'sys-4', text: t.caseDetail?.askVeAgPrivacy || "I'm not a conversational chatbot — I don't retain memory between questions. Each answer is independent, to protect your privacy." },
  ];

  // Derived: AI is still processing a previous message (survives page reload)
  const isAiProcessing = !sending && messages.some(
    m => (m.status === 'analyzing' || m.status === 'sent') && !m.reply && !m._id.startsWith('temp-')
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Chat Window */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg h-[85vh] max-h-[700px] flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(0,0,0,0.45) 50%, rgba(34,197,94,0.08) 100%)',
              backdropFilter: 'blur(40px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border border-green-400/50 shadow-lg shadow-green-500/30">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">{t.caseDetail?.askVeAgTitle || 'Ask VeAg'}</h3>
                  <p className="text-green-300/70 text-xs">{t.caseDetail?.askVeAgSubtitle || 'AI Agricultural Assistant'} &bull; {diseaseName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                title={t.caseDetail?.askVeAgClose || 'Close'}
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Loading Older Indicator — sticky above the scroll area so it's always visible */}
            <AnimatePresence>
              {loadingOlder && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center py-2 border-b border-white/10"
                  style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
                  >
                    <motion.div
                      className="w-3.5 h-3.5 border-2 border-transparent border-t-green-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="text-xs text-green-300/70">{t.caseDetail?.askVeAgLoadingOlder || 'Loading older messages...'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages Area */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar"
              style={{ scrollBehavior: 'auto' }}
            >

              {/* System Welcome Messages */}
              {systemMessages.map((sys) => (
                <div key={sys.id} className="flex justify-center my-2">
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
                      border: '1px solid rgba(34,197,94,0.2)'
                    }}
                  >
                    <p className="text-xs text-green-200/80 leading-relaxed">{sys.text}</p>
                  </div>
                </div>
              ))}

              {/* Initial Loading */}
              {initialLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-8 h-8">
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent border-t-white/50 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-1 border-2 border-transparent border-t-green-400 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {/* Messages */}
              {groupedMessages.map((item) => {
                if (item.type === 'date') {
                  return (
                    <div key={item.key} className="flex items-center justify-center my-3">
                      <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{item.label}</span>
                      </div>
                    </div>
                  );
                }

                const msg = item.data;
                return (
                  <div key={item.key}>
                    {/* User Message */}
                    <div className="flex justify-end mb-1">
                      <div className="max-w-[80%] group relative">
                        <div className="px-4 py-2.5 rounded-2xl rounded-tr-md"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.35), rgba(22,163,74,0.3))',
                            border: '1px solid rgba(34,197,94,0.25)'
                          }}
                        >
                          <p className="text-sm text-white/95 leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className="flex items-center justify-end gap-1.5 mt-1">
                            <span className="text-[10px] text-white/30">{getTimeLabel(msg.createdAt)}</span>
                            <StatusIcon status={msg.status} />
                          </div>
                        </div>
                        {/* Copy & Retry for user msg */}
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleCopy(msg.message, `user-${msg._id}`)}
                            className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            title={t.caseDetail?.askVeAgCopyMsg || 'Copy'}
                          >
                            {copiedId === `user-${msg._id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/50" />}
                          </button>
                          {msg.status === 'failed' && (
                            <button
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleRetry(msg._id, msg.message)}
                              className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                              title={t.caseDetail?.askVeAgRetry || 'Retry'}
                            >
                              <RotateCcw className="w-3 h-3 text-red-400" />
                            </button>
                          )}
                        </div>
                        {/* Failed Indicator */}
                        {msg.status === 'failed' && (
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span className="text-[10px] text-red-400">{t.caseDetail?.askVeAgFailed || 'Failed to send'}</span>
                            <button
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleRetry(msg._id, msg.message)}
                              className="text-[10px] text-red-300 underline ml-1"
                            >
                              {t.caseDetail?.askVeAgRetry || 'Retry'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Reply */}
                    {(msg.status === 'sending' || msg.status === 'analyzing') && !msg.reply && (
                      <div className="flex justify-start mb-2">
                        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-md"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)'
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div className="flex gap-1">
                              {[0, 1, 2].map(i => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-green-400/60 rounded-full"
                                  animate={{ y: [0, -6, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                />
                              ))}
                            </motion.div>
                            <span className="text-xs text-white/40">{t.caseDetail?.askVeAgAnalyzing || 'AI is thinking...'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.reply && (
                      <div className="flex justify-start mb-2">
                        <div className="max-w-[85%] group relative">
                          <div className="px-4 py-2.5 rounded-2xl rounded-tl-md"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <Leaf className="w-3 h-3 text-green-400" />
                              <span className="text-[10px] text-green-400/70 font-semibold uppercase tracking-wider">Ask VeAg</span>
                            </div>
                            <MarkdownText content={msg.reply} />
                            <div className="flex items-center justify-end mt-1.5">
                              <span className="text-[10px] text-white/25">{getTimeLabel(msg.updatedAt || msg.createdAt)}</span>
                            </div>
                          </div>
                          {/* Copy for AI reply */}
                          <div className="absolute -right-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleCopy(msg.reply, `ai-${msg._id}`)}
                              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                              title={t.caseDetail?.askVeAgCopyMsg || 'Copy'}
                            >
                              {copiedId === `ai-${msg._id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/50" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollDown && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowScrollDown(false);
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="absolute bottom-[76px] right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full"
                  style={{
                    background: 'rgba(34,197,94,0.25)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(34,197,94,0.5)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
                  }}
                  title="Scroll to latest"
                >
                  <ChevronDown className="w-4 h-4 text-green-300" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Error Toast */}
            <AnimatePresence>
              {errorToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-20 left-4 right-4 z-10"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{
                      background: 'rgba(239,68,68,0.2)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(239,68,68,0.3)'
                    }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-red-200 flex-1">{errorToast}</span>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setErrorToast(null)} className="text-red-300 hover:text-red-200">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-end gap-2">
                {/* Paste Button */}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handlePaste}
                  className="flex-shrink-0 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                  title={t.caseDetail?.askVeAgPaste || 'Paste'}
                >
                  <ClipboardPaste className="w-4 h-4 text-white/50" />
                </button>

                {/* Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handleInputPaste}
                    placeholder={t.caseDetail?.askVeAgPlaceholder || 'Type your question here...'}
                    rows={1}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 resize-none outline-none transition-all duration-200 ask-veag-textarea"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      maxHeight: '120px',
                      minHeight: '42px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    disabled={sending || isAiProcessing}
                  />
                </div>

                {/* Send Button */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); if (!sending && !isAiProcessing && input.trim()) handleSend(); }}
                  disabled={sending || isAiProcessing || !input.trim()}
                  className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 ${
                    input.trim() && !sending && !isAiProcessing
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-95'
                      : 'bg-white/5 border border-white/10'
                  }`}
                  title={t.caseDetail?.askVeAgSend || 'Send'}
                >
                  {(sending || isAiProcessing) ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
              {input.length > 1800 && (
                <p className="text-[10px] text-orange-400/60 mt-1 text-right">{input.length}/2000</p>
              )}
            </div>
            {/* Hide textarea scrollbar (webkit) */}
            <style>{`.ask-veag-textarea::-webkit-scrollbar { display: none; }`}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AskVeAg;
