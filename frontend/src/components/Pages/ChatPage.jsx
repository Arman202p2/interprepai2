import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  Trash2,
  Copy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { useAppContext } from "../../App";

const ChatPage = () => {
  const { currentUser, API } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    {
      icon: <Lightbulb className="w-4 h-4" />,
      text: "Give me tips for technical interviews",
      prompt: "What are some essential tips for preparing for technical interviews at FAANG companies?"
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      text: "Explain system design concepts",
      prompt: "Can you explain the key concepts I should know for system design interviews?"
    },
    {
      icon: <Target className="w-4 h-4" />,
      text: "Help with behavioral questions",
      prompt: "How should I structure my answers for behavioral interview questions using the STAR method?"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: "Algorithm practice strategy",
      prompt: "What's the best strategy to practice algorithms and data structures for coding interviews?"
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: `Hello ${currentUser?.username}! 👋 I'm your AI interview preparation assistant. I can help you with:\n\n• Technical interview questions and explanations\n• System design concepts and patterns\n• Behavioral interview preparation\n• Algorithm and data structure guidance\n• Company-specific interview tips\n\nWhat would you like to explore today?`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ai/chat`, {
        user_id: currentUser.id,
        message: messageText,
        session_id: sessionId
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: `Chat cleared! How can I help you with your interview preparation today?`,
        timestamp: new Date().toISOString()
      }
    ]);
    toast.success("Chat history cleared");
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">AI Interview Assistant</h1>
        </div>
        <p className="text-lg text-slate-600">
          Get personalized help with your interview preparation
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          <Card className="border-0 shadow-lg flex-1 flex flex-col">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <Badge variant="outline" className="text-xs">Online</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="text-slate-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : message.isError
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <Bot className="w-5 h-5 mt-0.5 text-purple-600 flex-shrink-0" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-5 h-5 mt-0.5 text-blue-100 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${
                              message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {message.role === 'assistant' && !message.isError && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="h-6 px-2 text-slate-400 hover:text-slate-600"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-900 rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex space-x-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about interview preparation..."
                  className="flex-1 bg-white"
                  disabled={loading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={loading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:w-80 space-y-4">
          {/* Quick Prompts */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Popular questions to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => sendMessage(prompt.prompt)}
                  disabled={loading}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-purple-600 mt-0.5">
                      {prompt.icon}
                    </div>
                    <span className="text-sm">{prompt.text}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p>Ask specific questions for better answers</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>Mention your target company for tailored advice</p>
                </div>
                <div className="flex items-start space-x-2">
                  <BookOpen className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Request examples and practice problems</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Messages</span>
                <span className="font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Session ID</span>
                <span className="font-mono text-xs">{sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <Badge variant="outline" className="text-xs">
                  {loading ? "Typing..." : "Ready"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;