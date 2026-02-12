'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  BookOpen,
  Target,
  Activity,
  TrendingUp,
  Settings,
  Menu,
  ClipboardList,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';

const menuItems = [
  {
    label: 'chat',
    icon: MessageSquare,
    href: '/chat',
  },
  {
    label: 'dietas',
    icon: ClipboardList,
    href: '/dietas',
  },
  {
    label: 'receitas',
    icon: BookOpen,
    href: '/receitas',
  },
  {
    label: 'metas',
    icon: Target,
    href: '/metas',
  },
  {
    label: 'atividades',
    icon: Activity,
    href: '/atividades',
  },
  {
    label: 'progresso',
    icon: TrendingUp,
    href: '/progresso',
  },
  {
    label: 'configurações',
    icon: Settings,
    href: '/configuracoes',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-[186px] h-screen bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-[72px] flex items-center justify-between px-4 border-b border-border">
        <Link href="/chat" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-nutria-verde flex items-center justify-center">
            <span className="text-lg">🥗</span>
          </div>
          <span className="font-bold text-nutria-bordo">nutri.a</span>
        </Link>
        <button className="p-1 hover:bg-muted rounded">
          <Menu className="w-5 h-5 text-nutria-bordo" />
        </button>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-nutria-verde/20 flex items-center justify-center">
              {session.user.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  alt={session.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-nutria-verde">
                  {session.user.name?.charAt(0).toUpperCase() || 'V'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-nutria-bordo truncate">
                {session.user.name || 'Usuário'}
              </p>
              <p className="text-xs text-nutria-bordo/60 capitalize">
                Plano {session.user.planType || 'free'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-nutria-verde/10 text-nutria-bordo font-medium'
                      : 'text-nutria-bordo/70 hover:bg-muted hover:text-nutria-bordo'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
