import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar.jsx';

const API_BASE = (import.meta.env.VITE_API_URL
  ? `https://${import.meta.env.VITE_API_URL}`
  : 'https://calmvio-production.up.railway.app') + '/api';

function getOrCreateSessionId() {
  let id = localStorage.getItem('calmivo_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('calmivo_session', id);
  }
  return id;
}

export default function Chat() {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [crisis, setCrisis]           = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking]   = useState(false);

  const sessionId      = useRef(getOrCreateSessionId());
  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef  = useRef('');
  const voicesRef      = useRef([]);

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasVoice = !!SpeechRecognitionAPI;

  // Load available TTS voices
  useEffect(() => {
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Welcome message
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: "Hi, I'm Sage 💜 I'm here to listen, support, and help you feel a little calmer. What's on your mind today?",
      timestamp: new Date().toISOString(),
    }]);
    inputRef.current?.focus();
  }, []);

  // Pick a warm, natural-sounding voice
  function pickVoice() {
    const voices = voicesRef.current;
    return (
      voices.find(v => v.name === 'Samantha') ||
      voices.find(v => v.name === 'Karen') ||
      voices.find(v => v.name === 'Moira') ||
      voices.find(v => v.name === 'Tessa') ||
      voices.find(v => v.lang === 'en-GB' && v.localService) ||
      voices.find(v => v.lang === 'en-AU' && v.localService) ||
      voices.find(v => v.lang.startsWith('en') && v.localService) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0]
    );
  }

  function speakText(text) {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.rate   = 0.93;
    utterance.pitch  = 1.08;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  async function submitText(text) {
    if (!text || loading) return;

    // Stop any current speech before sending
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setCrisis(null);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-session-token': sessionId.current,
        },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message, timestamp: data.timestamp },
      ]);

      if (data.crisis) setCrisis(data.crisis);

      // Speak Sage's reply
      speakText(data.message);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I had trouble responding right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    await submitText(input.trim());
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    if (!hasVoice) return;

    // Stop Sage speaking before we listen
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    transcriptRef.current = '';

    const recognition = new SpeechRecognitionAPI();
    recognition.lang             = 'en-US';
    recognition.continuous       = false;
    recognition.interimResults   = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      transcriptRef.current = transcript;
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      const text = transcriptRef.current.trim();
      transcriptRef.current = '';
      if (text) submitText(text);
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function toggleVoice() {
    if (voiceEnabled) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(v => !v);
  }

  function clearChat() {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    sessionId.current = crypto.randomUUID();
    localStorage.setItem('calmivo_session', sessionId.current);
    setCrisis(null);
    setMessages([{
      role: 'assistant',
      content: "Hi again 💜 I'm here whenever you're ready. What's on your mind?",
      timestamp: new Date().toISOString(),
    }]);
  }

  return (
    <>
      <Navbar />
      <div className="chat-page">
        <div className="chat-page__layout">

          {/* ── Sidebar ── */}
          <aside className="chat-sidebar">
            <div className="chat-sidebar__header">
              <div className={`chat-sidebar__avatar${isSpeaking ? ' sage-speaking' : ''}`}>🌿</div>
              <div>
                <div className="chat-sidebar__name">Sage</div>
                <div className="chat-sidebar__status">
                  <span className="status-dot" />
                  {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Online'}
                </div>
              </div>
            </div>

            <p className="chat-sidebar__bio">
              I'm your compassionate AI wellness companion. I'm here to listen, offer coping strategies,
              and support you, not to replace a therapist.
            </p>

            <div className="chat-sidebar__tips">
              <div className="sidebar-tip">💬 Share how you're feeling</div>
              <div className="sidebar-tip">🧘 Ask for breathing exercises</div>
              <div className="sidebar-tip">😴 Get sleep tips</div>
              <div className="sidebar-tip">🌱 Talk through anxious thoughts</div>
            </div>

            {hasVoice && (
              <button
                className={`voice-mode-toggle${voiceEnabled ? ' active' : ''}`}
                onClick={toggleVoice}
                title={voiceEnabled ? 'Sage will speak her replies. Click to mute.' : 'Sage is muted. Click to unmute.'}
              >
                {voiceEnabled ? '🔊 Sage voice on' : '🔇 Sage voice off'}
              </button>
            )}

            <button className="btn-outline chat-sidebar__clear" onClick={clearChat}>
              Start new conversation
            </button>

            <div className="chat-sidebar__disclaimer">
              Sage is an AI companion, not a licensed therapist. For emergencies, call <strong>988</strong>.
            </div>
          </aside>

          {/* ── Chat window ── */}
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`msg msg--${msg.role}${msg.isError ? ' msg--error' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="msg__avatar">🌿</div>
                  )}
                  <div className="msg__bubble">
                    {msg.role === 'assistant' && (
                      <div className="msg__name">Sage</div>
                    )}
                    <p>{msg.content}</p>
                    <div className="msg__time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="msg msg--assistant">
                  <div className="msg__avatar">🌿</div>
                  <div className="msg__bubble">
                    <div className="msg__name">Sage</div>
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Crisis banner */}
            {crisis && (
              <div className="crisis-banner">
                <div className="crisis-banner__icon">🆘</div>
                <div>
                  <div className="crisis-banner__title">{crisis.message}</div>
                  <div className="crisis-banner__resources">
                    {crisis.resources.map((r, i) => (
                      <span key={i} className="crisis-resource">
                        {r.name}: <strong>{r.contact}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Listening indicator */}
            {isListening && (
              <div className="voice-listening-bar">
                <span className="voice-wave"><span/><span/><span/><span/><span/></span>
                Listening... speak now
              </div>
            )}

            {/* Input bar */}
            <form className="chat-input-bar" onSubmit={sendMessage}>
              <input
                ref={inputRef}
                type="text"
                className={`chat-input${isListening ? ' chat-input--listening' : ''}`}
                placeholder={isListening ? 'Listening...' : 'Share what\'s on your mind...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                maxLength={1000}
              />
              {hasVoice && (
                <button
                  type="button"
                  className={`voice-btn${isListening ? ' listening' : ''}`}
                  onClick={toggleListening}
                  disabled={loading}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  title={isListening ? 'Stop' : 'Tap and speak'}
                >
                  {isListening ? '⏹' : '🎤'}
                </button>
              )}
              <button
                type="submit"
                className="chat-send-btn"
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                {loading ? '...' : '➤'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
