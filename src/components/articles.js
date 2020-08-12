import React from "react"
import styled from 'styled-components';

import articles from "../content/articles.yaml"

import {Theme, H2, A, Subheader} from "./theme";

const P = styled.p`
    font-size: .8rem;
    line-height: 1.6rem;
    color: #C1C1C1;

    @media only screen and (min-width: ${Theme.breakLarge}) {
        font-size: .9rem;
    }
`;

const Grid = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;

    @media only screen and (min-width: ${Theme.breakLarge}) {
        justify-content: flex-start;
    }

    section{
        width: 90%;
        margin-bottom: 2rem;

        @media only screen and (min-width: ${Theme.breakLarge}) {

            margin-right: 2%;
            marign-bottom: 0;
            width: 25%;
        }
    }
`;


const Articles = () => (
    <section>
        <Subheader>My latest articles</Subheader>

        <Grid>
            {articles.content.map((data, index) => {
            return (
                <section key={`content_item_${index}`}>
                <H2>{data.item.title}</H2>
                <P>{data.item.p}</P>
                <A href={data.item.link}>{data.item.linktext}</A>
            </section>
            )
            })}
        </Grid>
    </section>
)

export default Articles