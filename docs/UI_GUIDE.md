# Playwright Framework UI Setup Guide

This guide will help you set up the comprehensive UI for the Playwright testing framework.

## Overview

The UI consists of:
- **Frontend**: React TypeScript application with Material-UI
- **Backend**: Express.js API server with WebSocket support
- **Features**: Test execution, real-time monitoring, reporting, configuration management, and ADO integration

## Quick Setup

### 1. Install Dependencies

From the root directory, run:
```bash
npm run ui:setup
```

This will install all dependencies for both client and server.

### 2. Configure Environment

The UI server uses the existing `.env` configuration in the `ui/` directory. Key settings:
- `PORT=3001` - Server port
- `CLIENT_URL=http://localhost:3000` - Frontend URL
- `NODE_ENV=development` - Environment mode

### 3. Start the UI

For development (both frontend and backend with hot reload):
```bash
npm run ui:dev
```

Or start them separately:
```bash
# Terminal 1 - Backend
cd ui/server && npm run dev

# Terminal 2 - Frontend  
cd ui/client && npm start
```

### 4. Access the UI

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## UI Features

### 🎯 Dashboard
- Overview of current test execution
- Recent execution history
- Quick stats and environment status
- Quick action buttons

### ▶️ Test Execution
- Configure test runs (environment, browsers, workers)
- Real-time execution monitoring
- Live logs and progress tracking
- Start/stop test execution

### 📊 Reports (Coming Soon)
- Test results visualization
- Screenshots and video playback
- Export reports in multiple formats
- Historical trend analysis

### ⚙️ Configuration (Coming Soon)
- Environment management
- Authentication settings
- Playwright configuration
- Connection testing

### 🔗 ADO Integration (Coming Soon)
- Work item fetching
- Acceptance criteria parsing
- Automated test generation
- Test case synchronization

## API Endpoints

### Test Execution
- `POST /api/test/execute` - Start test execution
- `GET /api/test/execution/:id` - Get execution status
- `POST /api/test/execution/:id/stop` - Stop execution
- `GET /api/test/executions` - Get execution history

### Configuration
- `GET /api/config` - Get configuration
- `PUT /api/config` - Update configuration
- `GET /api/config/test-connection` - Test connectivity

### File Management
- `POST /api/files/upload` - Upload test files
- `GET /api/files/list` - List uploaded files

### Health
- `GET /api/health` - Service health check

## WebSocket Events

Real-time updates are provided via WebSocket connection:

### Client → Server
- `subscribe-execution` - Subscribe to execution updates
- `unsubscribe-execution` - Unsubscribe from execution

### Server → Client
- `execution-update` - Real-time execution progress
- `execution-status` - Status changes
- `test-result` - Individual test results

## Directory Structure

```
ui/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API and WebSocket services
│   │   ├── store/         # State management (Zustand)
│   │   └── App.tsx        # Main app component
│   ├── public/
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities and logging
│   │   └── server.ts      # Main server file
│   └── package.json
└── package.json           # UI package scripts
```

## Integration with Existing Framework

The UI integrates seamlessly with your existing Playwright framework:

1. **Test Execution**: Uses your existing npm scripts and configurations
2. **Environment Management**: Reads from your environment variables
3. **Results**: Accesses test-results directory for reports and artifacts
4. **Configuration**: Uses your playwright.config.ts settings

## Development

### Adding New Features
1. Frontend components go in `ui/client/src/components/`
2. API endpoints go in `ui/server/src/routes/`
3. Business logic goes in `ui/server/src/services/`

### State Management
The frontend uses Zustand for state management. The main store is in `ui/client/src/store/useAppStore.ts`.

### Styling
Uses Material-UI for consistent design and responsive layout.

## Troubleshooting

### Port Conflicts
- Frontend default: 3000
- Backend default: 3001
- Change ports in package.json scripts or .env file

### Build Issues
```bash
# Clean and reinstall
rm -rf ui/client/node_modules ui/server/node_modules
npm run ui:install
```

### WebSocket Connection Issues
- Check that both frontend and backend are running
- Verify CORS settings in server configuration
- Check browser console for WebSocket errors

## Production Deployment

For production deployment:

1. Build the applications:
```bash
npm run ui:build
```

2. The built frontend will be in `ui/client/build/`
3. The compiled backend will be in `ui/server/dist/`
4. Configure reverse proxy (nginx) to serve frontend and proxy API calls
5. Set production environment variables
6. Use PM2 or similar for process management

## Next Steps

This is the initial implementation. Planned enhancements include:

1. **Enhanced Reporting**: Rich test result visualization
2. **Configuration UI**: Complete environment and settings management  
3. **ADO Integration**: Full Azure DevOps integration
4. **User Management**: Authentication and authorization
5. **Test Scheduling**: Automated test execution scheduling
6. **Notifications**: Email/Slack notifications for test results

The framework is designed to be extensible and can be customized for your specific needs.