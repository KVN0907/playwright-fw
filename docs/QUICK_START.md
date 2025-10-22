# Playwright Framework UI - Quick Test Guide

## 🚀 Starting the UI

You have successfully set up the Playwright Framework UI! Here's how to start it:

### Option 1: Use the Start Script (Recommended)
```bash
# From the root directory
.\start-ui.bat
```

This will automatically open both the backend and frontend in separate command windows.

### Option 2: Manual Start
```bash
# Terminal 1 - Start Backend (API Server)
cd ui/server
npm run dev

# Terminal 2 - Start Frontend (React App) 
cd ui/client  
npm start
```

## 🔗 Access Points

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:3001/api  
- **Health Check**: http://localhost:3001/api/health

## 🎯 What You Can Do Now

### ✅ Dashboard
- View framework overview
- See current test execution status
- Quick navigation to all features

### ▶️ Test Execution  
- Select test suites (UI Tests, API Tests, etc.)
- Choose environment (dev, qa, staging, prod)
- Configure browsers, workers, and options
- Start/stop test execution
- **Real-time logs and progress** (WebSocket-based)

### 📊 Reports (Coming Soon)
- Test results visualization
- Screenshots and video playback  
- Export capabilities

### ⚙️ Configuration (Coming Soon)
- Environment management
- Framework settings

### 🔗 ADO Integration (Coming Soon)
- Work item integration
- Test generation from acceptance criteria

## 🧪 Testing the Setup

1. **Start the UI** using one of the methods above
2. **Open http://localhost:3000** in your browser
3. **Navigate to "Execute Tests"** 
4. **Try a simple test run**:
   - Test Suite: Select any available option
   - Environment: dev 
   - Click "Execute Tests"

## 🔍 Framework Integration

The UI automatically integrates with your existing Playwright framework:

- **Uses your npm scripts**: `test:qa`, `test:api`, etc.
- **Reads your environments**: dev, qa, staging, prod
- **Accesses test results**: from `test-results/` directory
- **Leverages your configuration**: `playwright.config.ts`

## 📂 Project Structure

```
ui/
├── client/          # React frontend (port 3000)
├── server/          # Express backend (port 3001)  
└── start-ui.bat     # Quick start script
```

## 🛠️ Next Steps

The framework is ready for:

1. **Running Tests**: Full test execution with real-time monitoring
2. **Viewing Results**: Basic result display (enhanced UI coming soon)
3. **Configuration**: Environment and framework management
4. **Extension**: Add your own custom features

## 🆘 Troubleshooting

### Port Issues
- Frontend (3000) or Backend (3001) ports in use?
- Kill existing processes or change ports in package.json

### Build Issues  
```bash
# Clean reinstall if needed
cd ui/client && rm -rf node_modules && npm install
cd ui/server && rm -rf node_modules && npm install
```

### WebSocket Issues
- Ensure both frontend and backend are running
- Check browser console for connection errors

---

**🎉 Congratulations!** You now have a fully functional UI for your Playwright testing framework. Start testing and exploring the features!