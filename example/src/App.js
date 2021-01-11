import "./styles.css"
import { Canvas, useFrame } from "react-three-fiber"
import React, { Suspense, useRef, useEffect, useState } from "react"
import { useGLTF, OrbitControls, ContactShadows } from "drei"
import { A11y, useA11y, A11yAnnouncer } from "../../"
import { ResizeObserver } from "@juggle/resize-observer"
import { a as animated } from "@react-spring/web"
import { useTransition, useSpring } from "@react-spring/core"
import diamond from "../public/diamond.glb"
import rupee from "../public/rupee.glb"
import { a } from "@react-spring/three"

const SimpleToggleButton = props => {
  const mesh = useRef()
  const a11yContext = useA11y()
  const [prevA11yContextValue, saveA11yContextValue] = useState(a11yContext)

  const { color } = useSpring({ color: a11yContext.focus ? "#5dc8dc" : a11yContext.hover ? "#239db4" : "lightblue" })
  const [scale, setScale] = useSpring(() => ({
    scale: [1, 1, 1],
  }))
  useEffect(() => {
    if (!prevA11yContextValue.focus && a11yContext.focus) {
      setScale({
        to: [{ scale: [1.2, 1.2, 1.2] }, { scale: [1, 1, 1] }],
        config: { duration: 200 },
      })
    }
    saveA11yContextValue(a11yContext)
  }, [a11yContext])

  return (
    <a.mesh {...props} ref={mesh} scale={scale.scale}>
      <a.torusGeometry args={a11yContext.pressed ? [0.5, 1, 10, 20] : [1, 0.5, 10, 20]} />
      <a.meshStandardMaterial color={color} />
    </a.mesh>
  )
}

function Diamonds({ targetRotation, setTargetRotation, setActiveRupee, activeRupee }) {
  const group = useRef()
  const { nodes, materials } = useGLTF(diamond)
  const a11yContext = useA11y()

  return (
    <group ref={group} dispose={null}>
      <A11y
        role="button"
        description="Press to show the left rupee"
        activationMsg="rupee showing"
        actionCall={() => {
          setActiveRupee(activeRupee === 1 ? 5 : activeRupee - 1)
          setTargetRotation(targetRotation - Math.PI / 2)
        }}>
        <Diamond geometry={nodes.Cylinder.geometry} position={[-10, 0, 0]} rotation={[0, Math.PI / 4, -Math.PI / 2]} />
      </A11y>
      <A11y
        role="button"
        description="Press to show the right rupee"
        activationMsg="rupee showing"
        actionCall={() => {
          setActiveRupee(activeRupee === 5 ? 1 : activeRupee + 1)
          setTargetRotation(targetRotation + Math.PI / 2)
        }}>
        <Diamond geometry={nodes.Cylinder.geometry} position={[10, 0, 0]} rotation={[0, -Math.PI / 4, Math.PI / 2]} />
      </A11y>
    </group>
  )
}

const Diamond = props => {
  const a11yContext = useA11y()

  return (
    <mesh {...props}>
      <meshStandardMaterial color={a11yContext.focus ? "#0fffcc" : a11yContext.hover ? "#71f8db" : "#87d4f7"} />
    </mesh>
  )
}

const Rupee = props => {
  const rupeeRef = useRef()
  const a11yContext = useA11y()

  useFrame(() => {
    if (rupeeRef.current) {
      rupeeRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={rupeeRef} {...props} scale={a11yContext.focus ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
      <meshStandardMaterial color={props.color} />
    </mesh>
  )
}

function Rupees({ targetRotation, activeRupee }) {
  const group = useRef()
  const { nodes, materials } = useGLTF(rupee)

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = (1 - 0.1) * group.current.rotation.y + 0.1 * targetRotation
    }
  })

  return (
    <group ref={group} dispose={null}>
      <A11y role="content" description="a red rupee" tabIndex={activeRupee === 1 ? 0 : -1}>
        <Rupee
          position={[Math.round(5 * Math.cos(0)), 0, Math.round(5 * Math.sin(0))]}
          material={materials.Material}
          color="red"
          geometry={nodes.Cube.geometry}
        />
      </A11y>
      <A11y role="content" description="a green rupee" tabIndex={activeRupee === 2 ? 0 : -1}>
        <Rupee
          position={[Math.round(5 * Math.cos((1 * 2 * Math.PI) / 5)), 0, Math.round(5 * Math.sin((1 * 2 * Math.PI) / 5))]}
          material={materials.Material}
          color="green"
          geometry={nodes.Cube.geometry}
        />
      </A11y>
      <A11y role="content" description="a silver rupee" tabIndex={activeRupee === 3 ? 0 : -1}>
        <Rupee
          position={[Math.round(5 * Math.cos((2 * 2 * Math.PI) / 5)), 0, Math.round(5 * Math.sin((2 * 2 * Math.PI) / 5))]}
          material={materials.Material}
          color="silver"
          geometry={nodes.Cube.geometry}
        />
      </A11y>
      <A11y role="content" description="a purple rupee" tabIndex={activeRupee === 4 ? 0 : -1}>
        <Rupee
          position={[Math.round(5 * Math.cos((3 * 2 * Math.PI) / 5)), 0, Math.round(5 * Math.sin((3 * 2 * Math.PI) / 5))]}
          material={materials.Material}
          color="purple"
          geometry={nodes.Cube.geometry}
        />
      </A11y>
      <A11y role="content" description="a yellow rupee" tabIndex={activeRupee === 5 ? 0 : -1}>
        <Rupee
          position={[Math.round(5 * Math.cos((4 * 2 * Math.PI) / 5)), 0, Math.round(5 * Math.sin((4 * 2 * Math.PI) / 5))]}
          material={materials.Material}
          color="yellow"
          geometry={nodes.Cube.geometry}
        />
      </A11y>
    </group>
  )
}

const Carroussel = () => {
  const [targetRotation, setTargetRotation] = useState(0)
  const [activeRupee, setActiveRupee] = useState(1)

  return (
    <Suspense fallback={null}>
      <group position={[0, 0, 0]}>
        <Diamonds
          targetRotation={targetRotation}
          setTargetRotation={setTargetRotation}
          activeRupee={activeRupee}
          setActiveRupee={setActiveRupee}
        />
        <Rupees targetRotation={targetRotation} activeRupee={activeRupee} />

        <ContactShadows rotation-x={Math.PI / 2} position={[0, -10, 0]} opacity={0.25} width={100} height={100} blur={2} far={50} />
      </group>
    </Suspense>
  )
}

useGLTF.preload(diamond)
useGLTF.preload(rupee)

const App = () => {
  const [darktheme, setDarktheme] = useState(false)
  const mainStyle = useSpring({
    background: darktheme ? "#1c1c1c" : "#f4f4f4",
  })

  return (
    <animated.main style={mainStyle}>
      <Canvas resize={{ polyfill: ResizeObserver }} camera={{ position: [0, 0, 15] }} pixelRatio={[1, 2]}>
        <pointLight position={[100, 100, 100]} intensity={0.5} />
        <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[2, -25, 10]} intensity={0.85} />
        <Carroussel />
        <A11y
          role="button"
          description="Dark mode button theme"
          pressedDescription="Dark mode button theme, activated"
          actionCall={() => {
            setDarktheme(!darktheme)
          }}
          activationMsg="Theme Dark enabled"
          deactivationMsg="Theme Dark disabled">
          <SimpleToggleButton position={[0, -8, 0]} />
        </A11y>
      </Canvas>
      <A11yAnnouncer />
    </animated.main>
  )
}

export default App
