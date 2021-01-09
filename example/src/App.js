import * as THREE from "three"
import React, { Suspense, useRef } from "react"
import { Canvas, useFrame } from "react-three-fiber"
import { Loader } from "@react-three/drei"
import { useTransition, useSpring } from "@react-spring/core"
import { a } from "@react-spring/three"
import { useLocation, Switch, Route } from "wouter"
import { Container, Jumbo, Nav, Box, Line, Cover } from "./Styles"
import polyfill from "@juggle/resize-observer"
import { A11yDom, A11y, useA11y } from "../../."

const jumbo = {
  "/": ["The sun", "is its father."],
  "/knot": ["The moon", "its mother."],
  "/bomb": ["The wind", "hath carried it", "in its belly."],
}

const SimpleBox = props => {
  const mesh = useRef()
  const a11yContext = useA11y()

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    //@ts-ignore
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  console.warn(a11yContext)

  return (
    <mesh {...props} ref={mesh}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={
          // @ts-ignore
          a11yContext.focus ||
          // @ts-ignore
          a11yContext.hover
            ? // @ts-ignore
              "red"
            : props.primaryColor
        }
      />
    </mesh>
  )
}

function Shapes({ transition, setLocation }) {
  return transition(({ opacity, ...props }, location) => (
    <a.group {...props}>
      <Switch location={location}>
        <Route path="/">
          <A11y
            role="link"
            href="/knot"
            title="Link to knot page"
            actionCall={() => {
              setLocation("/knot")
            }}>
            <SimpleBox primaryColor="blue" position={[0, -5, 5]} />
          </A11y>
          <A11y
            role="button"
            title="Dark mode button theme"
            actionCall={() => console.log("some theme switch function")}
            activationMsg="Theme Dark enabled"
            desactivationMsg="Theme Dark disabled">
            <SimpleBox primaryColor="green" position={[0, 0, 0]} />
          </A11y>
        </Route>
        <Route path="/knot">
          <A11y
            role="link"
            href="/bomb"
            title="Link to bomb page"
            actionCall={() => {
              setLocation("/bomb")
            }}>
            <SimpleBox primaryColor="blue" position={[0, -5, 5]} />
          </A11y>
          <A11y
            role="button"
            title="press this button to call a console.log"
            actionCall={() => console.log("some console.log")}
            activationMsg="Console.log called">
            <SimpleBox primaryColor="green" position={[0, 0, 0]} />
          </A11y>
        </Route>
        <Route path="/bomb">
          <A11y
            role="link"
            title="back to home page"
            href="/"
            actionCall={() => {
              setLocation("/")
            }}>
            <SimpleBox primaryColor="blue" position={[0, 0, 0]} />
          </A11y>
          <A11y role="content" title="A cube that is like a cube ">
            <SimpleBox primaryColor="black" position={[0, -5, 5]} />
          </A11y>
          <A11y role="content" title="Another cube how fascinating ">
            <SimpleBox primaryColor="black" position={[0, 3, 5]} />
          </A11y>
          <A11y role="content" title="And a third cube">
            <SimpleBox primaryColor="black" position={[0, 5, 5]} />
          </A11y>
        </Route>
      </Switch>
    </a.group>
  ))
}

function Text({ children, opacity, background }) {
  return (
    <Box style={{ opacity }}>
      {React.Children.toArray(children).map((text, index) => (
        <Line key={index} style={{ transform: opacity.to(t => `translate3d(0,${index * -50 + (1 - t) * ((1 + index) * 40)}px,0)`) }}>
          <div>{text}</div>
          <Cover style={{ background, transform: opacity.to(t => `translate3d(0,${t * 100}%,0) rotateZ(-10deg)`) }} />
        </Line>
      ))}
    </Box>
  )
}

export default function App() {
  // Current route
  const [location, setLocation] = useLocation()
  // Animated background color
  const props = useSpring({
    background: location === "/" ? "white" : location === "/knot" ? "#272730" : "#ffcc6d",
    color: location === "/" ? "black" : location === "/knot" ? "white" : "white",
  })
  // Animated shape props
  const transition = useTransition(location, {
    from: { position: [0, 0, -20], rotation: [0, Math.PI, 0], scale: [0, 0, 0], opacity: 0 },
    enter: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], opacity: 1 },
    leave: { position: [0, 0, -10], rotation: [0, -Math.PI, 0], scale: [0, 0, 0], opacity: 0 },
    config: () => n => n === "opacity" && { friction: 60 },
  })
  return (
    <>
      <Container style={{ ...props }}>
        <Jumbo>
          {transition((style, location) => (
            <Text open={true} t={style.t} opacity={style.opacity} background={props.background} children={jumbo[location]} />
          ))}
        </Jumbo>
      </Container>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
        }}>
        <ul>
          <li>Link is blue</li>
          <li>button is green</li>
          <li>content is black</li>
          <li>focus is red</li>
        </ul>
      </div>
      <A11yDom>
        <Canvas
          resize={{ polyfill }}
          concurrent
          camera={{ position: [0, 0, 20], fov: 50 }}
          onCreated={({ gl }) => (gl.toneMappingExposure = 1.5)}>
          <spotLight position={[0, 30, 40]} />
          <spotLight position={[-50, 30, 40]} />
          <Suspense fallback={null}>
            <Shapes transition={transition} setLocation={setLocation} />
          </Suspense>
        </Canvas>
      </A11yDom>
      <Nav style={{ color: props.color }} />
      <Loader />
    </>
  )
}
