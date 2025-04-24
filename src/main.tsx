import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { inventoryApi } from "./lib/Api.ts";

// Check for database connection before rendering
const initApp = async () => {
  try {
    // Attempt to verify database connection
    await inventoryApi.ensureDatabase();
    console.log("Database connection verified");
  } catch (error) {
    console.warn(
      "Initial database check failed, app will still attempt to start:",
      error,
    );
    // We don't prevent app launch, as the backend might be setting up the database
  } finally {
    // Render the app regardless of database status
    createRoot(document.getElementById("root")!).render(<App />);
  }
};

// Start the application
initApp();
