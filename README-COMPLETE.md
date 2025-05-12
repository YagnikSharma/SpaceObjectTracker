# Syndetect - Space Object Detection Platform

![Syndetect Banner](./public/banner.png)

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Setup Instructions](#-setup-instructions)
  - [Local Development Setup](#local-development-setup)
  - [VS Code Configuration](#vs-code-configuration)
  - [GitHub Repository Setup](#github-repository-setup)
- [YOLOv8 Implementation Guide](#-yolov8-implementation-guide)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Credits](#-credits)
- [License](#-license)

## 📌 Project Overview

Syndetect is an advanced AI-powered space object detection platform that provides precise visual analysis using state-of-the-art machine learning technologies. The application is designed for space station environments, helping astronauts and ground control identify critical equipment and objects through intelligent detection and a user-centric interface.

The platform integrates YOLOv8 object detection models with a modern React frontend to create a responsive, highly accurate detection system specialized for space environments.

## 🛠️ Tech Stack

### Frontend
- **React.js** with TypeScript
- **TailwindCSS** for styling
- **Shadcn UI** components
- **Framer Motion** for animations
- **Web Speech API** for text-to-speech functionality
- **React Query** for data fetching
- **Wouter** for routing
- **jsPDF** for PDF export functionality

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database interactions
- **Multer** for file uploads
- **TensorFlow.js** for object detection (TF model integration)

### AI/ML
- **YOLOv8** for object detection
- **Ultralytics Python library** for YOLOv8 implementation
- **Custom-trained models** for space-specific object detection

### Design
- **Custom Google Fonts**: Quantico and Elianto
- **Navy blue (#0a2a43)** primary color scheme
- **Responsive design** with mobile-first approach

## 🚀 Features

- **Real-time Object Detection**
  - Specialized detection for toolbox, oxygen tank, fire extinguisher, and other space station equipment
  - High-accuracy detection with confidence scoring
  - Bounding box visualization with color-coding

- **Multi-Source Image Input**
  - File upload support for various image formats
  - Camera integration for real-time detection
  - Gallery of sample images for testing

- **Results Management**
  - 🔊 Voice readout of detection results
  - ⬇️ JSON export with timestamps and metadata
  - PDF report generation with detection details
  - Detection history storage

- **User Experience**
  - Immersive starry background for space theme
  - Dark mode optimized interface
  - Responsive layout for various devices
  - Intuitive navigation and controls

- **Detection Analytics**
  - Object count and classification statistics
  - Priority object highlighting
  - Detection method identification

## ⚙️ Setup Instructions

### Local Development Setup

#### Prerequisites
- **Node.js** (version 18.0.0 or higher)
- **npm** (usually comes with Node.js)
- **Python** (version 3.10 or higher)
- **pip** (Python package manager)
- **Git** (for version control)
- **Visual Studio Code** (recommended editor)

#### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd syndetect
```

#### Step 2: Set Up the Frontend Environment
```bash
# Install Node.js dependencies
npm install
```

#### Step 3: Set Up the Python Environment
```bash
# For Windows
python -m venv venv
.\venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install ultralytics opencv-python numpy pillow
```

#### Step 4: Configure the Environment
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgres://username:password@localhost:5432/syndetect
NODE_ENV=development
```

#### Step 5: Start the Development Server
```bash
npm run dev
```

The application should now be running on `http://localhost:5000`

### VS Code Configuration

#### Recommended Extensions

- **JavaScript/TypeScript Development**
  - ESLint
  - Prettier
  - JavaScript and TypeScript Nightly
  - Import Cost

- **React Development**
  - ES7+ React/Redux/React-Native snippets
  - React Developer Tools (browser extension)

- **Tailwind CSS**
  - Tailwind CSS IntelliSense
  - Headwind

- **Python Development**
  - Python
  - Pylance
  - Python Indent

- **Productivity Tools**
  - Thunder Client
  - GitLens
  - Path Intellisense
  - Code Spell Checker

#### Workspace Settings

Create a `.vscode/settings.json` file with these recommended settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.tabSize": 2,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true,
    "editor.tabSize": 4
  },
  "python.linting.enabled": true,
  "workbench.colorCustomizations": {
    "activityBar.background": "#0a2a43",
    "titleBar.activeBackground": "#0a2a43"
  }
}
```

### GitHub Repository Setup

#### Creating a New Repository

1. Log in to your GitHub account
2. Click the "+" icon and select "New repository"
3. Fill in repository details:
   - Name: `syndetect`
   - Description: "Advanced AI-powered space object detection platform"
   - Visibility: Public or Private
   - Initialize with README, .gitignore (Node), and license

#### Setting Up .gitignore

Create or update your `.gitignore` file with the following content:

```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs
*.log

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
env/
.env/
.venv/
ENV/

# ML Models (optional - uncomment if you don't want to include large model files)
# *.pt
# *.pth
# *.onnx

# Uploaded files
uploads/*
!uploads/.gitkeep

# Results
results/*
!results/.gitkeep

# OS specific files
.DS_Store
.DS_Store?
._*
Thumbs.db

# Editor directories and files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
```

#### Pushing Your Code to GitHub

```bash
# Add all files to Git tracking
git add .

# Commit the changes
git commit -m "Initial commit: Syndetect project setup"

# Push to GitHub
git push origin main
```

## 🔍 YOLOv8 Implementation Guide

### YOLOv8 Overview

The Syndetect platform uses YOLOv8, a state-of-the-art object detection model developed by Ultralytics. YOLOv8 is known for its speed, accuracy, and versatility in detecting objects in images and videos.

### Setting Up YOLOv8

#### Installation

```bash
pip install ultralytics opencv-python numpy pillow
```

#### Model Files

The application uses standard YOLOv8 model files:

- `yolov8s.pt`: The small variant of YOLOv8 (recommended for general use)
- `yolov8n.pt`: A nano variant that's faster but less accurate (optional)

Place these model files in the root directory of your project.

### Testing YOLOv8 Independently

Create a test script (`test_yolo.py`):

```python
from ultralytics import YOLO
import cv2

# Load the model
model = YOLO('yolov8s.pt')  # or your custom model path

# Test image path
img_path = 'path/to/test/image.jpg'

# Run inference
results = model(img_path)

# Print detection results
for r in results:
    boxes = r.boxes
    print(f"Detected {len(boxes)} objects")
    
    # Print details of each detection
    for box in boxes:
        cls = int(box.cls[0])
        cls_name = model.names[cls]
        conf = float(box.conf[0])
        print(f"  - {cls_name}: {conf:.2f}")

# Save the visualization
result_img = results[0].plot()
cv2.imwrite('detection_result.jpg', result_img)
```

### Common Issues and Troubleshooting

#### ParseError: Failed to parse YOLOv8 output

If you see an error like "Failed to parse YOLOv8 output" in the logs:

- Check the Python script for print statements not wrapped in proper JSON
- Update the Python script to ensure it only outputs valid JSON
- Add proper error handling to capture any Python exceptions

#### YOLOv8 Not Detecting Any Objects

If YOLOv8 runs but doesn't detect any objects:

- Lower the confidence threshold in the detector configuration
- Ensure the model is trained to recognize the objects in your images
- Check that the image is properly preprocessed before detection

## 🧩 Project Structure

### Root Directory Structure

```
syndetect/
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── shared/                 # Shared types and utilities
├── public/                 # Public assets
├── uploads/                # Uploaded images
├── results/                # Detection results
├── docs/                   # Documentation
├── package.json            # Node.js package configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite bundler configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── .env                    # Environment variables
├── .gitignore              # Git ignore patterns
├── README.md               # Project overview
└── yolov8s.pt              # YOLOv8 model file
```

### Frontend Structure (`client/` directory)

```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   └── custom/         # Custom components
│   ├── pages/              # Application pages/routes
│   ├── lib/                # Utility functions and helpers
│   ├── assets/             # Static assets (images, fonts)
│   ├── hooks/              # Custom React hooks
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Application entry point
```

### Backend Structure (`server/` directory)

```
server/
├── index.ts                # Server entry point
├── routes/                 # API routes
├── services/               # Business logic services
│   ├── yolo-bridge.ts      # Bridge to YOLOv8 Python process
│   ├── yolo-detector.py    # Python script for YOLOv8 detection
│   └── image-service.ts    # Image processing service
├── storage/                # Database interactions
├── middleware/             # Express middleware
└── config/                 # Server configuration
```

### Important Component Files

#### ResultsDisplay Component
Located at `client/src/components/ui/results-display.tsx`, this component handles:
- Displaying detection results
- Rendering bounding boxes on detected objects
- Speech synthesis of results
- Exporting results as JSON or PDF

#### FileUploader Component
Located at `client/src/components/ui/file-uploader.tsx`, this component handles:
- Image upload UI
- Drag-and-drop functionality
- File type validation
- Upload status indication

## ⚠️ Troubleshooting

### Project Requirements and Precautions

- **YOLOv8 Model Files**: Ensure the YOLOv8 model files (`yolov8s.pt` and any custom models) are placed in the root directory or in a location accessible by the application.

- **Python Environment**: The YOLOv8 detection requires Python 3.10+ with the Ultralytics package. If you encounter issues, consider creating a dedicated virtual environment.

- **Image Processing**: Large images may require additional processing time. The application is optimized for images up to 1280x720 pixels.

- **Browser Compatibility**: The speech synthesis feature requires a modern browser with Web Speech API support.

- **Port Configuration**: By default, the application runs on port 5000. Ensure this port is available or configure a different port in `server/index.ts`.

### Node.js Server Issues

If the Node.js server isn't starting:

1. Check for errors in the terminal
2. Verify that all dependencies are installed
3. Check if the port 5000 is already in use
4. Ensure that the database connection (if used) is configured correctly

### Frontend Rendering Issues

If the frontend is not rendering correctly:

1. Check the browser console for JavaScript errors
2. Verify that all React components are loading properly
3. Clear the browser cache and reload
4. Try a different browser to rule out browser-specific issues

## 👤 Credits

- Developed by: [Your Name/Team]
- YOLOv8 by Ultralytics
- UI Components: Shadcn UI
- Fonts: Google Fonts (Quantico and Elianto)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.