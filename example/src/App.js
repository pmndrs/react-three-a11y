import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import React, { Suspense, useCallback, useEffect, useRef, useContext } from "react"
import { ContactShadows, Text, Html } from "@react-three/drei"
import { A11y, useA11y, A11yAnnouncer, A11yUserPreferences, useUserPreferences, A11ySection, A11yDebuger } from "../../"
import { ResizeObserver } from "@juggle/resize-observer"
import { proxy, useProxy } from "valtio"
import { EffectComposer, SSAO, SMAA } from "@react-three/postprocessing"
import { Badge, Logo, LogoFull } from "@pmndrs/branding"

const state = proxy({ dark: false, active: 0, rotation: 0, disabled: false, section: undefined })
const geometries = [
  new THREE.SphereBufferGeometry(1, 32, 32),
  new THREE.TetrahedronBufferGeometry(1.5),
  new THREE.TorusBufferGeometry(1, 0.35, 16, 32),
  new THREE.OctahedronGeometry(1.5),
  new THREE.IcosahedronBufferGeometry(1.5),
]

function ToggleButton(props) {
  const a11y = useA11y()
  console.log(a11y)
  return (
    <mesh
      {...props}
      onClick={() => {
        console.log(a11y)
        a11y.refHtml.a11yNeedUpdate = true
      }}>
      <torusGeometry args={[0.5, a11y.pressed ? 0.28 : 0.25, 16, 32]} />
      <meshStandardMaterial color={a11y.focus ? "lightsalmon" : a11y.hover ? "lightpink" : "lightblue"} />
    </mesh>
  )
}

function SwitchButton(props) {
  const a11y = useA11y()
  return (
    <>
      <mesh {...props} rotation={[0, 0, a11y.pressed ? Math.PI / 4 : -Math.PI / 4]}>
        <boxBufferGeometry args={[0.3, 2, 0.3]} />
        <meshStandardMaterial color={a11y.focus ? "lightsalmon" : a11y.hover ? "lightpink" : "lightblue"} />
      </mesh>
      <mesh {...props}>
        <torusGeometry args={[0.3, 0.2, 16, 20]} />
        <meshStandardMaterial color={a11y.focus ? "lightsalmon" : a11y.hover ? "lightpink" : "lightblue"} />
      </mesh>
    </>
  )
}

function Floor(props) {
  return (
    <>
      <ContactShadows rotation-x={Math.PI / 2} position={[0, -5, 0]} opacity={0.4} width={30} height={30} blur={1} far={15} />
      <mesh {...props} position={[0, -5.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeBufferGeometry args={[30, 30, 1]} />
        <meshStandardMaterial color={"#eef5f7"} />
      </mesh>
    </>
  )
}

function Nav({ left }) {
  const snap = useProxy(state)
  const viewport = useThree(state => state.viewport)
  const radius = Math.min(12, viewport.width / 2.5)
  return (
    <A11y
      role="button"
      description={`Spin ${left ? "left" : "right"} shape`}
      activationMsg="shape showing"
      actionCall={() => {
        state.rotation = snap.rotation + ((Math.PI * 2) / 5) * (left ? -1 : 1)
        state.active = left ? (snap.active === 0 ? 4 : snap.active - 1) : snap.active === 4 ? 0 : snap.active + 1
      }}
      disabled={snap.disabled}>
      <Diamond position={[left ? -radius : radius, 0, 0]} rotation={[0, 0, -Math.PI / 4]} />
    </A11y>
  )
}

function Diamond({ position, rotation }) {
  const a11y = useA11y()
  return (
    <mesh position={position} rotation={rotation}>
      <tetrahedronBufferGeometry />
      <meshPhongMaterial color={a11y.focus ? "lightsalmon" : a11y.hover ? "lightpink" : "lightblue"} />
    </mesh>
  )
}

function Shape({ index, active, ...props }) {
  const snap = useProxy(state)
  const vec = new THREE.Vector3()
  const ref = useRef()
  const { a11yPrefersState } = useUserPreferences()
  useFrame((state, delta) => {
    if (snap.disabled) {
      return
    }
    if (a11yPrefersState.prefersReducedMotion) {
      const s = active ? 2 : 1
      ref.current.scale.set(s, s, s)
      ref.current.rotation.y = ref.current.rotation.x = active ? 1.5 : 4
      ref.current.position.y = 0
    } else {
      const s = active ? 2 : 1
      ref.current.scale.lerp(vec.set(s, s, s), 0.1)
      ref.current.rotation.y = ref.current.rotation.x += delta / (active ? 1.5 : 4)
      ref.current.position.y = active ? Math.sin(state.clock.elapsedTime) / 2 : 0
    }
  })
  return (
    <mesh rotation-y={index * 2000} ref={ref} {...props} geometry={geometries[index]}>
      <meshPhongMaterial color={a11yPrefersState.prefersDarkScheme ? "#000000" : "#ffffff"} />
    </mesh>
  )
}

// const ResponsiveText = () => {
//   const { viewport } = useThree()
//   const posX = useControl("posX", { type: "number", value: 0, min: -20, max: 20 })
//   const posY = useControl("posY", { type: "number", value: 0, min: -20, max: 20 })
//   const posZ = useControl("posZ", { type: "number", value: 0, min: -20, max: 20 })
//   const color = useControl("color", { type: "color", value: "#EC2D2D" })
//   const fontSize = useControl("fontSize", { type: "number", value: 16.5, min: 1, max: 100 })
//   const maxWidth = useControl("maxWidth", { type: "number", value: 90, min: 1, max: 100 })
//   const lineHeight = useControl("lineHeight", { type: "number", value: 0.75, min: 0.1, max: 10 })
//   const letterSpacing = useControl("spacing", { type: "number", value: -0.08, min: -0.5, max: 1 })
//   const textAlign = useControl("textAlign", {
//     type: "select",
//     items: ["left", "right", "center", "justify"],
//     value: "justify",
//   })
//   return (
//     <Text
//       position={[posX, posY, posZ]}
//       color={color}
//       fontSize={fontSize}
//       maxWidth={(viewport.width / 100) * maxWidth}
//       lineHeight={lineHeight}
//       letterSpacing={letterSpacing}
//       textAlign={textAlign}
//       font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
//       anchorX="center"
//       anchorY="middle">
//       LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT
//     </Text>
//   )
// }

function Carroussel() {
  const viewport = useThree(state => state.viewport)
  const snap = useProxy(state)
  const group = useRef()
  const radius = Math.min(6, viewport.width / 5)
  const { a11yPrefersState } = useUserPreferences()
  useFrame(() => {
    if (a11yPrefersState.prefersReducedMotion) {
      group.current.rotation.y = snap.rotation - Math.PI / 2
    } else {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, snap.rotation - Math.PI / 2, 0.1)
    }
  })
  return (
    <group ref={group}>
      {["sphere", "pyramid", "donut", "octahedron", "icosahedron"].map((name, i) => (
        <A11y key={name} role="content" description={`a ${name}`} tabIndex={-1} hidden={snap.active !== i}>
          <Shape
            index={i}
            position={[radius * Math.cos(i * ((Math.PI * 2) / 5)), 0, radius * Math.sin(i * ((Math.PI * 2) / 5))]}
            active={snap.active === i}
            color={name}
          />
        </A11y>
      ))}
    </group>
  )
}

const CarrousselAll = () => {
  const snap = useProxy(state)

  return (
    <>
      <A11ySection
        label="Shape carousel"
        description="This carousel contains 5 shapes. Use the Previous and Next buttons to cycle through all the shapes.">
        <Nav left />
        <Carroussel />
        <Nav />
        <Floor />
        <A11y
          role="togglebutton"
          description="Light lowering button"
          pressedDescription="Light lowering button, activated"
          actionCall={() => (state.dark = !snap.dark)}
          activationMsg="Lower light enabled"
          deactivationMsg="Lower light disabled"
          disabled={snap.disabled}
          debug={true}
          a11yElStyle={{ marginLeft: "-40px" }}>
          <ToggleButton position={[0, -3, 9]} />
        </A11y>
      </A11ySection>
    </>
  )
}

export default function App() {
  // const sectionRef = useCallback(node => {
  //   console.log(node)
  //   sectionRefref.current = node
  // }, [])
  const snap = useProxy(state)

  return (
    <main className={snap.dark ? "dark" : "bright"}>
      <Canvas resize={{ polyfill: ResizeObserver }} camera={{ position: [0, 0, 15], near: 4, far: 30 }} pixelRatio={[1, 1.5]}>
        <A11yUserPreferences debug={true}>
          <A11yDebuger />
          {/* <ResponsiveText /> */}
          <pointLight position={[100, 100, 100]} intensity={snap.disabled ? 0.2 : 0.5} />
          <pointLight position={[-100, -100, -100]} intensity={1.5} color="red" />
          <ambientLight intensity={snap.disabled ? 0.2 : 0.8} />
          <group position-y={2}>
            <CarrousselAll />
            <A11y role="image" description="Je suis un test">
              <SwitchButton position={[-3, 3, 7]} />
            </A11y>
            <A11y
              role="togglebutton"
              startPressed={false}
              description="Power button, click to disable the scene"
              pressedDescription="Power button, click to turn on the scene"
              actionCall={() => (state.disabled = !snap.disabled)}
              activationMsg="Scene activated"
              deactivationMsg="Scene disabled">
              <SwitchButton position={[-3, -5, 7]} />
            </A11y>
          </group>
          {/* <Suspense fallback={null}>
          <EffectComposer multisampling={0}>
            <SSAO radius={20} intensity={50} luminanceInfluence={0.1} color="#154073" />
            <SMAA />
          </EffectComposer>
        </Suspense> */}
        </A11yUserPreferences>
      </Canvas>
      <Badge />
      <A11yAnnouncer />
    </main>
  )
}
