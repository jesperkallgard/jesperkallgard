/**
 * Ljudeffekter syntetiserade med Web Audio API – inga externa
 * ljudfiler behövs. Allt är no-op vid SSR, när ljudet är avstängt
 * eller om webbläsaren saknar AudioContext.
 */

let ctx = null
let muted = false
let cachedNoise = null

export const setMuted = value => {
  muted = value
}

const getCtx = () => {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === "suspended") ctx.resume()
  return ctx
}

// Publikljud: bandpassfiltrerat brus med mjuk volymkurva
const crowd = (c, at, dur, peak) => {
  if (!cachedNoise) {
    const len = c.sampleRate * 2
    cachedNoise = c.createBuffer(1, len, c.sampleRate)
    const data = cachedNoise.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  }
  const src = c.createBufferSource()
  src.buffer = cachedNoise
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.value = 900
  filter.Q.value = 0.6
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + dur * 0.25)
  gain.gain.exponentialRampToValueAtTime(0.001, at + dur)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(c.destination)
  src.start(at)
  src.stop(at + dur + 0.1)
}

const tone = (c, { freq, at, dur, type = "sine", vol = 0.12, slide }) => {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, at + dur)
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + dur)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(at)
  osc.stop(at + dur + 0.05)
}

// Domarvissla: två lätt särstämda fyrkantsvågor låter skarpt och "plastigt"
const whistle = (c, at, dur) => {
  tone(c, { freq: 2350, at, dur, type: "square", vol: 0.05 })
  tone(c, { freq: 2280, at, dur, type: "square", vol: 0.035 })
}

const safe = fn => {
  if (muted) return
  try {
    const c = getCtx()
    if (c) fn(c, c.currentTime)
  } catch (e) {
    // Ljud får aldrig krascha spelet
  }
}

export const sounds = {
  correct: () =>
    safe((c, t) => tone(c, { freq: 660, at: t, dur: 0.09, slide: 990, vol: 0.07 })),

  goal: () =>
    safe((c, t) => {
      crowd(c, t, 1.8, 0.25)
      tone(c, { freq: 523, at: t, dur: 0.12, vol: 0.1 })
      tone(c, { freq: 659, at: t + 0.12, dur: 0.12, vol: 0.1 })
      tone(c, { freq: 784, at: t + 0.24, dur: 0.28, vol: 0.1 })
    }),

  card: () =>
    safe((c, t) => {
      whistle(c, t, 0.18)
      whistle(c, t + 0.26, 0.32)
      tone(c, { freq: 150, at: t, dur: 0.3, type: "sawtooth", vol: 0.05 })
    }),

  varCheck: () =>
    safe((c, t) => {
      tone(c, { freq: 880, at: t, dur: 0.1, vol: 0.08 })
      tone(c, { freq: 1318, at: t + 0.15, dur: 0.18, vol: 0.08 })
    }),

  halftime: () =>
    safe((c, t) => {
      whistle(c, t, 0.5)
      crowd(c, t, 1.2, 0.1)
    }),

  win: () =>
    safe((c, t) => {
      whistle(c, t, 0.2)
      whistle(c, t + 0.3, 0.2)
      whistle(c, t + 0.6, 0.7)
      crowd(c, t + 0.5, 4, 0.3)
      ;[523, 659, 784, 1046].forEach((freq, i) =>
        tone(c, { freq, at: t + 1 + i * 0.18, dur: 0.35, vol: 0.11 })
      )
    }),

  rain: () => safe((c, t) => crowd(c, t, 3, 0.15)),
}
