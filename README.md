<h1>@react-three/a11y</h1>

[![Version](https://img.shields.io/npm/v/@react-three/a11y?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@react-three/a11y)
[![Downloads](https://img.shields.io/npm/dt/@react-three/a11y.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@react-three/a11y)
[![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/ZZjjNvJ)

`@react-three/a11y` brings accessibility to WebGL, with easy to use components [react-three-fiber](https://github.com/pmndrs/react-three-fiber) components to enable focus indication, keyboard tab navigation, and screen reader support.

# How to use

## Initial setup

Install the @react-three/a11y package 

```bash
npm install @react-three/a11y
```

Now, you'll have to import the `A11yAnnouncer` component. We usually place it next to the R3F Canvas component.

```jsx
    import { A11yAnnouncer } from "@react-three/a11y"
     {...}
    <Canvas>
      {...}
    </Canvas>
    <A11yAnnouncer />
```

This will both help us emulate focus inside the canvas and provide some text to screen readers when necessary.

To add some accessibility features to your 3D Objects/Groups you'll have to wrap the 3D objects you want to make focusable with the `A11y` component:

```jsx
  import { A11yAnnouncer, A11y } from "@react-three/a11y"
  
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
    <A11yAnnouncer />
```

At this point both *My3DComponent* and *AGroupOf3DComponent* can receive focus.
More accurately, the emulated "focus" will be on the parent `A11y` that will act as a provider and let its children access the state.
But even if they're focusable, nothing will be displayed / read etc without a few more attributes.

## Accessing the hover, focused & pressed state

For each child wrapped in a `A11y` component, you can access the `focus` / `hover` / `pressed` state like so:

```jsx
  import { A11yAnnouncer, A11y, useA11y } from "@react-three/a11y"
  
  {...}

  const My3DComponent = (props) {

  //call useA11y to get the A11yContext from the provider
  const a11yContext = useA11y();
  //now you have access to a11yContext.hover, a11yContext.focus and a11yContext.pressed

  return (
    <mesh {...props}>
      <boxBufferGeometry args={[1, 1, 1]} />
      {/* here we'll change the material color depending on the a11yContext state */}
      <meshStandardMaterial color={a11yContext.hover || a11yContext.focus ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
```

In this example, the *meshStandardMaterial* of the component *My3DComponent* will change color if he is either focused or hovered.
How you display the focus / hover information to the user is up to you! Just make sure it's intuitive for your user!

## The role attribute 

Like in HTML, you can focus different kind of elements and expect different things depending on what you're focusing.
That's why the `A11y` component has 3 different use cases:

- `role="content"` ( default )
This role is meant to **provide information to screen readers** or to **serve as a step for a user to navigate your site using Tab**.
It's not meant to trigger anything on click or to be activable with the Keyboard.

More on this role <a href="/#content"> below </a>

- `role="button"`
This role is meant to **emulate the behaviour of a button or a togglable button**.
It will display a pointer cursor when your cursor is hovering the linked 3D Object.
It will call a callback function on click but also on any kind of action that would trigger a focused button ( Enter, Double-Tap .. )
It is also actionable by a user using a screen reader.

More on this role <a href="/#button"> below </a>

- `role="link"`
This role is meant to **emulate the behaviour of a regular HTML link**.
It should be used in combination with something that will trigger navigation on click.
Just like the button, it is accessible to all kinds of users.

More on this role <a href="/#link"> below </a>

## Call function on focus

The `focusCall` prop of `A11y` will be called each time this component receive focus ( Usually through tab navigation ).
You can for instance use it in order to make sure the currently focused element is in view by adjusting its position or the moving the camera.

```jsx
  import { A11yAnnouncer, A11y } from "@react-three/a11y"
  
    <Canvas>
      {...}
        <A11y role="content" focusCall={()=>{
          //rotate camera to show the focused element
        }}>
          <My3DComponent />
        </A11y>
      {...}
    </Canvas>
    <A11yAnnouncer />
```

## Call function on click / keyboard Click

The `actionCall` prop of `A11y` will be called each time this component gets clicked, focused, keyboard activated etc..

```jsx
  import { A11yAnnouncer, A11y } from "@react-three/a11y"
  
    <Canvas>
      {...}
        <A11y role="button" actionCall={()=>{
          alert('This button have been clicked')
        }}>
          <My3DComponent />
        </A11y>
      {...}
    </Canvas>
    <A11yAnnouncer />
```

## Provide a description of the currenlty focused / hovered element

When using the `description` prop, the `A11y` component will provide a description to the screen reader users on focus/hover.
Optionally, you can also show the description to the user on hover by setting `showAltText={true}`.

```jsx
  import { A11yAnnouncer, A11y } from "@react-three/a11y"
  
    <Canvas>
      {...}
        <A11y role="content" description="A rotating red square">
        //will read "A rotating red square" to screen readers on focus / hover 
          <My3DSquare />
        </A11y>
        {...}
        <A11y role="content" description="A bouncing blue sphere" showAltText={true}>
        //will read "A bouncing blue sphere" to screen readers on focus / hover while also showing it on mouseover
          <My3DSphere />
        </A11y>
      {...}
    </Canvas>
    <A11yAnnouncer />
```

If your A11y component have the role="button", you can use three more attributes : 
- activationMsg : When the user will click / activate the "button" the screen reader will read what you wrote in activationMsg
- desactivationMsg : When set, it turns your button in a togglable button. Which means he now has a on/off state. Screen readers will read the state of the button as well as the desactivation message / activation message that you set when toggling it.
- pressedDescription : When set, it turns your button in a togglable button. Which means he now has a on/off state. This will be read instead of the usual description when the button is on.

```jsx
  import { A11yAnnouncer, A11y } from "@react-three/a11y"
  
    <Canvas>
      {...}
        <A11y role="button" description="This button will send a thank you email to the team" activationMsg="Email is sending">
        //will read the description on hover / focus then will read activationMsg if clicked / pressed
          <My3DSquare />
        </A11y>
        {...}
        <A11y
          role="button" 
          description="This button can enable dark theme. Dark theme is off" 
          pressedDescription="This button can disable dark theme. Dark theme is on"
          activationMsg="Dark theme enabled"
          desactivationMsg="Dark theme disabled"
         >
        //will read the description on hover / focus then will read activationMsg if turned on or desactivationMsg if tuned off
          <My3DSphere />
        </A11y>
      {...}
    </Canvas>
    <A11yAnnouncer />
```

## the three role of the A11y component 
#### content
cursor: default
This role is meant to provide information to screen readers or to serve as a step for a user to navigate your site using Tab for instance.
It's not meant to trigger anything on click or to be activable with the Keyboard.
Therefore it won't show a pointer cursor on hover.

#### button
cursor: pointer
Special attributes : activationMsg, desactivationMsg, pressedDescription
This role is meant to emulate the behaviour of a button or a togglable button.
It will display a cursor pointer when your cursor is over the linked 3D object.
It will call a function on click but also on any kind of action that would trigger a focused button ( Enter, Double-Tap .. )
It is also actionnable by user using a screen reader.
You can turn it into a button with aria-pressed by providing the following properties desactivationMsg, pressedDescription in addition to the usual description and activationMsg  properties.

#### link
cursor: pointer
Special attributes : href
This role is meant to emulate the behaviour of a regular html link.
It should be used in combination with something that will trigger navigation on click.
Just like the button one, it is accessible to all kind of user.
```diff
- Don't forget to provide the href attribute as he is required for screen readers to read it correctly !
- It will have no effect on the navigation, it's just used as information
```

## Screen reader support

In order to provide informations to screen reader users and use this package at its full potential, fill the description attribute of all your A11y components and use the appropriate role attribute on each of them.

## Additionals features

Use a custom tabindex with for your A11y components by providing a number to the tabIndex attribute
```jsx
    <A11y tabIndex={2} >
      <My3DSquare />
    </A11y>
```
More about the use of tabIndex on <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex">developer.mozilla.org</a>

## Next steps

- [ ] Improve the accessibility for mobile screen readers such as Voice Over and Talk Back
- [ ] Provide a documentation inside the IDE

### Maintainers :

- [`twitter 👋 @AlaricBaraou`](https://twitter.com/AlaricBaraou)
