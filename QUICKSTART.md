# Quick Start Guide - LM Studio Mobile App

Get up and running with the LM Studio mobile app in 5 minutes.

## Prerequisites

- ✅ Node.js 18+ and npm installed
- ✅ LM Studio running on your computer or accessible via network
- ✅ An Android emulator, iOS simulator, or Expo Go app on your phone

## Installation (2 minutes)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Open the app**
   - **Web**: Press `w`
   - **iOS Simulator**: Press `i` (macOS only)
   - **Android Emulator**: Press `a`
   - **Physical Device**: Scan QR code with Expo Go app

## First-Time Setup (3 minutes)

### Step 1: Configure Server Connection
1. Open the **Settings** tab (gear icon at bottom)
2. Enter your LM Studio server URL:
   - Local: `http://localhost:1234`
   - Remote: `https://your-server.com:port`
3. Leave API Key empty (unless your server requires authentication)
4. Tap **Test Connection** to verify
5. Tap **Save Configuration**

### Step 2: Load a Model
1. Go to the **Models** tab (cube icon)
2. Find a model in the list
3. Tap **Load** button
4. Wait for the model to load (this may take a few moments)
5. You'll see the model appear in "Currently Loaded" section

### Step 3: Start Chatting
1. Switch to the **Chat** tab (bubble icon)
2. Type your message
3. Tap **Send**
4. Wait for the response
5. Enjoy! Your chat history is saved automatically

## Troubleshooting

### "Connection Failed" Error
```bash
# Test if LM Studio is running
curl http://localhost:1234/api/v1/models
```
- ✅ If this works, reload the app (close and reopen)
- ❌ If it fails, start LM Studio first

### Model Won't Load
- Check LM Studio console for errors
- Try with a smaller model first
- Ensure you have 4GB+ free disk space

### Chat Not Responding
1. Go to **Models** tab
2. Verify a model is loaded
3. Return to **Chat** and try again
4. Check LM Studio is still running

### "API Key" Issues
- If your LM Studio doesn't require authentication, leave it blank
- If it does, copy the key from LM Studio settings
- Tap **Show** to verify it's entered correctly

## Common Use Cases

### Chatting with a Local Model
```
Settings: http://localhost:1234 (no API key)
  ↓
Models: Load "Mistral" or your favorite model
  ↓
Chat: Ask questions, get instant responses
```

### Connecting to Remote LM Studio
```
Settings: https://api.example.com:1234
  ↓
Settings: Enter API Key if required
  ↓
Test Connection: Verify connectivity
  ↓
Models: Load and chat as normal
```

### Privacy & Local Inference
- ✅ All data stays on your device
- ✅ Your models run locally on your computer
- ✅ No cloud services involved (unless you configure remote)
- ✅ Chat history stored only in the app

## Tips & Tricks

### Faster Performance
- Use smaller models (< 7B parameters)
- Reduce context window in advanced settings
- Keep your computer's RAM clear

### Better Responses
- Give more context in your questions
- Break long questions into smaller ones
- Adjust temperature in settings (0.0 = precise, 1.0 = creative)

### Managing Storage
- Large models take 4-30GB of disk space
- Chat history is saved automatically
- Clear chat history in the Chat tab when needed

## Next Steps

1. **Explore Models**: Try different models in the Models tab
2. **Read Full Docs**: See README.md for detailed documentation
3. **Learn LM Studio**: Visit https://lmstudio.ai for more info
4. **Report Issues**: Check GitHub or contact LM Studio support

## Useful Commands

```bash
# Restart the dev server
npx expo start

# Reset Expo cache (if you have issues)
npx expo start -c

# View logs
npx expo start
# Logs appear in the terminal output

# Build for iOS (macOS only)
eas build --platform ios

# Build for Android
eas build --platform android
```

## What's Happening Behind the Scenes?

When you:

**Configure a server**:
- App stores URL + API key in device storage
- Creates a connection to LM Studio's REST API

**Load a model**:
- Sends a request to LM Studio
- Server loads the model from disk (can take minutes for large models)
- App shows status while loading

**Send a message**:
- App sends your message + conversation history to LM Studio
- Server processes with the loaded model
- Response streamed back to app
- Both messages saved to device storage

## Performance Expectations

- **Connection test**: < 1 second
- **Load model**: 30 seconds - 5 minutes (depends on model size)
- **First message**: 5-15 seconds (processing)
- **Subsequent messages**: 2-10 seconds (depends on response length)

## Getting Help

1. **Check Settings**: Verify LM Studio URL is correct
2. **Read Logs**: Enable verbose logging in settings
3. **Test Connection**: Use the test button in Settings
4. **Restart**: Close and reopen the app
5. **Check LM Studio**: Ensure it's running and models are loaded

## What You Can Do

### Chat
- 💬 Ask questions
- 📝 Get explanations
- 🎨 Get creative ideas
- 🐛 Debug code
- 📚 Learn new topics

### Models
- 📥 Load different models
- ⚙️ Check model specs
- 💾 View model size
- 🔄 Switch models mid-conversation

### Settings
- 🌐 Change server
- 🔑 Update API key
- 🧪 Test connections
- 📱 Configure app behavior

## FAQ

**Q: Can I use this with remote LM Studio?**
A: Yes! Just enter your remote server URL in Settings

**Q: Is my data sent to the cloud?**
A: No, everything stays on your device or your configured server

**Q: Can I use this offline?**
A: No, you need a connection to LM Studio to chat

**Q: How do I clear my chat history?**
A: Open Chat tab, tap "Clear Chat" button

**Q: Can I export my conversations?**
A: Not yet, but it's on the roadmap!

**Q: Does this work with OpenAI?**
A: Only with LM Studio local instances

---

**Ready to chat?** Start with Settings, load a model, then begin chatting! 🚀
