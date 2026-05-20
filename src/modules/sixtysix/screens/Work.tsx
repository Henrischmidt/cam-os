import React, { useRef, useState } from 'react'
import { useSixtysixStore } from '../store/sixtysix.store'

export default function Work() {
  const { workTasks, addWorkTask, toggleWorkTask, clearDoneWorkTasks } = useSixtysixStore()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAdd() {
    const trimmed = input.trim()
    if (!trimmed) return
    addWorkTask(trimmed)
    setInput('')
    inputRef.current?.focus()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
  }

  const done = workTasks.filter(t => t.done).length
  const total = workTasks.length

  return (
    <div style={{
      flex: 1, minHeight: 0, overflowY: 'auto', height: '100%',
      padding: 'calc(env(safe-area-inset-top) + 40px) 24px calc(96px + env(safe-area-inset-bottom))',
      display: 'flex', flexDirection: 'column', gap: 32,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
        }}>WORK</div>
        {total > 0 && (
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, letterSpacing: '0.20em',
            color: 'rgba(255,255,255,0.25)',
          }}>{done}/{total}</div>
        )}
      </div>

      {/* Add task input */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add a task…"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 15,
            padding: '8px 0',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.20)',
            color: input.trim() ? '#fff' : 'rgba(255,255,255,0.25)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, letterSpacing: '0.22em',
            padding: '8px 14px',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'color 200ms, border-color 200ms',
          }}
        >
          ADD
        </button>
      </div>

      {/* Task list */}
      {workTasks.length === 0 && (
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic', fontSize: 18,
          color: 'rgba(255,255,255,0.20)',
          marginTop: 32,
        }}>Nothing queued.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {workTasks.map(task => (
          <button
            key={task.id}
            onClick={() => toggleWorkTask(task.id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              background: 'transparent', border: 'none',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            {/* Checkbox */}
            <div style={{
              width: 16, height: 16, flexShrink: 0,
              marginTop: 1,
              border: task.done ? 'none' : '1px solid rgba(255,255,255,0.35)',
              background: task.done ? 'rgba(255,255,255,0.90)' : 'transparent',
              transition: 'background 200ms, border 200ms',
            }} />
            <span style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: 15, lineHeight: 1.5,
              color: task.done ? 'rgba(255,255,255,0.30)' : '#fff',
              textDecoration: task.done ? 'line-through' : 'none',
              transition: 'color 200ms',
            }}>
              {task.text}
            </span>
          </button>
        ))}
      </div>

      {/* Clear done */}
      {done > 0 && (
        <button
          onClick={clearDoneWorkTasks}
          style={{
            alignSelf: 'flex-start',
            background: 'transparent', border: 'none',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.30)',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Clear {done} done
        </button>
      )}
    </div>
  )
}
