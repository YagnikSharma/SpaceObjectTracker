# Syndetect Project Structure Guide

This guide provides a detailed overview of the Syndetect project structure, explaining the purpose and organization of directories and key files.

## Root Directory Structure

```
syndetect/
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── shared/                 # Shared types and utilities
├── public/                 # Public assets
├── uploads/                # Uploaded images
├── results/                # Detection results
├── docs/                   # Documentation
├── .github/                # GitHub workflows and templates (optional)
├── package.json            # Node.js package configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite bundler configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── .env                    # Environment variables
├── .gitignore              # Git ignore patterns
├── README.md               # Project overview
└── yolov8s.pt              # YOLOv8 model file
```

## Frontend Structure (`client/` directory)

```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI components from shadcn
│   │   └── custom/         # Custom application-specific components
│   ├── pages/              # Application pages/routes
│   │   ├── landing.tsx     # Landing page
│   │   ├── home.tsx        # Home/dashboard page
│   │   ├── mission-control.tsx  # Mission control page
│   │   ├── galactic-map.tsx     # Galactic map visualization
│   │   └── archives.tsx         # Archives/history page
│   ├── lib/                # Utility functions and helpers
│   │   ├── falcon-api.ts   # API client for backend communication
│   │   ├── queryClient.ts  # React Query configuration
│   │   └── utils.ts        # General utility functions
│   ├── assets/             # Static assets (images, fonts)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Application entry point
└── index.html              # HTML template
```

## Backend Structure (`server/` directory)

```
server/
├── index.ts                # Server entry point
├── routes/                 # API routes
│   ├── index.ts            # Route aggregation
│   ├── detection.ts        # Object detection routes
│   └── upload.ts           # Image upload routes
├── services/               # Business logic services
│   ├── yolo-bridge.ts      # Bridge to YOLOv8 Python process
│   ├── yolo-detector.py    # Python script for YOLOv8 detection
│   └── image-service.ts    # Image processing service
├── storage/                # Database interactions
│   ├── index.ts            # Storage configuration
│   └── models/             # Data models
├── middleware/             # Express middleware
│   ├── auth.ts             # Authentication middleware (if needed)
│   └── error-handler.ts    # Error handling middleware
├── config/                 # Server configuration
│   ├── database.ts         # Database configuration
│   └── environment.ts      # Environment variables
└── vite.ts                 # Vite server integration
```

## Shared Types (`shared/` directory)

```
shared/
├── schema.ts               # Shared data models and types
├── constants.ts            # Shared constants
└── validation.ts           # Shared validation schemas
```

## Public Assets (`public/` directory)

```
public/
├── favicon.ico             # Site favicon
├── banner.png              # Site banner image
├── logo.svg                # Syndetect logo
├── fonts/                  # Custom fonts
│   ├── Quantico/           # Quantico font files
│   └── Elianto/            # Elianto font files
└── sample-images/          # Sample images for testing
```

## Documentation (`docs/` directory)

```
docs/
├── local-setup-guide.md    # Guide for local development setup
├── github-setup-guide.md   # Guide for GitHub repository setup
├── yolov8-guide.md         # Guide for YOLOv8 implementation
├── vscode-setup.md         # VS Code setup recommendations
├── project-structure.md    # Project structure documentation (this file)
├── api-documentation.md    # API endpoints documentation
└── gitignore-template.txt  # Template for .gitignore file
```

## Key Configuration Files

### package.json

The `package.json` file defines project metadata, dependencies, and scripts. Key scripts include:

- `dev`: Start the development server
- `build`: Build the production version
- `lint`: Run ESLint for code quality
- `db:push`: Push schema changes to the database

### tsconfig.json

The TypeScript configuration defines compiler options and path aliases:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  }
}
```

### vite.config.ts

The Vite configuration sets up the build process and development server:

```typescript
export default defineConfig({
  plugins: [
    react(),
    Cartographer.Plugin(),
    RuntimeErrorPlugin({
      setServerInfo: async (info) => {
        // Setup development error handling
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets")
    }
  }
});
```

### tailwind.config.ts

The Tailwind CSS configuration defines the theme, colors, and plugins:

```typescript
export default {
  darkMode: ["class"],
  content: ["./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Navy blue theme for Syndetect
        primary: "#0a2a43",
        // Other color definitions
      },
      fontFamily: {
        quantico: ["Quantico", "sans-serif"],
        elianto: ["Elianto", "sans-serif"]
      }
    }
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")]
};
```

## Important Component Files

### ResultsDisplay Component

Located at `client/src/components/ui/results-display.tsx`, this component handles:
- Displaying detection results
- Rendering bounding boxes on detected objects
- Speech synthesis of results
- Exporting results as JSON or PDF

### FileUploader Component

Located at `client/src/components/ui/file-uploader.tsx`, this component handles:
- Image upload UI
- Drag-and-drop functionality
- File type validation
- Upload status indication

### YOLOv8 Bridge

Located at `server/services/yolo-bridge.ts`, this service:
- Creates a bridge between Node.js and Python
- Manages the YOLOv8 detection process
- Parses and returns detection results

## Database Structure

If using a database with Drizzle ORM, the schema is defined in `shared/schema.ts`:

```typescript
// Example schema
export const detections = pgTable('detections', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow(),
  imageUrl: text('image_url'),
  results: jsonb('results')
});
```

## Workflow Integration

The project uses Replit workflows for development:

- **Start application**: Runs `npm run dev` to start both the frontend and backend servers

## Next Steps for Development

When extending the project, consider:

1. **Adding new components**: Place in `client/src/components/`
2. **Adding new pages**: Place in `client/src/pages/` and update routing in `App.tsx`
3. **Extending the API**: Add new routes in `server/routes/`
4. **Adding new models**: Update `shared/schema.ts` and corresponding storage implementations

## Best Practices

- Follow the established directory structure for new files
- Use TypeScript types from `shared/schema.ts` for consistency
- Keep components small and focused
- Use React Query for data fetching
- Follow the design system with Tailwind and shadcn components
- Document new features and API endpoints