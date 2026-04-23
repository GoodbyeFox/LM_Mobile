# LM Studio Mobile App - Developer Guide

## Project Overview

This is a React Native mobile application built with Expo that allows users to interact with LM Studio's REST API v1. The app provides a user-friendly interface for chatting with local AI models, managing model loading/unloading, and configuring LM Studio connections.

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Local Storage**: AsyncStorage
- **UI Framework**: Native React Native components with custom styling

## Project Structure

```
app/
├── (tabs)/                     # Bottom tab navigation group
│   ├── _layout.tsx            # Tab navigator configuration
│   ├── chat.tsx               # Chat screen with message interface
│   ├── models.tsx             # Model management screen
│   └── settings.tsx           # Configuration screen
└── _layout.tsx                # Root layout with LMStudioProvider

context/
└── LMStudioContext.tsx        # Global state for LM Studio config and service

services/
├── lmStudioService.ts         # LM Studio REST API client
└── storage.ts                 # AsyncStorage wrapper for persistence

components/                    # Reusable UI components
constants/                     # Theme colors and constants
hooks/                        # Custom React hooks
```

## Key Components

### LMStudioContext (context/LMStudioContext.tsx)
Provides global state management with:
- `config`: Current LM Studio configuration (URL, API key)
- `service`: Active LMStudioService instance
- `isConfigured`: Boolean indicating if setup is complete
- `setConfig()`: Save new configuration
- `testConnection()`: Verify LM Studio accessibility
- `clearConfig()`: Remove saved configuration

### LMStudioService (services/lmStudioService.ts)
Abstraction layer for LM Studio API v1:
- `chat()`: Send chat message and get response
- `chatStream()`: Stream responses for real-time chat
- `listModels()`: Get available models
- `getLoadedModel()`: Check currently loaded model
- `loadModel()`: Load a specific model
- `unloadModel()`: Unload current model
- `testConnection()`: Verify API accessibility

### Storage (services/storage.ts)
Wrapper around AsyncStorage for persistence:
- `saveConfig()/getConfig()`: LM Studio configuration
- `saveChatHistory()/getChatHistory()`: Chat message history
- `clearConfig()/clearChatHistory()`: Data cleanup

## Screens

### Settings Screen (app/(tabs)/settings.tsx)
**Purpose**: Configure and test LM Studio connection
**Key Features**:
- Server URL input with validation
- Optional API key input (masked for security)
- Connection testing with status indicators
- Configuration save/clear operations
- About section with version info

**State Management**:
- Uses `useLMStudio()` context hook
- Manages local form state with useState

### Chat Screen (app/(tabs)/chat.tsx)
**Purpose**: Real-time chat with LM models
**Key Features**:
- Message display with user/assistant distinction
- Text input with send button
- Auto-scrolling to latest messages
- Chat history persistence
- Clear chat functionality
- Loading states during message processing

**Data Flow**:
1. User types message → stored in state
2. Send button → validate config → call service.chat()
3. Response → add to messages → persist to storage
4. Auto-scroll to latest message

### Models Screen (app/(tabs)/models.tsx)
**Purpose**: Manage model loading/unloading
**Key Features**:
- List all available models with specifications
- Show currently loaded model with unload button
- Load models with confirmation dialog
- Display model parameters (context length, type)
- Pull-to-refresh functionality

**API Integration**:
- GET `/api/v1/models` → List all models
- GET `/api/v1/models` (loaded field) → Current model
- POST `/api/v1/models/load` → Load model
- POST `/api/v1/models/unload` → Unload model

## Data Flow

### Initial App Load
```
App starts
  ↓
LMStudioProvider loads
  ↓
Check AsyncStorage for saved config
  ↓
If found: Initialize LMStudioService
  ↓
Set context state
  ↓
Render screens
```

### Chat Message Send
```
User types and sends message
  ↓
Validate: config exists, service initialized
  ↓
Create user Message object
  ↓
Add to messages array
  ↓
Call service.chat() with message history
  ↓
Receive assistant response
  ↓
Create assistant Message object
  ↓
Add both messages to array
  ↓
Save to AsyncStorage
  ↓
Auto-scroll to latest message
```

### Configuration Change
```
User enters URL/API key
  ↓
Tap "Save Configuration"
  ↓
Call context.setConfig()
  ↓
Save to AsyncStorage
  ↓
Initialize new LMStudioService
  ↓
Update context state
  ↓
Chat/Models screens can now use service
```

## Error Handling

### Connection Errors
- Network timeouts → User-friendly alert
- Invalid URL → Validation before save
- API key issues → Connection test feedback

### Chat Errors
- Service unavailable → Show alert, keep messages
- Model not loaded → Suggest loading model
- Message too long → Input length limit (1000 chars)

### Model Loading Errors
- Model not found → Show error message
- Load failure → Suggest checking LM Studio logs

## Styling Approach

- **Colors**: Uses theme colors from constants/theme.ts
- **Layout**: Flexbox for responsive design
- **Components**: Native React Native components (View, Text, FlatList, etc.)
- **Platform-specific**: Some components have .ios/.web variants

### Color Scheme
- Primary: `#007AFF` (iOS blue)
- Success: `#34c759`
- Error: `#ff3b30`
- Background: `#f5f5f5`
- Text: `#000` on light, adjusts for dark mode

## API Integration Notes

### LM Studio API v1 Specifics
- Base endpoint: `/api/v1/`
- Chat endpoint accepts: `messages` (array), `model` (optional), `temperature` (optional)
- Streaming support via `stream: true` parameter
- Authentication via `X-API-Key` header if provided

### Expected Response Format
```typescript
// Chat response
{
  message: {
    role: 'assistant',
    content: 'Response text'
  },
  usage?: {
    promptTokens: number,
    completionTokens: number,
    totalTokens: number
  }
}

// Models list
{
  models: [...],
  loaded: { id: string, type: string } | null
}
```

## Development Workflow

### Adding New Features

1. **New Screen**: Create file in `app/(tabs)/`
2. **New API Endpoint**: Add method to `LMStudioService`
3. **New State**: Consider if global (context) or local (useState)
4. **Persistence**: Use `storage.ts` wrapper
5. **Styling**: Create StyleSheet at bottom of component

### Testing Connection
```bash
npx expo start
# Press 'w' for web or 'i'/'a' for iOS/Android
```

### Debugging
```bash
# View console logs
npx expo start
# Errors appear in terminal

# Use React Developer Tools
# Press 'j' for flip debugger in web
```

## Performance Considerations

- Chat history loaded on mount → consider pagination for large histories
- Model list refreshed on screen focus → efficient for typical use
- Message bubbles rendered in FlatList → efficient for long chats
- AsyncStorage operations are async → proper loading states used

## Security Notes

- API keys stored in AsyncStorage (plain text)
- For production: Consider using Secure Storage
- No data sent to external servers except LM Studio
- HTTPS recommended for network LM Studio instances

## Known Limitations

- Streaming responses not fully optimized (could use proper event parsing)
- No offline support
- Chat history unlimited (could cause performance issues)
- No message editing/deletion
- Single model context per session

## Future Improvements

1. **Multiple Chat Sessions**: Allow separate conversations
2. **Advanced Parameters**: Temperature, top_p, etc. controls
3. **Voice Support**: Microphone input, text-to-speech output
4. **Export Chat**: Save conversations as text/PDF
5. **Secure Storage**: Use native secure storage for credentials
6. **Streaming Optimization**: Better event parsing and display
7. **Offline Mode**: Cache recent models and messages
8. **Image Support**: Send/receive images in chat
9. **System Prompts**: Customize model behavior
10. **Model Download**: Integration with model download endpoint

## Common Tasks

### Add New API Method
```typescript
// In lmStudioService.ts
async newMethod(param: Type): Promise<ReturnType> {
  const response = await this.client.post('/api/v1/endpoint', { param });
  return response.data;
}
```

### Add New Storage Key
```typescript
// In storage.ts
async saveNewData(data: NewDataType): Promise<void> {
  await AsyncStorage.setItem('new_data_key', JSON.stringify(data));
}
```

### Add New Screen
```typescript
// Create app/(tabs)/newscreen.tsx
import { useLMStudio } from '@/context/LMStudioContext';

export default function NewScreen() {
  const { service, isConfigured } = useLMStudio();
  // Component code
}

// Update app/(tabs)/_layout.tsx tabs
```

## Resources

- [LM Studio Docs](https://lmstudio.ai)
- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
