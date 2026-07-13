import React, { useState, useEffect, useCallback } from "react"
import styled, { keyframes, css } from "styled-components"
import { Theme, H1, Subheader } from "../theme"
import { generatePuzzle } from "./generator"

const MAX_HINTS = 3
const HINT_COST = 10
const CORRECT_POINTS = 2
const WRONG_POINTS = 1

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
  background: ${props => (props.given ? "#252525" : "#1e1e1e")};
  color: ${props =>
    props.given
      ? Theme.colorText
      : props.hinted
      ? Theme.linkColor
      : Theme.colorHeader};
  font-weight: ${props => (props.given ? 400 : 700)};
  cursor: ${props => (props.locked ? "default" : "pointer")};
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
    margin: 1rem 0;
  }
`

const Trophy = styled.div`
  font-size: 5rem;
  line-height: 1;
  margin-bottom: 1rem;
  animation: ${comboPop} 0.6s ease;
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
  // Påskägg
  const [overlay, setOverlay] = useState(null) // {kind: 'goal'|'yellow'|'red'|'var', id, text}
  const [goalCount, setGoalCount] = useState(0)
  const [wrongInARow, setWrongInARow] = useState(0)
  const [titleClicks, setTitleClicks] = useState(0)
  const [secretRain, setSecretRain] = useState(false)

  const showOverlay = (kind, text, duration = 1400) => {
    const id = Date.now()
    setOverlay({ kind, text, id })
    setTimeout(
      () => setOverlay(o => (o && o.id === id ? null : o)),
      duration
    )
  }

  const startGame = chosenLevel => {
    setStatus("loading")
    setLevel(chosenLevel)
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
      setStatus("playing")
    }, 50)
  }

  const placeNumber = useCallback(
    value => {
      if (status !== "playing" || selected === null) return
      if (board[selected] !== 0) return

      if (solution[selected] === value) {
        const newBoard = board.slice()
        newBoard[selected] = value
        const newStreak = streak + 1
        setBoard(newBoard)
        setStreak(newStreak)
        setScore(s => s + CORRECT_POINTS * comboMultiplier(streak))
        setSelected(null)
        setWrongInARow(0)
        if (newBoard.indexOf(0) === -1) {
          setStatus("won")
        } else if (completesUnit(newBoard, selected)) {
          showOverlay("goal", GOAL_SHOUTS[goalCount % GOAL_SHOUTS.length])
          setGoalCount(g => g + 1)
        }
      } else {
        setScore(s => s - WRONG_POINTS)
        setStreak(0)
        setErrorCell(selected)
        setTimeout(() => setErrorCell(null), 350)
        const newWrong = wrongInARow + 1
        setWrongInARow(newWrong)
        if (newWrong === 1) {
          showOverlay("yellow", "Gult kort av domaren!", 1200)
        } else {
          showOverlay("red", "Rött kort! Men du får spela vidare 😄", 1400)
        }
      }
    },
    [status, selected, board, solution, streak, goalCount, wrongInARow]
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
      setStatus("won")
    } else {
      showOverlay("var", "VAR har kollat: siffran godkänd! 📺", 1400)
    }
  }, [status, hintsLeft, selected, board, solution])

  useEffect(() => {
    const onKeyDown = e => {
      if (status !== "playing") return
      if (e.key >= "1" && e.key <= "9") placeNumber(Number(e.key))
      if (e.key === "Escape") setSelected(null)
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
      setTimeout(() => setSecretRain(false), 4200)
    }
  }

  // Hur många av varje siffra som redan är utplacerade
  const numberCounts = board.reduce((acc, v) => {
    if (v > 0) acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})

  const multiplier = comboMultiplier(streak)

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
            ger upp till x4
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
    return (
      <Wrapper>
        <FootballRain loop />
        <WinScreen>
          <Trophy>🏆</Trophy>
          <Subheader>{LEVEL_NAMES[level - 1]} avklarad – nivå {level}</Subheader>
          <H1 style={{ textAlign: "center", maxWidth: "none" }}>
            VÄRLDSMÄSTARE!
          </H1>
          <p style={{ color: Theme.colorText }}>
            Domaren blåser av matchen – din slutpoäng
          </p>
          <strong>{score}</strong>
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
          Nivå <strong>{level}</strong>
        </Stat>
        <Stat>
          VAR kvar <strong>{hintsLeft}</strong>
        </Stat>
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
            const isLocked = value !== 0
            return (
              <Cell
                key={i}
                given={isGiven}
                hinted={hinted.includes(i)}
                locked={isLocked}
                selected={selected === i}
                error={errorCell === i}
                rightEdge={col === 2 || col === 5}
                bottomEdge={row === 2 || row === 5}
                onClick={() => !isLocked && setSelected(i)}
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
