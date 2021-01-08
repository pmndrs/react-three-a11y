import { useA11y } from '../.';
import { useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { MeshProps, useFrame } from 'react-three-fiber';
import React, { useRef } from 'react';

export const Box: React.FC<MeshProps> = props => {
  // This reference will give us direct access to the mesh
  const mesh = useRef();
  const a11yContext = useA11y();

  useHelper(
    mesh,
    THREE.BoxHelper,
    a11yContext.focus || a11yContext.hover ? 'red' : 'white'
  );

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    //@ts-ignore
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
  });

  console.log('box render');

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
              props.activeColor
            : 'orange'
        }
      />
    </mesh>
  );
};
