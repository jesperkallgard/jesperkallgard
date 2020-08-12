import React from "react"

import {Theme, Subheader} from "./theme";
import competences from "../content/competences.yaml"
import styled from 'styled-components';

import { CSSTransition, TransitionGroup } from 'react-transition-group';

const Nav = styled.nav`
    border-bottom: 2px solid rgba(255,255,255,.2);
    position: relative;
    

    ul{
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        //flex-wrap: wrap;
        justify-content: space-between;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        -ms-overflow-style: -ms-autohiding-scrollbar; 

        &::-webkit-scrollbar {display: none; }
        
        li{
            margin-right: 2rem;
            a{
                font-size: 1.6rem;
                line-height: 1.6rem;
                font-weight: 700;
                color: #6C7577;
                text-decoration: none;
                cursor: pointer;
                transition: color 300ms;
                padding-bottom: 1rem;
                position: relative;
                display: flex;
                align-items: center;
            }

            a::before{
                display: block;
                content: attr(data-label);
                background: #6C7577;
                color: #1B1B1B;
                font-size: .6rem;
                margin-right: 5px;
                padding: .2rem;
                line-height: .8rem;
                transition: all 400ms;
            }


            a:hover{
                color: #AAB3B4;

                &::before{
                    background: #AAB3B4;
                }

            }

            &.active a{
                color: #BBF6BE;

                &::before{
                    background: #BBF6BE;
                }
            }
        }
    }
`

const Marker = styled.div`
    width: 0px;
    height: 4px;
    position: absolute;
    bottom: -3px;
    left: 0px;
    background: #BBF6BE;

    transition: all 400ms ease-in-out;

    display: none;

    @media only screen and (min-width: ${Theme.breakLarge}) {
        display: block;
    }
    
`

const Skillset = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;

    &.step-enter {
        opacity: 0;
        position: absolute;
        width: 100%;
        height: 300px;

        .step{
            background: #262626 !important;
        }
    }
    &.step-enter-active {
        opacity: 1;
        transition: opacity 400ms ease-out;
        .step{
            background: #262626 !important;
        }

    }
    &.step-exit {
        opacity: 1;
        position: absolute;
        width: 100%;

        .step{
            opacity: 1;
        }
    }
    &.step-exit-active {
        opacity: 0;
        transition: opacity 400ms ease-out;

        .step{
            transition: opacity 400ms ease-out;
            opacity: 0;
        }
    }

    li{
        display: flex;
        align-items: center;
        padding: 1.1rem 0;
        border-bottom: 1px solid rgba(255,255,255,.2);
        color: #fff;
        font-size: .9rem;
        font-weight: 700;


        span{
            width: 24%;
        }

        .step{
            height: .8rem;
            width: 50px;
            margin-right: 5px;
            background: #262626;
            transition: background-color 400ms ease-out;
        }

        .step:nth-of-type(1){transition-delay: 100ms;}
        .step:nth-of-type(2){transition-delay: 200ms;}
        .step:nth-of-type(3){transition-delay: 300ms;}
        .step:nth-of-type(4){transition-delay: 400ms;}
        .step:nth-of-type(5){transition-delay: 500ms;}
       

        &[data-level="1"] .step:nth-of-type(-n+1) {
            background-color: #B9CDF6;
        }

        &[data-level="2"] .step:nth-of-type(-n+2) {
            background: #B9CDF6;
        }

        &[data-level="3"] .step:nth-of-type(-n+3) {
            background: #B9CDF6;
        }

        &[data-level="4"] .step:nth-of-type(-n+4) {
            background: #B9CDF6;

        }

        &[data-level="5"] .step:nth-of-type(-n+5) {
            background: #B9CDF6;
        }
    
    }

`

export default class Competence extends React.Component{
    state = {
        activeStep : 0
    }

    markerStyle = {
        left: '0px',
        width: '0px'
    }

    setMarkerStyle = () => {
        let activeStep = document.getElementsByClassName('process_step')[0];
        this.markerStyle = {
            left: activeStep.offsetLeft,
            width: activeStep.offsetWidth
        }
    }

    changeStep = (e) => {
        e.preventDefault();

        let container = document.getElementsByClassName('steps')[0];
        container.style.minHeight = container.offsetHeight + "px";

        let target = e.target;
        this.setState({activeStep : parseInt(target.dataset.step)});
    
        this.markerStyle = {
            left: target.offsetLeft,
            width: target.offsetWidth
        }
        
    }


    render () {
        return (
            <section>
                <Subheader>Me and the UX process</Subheader>
                <Nav>
                    <ul>
                        {competences.content.map((data, index) => {
                            return (
                                <li 
                                    key = {`step_item_${index}`} 
                                    className={
                                        (index === this.state.activeStep || (this.state.activeStep === null && index === 0)) ? 'process_step active' : 'process_step'
                                    }
                                >
                                    <a data-step={index} data-label={`0${index+1}`} onClick = {(e) => this.changeStep(e)} href="#">{data.step.title}</a>
                                </li>
                            )
                        })}
                    </ul>

                    <Marker style={this.markerStyle} onload={this.setMarkerStyle} />

                </Nav>

                <TransitionGroup className="steps">
                    {competences.content.map((data, index) => (index === this.state.activeStep || (this.state.activeStep === null && index === 0)) ? (
                        <CSSTransition
                            key={index}
                            timeout={200}
                            classNames="step"
                        >
                            <Skillset key={`skill_${index}`} >
                            
                            {data.step.skills.map((_data, _index) => {
                                return (
                                    
                                        <li key={`skill_item_${_index}`} data-level={_data.skill.level}>
                                            <span className="title">{_data.skill.title}</span>
                                            <div className="step"></div>
                                            <div className="step"></div>
                                            <div className="step"></div>
                                            <div className="step"></div>
                                            <div className="step"></div>
                                        </li>
                                )
                            })}
                             
                            </Skillset>
                        </CSSTransition>
                    ) : null )}

                    </TransitionGroup>  
            </section>
        )
    }
}