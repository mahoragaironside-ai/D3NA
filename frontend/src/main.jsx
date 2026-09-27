import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

function mostrarErro(erro) {
  document.getElementById("root").innerHTML =
    '<div style="padding:20px;font-family:monospace;font-size:13px;color:#c0392b;white-space:pre-wrap;">ERRO AO CARREGAR A APP:\n\n' +
    (erro && erro.stack ? erro.stack : String(erro)) +
    '</div>';
}

window.addEventListener("error", (e) => mostrarErro(e.error || e.message));
window.addEventListener("unhandledrejection", (e) => mostrarErro(e.reason));

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (erro) {
  mostrarErro(erro);
}
