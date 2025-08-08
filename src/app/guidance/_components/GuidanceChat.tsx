"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import { getGuidance } from '@/app/actions';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function GuidanceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await getGuidance({ query: input });
      const botMessage: Message = { sender: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'bot', text: "Sorry, something went wrong. I can't provide guidance right now." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto flex flex-col h-[75vh] animate-slide-in-up">
      <CardContent className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-secondary">
              <Sparkles className="h-8 w-8" />
              <div>
                  <p className="p-3 rounded-lg bg-muted max-w-prose">
                      Welcome to the Guidance Hub! Ask me anything about hackathons, project ideas, career paths, or interview prep.
                  </p>
              </div>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <Bot className="h-8 w-8 text-primary" />}
              <div className={`p-3 rounded-lg max-w-prose ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <div
                    className="prose prose-sm text-foreground max-w-none"
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}
                />
              </div>
              {msg.sender === 'user' && <User className="h-8 w-8 text-secondary" />}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div className="p-3 rounded-lg bg-muted flex items-center">
                <Loader className="animate-spin h-5 w-5" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask for guidance..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
