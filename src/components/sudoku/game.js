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
  padding: 1rem 0;
  font-family: ${Theme.fontHeader};
  font-size: 1.2rem;
  font-weight: 700;
  color: ${Theme.colorHeader};
  background: #2a2a2a;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

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
  font-size: 1.2rem;
  animation: ${comboPop} 0.3s ease;
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

const Loading = styled.p`
  color: ${Theme.colorText};
  text-align: center;
  padding: 4rem 0;
`

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
        if (newBoard.indexOf(0) === -1) setStatus("won")
      } else {
        setScore(s => s - WRONG_POINTS)
        setStreak(0)
        setErrorCell(selected)
        setTimeout(() => setErrorCell(null), 350)
      }
    },
    [status, selected, board, solution, streak]
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
    if (newBoard.indexOf(0) === -1) setStatus("won")
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

  // Hur många av varje siffra som redan är utplacerade
  const numberCounts = board.reduce((acc, v) => {
    if (v > 0) acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})

  const multiplier = comboMultiplier(streak)

  if (status === "menu") {
    return (
      <Wrapper>
        <StartScreen>
          <Subheader>Spel</Subheader>
          <H1 style={{ textAlign: "center", maxWidth: "none" }}>Sudoku</H1>
          <p style={{ color: Theme.colorText }}>
            Välj svårighetsgrad – 1 är lättast, 10 är svårast.
          </p>
          <LevelGrid>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => (
              <LevelButton key={l} onClick={() => startGame(l)}>
                {l}
              </LevelButton>
            ))}
          </LevelGrid>
          <p style={{ color: Theme.colorText, fontSize: "0.85rem" }}>
            Rätt siffra +{CORRECT_POINTS} poäng · Fel siffra −{WRONG_POINTS}{" "}
            poäng · Hjälp −{HINT_COST} poäng (max {MAX_HINTS} ggr) · Combo ger
            upp till x4
          </p>
        </StartScreen>
      </Wrapper>
    )
  }

  if (status === "loading") {
    return (
      <Wrapper>
        <Loading>Genererar pussel …</Loading>
      </Wrapper>
    )
  }

  if (status === "won") {
    return (
      <Wrapper>
        <WinScreen>
          <Subheader>Nivå {level} avklarad</Subheader>
          <H1 style={{ textAlign: "center", maxWidth: "none" }}>
            Grattis! 🎉
          </H1>
          <p style={{ color: Theme.colorText }}>Din slutpoäng</p>
          <strong>{score}</strong>
          <ActionRow>
            <ActionButton primary onClick={() => startGame(level)}>
              Spela igen
            </ActionButton>
            <ActionButton onClick={() => setStatus("menu")}>
              Byt svårighetsgrad
            </ActionButton>
          </ActionRow>
        </WinScreen>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <StatusBar>
        <Stat>
          Poäng <strong>{score}</strong>
        </Stat>
        <Stat>
          Nivå <strong>{level}</strong>
        </Stat>
        <Stat>
          Hjälp kvar <strong>{hintsLeft}</strong>
        </Stat>
        {multiplier > 1 && <ComboBadge key={streak}>COMBO x{multiplier}</ComboBadge>}
      </StatusBar>

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
          title={`Placerar en korrekt siffra (−${HINT_COST} poäng)`}
        >
          💡 Hjälp ({hintsLeft} kvar, −{HINT_COST}p)
        </ActionButton>
        <ActionButton onClick={() => setStatus("menu")}>Avsluta</ActionButton>
      </ActionRow>
    </Wrapper>
  )
}

export default SudokuGame
