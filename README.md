# Jyoti - AI Interview Assistant

## Quick Start

### 1. Setup Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

You should see:
```
🚀 Jyoti AI Interview Assistant running on http://localhost:3000
📡 WebSocket server ready for connections
```

### 4. Open the Application

Open your browser (Chrome or Edge recommended) and go to:
```
http://localhost:3000
```

## How to Use

1. Click **"AI इंटरव्यू शुरू करें"** to start the interview
2. Jyoti will greet you and start the conversation naturally
3. Click **"बोलें"** button and speak your response in Hindi
4. Jyoti will intelligently respond and ask follow-up questions
5. The conversation continues naturally until all information is collected
6. View the summary of collected information at the end

## Features

✅ **Natural Hindi Conversation** - Jyoti speaks like a real person, not a robot
✅ **Intelligent Responses** - AI adapts to your answers dynamically
✅ **Context-Aware Follow-ups** - Asks relevant questions based on conversation
✅ **Voice Recognition** - Speak naturally in Hindi
✅ **Real-time Processing** - Instant AI responses via WebSocket
✅ **Professional Interview** - Collects all required candidate information

## Browser Compatibility

- ✅ **Chrome** (Recommended - Full support)
- ✅ **Edge** (Full support)
- ⚠️ **Safari** (Limited Web Speech API support)
- ⚠️ **Firefox** (Limited Web Speech API support)

## Troubleshooting

**Connection Error?**
- Make sure the server is running (`npm start`)
- Check that port 3000 is not in use

**Voice Recognition Not Working?**
- Use Chrome or Edge browser
- Allow microphone permissions when prompted
- Speak clearly in Hindi

**AI Not Responding?**
- Check your OpenAI API key in `.env` file
- Ensure you have API credits available
- Check console for error messages

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Web Speech API)
- **Backend**: Node.js, Express, WebSocket
- **AI**: OpenAI GPT-4 Turbo
- **Language**: Hindi (Natural conversation)
