import React from "react"
import Layout from "../components/layout"

import Intro from "../components/intro"
import Articles from "../components/articles"
import Competence from "../components/competence"
import Clients from "../components/clients"


const IndexPage = ({ data }) => (
  <Layout>
    <article>
      <Intro />
      <Articles />
      <Competence />
      <Clients />
    </article>
  </Layout>
)

export default IndexPage
