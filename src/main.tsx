import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LandingPage } from "./LandingPage";
import "./styles.css";

const page = document.body.dataset.page;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {page === "score" ? <App /> : <LandingPage />}
  </StrictMode>,
);
