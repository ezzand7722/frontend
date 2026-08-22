import React from 'react';
import LiveMap from './LiveMap';

/**
 * HistoryModule
 *
 * Displays the complete incident report and 3D globe for the current attack
 * directly, without showing a multi-attack grid.
 */
const HistoryModule = ({ historyList = [], activeAttack = null, onClearHistory }) => {
  // Directly target the current active attack or the latest recorded incident
  const currentAttack = activeAttack || (historyList && historyList.length > 0 ? historyList[0] : null);

  const titleText = currentAttack 
    ? `INCIDENT REPORT — ${currentAttack.date || currentAttack.timestamp || 'ACTIVE THREAT'}` 
    : "INCIDENT FORENSIC REPORT";

  const attackLoc = (currentAttack?.loc || currentAttack?.city || 'Amman, Jordan').toUpperCase();
  const attackIp  = currentAttack?.ip || currentAttack?.src_ip || 'UNKNOWN';
  const attackType = currentAttack?.attack_type || currentAttack?.type || 'Brute Force';
  const severity  = currentAttack?.severity || 'HIGH';

  return (
    <div className="history-module-container" style={{ 
      padding: '30px 40px', 
      color: '#00ff41', 
      fontFamily: 'monospace',
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden', 
      backgroundColor: '#020b02', 
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      
      <style>{`
        .blink-red { color: #ff0000 !important; animation: blink 0.5s infinite; font-weight: bold; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #00ff41; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
      `}</style>

      {/* Header */}
      <div className="screen-header" style={{ 
        borderBottom: '3px solid #00ff41', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingBottom: '14px',
        flexShrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '6px', 
            height: '32px', 
            background: '#00ff41', 
            marginRight: '16px', 
            boxShadow: '0 0 12px #00ff41',
            flexShrink: 0 
          }}></div>
          
          <h2 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '700', 
            letterSpacing: '5px', 
            lineHeight: '1',
            textTransform: 'uppercase'
          }}>
            {titleText}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {typeof onClearHistory === 'function' && (
            <button
              onClick={onClearHistory}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: '1px solid #00ff41',
                color: '#00ff41',
                fontWeight: '700',
                cursor: 'pointer',
                letterSpacing: '1.5px',
                transition: 'all 0.2s ease',
                fontSize: '11px',
                borderRadius: '2px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#00ff41';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#00ff41';
              }}
            >
              CLEAR_HISTORY
            </button>
          )}

          <span style={{ fontSize: '13px', color: '#00ff41', opacity: 0.8, letterSpacing: '1px' }}>
            ● INCIDENT FORENSIC VIEW
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="history-content-wrapper" style={{ 
        flex: 1, 
        minHeight: 0, 
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!currentAttack ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '15px',
            color: 'rgba(0,255,65,0.5)',
            fontSize: '16px',
            letterSpacing: '2px',
          }}>
            <div style={{ fontSize: '32px' }}>📡</div>
            <div>// NO_ACTIVE_INCIDENT_OR_RECORD_FOUND</div>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>AWAITING THREAT EVENT TELEMETRY FROM SENSORS</div>
          </div>
        ) : (
          <div className="split-layout" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1fr', 
            gap: '25px', 
            height: '100%', 
            minHeight: 0 
          }}>
            {/* Left Column: 3D Globe */}
            <div style={{ 
              border: '1px solid rgba(0,255,65,0.3)', 
              background: '#000', 
              position: 'relative', 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: '4px',
            }}>
              <div style={{ flex: 1 }}>
                <LiveMap 
                  key={currentAttack.id || currentAttack.ip} 
                  isAttacked={true} 
                  attackerCoords={currentAttack.coords} 
                  attackerData={currentAttack}
                  customWidth={750} 
                  customHeight={550} 
                />
              </div>
              <div style={{ 
                position: 'absolute', 
                top: '16px', 
                left: '16px', 
                fontSize: '12px', 
                background: 'rgba(0,10,0,0.9)', 
                padding: '8px 14px', 
                borderLeft: '3px solid #ffaa00',
                borderRadius: '2px',
                boxShadow: '0 0 10px rgba(0,0,0,0.8)'
              }}>
                TARGET LOCATION: <span style={{ color: '#00ff41', fontWeight: 'bold' }}>{attackLoc}</span>
              </div>
            </div>

            {/* Right Column: Forensic Details */}
            <div style={{ 
              border: '1px solid rgba(0,255,65,0.4)', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              minHeight: 0,
              background: 'rgba(0, 15, 0, 0.5)',
              borderRadius: '4px',
            }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="custom-scroll">
                <h4 style={{ color: '#00ff41', margin: '0 0 16px 0', borderBottom: '1px solid rgba(0,255,65,0.3)', paddingBottom: '8px', letterSpacing: '1px' }}>
                  // THREAT_ACTOR_PROFILE
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['SOURCE_IP', attackIp, '#ffaa00'],
                      ['LOCATION', attackLoc, '#00ff41'],
                      ['PROTOCOL', currentAttack.proto || 'TCP', ''],
                      ['TARGET_PORT', currentAttack.port || '2222', ''],
                      ['ATTACK_TYPE', attackType, '#ff9900'],
                      ['THREAT_LEVEL', severity, '#ff0000'],
                      ['AI_STATUS', currentAttack.status || 'DETECTED', '#00ff41']
                    ].map(([label, value, color], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
                        <td style={{ padding: '10px 0', opacity: 0.6, fontSize: '11.5px', letterSpacing: '0.5px' }}>{label}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: color || '#fff', fontSize: '12.5px' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Executed Commands */}
                {currentAttack.commands_used && currentAttack.commands_used.length > 0 && (
                  <>
                    <h4 style={{ color: '#ffaa00', margin: '24px 0 12px 0', borderBottom: '1px solid rgba(255,170,0,0.3)', paddingBottom: '8px', letterSpacing: '1px' }}>
                      // EXECUTED_COMMANDS ({currentAttack.commands_used.length})
                    </h4>
                    <div style={{ background: 'rgba(255, 170, 0, 0.06)', padding: '12px', border: '1px solid rgba(255,170,0,0.25)', maxHeight: '160px', overflowY: 'auto', borderRadius: '3px' }} className="custom-scroll">
                      {currentAttack.commands_used.map((cmd, i) => (
                        <div key={i} style={{ fontFamily: 'monospace', color: '#fff', fontSize: '11.5px', marginBottom: '6px', wordBreak: 'break-all' }}>
                          <span style={{ color: '#ffaa00', marginRight: '6px' }}>&gt;</span>{cmd}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Attack Statistics */}
                <h4 style={{ color: '#00ff41', margin: '24px 0 12px 0', borderBottom: '1px solid rgba(0,255,65,0.3)', paddingBottom: '8px', letterSpacing: '1px' }}>
                  // ATTACK_STATISTICS
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['CONNECTION_COUNT', currentAttack.connectionCount ?? currentAttack.connection_count ?? 0, '#ffaa00'],
                      ['SUCCESS_COUNT', currentAttack.successCount ?? currentAttack.success_count ?? 0, '#00ff41'],
                      ['FAILED_COUNT', currentAttack.failedCount ?? currentAttack.failed_count ?? 0, '#ff5555'],
                      ['UNIQUE_PASSWORDS', currentAttack.uniquePasswords ?? currentAttack.unique_passwords ?? 0, '#ffaa00'],
                      ['COMMAND_COUNT', currentAttack.commandCount ?? currentAttack.command_count ?? (currentAttack.commands_used ? currentAttack.commands_used.length : 0), '#ff6666'],
                      ['SUSPICIOUS_COMMANDS', currentAttack.suspiciousCmds ?? currentAttack.suspicious_commands ?? 0, '#ff0000']
                    ].map(([label, value, color], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
                        <td style={{ padding: '9px 0', opacity: 0.6, fontSize: '11.5px' }}>{label}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: color, fontSize: '12.5px' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Event Timeline */}
                <h4 style={{ color: '#00ff41', margin: '24px 0 14px 0', borderBottom: '1px solid rgba(0,255,65,0.3)', paddingBottom: '8px', letterSpacing: '1px' }}>
                  // EVENT_TIMELINE
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  {currentAttack.eventTimeline && currentAttack.eventTimeline.length > 0
                    ? currentAttack.eventTimeline.map((evt, i) => {
                        const evtTime = typeof evt === 'string' ? '' : (evt.time || '');
                        const evtEvent = typeof evt === 'string' ? evt : (evt.event || String(evt));
                        const evtStatus = typeof evt === 'string' ? 'success' : (evt.status || 'success');
                        const dotColor = evtStatus === 'critical' ? '#ff0000' : evtStatus === 'warning' ? '#ffaa00' : '#00ff41';
                        return (
                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '14px' }}>
                              <div style={{
                                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                                background: dotColor,
                                border: '2px solid rgba(255,255,255,0.2)',
                                boxShadow: `0 0 8px ${dotColor}`,
                                marginTop: '2px',
                              }} />
                              {i < currentAttack.eventTimeline.length - 1 && (
                                <div style={{ width: '2px', flex: 1, minHeight: '14px', background: 'rgba(0,255,65,0.2)', marginTop: '3px' }} />
                              )}
                            </div>
                            <div style={{ flex: 1, paddingBottom: '2px' }}>
                              {evtTime && (
                                <div style={{ fontSize: '9.5px', color: '#888', marginBottom: '2px', letterSpacing: '0.5px' }}>
                                  {evtTime}
                                </div>
                              )}
                              <div style={{
                                fontSize: '11.5px', fontWeight: '600',
                                color: dotColor,
                                letterSpacing: '0.3px',
                                wordBreak: 'break-word',
                              }}>
                                {evtEvent}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    : (
                      <div style={{ color: 'rgba(0,255,65,0.4)', fontSize: '11.5px', padding: '8px 0', letterSpacing: '1px' }}>
                        LOGGED_INCIDENT_STREAM_ACTIVE
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModule;