import * as THREE from "three"
import ReactDOM from "react-dom"
import React, { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { A11y } from "../../"

/* just to test tsx autocomplete etc */
function Box(props: JSX.IntrinsicElements["mesh"]) {
  const mesh = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  useFrame((state, delta) => (mesh.current.rotation.x += 0.01))
  return (
    <A11y role="link" description="" actionCall={() => {}} href="/">
      <mesh
        {...props}
        ref={mesh}
        scale={active ? 1.5 : 1}
        onClick={event => setActive(!active)}
        onPointerOver={event => setHover(true)}
        onPointerOut={event => setHover(false)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      </mesh>
    </A11y>
  )
}

ReactDOM.render(
  <>
    <h1 id="h1id">test h1 render</h1>
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  </>,
  document.getElementById("root"),
)
