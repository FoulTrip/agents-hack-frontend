'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { AuthLayout, AuthInput, AuthButton, AuthDivider, AuthError, GoogleIcon } from '@/components/auth';

export default function SigninPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      }) as any;

      if (result?.error) {
        setError('Credenciales inválidas. Por favor intenta de nuevo.');
      } else {
        window.location.href = '/';
      }
    } catch {
      setError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Software Factory" subtitle="Inicia sesión en tu espacio de trabajo">
      <div className="space-y-4">
        <AuthButton onClick={() => signIn('google', { callbackUrl: '/' })} variant="secondary">
          <GoogleIcon className="w-4.5 h-4.5" />
          Continuar con Google
        </AuthButton>

        <AuthDivider text="o también" />

        {!showEmailForm ? (
          <AuthButton onClick={() => setShowEmailForm(true)} variant="secondary" icon={Mail}>
            Usar correo electrónico
          </AuthButton>
        ) : (
          <form onSubmit={handleCredentialsLogin} className="space-y-3">
            <AuthInput
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={Mail}
              required
            />
            <AuthInput
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            {error && <AuthError message={error} />}

            <AuthButton type="submit" loading={loading} icon={LogIn}>
              {loading ? 'Entrando...' : 'Entrar ahora'}
            </AuthButton>

            <button
              type="button"
              onClick={() => { setShowEmailForm(false); setError(''); }}
              className="
                w-full text-center text-[11px] text-[#B0B0A8] dark:text-[#4A4A44]
                hover:text-[#5C5C56] dark:hover:text-[#8B8B85]
                transition-colors duration-150
              "
            >
              Volver a opciones de acceso
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-[12px] text-[#B0B0A8] dark:text-[#4A4A44]">
        ¿No tienes cuenta?{' '}
        <a
          href="/auth/signup"
          className="text-[#4F9CF9] hover:text-[#3D8EE8] transition-colors duration-150 font-medium"
        >
          Crea una aquí
        </a>
      </p>
    </AuthLayout>
  );
}