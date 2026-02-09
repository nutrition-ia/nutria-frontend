'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      console.log('Login result:', result);

      if (result.error) {
        setError(result.error.message || 'Email ou senha inválidos. Tente novamente.');
        setLoading(false);
        return;
      }

      // Força reload completo para garantir que a sessão seja carregada
      window.location.href = '/chat';
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Email ou senha inválidos. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nutria-creme">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-nutria-verde flex items-center justify-center">
            <span className="text-3xl">🥗</span>
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nutria-bordo mb-2">
            nutri.a
          </h1>
          <p className="text-nutria-bordo/70">
            Entre para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-nutria-bordo">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              className="border-nutria-verde/30 focus:border-nutria-verde"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-nutria-bordo">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="border-nutria-verde/30 focus:border-nutria-verde"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-nutria-vermelho/10 border border-nutria-vermelho/20">
              <p className="text-sm text-nutria-vermelho">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-nutria-verde hover:bg-nutria-verde/90 text-white"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Link para registro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-nutria-bordo/70">
            Ainda não tem conta?{' '}
            <Link
              href="/register"
              className="text-nutria-verde hover:underline font-medium"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
