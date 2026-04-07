
-- Add capital_investi column to products table
ALTER TABLE public.products ADD COLUMN capital_investi numeric NOT NULL DEFAULT 0;

-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  chat_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, chat_date)
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
CREATE POLICY "Users can read own conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can read own messages" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
