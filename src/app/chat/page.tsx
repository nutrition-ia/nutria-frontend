'use client';

import '@/app/globals.css';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DefaultChatTransport, ToolUIPart, FileUIPart } from 'ai';
import { useChat } from '@ai-sdk/react';
import { ImageIcon, Paperclip, Camera, ArrowRight } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';

import { Message, MessageContent, MessageResponse, MessageAttachment, MessageAttachments } from '@/components/ai-elements/message';

import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

// Cards de sugestão da tela inicial
const suggestionCards = [
  {
    icon: '🍳',
    title: 'Receitas saudáveis',
    description: 'Encontre receitas nutritivas e deliciosas para seu dia a dia',
  },
  {
    icon: '📊',
    title: 'Análise nutricional',
    description: 'Descubra informações nutricionais dos seus alimentos',
  },
  {
    icon: '🎯',
    title: 'Planeje suas metas',
    description: 'Crie um plano alimentar personalizado para seus objetivos',
  },
];

function Chat() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [input, setInput] = useState<string>('');
  const [attachments, setAttachments] = useState<FileUIPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      headers: () => {
        // Envia user_id no header para o backend identificar o usuário
        const headers: Record<string, string> = {};
        if (session?.user?.id) {
          headers['X-User-Id'] = session.user.id;
          headers['X-User-Email'] = session.user.email || '';
        }
        return headers;
      },
    }),
  });

  // Verifica autenticação apenas uma vez após carregamento
  useEffect(() => {
    if (!isPending && !session && redirectAttempts === 0) {
      console.log('Sem sessão, redirecionando para login...');
      setRedirectAttempts(1);
      // Usa timeout para evitar loop
      setTimeout(() => {
        router.push('/login');
      }, 100);
    }
  }, [session, isPending, router, redirectAttempts]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            type: 'file',
            url: dataUrl,
            mediaType: file.type,
            filename: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!input.trim() && attachments.length === 0) return;

    sendMessage({
      text: input || 'Analise esta imagem e identifique os alimentos com suas calorias.',
      files: attachments.map((att) => ({
        type: 'file' as const,
        url: att.url,
        mediaType: att.mediaType,
        filename: att.filename,
      })),
    });
    setInput('');
    setAttachments([]);
  };

  const handleNewConversation = () => {
    // Implementar lógica de nova conversa (limpar histórico, etc)
    window.location.reload();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  // Debug: log do estado da sessão
  useEffect(() => {
    console.log('Estado da sessão:', { isPending, hasSession: !!session, session });
  }, [isPending, session]);

  // Mostrar loading enquanto verifica autenticação
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-nutria-creme">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-nutria-verde flex items-center justify-center animate-pulse">
            <span className="text-3xl">🥗</span>
          </div>
          <div className="text-nutria-bordo">Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  // Não renderizar se não estiver autenticado (será redirecionado)
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-nutria-creme">
        <div className="flex flex-col items-center gap-4">
          <div className="text-nutria-bordo">Redirecionando para login...</div>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen bg-nutria-creme">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header onNewConversation={handleNewConversation} />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hasMessages ? (
            // Tela inicial (sem mensagens)
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
              {/* Logo e mensagem de boas-vindas */}
              <div className="mb-12 text-center">
                <div className="w-24 h-24 rounded-3xl bg-nutria-verde flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">🥗</span>
                </div>
                <h1 className="text-3xl font-bold text-nutria-bordo mb-3">
                  Olá! Como posso ajudar com sua nutrição?
                </h1>
                <p className="text-nutria-bordo/70 max-w-2xl mx-auto">
                  Sou seu assistente especializado em nutrição e bem-estar. Posso
                  ajudar com receitas saudáveis, planejamento de refeições,
                  informações nutricionais e muito mais.
                </p>
              </div>

              {/* Cards de sugestão */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
                {suggestionCards.map((card, index) => (
                  <Card
                    key={index}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white border-nutria-verde/20"
                    onClick={() => handleSuggestionClick(card.description)}
                  >
                    <div className="text-3xl mb-3">{card.icon}</div>
                    <h3 className="font-semibold text-nutria-bordo mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-nutria-bordo/70">
                      {card.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Área de conversa (com mensagens)
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <Conversation className="h-full">
                  <ConversationContent>
                    {messages.map((message) => (
                      <div key={message.id}>
                        {message.parts?.map((part, i) => {
                          if (part.type === 'file') {
                            return (
                              <Message key={`${message.id}-${i}`} from={message.role}>
                                <MessageAttachments>
                                  <MessageAttachment data={part as FileUIPart} />
                                </MessageAttachments>
                              </Message>
                            );
                          }

                          if (part.type === 'text') {
                            return (
                              <Message
                                key={`${message.id}-${i}`}
                                from={message.role}
                              >
                                <MessageContent>
                                  <MessageResponse>{part.text}</MessageResponse>
                                </MessageContent>
                              </Message>
                            );
                          }

                          if (part.type?.startsWith('tool-')) {
                            return (
                              <Tool key={`${message.id}-${i}`}>
                                <ToolHeader
                                  type={(part as ToolUIPart).type}
                                  state={(part as ToolUIPart).state || 'output-available'}
                                  className="cursor-pointer"
                                />
                                <ToolContent>
                                  <ToolInput input={(part as ToolUIPart).input || {}} />
                                  <ToolOutput
                                    output={(part as ToolUIPart).output}
                                    errorText={(part as ToolUIPart).errorText}
                                  />
                                </ToolContent>
                              </Tool>
                            );
                          }

                          return null;
                        })}
                      </div>
                    ))}
                    <ConversationScrollButton />
                  </ConversationContent>
                </Conversation>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-nutria-creme">
            <div className="max-w-4xl mx-auto">
              {/* Botões de anexo */}
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status === 'streaming'}
                  className="border-nutria-verde/30 text-nutria-bordo hover:bg-white"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Anexar arquivo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status === 'streaming'}
                  className="border-nutria-verde/30 text-nutria-bordo hover:bg-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Tirar foto
                </Button>
              </div>

              {/* Input de mensagem */}
              <div className="relative">
                <PromptInput
                  onSubmit={handleSubmit}
                  className="border-2 border-nutria-verde/30 rounded-2xl bg-white shadow-sm"
                >
                  {attachments.length > 0 && (
                    <MessageAttachments className="p-3 pb-0">
                      {attachments.map((file, index) => (
                        <MessageAttachment
                          key={`${file.filename}-${index}`}
                          data={file}
                          onRemove={() => removeAttachment(index)}
                        />
                      ))}
                    </MessageAttachments>
                  )}
                  <PromptInputBody className="pr-12">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <PromptInputTextarea
                      onChange={(e) => setInput(e.target.value)}
                      className="md:leading-10"
                      value={input}
                      placeholder="Digite sua mensagem sobre nutrição, receitas ou alimentação..."
                      disabled={status === 'streaming'}
                    />
                    <Button
                      type="submit"
                      disabled={status === 'streaming' || (!input.trim() && attachments.length === 0)}
                      className="absolute right-3 bottom-3 bg-nutria-verde hover:bg-nutria-verde/90 text-white rounded-xl px-4"
                    >
                      Enviar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </PromptInputBody>
                </PromptInput>
              </div>

              {/* Dica */}
              <p className="text-xs text-nutria-bordo/50 text-center mt-3">
                Dica: Você pode enviar fotos de alimentos para análise nutricional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;