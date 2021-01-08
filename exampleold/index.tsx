import 'react-app-polyfill/ie11';
import ReactDOM from 'react-dom';
import React from 'react';
import { Canvas, MeshProps } from 'react-three-fiber';
import { A11yDom, FocusHelper, ScreenReaderHelper } from '../.';
import { DemoScene } from './DemoScene';
import { DemoScene2 } from './DemoScene2';
// @ts-ignore
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const DemoPage1: React.FC<MeshProps> = () => {
  return (
    <>
      <FocusHelper />
      <ScreenReaderHelper />
      <button> Focusable regular dom buton element </button>
      <a href="#"> Focusable regular dom link element </a>
      <A11yDom>
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <DemoScene />
        </Canvas>
      </A11yDom>
      <button> Focusable regular dom button element </button>
    </>
  );
};

const DemoPage2: React.FC<MeshProps> = () => {
  return (
    <>
      <FocusHelper />
      <ScreenReaderHelper />
      <button> Focusable regular dom buton element </button>
      <a href="#"> Focusable regular dom link element </a>
      <A11yDom>
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <DemoScene2 />
        </Canvas>
      </A11yDom>
      <button> Focusable regular dom button element </button>
    </>
  );
};

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/" component={DemoPage1} />
      <Route path="/page2" component={DemoPage2} />
    </Switch>
  </Router>,
  document.getElementById('root')
);
