import React from "react"
import Layout from "../components/layout"
import SudokuGame from "../components/sudoku/game"

const SudokuPage = () => (
  <Layout>
    <article>
      <SudokuGame />
    </article>
  </Layout>
)

export default SudokuPage
