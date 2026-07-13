import PropTypes from "prop-types"
import React from "react"
import { withPrefix } from "gatsby"
import styled from 'styled-components';
import {Theme} from "./theme";

const HeaderElm = styled.header`
    margin-bottom: 4rem;

    @media only screen and (min-width: ${Theme.breakLarge}) {
        margin-bottom: 8rem;
    }
`;

const Logo = styled.a`
    width: 50px;
    display: block;
    img{
        width: 100%;
    }
`;

const Header = ({ siteTitle }) => (
    <HeaderElm>
        <Logo id="logo" href={withPrefix("/")} title="UX Designer Jesper Källgård">
            <img src={withPrefix("/logo.svg")} alt="Jesper Källgård" />
        </Logo>
    </HeaderElm>
)

Header.propTypes = {
    siteTitle: PropTypes.string,
  }
  
  Header.defaultProps = {
    siteTitle: ``,
  }
  
  export default Header