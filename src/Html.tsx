//https://raw.githubusercontent.com/pmndrs/drei/master/src/web/Html.tsx
import * as React from 'react';
import ReactDOM from 'react-dom/client';
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
  portal?: React.MutableRefObject<HTMLElement>;
  zIndexRange?: Array<number>;
}

export const Html = React.forwardRef(
  (
    {
      children,
      eps = 0.001,
      style,
      className,
      portal,
      zIndexRange = [16777271, 0],
      ...props
    }: HtmlProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const gl = useThree(({ gl }) => gl);
    const camera = useThree(({ camera }) => camera);
    const scene = useThree(({ scene }) => scene);
    const size = useThree(({ size }) => size);
    const [el] = React.useState(() => document.createElement('div'));
    const root = React.useMemo(() => ReactDOM.createRoot(el), [el]);
    const group = React.useRef<Group>(null);
    const oldZoom = React.useRef(0);
    const oldPosition = React.useRef([0, 0]);
    const target = portal?.current ?? gl.domElement.parentNode;

    React.useEffect(() => {
      if (group.current) {
        scene.updateMatrixWorld();
        const vec = calculatePosition(group.current, camera, size);
        el.style.cssText = `position:absolute;top:0;left:0;transform:translate3d(${vec[0]}px,${vec[1]}px,0);transform-origin:0 0;`;
        if (target) {
          target.appendChild(el);
        }
        return () => {
          if (target) target.removeChild(el);
          root.unmount();
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);

    const styles: React.CSSProperties = React.useMemo(() => {
      return {
        position: 'absolute',
        transform: 'none',
        ...style,
      };
    }, [style, size]);

    React.useLayoutEffect(() => {
      root.render(
        <div
          ref={ref}
          style={styles}
          className={className}
          children={children}
        />
      );
    });

    useFrame(() => {
      if (group.current) {
        camera.updateMatrixWorld();
        const vec = calculatePosition(group.current, camera, size);

        if (
          Math.abs(oldZoom.current - camera.zoom) > eps ||
          Math.abs(oldPosition.current[0] - vec[0]) > eps ||
          Math.abs(oldPosition.current[1] - vec[1]) > eps
        ) {
          el.style.display = !isObjectBehindCamera(group.current, camera)
            ? 'block'
            : 'none';
          el.style.zIndex = `${objectZIndex(
            group.current,
            camera,
            zIndexRange
          )}`;
          el.style.transform = `translate3d(${vec[0]}px,${vec[1]}px,0) scale(1)`;
          oldPosition.current = vec;
          oldZoom.current = camera.zoom;
        }
      }
    });

    return <group {...props} ref={group} />;
  }
);
