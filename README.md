<h1>react-three-a11y👩‍🦯</h1>

An easy to use package designed to bring accessibility features to [react-three-fiber](https://github.com/pmndrs/react-three-fiber) such as focus indication, keyboard tab navigation, and screen reader support.

```bash
npm install @react-three/a11y
```

```jsx
import { A11y, A11yDom, ScreenReaderHelper, ... } from '@react-three/a11y'
```

# How to use

## Initial setup

First, you'll have to import the <A11yDom /> component and wrap it around your r3f canvas

```jsx
  <A11yDom >
    <Canvas>
      {...}
    </Canvas>
  </A11yDom>
```

From there you're able to listen to focus / hover events on your canvas.
But even if you already have a bunch of 3D Object in it, none of them is focusable yet.

To add some accessibility features to a 3D Object / Group of 3D object you'll have to import the <A11y /> Component.
Then you wrap the 3D objects you want to make focusable like so

```jsx
  <A11yDom >
    <Canvas>
      {...}
        <A11y>
          <My3DComponent />
        </A11y>
      {...}
        <A11y>
          <AGroupOf3DComponent />
        </A11y>
      {...}
    </Canvas>
  </A11yDom>
```

At this point both <My3DComponent /> and <AGroupOf3DComponent /> can receive focus.
More presciesly, the emulated "focus" will be on the parent <A11y> that will act as a provider and give the possibility to it's children to react to those state.

By default, without more configuration, your component will now display a pointer like it would on any native html link for example.

## accessing the hover / focused state

For each child wrapped in a <A11y> component, you can access the focus / hover state like so

import useA11yContext from '@react-three/a11y' then

```jsx
  function My3DComponent(props) {

  //call useA11yContext to get the A11yContext from the provider
  const a11yContext = useA11yContext();
  //now you have access to a11yContext.hover and a11yContext.focus

  return (
    <mesh
      {...props}
      <boxBufferGeometry args={[1, 1, 1]} />
      //here we'll change the material color depending on the a11yContext state
      <meshStandardMaterial color={a11yContext.hover || a11yContext.focus ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
```

In this example, the component <My3DComponent /> will change color if he is either focused or hovered.
What you do with a11yContext.hover and a11yContext.focus is up to you ! Just make sur it's intuitive for your user !

## Call function on focus

## Call function on click / keyboard Click

## Anchor support : Automatically focus an element on page load

## Screen reader support

## Next steps

- [ ] Add suport for custom tabindex ( right now it'll go from top to bottom in the components order like the default DOM tab navigation )

### Maintainers :

- [`twitter 👋 @AlaricBaraou`](https://twitter.com/AlaricBaraou)
