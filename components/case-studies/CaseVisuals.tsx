'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'

/* ─────────────────────────────────────────────
   Shared constants & helpers
   ───────────────────────────────────────────── */

const SANS = 'var(--font-geist-sans), system-ui, sans-serif'
const MONO = 'var(--font-geist-mono), monospace'

const PRIMARY = '#2E9AC4'
const LIGHT = '#56B8DE'
const DARK = '#1B7EA6'
const WHITE = '#FFFFFF'
const MUTED = 'rgba(255,255,255,0.4)'
const GRID = 'rgba(255,255,255,0.05)'
const GUIDE = 'rgba(255,255,255,0.08)'

/** Shared glow filter definition for reuse inside each SVG */
function GlowDefs() {
  return (
    <defs>
      {/* Soft glow for data points */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feComposite in="blur" in2="SourceGraphic" operator="over" />
      </filter>

      {/* Stronger glow for hero elements */}
      <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
        <feComposite in="blur" in2="SourceGraphic" operator="over" />
      </filter>

      {/* Subtle glow for accent elements */}
      <filter id="glowSubtle" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feComposite in="blur" in2="SourceGraphic" operator="over" />
      </filter>
    </defs>
  )
}

/** Line-draw transition style */
function lineDrawStyle(inView: boolean, delay = 0, duration = 1.5) {
  return {
    strokeDasharray: 1000,
    strokeDashoffset: inView ? 0 : 1000,
    transition: `stroke-dashoffset ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  }
}

/** Fade-in-up transition style */
function fadeInUp(inView: boolean, delay = 0.8) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(10px)',
    transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  }
}

/** Fade-in (no translate) */
function fadeIn(inView: boolean, delay = 0.8) {
  return {
    opacity: inView ? 1 : 0,
    transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  }
}

/* ─────────────────────────────────────────────
   CaseVisual1 — Revenue Growth Curve
   ───────────────────────────────────────────── */

export function CaseVisual1() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  // Curve data points (Mo 1-6)
  const points = [
    { x: 60, y: 280 },
    { x: 130, y: 260 },
    { x: 200, y: 220 },
    { x: 270, y: 170 },
    { x: 340, y: 110 },
    { x: 410, y: 60 },
  ]

  // Smooth bezier curve path
  const curvePath = `M ${points[0].x} ${points[0].y} C ${points[0].x + 30} ${points[0].y - 5}, ${points[1].x - 20} ${points[1].y + 5}, ${points[1].x} ${points[1].y} C ${points[1].x + 25} ${points[1].y - 15}, ${points[2].x - 25} ${points[2].y + 10}, ${points[2].x} ${points[2].y} C ${points[2].x + 25} ${points[2].y - 20}, ${points[3].x - 25} ${points[3].y + 15}, ${points[3].x} ${points[3].y} C ${points[3].x + 25} ${points[3].y - 25}, ${points[4].x - 25} ${points[4].y + 15}, ${points[4].x} ${points[4].y} C ${points[4].x + 25} ${points[4].y - 20}, ${points[5].x - 25} ${points[5].y + 10}, ${points[5].x} ${points[5].y}`

  // Area fill path (curve + close to bottom)
  const areaPath = `${curvePath} L ${points[5].x} 300 L ${points[0].x} 300 Z`

  const months = ['Mo 1', 'Mo 2', 'Mo 3', 'Mo 4', 'Mo 5', 'Mo 6']
  const yLabels = [
    { label: '€2M', y: 60 },
    { label: '€1.5M', y: 133 },
    { label: '€1M', y: 206 },
    { label: '€500K', y: 280 },
  ]

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 360"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <GlowDefs />

      {/* Area fill gradient */}
      <defs>
        <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(46,154,196,0.18)" />
          <stop offset="100%" stopColor="rgba(46,154,196,0)" />
        </linearGradient>
      </defs>

      {/* Vertical grid lines */}
      {points.map((p, i) => (
        <line
          key={`vgrid-${i}`}
          x1={p.x}
          y1={40}
          x2={p.x}
          y2={300}
          stroke={GRID}
          strokeWidth={1}
          style={fadeIn(isInView, 0.2 + i * 0.05)}
        />
      ))}

      {/* Horizontal guide lines */}
      {yLabels.map((item, i) => (
        <line
          key={`hguide-${i}`}
          x1={50}
          y1={item.y}
          x2={430}
          y2={item.y}
          stroke={GUIDE}
          strokeWidth={1}
          strokeDasharray="4 4"
          style={fadeIn(isInView, 0.2 + i * 0.05)}
        />
      ))}

      {/* Y-axis labels */}
      {yLabels.map((item, i) => (
        <text
          key={`ylabel-${i}`}
          x={44}
          y={item.y + 4}
          textAnchor="end"
          fill={MUTED}
          fontSize={10}
          fontFamily={MONO}
          style={fadeInUp(isInView, 0.4 + i * 0.1)}
        >
          {item.label}
        </text>
      ))}

      {/* X-axis labels */}
      {months.map((m, i) => (
        <text
          key={`xlabel-${i}`}
          x={points[i].x}
          y={318}
          textAnchor="middle"
          fill={MUTED}
          fontSize={10}
          fontFamily={MONO}
          style={fadeInUp(isInView, 0.5 + i * 0.08)}
        >
          {m}
        </text>
      ))}

      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#areaGrad1)"
        style={fadeIn(isInView, 0.6)}
      />

      {/* Main curve */}
      <path
        d={curvePath}
        fill="none"
        stroke={PRIMARY}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={lineDrawStyle(isInView, 0.3)}
      />

      {/* Data points with glow */}
      {points.map((p, i) => (
        <g key={`point-${i}`} style={fadeIn(isInView, 0.8 + i * 0.12)}>
          {/* Glow */}
          <circle
            cx={p.x}
            cy={p.y}
            r={8}
            fill={LIGHT}
            opacity={0.25}
            filter="url(#glow)"
          />
          {/* Point */}
          <circle cx={p.x} cy={p.y} r={4} fill={LIGHT} />
          {/* Inner highlight */}
          <circle cx={p.x} cy={p.y} r={1.5} fill={WHITE} opacity={0.8} />
        </g>
      ))}

      {/* 4x Badge */}
      <g style={fadeInUp(isInView, 1.2)}>
        <rect
          x={395}
          y={18}
          width={60}
          height={30}
          rx={8}
          fill="rgba(46,154,196,0.15)"
          stroke="rgba(46,154,196,0.3)"
          strokeWidth={1}
        />
        <text
          x={425}
          y={38}
          textAnchor="middle"
          fill={WHITE}
          fontSize={16}
          fontWeight={700}
          fontFamily={SANS}
        >
          4x
        </text>
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual2 — Turnaround Comparison (Cocunat)
   ───────────────────────────────────────────── */

export function CaseVisual2() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 360"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <GlowDefs />

      {/* ─── Left side: Decline ─── */}
      {/* Downward arrow path */}
      <path
        d="M 80 70 C 80 70, 120 100, 110 160 C 100 220, 70 250, 80 280"
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        strokeLinecap="round"
        style={lineDrawStyle(isInView, 0.2)}
      />
      {/* Arrowhead */}
      <path
        d="M 73 268 L 80 284 L 87 268"
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={fadeIn(isInView, 1.0)}
      />

      {/* Left labels */}
      <text
        x={80}
        y={310}
        textAnchor="middle"
        fill={MUTED}
        fontSize={11}
        fontFamily={SANS}
        style={fadeInUp(isInView, 1.0)}
      >
        Agenturen
      </text>
      <text
        x={80}
        y={328}
        textAnchor="middle"
        fill="#ef4444"
        fontSize={10}
        fontFamily={SANS}
        fontWeight={500}
        style={fadeInUp(isInView, 1.1)}
      >
        Millionen verloren
      </text>

      {/* ─── Center: Iron Media symbol ─── */}
      {/* Horizontal dashed connector */}
      <line
        x1={150}
        y1={180}
        x2={330}
        y2={180}
        stroke="rgba(46,154,196,0.2)"
        strokeWidth={1}
        strokeDasharray="6 4"
        style={fadeIn(isInView, 0.6)}
      />

      {/* Three bars (Iron Media logo mark) */}
      <g style={fadeInUp(isInView, 0.7)}>
        {/* Glow behind bars */}
        <rect
          x={222}
          y={153}
          width={6}
          height={42}
          rx={3}
          fill={PRIMARY}
          opacity={0.3}
          filter="url(#glowSubtle)"
        />
        <rect
          x={233}
          y={145}
          width={6}
          height={58}
          rx={3}
          fill={PRIMARY}
          opacity={0.3}
          filter="url(#glowSubtle)"
        />
        <rect
          x={244}
          y={150}
          width={6}
          height={48}
          rx={3}
          fill={PRIMARY}
          opacity={0.3}
          filter="url(#glowSubtle)"
        />

        {/* Solid bars */}
        <rect x={222} y={153} width={6} height={42} rx={3} fill={PRIMARY} />
        <rect x={233} y={145} width={6} height={58} rx={3} fill={PRIMARY} />
        <rect x={244} y={150} width={6} height={48} rx={3} fill={PRIMARY} />
      </g>

      {/* ─── Right side: Growth ─── */}
      {/* Upward arrow path */}
      <path
        d="M 400 280 C 400 280, 370 250, 380 190 C 390 130, 410 100, 400 70"
        fill="none"
        stroke={PRIMARY}
        strokeWidth={2}
        strokeLinecap="round"
        style={lineDrawStyle(isInView, 0.4)}
      />
      {/* Arrowhead */}
      <path
        d="M 393 82 L 400 66 L 407 82"
        fill="none"
        stroke={PRIMARY}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={fadeIn(isInView, 1.2)}
      />

      {/* Right labels */}
      <text
        x={400}
        y={310}
        textAnchor="middle"
        fill={MUTED}
        fontSize={11}
        fontFamily={SANS}
        style={fadeInUp(isInView, 1.0)}
      >
        Inhouse
      </text>
      <text
        x={400}
        y={328}
        textAnchor="middle"
        fill={LIGHT}
        fontSize={10}
        fontFamily={SANS}
        fontWeight={500}
        style={fadeInUp(isInView, 1.1)}
      >
        6-stellig / Quartal
      </text>

      {/* ─── Bottom badge ─── */}
      <g style={fadeInUp(isInView, 1.3)}>
        <rect
          x={130}
          y={338}
          width={220}
          height={28}
          rx={6}
          fill="rgba(46,154,196,0.08)"
          stroke="rgba(46,154,196,0.2)"
          strokeWidth={1}
        />
        <text
          x={240}
          y={356}
          textAnchor="middle"
          fill={LIGHT}
          fontSize={10}
          fontFamily={SANS}
          fontWeight={500}
        >
          Sechsstellige Quartalsgewinne
        </text>
      </g>

      {/* Decorative corner dots */}
      <circle cx={30} cy={30} r={1.5} fill="rgba(46,154,196,0.2)" style={fadeIn(isInView, 0.3)} />
      <circle cx={450} cy={30} r={1.5} fill="rgba(46,154,196,0.2)" style={fadeIn(isInView, 0.3)} />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual3 — Rocket Curve (Shape Labs)
   ───────────────────────────────────────────── */

export function CaseVisual3() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const bars = [
    { month: 'Aug', height: 42, x: 80 },
    { month: 'Sep', height: 98, x: 170 },
    { month: 'Okt', height: 182, x: 260 },
    { month: 'Nov', height: 280, x: 350 },
  ]

  const chartBottom = 300
  const barWidth = 50

  // Curve path connecting bar tops
  const barTops = bars.map((b) => ({ x: b.x + barWidth / 2, y: chartBottom - b.height }))
  const curvePath = `M ${barTops[0].x} ${barTops[0].y} C ${barTops[0].x + 35} ${barTops[0].y - 20}, ${barTops[1].x - 35} ${barTops[1].y + 15}, ${barTops[1].x} ${barTops[1].y} C ${barTops[1].x + 35} ${barTops[1].y - 25}, ${barTops[2].x - 35} ${barTops[2].y + 20}, ${barTops[2].x} ${barTops[2].y} C ${barTops[2].x + 35} ${barTops[2].y - 30}, ${barTops[3].x - 35} ${barTops[3].y + 15}, ${barTops[3].x} ${barTops[3].y}`

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 360"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <GlowDefs />

      <defs>
        <linearGradient id="barGrad3" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={DARK} />
          <stop offset="100%" stopColor={LIGHT} />
        </linearGradient>
        <linearGradient id="barGrad3_muted" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={DARK} stopOpacity={0.6} />
          <stop offset="100%" stopColor={LIGHT} stopOpacity={0.6} />
        </linearGradient>
      </defs>

      {/* Baseline */}
      <line
        x1={55}
        y1={chartBottom}
        x2={425}
        y2={chartBottom}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
        style={fadeIn(isInView, 0.2)}
      />

      {/* Bars */}
      {bars.map((bar, i) => (
        <g key={`bar-${i}`}>
          <rect
            x={bar.x}
            y={chartBottom - (isInView ? bar.height : 0)}
            width={barWidth}
            height={isInView ? bar.height : 0}
            rx={4}
            fill="url(#barGrad3)"
            opacity={0.85}
            style={{
              transition: `all 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + i * 0.15}s`,
            }}
          />
          {/* Month label */}
          <text
            x={bar.x + barWidth / 2}
            y={chartBottom + 20}
            textAnchor="middle"
            fill={MUTED}
            fontSize={10}
            fontFamily={MONO}
            style={fadeInUp(isInView, 0.6 + i * 0.1)}
          >
            {bar.month}
          </text>
        </g>
      ))}

      {/* Growth curve overlay */}
      <path
        d={curvePath}
        fill="none"
        stroke={LIGHT}
        strokeWidth={2}
        strokeLinecap="round"
        style={lineDrawStyle(isInView, 0.8)}
      />

      {/* Curve data points */}
      {barTops.map((p, i) => (
        <circle
          key={`cpt-${i}`}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={WHITE}
          style={fadeIn(isInView, 1.0 + i * 0.1)}
        />
      ))}

      {/* "€500K" label above last bar */}
      <text
        x={barTops[3].x}
        y={barTops[3].y - 16}
        textAnchor="middle"
        fill={WHITE}
        fontSize={14}
        fontWeight={700}
        fontFamily={SANS}
        style={fadeInUp(isInView, 1.3)}
      >
        €500K
      </text>

      {/* +40% CM3 badge */}
      <g style={fadeInUp(isInView, 1.4)}>
        <rect
          x={360}
          y={18}
          width={100}
          height={28}
          rx={14}
          fill="rgba(46,154,196,0.15)"
          stroke="rgba(46,154,196,0.25)"
          strokeWidth={1}
        />
        {/* Checkmark */}
        <path
          d="M 374 32 L 378 36 L 384 28"
          fill="none"
          stroke={LIGHT}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={420}
          y={36}
          textAnchor="middle"
          fill={WHITE}
          fontSize={11}
          fontWeight={600}
          fontFamily={SANS}
        >
          +40% CM3
        </text>
      </g>

      {/* Snowflake icon near Aug */}
      <g
        style={fadeIn(isInView, 0.5)}
        transform={`translate(${bars[0].x + barWidth / 2}, ${chartBottom + 36})`}
      >
        {/* Simple 6-pointed star */}
        <line x1={0} y1={-5} x2={0} y2={5} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        <line x1={-4.3} y1={-2.5} x2={4.3} y2={2.5} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        <line x1={-4.3} y1={2.5} x2={4.3} y2={-2.5} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        {/* Small branches */}
        <line x1={0} y1={-5} x2={-1.5} y2={-3.5} stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} />
        <line x1={0} y1={-5} x2={1.5} y2={-3.5} stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} />
        <line x1={0} y1={5} x2={-1.5} y2={3.5} stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} />
        <line x1={0} y1={5} x2={1.5} y2={3.5} stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} />
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual4 — Globe (IM8 / David Beckham)
   ───────────────────────────────────────────── */

export function CaseVisual4() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  // Connection dots on globe surface
  const dots = [
    { cx: 220, cy: 120, r: 3 },    // Europe-ish
    { cx: 260, cy: 130, r: 3 },    // East Europe
    { cx: 240, cy: 100, r: 3 },    // North
    { cx: 205, cy: 155, r: 3 },    // SW
    { cx: 275, cy: 160, r: 3 },    // SE
    { cx: 248, cy: 145, r: 5 },    // DACH region (larger)
  ]

  // Connections between some dots
  const connections = [
    [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
    [0, 2], [1, 4],
  ]

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 360"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <GlowDefs />

      {/* Globe circle */}
      <circle
        cx={240}
        cy={155}
        r={80}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
        style={fadeIn(isInView, 0.3)}
      />

      {/* Latitude lines (3 ellipses) */}
      {[-25, 0, 25].map((offset, i) => (
        <ellipse
          key={`lat-${i}`}
          cx={240}
          cy={155 + offset}
          rx={Math.sqrt(80 * 80 - offset * offset)}
          ry={8}
          fill="none"
          stroke={GUIDE}
          strokeWidth={0.8}
          style={fadeIn(isInView, 0.4 + i * 0.1)}
        />
      ))}

      {/* Meridian (vertical ellipse) */}
      <ellipse
        cx={240}
        cy={155}
        rx={12}
        ry={80}
        fill="none"
        stroke={GUIDE}
        strokeWidth={0.8}
        style={fadeIn(isInView, 0.5)}
      />

      {/* Second meridian (slightly tilted) */}
      <ellipse
        cx={240}
        cy={155}
        rx={45}
        ry={80}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={0.6}
        style={fadeIn(isInView, 0.55)}
      />

      {/* Connection lines */}
      {connections.map(([from, to], i) => (
        <line
          key={`conn-${i}`}
          x1={dots[from].cx}
          y1={dots[from].cy}
          x2={dots[to].cx}
          y2={dots[to].cy}
          stroke="rgba(46,154,196,0.3)"
          strokeWidth={1}
          style={{
            ...lineDrawStyle(isInView, 0.6 + i * 0.05, 0.8),
            strokeDasharray: 200,
            strokeDashoffset: isInView ? 0 : 200,
          }}
        />
      ))}

      {/* Connection dots */}
      {dots.map((dot, i) => (
        <g key={`dot-${i}`} style={fadeIn(isInView, 0.8 + i * 0.08)}>
          {/* Glow on DACH dot */}
          {dot.r === 5 && (
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={12}
              fill={PRIMARY}
              opacity={0.2}
              filter="url(#glow)"
            />
          )}
          <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={PRIMARY} />
          {dot.r === 5 && (
            <circle cx={dot.cx} cy={dot.cy} r={2} fill={WHITE} opacity={0.7} />
          )}
        </g>
      ))}

      {/* "PREMIUM" badge — top-left */}
      <text
        x={35}
        y={40}
        fill={PRIMARY}
        fontSize={9}
        fontFamily={MONO}
        letterSpacing="0.2em"
        style={fadeInUp(isInView, 1.0)}
      >
        PREMIUM
      </text>

      {/* "INTERNATIONAL" badge — top-right */}
      <text
        x={445}
        y={40}
        textAnchor="end"
        fill={PRIMARY}
        fontSize={9}
        fontFamily={MONO}
        letterSpacing="0.2em"
        style={fadeInUp(isInView, 1.0)}
      >
        INTERNATIONAL
      </text>

      {/* "IM8" text */}
      <text
        x={240}
        y={280}
        textAnchor="middle"
        fill={WHITE}
        fontSize={24}
        fontWeight={700}
        fontFamily={SANS}
        letterSpacing="-0.02em"
        style={fadeInUp(isInView, 1.1)}
      >
        IM8
      </text>

      {/* "David Beckham" text */}
      <text
        x={240}
        y={302}
        textAnchor="middle"
        fill={MUTED}
        fontSize={12}
        fontFamily={SANS}
        style={fadeInUp(isInView, 1.2)}
      >
        David Beckham
      </text>

      {/* Subtle decorative ring */}
      <circle
        cx={240}
        cy={155}
        r={90}
        fill="none"
        stroke="rgba(46,154,196,0.06)"
        strokeWidth={0.5}
        strokeDasharray="3 6"
        style={fadeIn(isInView, 0.4)}
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual5 — Giant "30x" Typography
   ───────────────────────────────────────────── */

export function CaseVisual5() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  // Star polygon points for a 5-pointed star centered at origin, radius r
  function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
    const pts: string[] = []
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2
      const r = i % 2 === 0 ? outerR : innerR
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
    }
    return pts.join(' ')
  }

  const starSize = 9
  const starInner = 4
  const starsY = 225
  const starGap = 22
  const starsStartX = 240 - (4 * starGap) / 2

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 360"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <GlowDefs />

      {/* Dashed border frame */}
      <rect
        x={20}
        y={20}
        width={440}
        height={320}
        rx={12}
        fill="none"
        stroke="rgba(46,154,196,0.15)"
        strokeWidth={1}
        strokeDasharray="8 4"
        style={fadeIn(isInView, 0.2)}
      />

      {/* Decorative quote marks */}
      <text
        x={45}
        y={90}
        fill="rgba(46,154,196,0.1)"
        fontSize={60}
        fontFamily="Georgia, serif"
        style={fadeIn(isInView, 0.3)}
      >
        {'\u201C'}
      </text>

      {/* "30x" glow copy (behind) */}
      <text
        x={240}
        y={185}
        textAnchor="middle"
        fill={PRIMARY}
        fontSize={120}
        fontWeight={800}
        fontFamily={SANS}
        opacity={isInView ? 0.25 : 0}
        filter="url(#glowStrong)"
        style={{
          transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.5s`,
        }}
      >
        30x
      </text>

      {/* "30x" main text */}
      <text
        x={240}
        y={185}
        textAnchor="middle"
        fill={WHITE}
        fontSize={120}
        fontWeight={800}
        fontFamily={SANS}
        style={{
          opacity: isInView ? 1 : 0,
          transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s`,
        }}
      >
        30x
      </text>

      {/* 5 Trustpilot Stars */}
      {[0, 1, 2, 3, 4].map((i) => (
        <polygon
          key={`star-${i}`}
          points={starPoints(starsStartX + i * starGap, starsY, starSize, starInner)}
          fill="#00B67A"
          style={fadeIn(isInView, 0.9 + i * 0.08)}
        />
      ))}

      {/* "Trustpilot" label */}
      <text
        x={starsStartX + 4 * starGap + 22}
        y={starsY + 4}
        fill="rgba(255,255,255,0.3)"
        fontSize={10}
        fontFamily={SANS}
        style={fadeInUp(isInView, 1.3)}
      >
        Trustpilot
      </text>

      {/* Subtle horizontal decorative lines */}
      <line
        x1={50}
        y1={258}
        x2={430}
        y2={258}
        stroke="rgba(46,154,196,0.08)"
        strokeWidth={0.5}
        style={fadeIn(isInView, 1.0)}
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual6 — Timeline ($50K → $500K)
   ───────────────────────────────────────────── */

export function CaseVisual6() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const timelineY = 260
  const timelineX1 = 40
  const timelineX2 = 440
  const totalDots = 14
  const dotSpacing = (timelineX2 - timelineX1) / (totalDots - 1)

  // Timeline dots
  const dots = Array.from({ length: totalDots }, (_, i) => ({
    cx: timelineX1 + i * dotSpacing,
    cy: timelineY,
  }))

  // Growth curve control points (from $50K level to $500K level)
  const curveStartY = 230
  const curveEndY = 70
  const curvePath = `M ${dots[0].cx} ${curveStartY} C ${dots[0].cx + 60} ${curveStartY - 5}, ${dots[4].cx - 20} ${curveStartY - 30}, ${dots[4].cx} ${curveStartY - 40} C ${dots[4].cx + 40} ${curveStartY - 55}, ${dots[7].cx - 20} ${180}, ${dots[7].cx} ${165} C ${dots[7].cx + 40} ${150}, ${dots[10].cx - 20} ${120}, ${dots[10].cx} ${110} C ${dots[10].cx + 40} ${95}, ${dots[13].cx - 30} ${curveEndY + 15}, ${dots[13].cx} ${curveEndY}`

  // Area path
  const areaPath = `${curvePath} L ${dots[13].cx} ${timelineY} L ${dots[0].cx} ${timelineY} Z`

  // Intermediate labels
  const interLabels = [
    { index: 3, label: 'Mo 4' },
    { index: 7, label: 'Mo 8' },
    { index: 11, label: 'Mo 12' },
  ]

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 360"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <GlowDefs />

      <defs>
        <linearGradient id="areaGrad6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(46,154,196,0.12)" />
          <stop offset="100%" stopColor="rgba(46,154,196,0)" />
        </linearGradient>
      </defs>

      {/* Timeline base line */}
      <line
        x1={timelineX1}
        y1={timelineY}
        x2={timelineX2}
        y2={timelineY}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
        style={fadeIn(isInView, 0.2)}
      />

      {/* Timeline dots */}
      {dots.map((dot, i) => {
        const isEndpoint = i === 0 || i === totalDots - 1
        return (
          <g key={`tdot-${i}`} style={fadeIn(isInView, 0.3 + i * 0.04)}>
            {isEndpoint && (
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r={10}
                fill={PRIMARY}
                opacity={0.15}
                filter="url(#glow)"
              />
            )}
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={isEndpoint ? 5 : 2.5}
              fill={isEndpoint ? PRIMARY : 'rgba(255,255,255,0.2)'}
            />
            {isEndpoint && (
              <circle cx={dot.cx} cy={dot.cy} r={2} fill={WHITE} opacity={0.6} />
            )}
          </g>
        )
      })}

      {/* "$50K" label under first dot */}
      <text
        x={dots[0].cx}
        y={timelineY + 22}
        textAnchor="middle"
        fill={WHITE}
        fontSize={11}
        fontWeight={600}
        fontFamily={SANS}
        style={fadeInUp(isInView, 0.7)}
      >
        $50K
      </text>

      {/* "$500K" label under last dot */}
      <text
        x={dots[totalDots - 1].cx}
        y={timelineY + 22}
        textAnchor="middle"
        fill={WHITE}
        fontSize={11}
        fontWeight={600}
        fontFamily={SANS}
        style={fadeInUp(isInView, 0.7)}
      >
        $500K
      </text>

      {/* Intermediate month labels */}
      {interLabels.map(({ index, label }) => (
        <text
          key={`mlabel-${index}`}
          x={dots[index].cx}
          y={timelineY + 20}
          textAnchor="middle"
          fill="rgba(255,255,255,0.2)"
          fontSize={9}
          fontFamily={MONO}
          style={fadeInUp(isInView, 0.8)}
        >
          {label}
        </text>
      ))}

      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#areaGrad6)"
        style={fadeIn(isInView, 0.5)}
      />

      {/* Growth curve */}
      <path
        d={curvePath}
        fill="none"
        stroke={PRIMARY}
        strokeWidth={2}
        strokeLinecap="round"
        style={lineDrawStyle(isInView, 0.4)}
      />

      {/* "10x" badge */}
      <g style={fadeInUp(isInView, 1.2)}>
        <rect
          x={348}
          y={28}
          width={116}
          height={30}
          rx={8}
          fill="rgba(46,154,196,0.12)"
          stroke="rgba(46,154,196,0.25)"
          strokeWidth={1}
        />
        <text
          x={406}
          y={48}
          textAnchor="middle"
          fill={WHITE}
          fontSize={11}
          fontWeight={600}
          fontFamily={SANS}
        >
          10x in 14 Monaten
        </text>
      </g>

      {/* Play button */}
      <g style={fadeInUp(isInView, 1.4)} transform="translate(430, 310)">
        {/* Circle */}
        <circle
          cx={0}
          cy={0}
          r={16}
          fill="rgba(46,154,196,0.1)"
          stroke="rgba(46,154,196,0.3)"
          strokeWidth={1}
        />
        {/* Triangle (play icon) */}
        <polygon
          points="-4,-6 -4,6 7,0"
          fill="rgba(255,255,255,0.6)"
        />
        {/* "Video" label */}
        <text
          x={0}
          y={28}
          textAnchor="middle"
          fill={MUTED}
          fontSize={9}
          fontFamily={SANS}
        >
          Video
        </text>
      </g>

      {/* Subtle top decorative line */}
      <line
        x1={40}
        y1={50}
        x2={120}
        y2={50}
        stroke="rgba(46,154,196,0.1)"
        strokeWidth={0.5}
        style={fadeIn(isInView, 0.3)}
      />
    </svg>
  )
}
