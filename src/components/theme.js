import styled from 'styled-components';

export const Theme = {
    darkBg : '#F7F6FA',
    linkColor : '#DFAFE2',
    linkHoverColor : '#FDDAFF',
    accentColor: '#d83f87',
    colorHeader: '#ffffff',
    colorText: '#C1C1C1',
    fontHeader: 'Open Sans',
    fontText: 'Open Sans',
    breakLarge: '768px',
    maxWidth : '1400px'
}

export const Wrapper = styled.div`
  width: 90%;
  max-width: 1100px;
  margin: 40px auto 100px auto;
  position: relative;
`;


export const Main = styled.main`
  article > section {
    margin-bottom: 4rem;

    @media only screen and (min-width: ${Theme.breakLarge}) {
      margin-bottom: 7rem;
    }
  }
`;

export const H1 = styled.h1`
    font-family: ${Theme.fontHeader};
    color:  ${Theme.colorHeader};
    font-size: 2rem;
    line-height: 3rem;
    font-weight: 700;
    margin-top: 0rem;
    padding: 0;

    @media only screen and (min-width: ${Theme.breakLarge}) {
        font-size: 3.3rem;
        line-height: 4.4rem;
        max-width: 800px;
        text-align: left;
    }
`

export const H2 = styled.h2`
    font-family: ${Theme.fontHeader};
    color:  ${Theme.colorHeader};
    font-size: 1.2rem;
    line-height: 1.6rem;
    font-weight: 700;
    margin-top: 0;
    max-width: 800px;
    margin-bottom: 0px;

    @media only screen and (min-width: ${Theme.breakLarge}) {
        font-size: 1.7rem;
    }
`
export const Subheader = styled.span`
    display: block;
    color: ${Theme.colorText};
    text-transform: uppercase;
    font-family: 'Yanone Kaffeesatz';
    font-weight: 300;
    letter-spacing: 2px;
    margin-bottom: 1rem;
`

export const A = styled.a`
   color: ${Theme.linkColor};
   font-weight: bold;
   text-decoration: none;

   &:hover{
    color: ${Theme.linkHoverColor};
   }
`