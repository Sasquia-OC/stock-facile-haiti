import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Mic, MicOff, Loader2, Bot, User, Calendar } from "lucide-react";
import { Product, Sale } from "@/types/product";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

type Msg = { role: "user" | "assistant"; content: string };

interface AiChatPanelProps {
  products: Product[];
  sales: Sale[];
  language: "fr" | "ht";
  t: (key: string) => string;
}

export function AiChatPanel({ products, sales, language, t }: AiChatPanelProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyDates, setHistoryDates] = useState<{ id: string; chat_date: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load or create today's conversation when panel opens
  useEffect(() => {
    if (!open || !user) return;
    loadTodayConversation();
  }, [open, user]);

  const loadTodayConversation = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    // Try to find today's conversation
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("chat_date", today)
      .maybeSingle();

    if (existing) {
      setConversationId(existing.id);
      // Load messages
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", existing.id)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs as Msg[]);
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, chat_date: today } as any)
        .select("id")
        .single();
      if (newConv) {
        setConversationId(newConv.id);
        setMessages([]);
      }
    }
  };

  const loadHistoryDates = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("id, chat_date")
      .eq("user_id", user.id)
      .order("chat_date", { ascending: false })
      .limit(30);
    if (data) setHistoryDates(data as any);
    setShowHistory(true);
  };

  const loadConversation = async (convId: string) => {
    setConversationId(convId);
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (msgs) setMessages(msgs as Msg[]);
    setShowHistory(false);
  };

  const saveMessage = async (role: string, content: string) => {
    if (!conversationId || !user) return;
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role,
      content,
    } as any);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error(t("auth_error"));
      return;
    }

    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: allMessages, products, sales, language }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Erreur" }));
      throw new Error(err.error || "Erreur du service IA");
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error("No stream");
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            content += delta;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
              }
              return [...prev, { role: "assistant", content }];
            });
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Final flush
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw || !raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            content += delta;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
              }
              return [...prev, { role: "assistant", content }];
            });
          }
        } catch { /* ignore */ }
      }
    }

    // Save assistant message to DB
    if (content) await saveMessage("assistant", content);
  }, [products, sales, language, t, conversationId, user]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Msg = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Save user message to DB
    await saveMessage("user", messageText);

    try {
      await streamChat(updatedMessages);
    } catch (e: any) {
      toast.error(e.message || "Erreur");
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API for voice input
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(language === "ht" ? "Aparèy ou pa sipòte rekonesans vwa" : "Votre appareil ne supporte pas la reconnaissance vocale");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "ht" ? "ht-HT" : "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) sendMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error(language === "ht" ? "Erè rekonesans vwa" : "Erreur de reconnaissance vocale");
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col sm:inset-auto sm:bottom-20 sm:right-4 sm:w-96 sm:h-[32rem] sm:rounded-2xl sm:border sm:shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground sm:rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-bold text-sm">
            {language === "ht" ? "Asistan IA" : "Assistant IA"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={loadHistoryDates}>
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => { setOpen(false); setShowHistory(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* History View */}
      {showHistory ? (
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => { setShowHistory(false); loadTodayConversation(); }}>
              {language === "ht" ? "Retounen jodi a" : "Retour à aujourd'hui"}
            </Button>
            {historyDates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {language === "ht" ? "Pa gen istorik" : "Aucun historique"}
              </p>
            )}
            {historyDates.map((conv) => (
              <button
                key={conv.id}
                className="w-full text-left px-4 py-3 rounded-xl border bg-card hover:bg-accent transition-colors"
                onClick={() => loadConversation(conv.id)}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {new Date(conv.chat_date + "T00:00:00").toLocaleDateString(language === "ht" ? "fr-HT" : "fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-12 space-y-2">
                <Bot className="h-10 w-10 mx-auto text-primary/40" />
                <p>{language === "ht" ? "Kijan mwen ka ede ou jodi a?" : "Comment puis-je vous aider ?"}</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {[
                    language === "ht" ? "Ki pwodwi ki pi rentab?" : "Quel produit est le plus rentable ?",
                    language === "ht" ? "Ki pwodwi mwen dwe kòmande?" : "Que dois-je commander ?",
                    language === "ht" ? "Kijan vant mwen ye?" : "Comment vont mes ventes ?",
                  ].map((q) => (
                    <button
                      key={q}
                      className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors text-left"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="shrink-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center mt-0.5">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="px-3 py-3 border-t bg-card sm:rounded-b-2xl">
            <div className="flex gap-2">
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className="shrink-0 h-10 w-10"
                onClick={toggleVoice}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={language === "ht" ? "Ekri mesaj ou..." : "Écrivez votre message..."}
                className="h-10 text-sm"
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="shrink-0 h-10 w-10"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isListening && (
              <p className="text-xs text-destructive text-center mt-2 animate-pulse">
                {language === "ht" ? "Ap koute..." : "Écoute en cours..."}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
