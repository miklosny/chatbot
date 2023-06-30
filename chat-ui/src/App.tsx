import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Chatbot from "./Chatbot";
import styles from "./App.module.css";

function App() {
  return (
    <div
      className={styles.app}
    >
      <div
        style={{
          maxWidth: "650px",
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
    <LeafyGreenProvider>
      <App />
    </LeafyGreenProvider>
  );
}
