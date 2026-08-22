import React, { useEffect, useState } from 'react';
import { startContinuousAlarm, stopContinuousAlarm } from '../logic/SFXEngine';

/**
 * AttackNotification
 *
 * An emergency warning popup that appears in the bottom-right corner whenever a
 * new attack is detected.
 *
 * Audio & Behavior:
 *   - Starts a CONTINUOUS LOUD BEEP and repeating "DANGER! DANGER!" voice alert.
 *   - The alarm and popup will NOT stop until the user explicitly clicks the [✕] button.
 *   - Displays source IP, attack type, severity, location (Amman, Jordan), and stats.
 *
 * Props:
 *   attack   – the attack card object
 *   onClose  – called when the X is clicked
 */
const SEVERITY_COLORS = {
  EXTREME: { border: '#ff0040', bg: 'rgba(255,0,64,0.18)', badge: '#ff0040', text: '#ff3355', glow: 'rgba(255,0,64,0.7)' },
  HIGH:    { border: '#ff6b35', bg: 'rgba(255,107,53,0.18)', badge: '#ff6b35', text: '#ff7b47', glow: 'rgba(255,107,53,0.7)' },
  MEDIUM:  { border: '#ffd700', bg: 'rgba(255,215,0,0.15)', badge: '#ffd700', text: '#ffd700', glow: 'rgba(255,215,0,0.6)' },
  LOW:     { border: '#00ff41', bg: 'rgba(0,255,65,0.12)',  badge: '#00ff41', text: '#00ff41', glow: 'rgba(0,255,65,0.5)' },
  MISSING: { border: '#00d4ff', bg: 'rgba(0,212,255,0.12)', badge: '#00d4ff', text: '#00d4ff', glow: 'rgba(0,212,255,0.5)' },
};

export default function AttackNotification({ attack, onClose }) {
  const [visible, setVisible] = useState(false);

  const colors    = SEVERITY_COLORS[attack?.severity] || SEVERITY_COLORS.MISSING;
  const ip        = attack?.ip || attack?.src_ip || 'UNKNOWN';
  const type      = attack?.type || 'UNKNOWN';
  const severity  = attack?.severity || 'UNKNOWN';
  // Location explicitly Amman, Jordan
  const location  = attack?.location || attack?.loc || 'Amman, Jordan';
  const connCount = attack?.connection_count ?? '—';
  const failCount = attack?.failed_count ?? '—';
  const succCount = attack?.success_count ?? '—';

  // Mount: start continuous loud beep + Danger Danger voice loop
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      startContinuousAlarm("Danger! Danger! Attack detected!");
    }, 30);

    // Unmount cleanup: always guarantee sound stops if component unmounts
    return () => {
      clearTimeout(t);
      stopContinuousAlarm();
    };
  }, []);

  // Dismiss only when user clicks [✕]
  const handleClose = () => {
    stopContinuousAlarm();
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        width: '370px',
        background: '#0a1624',
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        boxShadow: `0 0 35px ${colors.glow}, 0 8px 32px rgba(0,0,0,0.85)`,
        overflow: 'hidden',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* ── Top emergency bar ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: colors.bg,
        borderBottom: `1px solid ${colors.border}66`,
        padding: '10px 14px 9px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Pulsing indicator */}
          <span style={{
            display: 'inline-block',
            width: '12px', height: '12px',
            borderRadius: '50%',
            background: colors.badge,
            boxShadow: `0 0 12px ${colors.badge}`,
            animation: 'pulse-dot 0.7s infinite alternate',
          }} />
          <span style={{
            color: colors.text,
            fontWeight: '900',
            fontSize: '13px',
            letterSpacing: '1.2px',
            textShadow: `0 0 8px ${colors.glow}`,
          }}>
            🚨 DANGER! ATTACK DETECTED
          </span>
        </div>

        {/* The X button to silence the alarm */}
        <button
          onClick={handleClose}
          aria-label="Silence alarm and close"
          title="Click to silence alarm"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${colors.border}88`,
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '5px 8px',
            borderRadius: '4px',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = colors.border;
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 12px' }}>
        {/* IP + Severity badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#ffffff', fontSize: '19px', fontWeight: '900', letterSpacing: '0.8px' }}>
            {ip}
          </span>
          <span style={{
            background: colors.badge,
            color: '#000000',
            fontSize: '11px',
            fontWeight: '900',
            padding: '3px 10px',
            borderRadius: '3px',
            letterSpacing: '1px',
            boxShadow: `0 0 10px ${colors.glow}`,
          }}>
            {severity}
          </span>
        </div>

        {/* Type + Location */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(0,212,255,0.15)',
            border: '1px solid #00d4ff55',
            color: '#00d4ff',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '3px 9px',
            borderRadius: '3px',
            letterSpacing: '0.8px',
          }}>
            {type}
          </span>
          <span style={{ color: '#00ff41', fontSize: '12px', alignSelf: 'center', fontWeight: 'bold' }}>
            📍 {location}
          </span>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderTop: '1px solid #ffffff15',
          paddingTop: '10px',
          marginBottom: '10px',
        }}>
          {[
            { label: 'CONNECTIONS', value: connCount },
            { label: 'FAILED', value: failCount },
            { label: 'SUCCESS', value: succCount },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1,
              background: '#0d2238',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px',
              padding: '6px 4px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#90a4ae', fontSize: '8.5px', letterSpacing: '0.8px', marginBottom: '2px' }}>{label}</div>
              <div style={{ color: colors.text, fontSize: '16px', fontWeight: '900' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Silence prompt instruction */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,0,64,0.12)',
          border: '1px dashed rgba(255,0,64,0.4)',
          borderRadius: '4px',
          padding: '6px 8px',
          fontSize: '10.5px',
          color: '#ff8899',
          fontWeight: 'bold',
          letterSpacing: '0.8px',
        }}>
          🔊 ALARM ACTIVE — PRESS [✕] TO SILENCE
        </div>
      </div>

      {/* Inline keyframe for the pulsating light */}
      <style>{`
        @keyframes pulse-dot {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0.3; transform: scale(0.6); }
        }
      `}</style>
    </div>
  );
}
