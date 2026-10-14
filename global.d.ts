/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="react/jsx-runtime" />

import type React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
    type Element = React.JSX.Element;
  }
}
