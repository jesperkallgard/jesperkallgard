import React, { useState, useEffect, useCallback, useRef } from "react"
import styled, { keyframes, css } from "styled-components"
import { Theme, H1, Subheader } from "../theme"
import { generatePuzzle } from "./generator"
import { sounds, setMuted } from "./sounds"

const MAX_HINTS = 3
const HINT_COST = 10
const CORRECT_POINTS = 2
const WRONG_POINTS = 1
// Combon dör om det går längre än så här mellan två rätta siffror
const COMBO_WINDOW_MS = 45000

// Combo: var tredje rätta svar i rad höjer multiplikatorn, max x4
const comboMultiplier = streak => Math.min(4, 1 + Math.floor(streak / 3))

const COMBO_LABELS = {
  2: "HATTRICK! ⚽",
  3: "MÅLSPRUTA! 🔥",
  4: "VÄRLDSKLASS! ⭐",
}

const GOAL_SHOUTS = [
  "MÅÅÅL!",
  "Vilket skott!",
  "I KRYSSET!",
  "Nätet dallrar!",
  "Vilken frispark!",
]

const LEVEL_NAMES = [
  "Knattelag",
  "Korpen",
  "Division 5",
  "Superettan",
  "Allsvenskan",
  "Landslaget",
  "Champions League",
  "VM-kval",
  "VM-semifinal",
  "VM-FINAL",
]

const TEAMS = [
  { flag: "🇸🇪", name: "Sverige" },
  { flag: "🇧🇷", name: "Brasilien" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇫🇷", name: "Frankrike" },
  { flag: "🇩🇪", name: "Tyskland" },
  { flag: "🇪🇸", name: "Spanien" },
  { flag: "🇮🇹", name: "Italien" },
  { flag: "🇵🇹", name: "Portugal" },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "England" },
]

const formatTime = totalSeconds => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const vibrate = pattern => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

const Wrapper = styled.section`
  max-width: 560px;
  margin: 0 auto;
`

const StartScreen = styled.div`
  text-align: center;
`

const LevelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 2rem 0;
`

const LevelButton = styled.button`
  padding: 0.8rem 0 0.6rem;
  font-family: ${Theme.fontHeader};
  font-size: 1.2rem;
  font-weight: 700;
  color: ${Theme.colorHeader};
  background: #2a2a2a;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  small {
    display: block;
    font-size: 0.55rem;
    font-weight: 400;
    color: ${Theme.colorText};
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &:hover {
    border-color: ${Theme.accentColor};
    background: #333;
  }
`

const TeamRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 1rem 0 0.5rem;
`

const TeamButton = styled.button`
  font-size: 1.6rem;
  line-height: 1;
  padding: 0.45rem 0.55rem;
  background: ${props => (props.active ? "#3d2233" : "#2a2a2a")};
  border: 2px solid ${props => (props.active ? Theme.accentColor : "#3a3a3a")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${Theme.accentColor};
  }
`

const MuteButton = styled.button`
  font-size: 1.2rem;
  line-height: 1;
  padding: 0.4rem 0.5rem;
  background: transparent;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    border-color: ${Theme.accentColor};
  }
`

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const Stat = styled.div`
  color: ${Theme.colorText};
  font-size: 0.9rem;

  strong {
    display: block;
    color: ${Theme.colorHeader};
    font-size: 1.4rem;
    font-family: ${Theme.fontHeader};
  }
`

const comboPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`

const ComboBadge = styled.div`
  color: ${Theme.accentColor};
  font-weight: 700;
  font-size: 1.1rem;
  animation: ${comboPop} 0.3s ease;

  small {
    display: block;
    font-size: 0.7rem;
    color: ${Theme.colorText};
    font-weight: 400;
    text-align: right;
  }
`

const BoardWrap = styled.div`
  position: relative;
`

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  border: 3px solid ${Theme.accentColor};
  border-radius: 4px;
  user-select: none;
`

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`

const Cell = styled.button`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${Theme.fontHeader};
  font-size: clamp(0.9rem, 3.5vw, 1.4rem);
  border: 1px solid #3a3a3a;
  background: ${props =>
    props.peer ? (props.given ? "#2b2b2b" : "#262626") : props.given ? "#252525" : "#1e1e1e"};
  color: ${props =>
    props.given
      ? Theme.colorText
      : props.hinted
      ? Theme.linkColor
      : Theme.colorHeader};
  font-weight: ${props => (props.given ? 400 : 700)};
  cursor: pointer;
  padding: 0;

  ${props =>
    props.rightEdge &&
    css`
      border-right: 2px solid ${Theme.accentColor};
    `}
  ${props =>
    props.bottomEdge &&
    css`
      border-bottom: 2px solid ${Theme.accentColor};
    `}
  ${props =>
    props.sameValue &&
    css`
      background: #3d2233;
      color: #fff;
    `}
  ${props =>
    props.selected &&
    css`
      background: #3d2233;
      box-shadow: inset 0 0 0 2px ${Theme.accentColor};
    `}
  ${props =>
    props.error &&
    css`
      background: #5a1f1f;
      animation: ${shake} 0.3s ease;
    `}
`

const goalPop = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  20% { transform: scale(1.15); opacity: 1; }
  80% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
`

const flyAcross = keyframes`
  0% { left: -12%; transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(360deg) translateY(-40px); }
  100% { left: 105%; transform: rotate(720deg) translateY(0); }
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
`

const GoalText = styled.div`
  font-family: ${Theme.fontHeader};
  font-size: clamp(2rem, 9vw, 3.5rem);
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 20px ${Theme.accentColor}, 0 4px 12px rgba(0, 0, 0, 0.8);
  animation: ${goalPop} 1.4s ease forwards;
`

const FlyingBall = styled.div`
  position: absolute;
  top: 42%;
  left: -12%;
  font-size: 2.6rem;
  animation: ${flyAcross} 1.2s ease-in-out forwards;
`

const CardBig = styled.div`
  font-size: 4rem;
  line-height: 1;
  animation: ${goalPop} 1.2s ease forwards;
`

const CardText = styled.div`
  font-family: ${Theme.fontHeader};
  font-weight: 700;
  font-size: 1.3rem;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  animation: ${goalPop} 1.2s ease forwards;
  text-align: center;
`

const HalftimeText = styled.div`
  font-family: ${Theme.fontHeader};
  font-size: clamp(1.8rem, 8vw, 3rem);
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 20px ${Theme.accentColor}, 0 4px 12px rgba(0, 0, 0, 0.8);
  animation: ${goalPop} 2s ease forwards;
`

const fall = keyframes`
  0% { transform: translateY(-12vh) rotate(0deg); }
  100% { transform: translateY(112vh) rotate(720deg); }
`

const Rain = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;

  span {
    position: absolute;
    top: -10vh;
    font-size: 2rem;
    animation-name: ${fall};
    animation-timing-function: linear;
    animation-iteration-count: ${props => (props.loop ? "infinite" : 1)};
    animation-fill-mode: forwards;
  }
`

// Deterministiska positioner så regnet ser slumpat ut utan Math.random
const RAIN_ITEMS = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 41 + 13) % 100,
  delay: (i % 8) * 0.3,
  duration: 2.6 + (i % 5) * 0.5,
  emoji: ["⚽", "⚽", "⚽", "🏆", "⭐", "🎉"][i % 6],
}))

const FootballRain = ({ loop }) => (
  <Rain loop={loop}>
    {RAIN_ITEMS.map((item, i) => (
      <span
        key={i}
        style={{
          left: `${item.left}%`,
          animationDelay: `${item.delay}s`,
          animationDuration: `${item.duration}s`,
        }}
      >
        {item.emoji}
      </span>
    ))}
  </Rain>
)

const NumberPad = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
  margin-top: 1rem;
`

const PadButton = styled.button`
  padding: 0.8rem 0;
  font-family: ${Theme.fontHeader};
  font-size: 1.2rem;
  font-weight: 700;
  color: ${Theme.colorHeader};
  background: #2a2a2a;
  border: 2px solid #3a3a3a;
  border-radius: 6px;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${Theme.accentColor};
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 1rem;
`

const ActionButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  font-family: ${Theme.fontHeader};
  font-size: 1rem;
  font-weight: 700;
  color: ${props => (props.primary ? "#fff" : Theme.colorText)};
  background: ${props => (props.primary ? Theme.accentColor : "transparent")};
  border: 2px solid
    ${props => (props.primary ? Theme.accentColor : "#3a3a3a")};
  border-radius: 6px;
  cursor: pointer;

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`

const WinScreen = styled.div`
  text-align: center;

  strong {
    display: block;
    font-size: 4rem;
    color: ${Theme.accentColor};
    font-family: ${Theme.fontHeader};
    margin: 0.5rem 0;
  }
`

const Trophy = styled.div`
  font-size: 5rem;
  line-height: 1;
  margin-bottom: 1rem;
  animation: ${comboPop} 0.6s ease;
`

const MatchResult = styled.div`
  font-family: ${Theme.fontHeader};
  font-size: 1.8rem;
  font-weight: 700;
  color: ${Theme.colorHeader};
  margin: 0.5rem 0 1rem;
`

const MatchFacts = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem auto;
  max-width: 320px;
  text-align: left;
  color: ${Theme.colorText};
  font-size: 0.95rem;

  li {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0;
    border-bottom: 1px solid #2a2a2a;

    span:last-child {
      color: ${Theme.colorHeader};
      font-weight: 700;
    }
  }
`

const Loading = styled.p`
  color: ${Theme.colorText};
  text-align: center;
  padding: 4rem 0;
`

// Blir raden, kolumnen eller 3x3-rutan för idx komplett i brädet?
const completesUnit = (board, idx) => {
  const row = Math.floor(idx / 9)
  const col = idx % 9

  let rowFull = true
  let colFull = true
  for (let k = 0; k < 9; k++) {
    if (board[row * 9 + k] === 0) rowFull = false
    if (board[k * 9 + col] === 0) colFull = false
  }

  let boxFull = true
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r * 9 + c] === 0) boxFull = false
    }
  }

  return rowFull || colFull || boxFull
}

const isPeer = (a, b) => {
  if (a === null || a === b) return false
  const ra = Math.floor(a / 9)
  const ca = a % 9
  const rb = Math.floor(b / 9)
  const cb = b % 9
  if (ra === rb || ca === cb) return true
  return (
    Math.floor(ra / 3) === Math.floor(rb / 3) &&
    Math.floor(ca / 3) === Math.floor(cb / 3)
  )
}

const SudokuGame = () => {
  const [status, setStatus] = useState("menu") // menu | loading | playing | won
  const [level, setLevel] = useState(null)
  const [puzzle, setPuzzle] = useState([])
  const [solution, setSolution] = useState([])
  const [board, setBoard] = useState([])
  const [hinted, setHinted] = useState([])
  const [selected, setSelected] = useState(null)
  const [errorCell, setErrorCell] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS)
  // Påskägg och spelkänsla
  const [overlay, setOverlay] = useState(null) // {kind, id, text}
  const [goalCount, setGoalCount] = useState(0)
  const [wrongInARow, setWrongInARow] = useState(0)
  const [titleClicks, setTitleClicks] = useState(0)
  const [secretRain, setSecretRain] = useState(false)
  const [muted, setMutedState] = useState(false)
  const [team, setTeam] = useState(0)
  const [opponent, setOpponent] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [halfDone, setHalfDone] = useState(false)
  const [highlightValue, setHighlightValue] = useState(null)
  const [stats, setStats] = useState({ wrong: 0, hattricks: 0, yellow: 0, red: 0 })
  const [timeBonus, setTimeBonus] = useState(0)
  const lastCorrectAt = useRef(0)

  // Ljudinställningen sparas mellan besök
  useEffect(() => {
    const saved = window.localStorage.getItem("sudoku-muted") === "1"
    setMutedState(saved)
    setMuted(saved)
  }, [])

  const toggleMute = () => {
    const next = !muted
    setMutedState(next)
    setMuted(next)
    window.localStorage.setItem("sudoku-muted", next ? "1" : "0")
  }

  // Matchklockan tickar medan man spelar
  useEffect(() => {
    if (status !== "playing") return
    const timer = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [status])

  const showOverlay = (kind, text, duration = 1400) => {
    const id = Date.now() + Math.random()
    setOverlay({ kind, text, id })
    setTimeout(() => setOverlay(o => (o && o.id === id ? null : o)), duration)
  }

  const startGame = chosenLevel => {
    setStatus("loading")
    setLevel(chosenLevel)
    // Slumpa fram en motståndare som inte är ens eget lag
    const others = TEAMS.map((_, i) => i).filter(i => i !== team)
    setOpponent(others[Math.floor(Math.random() * others.length)])
    // Låt laddningstexten hinna renderas innan generatorn kör
    setTimeout(() => {
      const { puzzle: p, solution: s } = generatePuzzle(chosenLevel)
      setPuzzle(p)
      setSolution(s)
      setBoard(p.slice())
      setHinted([])
      setSelected(null)
      setErrorCell(null)
      setScore(0)
      setStreak(0)
      setHintsLeft(MAX_HINTS)
      setOverlay(null)
      setGoalCount(0)
      setWrongInARow(0)
      setSeconds(0)
      setHalfDone(false)
      setHighlightValue(null)
      setStats({ wrong: 0, hattricks: 0, yellow: 0, red: 0 })
      setTimeBonus(0)
      lastCorrectAt.current = 0
      setStatus("playing")
    }, 50)
  }

  const finishGame = finalLevel => {
    // Tidsbonus: klara matchen före "full tid" för nivån
    const parSeconds = 180 + finalLevel * 60
    const bonus = Math.max(0, Math.floor((parSeconds - seconds) / 10))
    setTimeBonus(bonus)
    setScore(s => s + bonus)
    setStatus("won")
    sounds.win()
    vibrate([80, 60, 80, 60, 200])
  }

  const placeNumber = useCallback(
    value => {
      if (status !== "playing" || selected === null) return
      if (board[selected] !== 0) return

      if (solution[selected] === value) {
        const newBoard = board.slice()
        newBoard[selected] = value
        // Combon kräver att förra rätta siffran sattes nyligen
        const now = Date.now()
        const fresh =
          streak === 0 || now - lastCorrectAt.current <= COMBO_WINDOW_MS
        const effectiveStreak = fresh ? streak : 0
        const newStreak = effectiveStreak + 1
        lastCorrectAt.current = now

        setBoard(newBoard)
        setStreak(newStreak)
        setScore(s => s + CORRECT_POINTS * comboMultiplier(effectiveStreak))
        setSelected(null)
        setWrongInARow(0)
        if (newStreak > 0 && newStreak % 3 === 0) {
          setStats(st => ({ ...st, hattricks: st.hattricks + 1 }))
        }

        if (newBoard.indexOf(0) === -1) {
          finishGame(level)
          return
        }

        if (completesUnit(newBoard, selected)) {
          showOverlay("goal", GOAL_SHOUTS[goalCount % GOAL_SHOUTS.length])
          setGoalCount(g => g + 1)
          sounds.goal()
          vibrate([60, 40, 120])
        } else {
          sounds.correct()
        }

        // Halvlek när hälften av de tomma rutorna är ifyllda
        const totalEmpty = puzzle.filter(v => v === 0).length
        const leftEmpty = newBoard.filter(v => v === 0).length
        if (!halfDone && leftEmpty <= totalEmpty / 2) {
          setHalfDone(true)
          setTimeout(() => {
            showOverlay("halftime", "", 2000)
            sounds.halftime()
          }, 900)
        }
      } else {
        setScore(s => s - WRONG_POINTS)
        setStreak(0)
        setErrorCell(selected)
        setTimeout(() => setErrorCell(null), 350)
        const newWrong = wrongInARow + 1
        setWrongInARow(newWrong)
        sounds.card()
        if (newWrong === 1) {
          showOverlay("yellow", "Gult kort av domaren!", 1200)
          setStats(st => ({ ...st, wrong: st.wrong + 1, yellow: st.yellow + 1 }))
        } else {
          showOverlay("red", "Rött kort! Men du får spela vidare 😄", 1400)
          setStats(st => ({ ...st, wrong: st.wrong + 1, red: st.red + 1 }))
        }
      }
    },
    [status, selected, board, solution, streak, goalCount, wrongInARow, puzzle, halfDone, level, seconds]
  )

  const useHint = useCallback(() => {
    if (status !== "playing" || hintsLeft <= 0) return

    let target = selected
    if (target === null || board[target] !== 0) {
      const empties = board
        .map((v, i) => (v === 0 ? i : -1))
        .filter(i => i !== -1)
      if (empties.length === 0) return
      target = empties[Math.floor(Math.random() * empties.length)]
    }

    const newBoard = board.slice()
    newBoard[target] = solution[target]
    setBoard(newBoard)
    setHinted(h => [...h, target])
    setHintsLeft(h => h - 1)
    setScore(s => s - HINT_COST)
    setStreak(0)
    setSelected(null)
    setWrongInARow(0)
    if (newBoard.indexOf(0) === -1) {
      finishGame(level)
    } else {
      showOverlay("var", "VAR har kollat: siffran godkänd! 📺", 1400)
      sounds.varCheck()
    }
  }, [status, hintsLeft, selected, board, solution, level, seconds])

  useEffect(() => {
    const onKeyDown = e => {
      if (status !== "playing") return
      if (e.key >= "1" && e.key <= "9") placeNumber(Number(e.key))
      if (e.key === "Escape") {
        setSelected(null)
        setHighlightValue(null)
      }
      if (selected !== null) {
        if (e.key === "ArrowLeft") setSelected(s => Math.max(0, s - 1))
        if (e.key === "ArrowRight") setSelected(s => Math.min(80, s + 1))
        if (e.key === "ArrowUp") setSelected(s => (s >= 9 ? s - 9 : s))
        if (e.key === "ArrowDown") setSelected(s => (s <= 71 ? s + 9 : s))
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [status, selected, placeNumber])

  // Hemligt påskägg: fem klick på rubriken ger fotbollsregn
  const onTitleClick = () => {
    const clicks = titleClicks + 1
    setTitleClicks(clicks)
    if (clicks >= 5) {
      setTitleClicks(0)
      setSecretRain(true)
      sounds.rain()
      setTimeout(() => setSecretRain(false), 4200)
    }
  }

  const onCellClick = i => {
    if (board[i] === 0) {
      setSelected(i)
      setHighlightValue(null)
    } else {
      // Klick på en ifylld siffra tänder alla likadana
      setSelected(null)
      setHighlightValue(v => (v === board[i] ? null : board[i]))
    }
  }

  // Hur många av varje siffra som redan är utplacerade
  const numberCounts = board.reduce((acc, v) => {
    if (v > 0) acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})

  const multiplier = comboMultiplier(streak)
  const myTeam = TEAMS[team]
  const oppTeam = TEAMS[opponent]

  if (status === "menu") {
    return (
      <Wrapper>
        {secretRain && <FootballRain />}
        <StartScreen>
          <Subheader>Spel · VM-special ⚽</Subheader>
          <H1
            style={{ textAlign: "center", maxWidth: "none", cursor: "pointer" }}
            onClick={onTitleClick}
            title="Psst … prova att klicka fem gånger"
          >
            Sudoku
          </H1>
          <p style={{ color: Theme.colorText, marginBottom: 0 }}>
            Välj ditt landslag:
          </p>
          <TeamRow>
            {TEAMS.map((t, i) => (
              <TeamButton
                key={t.name}
                active={team === i}
                onClick={() => setTeam(i)}
                title={t.name}
                aria-label={`Spela som ${t.name}`}
              >
                {t.flag}
              </TeamButton>
            ))}
            <MuteButton
              onClick={toggleMute}
              title={muted ? "Slå på ljudet" : "Stäng av ljudet"}
              aria-label={muted ? "Slå på ljudet" : "Stäng av ljudet"}
            >
              {muted ? "🔇" : "🔊"}
            </MuteButton>
          </TeamRow>
          <p style={{ color: Theme.colorText }}>
            Välj svårighetsgrad – 1 är lättast, 10 är svårast.
          </p>
          <LevelGrid>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => (
              <LevelButton key={l} onClick={() => startGame(l)}>
                {l}
                <small>{LEVEL_NAMES[l - 1]}</small>
              </LevelButton>
            ))}
          </LevelGrid>
          <p style={{ color: Theme.colorText, fontSize: "0.85rem" }}>
            Rätt siffra +{CORRECT_POINTS} poäng · Fel siffra −{WRONG_POINTS}{" "}
            poäng · VAR-hjälp −{HINT_COST} poäng (max {MAX_HINTS} ggr) · Combo
            ger upp till x4 · Snabb seger ger tidsbonus
          </p>
        </StartScreen>
      </Wrapper>
    )
  }

  if (status === "loading") {
    return (
      <Wrapper>
        <Loading>Kritar planen och pumpar bollen … ⚽</Loading>
      </Wrapper>
    )
  }

  if (status === "won") {
    const goalsFor = Math.max(goalCount + 1, stats.red + 1)
    return (
      <Wrapper>
        <FootballRain loop />
        <WinScreen>
          <Trophy>🏆</Trophy>
          <Subheader>
            {LEVEL_NAMES[level - 1]} avklarad – nivå {level}
          </Subheader>
          <H1 style={{ textAlign: "center", maxWidth: "none" }}>
            {myTeam.name.toUpperCase()} ÄR VÄRLDSMÄSTARE!
          </H1>
          <MatchResult>
            {myTeam.flag} {goalsFor} – {stats.red} {oppTeam.flag}
          </MatchResult>
          <p style={{ color: Theme.colorText, margin: 0 }}>
            Domaren blåser av matchen – din slutpoäng
          </p>
          <strong>{score}</strong>
          <MatchFacts>
            <li>
              <span>⏱ Speltid</span>
              <span>{formatTime(seconds)}</span>
            </li>
            <li>
              <span>⚡ Tidsbonus</span>
              <span>+{timeBonus}</span>
            </li>
            <li>
              <span>⚽ Hattricks</span>
              <span>{stats.hattricks}</span>
            </li>
            <li>
              <span>🎯 Felskott</span>
              <span>{stats.wrong}</span>
            </li>
            <li>
              <span>🟨 Gula kort</span>
              <span>{stats.yellow}</span>
            </li>
            <li>
              <span>🟥 Röda kort</span>
              <span>{stats.red}</span>
            </li>
            <li>
              <span>📊 Bollinnehav</span>
              <span>100 %</span>
            </li>
          </MatchFacts>
          <ActionRow>
            <ActionButton primary onClick={() => startGame(level)}>
              Returmöte ⚽
            </ActionButton>
            <ActionButton onClick={() => setStatus("menu")}>
              Byt division
            </ActionButton>
          </ActionRow>
        </WinScreen>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      {secretRain && <FootballRain />}
      <StatusBar>
        <Stat>
          Poäng <strong>{score}</strong>
        </Stat>
        <Stat>
          {myTeam.flag} mot {oppTeam.flag}
          <strong>⏱ {formatTime(seconds)}</strong>
        </Stat>
        <Stat>
          VAR kvar <strong>{hintsLeft}</strong>
        </Stat>
        <MuteButton
          onClick={toggleMute}
          title={muted ? "Slå på ljudet" : "Stäng av ljudet"}
          aria-label={muted ? "Slå på ljudet" : "Stäng av ljudet"}
        >
          {muted ? "🔇" : "🔊"}
        </MuteButton>
        {multiplier > 1 && (
          <ComboBadge key={streak}>
            {COMBO_LABELS[multiplier]}
            <small>combo x{multiplier}</small>
          </ComboBadge>
        )}
      </StatusBar>

      <BoardWrap>
        <Board>
          {board.map((value, i) => {
            const col = i % 9
            const row = Math.floor(i / 9)
            const isGiven = puzzle[i] !== 0
            return (
              <Cell
                key={i}
                given={isGiven}
                hinted={hinted.includes(i)}
                selected={selected === i}
                peer={isPeer(selected, i)}
                sameValue={highlightValue !== null && value === highlightValue}
                error={errorCell === i}
                rightEdge={col === 2 || col === 5}
                bottomEdge={row === 2 || row === 5}
                onClick={() => onCellClick(i)}
                aria-label={`Rad ${row + 1}, kolumn ${col + 1}${
                  value ? `, värde ${value}` : ", tom"
                }`}
              >
                {value || ""}
              </Cell>
            )
          })}
        </Board>

        {overlay && overlay.kind === "goal" && (
          <Overlay key={overlay.id}>
            <FlyingBall>⚽</FlyingBall>
            <GoalText>{overlay.text}</GoalText>
          </Overlay>
        )}
        {overlay && (overlay.kind === "yellow" || overlay.kind === "red") && (
          <Overlay key={overlay.id}>
            <CardBig>{overlay.kind === "yellow" ? "🟨" : "🟥"}</CardBig>
            <CardText>{overlay.text}</CardText>
          </Overlay>
        )}
        {overlay && overlay.kind === "var" && (
          <Overlay key={overlay.id}>
            <CardBig>📺</CardBig>
            <CardText>{overlay.text}</CardText>
          </Overlay>
        )}
        {overlay && overlay.kind === "halftime" && (
          <Overlay key={overlay.id}>
            <HalftimeText>HALVLEK</HalftimeText>
            <CardText>
              Ställning: {score} poäng efter {formatTime(seconds)}
            </CardText>
          </Overlay>
        )}
      </BoardWrap>

      <NumberPad>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <PadButton
            key={n}
            disabled={selected === null || (numberCounts[n] || 0) >= 9}
            onClick={() => placeNumber(n)}
          >
            {n}
          </PadButton>
        ))}
      </NumberPad>

      <ActionRow>
        <ActionButton
          primary
          disabled={hintsLeft <= 0}
          onClick={useHint}
          title={`VAR lägger in en korrekt siffra (−${HINT_COST} poäng)`}
        >
          📺 VAR-granskning ({hintsLeft} kvar, −{HINT_COST}p)
        </ActionButton>
        <ActionButton onClick={() => setStatus("menu")}>Avsluta</ActionButton>
      </ActionRow>
    </Wrapper>
  )
}

export default SudokuGame
