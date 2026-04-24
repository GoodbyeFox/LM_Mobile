# LM Studio Mobile

A clean, modern React web application for chatting with your local LM Studio models. Built with Vite, TypeScript, and designed for mobile devices.

## Features

- 💬 **Chat Interface**: Real-time messaging with conversation history persistence
- 🎯 **Model Management**: View, load, and unload LM Studio models
- ⚙️ **Server Configuration**: Easy setup with server URL and optional API key authentication
- 📱 **Mobile First**: Responsive design optimized for phones and tablets
- 🌙 **Dark Mode**: Automatic theme detection based on system preferences
- 🔄 **HashRouter**: Works on any deployment path (root, subdirectory, GitHub Pages)
- 💾 **Local Storage**: All data persists in browser, never sent to external servers
- ✨ **Type Safe**: Full TypeScript support for better development experience

## Quick Start

### Prerequisites
- Node.js 20+ (or 18+)
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview the production build locally
npm run preview
```

The `dist/` directory contains the production-ready files. Deploy to any static hosting service (GitHub Pages, Vercel, Netlify, etc.).

## Configuration

### Server Setup

1. Launch LM Studio and start the API server (default: http://localhost:1234)
2. Open the application and click the **Settings** tab
3. Enter your LM Studio server address
4. (Optional) If your server requires authentication, add your API key
5. Click **Test Connection** to verify
6. Click **Save Configuration**

### Environment Variables

No environment variables needed! Configuration is stored in browser localStorage.

## Project Structure

```
src/
├── main.tsx              # React entry point
├── App.tsx              # Router configuration
├── index.css            # Global styles with CSS variables
├── types.ts             # TypeScript interfaces
├── services/            # API and storage services
│   ├── lmStudioApi.ts   # REST API client
│   └── storage.ts       # localStorage wrapper
├── contexts/            # React Context for state management
│   └── LMStudioContext.tsx
├── components/          # Reusable components
│   ├── Layout.tsx       # Main app shell with header and tabs
│   └── Layout.css
└── pages/               # Page components
    ├── ChatPage.tsx     # Chat interface
    ├── ChatPage.css
    ├── ModelsPage.tsx   # Model management
    ├── ModelsPage.css
    ├── SettingsPage.tsx # Configuration
    └── SettingsPage.css

index.html              # HTML entry point
vite.config.ts          # Vite configuration
```

## API Integration

The app communicates with LM Studio v1 REST API:

- `POST /api/v1/chat` - Send messages and get responses
- `GET /api/v1/models` - List available and loaded models
- `POST /api/v1/models/load` - Load a model
- `POST /api/v1/models/unload` - Unload the current model
- `GET /api/v1/status` - Get server status

See [LM Studio REST API Documentation](https://lmstudio.ai/docs/api/rest-api)

## Deployment

### GitHub Pages

The repository includes a GitHub Actions workflow (`.github/workflows/build.yml`) that automatically builds and deploys to GitHub Pages when you push to main branch.

Simply push to the `main` branch and the action will:
1. Install dependencies
2. Run type checking and build
3. Deploy the `dist/` directory to GitHub Pages

Your app will be available at `https://username.github.io/lm_mobile/` or your custom domain.

### Other Hosting

The `dist/` directory contains static files that can be deployed to any static host:

```bash
# Build the app
npm run build

# Serve dist/ with any static server
# Examples:
python -m http.server --directory dist 8000
npx serve dist
docker run -v "$PWD/dist:/usr/share/nginx/html" -p 8000:80 nginx
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production with type checking
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Basic rule enforcement
- **Responsive Design**: Mobile-first CSS with desktop fallbacks

### Technologies

- [React 18](https://react.dev) - UI library
- [React Router 6](https://reactrouter.com) - Routing with HashRouter
- [Vite 5](https://vitejs.dev) - Build tool
- [TypeScript 5](https://www.typescriptlang.org) - Type safety
- [Axios](https://axios-http.com) - HTTP client
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) - Theming

## Architecture

### State Management

Global state (server configuration, API instance) is managed via React Context in `LMStudioContext.tsx`:

```typescript
const { config, isConfigured, api, setConfig, clearConfig } = useLMStudio()
```

### API Service

The `LMStudioApi` class wraps Axios with proper error handling and type safety:

```typescript
const api = new LMStudioApi(config)
const models = await api.listModels()
const response = await api.chat(messages, modelId)
```

### Data Persistence

Browser localStorage is wrapped in a `storage` service for type-safe persistence:

```typescript
storage.saveChatHistory(messages)
const history = storage.getChatHistory()
```

### Styling

Global CSS variables define colors, spacing, and shadows. Each page and component has its own CSS module for scoped styles.

## Troubleshooting

### "Server configuration not found"

Make sure you've:
1. Entered the correct server address (with protocol: `http://localhost:1234`)
2. LM Studio is running and the API server is started
3. Clicked "Save Configuration" after entering details

### "Connection failed"

Check that:
1. Your LM Studio server address is correct
2. The server is running (`http://localhost:1234` for local setup)
3. No firewall is blocking the connection
4. Optional: Your API key (if server requires authentication) is correct

### Chat not responding

Ensure a model is loaded in LM Studio:
1. Go to the **Models** tab in the app
2. Select a model and click **Load**
3. You should see it appear in the "Currently loaded model" section

### Build fails with TypeScript errors

Run `npm install` to ensure all dependencies are installed, especially `@types/node` which is needed for the build configuration.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES2020 support

Mobile browsers (iOS Safari, Chrome Mobile) are fully supported and optimized.

## License

This project is part of the LM Studio ecosystem. See LICENSE file for details.

## Resources

- [LM Studio Official](https://lmstudio.ai)
- [LM Studio REST API Docs](https://lmstudio.ai/docs/api/rest-api)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

## Contributing

To contribute improvements:

1. Clone the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit with clear messages
5. Push to your branch
6. Open a Pull Request

## Support

For issues with the app, check:
- That your LM Studio server is running
- Your server address and API key (if needed) in Settings
- That you have a model loaded before chatting
- Browser console (F12) for any error messages

For issues with LM Studio itself, visit [lmstudio.ai](https://lmstudio.ai)
