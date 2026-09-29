import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { A11y } from '../src';

// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@react-three/fiber', () => ({
  useThree: (fn?: any) => {
    const state = {
      gl: {
        domElement: {
          style: {},
        },
      },
    };
    return typeof fn === 'function' ? fn(state) : state;
  },
}));

jest.mock('../src/Html', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('A11y', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('compiles and accepts blurCall prop', () => {
    const blurCall = jest.fn();
    const element = (
      <A11y role="content" description="Test" blurCall={blurCall}>
        <mesh />
      </A11y>
    );
    expect(element.props.blurCall).toBe(blurCall);
  });

  it('triggers blurCall when button is blurred', () => {
    const root = createRoot(container);
    const blurCall = jest.fn();

    act(() => {
      root.render(
        <A11y role="button" description="Button" blurCall={blurCall}>
          <span />
        </A11y>
      );
    });

    const button = container.querySelector('button');
    expect(button).not.toBeNull();

    act(() => {
      button?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });

    expect(blurCall).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });

  it('triggers blurCall when togglebutton is blurred', () => {
    const root = createRoot(container);
    const blurCall = jest.fn();

    act(() => {
      root.render(
        <A11y role="togglebutton" description="Toggle" blurCall={blurCall}>
          <span />
        </A11y>
      );
    });

    const button = container.querySelector('button');
    expect(button).not.toBeNull();

    act(() => {
      button?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });

    expect(blurCall).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });

  it('triggers blurCall when link is blurred', () => {
    const root = createRoot(container);
    const blurCall = jest.fn();

    act(() => {
      root.render(
        <A11y
          role="link"
          href="https://example.com"
          description="Link"
          blurCall={blurCall}
          actionCall={jest.fn()}
        >
          <span />
        </A11y>
      );
    });

    const link = container.querySelector('a');
    expect(link).not.toBeNull();

    act(() => {
      link?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });

    expect(blurCall).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });

  it('triggers blurCall when image is blurred', () => {
    const root = createRoot(container);
    const blurCall = jest.fn();

    act(() => {
      root.render(
        <A11y role="image" description="Image" blurCall={blurCall}>
          <span />
        </A11y>
      );
    });

    const img = container.querySelector('img');
    expect(img).not.toBeNull();

    act(() => {
      img?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });

    expect(blurCall).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });

  it('triggers blurCall when content tag is blurred', () => {
    const root = createRoot(container);
    const blurCall = jest.fn();

    act(() => {
      root.render(
        <A11y role="content" description="Content" blurCall={blurCall}>
          <span />
        </A11y>
      );
    });

    const p = container.querySelector('p');
    expect(p).not.toBeNull();

    act(() => {
      p?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });

    expect(blurCall).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });
});
