import { A11y } from '../.';
import { PerspectiveCamera } from '@react-three/drei';
import { MeshProps, useFrame } from 'react-three-fiber';
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { useHistory } from 'react-router-dom';
import { Box } from './Box';

export const DemoScene: React.FC<MeshProps> = () => {
  // const cam = useRef()
  const [targetRotation, setTargetRotation] = useState(0);
  const history = useHistory();
  console.log(history);

  useEffect(() => {
    // @ts-ignore
    // cam.current.lookAt([0,0,0])
  }, []);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(({ camera }) => {
    // @ts-ignore   simple lerp
    camera.rotation.y = (1 - 0.1) * camera.rotation.y + 0.1 * targetRotation;
  });

  const handleFocus_1 = (children: React.ReactNode) => {
    //rotate camera so element is in view
    //todo fix this hack
    window.setTimeout(() => {
      setTargetRotation(0);
    }, 100);
  };

  const handleFocus_2 = (children: React.ReactNode) => {
    //rotate camera so element i sin view
    //todo fix this hack
    window.setTimeout(() => {
      setTargetRotation(3);
    }, 100);
  };

  const actionCall = () => {
    alert('the accessible element has been clicked');
  };
  const linkCall = () => {
    console.log(history);
    history.push('/goodbye');
  };

  return (
    <>
      <PerspectiveCamera position={[0, 0, 3]} />
      <A11y
        role="content"
        anchorId="left"
        title="A cube rotating on the left"
        focusCall={handleFocus_1}
        actionCall={actionCall}
      >
        <Box
          // @ts-ignore
          activeColor="hotpink"
          position={[-10.2, 0, 0]}
        />
      </A11y>
      <A11y
        role="link"
        anchorId="right"
        title="A cube rotating on the right"
        focusCall={handleFocus_1}
        actionCall={linkCall}
      >
        <Box
          // @ts-ignore
          activeColor="blue"
          position={[10.2, 0, 0]}
        />
      </A11y>
      <A11y
        role="button"
        anchorId="behind"
        title="A third cube placed behind the camera"
        focusCall={handleFocus_2}
        actionCall={actionCall}
      >
        <Box
          // @ts-ignore
          activeColor="red"
          position={[0, 0, 10]}
        />
      </A11y>
    </>
  );
};
