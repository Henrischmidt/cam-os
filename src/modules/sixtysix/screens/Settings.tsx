import React, { useState, useEffect } from 'react'
import { useSixtysixStore } from '../store/sixtysix.store'
import {
  iCloudSyncAvailable,
  iCloudSyncConfigured,
  connectICloudFolder,
  disconnectICloudFolder,
  iosExportAvailable,
  exportWidgetData,
} from '../lib/icloudSync'
import { readSnapshotJson } from '../lib/snapshot'
import { getCard } from '../lib/cardLogic'
import { useIsMobile } from '../lib/useIsMobile'

// ─── Style tokens ─────────────────────────────────────────────────────────────

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

const fg60 = 'rgba(255,255,255,0.60)'
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'
const rule = 'rgba(255,255,255,0.10)'
const sectionBorder = 'rgba(255,255,255,0.05)'

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'relative',
        width: 44,
        height: 24,
        borderRadius: 100,
        border: `1px solid rgba(255,255,255,0.25)`,
        background: on ? '#fff' : 'transparent',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 300ms ease',
      }}
      aria-checked={on}
      role="switch"
    >
      <span
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: on ? 'calc(100% - 20px)' : 4,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: on ? '#000' : fg40,
          transition: 'left 300ms ease, background 300ms ease',
        }}
      />
    </button>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 10,
        letterSpacing: '0.32em',
        color: fg40,
        textTransform: 'uppercase',
        paddingBottom: 12,
        borderBottom: `1px solid ${sectionBorder}`,
        marginTop: 40,
      }}
    >
      {label}
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${rule}`,
        padding: '20px 0',
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.2em',
          color: fg60,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{children}</div>
    </div>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    border: `1px solid rgba(255,255,255,0.10)`,
    background: 'transparent',
    color: '#fff',
    fontFamily: mono,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'inline-flex', border: `1px solid rgba(255,255,255,0.10)` }}>
      <button style={btnStyle} onClick={() => onChange(Math.max(min, value - 1))}>
        −
      </button>
      <div
        style={{
          minWidth: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: mono,
          fontSize: 12,
          color: '#fff',
          borderLeft: `1px solid rgba(255,255,255,0.10)`,
          borderRight: `1px solid rgba(255,255,255,0.10)`,
        }}
      >
        {value}
      </div>
      <button style={btnStyle} onClick={() => onChange(Math.min(max, value + 1))}>
        +
      </button>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const {
    arc,
    habits,
    cards,
    honestMissWordMin,
    notificationsEnabled,
    notificationTime,
    dayBeginsHour,
    setCurrentScreen,
    toggleHardMode,
    setHonestMissWordMin,
    exportArcData,
    updateIdentityStatement,
    updateHabit,
    setNotificationsEnabled,
    setNotificationTime,
    setDayBeginsHour,
    webhookUrl,
    setWebhookUrl,
    morningRitualUrl,
    setMorningRitualUrl,
  } = useSixtysixStore()

  type CardData = { id: string; category: string; text: string; attribution: string }
  const [randomCard, setRandomCard] = useState<CardData | null>(null)

  function showRandomOldCard() {
    const collected = cards.collected
    if (collected.length === 0) return
    const candidates = collected.filter(id => id !== randomCard?.id)
    const pool = candidates.length > 0 ? candidates : collected
    const id = pool[Math.floor(Math.random() * pool.length)]
    setRandomCard(getCard(id) ?? null)
  }

  const isMobile = useIsMobile()

  const [webhookInput, setWebhookInput] = useState(webhookUrl)
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [ritualInput, setRitualInput] = useState(morningRitualUrl)
  const [ritualSaved, setRitualSaved] = useState(false)

  const arcHabits = habits.filter(h => arc ? h.arcId === arc.id && h.active : false)

  const [editIdentity, setEditIdentity] = useState(arc?.identityStatement ?? '')
  const [identitySaved, setIdentitySaved] = useState(false)
  const [endArcConfirm, setEndArcConfirm] = useState(false)

  const syncAvailable = iCloudSyncAvailable()
  const iosShare = iosExportAvailable()
  const [syncConfigured, setSyncConfigured] = useState(false)
  const [syncConnecting, setSyncConnecting] = useState(false)
  const [iosSyncing, setIosSyncing] = useState(false)
  const [iosSyncResult, setIosSyncResult] = useState<'idle' | 'ok' | 'fail'>('idle')

  useEffect(() => {
    iCloudSyncConfigured().then(setSyncConfigured)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 70,
        overflowY: 'auto',
        padding: isMobile
          ? `calc(env(safe-area-inset-top) + 20px) 20px calc(80px + env(safe-area-inset-bottom))`
          : '40px 56px 100px',
      }}
    >
      {/* Back header */}
      <button
        onClick={() => setCurrentScreen('habits')}
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: fg40,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ← HABITS
      </button>

      {/* Title */}
      <h1
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 42,
          fontWeight: 400,
          color: '#fff',
          margin: '0 0 8px',
          lineHeight: 1.1,
        }}
      >
        Settings.
      </h1>

      {/* ── HONESTY ── */}
      <SectionHeader label="Honesty" />

      <Row label="Honest Misses This Phase">
        <span
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: fg60,
            letterSpacing: '0.04em',
          }}
        >
          {arc ? arc.honestMissesUsed : 0} / 1
        </span>
      </Row>

      <Row label="Minimum Words">
        <Stepper
          value={honestMissWordMin}
          min={3}
          max={10}
          onChange={setHonestMissWordMin}
        />
      </Row>

      {/* ── HARD MODE ── */}
      <SectionHeader label="Hard Mode" />

      <Row label="Hard Mode">
        <ToggleSwitch
          on={arc?.hardMode ?? false}
          onToggle={toggleHardMode}
        />
      </Row>

      {arc?.hardMode && (
        <p
          style={{
            fontFamily: sans,
            fontSize: 12,
            color: fg25,
            margin: '0 0 4px',
            lineHeight: 1.6,
          }}
        >
          Honesty disabled. Any missed day resets the streak.
        </p>
      )}

      {/* ── NOTIFICATIONS ── */}
      <SectionHeader label="Notifications" />

      <Row label="Daily Reminder">
        <ToggleSwitch
          on={notificationsEnabled}
          onToggle={async () => {
            if (!notificationsEnabled) {
              if (typeof Notification === 'undefined') return
              const perm = await Notification.requestPermission()
              if (perm === 'granted') setNotificationsEnabled(true)
            } else {
              setNotificationsEnabled(false)
            }
          }}
        />
      </Row>

      {/* Permission hint */}
      {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
        <p style={{ fontFamily: sans, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 4px' }}>
          Notifications are blocked in your browser settings. Go to Settings → Safari → CAM OS → Notifications to allow them.
        </p>
      )}
      {typeof Notification !== 'undefined' && Notification.permission === 'default' && !notificationsEnabled && (
        <p style={{ fontFamily: sans, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 4px' }}>
          Tap the toggle to allow notifications.
        </p>
      )}

      <Row label="Remind Me At">
        <input
          type="time"
          value={notificationTime}
          onChange={e => setNotificationTime(e.target.value)}
          disabled={!notificationsEnabled}
          style={{
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.12)`,
            color: notificationsEnabled ? fg60 : fg25,
            fontFamily: mono,
            fontSize: 12,
            letterSpacing: '0.1em',
            padding: '8px 14px',
            outline: 'none',
            borderRadius: 100,
            opacity: notificationsEnabled ? 1 : 0.4,
          }}
        />
      </Row>

      <p style={{ fontFamily: sans, fontSize: 12, color: fg25, lineHeight: 1.6, margin: '0 0 4px' }}>
        Fires up to 4× a day while the app is open. Requires notification permission.
      </p>

      {/* ── DAY ROLLOVER ── */}
      <SectionHeader label="Day Rollover" />

      <Row label="Day Begins At">
        <input
          type="time"
          value={`${String(dayBeginsHour).padStart(2, '0')}:00`}
          onChange={e => {
            const h = parseInt(e.target.value.split(':')[0], 10)
            if (!isNaN(h)) setDayBeginsHour(h)
          }}
          style={{
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.12)`,
            color: fg60,
            fontFamily: mono,
            fontSize: 12,
            letterSpacing: '0.1em',
            padding: '8px 14px',
            outline: 'none',
            borderRadius: 100,
          }}
        />
      </Row>

      <p style={{ fontFamily: sans, fontSize: 12, color: fg25, lineHeight: 1.6, margin: '0 0 4px' }}>
        If you're up after midnight, the day doesn't flip until this time. Lets night owls complete habits before the arc rolls over.
      </p>

      {/* ── ICLOUD SYNC ── */}
      <SectionHeader label="iCloud Sync" />

      {syncAvailable ? (
        /* ── Desktop: File System Access API (Chrome / Edge / Arc) ── */
        <>
          <Row label="Scriptable Folder">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.2em', color: syncConfigured ? '#fff' : fg25, textTransform: 'uppercase' }}>
                {syncConfigured ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
              <button
                disabled={syncConnecting}
                onClick={async () => {
                  if (syncConfigured) {
                    await disconnectICloudFolder()
                    setSyncConfigured(false)
                  } else {
                    setSyncConnecting(true)
                    const ok = await connectICloudFolder()
                    setSyncConnecting(false)
                    if (ok) setSyncConfigured(true)
                  }
                }}
                style={{
                  fontFamily: mono, fontSize: 10, letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: syncConfigured ? 'rgba(255,255,255,0.30)' : fg60,
                  background: 'transparent', border: `1px solid rgba(255,255,255,0.12)`,
                  padding: '10px 20px', cursor: syncConnecting ? 'default' : 'pointer',
                  opacity: syncConnecting ? 0.5 : 1,
                }}
              >
                {syncConnecting ? 'Connecting…' : syncConfigured ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </Row>
          <p style={{ fontFamily: sans, fontSize: 12, color: fg25, lineHeight: 1.6, margin: '4px 0 0' }}>
            {syncConfigured
              ? 'Every habit log writes the66-state.json to your selected folder. iCloud syncs it to iPhone for Scriptable widgets.'
              : 'Select iCloud Drive › Scriptable. CAM OS writes the66-state.json there on every update.'}
          </p>
        </>
      ) : iosShare ? (
        /* ── iOS: Web Share API — manual one-tap export ── */
        <>
          <Row label="Scriptable Widget">
            <button
              disabled={iosSyncing}
              onClick={async () => {
                const json = readSnapshotJson()
                if (!json) return
                setIosSyncing(true)
                setIosSyncResult('idle')
                const ok = await exportWidgetData(json)
                setIosSyncing(false)
                setIosSyncResult(ok ? 'ok' : 'fail')
                if (ok) setTimeout(() => setIosSyncResult('idle'), 3000)
              }}
              style={{
                fontFamily: mono, fontSize: 10, letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: iosSyncResult === 'ok' ? '#fff' : fg60,
                background: 'transparent',
                border: `1px solid ${iosSyncResult === 'ok' ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.12)'}`,
                padding: '10px 20px',
                cursor: iosSyncing ? 'default' : 'pointer',
                opacity: iosSyncing ? 0.5 : 1,
                transition: 'color 400ms ease, border-color 400ms ease',
              }}
            >
              {iosSyncing ? 'Sharing…' : iosSyncResult === 'ok' ? 'Shared' : 'Sync Widget'}
            </button>
          </Row>
          <p style={{ fontFamily: sans, fontSize: 12, color: fg25, lineHeight: 1.6, margin: '4px 0 0' }}>
            Tap Sync Widget, then Save to Files › iCloud Drive › Scriptable. Do this after completing your habits. The widget reads the file on its next refresh.
          </p>
          {iosSyncResult === 'fail' && (
            <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Nothing to sync yet — complete a habit first.
            </p>
          )}
        </>
      ) : (
        /* ── Unsupported browser ── */
        <div style={{ borderTop: `1px solid ${rule}`, padding: '20px 0', fontFamily: sans, fontSize: 13, color: fg25, lineHeight: 1.6 }}>
          Widget sync requires Chrome, Edge, or Arc on desktop, or Safari on iPhone. Open CAM OS in one of those to connect.
        </div>
      )}

      {/* ── MORNING RITUAL ── */}
      <SectionHeader label="Morning Ritual" />

      <div style={{ borderTop: `1px solid ${rule}`, padding: '20px 0' }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.24em', color: fg40, textTransform: 'uppercase', marginBottom: 12 }}>
          Spotify / Ritual URL
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="url"
            value={ritualInput}
            onChange={e => { setRitualInput(e.target.value); setRitualSaved(false) }}
            placeholder="https://open.spotify.com/…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${fg25}`,
              outline: 'none',
              color: fg60,
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.04em',
              padding: '8px 0',
            }}
          />
          <button
            onClick={() => {
              setMorningRitualUrl(ritualInput.trim())
              setRitualSaved(true)
            }}
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: ritualSaved ? fg25 : fg60,
              background: 'transparent',
              border: `1px solid rgba(255,255,255,0.12)`,
              padding: '8px 16px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {ritualSaved ? 'Saved' : 'Save'}
          </button>
        </div>
        <p style={{ fontFamily: sans, fontSize: 12, color: fg25, lineHeight: 1.6, margin: '10px 0 0' }}>
          Paste any Spotify album, playlist, or podcast link. Shows as a one-tap launch button on the HUB tab.
        </p>
      </div>

      {/* ── WEBHOOKS ── */}
      <SectionHeader label="Automations (N8N)" />

      <div style={{ borderTop: `1px solid ${rule}`, padding: '20px 0' }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.24em', color: fg40, textTransform: 'uppercase', marginBottom: 12 }}>
          Webhook URL
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="url"
            value={webhookInput}
            onChange={e => { setWebhookInput(e.target.value); setWebhookSaved(false) }}
            placeholder="https://your-n8n.com/webhook/…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${fg25}`,
              outline: 'none',
              color: fg60,
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.04em',
              padding: '8px 0',
            }}
          />
          <button
            onClick={() => {
              setWebhookUrl(webhookInput.trim())
              setWebhookSaved(true)
            }}
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: webhookSaved ? fg25 : fg60,
              background: 'transparent',
              border: `1px solid rgba(255,255,255,0.12)`,
              padding: '8px 16px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {webhookSaved ? 'Saved' : 'Save'}
          </button>
        </div>
        <p style={{ fontFamily: sans, fontSize: 12, color: fg25, lineHeight: 1.6, margin: '10px 0 0' }}>
          CAM OS POSTs the full snapshot JSON to this URL after every habit log, rollover, and arc event. Use it to trigger N8N flows.
        </p>
      </div>

      {/* ── HABITS ── */}
      <SectionHeader label="Manage Habits" />

      {arcHabits.length === 0 ? (
        <div
          style={{
            borderTop: `1px solid ${rule}`,
            padding: '20px 0',
            fontFamily: mono,
            fontSize: 11,
            color: fg25,
            letterSpacing: '0.14em',
          }}
        >
          No habits yet.
        </div>
      ) : (
        arcHabits.map(h => (
          <HabitEditRow key={h.id} habit={h} onSave={(name) => updateHabit(h.id, { name })} />
        ))
      )}

      {/* ── DATA ── */}
      <SectionHeader label="Data" />

      <Row label="Export Arc Data">
        <button
          onClick={exportArcData}
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: fg60,
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.12)`,
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Export
        </button>
      </Row>

      <Row label="Old Card">
        <button
          onClick={showRandomOldCard}
          disabled={cards.collected.length === 0}
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: cards.collected.length === 0 ? fg25 : fg60,
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.12)`,
            padding: '10px 20px',
            cursor: cards.collected.length === 0 ? 'default' : 'pointer',
            opacity: cards.collected.length === 0 ? 0.4 : 1,
          }}
        >
          {randomCard ? 'Another' : 'Show'}
        </button>
      </Row>

      {randomCard && (
        <div style={{
          border: `1px solid rgba(255,255,255,0.10)`,
          padding: '24px 0',
          marginBottom: 8,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 8, letterSpacing: '0.28em',
            color: fg25, textTransform: 'uppercase', marginBottom: 12,
          }}>
            {randomCard.category}
          </div>
          <p style={{
            fontFamily: serif, fontStyle: 'italic', fontSize: 16,
            color: '#fff', lineHeight: 1.55, margin: '0 0 14px',
          }}>
            {randomCard.text}
          </p>
          <div style={{
            fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: fg40,
          }}>
            — {randomCard.attribution}
          </div>
          <button
            onClick={() => setRandomCard(null)}
            style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: fg25,
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '12px 0 0',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── DANGER ZONE ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          margin: '48px 0 16px',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span
          style={{
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: '0.32em',
            color: fg25,
            textTransform: 'uppercase',
          }}
        >
          Danger
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <Row label="End Arc Early">
        {!endArcConfirm ? (
          <button
            onClick={() => setEndArcConfirm(true)}
            style={{
              fontFamily: mono, fontSize: 10, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)',
              background: 'transparent', border: `1px solid rgba(255,255,255,0.08)`,
              padding: '10px 20px', cursor: 'pointer',
            }}
          >
            End Arc
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.50)' }}>
              Are you sure?
            </span>
            <button
              onClick={() => {
                // Mark arc as broken and navigate to onboarding
                useSixtysixStore.getState().resolveStreakBreak('end')
                setEndArcConfirm(false)
                setCurrentScreen('onboarding')
              }}
              style={{
                fontFamily: mono, fontSize: 10, letterSpacing: '0.24em',
                textTransform: 'uppercase', color: 'rgba(255,100,100,0.80)',
                background: 'transparent', border: `1px solid rgba(255,100,100,0.30)`,
                padding: '8px 16px', cursor: 'pointer',
              }}
            >
              Yes, End
            </button>
            <button
              onClick={() => setEndArcConfirm(false)}
              style={{
                fontFamily: mono, fontSize: 10, letterSpacing: '0.24em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)',
                background: 'transparent', border: `1px solid rgba(255,255,255,0.10)`,
                padding: '8px 16px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </Row>

      {/* ── ABOUT ── */}
      <SectionHeader label="About This Arc" />

      {arc && (
        <div style={{ borderTop: `1px solid ${rule}`, padding: '24px 0' }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.24em',
              color: fg25,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Arc start · {arc.startDate}
          </div>

          {/* Editable identity statement */}
          <div style={{ marginTop: 24, marginBottom: 32 }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: '0.28em',
                color: fg40,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Identity Statement
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 15,
                color: fg60,
                marginBottom: 10,
              }}
            >
              By Day 66, I'll be the kind of person who
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <input
                value={editIdentity}
                onChange={e => {
                  setEditIdentity(e.target.value)
                  setIdentitySaved(false)
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${fg25}`,
                  outline: 'none',
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: '#fff',
                  padding: '8px 0',
                }}
              />
              <button
                onClick={() => {
                  if (editIdentity.trim()) {
                    updateIdentityStatement(editIdentity.trim())
                    setIdentitySaved(true)
                  }
                }}
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: identitySaved ? fg25 : fg60,
                  background: 'transparent',
                  border: `1px solid rgba(255,255,255,0.12)`,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {identitySaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Per-habit why statements */}
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.28em',
              color: fg40,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Why Statements
          </div>

          {arcHabits.map(h => (
            <WhyRow key={h.id} habit={h} onSave={(why) => updateHabit(h.id, { whyStatement: why })} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Habit edit row ───────────────────────────────────────────────────────────

function HabitEditRow({ habit, onSave }: { habit: { id: string; name: string; type: string }; onSave: (name: string) => void }) {
  const [value, setValue] = useState(habit.name)
  const [saved, setSaved] = useState(false)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderTop: `1px solid ${rule}`,
      padding: '16px 0',
    }}>
      <input
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false) }}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid rgba(255,255,255,0.12)`,
          outline: 'none',
          fontFamily: sans,
          fontSize: 15,
          color: '#fff',
          padding: '6px 0',
        }}
      />
      <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: fg25, textTransform: 'uppercase', flexShrink: 0 }}>
        {habit.type}
      </span>
      <button
        onClick={() => { if (value.trim()) { onSave(value.trim()); setSaved(true) } }}
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: saved ? fg25 : fg60,
          background: 'transparent',
          border: `1px solid rgba(255,255,255,0.12)`,
          padding: '8px 16px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}

// ─── Why row (inline editable) ────────────────────────────────────────────────

function WhyRow({ habit, onSave }: { habit: { id: string; name: string; whyStatement: string }; onSave: (why: string) => void }) {
  const [value, setValue] = useState(habit.whyStatement)
  const [saved, setSaved] = useState(false)

  return (
    <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: '16px 0' }}>
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 13,
          color: 'rgba(255,255,255,0.50)',
          marginBottom: 8,
        }}
      >
        {habit.name}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <input
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setSaved(false)
          }}
          placeholder="Why this habit?"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid rgba(255,255,255,0.15)`,
            outline: 'none',
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 15,
            color: '#fff',
            padding: '6px 0',
          }}
        />
        <button
          onClick={() => {
            onSave(value.trim())
            setSaved(true)
          }}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: saved ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)',
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.12)`,
            padding: '8px 16px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}
