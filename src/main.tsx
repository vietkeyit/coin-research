import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppKitProvider } from "./provides/AppKitProvider.tsx";
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppKitProvider>
      <App />
      <Toaster />
    </AppKitProvider>
  </StrictMode>
);
