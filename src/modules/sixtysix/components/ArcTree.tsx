import { useSixtysixStore } from '../store/sixtysix.store'

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v))
}

function phaseIn(day: number, start: number, end: number) {
  return clamp((day - start) / (end - start))
}

export default function ArcTree() {
  const { arc } = useSixtysixStore()
  if (!arc) return null

  const day = arc.currentDay

  // Overall completion health (marks per day completed)
  const health = clamp(arc.marks / Math.max(1, day - 1))

  // Per-stage fade values
  const sprout   = phaseIn(day, 1, 7)    // days 1–7
  const sapling  = phaseIn(day, 7, 22)   // days 8–21
  const young    = phaseIn(day, 21, 46)  // days 22–45
  const full     = phaseIn(day, 45, 66)  // days 46–66

  // Leaf opacity: always slightly visible; scales with health
  const leaf = (stage: number) => clamp(stage * Math.max(0.2, health))

  const s  = 'rgba(255,255,255,1)'  // stroke colour
  const sw = (w: number) => ({ stroke: s, strokeWidth: w, fill: 'none' })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
    }}>
      <svg
        viewBox="0 0 160 230"
        width="140"
        height="200"
        style={{ overflow: 'visible' }}
      >
        {/* ── GROUND LINE ── */}
        <line x1="55" y1="215" x2="105" y2="215"
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

        {/* ── TRUNK BASE (day 1+) ── */}
        <line x1="80" y1="215" x2="80" y2="185"
              {...sw(2.8)} opacity={clamp(sprout * 3)} />

        {/* ── TRUNK UPPER (day 3+) ── */}
        <line x1="80" y1="185" x2="80" y2="160"
              {...sw(2.4)} opacity={phaseIn(day, 3, 8)} />

        {/* ── SPROUT LEAVES (days 1–7) ── */}
        <g opacity={leaf(sprout)}>
          <path d="M80 178 Q70 168 67 160" {...sw(1.1)} />
          <path d="M80 178 Q90 168 93 160" {...sw(1.1)} />
          <circle cx="67" cy="158" r="3.5" {...sw(0.8)} />
          <circle cx="93" cy="158" r="3.5" {...sw(0.8)} />
        </g>

        {/* ── SAPLING TRUNK (days 8–21) ── */}
        <line x1="80" y1="160" x2="79" y2="128"
              {...sw(2)} opacity={sapling} />

        {/* ── SAPLING BRANCHES ── */}
        <g opacity={sapling}>
          <line x1="80" y1="152" x2="52" y2="136" {...sw(1.4)} />
          <line x1="80" y1="152" x2="108" y2="136" {...sw(1.4)} />
        </g>

        {/* ── SAPLING LEAVES ── */}
        <g opacity={leaf(sapling)}>
          <circle cx="48"  cy="132" r="7"   {...sw(0.8)} />
          <circle cx="42"  cy="126" r="4.5" {...sw(0.7)} />
          <circle cx="54"  cy="126" r="5"   {...sw(0.7)} />
          <circle cx="112" cy="132" r="7"   {...sw(0.8)} />
          <circle cx="118" cy="126" r="4.5" {...sw(0.7)} />
          <circle cx="106" cy="126" r="5"   {...sw(0.7)} />
          <circle cx="80"  cy="124" r="5"   {...sw(0.7)} />
        </g>

        {/* ── YOUNG TRUNK (days 22–45) ── */}
        <line x1="79" y1="128" x2="78" y2="96"
              {...sw(1.7)} opacity={young} />

        {/* ── YOUNG BRANCHES ── */}
        <g opacity={young}>
          <line x1="79" y1="116" x2="44" y2="98"  {...sw(1.3)} />
          <line x1="79" y1="116" x2="114" y2="98" {...sw(1.3)} />
          <line x1="44" y1="98" x2="30" y2="84"   {...sw(1)} />
          <line x1="44" y1="98" x2="52" y2="83"   {...sw(1)} />
          <line x1="114" y1="98" x2="128" y2="84" {...sw(1)} />
          <line x1="114" y1="98" x2="106" y2="83" {...sw(1)} />
        </g>

        {/* ── YOUNG LEAVES ── */}
        <g opacity={leaf(young)}>
          <circle cx="28"  cy="80" r="7.5" {...sw(0.7)} />
          <circle cx="36"  cy="73" r="5.5" {...sw(0.7)} />
          <circle cx="50"  cy="78" r="6.5" {...sw(0.7)} />
          <circle cx="130" cy="80" r="7.5" {...sw(0.7)} />
          <circle cx="122" cy="73" r="5.5" {...sw(0.7)} />
          <circle cx="108" cy="78" r="6.5" {...sw(0.7)} />
          <circle cx="79"  cy="92" r="6"   {...sw(0.7)} />
        </g>

        {/* ── FULL TRUNK TOP (days 46–66) ── */}
        <line x1="78" y1="96" x2="77" y2="68"
              {...sw(1.3)} opacity={full} />

        {/* ── FULL CROWN BRANCHES ── */}
        <g opacity={full}>
          <line x1="78" y1="88" x2="54" y2="70"  {...sw(1.1)} />
          <line x1="78" y1="88" x2="102" y2="70" {...sw(1.1)} />
          <line x1="54" y1="70" x2="42" y2="55"  {...sw(0.9)} />
          <line x1="54" y1="70" x2="58" y2="54"  {...sw(0.9)} />
          <line x1="102" y1="70" x2="114" y2="55" {...sw(0.9)} />
          <line x1="102" y1="70" x2="98" y2="54"  {...sw(0.9)} />
          <line x1="77" y1="74" x2="76" y2="56"   {...sw(0.9)} />
        </g>

        {/* ── FULL CROWN LEAVES ── */}
        <g opacity={leaf(full)}>
          <circle cx="40"  cy="50" r="8"   {...sw(0.7)} />
          <circle cx="50"  cy="43" r="6.5" {...sw(0.7)} />
          <circle cx="60"  cy="49" r="7.5" {...sw(0.7)} />
          <circle cx="116" cy="50" r="8"   {...sw(0.7)} />
          <circle cx="106" cy="43" r="6.5" {...sw(0.7)} />
          <circle cx="96"  cy="49" r="7.5" {...sw(0.7)} />
          <circle cx="76"  cy="51" r="9"   {...sw(0.7)} />
          <circle cx="76"  cy="40" r="6.5" {...sw(0.7)} />
          <circle cx="76"  cy="30" r="5"   {...sw(0.6)} />
        </g>
      </svg>

      {/* Stats below the tree */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic',
          fontSize: 13,
          color: 'rgba(255,255,255,0.50)',
          letterSpacing: '0.01em',
        }}>
          day {day} of 66
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase',
        }}>
          {Math.round(health * 100)}% consistency
        </div>
      </div>
    </div>
  )
}
