import { useState } from 'react';
import { signIn, signUp } from '../lib/db';

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: '#F5F2EE', border: '1.5px solid #E5E2DC',
  borderRadius: 7, color: '#1C1917',
  fontFamily: 'Space Grotesk, sans-serif', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};

export default function Auth() {
  const [mode, setMode]       = useState('login'); // 'login' | 'signup'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      setLoading(false);
      if (error) setError(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : error.message);
    } else {
      const { error } = await signUp(email.trim(), password);
      setLoading(false);
      if (error) {
        setError(error.message === 'User already registered'
          ? 'Ce compte existe déjà. Connecte-toi.'
          : error.message);
      } else {
        setSuccess('Compte créé ! Tu peux te connecter.');
        setMode('login');
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: '#FFFFFF',
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '28px 28px',
    }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

        {/* Logo */}
        <p style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em',
          color: '#1C1917', marginBottom: 6,
        }}>
          Habits.
        </p>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 13, color: '#A8A29E', marginBottom: 32,
        }}>
          Ton suivi d'habitudes personnel
        </p>

        {/* Card */}
        <div style={{
          background: '#fff', border: '1.5px solid #E5E2DC',
          borderRadius: 12, padding: '28px 24px', textAlign: 'left',
        }}>

          {/* Toggle */}
          <div style={{
            display: 'flex', marginBottom: 24,
            borderBottom: '1.5px solid #E5E2DC',
          }}>
            {[{ key: 'login', label: 'Connexion' }, { key: 'signup', label: 'Créer un compte' }].map(m => (
              <button key={m.key} onClick={() => { setMode(m.key); setError(''); setSuccess(''); }} style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13,
                color: mode === m.key ? '#B45309' : '#A8A29E',
                borderBottom: mode === m.key ? '2px solid #B45309' : '2px solid transparent',
                marginBottom: -1.5, cursor: 'pointer', transition: 'all 0.18s',
              }}>
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#57534E',
                display: 'block', marginBottom: 5,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#B45309'}
                onBlur={e => e.target.style.borderColor = '#E5E2DC'}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#57534E',
                display: 'block', marginBottom: 5,
              }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Minimum 6 caractères' : '••••••••'}
                required
                minLength={6}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#B45309'}
                onBlur={e => e.target.style.borderColor = '#E5E2DC'}
              />
            </div>

            {error && (
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 12,
                color: '#DC2626', background: 'rgba(220,38,38,0.06)',
                padding: '8px 12px', borderRadius: 6, margin: 0,
              }}>
                {error}
              </p>
            )}

            {success && (
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 12,
                color: '#15803D', background: 'rgba(21,128,61,0.06)',
                padding: '8px 12px', borderRadius: 6, margin: 0,
              }}>
                ✓ {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4, padding: '12px', borderRadius: 7, border: 'none',
                background: loading ? '#A8A29E' : '#B45309',
                color: '#fff', fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700, fontSize: 14, cursor: loading ? 'default' : 'pointer',
                transition: 'background 0.18s', width: '100%',
              }}
            >
              {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
