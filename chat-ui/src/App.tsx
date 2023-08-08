import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import { Chatbot } from "./Chatbot";
import styles from "./App.module.css"

function App() {
  return (
    <div className={styles.app_background}>
      <div
        style={{
          maxWidth: "750px",
          minWidth: "315px",
          width: "100%",
        }}
      >
        <Chatbot />
      </div>
    </div>
  );
}

export default function LGApp() {
  return (
    <LeafyGreenProvider darkMode={false}>
      <App />
    </LeafyGreenProvider>
  );
}
