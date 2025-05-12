# VS Code Setup Guide for Syndetect

This guide provides recommendations for setting up Visual Studio Code for efficient development of the Syndetect project.

## Recommended Extensions

Install the following VS Code extensions to enhance your development experience:

### JavaScript/TypeScript Development

- **ESLint** (`dbaeumer.vscode-eslint`)
  - Integrates ESLint into VS Code for JavaScript/TypeScript linting

- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
  - Code formatting for JavaScript, TypeScript, and many other files

- **JavaScript and TypeScript Nightly** (`ms-vscode.vscode-typescript-next`)
  - Provides the latest TypeScript language features and improvements

- **Import Cost** (`wix.vscode-import-cost`)
  - Display the size of imported packages inline

### React Development

- **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
  - Provides snippets for React, Redux, and React Native

- **React Developer Tools** (`react-dev-tools`)
  - Available as a browser extension for Chrome or Firefox

### Tailwind CSS

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
  - Intelligent Tailwind CSS class name completion

- **Headwind** (`heybourn.headwind`)
  - Class sorter for Tailwind CSS

### Python Development

- **Python** (`ms-python.python`)
  - Python language support

- **Pylance** (`ms-python.vscode-pylance`)
  - Fast and feature-rich language support for Python

- **Python Indent** (`KevinRose.vsc-python-indent`)
  - Corrects indentation of Python code

### Database Tools

- **SQLTools** (`mtxr.sqltools`)
  - Database management tools

- **PostgreSQL** (`ckolkman.vscode-postgres`)
  - PostgreSQL integration for VS Code

### Productivity Tools

- **Thunder Client** (`rangav.vscode-thunder-client`)
  - REST API client for testing

- **GitLens** (`eamodio.gitlens`)
  - Git supercharged

- **Path Intellisense** (`christian-kohler.path-intellisense`)
  - Autocompletes filenames in import statements

- **Code Spell Checker** (`streetsidesoftware.code-spell-checker`)
  - Spell checking for code and comments

## Workspace Settings

Create a `.vscode/settings.json` file in your project root with the following settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.format.enable": false,
  "typescript.format.enable": false,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.tabSize": 2,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.wordWrap": "on",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true,
    "editor.tabSize": 4
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "python.formatting.blackArgs": [
    "--line-length",
    "88"
  ],
  "workbench.colorCustomizations": {
    "activityBar.background": "#0a2a43",
    "titleBar.activeBackground": "#0a2a43",
    "titleBar.activeForeground": "#e7e7e7"
  }
}
```

## Launch Configuration

Create a `.vscode/launch.json` file for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server/index.ts",
      "outFiles": ["${workspaceFolder}/**/*.js"],
      "runtimeExecutable": "tsx",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5000",
      "webRoot": "${workspaceFolder}/client/src"
    },
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    }
  ],
  "compounds": [
    {
      "name": "Server/Client",
      "configurations": ["Launch Server", "Launch Chrome against localhost"]
    }
  ]
}
```

## Tasks Configuration

Create a `.vscode/tasks.json` file for common tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development Server",
      "type": "shell",
      "command": "npm run dev",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "runOptions": {
        "runOn": "folderOpen"
      }
    },
    {
      "label": "Install Dependencies",
      "type": "shell",
      "command": "npm install",
      "problemMatcher": []
    },
    {
      "label": "Run ESLint",
      "type": "shell",
      "command": "npm run lint",
      "problemMatcher": ["$eslint-compact"]
    },
    {
      "label": "Test YOLOv8",
      "type": "shell",
      "command": "python server/services/test_yolo.py",
      "problemMatcher": []
    }
  ]
}
```

## VS Code Keyboard Shortcuts

Consider adding these helpful keyboard shortcuts to your VS Code setup:

1. **File Navigation**:
   - `Ctrl+P`: Quick open files
   - `Ctrl+Shift+E`: Explorer view
   - `Ctrl+Shift+F`: Search across files

2. **Code Editing**:
   - `Alt+Up/Down`: Move line up/down
   - `Shift+Alt+Up/Down`: Copy line up/down
   - `Ctrl+/`: Toggle line comment
   - `Ctrl+Space`: Trigger suggestions

3. **Terminal**:
   - ``Ctrl+` ``: Toggle integrated terminal
   - `Ctrl+Shift+[`: Split terminal

4. **Git Operations**:
   - `Ctrl+Shift+G`: Source control view

## Multi-Root Workspace

For more complex setups, consider creating a multi-root workspace:

1. Click File > Save Workspace As...
2. Save as `syndetect.code-workspace`
3. Edit the workspace file to include separate folders for frontend, backend, and documentation:

```json
{
  "folders": [
    {
      "name": "Syndetect",
      "path": "."
    },
    {
      "name": "Frontend",
      "path": "./client"
    },
    {
      "name": "Backend",
      "path": "./server"
    },
    {
      "name": "Documentation",
      "path": "./docs"
    }
  ],
  "settings": {
    // Workspace-specific settings go here
  }
}
```

## Extension Pack

Consider creating a VS Code extension pack for your team to ensure everyone has the same extensions:

1. Install the `vsce` package:
   ```bash
   npm install -g vsce
   ```

2. Create a new extension pack:
   ```bash
   mkdir syndetect-extension-pack
   cd syndetect-extension-pack
   vsce init
   ```

3. Edit the `package.json` to include all required extensions
4. Publish or share the extension pack with your team

## Troubleshooting

### ESLint Configuration Issues

If you encounter ESLint configuration issues:

1. Make sure the ESLint extension is installed
2. Check for a `.eslintrc.js` or `.eslintrc.json` file in your project root
3. Run `npm install eslint --save-dev` if ESLint is not included in your dependencies

### TypeScript Path Aliases

If you're using path aliases in TypeScript (like `@/components`):

1. Ensure your `tsconfig.json` has the proper path configurations
2. Consider installing the "Path Intellisense" extension for better autocompletion

### Python Environment Problems

If VS Code doesn't recognize your Python environment:

1. Open VS Code command palette (`Ctrl+Shift+P`)
2. Type and select "Python: Select Interpreter"
3. Choose the appropriate Python environment for your project