import express from "express";
import session from "express-session";
import cors from "cors";
import { registerRoutes } from "./routes";
import path from "path";
import * as vite from "./vite";
import * as fs from "fs";

// Create Express server
const app = express();

// Enable CORS for development
app.use(cors());

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "syndetect-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Parse incoming JSON payloads
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Register API routes
registerRoutes(app).then(server => {
  // Start Vite dev server in development mode
  if (process.env.NODE_ENV === "development") {
    vite.setupVite(app, server).then(() => {
      // Start the server
      const PORT = process.env.PORT || 5000;
      server.listen(PORT, () => {
        vite.log(`serving on port ${PORT}`);
      });
    }).catch(err => {
      console.error("Error setting up Vite:", err);
      process.exit(1);
    });
  } else {
    vite.serveStatic(app);
    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      vite.log(`serving on port ${PORT}`);
    });
  }
}).catch(err => {
  console.error("Error registering routes:", err);
  process.exit(1);
});