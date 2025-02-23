import { createRoot } from "react-dom/client";
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <VercelAnalytics />
  </>
);