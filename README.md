# LM Studio Mobile App

A beautiful, feature-rich React Native mobile application for interacting with LM Studio's local AI models via REST API.

## 🚀 Try it Now!

### 🌐 **Live Demo** (No installation needed)
```
https://goodbyefox.github.io/lm_mobile/
```

Open the link in your browser and start using immediately!

## Features

### 💬 Chat Interface
- Real-time chat with your locally-hosted LM models
- Message history persistence with AsyncStorage
- Streaming responses for improved UX
- Support for custom system prompts and model parameters
- Clean, intuitive UI with message bubbles

### 🤖 Model Management
- View all available models in your LM Studio instance
- Load/unload models on demand
- Monitor model status and parameters
- View model specifications (context length, type, etc.)

### ⚙️ Configuration
- Easy setup with server URL and API key input
- Connection testing to verify LM Studio accessibility
- Secure storage of credentials
- Support for both authenticated and unauthenticated connections
- Configuration persistence across app restarts

## 🎯 Quick Start (3 Ways)

### Way 1️⃣: 🌐 Online Version (Easiest - No installation!)

```
1. Open: https://goodbyefox.github.io/lm_mobile/
2. Configure LM Studio server address
3. Start chatting!
```

✅ Works instantly in any browser
✅ No installation required
✅ Auto-updates with latest features

### Way 2️⃣: 💻 Local Development

Prerequisites:
- Node.js 18+ and npm
- LM Studio installed and running locally

Steps:
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npx expo start

# 3. Choose platform:
# Press 'w' for web
# Press 'i' for iOS
# Press 'a' for Android
# Or scan QR with Expo Go
```

### Way 3️⃣: 📥 Download & Run Offline

```bash
# 1. Download web-app-complete artifact from GitHub Actions
unzip web-app.zip && cd web-app

# 2. Run server
node serve.js

# 3. Open browser
http://localhost:8000
```

## ⚙️ Configuration

### Initial Setup for All Methods

1. **Open the app** → Go to **Settings** tab
2. **Enter LM Studio address**:
   ```
   http://localhost:1234
   ```
   (or your remote server address)
3. **Test Connection** → Click the button to verify
4. **Save Configuration**

### Load a Model & Chat

1. **Models tab** → Load a model
2. **Chat tab** → Start typing and send messages
3. **History saved automatically** → Reopens with your conversation

## Architecture

### Directory Structure

```
LM_Mobile/
├── app/
│   ├── (tabs)/                 # Tab navigation screens
│   │   ├── chat.tsx           # Chat interface
│   │   ├── models.tsx         # Model management
│   │   ├── settings.tsx       # Configuration
│   │   └── _layout.tsx        # Tab layout
│   └── _layout.tsx            # Root layout with context provider
├── context/
│   └── LMStudioContext.tsx    # Global state management
├── services/
│   ├── lmStudioService.ts     # LM Studio API client
│   └── storage.ts            # AsyncStorage wrapper
├── components/                # Reusable UI components
├── constants/                 # App theme and constants
└── hooks/                     # Custom React hooks
```

### Key Technologies

- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Native navigation with bottom tabs
- **AsyncStorage**: Local data persistence
- **Axios**: HTTP client for API calls
- **React Context API**: Global state management

## API Integration

The app uses LM Studio's REST API v1 endpoints:

- **POST `/api/v1/chat`**: Send chat messages (supports streaming)
- **GET `/api/v1/models`**: List available models
- **POST `/api/v1/models/load`**: Load a model
- **POST `/api/v1/models/unload`**: Unload current model

### Request/Response Examples

**Chat Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "model": "model-name",
  "temperature": 0.7
}
```

**Chat Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "Hello! How can I help you?"
  },
  "usage": {
    "promptTokens": 10,
    "completionTokens": 15,
    "totalTokens": 25
  }
}
```

## Configuration Storage

Sensitive configuration is stored securely:
- Server URL and API key are stored in AsyncStorage
- Chat history is persisted locally
- All data remains on device and is never sent to third parties

## Troubleshooting

### Connection Failed
- Verify LM Studio is running and accessible at the configured URL
- Check firewall settings if connecting over network
- Ensure API key is correct if authentication is enabled
- Test with curl: `curl http://localhost:1234/api/v1/models`

### Model Won't Load
- Check LM Studio console for error messages
- Ensure you have sufficient disk space
- Verify model isn't already being loaded
- Try unloading other models first

### App Crashes on Startup
- Clear app data and reconfigure
- Update to latest LM Studio version
- Check console logs: `npx expo start`

### Chat Not Working
- Go to Settings and verify connection is still active
- Check that a model is loaded in the Models tab
- Try sending a simpler message
- Check LM Studio API logs for errors

## Development

### Running Tests
```bash
npm test
```

### Building for Production

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

### Code Style
- Uses ESLint for code quality
- TypeScript for type safety
- React hooks for state management

## Project Structure

- **App Screens**: Tab-based navigation with 3 main screens
- **State Management**: Context API with custom hooks
- **API Client**: Abstracted service layer for LM Studio
- **Storage**: Async storage wrapper for persistence
- **Types**: TypeScript interfaces for type safety

## Notes

- The app requires a stable network connection to LM Studio
- Large models may take time to load - be patient
- Chat history is stored locally; clearing app data will remove conversations
- API keys are stored in plaintext in AsyncStorage - use secure methods for production

## Future Enhancements

- [ ] Voice input/output support
- [ ] Multiple chat sessions
- [ ] Advanced model parameter controls
- [ ] Dark mode optimization
- [ ] Export chat history
- [ ] Model recommendations
- [ ] Multi-language support
- [ ] Cloud backup of settings

## License

This project is part of the LM Studio ecosystem.

## Support

For issues or questions:
1. Check LM Studio documentation: https://lmstudio.ai
2. Review app settings and connection status
3. Check console logs for error messages
