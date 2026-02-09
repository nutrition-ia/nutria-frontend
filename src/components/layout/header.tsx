'use client';

import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  onNewConversation?: () => void;
}

export function Header({
  title = 'Assistente de Nutrição',
  onNewConversation
}: HeaderProps) {
  return (
    <header className="h-[72px] border-b border-border bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-nutria-bordo">
        {title}
      </h1>

      {onNewConversation && (
        <Button
          onClick={onNewConversation}
          variant="outline"
          className="border-nutria-verde/30 text-nutria-bordo hover:bg-nutria-verde/5"
        >
          Nova conversa
        </Button>
      )}
    </header>
  );
}
