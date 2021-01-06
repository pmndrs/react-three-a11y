import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas, MeshProps, useFrame } from 'react-three-fiber';
import type { Mesh } from 'three';
import { PerspectiveCamera } from '@react-three/drei'
import { A11y, A11yDom, FocusHelper, ScreenReaderHelper } from '../.';

const Box: React.FC<MeshProps> = (props) => {
  // This reference will give us direct access to the mesh
  const mesh = React.useRef<Mesh>()

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  console.log('box render')

  return (
    <mesh
      {...props}
      ref={mesh}

      >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={ 
      // @ts-ignore
      props.a11yHasFocus ||
      // @ts-ignore
      props.a11yHasHover ? props.activeColor : 'orange'} />
    </mesh>
  )
}

const DemoScene: React.FC<MeshProps> = () => {
  
  // const cam = useRef()
  const [targetRotation, setTargetRotation] = React.useState(0);

  React.useEffect(() => {
    // @ts-ignore
    // cam.current.lookAt([0,0,0])
  }, [])

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(({  camera }) => {
    // @ts-ignore   simple lerp
    camera.rotation.y = (1-0.1)*camera.rotation.y+0.1*targetRotation
  })

  const handleFocus_1 = (children: React.ReactNode) => {
    //rotate camera so element is in view
    //todo fix this hack
    window.setTimeout(()=>{
      setTargetRotation(0)
    },100)
  }

  const handleFocus_2 = (children: React.ReactNode) => {
    //rotate camera so element i sin view
    //todo fix this hack
    window.setTimeout(() => {
      setTargetRotation(3)
    },100)
  }

  const actionCall = () => {
    alert('the accessible element has been clicked')
  }

  return (
    <>
    <PerspectiveCamera position={[0, 0, 3]} />
      <A11y anchorId="left" title="A cube rotating on the left" focusCall={handleFocus_1} actionCall={actionCall} >
        <Box
        // @ts-ignore
        activeColor='hotpink' position={[-10.2, 0, 0]} />
      </A11y>
      <A11y anchorId="right" title="A cube rotating on the right" focusCall={handleFocus_1} actionCall={actionCall} >
        <Box
        // @ts-ignore
        activeColor='blue' position={[10.2, 0, 0]} />
      </A11y>
      <A11y anchorId="behind" title="A third cube placed behind the camera" focusCall={handleFocus_2} actionCall={actionCall} >
        <Box
        // @ts-ignore
        activeColor='red' position={[0, 0, 10]} />
      </A11y>
    </>
  )
}

ReactDOM.render(
  <>
  <FocusHelper />
  <ScreenReaderHelper />
  <button> Focusable regular dom buton element </button>
  <a href="#"> Focusable regular dom link element </a>
  <A11yDom >
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <DemoScene />
    </Canvas>
  </A11yDom>
  <button> Focusable regular dom button element </button>
  </>,
  document.getElementById('root')
)
