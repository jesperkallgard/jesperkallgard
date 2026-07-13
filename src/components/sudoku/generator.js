/**
 * Sudoku-generator
 *
 * Skapar ett komplett löst bräde med backtracking och gräver sedan
 * ur celler tills önskad svårighetsgrad nås. Uniciteten kontrolleras
 * så långt det går så att pusslet bara har en lösning.
 */

const SIZE = 9
const CELLS = 81

const shuffle = arr => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const canPlace = (board, index, value) => {
  const row = Math.floor(index / SIZE)
  const col = index % SIZE

  for (let i = 0; i < SIZE; i++) {
    if (board[row * SIZE + i] === value) return false
    if (board[i * SIZE + col] === value) return false
  }

  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r * SIZE + c] === value) return false
    }
  }
  return true
}

const fillBoard = board => {
  const index = board.indexOf(0)
  if (index === -1) return true

  for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (canPlace(board, index, value)) {
      board[index] = value
      if (fillBoard(board)) return true
      board[index] = 0
    }
  }
  return false
}

// Räknar lösningar men avbryter så fort det finns fler än en
const countSolutions = (board, limit = 2) => {
  const index = board.indexOf(0)
  if (index === -1) return 1

  let count = 0
  for (let value = 1; value <= 9; value++) {
    if (canPlace(board, index, value)) {
      board[index] = value
      count += countSolutions(board, limit - count)
      board[index] = 0
      if (count >= limit) break
    }
  }
  return count
}

/**
 * Genererar ett pussel för nivå 1–10.
 * Nivå 1 tar bort ~30 celler, nivå 10 ~57.
 */
export const generatePuzzle = level => {
  const clampedLevel = Math.min(10, Math.max(1, level))
  const cellsToRemove = 27 + clampedLevel * 3

  const solution = new Array(CELLS).fill(0)
  fillBoard(solution)

  const puzzle = solution.slice()
  let removed = 0

  for (const index of shuffle([...Array(CELLS).keys()])) {
    if (removed >= cellsToRemove) break

    const backup = puzzle[index]
    puzzle[index] = 0

    if (countSolutions(puzzle.slice()) === 1) {
      removed++
    } else {
      puzzle[index] = backup
    }
  }

  return { puzzle, solution }
}
