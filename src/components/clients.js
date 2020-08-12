import React from "react"
import styled from 'styled-components';

import clients from "../content/clients.yaml"
import {Theme, Subheader} from "./theme";

const P = styled.p`
    font-size: 1rem;
    color: #C1C1C1;
`;

const Grid = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: stretch;
    flex-wrap: wrap;

    section{
        display: flex;
        justify-content: center;
        width: 49%;
        margin: 2% 0 0;
        text-align: center;
        background: #111;
        padding: 2rem;
        box-sizing: border-box;
        align-items: center;
        min-height: 150px;
        
        img{
            max-width: 70%;
            flex-grow: 0;

            @media only screen and (min-width: ${Theme.breakLarge}) {
                max-width: 90%;
            }
        }


        @media only screen and (min-width: ${Theme.breakLarge}) {
            width: 19%;
            margin: 1% 0 0;
        }
    }
`;


const Clients = () => (
    <section>
        <Subheader>Current and former clients</Subheader>

        <Grid>
            {clients.content.map((data, index) => {
            return (
                <section key={`client_item_${index}`}>
                    <img src={data.client.img} alt={data.client.title} />
                </section>
            )
            })}
        </Grid>
    </section>
)

export default Clients