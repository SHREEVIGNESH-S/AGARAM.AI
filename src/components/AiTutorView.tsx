import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Mic,
  MicOff,
  Volume2,
  Sliders,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Archive,
  Play,
  Pause,
  Square,
  RotateCcw,
} from 'lucide-react';
import {
  ChatMessage,
  Subject,
  TutorControls,
  ExplanationStyle,
  DifficultyLevel,
  ChatAttachment,
  Conversation,
} from '../types';
import { AgaramLogo } from './Header';

interface AiTutorViewProps {
  currentSubject: Subject;
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
  voiceEnabled: boolean;
  voiceGender?: 'male' | 'female';
  onSpeakText?: (text: string) => void;
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onStartNewConversation?: (subjectId: string, topicTitle?: string) => Promise<string | void>;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  currentSubject,
  subjects,
  onSelectSubject,
  voiceEnabled,
  voiceGender = 'male',
  onSpeakText,
  activeConversationId: initialConvId,
  onSelectConversation,
  onStartNewConversation,
}) => {
  // Conversations list & active selection
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [currentConvId, setCurrentConvId] = useState<string | null>(initialConvId || null);

  // Messages and chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Attachments & drag-and-drop
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // History filtering & management
  const [historySearch, setHistorySearch] = useState('');
  const [historySubjectFilter, setHistorySubjectFilter] = useState<string>('all');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [deleteModalConvId, setDeleteModalConvId] = useState<string | null>(null);

  // Tutor controls
  const [controls, setControls] = useState<TutorControls>({
    explanationStyle: 'Visual',
    difficulty: 'Intermediate',
    contextMemory: true,
    responseLength: 'Medium',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // In-chat Voice Playback & Synchronized Word Highlighting
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused' | 'stopped'>('idle');
  const [currentCharIndex, setCurrentCharIndex] = useState<number | null>(null);
  const [currentWordLength, setCurrentWordLength] = useState<number | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech
  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeechState('stopped');
    setSpeakingMsgId(null);
    setCurrentCharIndex(null);
    setCurrentWordLength(null);
    activeUtteranceRef.current = null;
  };

  // Pause speech
  const handlePauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setSpeechState('paused');
  };

  // Resume speech
  const handleResumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setSpeechState('playing');
  };

  // Play / Speak AI Message directly inside chat
  const handlePlaySpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean text of code blocks for speech
    const cleanText = text.replace(/```[\s\S]*?```/g, '').trim() || text;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = voiceGender === 'female' ? 1.15 : 0.95;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (voiceGender === 'female') {
        const fv = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('victoria') ||
            v.name.toLowerCase().includes('jenny'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (fv) utterance.voice = fv;
      } else {
        const mv = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('guy') ||
            v.name.toLowerCase().includes('mark') ||
            v.name.toLowerCase().includes('george'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (mv) utterance.voice = mv;
      }
    }

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === 'word' || !event.name) {
        const idx = event.charIndex;
        let len = event.charLength;
        if (!len || len <= 0) {
          const slice = cleanText.slice(idx);
          const nextSpace = slice.search(/\s/);
          len = nextSpace === -1 ? slice.length : nextSpace;
        }
        setCurrentCharIndex(idx);
        setCurrentWordLength(len > 0 ? len : 4);
      }
    };

    utterance.onend = () => {
      setSpeechState('stopped');
      setSpeakingMsgId(null);
      setCurrentCharIndex(null);
      setCurrentWordLength(null);
      activeUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      setSpeechState('stopped');
      setSpeakingMsgId(null);
      setCurrentCharIndex(null);
      setCurrentWordLength(null);
      activeUtteranceRef.current = null;
    };

    activeUtteranceRef.current = utterance;
    setSpeakingMsgId(msgId);
    setSpeechState('playing');
    setCurrentCharIndex(0);
    setCurrentWordLength(4);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load all conversations
  const fetchConversations = async (targetIdToSelect?: string) => {
    try {
      const res = await fetch('/api/ai/conversations');
      const data: Conversation[] = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);

        // Determine which conversation to make active
        let toSelect: Conversation | undefined;
        if (targetIdToSelect) {
          toSelect = data.find(c => c.id === targetIdToSelect);
        } else if (currentConvId) {
          toSelect = data.find(c => c.id === currentConvId);
        } else {
          // Find first conversation matching current subject, or very first conversation
          toSelect = data.find(c => c.subjectId === currentSubject.id) || data[0];
        }

        if (toSelect) {
          setCurrentConvId(toSelect.id);
          setActiveConversation(toSelect);
          setMessages(toSelect.messages || []);
        } else if (data.length === 0) {
          // If no conversations exist yet, create one
          handleCreateNewConversation();
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations(initialConvId || undefined);
  }, [initialConvId]);

  // If subject changes from outside, optionally filter or pick a conversation for this subject
  useEffect(() => {
    if (activeConversation && activeConversation.subjectId !== currentSubject.id) {
      const matchingConv = conversations.find(c => c.subjectId === currentSubject.id);
      if (matchingConv) {
        handleSelectConversation(matchingConv.id);
      }
    }
  }, [currentSubject.id]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Select a conversation
  const handleSelectConversation = async (convId: string) => {
    try {
      setCurrentConvId(convId);
      if (onSelectConversation) onSelectConversation(convId);
      const res = await fetch(`/api/ai/conversations/${convId}`);
      if (res.ok) {
        const conv: Conversation = await res.json();
        setActiveConversation(conv);
        setMessages(conv.messages || []);
        // Also ensure currentSubject matches
        const foundSubj = subjects.find(s => s.id === conv.subjectId);
        if (foundSubj && foundSubj.id !== currentSubject.id) {
          onSelectSubject(foundSubj.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    }
  };

  // Create a brand new conversation
  const handleCreateNewConversation = async (topicTitle?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: currentSubject.id,
          topicTitle: topicTitle || undefined,
          title: topicTitle ? `${topicTitle} – Doubts` : `${currentSubject.name} – Doubt Session`,
          isStructuredLesson: false,
        }),
      });
      const newConv: Conversation = await res.json();
      setConversations(prev => [newConv, ...prev]);
      setCurrentConvId(newConv.id);
      setActiveConversation(newConv);
      setMessages(newConv.messages || []);
      setStagedAttachments([]);
      setInputText('');
      setShowHistoryPanel(false);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Rename a conversation
  const handleSaveRename = async (convId: string) => {
    if (!editedTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setConversations(prev => prev.map(c => (c.id === convId ? { ...c, title: updated.title } : c)));
        if (activeConversation && activeConversation.id === convId) {
          setActiveConversation(prev => (prev ? { ...prev, title: updated.title } : null));
        }
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    } finally {
      setEditingConvId(null);
      setEditedTitle('');
    }
  };

  // Delete a conversation
  const handleConfirmDelete = async (convId: string) => {
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = conversations.filter(c => c.id !== convId);
        setConversations(remaining);
        setDeleteModalConvId(null);

        if (currentConvId === convId) {
          if (remaining.length > 0) {
            handleSelectConversation(remaining[0].id);
          } else {
            handleCreateNewConversation();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // File conversion to base64 DataURL
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (!isImage && !isPdf) {
        alert('Please select an image (JPG, PNG, WEBP) or a PDF document.');
        return;
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAttachment: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: file.name,
          fileType: file.type,
          fileSizeFormatted: formatFileSize(file.size),
          name: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl,
        };
        setStagedAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove staged attachment
  const handleRemoveStagedAttachment = (index: number) => {
    setStagedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    const hasAttachments = stagedAttachments.length > 0;

    if ((!text.trim() && !hasAttachments) || isLoading) return;

    // Ensure we have an active conversation, or create one
    let targetConvId = currentConvId;
    if (!targetConvId) {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: currentSubject.id,
          title: `${currentSubject.name} – Doubt Session`,
        }),
      });
      const created: Conversation = await res.json();
      setConversations(prev => [created, ...prev]);
      targetConvId = created.id;
      setCurrentConvId(created.id);
      setActiveConversation(created);
    }

    const outgoingAttachments = [...stagedAttachments];
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'student',
      text: text.trim(),
      timestamp: 'Just now',
      attachments: outgoingAttachments.length > 0 ? outgoingAttachments : undefined,
    };

    // Optimistically update UI
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setStagedAttachments([]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/ai/conversations/${targetConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          controls,
          attachments: outgoingAttachments,
        }),
      });

      const data = await res.json();
      const incomingAiMessage = data.aiMessage || data.message;
      if (incomingAiMessage) {
        setMessages(prev => [...prev, incomingAiMessage]);

        // Refresh conversation in list for updated title and preview
        setConversations(prev =>
          prev.map(c =>
            c.id === targetConvId
              ? {
                  ...c,
                  title: data.conversation?.title || data.conversationTitle || c.title,
                  lastMessagePreview: incomingAiMessage.text.slice(0, 90),
                  updatedAt: 'Just now',
                }
              : c
          )
        );

        if (activeConversation) {
          setActiveConversation(prev =>
            prev ? { ...prev, title: data.conversation?.title || data.conversationTitle || prev.title } : null
          );
        }

        if (voiceEnabled && data.audioScript) {
          handlePlaySpeech(incomingAiMessage.id, data.audioScript);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard handler: Enter sends, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Speech Recognition (Mic Input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Filtered conversations for history drawer
  const filteredConversations = conversations.filter(c => {
    if (historySubjectFilter !== 'all' && c.subjectId !== historySubjectFilter) return false;
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchPreview = c.lastMessagePreview?.toLowerCase().includes(q);
      const matchTopic = c.topicTitle?.toLowerCase().includes(q);
      return matchTitle || matchPreview || matchTopic;
    }
    return true;
  });

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-[#080A0D] agaram-grid-bg relative select-none"
      onDragOver={e => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setIsDraggingOver(false);
      }}
      onDrop={e => {
        e.preventDefault();
        setIsDraggingOver(false);
        handleFilesSelected(e.dataTransfer.files);
      }}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-[#FF681F]/10 border-2 border-dashed border-[#FF681F] z-50 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none animate-in fade-in">
          <div className="bg-[#151A20] border border-[#FF681F] p-6 rounded-2xl flex flex-col items-center space-y-3 shadow-2xl">
            <Paperclip className="w-10 h-10 text-[#FF681F] animate-bounce" />
            <div className="text-base font-bold text-white">Drop images or PDFs to upload</div>
            <div className="text-xs text-[#9299A3]">
              AGARAM AI can analyze diagrams, handwritten notes, textbook pages, and PDFs.
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER BAR (Clean, no website header, purely workspace + conversation context) */}
      <div className="h-16 px-4 sm:px-8 border-b border-[#292F36] bg-[#080A0D]/95 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          {/* Vibrant Orange Uppercase Subject Title matching Screenshot 3 */}
          <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-[#FF681F] truncate">
            {currentSubject.name}
          </h1>

          {/* Subject Switcher dropdown */}
          <select
            value={currentSubject.id}
            onChange={e => onSelectSubject(e.target.value)}
            className="hidden sm:block bg-[#151A20] border border-[#292F36] text-xs text-[#9299A3] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FF681F]"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Current Conversation title & inline rename */}
          {activeConversation && (
            <div className="hidden md:flex items-center space-x-2 border-l border-[#292F36] pl-3">
              {editingConvId === activeConversation.id ? (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveRename(activeConversation.id);
                      if (e.key === 'Escape') setEditingConvId(null);
                    }}
                    autoFocus
                    className="bg-[#101419] border border-[#FF681F] text-xs text-white rounded px-2 py-1 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveRename(activeConversation.id)}
                    className="p-1 hover:text-[#27C281] text-[#9299A3]"
                    title="Save title"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingConvId(null)}
                    className="p-1 hover:text-red-400 text-[#9299A3]"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 max-w-xs group">
                  <span className="text-xs text-[#F4F5F7] font-medium truncate" title={activeConversation.title}>
                    {activeConversation.title}
                  </span>
                  <button
                    onClick={() => {
                      setEditingConvId(activeConversation.id);
                      setEditedTitle(activeConversation.title);
                    }}
                    className="text-[#9299A3] hover:text-[#FF681F] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Rename conversation"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* New Chat Button (Requirement 3: Always starts a fresh conversation) */}
          <button
            onClick={() => handleCreateNewConversation()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold transition-all shadow-md shadow-[#FF681F]/30 active:scale-95"
            title="Start a new chat conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Chat History Panel Toggle Button (Requirement 5) */}
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showHistoryPanel
                ? 'bg-[#FF681F]/20 border-[#FF681F] text-[#FF681F]'
                : 'bg-[#151A20] border-[#292F36] text-[#9299A3] hover:text-white'
            }`}
            title="View saved past conversations"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            {conversations.length > 0 && (
              <span className="text-[10px] bg-[#292F36] text-white px-1.5 py-0.2 rounded-full">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Tutor Controls toggle button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showControls
                ? 'bg-[#FF681F]/20 border-[#FF681F] text-[#FF681F]'
                : 'bg-[#151A20] border-[#292F36] text-[#9299A3] hover:text-white'
            }`}
            title="Teaching style & difficulty settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tutor Settings</span>
          </button>

          {/* Logo on top right matching Screenshot 3 */}
          <div className="hidden lg:block pl-2">
            <AgaramLogo size="sm" />
          </div>
        </div>
      </div>

      {/* Tutor Controls Drawer */}
      {showControls && (
        <div className="bg-[#101419] border-b border-[#292F36] px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs animate-in slide-in-from-top-2 shrink-0 z-20">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#FF681F] mb-1.5">
              Explanation Style
            </label>
            <select
              value={controls.explanationStyle}
              onChange={e =>
                setControls(c => ({ ...c, explanationStyle: e.target.value as ExplanationStyle }))
              }
              className="w-full bg-[#151A20] border border-[#292F36] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#FF681F]"
            >
              <option value="Visual">Visual (Memory Maps)</option>
              <option value="Simple">Simple (Plain Terms)</option>
              <option value="Step by Step">Step by Step</option>
              <option value="Detailed">Detailed & Deep</option>
              <option value="Real-world Examples">Real-world Analogies</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#FF681F] mb-1.5">
              Difficulty Level
            </label>
            <select
              value={controls.difficulty}
              onChange={e =>
                setControls(c => ({ ...c, difficulty: e.target.value as DifficultyLevel }))
              }
              className="w-full bg-[#151A20] border border-[#292F36] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#FF681F]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#FF681F] mb-1.5">
              Response Length
            </label>
            <select
              value={controls.responseLength}
              onChange={e => setControls(c => ({ ...c, responseLength: e.target.value as any }))}
              className="w-full bg-[#151A20] border border-[#292F36] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#FF681F]"
            >
              <option value="Short">Short & Concise</option>
              <option value="Medium">Medium (Recommended)</option>
              <option value="Detailed">Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#FF681F] mb-1.5">
              Hindsight Memory
            </label>
            <button
              onClick={() => setControls(c => ({ ...c, contextMemory: !c.contextMemory }))}
              className={`w-full py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                controls.contextMemory
                  ? 'bg-[#27C281]/20 border-[#27C281] text-[#27C281]'
                  : 'bg-[#151A20] border-[#292F36] text-[#9299A3]'
              }`}
            >
              {controls.contextMemory ? '✓ Memory Recall Active' : 'Memory Disabled'}
            </button>
          </div>
        </div>
      )}

      {/* BODY CONTENT: Chat Area + Optional Conversation History Flyout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* CONVERSATION HISTORY PANEL (Requirement 5) */}
        {showHistoryPanel && (
          <aside className="w-80 sm:w-96 bg-[#0E1217] border-r border-[#292F36] flex flex-col h-full z-30 shrink-0 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* History Header */}
            <div className="p-4 border-b border-[#292F36] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-[#FF681F]" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Chat History
                </span>
              </div>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="p-1 text-[#9299A3] hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Subject filter */}
            <div className="p-3 border-b border-[#292F36] space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9299A3] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  placeholder="Search past conversations..."
                  className="w-full bg-[#151A20] border border-[#292F36] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#9299A3] focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              {/* Subject Filter pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setHistorySubjectFilter('all')}
                  className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                    historySubjectFilter === 'all'
                      ? 'bg-[#FF681F] text-white font-bold'
                      : 'bg-[#151A20] text-[#9299A3] hover:text-white'
                  }`}
                >
                  All Subjects
                </button>
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setHistorySubjectFilter(s.id)}
                    className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                      historySubjectFilter === s.id
                        ? 'bg-[#FF681F] text-white font-bold'
                        : 'bg-[#151A20] text-[#9299A3] hover:text-white'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-10 px-4 text-[#9299A3] text-xs">
                  No conversations match your search.
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isActive = conv.id === currentConvId;
                  const isEditing = editingConvId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => !isEditing && handleSelectConversation(conv.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                        isActive
                          ? 'bg-[#1B222A] border-[#FF681F]/70 shadow-md'
                          : 'bg-[#151A20]/80 border-[#292F36] hover:bg-[#151A20] hover:border-[#FF681F]/30'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#FF681F] rounded-r" />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div
                              className="flex items-center space-x-1"
                              onClick={e => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editedTitle}
                                onChange={e => setEditedTitle(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveRename(conv.id);
                                  if (e.key === 'Escape') setEditingConvId(null);
                                }}
                                autoFocus
                                className="w-full bg-[#101419] border border-[#FF681F] text-xs text-white rounded px-2 py-0.5"
                              />
                              <button
                                onClick={() => handleSaveRename(conv.id)}
                                className="text-[#27C281] p-1"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingConvId(null)}
                                className="text-red-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <h4
                              className={`text-xs font-bold truncate ${
                                isActive ? 'text-white' : 'text-[#F4F5F7]'
                              }`}
                            >
                              {conv.title}
                            </h4>
                          )}

                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] font-semibold text-[#FF681F] bg-[#FF681F]/10 px-1.5 py-0.5 rounded">
                              {conv.subjectName}
                            </span>
                            {conv.topicTitle && (
                              <span className="text-[10px] text-[#9299A3] truncate max-w-[120px]">
                                {conv.topicTitle}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-[#9299A3] line-clamp-1 mt-1.5">
                            {conv.lastMessagePreview || 'No messages yet'}
                          </p>

                          <div className="text-[10px] text-[#9299A3]/80 mt-1">
                            {conv.updatedAt || conv.createdAt}
                          </div>
                        </div>

                        {/* Action buttons (Rename, Delete) */}
                        {!isEditing && (
                          <div
                            className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setEditingConvId(conv.id);
                                setEditedTitle(conv.title);
                              }}
                              className="p-1 text-[#9299A3] hover:text-[#FF681F]"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteModalConvId(conv.id)}
                              className="p-1 text-[#9299A3] hover:text-red-400"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom New Chat Button inside history panel */}
            <div className="p-3 border-t border-[#292F36]">
              <button
                onClick={() => handleCreateNewConversation()}
                className="w-full py-2 px-3 rounded-lg bg-[#151A20] hover:bg-[#1B222A] border border-[#292F36] hover:border-[#FF681F] text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF681F]" />
                <span>+ New Conversation</span>
              </button>
            </div>
          </aside>
        )}

        {/* MAIN CHAT AREA (Flex col: Scrollable messages on top, Pinned bottom message composer) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Scrollable Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
            {messages.length === 0 ? (
              /* Brand new empty conversation welcome card */
              <div className="max-w-2xl mx-auto py-10 px-6 bg-[#151A20] border border-[#292F36] rounded-2xl text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-[#FF681F]/20 text-[#FF681F] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeConversation?.title || `Welcome to ${currentSubject.name} AI Tutor`}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9299A3] mt-1 max-w-md mx-auto">
                    Ask any question, request visual memory maps, work through dry-runs, or upload diagrams
                    and lecture PDFs.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  {[
                    `Can you explain ${currentSubject.name} core principles?`,
                    'Give me a visual memory map example',
                    'Test my understanding with an interactive question',
                  ].map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(starter)}
                      className="text-xs bg-[#101419] hover:bg-[#1B222A] border border-[#292F36] hover:border-[#FF681F] text-[#F4F5F7] px-3.5 py-2 rounded-lg transition-colors"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="w-full">
                  {msg.sender === 'student' ? (
                    /* Student message on right matching Screenshot 3 */
                    <div className="flex justify-end">
                      <div className="max-w-xl bg-[#151A20] border border-[#292F36] rounded-2xl px-5 py-3.5 text-sm sm:text-base text-[#F4F5F7] shadow-lg space-y-3">
                        {/* Attachments inside student message bubble (Requirement 6) */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {msg.attachments.map((att, aIdx) => (
                              <div
                                key={aIdx}
                                className="bg-[#080A0D] border border-[#292F36] rounded-xl overflow-hidden p-2 text-xs"
                              >
                                {(att.mimeType || att.fileType || '').startsWith('image/') ? (
                                  <div
                                    onClick={() => setPreviewImageModal(att.dataUrl || null)}
                                    className="cursor-pointer group relative"
                                  >
                                    <img
                                      src={att.dataUrl}
                                      alt={att.fileName || att.name || 'Image'}
                                      className="w-full h-28 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                                    />
                                    <div className="mt-1 text-[11px] text-[#9299A3] truncate font-mono">
                                      {att.fileName || att.name}
                                    </div>
                                  </div>
                                ) : (
                                  <a
                                    href={att.dataUrl}
                                    download={att.fileName || att.name || 'document.pdf'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center space-x-2 text-[#F4F5F7] hover:text-[#FF681F]"
                                  >
                                    <FileText className="w-5 h-5 text-[#FF681F] shrink-0" />
                                    <div className="min-w-0">
                                      <div className="text-[11px] font-semibold truncate">
                                        {att.fileName || att.name}
                                      </div>
                                      <div className="text-[10px] text-[#9299A3]">
                                        {att.fileSizeFormatted || formatFileSize(att.size)} (PDF)
                                      </div>
                                    </div>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message text */}
                        {msg.text && (
                          <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* AGARAM AI response on left matching Screenshot 3 */
                    <div className="flex flex-col items-start max-w-2xl">
                      {/* Response Card */}
                      <div className="w-full bg-[#151A20] border border-[#292F36] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                        {/* Top orange label matching Screenshot 3 & Inline Audio Controls */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF681F]">
                              AGARAM / RESPONSE
                            </span>
                            {speakingMsgId === msg.id && speechState === 'playing' && (
                              <span className="flex items-center space-x-1.5 text-[10px] font-bold text-[#FF681F] bg-[#FF681F]/10 border border-[#FF681F]/30 px-2 py-0.5 rounded-full animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF681F] animate-ping" />
                                <span>Speaking ({voiceGender === 'female' ? 'Female' : 'Male'} Voice)...</span>
                              </span>
                            )}
                            {speakingMsgId === msg.id && speechState === 'paused' && (
                              <span className="text-[10px] font-bold text-[#F2B84B] bg-[#F2B84B]/10 border border-[#F2B84B]/30 px-2 py-0.5 rounded-full">
                                Paused
                              </span>
                            )}
                          </div>

                          {/* Voice Listen Controls: LISTEN, PAUSE, RESUME, STOP, REPLAY directly inside chat */}
                          <div className="flex items-center space-x-1 sm:space-x-1.5">
                            {speakingMsgId === msg.id && speechState !== 'stopped' ? (
                              <>
                                {speechState === 'playing' ? (
                                  <button
                                    onClick={handlePauseSpeech}
                                    className="px-2.5 py-1 rounded bg-[#1B222A] hover:bg-[#252E38] text-white text-xs font-semibold flex items-center space-x-1 border border-[#292F36] transition-colors"
                                    title="Pause speaking"
                                  >
                                    <Pause className="w-3 h-3 text-[#FF681F]" />
                                    <span>PAUSE</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={handleResumeSpeech}
                                    className="px-2.5 py-1 rounded bg-[#1B222A] hover:bg-[#252E38] text-white text-xs font-semibold flex items-center space-x-1 border border-[#292F36] transition-colors"
                                    title="Resume speaking"
                                  >
                                    <Play className="w-3 h-3 text-[#27C281]" />
                                    <span>RESUME</span>
                                  </button>
                                )}

                                <button
                                  onClick={handleStopSpeech}
                                  className="px-2.5 py-1 rounded bg-[#1B222A] hover:bg-red-500/20 text-[#9299A3] hover:text-red-400 text-xs font-semibold flex items-center space-x-1 border border-[#292F36] transition-colors"
                                  title="Stop speaking"
                                >
                                  <Square className="w-3 h-3" />
                                  <span>STOP</span>
                                </button>

                                <button
                                  onClick={() => handlePlaySpeech(msg.id, msg.text)}
                                  className="px-2 py-1 rounded bg-[#1B222A] hover:bg-[#252E38] text-[#9299A3] hover:text-white text-xs font-semibold flex items-center space-x-1 border border-[#292F36] transition-colors"
                                  title="Replay from beginning"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>REPLAY</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handlePlaySpeech(msg.id, msg.text)}
                                className="text-xs text-[#9299A3] hover:text-[#FF681F] flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#101419] hover:bg-[#1B222A] border border-[#292F36] hover:border-[#FF681F]/40 transition-colors"
                                title="Read explanation aloud directly inside chat"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-[#FF681F]" />
                                <span className="font-semibold text-white">LISTEN</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Main Explanation Text with Dynamic Word-by-Word Highlighting */}
                        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                          {speakingMsgId === msg.id && currentCharIndex !== null && speechState !== 'stopped' ? (
                            <>
                              <span className="text-[#F4F5F7]">
                                {msg.text.slice(0, currentCharIndex)}
                              </span>
                              <span className="inline-block px-1 py-0.5 rounded font-black tracking-wide text-[#FF681F] bg-[#FF681F]/20 border border-[#FF681F]/60 shadow-sm transition-all duration-75 scale-[1.03]">
                                <span className="text-[#FF681F]">
                                  {msg.text.slice(
                                    currentCharIndex,
                                    currentCharIndex + (currentWordLength || 4)
                                  )}
                                </span>
                              </span>
                              <span className="text-[#F4F5F7]">
                                {msg.text.slice(
                                    currentCharIndex + (currentWordLength || 4)
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#F4F5F7]">{msg.text}</span>
                          )}
                        </div>

                        {/* Code snippet block matching Screenshot 3 */}
                        {msg.codeSnippet && (
                          <div className="bg-[#080A0D] border border-[#292F36] rounded-xl p-4 font-mono text-xs sm:text-sm text-[#FF8247] overflow-x-auto shadow-inner">
                            <pre className="whitespace-pre">{msg.codeSnippet}</pre>
                          </div>
                        )}
                      </div>

                      {/* Action Pills Row matching Screenshot 3 */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 mt-3">
                          {msg.suggestedActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(action)}
                              className="px-4 py-2 rounded-lg bg-[#151A20] hover:bg-[#1B222A] border border-[#292F36] hover:border-[#FF681F]/60 text-[11px] font-bold uppercase tracking-wider text-[#F4F5F7] transition-all active:scale-95 shadow-sm"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Related concepts pills */}
                      {msg.relatedConcepts && msg.relatedConcepts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#9299A3]">
                          <span className="text-[10px] uppercase font-bold text-[#9299A3]">
                            Related:
                          </span>
                          {msg.relatedConcepts.map((concept, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(`Can you explain ${concept}?`)}
                              className="px-2.5 py-1 rounded-md bg-[#101419] border border-[#292F36] hover:border-[#FF681F] hover:text-[#FF681F] transition-colors text-xs"
                            >
                              {concept}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="flex flex-col items-start max-w-xl">
                <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5 shadow-xl space-y-2 animate-pulse">
                  <div className="text-[11px] font-bold uppercase text-[#FF681F]">
                    AGARAM / THINKING...
                  </div>
                  <div className="h-4 bg-[#292F36] rounded w-3/4" />
                  <div className="h-4 bg-[#292F36] rounded w-1/2" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* PINNED BOTTOM CHAT MESSAGE COMPOSER (Requirement 4: Sticky/Pinned at bottom, multiline, attachments) */}
          <div className="shrink-0 sticky bottom-0 bg-[#080A0D]/95 backdrop-blur-md border-t border-[#292F36] p-3 sm:p-5 z-20">
            <div className="max-w-4xl mx-auto space-y-2">
              {/* Staged Attachments Tray (Requirement 6) */}
              {stagedAttachments.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {stagedAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-[#151A20] border border-[#FF681F]/50 rounded-xl px-3 py-1.5 shrink-0 text-xs shadow-md animate-in fade-in"
                    >
                      {(att.mimeType || att.fileType || '').startsWith('image/') ? (
                        <img
                          src={att.dataUrl}
                          alt={att.fileName || att.name || 'attachment'}
                          className="w-8 h-8 rounded object-cover border border-[#292F36]"
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-[#FF681F]" />
                      )}
                      <div className="max-w-[140px] truncate">
                        <div className="font-semibold text-white truncate text-[11px]">
                          {att.fileName || att.name}
                        </div>
                        <div className="text-[10px] text-[#9299A3]">
                          {att.fileSizeFormatted || formatFileSize(att.size)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStagedAttachment(idx)}
                        className="p-1 hover:text-red-400 text-[#9299A3] transition-colors"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Composer Controls & Input */}
              <div className="flex items-end space-x-2 sm:space-x-3">
                {/* File Attachment Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => handleFilesSelected(e.target.files)}
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image (diagram, problem photo) or PDF notes"
                  className="w-11 h-11 rounded-xl bg-[#151A20] border border-[#292F36] hover:border-[#FF681F] text-[#9299A3] hover:text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Speech-to-text Mic button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  title={isListening ? 'Listening... click to stop' : 'Speak your question'}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                    isListening
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                      : 'bg-[#151A20] border-[#292F36] text-[#9299A3] hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Multiline Textarea Input (Requirement 4) */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question, or upload an image or PDF... (Shift+Enter for newline)"
                    className="w-full bg-[#151A20] border border-[#292F36] focus:border-[#FF681F] rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder-[#9299A3] focus:outline-none transition-colors resize-none leading-relaxed"
                    style={{ minHeight: '44px', maxHeight: '140px' }}
                  />
                </div>

                {/* Orange square send button matching Screenshot 3 */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={(!inputText.trim() && stagedAttachments.length === 0) || isLoading}
                  className="w-11 h-11 rounded-xl bg-[#FF681F] hover:bg-[#FF8247] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-[#FF681F]/30 active:scale-95 shrink-0"
                  aria-label="Send question"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>

              {/* Helper text */}
              <div className="flex items-center justify-between text-[11px] text-[#9299A3] px-1">
                <span>Enter to send • Shift+Enter for new line • Drag & drop images/PDFs</span>
                <span className="hidden sm:inline">Multimodal Gemini AI Vision & Document Parsing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONVERSATION CONFIRMATION MODAL */}
      {deleteModalConvId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Conversation?</h3>
            </div>
            <p className="text-xs text-[#9299A3] leading-relaxed">
              Are you sure you want to delete this chat conversation? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteModalConvId(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#9299A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteModalConvId)}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImageModal}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-[#292F36] shadow-2xl"
            />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#FF681F] text-sm font-semibold flex items-center space-x-1"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
