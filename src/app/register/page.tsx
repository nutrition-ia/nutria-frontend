'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      console.log('Register result:', result);

      if (result.error) {
        const errorMsg = result.error.message || '';
        if (errorMsg.includes('already exists') || errorMsg.includes('exist')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else {
          setError(errorMsg || 'Erro ao criar conta. Tente novamente.');
        }
        setLoading(false);
        return;
      }

      // Força reload completo para garantir que a sessão seja carregada
      window.location.href = '/chat';
    } catch (err: any) {
      console.error('Erro no registro:', err);
      if (err.message?.includes('already exists') || err.message?.includes('exist')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      }
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
            Crie sua conta
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-nutria-bordo">
              Nome completo
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              disabled={loading}
              className="border-nutria-verde/30 focus:border-nutria-verde"
            />
          </div>

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
              placeholder="Mínimo 8 caracteres"
              required
              disabled={loading}
              className="border-nutria-verde/30 focus:border-nutria-verde"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-nutria-bordo">
              Confirmar senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        {/* Link para login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-nutria-bordo/70">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-nutria-verde hover:underline font-medium"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
