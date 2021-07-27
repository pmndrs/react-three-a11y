//https://raw.githubusercontent.com/pmndrs/drei/master/src/web/Html.tsx
import * as React from 'react';
import {
  Vector3,
  Group,
  Object3D,
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
} from 'three';
import { Assign } from 'utility-types';
import { ReactThreeFiber, useFrame, useThree } from '@react-three/fiber';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();

function calculatePosition(
  el: Object3D,
  camera: Camera,
  size: { width: number; height: number }
) {
  const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
  objectPos.project(camera);
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  return [
    objectPos.x * widthHalf + widthHalf,
    -(objectPos.y * heightHalf) + heightHalf,
  ];
}

function isObjectBehindCamera(el: Object3D, camera: Camera) {
  const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
  const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
  const deltaCamObj = objectPos.sub(cameraPos);
  const camDir = camera.getWorldDirection(v3);
  return deltaCamObj.angleTo(camDir) > Math.PI / 2;
}

function objectZIndex(
  el: Object3D,
  camera: Camera,
  zIndexRange: Array<number>
) {
  if (
    camera instanceof PerspectiveCamera ||
    camera instanceof OrthographicCamera
  ) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
    const dist = objectPos.distanceTo(cameraPos);
    const A = (zIndexRange[1] - zIndexRange[0]) / (camera.far - camera.near);
    const B = zIndexRange[1] - A * camera.far;
    return Math.round(A * dist + B);
  }
  return undefined;
}

export interface HtmlProps
  extends Omit<
    Assign<
      React.HTMLAttributes<HTMLDivElement>,
      ReactThreeFiber.Object3DNode<Group, typeof Group>
    >,
    'ref'
  > {
  eps?: number;
  target: React.MutableRefObject<HTMLElement | null>;
  zIndexRange?: Array<number>;
}

export const HtmlBind = ({
  eps = 0.001,
  target,
  zIndexRange = [16777271, 0],
  ...props
}: HtmlProps) => {
  const camera = useThree(({ camera }) => camera);
  const size = useThree(({ size }) => size);
  const group = React.useRef<Group>(null);
  const oldZoom = React.useRef(0);
  const oldPosition = React.useRef([0, 0]);

  useFrame(() => {
    if (group.current) {
      camera.updateMatrixWorld();
      const vec = calculatePosition(group.current, camera, size);

      if (
        Math.abs(oldZoom.current - camera.zoom) > eps ||
        Math.abs(oldPosition.current[0] - vec[0]) > eps ||
        Math.abs(oldPosition.current[1] - vec[1]) > eps
      ) {
        if (target.current) {
          target.current.style.display = !isObjectBehindCamera(
            group.current,
            camera
          )
            ? 'block'
            : 'none';
          target.current.style.zIndex = `${objectZIndex(
            group.current,
            camera,
            zIndexRange
          )}`;
          console.log(vec[0], vec[1]);
          target.current.style.transform = `translate3d(${vec[0]}px,${vec[1]}px,0) scale(1) translate(-50%,-50%)`;
        }
        oldPosition.current = vec;
        oldZoom.current = camera.zoom;
      }
    }
  });

  return <group {...props} ref={group} />;
};
