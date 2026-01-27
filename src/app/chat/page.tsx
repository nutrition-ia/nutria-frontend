'use client';

import '@/app/globals.css';
import { useState, useRef } from 'react';
import { DefaultChatTransport, ToolUIPart, FileUIPart } from 'ai';
import { useChat } from '@ai-sdk/react';
import { ImageIcon } from 'lucide-react';

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


function Chat() {
  const [input, setInput] = useState<string>('');
  const [attachments, setAttachments] = useState<FileUIPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

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

    // Limpa o input para permitir selecionar o mesmo arquivo novamente
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

  return (
    <div className="w-full p-6 relative size-full h-screen bg-nutria-creme">
      <div className="flex flex-col h-full max-w-3xl mx-auto">
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

        <PromptInput onSubmit={handleSubmit} className="mt-4 border-2 border-nutria-verde/30 rounded-2xl bg-white shadow-sm">
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
          <PromptInputBody>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={status === 'streaming'}
              className="shrink-0"
            >
              <ImageIcon className="size-5" />
              <span className="sr-only">Anexar imagem</span>
            </Button>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              className="md:leading-10"
              value={input}
              placeholder="Escreva sua mensagem ou envie uma foto..."
              disabled={status === 'streaming'}
            />
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}

export default Chat;