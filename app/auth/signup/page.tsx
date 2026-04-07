'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout, AuthInput, AuthButton, AuthDivider, AuthError, GoogleIcon } from '@/components/auth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch("/api/auth/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      if (data.success == false) throw new Error(data.error);

      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/',
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Únete a la fábrica de software automatizada">
      <div className="space-y-4">
        <AuthButton onClick={() => signIn('google', { callbackUrl: '/' })} variant="secondary">
          <GoogleIcon className="w-4.5 h-4.5" />
          Registrarse con Google
        </AuthButton>

        <AuthDivider text="o con tu email" />

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <AuthInput
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              icon={User}
              required
            />
            <AuthInput
              label="Email"
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
              placeholder="8+ caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={Lock}
              required
            />
          </div>

          {error && <AuthError message={error} />}

          <AuthButton type="submit" loading={loading}>
            {loading ? 'Procesando...' : 'Crear cuenta'}
          </AuthButton>
        </form>
      </div>

      <p className="text-center text-[12px] text-[#B0B0A8] dark:text-[#4A4A44]">
        ¿Ya tienes cuenta?{' '}
        <a
          href="/auth/signin"
          className="text-[#4F9CF9] hover:text-[#3D8EE8] transition-colors duration-150 font-medium"
        >
          Inicia sesión aquí
        </a>
      </p>
    </AuthLayout>
  );
}