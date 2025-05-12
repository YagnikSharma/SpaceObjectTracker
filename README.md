# Syndetect - Space Object Detection Platform

![Syndetect Banner](./public/banner.png)

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

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Git
- Visual Studio Code

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd syndetect
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Python Dependencies
```bash
pip install ultralytics opencv-python numpy pillow
```

### Step 4: Set Up Environment Variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgres://username:password@localhost:5432/syndetect
NODE_ENV=development
```

### Step 5: Start the Development Server
```bash
npm run dev
```

The application should now be running on `http://localhost:5000`

## ⚠️ Project Requirements and Precautions

- **YOLOv8 Model Files**: Ensure the YOLOv8 model files (`yolov8s.pt` and any custom models) are placed in the root directory or in a location accessible by the application.

- **Python Environment**: The YOLOv8 detection requires Python 3.10+ with the Ultralytics package. If you encounter issues, consider creating a dedicated virtual environment.

- **Image Processing**: Large images may require additional processing time. The application is optimized for images up to 1280x720 pixels.

- **Browser Compatibility**: The speech synthesis feature requires a modern browser with Web Speech API support.

- **Port Configuration**: By default, the application runs on port 5000. Ensure this port is available or configure a different port in `server/index.ts`.

## 🧩 Project Structure

```
syndetect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utility functions
│   │   └── assets/         # Static assets
├── server/                 # Backend Express server
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── storage/            # Database interactions
├── shared/                 # Shared types and utilities
├── public/                 # Public assets
├── uploads/                # Uploaded images
├── results/                # Detection results
├── yolov8s.pt              # YOLOv8 model file
└── ...                     # Configuration files
```

## 🚀 Deployment

The application can be deployed on any Node.js hosting service. For optimal performance, consider services that support both Node.js and Python runtime environments, such as:

- Heroku with Python buildpack
- AWS Elastic Beanstalk
- Google Cloud Run
- Digital Ocean App Platform

## 🔗 GitHub Repository Setup

### Setting Up a New Repository

1. Create a new repository on GitHub
2. Initialize the repository with a README and .gitignore file for Node.js
3. Clone the repository to your local machine
4. Copy your project files to the cloned repository
5. Add, commit, and push your changes

### Recommended .gitignore

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

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
env/
.env/

# ML Models (optional - these can be large)
# *.pt
# *.pth
# *.onnx

# Uploaded files
uploads/*
!uploads/.gitkeep

# Results
results/*
!results/.gitkeep

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## 👤 Credits

- Developed by: Tech Titans (Leader- Sanjana Kumari)
- YOLOv8 by Ultralytics
- UI Components: Shadcn UI
- Fonts: Google Fonts (Quantico and Elianto)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
