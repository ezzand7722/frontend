import React, { useEffect, useState } from 'react';

/**
 * AttackNotification
 *
 * A non-blocking toast popup that appears in the bottom-right corner whenever a
 * new attack is detected. It shows the key details (IP, type, severity, location)
 * and has an X button so the user can dismiss it. It also auto-dismisses after
 * 12 seconds if not closed manually.
 *
 * Props:
 *   attack   – the attack card object (same shape used by the rest of the UI)
 *   onClose  – called when the X is clicked or the timer expires
 */
const SEVERITY_COLORS = {
  EXTREME: { border: '#ff0040', bg: 'rgba(255,0,64,0.12)', badge: '#ff0040', text: '#ff4466' },
  HIGH:    { border: '#ff6b35', bg: 'rgba(255,107,53,0.12)', badge: '#ff6b35', text: '#ff8c5a' },
  MEDIUM:  { border: '#ffd700', bg: 'rgba(255,215,0,0.10)', badge: '#ffd700', text: '#ffd700' },
  LOW:     { border: '#00ff41', bg: 'rgba(0,255,65,0.08)',  badge: '#00ff41', text: '#00ff41' },
  MISSING: { border: '#00d4ff', bg: 'rgba(0,212,255,0.08)', badge: '#00d4ff', text: '#00d4ff' },
};

const AUTO_DISMISS_MS = 12000;

export default function AttackNotification({ attack, onClose }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const colors = SEVERITY_COLORS[attack?.severity] || SEVERITY_COLORS.MISSING;
  const ip        = attack?.ip || attack?.src_ip || 'UNKNOWN';
  const type      = attack?.type || 'UNKNOWN';
  const severity  = attack?.severity || 'UNKNOWN';
  const location  = attack?.location || 'Unknown Location';
  const connCount = attack?.connection_count ?? '—';
  const failCount = attack?.failed_count ?? '—';
  const succCount = attack?.success_count ?? '—';

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Progress bar drain + auto-dismiss
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return prev - (100 / (AUTO_DISMISS_MS / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        width: '360px',
        background: '#0d1b2a',
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        boxShadow: `0 0 24px ${colors.border}66, 0 4px 24px rgba(0,0,0,0.7)`,
        overflow: 'hidden',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: colors.bg,
        borderBottom: `1px solid ${colors.border}44`,
        padding: '10px 14px 8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Pulsing dot */}
          <span style={{
            display: 'inline-block',
            width: '10px', height: '10px',
            borderRadius: '50%',
            background: colors.badge,
            boxShadow: `0 0 8px ${colors.badge}`,
            animation: 'pulse-dot 1s infinite',
          }} />
          <span style={{ color: colors.text, fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
            ⚠ ATTACK DETECTED
          </span>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close notification"
          style={{
            background: 'none',
            border: 'none',
            color: '#ccd6dd',
            fontSize: '18px',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '2px 4px',
            borderRadius: '4px',
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#ccd6dd'; e.currentTarget.style.background = 'none'; }}
        >
          ✕
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px 10px' }}>
        {/* IP + Severity badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            {ip}
          </span>
          <span style={{
            background: colors.badge,
            color: '#0d1b2a',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '3px 10px',
            borderRadius: '3px',
            letterSpacing: '1px',
          }}>
            {severity}
          </span>
        </div>

        {/* Type + Location */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(0,212,255,0.12)',
            border: '1px solid #00d4ff44',
            color: '#00d4ff',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '3px 9px',
            borderRadius: '3px',
            letterSpacing: '0.8px',
          }}>
            {type}
          </span>
          <span style={{ color: '#ccd6dd', fontSize: '11px', alignSelf: 'center' }}>
            📍 {location}
          </span>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: '6px',
          borderTop: '1px solid #ffffff10',
          paddingTop: '8px',
        }}>
          {[
            { label: 'CONN', value: connCount },
            { label: 'FAIL', value: failCount },
            { label: 'SUCC', value: succCount },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1,
              background: '#112b45',
              borderRadius: '4px',
              padding: '5px 6px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ccd6dd', fontSize: '9px', letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
              <div style={{ color: colors.text, fontSize: '15px', fontWeight: 'bold' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Auto-dismiss progress bar ─────────────────────────────────────── */}
      <div style={{ height: '3px', background: '#112b45', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: `${progress}%`, height: '100%',
          background: colors.border,
          transition: 'width 0.1s linear',
        }} />
      </div>

      {/* Inline keyframe for the pulsing dot */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
