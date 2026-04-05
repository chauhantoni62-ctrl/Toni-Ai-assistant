import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Play, Settings, Cpu, Globe, Mic, MessageSquare, Send, Volume2, VolumeX, Terminal as ConsoleIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'toni', text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleCommand(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = async (text: string) => {
    if (!text.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setIsProcessing(true);

    try {
      const model = "gemini-3-flash-preview";
      const prompt = `You are Toni, a professional and helpful desktop AI assistant. 
      Keep your responses concise and helpful. 
      The user just said: "${text}"`;

      const result = await genAI.models.generateContent({
        model: model,
        contents: prompt,
      });

      const responseText = result.text || "I'm sorry, I couldn't process that.";
      setChatHistory(prev => [...prev, { role: 'toni', text: responseText }]);
      speak(responseText);
    } catch (error) {
      console.error("Gemini Error:", error);
      setChatHistory(prev => [...prev, { role: 'toni', text: "Error connecting to my brain. Check your API key." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  if (isDemoActive) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
        {/* Demo Header */}
        <header className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight">TONI WEB DEMO</h1>
              <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Active Session</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsDemoActive(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10"
            >
              Exit Demo
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <MessageSquare className="w-12 h-12 text-gray-600" />
              <p>Say "Hello" or click the mic to start.</p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Input Area */}
        <footer className="p-6 bg-black/50 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-3xl mx-auto flex gap-4 items-center">
            <button 
              onClick={toggleListening}
              className={`p-4 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              <Mic className="w-6 h-6" />
            </button>
            
            <div className="flex-1 relative">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (handleCommand(inputText), setInputText(""))}
                placeholder={isListening ? "Listening..." : "Type a command..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button 
                onClick={() => { handleCommand(inputText); setInputText(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
            Toni AI Web Interface • Powered by Gemini 3
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 animate-pulse">
            <Cpu className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Toni AI Assistant
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            A modular, offline-first desktop AI assistant built with Python. 
            Voice-controlled, extensible, and ready for Windows.
          </p>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setIsDemoActive(true)}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Play className="w-5 h-5" /> Launch Web Demo
            </button>
            <div className="flex items-center gap-2 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-sm text-gray-300">
              <Mic className="w-4 h-4 text-green-400" /> Wake Word: "Hey Toni"
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="mt-24 grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-400" /> Setup Instructions
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
                <div>
                  <h3 className="font-medium text-lg">Install Python</h3>
                  <p className="text-gray-400 text-sm">Download and install Python 3.10+ from python.org. Ensure "Add to PATH" is checked.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</div>
                <div>
                  <h3 className="font-medium text-lg">Download Code</h3>
                  <p className="text-gray-400 text-sm">Copy all `.py` files and `requirements.txt` from this project to a folder on your Windows laptop.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</div>
                <div>
                  <h3 className="font-medium text-lg">Install Dependencies</h3>
                  <div className="mt-2 p-3 bg-black rounded-lg border border-white/10 font-mono text-xs text-green-400">
                    pip install -r requirements.txt
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">4</div>
                <div>
                  <h3 className="font-medium text-lg">Run Toni</h3>
                  <div className="mt-2 p-3 bg-black rounded-lg border border-white/10 font-mono text-xs text-blue-400">
                    python main.py
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-8 space-y-6">
            <h2 className="text-2xl font-semibold">Core Capabilities</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <MessageSquare className="w-5 h-5" />, title: "Voice & Text", desc: "Dual interaction modes with offline TTS." },
                { icon: <Terminal className="w-5 h-5" />, title: "App Control", desc: "Open Notepad, VS Code, Chrome via voice." },
                { icon: <Globe className="w-5 h-5" />, title: "Web Search", desc: "Google, YouTube, and Wikipedia integration." },
                { icon: <Play className="w-5 h-5" />, title: "Automation", desc: "Trigger n8n webhooks for smart home control." },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Future Upgrades */}
        <div className="mt-24 p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Roadmap for Upgrades</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-blue-400 font-bold text-sm uppercase tracking-wider">Phase 1</div>
              <h4 className="font-semibold">LLM Integration</h4>
              <p className="text-sm text-gray-400">Replace rule-based NLP with OpenAI or Gemini API for natural conversations.</p>
            </div>
            <div className="space-y-2">
              <div className="text-purple-400 font-bold text-sm uppercase tracking-wider">Phase 2</div>
              <h4 className="font-semibold">Face Login</h4>
              <p className="text-sm text-gray-400">Use OpenCV to implement biometric login before the assistant activates.</p>
            </div>
            <div className="space-y-2">
              <div className="text-green-400 font-bold text-sm uppercase tracking-wider">Phase 3</div>
              <h4 className="font-semibold">Background Mode</h4>
              <p className="text-sm text-gray-400">Minimize to System Tray and use global hotkeys for instant access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
