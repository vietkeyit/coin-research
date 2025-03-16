import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppKitProvider } from "./provides/AppKitProvider.tsx";
import { Toaster } from "react-hot-toast";
import 'react-tooltip/dist/react-tooltip.css'

createRoot(document.getElementById("root")!).render(
  <AppKitProvider>
    <App />
    <Toaster />
  </AppKitProvider>
);
