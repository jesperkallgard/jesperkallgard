/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { Helmet } from 'react-helmet'
import styled from 'styled-components';
import { useStaticQuery, graphql } from "gatsby"

import Header from "./header"
import {Main, Wrapper} from "./theme";
import "../layout.css"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)

  return (
    <>
      <Helmet
        htmlAttributes={{ lang: 'sv' }}
        title = {data.site.siteMetadata.title}
        meta = {[
            {
                name: 'description',
                content : data.site.siteMetadata.description
            }
        ]}
        
        link = {[
        {
          href:"https://www.jesperkallgard.com",
          rel:"canonical",
        }
        ]}
        script = {[
        /*{
          type: 'text/javascript',
          src:"https://cdn.snipcart.com/themes/v3.0.5/default/snipcart.js"
        },
        {
          type: 'text/javascript',
          src:"https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"
        }*/
        ]} />

        <Wrapper>
        <Header siteTitle={data.site.siteMetadata.title} />
        <Main>
            {children}
        </Main>
            <footer>

            </footer>
        </Wrapper>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
