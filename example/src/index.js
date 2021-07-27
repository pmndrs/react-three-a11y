import React from "react"
import ReactDOM from "react-dom"
import "./styles.css"
import App from "./App"

const rootElement = document.getElementById("root")
ReactDOM.render(
  <>
    <h1 id="h1id">test h1 render</h1>
    <App />
  </>,
  rootElement,
)
