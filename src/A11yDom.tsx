import React, { useState, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei/Html';

interface Props {
  children: React.ReactNode;
}

const createImageFromURI = (SVGDataURL: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = e => reject(e);
    image.src = SVGDataURL;
  });

const escapeXhtml = (s: string): string =>
  s.replace(/#/g, '%23').replace(/\n/g, '%0A');

//@ts-ignore
const makeSVGDataURI = (node, width: number, height: number): string => {
  node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const serializedNode = new XMLSerializer().serializeToString(node);
  const escapedNode = escapeXhtml(serializedNode);
  return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
	<foreignObject x="0" y="0" width="100%" height="100%">
	${escapedNode}</foreignObject></svg>`;
};

const rasterizeElement = async (
  sourceElement: HTMLElement,
  //@ts-ignore
  useDevicePixelRatio: boolean
) => {
  if (!sourceElement) return;
  const { width, height } = sourceElement.getBoundingClientRect();
  const SVGDataURI = makeSVGDataURI(sourceElement, width, height);
  const image: HTMLImageElement = await createImageFromURI(SVGDataURI);
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  //@ts-ignore
  context.drawImage(image, 0, 0);
  const png = canvas.toDataURL();
  const devicePixelRatio = useDevicePixelRatio ? window.devicePixelRatio : 1.0;
  console.log(png);
  return {
    DOMImage: png,
    size: {
      x: width * devicePixelRatio,
      y: height * devicePixelRatio,
    },
  };
};

// @ts-ignore
const injectPropsToAllChildren = (children, newProps, clone, hooks) => {
  // @ts-ignore
  const newChildren = React.Children.map(children, child => {
    // @ts-ignore
    const childzFurtherChildren =
      child.props && child.props.children
        ? // @ts-ignore
          injectPropsToAllChildren(child.props.children, newProps, clone, hooks)
        : undefined;

    if (child.type === 'input') {
      console.log('je suis passé une fois');
      if (clone) {
        newProps = {
          value: hooks.text,
          readOnly: true,
        };
      } else {
        newProps = {
          onChange: hooks.handleChange,
        };
      }
    }

    return childzFurtherChildren
      ? React.cloneElement(
          // @ts-ignore
          child,
          { ...newProps },
          childzFurtherChildren
        )
      : // @ts-ignore
        React.cloneElement(child, { ...newProps });
  });
  return newChildren;
};

export const A11yDom: React.FC<Props> = ({ children }) => {
  const [text, setText] = useState<string>('orange');
  const sourceElementRef = useRef(null);
  console.log(text);
  console.log(typeof text);
  const handleChange = (
    event: React.MouseEvent<HTMLInputElement, globalThis.MouseEvent>
  ) => {
    console.log('handleChange called');
    const target = event.target as HTMLInputElement;
    setText(target.value);
  };

  const myPopulatedChildren = useMemo(
    () =>
      injectPropsToAllChildren(children, null, null, {
        handleChange: handleChange,
        text: text,
      }),
    [true]
  );
  const myPopulatedChildrenClone = injectPropsToAllChildren(
    children,
    null,
    true,
    { handleChange: handleChange, text: text }
  );
  console.log(myPopulatedChildren);

  //@ts-ignore
  rasterizeElement(sourceElementRef.current, true);

  return (
    <group>
      <planeBufferGeometry args={[1, 1, 1, 1]} />
      <Html>
        <div className={'transparent-interactive-ui'}>
          {myPopulatedChildren}
        </div>
        <div className={'hidden-non-interactive-ui'} ref={sourceElementRef}>
          {myPopulatedChildrenClone}
        </div>
      </Html>
    </group>
  );
};
