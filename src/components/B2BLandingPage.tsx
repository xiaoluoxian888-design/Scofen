import React, { useState } from 'react';
import { User } from '../types/schema';
import { apiClient } from '../services/apiClient';

interface B2BLandingPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenLoginModal: () => void;
}

export const B2BLandingPage: React.FC<B2BLandingPageProps> = ({
  onLoginSuccess,
  onOpenLoginModal,
}) => {
  const [email, setEmail] = useState('');
  const [identity, setIdentity] = useState('');
  const [targetFee, setTargetFee] = useState('75');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !identity.trim()) {
      setErrorMessage('Please provide both professional email and curator identity.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const parts = identity.trim().split(' ');
      const firstName = parts[0] || 'Curator';
      const lastName = parts.slice(1).join(' ') || 'Lead';

      let user: User;
      try {
        user = await apiClient.login(email.trim());
      } catch {
        user = await apiClient.signup(
          firstName,
          lastName,
          email.trim(),
          `Host & A&R Curator for ${identity.trim()}. Standard Fee: $${targetFee}`
        );
      }

      const feeNum = parseFloat(targetFee) || 75;
      await apiClient.createBoard(user.id, `${identity.trim()} Screening Gateway`, feeNum, [
        { criterion_name: 'Production Quality', weight: 35 },
        { criterion_name: 'Sync Viability', weight: 30 },
        { criterion_name: 'Vocal Precision', weight: 20 },
        { criterion_name: 'Sonic Arrangement', weight: 15 },
      ]);

      onLoginSuccess(user);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gateway initialization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToGateway = () => {
    document.getElementById('gateway-intake')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        letterSpacing: '-0.02em',
      }}
      className="selection:bg-[#00ff87] selection:text-black"
    >
      {/* SECTION 1: THE HEADER NAVIGATION */}
      <header
        style={{
          borderBottom: '1px solid #1f1f1f',
          backgroundColor: '#000000',
        }}
        className="sticky top-0 z-50"
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left side: Plain-text typography reading SCOFEN */}
          <div style={{ color: '#f5f5f5', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
            SCOFEN
          </div>

          {/* Right side: The isolated Jade Green icon element. No messy menu bars or distracting social links. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onOpenLoginModal}
              title="Sign In to Existing Portal"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8c8c8c',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                letterSpacing: '-0.02em',
                padding: '0.25rem 0.5rem',
              }}
              className="hover:text-white transition-colors"
            >
              Sign In
            </button>
            <div
              onClick={scrollToGateway}
              title="SCOFEN Protocol Visual Anchor"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00ff87"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2: THE HERO CORE PITCH */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '6rem 1.5rem 5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: '#f5f5f5',
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 auto',
            maxWidth: '820px',
          }}
        >
          Turn Unmonetized Demo Labor Into An Un-gameable Revenue Stream.
        </h1>

        <p
          style={{
            color: '#8c8c8c',
            fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
            lineHeight: 1.6,
            marginTop: '1.75rem',
            marginRight: 'auto',
            marginLeft: 'auto',
            maxWidth: '720px',
          }}
        >
          Stop reviewing unsolicited submissions for free. SCOFEN replaces the traditional chaotic inbox with a text-only, sovereign A&R screening gateway. Set your criteria, assign your weights, and collect premium evaluation fees automatically.
        </p>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={scrollToGateway}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#000000',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '-0.02em',
              padding: '0.875rem 2.25rem',
              borderRadius: '0px',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            className="hover:opacity-90"
          >
            Initialize Your Gateway
          </button>
        </div>
      </section>

      {/* SECTION 3: THE LEVERAGED ECONOMICS (THE 30K ADVANTAGE) */}
      <section
        style={{
          borderTop: '1px solid #1f1f1f',
          borderBottom: '1px solid #1f1f1f',
          backgroundColor: '#0d0d0d',
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <h2
                style={{
                  color: '#f5f5f5',
                  fontSize: '2rem',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                Instant Operational Volume.
              </h2>
            </div>
            <div className="md:col-span-7">
              <p
                style={{
                  color: '#8c8c8c',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                We do not launch onto a blank canvas. When you deploy a pilot Board on SCOFEN, our platform dynamically routes an internal engine of 30,000 verified independent music creators straight into your active submission funnel, driving immediate transaction volume to your gateway from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '6rem 1.5rem 5rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              color: '#f5f5f5',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            How It Works
          </h2>
        </div>

        {/* Clean, grid-based, borders-only table explaining the 4-step backend logic */}
        <div
          style={{
            backgroundColor: '#1f1f1f',
            border: '1px solid #1f1f1f',
            gap: '1px',
          }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          {/* 01 / Absolute Autonomy */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              01 / Absolute Autonomy
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              You dictate the exact entry fee ($50–$100) and establish precise grading parameters (e.g., Production quality, Sync viability, Vocal tone).
            </p>
          </div>

          {/* 02 / Self-Friction Filtration */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              02 / Self-Friction Filtration
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              High financial barriers instantly force musician self-awareness, cutting out amateur noise before it reaches your dashboard.
            </p>
          </div>

          {/* 03 / Sole Evaluation Power */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              03 / Sole Evaluation Power
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              You score submissions strictly from 0-100 across your custom parameters. The backend serverless engine applies your exact criteria weights to calculate a definitive, un-manipulable final standing.
            </p>
          </div>

          {/* 04 / Automated Royalties Ledger Split */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              04 / Automated Royalties Ledger Split
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              The software executing the programmatic billing module structures and routes payouts automatically. The submission gate routes 70% of every entry transaction fee directly to your Host Pool instantly, while the platform retains 30%. When public users pay the $5.99/month streaming subscription to unlock full-length playback across the platform's independent discovery catalog, the accumulated pool is split systematically to yield ongoing streaming royalties for the hosted artists and curators.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem 6rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              color: '#f5f5f5',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        {/* Clean, grid-based, borders-only FAQ layout */}
        <div
          style={{
            backgroundColor: '#1f1f1f',
            border: '1px solid #1f1f1f',
            gap: '1px',
          }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          {/* FAQ 1 */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              Q: How does this solve my unmonetized demo mailbox overload?
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              A: By introducing a high-friction financial gate ($50–$100 entry fee), raw amateur noise is completely eliminated at the gate. You only spend cognitive bandwidth reviewing track submissions that are highly self-aware, while earning a guaranteed 70% split for your manual evaluation labor.
            </p>
          </div>

          {/* FAQ 2 */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              Q: Can third-party scrapers or tools trace my proprietary grading setup?
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              A: No. The application architecture runs entirely serverless and decoupled. BuiltWith and external tech-stack tools cannot detect the backend engine or reverse-engineer your custom criteria weights, keeping your operational identity completely sovereign and invisible.
            </p>
          </div>

          {/* FAQ 3 */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              Q: Why are there zero visuals, graphics, or artwork on the board profiles?
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              A: To enforce absolute objectivity. SCOFEN is a data-driven filtering protocol. Removing headshots and album artwork completely neutralizes implicit visual bias, ensuring music tracks are evaluated solely on spatial and technical merit.
            </p>
          </div>

          {/* FAQ 4 */}
          <div
            style={{
              backgroundColor: '#000000',
              padding: '2rem',
            }}
            className="flex flex-col justify-start"
          >
            <div
              style={{
                color: '#f5f5f5',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              Q: How do you guarantee immediate submission traffic for my pilot board?
            </div>
            <p style={{ color: '#8c8c8c', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              A: We dynamically inject a verified internal archive of 30,000 independent music creator leads straight into your active board funnel through a standardized plain-text invite network upon launch.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: THE INTAKE CAPTURE (THE FORM) */}
      <section
        id="gateway-intake"
        style={{
          borderTop: '1px solid #1f1f1f',
          backgroundColor: '#0d0d0d',
          padding: '6rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          {/* Minimalist input panel inside dark surface card */}
          <div
            style={{
              backgroundColor: '#141414',
              border: '1px solid #1f1f1f',
              padding: '2.5rem',
              borderRadius: '0px',
            }}
          >
            {errorMessage && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  color: '#ff6b6b',
                  fontSize: '0.8125rem',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                }}
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleIntakeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#8c8c8c',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem',
                  }}
                >
                  Professional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="curator@agency.com"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#000000',
                    border: '1px solid #1f1f1f',
                    color: '#f5f5f5',
                    fontSize: '0.875rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    letterSpacing: '-0.02em',
                  }}
                  className="focus:border-[#00ff87]"
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#8c8c8c',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem',
                  }}
                >
                  Company / Curator Identity
                </label>
                <input
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="Vanguard Audio Labs / Noir Publishing"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#000000',
                    border: '1px solid #1f1f1f',
                    color: '#f5f5f5',
                    fontSize: '0.875rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    letterSpacing: '-0.02em',
                  }}
                  className="focus:border-[#00ff87]"
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#8c8c8c',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem',
                  }}
                >
                  Target Evaluation Fee ($)
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={targetFee}
                  onChange={(e) => setTargetFee(e.target.value)}
                  placeholder="75"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#000000',
                    border: '1px solid #1f1f1f',
                    color: '#f5f5f5',
                    fontSize: '0.875rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    letterSpacing: '-0.02em',
                  }}
                  className="focus:border-[#00ff87]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#f5f5f5',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0px',
                  border: 'none',
                  letterSpacing: '-0.02em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'opacity 0.15s ease',
                  marginTop: '0.5rem',
                }}
                className="hover:opacity-90"
              >
                {isSubmitting ? 'Deploying...' : 'Deploy Board Configuration'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #1f1f1f', textAlign: 'center' }}>
              <button
                type="button"
                onClick={onOpenLoginModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8c8c8c',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  letterSpacing: '-0.02em',
                }}
                className="hover:text-white transition-colors"
              >
                Already have an account? Sign In →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid #1f1f1f',
          backgroundColor: '#000000',
          padding: '2rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#8c8c8c',
          }}
        >
          <div>SCOFEN Trust Protocol • High-Friction Music Curation</div>
          <div>70% Host Settlement • 30% Platform Treasury</div>
        </div>
      </footer>
    </div>
  );
};
