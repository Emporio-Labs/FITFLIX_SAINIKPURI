import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./components/dna-hero.css";
import "./components/founders-refinement.css";
import "./components/questionnaire.css";

const root = document.getElementById("root");
if (!root) throw new Error("Founders Club root element is missing");
createRoot(root).render(<App />);
