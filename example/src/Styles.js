import React from "react"
import { Link } from "wouter"
import "styled-components/macro"
import { Badge } from "@pmndrs/branding"
import { a } from "@react-spring/web"
import styled from "styled-components"

const Container = styled(a.div)`
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`

const Jumbo = styled.div`
  white-space: pre;
  margin-bottom: 2.5rem;
  font-size: 12em;
  font-weight: 800;
  letter-spacing: -6px;
`

const NavRight = styled(a.div)`
  position: absolute;
  right: 50px;
  top: 50px;
`

const Box = styled(a.div)`
  position: absolute;
  transform: translate3d(-50%, -42%, 0);
  will-change: opacity;
`

const Line = styled(a.div)`
  position: relative;
  width: 100%;
  will-change: transform;
  overflow: hidden;
  line-height: 1.2em;
`

const Cover = styled(a.div)`
  position: absolute;
  will-change: background, transform;
  top: 0;
  left: 0;
  width: 120%;
  height: 120%;
`

function Nav(props) {
  return (
    <>
      <NavRight {...props}>
        <Link to="/">Torus</Link>
        <Link to="/knot">Knot</Link>
        <Link to="/bomb">Bomb</Link>
      </NavRight>
      <Badge style={{ position: "absolute", bottom: 25, left: "50%", transform: "translate3d(-50%,0,0)" }} />
    </>
  )
}

export { Container, Jumbo, Nav, Box, Line, Cover }
