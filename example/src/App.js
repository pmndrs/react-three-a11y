import * as THREE from "three"
import React, { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "react-three-fiber"
import { Loader } from "@react-three/drei"
import { useTransition, useSpring } from "@react-spring/core"
import { a } from "@react-spring/three"
import { useLocation, Switch, Route, Link } from "wouter"
import polyfill from "@juggle/resize-observer"
import { Badge } from "@pmndrs/branding"
import { A11y, useA11y, A11yAnnouncer } from "../../."

function Nav(props) {
  return (
    <>
      <div {...props}>
        <Link to="/">Torus</Link>
        <Link to="/knot">Knot</Link>
        <Link to="/bomb">Bomb</Link>
      </div>
      <Badge style={{ position: "absolute", bottom: 25, left: "50%", transform: "translate3d(-50%,0,0)" }} />
    </>
  )
}

const SimpleBox = props => {
  const mesh = useRef()
  const a11yContext = useA11y()

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    //@ts-ignore
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  let material = null
  if (a11yContext.pressed) {
    material = <octahedronBufferGeometry args={[1, 0]} />
  } else {
    if (a11yContext.focus) {
      material = <icosahedronBufferGeometry args={[1, 0]} />
    } else {
      material = <boxBufferGeometry args={[1, 1, 1]} />
    }
  }

  if (a11yContext.hover) {
  }

  return (
    <mesh {...props} ref={mesh}>
      {material}
      <meshStandardMaterial
        color={
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

function Shapes({ transition, setLocation, setShowDialog }) {
  return transition(({ opacity, ...props }, location) => (
    <a.group {...props}>
      <Switch location={location}>
        <Route path="/">
          <A11y
            role="link"
            href="/knot"
            description="Link to knot page"
            actionCall={() => {
              setLocation("/knot")
            }}>
            <SimpleBox primaryColor="blue" position={[0, -5, 5]} />
          </A11y>
          <A11y
            role="button"
            description="Dark mode button theme"
            pressedDescription="Dark mode button theme, activated"
            actionCall={() => console.log("some theme switch function")}
            activationMsg="Theme Dark enabled"
            desactivationMsg="Theme Dark disabled">
            <SimpleBox primaryColor="green" position={[0, 0, 0]} />
          </A11y>
          <A11y
            role="button"
            description="press this button to show a dialog"
            actionCall={() => setShowDialog(true)}
            activationMsg="Dialog opened">
            <SimpleBox primaryColor="green" position={[0, 5, 5]} />
          </A11y>
        </Route>
        <Route path="/knot">
          <A11y
            role="link"
            href="/bomb"
            description="Link to bomb page"
            actionCall={() => {
              setLocation("/bomb")
            }}>
            <SimpleBox primaryColor="blue" position={[0, -5, 5]} />
          </A11y>
          <A11y
            role="button"
            description="press this button to call a console.log"
            actionCall={() => console.log("some console.log")}
            activationMsg="Console.log called">
            <SimpleBox primaryColor="green" position={[0, 0, 0]} />
          </A11y>
        </Route>
        <Route path="/bomb">
          <A11y
            role="link"
            description="back to home page"
            href="/"
            actionCall={() => {
              setLocation("/")
            }}>
            <SimpleBox primaryColor="blue" position={[0, 0, 0]} />
          </A11y>
          <A11y role="content" description="A cube that is like a cube ">
            <SimpleBox primaryColor="black" position={[0, -5, 5]} />
          </A11y>
          <A11y role="content" description="Another cube how fascinating ">
            <SimpleBox primaryColor="black" position={[0, 3, 5]} />
          </A11y>
          <A11y role="content" description="And a third cube">
            <SimpleBox primaryColor="black" position={[0, 5, 5]} />
          </A11y>
        </Route>
      </Switch>
    </a.group>
  ))
}

const Dialog = ({ setShowDialog }) => {
  const dialogRef = useRef(null)
  const prevFocusRef = useRef(null)

  useEffect(() => {
    prevFocusRef.current = window.document.activeElement
    dialogRef.current.focus()
    return () => {
      prevFocusRef.current.focus()
    }
  })

  return (
    <dialog
      ref={dialogRef}
      id="maindialog"
      tabIndex={0}
      style={{
        display: "block",
        position: "fixed",
        width: "300px",
        top: "5px",
        left: "5px",
        right: "5px",
        bottom: "5px",
      }}
      onBlur={() => setShowDialog(false)}
      onKeyDown={e => {
        var key = e.key || e.keyCode
        if (key == 27 || key == "Escape") {
          setShowDialog(false)
        }
      }}>
      <h3>Congrats ! You've displayed a dialog !</h3>
      <p>Your screen reader can read it.</p>
      <button
        onClick={() => {
          setShowDialog(false)
        }}>
        Close
      </button>
    </dialog>
  )
}

export default function App() {
  // Current route
  const [location, setLocation] = useLocation()
  const [showDialog, setShowDialog] = useState(false)
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
  const dialog = (() => {
    if (showDialog) {
      return <Dialog setShowDialog={setShowDialog} />
    } else {
      return null
    }
  })()
  return (
    <>
      <Canvas
        resize={{ polyfill }}
        concurrent
        camera={{ position: [0, 0, 20], fov: 50 }}
        onCreated={({ gl }) => (gl.toneMappingExposure = 1.5)}>
        <spotLight position={[0, 30, 40]} />
        <spotLight position={[-50, 30, 40]} />
        <Suspense fallback={null}>
          <Shapes transition={transition} setLocation={setLocation} setShowDialog={setShowDialog} />
        </Suspense>
      </Canvas>
      <A11yAnnouncer />
      <Nav
        style={{
          position: "absolute",
          right: "50px",
          top: "50px",
          color: props.color,
        }}
      />
      {dialog}
      <Loader />
    </>
  )
}
