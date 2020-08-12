import React from "react"
import styled from 'styled-components';
import {Theme, H1, Subheader} from "./theme";

const Picture = styled.div`
    
    border-radius: 50%;
    margin-bottom: 2rem;
    overflow: hidden;
    width: 50%;
    vertical-align: baseline;


    img{
        width: 100%;
        vertical-align: bottom;
    }

    @media only screen and (min-width: ${Theme.breakLarge}) {
        width: 420px;
        height: 420px;
        float:right;
        margin-top: -2rem;
        margin-right: -1rem;
        margin-left: 4rem;
        shape-outside: circle();
    }
`
const Button = styled.a`
    color: #fff;
    background: #8D5291;
    display: inline-block;
    border-radius: 30px;
    padding: 1rem 2rem;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.1rem;
    transform: translateY(0px);

    transition: all 400ms;

    &:hover{
        background: #A764AB;
        transform: translateY(-5px);   
    }
`

const Intro = () => (
    <section>
        <Picture>
            <img src="jesperkallgard.jpg" alt="Jesper Källgård" />
        </Picture>

        <Subheader>This is me</Subheader>
        <H1>Hi! I'm Jesper Källgård, a UX Designer determied to create great digital experiences.</H1>

        <Button href="#">Contact me on LinkeIn</Button>


    </section>
)

export default Intro