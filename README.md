# Wingman AI 🚀

**Wingman AI** is a powerful, proactive desktop assistant that provides real-time insights, web-search capabilities, and intelligent support directly on your screen. It’s designed to be your invisible partner during meetings, coding sessions, and professional workflows.

---

## ✨ Features

- **Proactive Intelligence**: Analyzes your screen and audio context to provide relevant suggestions.
- **Real-Time Web Search**: Integrated Google Search API for up-to-the-minute facts and documentation.
- **Flexible AI Providers**: Use **Google Gemini** for speed or **Ollama** for 100% private, local execution.
- **Seamless Interface**: A minimalist, draggable dock that stays out of your way until you need it.
- **Smart Tools**: One-click copy for AI responses and user messages, plus instant regeneration.
- **Global Access**: Launch instantly from your terminal with the `ai` command.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Git**
- **Option A (Gemini):** A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).
- **Option B (Ollama):** [Ollama](https://ollama.com/) installed locally for total privacy.

### Installation

1. **Clone & Enter**:
   ```bash
   git clone [your-repository-url]
   cd free-cluely
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # If you have native build issues:
   # SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --ignore-scripts && npm rebuild sharp
   ```

3. **Global Link (Optional but Recommended)**:
   ```bash
   npm link
   # Now you can just type 'ai' in any terminal to start!
   ```

### Configuration

Create a `.env` file in the root directory:

**For Google Gemini:**
```env
GEMINI_API_KEY=your_api_key_here
```

**For Ollama (Local/Private):**
```env
USE_OLLAMA=true
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434
```

---

## 🛠 Usage

### Launching the App
- **CLI**: Type `ai` in your terminal.
- **Dev Mode**: `npm start`
- **Build Installer**: `npm run dist` (Generates a `.dmg` in the `release/` folder).

### Keyboard Shortcuts
- **Quit**: `Cmd + Q` (Mac) or `Ctrl + Q` (Windows).

---

## 🛡 Privacy & Security

Wingman AI is built with privacy in mind. By choosing the **Ollama** provider, all processing happens locally on your machine. Your screen captures and audio data never leave your computer.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the ISC License.

---

*Powered by [Wingman AI](https://github.com/vatistasdimitris01/free-cluely)*
