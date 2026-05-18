import React, { useEffect, useRef, useState } from 'react'
import { useSixtysixStore } from './modules/sixtysix/store/sixtysix.store'
import { todayString } from './modules/sixtysix/lib/arcLogic'
import Sixtysix from './modules/sixtysix/Sixtysix'
import Onboarding from './modules/sixtysix/screens/Onboarding'
import Settings from './modules/sixtysix/screens/Settings'
import History from './modules/sixtysix/screens/History'
import Cards from './modules/sixtysix/screens/Cards'
import ArcComplete from './modules/sixtysix/screens/ArcComplete'
import HubCard from './modules/sixtysix/components/HubCard'
import Life from './modules/sixtysix/screens/Life'

// ──────────────────────────────────────────────
// Splash screen
// ──────────────────────────────────────────────
const SPLASH_CSS = `
@keyframes splashFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes splashWipe {
  from { clip-path: inset(0 0% 0 0); }
  to   { clip-path: inset(0 100% 0 0); }
}
`

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [wiping, setWiping] = useState(false)

  useEffect(() => {
    const hold = setTimeout(() => setWiping(true), 900)
    return () => clearTimeout(hold)
  }, [])

  useEffect(() => {
    if (!wiping) return
    const done = setTimeout(onDone, 550)
    return () => clearTimeout(done)
  }, [wiping, onDone])

  return (
    <>
      <style>{SPLASH_CSS}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'splashFadeIn 300ms ease-out',
        ...(wiping ? {
          animationName: 'splashWipe',
          animationDuration: '500ms',
          animationTimingFunction: 'cubic-bezier(0.76,0,0.24,1)',
          animationFillMode: 'forwards',
        } : {}),
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic',
          fontSize: 96,
          fontWeight: 400,
          color: '#fff',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          userSelect: 'none',
        }}>
          66
        </div>
      </div>
    </>
  )
}

// ──────────────────────────────────────────────
// Tab icon SVGs
// ──────────────────────────────────────────────
function HubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="9" cy="9" r="6" />
      <circle cx="9" cy="9" r="2" fill="currentColor" />
    </svg>
  )
}
function LifeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M9 3 C9 3 4 7 4 11 a5 5 0 0 0 10 0 C14 7 9 3 9 3z" />
    </svg>
  )
}
function HabitsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
      <polyline points="3,9 7,13 15,5" />
    </svg>
  )
}
function WorkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="6" width="12" height="9" />
      <path d="M6 6 V4 H12 V6" />
    </svg>
  )
}
function FocusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="9" cy="9" r="6" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
    </svg>
  )
}

// ──────────────────────────────────────────────
// Tab slide animation
// ──────────────────────────────────────────────
const TAB_SLIDE_CSS = `
@keyframes tabSlideIn {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes tabSlideInLeft {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
`

const TAB_ORDER: Tab[] = ['hub', 'life', 'habits', 'work', 'focus']

// ──────────────────────────────────────────────
// Stub screens for other tabs
// ──────────────────────────────────────────────
function StubScreen({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 96px)',
      gap: 16,
    }}>
      <div style={{
        fontFamily: "'DM Mono',monospace",
        fontSize: 10, letterSpacing: '0.34em',
        color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: "'Instrument Serif',serif",
        fontStyle: 'italic', fontSize: 24,
        color: 'rgba(255,255,255,0.25)',
      }}>Coming soon.</div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Bottom nav tab definition
// ──────────────────────────────────────────────
type Tab = 'hub' | 'life' | 'habits' | 'work' | 'focus'

const NAV_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'hub', label: 'HUB', icon: <HubIcon /> },
  { id: 'life', label: 'LIFE', icon: <LifeIcon /> },
  { id: 'habits', label: 'HABITS', icon: <HabitsIcon /> },
  { id: 'work', label: 'WORK', icon: <WorkIcon /> },
  { id: 'focus', label: 'FOCUS', icon: <FocusIcon /> },
]

// ──────────────────────────────────────────────
// App
// ──────────────────────────────────────────────
export default function App() {
  const {
    arc, habits, logs,
    currentScreen, currentTab,
    notificationsEnabled, notificationTime,
    dayBeginsHour,
    setCurrentScreen, setCurrentTab,
  } = useSixtysixStore()

  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('cam-os-splash-shown'))
  function dismissSplash() {
    sessionStorage.setItem('cam-os-splash-shown', '1')
    setShowSplash(false)
  }

  // If no arc, show onboarding
  useEffect(() => {
    if (!arc && currentScreen !== 'onboarding') {
      setCurrentScreen('onboarding')
    }
  }, [arc, currentScreen, setCurrentScreen])

  // Always land on habits tab when app opens
  const didMount = useRef(false)
  useEffect(() => {
    if (!didMount.current && arc) {
      setCurrentTab('habits')
      setCurrentScreen('habits')
      didMount.current = true
    } else {
      didMount.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Track slide direction
  const prevTabRef = useRef(currentTab)
  const slideDir = TAB_ORDER.indexOf(currentTab) >= TAB_ORDER.indexOf(prevTabRef.current) ? 'right' : 'left'
  useEffect(() => { prevTabRef.current = currentTab }, [currentTab])

  // Daily reminder notification — fires once per day if past notification time and habits incomplete
  useEffect(() => {
    if (!arc || !notificationsEnabled) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

    const now = new Date()
    const [h, m] = notificationTime.split(':').map(Number)
    const target = new Date(); target.setHours(h, m, 0, 0)
    if (now < target) return

    const today = todayString(dayBeginsHour)
    const lastNotified = localStorage.getItem('cam-os-notified')
    if (lastNotified === today) return

    const activeHabits = habits.filter(ht => ht.arcId === arc.id && ht.active)
    const todayLogs = logs.filter(l => l.date === today && l.arcId === arc.id)
    const done = activeHabits.filter(ht => todayLogs.find(l => l.habitId === ht.id && l.complete)).length
    if (done >= activeHabits.length) return // already done — don't nag

    try {
      new Notification('THE 66', {
        body: `Day ${arc.currentDay}. ${done}/${activeHabits.length} habits done. The arc continues.`,
        silent: false,
      })
      localStorage.setItem('cam-os-notified', today)
    } catch (_) { /* permission may have been revoked */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsEnabled, notificationTime])

  // Keyboard shortcut: Escape closes overlay screens back to habits
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && (currentScreen === 'settings' || currentScreen === 'history' || currentScreen === 'cards' || currentScreen === 'arc-complete')) {
        setCurrentScreen('habits')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentScreen, setCurrentScreen])

  // When navigating to habits tab, show the habits screen
  function handleTabClick(tab: Tab) {
    setCurrentTab(tab)
    if (tab === 'habits') {
      setCurrentScreen('habits')
    }
  }

  const showNav = arc !== null && currentScreen !== 'onboarding'

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff', position: 'relative' }}>
      <style>{TAB_SLIDE_CSS}</style>

      {/* Launch splash */}
      {showSplash && <SplashScreen onDone={dismissSplash} />}

      {/* Onboarding — full screen, highest z-index */}
      {currentScreen === 'onboarding' && <Onboarding />}

      {/* Settings overlay */}
      {currentScreen === 'settings' && <Settings />}

      {/* History overlay */}
      {currentScreen === 'history' && <History />}

      {/* Cards overlay */}
      {currentScreen === 'cards' && <Cards />}

      {/* Arc complete screen */}
      {currentScreen === 'arc-complete' && <ArcComplete />}

      {/* Main content area — visible when on habits tab or other tabs */}
      {arc && currentScreen === 'habits' && currentTab === 'habits' && (
        <Sixtysix />
      )}

      {/* Other tab stubs */}
      {arc && currentScreen === 'habits' && currentTab === 'hub' && (
        <div style={{
          minHeight: 'calc(100vh - 96px)',
          padding: '56px 56px 96px',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.30)',
            textTransform: 'uppercase',
          }}>
            HUB
          </div>
          <HubCard />
        </div>
      )}
      {arc && currentScreen === 'habits' && currentTab === 'life' && (
        <div key="life" style={{ flex: 1, minHeight: 0, animation: `${slideDir === 'right' ? 'tabSlideIn' : 'tabSlideInLeft'} 250ms ease-out` }}>
          <Life />
        </div>
      )}
      {arc && currentScreen === 'habits' && currentTab === 'work' && <StubScreen label="WORK" />}
      {arc && currentScreen === 'habits' && currentTab === 'focus' && <StubScreen label="FOCUS" />}

      {/* Bottom nav */}
      {showNav && (
        <nav style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          zIndex: 8,
          padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          background: '#000',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {NAV_TABS.map(tab => {
            const isActive = currentTab === tab.id && (currentScreen === 'habits' || currentScreen === 'settings' || currentScreen === 'history' || currentScreen === 'cards')
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10, letterSpacing: '0.28em',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.40)',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  background: 'transparent',
                  border: 'none',
                  padding: '4px 12px',
                  transition: 'color 200ms ease',
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.7 }}>{tab.icon}</span>
                {tab.id === 'habits' ? (
                  <span style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: 'italic',
                    fontSize: isActive ? 16 : 13,
                    letterSpacing: '0.02em',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                    transition: 'font-size 200ms ease, color 200ms ease',
                    lineHeight: 1,
                    marginTop: 2,
                  }}>
                    66
                  </span>
                ) : isActive ? (
                  <span style={{
                    border: '1px solid #fff',
                    padding: '4px 12px 3px',
                    marginTop: 2,
                  }}>{tab.label}</span>
                ) : (
                  <span>{tab.label}</span>
                )}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
