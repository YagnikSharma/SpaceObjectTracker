# Syndetect - Local Development Setup Guide

This comprehensive guide will walk you through setting up and running the Syndetect space object detection platform locally using Visual Studio Code.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0.0 or higher)
- **npm** (usually comes with Node.js)
- **Python** (version 3.10 or higher)
- **pip** (Python package manager)
- **Git** (for version control)
- **Visual Studio Code** (with recommended extensions)

## Step 1: Clone the Repository

1. Open a terminal or command prompt
2. Navigate to the directory where you want to store the project
3. Clone the repository:
   ```bash
   git clone <repository-url>
   cd syndetect
   ```

## Step 2: Set Up the Frontend Environment

1. Open the project in VS Code:
   ```bash
   code .
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```
   This will install all the required JavaScript dependencies defined in `package.json`.

3. Verify the installation by checking for the `node_modules` directory.

## Step 3: Set Up the Python Environment

1. Create a Python virtual environment (recommended for isolation):
   ```bash
   # For Windows
   python -m venv venv
   .\venv\Scripts\activate

   # For macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install the required Python packages:
   ```bash
   pip install ultralytics opencv-python numpy pillow
   ```

3. Verify the installation:
   ```bash
   python -c "import ultralytics; print(ultralytics.__version__)"
   ```

## Step 4: Configure the Environment

1. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/syndetect
   NODE_ENV=development
   ```

   * If you want to use a local PostgreSQL database, make sure to create the database and update the connection string.
   * For development without a database, the application will use in-memory storage.

2. Ensure the YOLOv8 model files are in the correct location:
   * The main YOLOv8 model file (`yolov8s.pt`) should be in the root directory.
   * Any custom-trained models should also be accessible from the application.

## Step 5: Start the Development Server

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server should start and display messages indicating it's running on port 5000.
3. Open your browser and navigate to `http://localhost:5000` to access the application.

## Testing Object Detection

To test if the object detection is working properly:

1. Navigate to the "Detection Hub" or upload section
2. Upload a test image (preferably with objects the model is trained to detect)
3. Wait for the detection process to complete
4. Verify that:
   * Bounding boxes appear around detected objects
   * The detection summary shows detected object count
   * The "Speak Result" and "Export JSON" buttons are active

## Troubleshooting Common Issues

### YOLOv8 Detection Issues

If the YOLOv8 detection is not working:

1. Check the server logs for any Python errors
2. Verify that the YOLOv8 model file is in the correct location
3. Ensure that Python can access the model file with the right permissions
4. Check if the Ultralytics package is installed correctly
5. Try running a simple YOLOv8 detection script to test the Python environment:
   ```python
   from ultralytics import YOLO
   
   # Load the model
   model = YOLO('yolov8s.pt')
   
   # Predict on an image
   results = model('path/to/test/image.jpg')
   
   # Print results
   for r in results:
       print(f"Detected {len(r.boxes)} objects")
   ```

### Node.js Server Issues

If the Node.js server isn't starting:

1. Check for errors in the terminal
2. Verify that all dependencies are installed
3. Check if the port 5000 is already in use (try a different port by modifying the server code)
4. Ensure that the database connection (if used) is configured correctly

### Frontend Rendering Issues

If the frontend is not rendering correctly:

1. Check the browser console for JavaScript errors
2. Verify that all React components are loading properly
3. Clear the browser cache and reload
4. Try a different browser to rule out browser-specific issues

## VS Code Extensions Recommendations

For an optimal development experience, install these VS Code extensions:

- **ESLint**: For JavaScript/TypeScript linting
- **Prettier**: For code formatting
- **Python**: For Python language support
- **Tailwind CSS IntelliSense**: For Tailwind CSS class suggestions
- **React Developer Tools**: Browser extension for React debugging
- **Thunder Client**: For API testing within VS Code

## Advanced Configuration

### Customizing the YOLOv8 Model

If you want to use a different YOLOv8 model or configure detection parameters:

1. Place the new model file in the root directory
2. Update the model path in `server/services/yolo-bridge.ts` 
3. Adjust confidence thresholds and other parameters as needed

### Adding Custom Detection Classes

To add custom detection classes:

1. Update the list of detection classes in `shared/schema.ts`
2. Add corresponding colors for the new classes in `client/src/lib/falcon-api.ts`
3. If using a custom-trained model, ensure it's trained to detect the new classes

## Keeping the Project Updated

To keep your local copy of the project updated:

1. Pull the latest changes from the repository:
   ```bash
   git pull
   ```

2. Install any new dependencies:
   ```bash
   npm install
   ```

3. Check for any Python dependency updates:
   ```bash
   pip install -r requirements.txt  # If a requirements.txt file exists
   ```

## Performance Optimization

For better performance during development:

1. Use smaller test images when possible
2. Consider using a smaller YOLOv8 model variant (like YOLOv8n) for faster detection
3. Close other resource-intensive applications while running the development server
4. Increase Node.js memory limit if needed:
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm run dev
   ```