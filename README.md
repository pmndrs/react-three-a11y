<h1>@react-three/a11y</h1>

[![Version](https://img.shields.io/npm/v/@react-three/a11y?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@react-three/a11y)
[![Downloads](https://img.shields.io/npm/dt/@react-three/a11y.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@react-three/a11y)
[![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/ZZjjNvJ)

![Imgur](https://imgur.com/FdZ3jmW.jpg)

```bash
npm install @react-three/a11y
```

`@react-three/a11y` brings accessibility to webGL with easy-to-use [react-three-fiber](https://github.com/pmndrs/react-three-fiber) components:

- Focus and focus indication
- Tab index and keyboard navigation
- Screen reader support and alt-text
- Roles and cursor shapes
- Descriptive links

Live demo: https://n4rzi.csb.app

# How to use

First, place the `A11yAnnouncer` component next to the R3F Canvas component. This is critical, because it will manage the screen-reader and help emulate focus!

```jsx
import { Canvas } from 'react-three-fiber'
import { A11yAnnouncer } from '@react-three/a11y'

function App() {
  return (
    <>
      <Canvas />
      <A11yAnnouncer />
    </>
  )
}
```

To add accessibility features to your scene you'll have to wrap components you want to make focusable with the `A11y` component:

```jsx
import { A11y } from '@react-three/a11y'

<A11y>
  <MyComponent />
</A11y>
```

`MyComponent` can now receive focus. More accurately, the emulated "focus" will handled at the `A11y` components which acts as a provider for children to access its state. But even if objects are focusable, nothing will be displayed or shown by default.

## Accessing the hover, focused & pressed state

For each child wrapped in the `A11y` component, you can access the `focus`, `hover` and `pressed` state like so:

```jsx
import { useA11y } from '@react-three/a11y'

function Box(props) {
  const a11y = useA11y()
  return (
    <mesh {...props}>
      <boxBufferGeometry />
      <meshStandardMaterial color={a11y.hover || a11y.focus ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
```

## Call function on focus

The `focusCall` prop of `A11y` will be called each time this component receives focus (usually through tab navigation).

```jsx
<A11y role="content" focusCall={()=> console.log("in focus")} ... />
```

## Call function on click / keyboard Click

The `actionCall` prop of `A11y` will be called each time this component gets clicked, focused, keyboard activated etc.

```jsx
<A11y role="button" actionCall={()=> console.log("clicked")} ... />
```

## Provide a description of the currently focused / hovered element

When using the `description` prop, the `A11y` component will provide a description to the screen reader users on focus/hover.
Optionally, you can also show the description to the user on hover by setting `showAltText={true}`.

```jsx
// Reads "A rotating red square" to screen readers on focus / hover
<A11y role="content" description="A rotating red square" ... />
// Reads "A bouncing blue sphere" to screen readers on focus / hover while also showing it on mouseover
<A11y role="content" description="A bouncing blue sphere" showAltText ... />
```

If your `A11y` component has the `role="button"`, you can use three more props:

- `activationMsg`: When the user will click/activate the "button" the screen reader will read the passed message
- `deactivationMsg`: When set, it turns your button in a togglable button. Which means it now has a on/off state. Screen readers will read the state of the button as well as the activation/disactivation messages passsed.
- `pressedDescription`: When set, it turns your button in a togglable button. Which means it now has a on/off state. This description will replace the one passed via `description` when the toggle is active.

```jsx
// Reads the description on hover/focus then will read activationMsg if clicked/pressed
<A11y role="button" description="Sends a thank you email to the team" activationMsg="Email is sending" ... />
// Reads the description on hover/focus then will read activationMsg if turned on or deactivationMsg if tuned off
<A11y
  role="button"
  description="This button can enable dark theme. Dark theme is off"
  pressedDescription="This button can disable dark theme. Dark theme is on"
  activationMsg="Dark theme enabled"
  deactivationMsg="Dark theme disabled" ... />
```

## The three roles of the `A11y` component

Like in HTML, you can focus different kind of elements and expect different things depending on what you're focusing.

#### Content

```jsx
<A11y role="content" ... />
```

Uses the `default` cursor. This role is meant to provide information to screen readers or to serve as a step for a user to navigate your site using Tab for instance. It's not meant to trigger anything on click or to be activable with the Keyboard. Therefore it won't show a pointer cursor on hover.

#### Buttons


```jsx
<A11y
  role="button"
  activationMsg="Button activated"
  deactivationMsg="Button deactivated"
  pressedDescription="Button pressed" ... />
```

Uses the `pointer` cursor. Special attributes: `activationMsg`, `deactivationMsg` and `pressedDescription`.

This role is meant to emulate the behaviour of a button or a togglable button. It will display a cursor pointer when your cursor is over the linked 3D object. It will call a function on click but also on any kind of action that would trigger a focused button (Enter, Double-Tap, ...). It is also actionnable by user using a screen reader.

You can turn it into a button with aria-pressed by providing the following properties deactivationMsg, pressedDescription in addition to the usual description and activationMsg properties.

#### Links


```jsx
<A11y role="link" href="https://url.com" ... />
```

Uses the `pointer` cursor. Special attributes: `href`.

This role is meant to emulate the behaviour of a regular html link. It should be used in combination with something that will trigger navigation on click.

```diff
- Don't forget to provide the href attribute as he is required for screen readers to read it correctly !
- It will have no effect on the navigation, it's just used as information
```

## Screen Reader Support

In order to provide informations to screen reader users and use this package at its full potential, fill the `description` prop of all your `A11y` components and use the appropriate `role` prop on each of them.

## Additionals Features

Use a custom tabindex with for your A11y components by providing a number to the tabIndex attribute

```jsx
<A11y tabIndex={2} ... />
```

More about the use of tabIndex on <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex">developer.mozilla.org</a>

## Next Steps

- [ ] Improve the accessibility for mobile screen readers such as Voice Over and Talk Back
- [ ] Provide a documentation inside the IDE

### Author:

- [`twitter 👋 @AlaricBaraou`](https://twitter.com/AlaricBaraou)
