import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, StopCircle, RefreshCw, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const InterviewPage = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello! I'm your AI interviewer today. We'll be focusing on React and frontend development. Are you ready to begin?" }
    ]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const messagesEndRef = useRef(null);

    const questions = [
        "Great. Let's start with a basic question. Can you explain the difference between state and props in React?",
        "How would you handle side effects in a functional component?",
        "Explain the Virtual DOM and how it improves performance.",
        "What are React Hooks? Name a few common ones."
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        // Add user message
        const newMessages = [
            ...messages,
            { id: Date.now(), sender: 'user', text: inputText }
        ];
        setMessages(newMessages);
        setInputText('');

        // Simulate AI thinking and response
        setTimeout(() => {
            if (currentQuestionIndex < questions.length) {
                setMessages(prev => [
                    ...prev,
                    { id: Date.now() + 1, sender: 'ai', text: questions[currentQuestionIndex] }
                ]);
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setMessages(prev => [
                    ...prev,
                    { id: Date.now() + 1, sender: 'ai', text: "That concludes our interview. Thank you! Your report is being generated." }
                ]);
            }
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col max-w-4xl mx-auto">
            {/* Header / Info */}
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center mb-4 rounded-t-xl shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Frontend Developer Interview</h2>
                    <p className="text-sm text-gray-500">Topic: React.js & Web Fundamentals</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">Time Remaining</div>
                        <div className="text-lg font-bold text-indigo-600">24:50</div>
                    </div>
                    <Button variant="danger" size="sm" className="gap-2">
                        <StopCircle className="h-4 w-4" /> End Interview
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                                }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200 rounded-b-xl shadow-sm">
                <div className="flex gap-4">
                    <button
                        className={`p-3 rounded-full transition-colors ${isRecording
                                ? 'bg-red-100 text-red-600 animate-pulse'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        onClick={() => setIsRecording(!isRecording)}
                        title="Voice Input (Demo)"
                    >
                        <Mic className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your answer here..."
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none py-3"
                            rows={1}
                        />
                    </div>
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className="px-6"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                    Pro tip: Speak naturally or type explicitly. AI evaluates both content and clarity.
                </p>
            </div>
        </div>
    );
};

export default InterviewPage;
