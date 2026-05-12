import { useState } from 'react';
import { sendMagicLink } from '../lib/db';

export default function Auth() {
  const [email, setEmail]   = useState('');
  const [sent,  setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error } = await sendMagicLink(email.trim());
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
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
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>

        {/* Logo */}
        <p style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em',
          color: '#1C1917', marginBottom: 8,
        }}>
          Habits.
        </p>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 13, color: '#A8A29E', marginBottom: 40,
        }}>
          Ton suivi d'habitudes personnel
        </p>

        {sent ? (
          /* Confirmation */
          <div style={{
            background: '#fff', border: '1.5px solid #E5E2DC',
            borderRadius: 12, padding: '28px 24px',
          }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📬</div>
            <p style={{
              fontFamily: 'Fraunces, serif', fontWeight: 700,
              fontSize: 20, color: '#1C1917', marginBottom: 8,
            }}>
              Vérifie ta boîte mail
            </p>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13, color: '#57534E', lineHeight: 1.6,
            }}>
              Un lien de connexion a été envoyé à<br />
              <strong>{email}</strong>
            </p>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 12, color: '#A8A29E', marginTop: 16,
            }}>
              Clique sur le lien depuis n'importe quel appareil.
            </p>
            <button
              onClick={() => setSent(false)}
              style={{
                marginTop: 20, background: 'none', border: 'none',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13, color: '#B45309', cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ← Utiliser un autre email
            </button>
          </div>
        ) : (
          /* Login form */
          <div style={{
            background: '#fff', border: '1.5px solid #E5E2DC',
            borderRadius: 12, padding: '28px 24px',
          }}>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700, fontSize: 15, color: '#1C1917', marginBottom: 20,
            }}>
              Connexion sans mot de passe
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                style={{
                  width: '100%', padding: '11px 14px',
                  background: '#F5F2EE', border: '1.5px solid #E5E2DC',
                  borderRadius: 7, color: '#1C1917',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 14,
                  outline: 'none', textAlign: 'center',
                }}
                onFocus={e => e.target.style.borderColor = '#B45309'}
                onBlur={e => e.target.style.borderColor = '#E5E2DC'}
              />
              {error && (
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#DC2626' }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px', borderRadius: 7, border: 'none',
                  background: loading ? '#A8A29E' : '#B45309',
                  color: '#fff', fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700, fontSize: 14, cursor: loading ? 'default' : 'pointer',
                  transition: 'background 0.18s',
                }}
              >
                {loading ? 'Envoi...' : '✉️ Envoyer le lien magique'}
              </button>
            </form>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11, color: '#A8A29E', marginTop: 16, lineHeight: 1.6,
            }}>
              Pas de mot de passe. Tu reçois un lien par email,<br />
              tu cliques, tu es connecté sur tous tes appareils.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
