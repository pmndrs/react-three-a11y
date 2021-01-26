//@ts-ignore
import React, { Suspense, useState, useMemo, useRef, useEffect } from 'react';
import { Html } from '@react-three/drei/Html';
//@ts-ignore
import { useLoader, Texture } from 'react-three-fiber';
//@ts-ignore
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

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
  // let img;
  // const domimagepromise = new Promise(resolve => {
  //   img = new Image();
  //   img.onload = resolve;
  //   img.src = png;
  // });
  // await domimagepromise;
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
      console.log('je suis passé une fois' + (clone ? 'clone' : ''));
      if (clone) {
        newProps = {
          value: hooks.text,
          readOnly: true,
        };
      } else {
        newProps = {
          defaultValue: hooks.text,
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
  //@ts-ignore
  const [textures, setTextures] = useState<Texture>(null);
  //@ts-ignore
  const [domImg, setDomImg] = useState<string>(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK0AAAAlCAYAAAAwTGn2AAADCklEQVR4Xu2bz4txYRTHjyWW7JQmGxtvyhaz5A+w0JusFaVIysJMWGiklLKwRm829rZkq/TOwmzkH7CZwvJ9O0/d2zU/8NzRjCffW0Kec+853/PpdJ5zXQsRUbFY/MfvOKCACgpYGNinpycVfIWPUEAoAGgBgnIKAFrlUgaHAS0YUE6Bd9C+vLxQNpuldrtNXq9XKqDZbEa1Wo0GgwE5HI5vs5W6EBYrrwCgVT6FtxcAoL29nCsf8afQxmIxSqVSIsBqtUrlclkPlluAh4cH/TduC7glWC6Xoj2IRqOUz+fF7/1+nxKJhPi83+8pl8tRt9slv99PkUiEXl9fqdVq0Xw+P2qrvNII4GIKfAhtPB4nhpZB5R6Xv3c6HQoGg2TsW202m4BwvV7r0IZCIR1UXpvJZGg4HIr+mMGeTqcC0t1uJ2C+u7vToT1me7GIcSLlFTjZHmw2GwEXA8zQciXlQ6u8Roi1SqttxIybOrfbLQAPh8N65TVCrFXaj2xlN4TKZwUBHFVACtpAIPAOvHOhdTqdB/CzV4AWdJpRQApaVFozEsPm0gpIQ3uqpzXOad/OfE/1tMdsLx04zqeuAtLQcqja9IAnAOl0mkaj0cH04LO+1Dg94AkDvxhs4/QAPa26MH2X51++jcuVt9frCfCsVquU3wzoarU6GKdJnQCLb1IBaWiNoGmV0+VynQUeV2iPxyM2ZNpUIplM6tOEm8wAgpZWQBpaDbbxeCwuxjcgzq2y2sx3sVgI27c3LaS9h8FNKiAN7U2qhKCvSgFAe1XpgDPnKGDhRXhG7BypsOZaFBDQ4oACKikAaFXKFnwVCgBagKCcAoBWuZTBYUALBpRTANAqlzI4DGjBgHIKAFrlUgaHAS0YUE4BQKtcyuAwoAUDyilgKRQKPrvd/me/3/tkvLdarc/b7fZ3s9l8lrHDWijwVQUsj4+Pf+/v7338pK3MwY98TyaT50ql8kvGDmuhwFcVEH9NLJVKps5Tr9ep0WigxTClHozMKgBozSoHux9TAO3Bj0mPC5tV4D9lo2y6ICd2oAAAAABJRU5ErkJggg=='
  );
  const sourceElementRef = useRef(null);
  const textureRef = useRef<Texture>(null);
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

  const updateDomImg = async () => {
    //@ts-ignore
    const res = await rasterizeElement(sourceElementRef.current, true);
    //@ts-ignore
    console.log(res.DOMImage);

    const loader = new TextureLoader();
    loader.load(
      //@ts-ignore
      res.DOMImage,

      texture => {
        console.log(texture);
        textureRef.current = texture;
        //@ts-ignore
        // setTextures(texture);
        console.log('setting dom img');
        // @ts-ignore
        setDomImg(res.DOMImage);
      }
    );
    //
  };

  const rasterizedHtml = useMemo(() => {
    if (textureRef.current) {
      return <RasterisedHtml domImg={domImg} textures={textureRef.current} />;
    } else {
      return null;
    }
  }, [domImg]);

  useEffect(() => {
    if (sourceElementRef.current) {
      updateDomImg();
    }
  }, [text]);

  return (
    <group>
      <Suspense fallback={null}>{rasterizedHtml}</Suspense>
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

// @ts-ignore
const RasterisedHtml = ({ domImg, textures }) => {
  console.log(textures);
  return (
    <mesh>
      <planeBufferGeometry args={[4, 4, 4, 4]} />
      <meshStandardMaterial map={textures} attach="material" />
    </mesh>
  );
};
