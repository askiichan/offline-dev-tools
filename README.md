# 🛠️ Dev Toolset - Offline Developer Tools

A sleek, client-side developer toolset for JSON/SQL formatting and Base64 image encoding/decoding that runs entirely in your browser with no server required.

> **Privacy-first offline tools - all processing happens locally in your browser, no data sent anywhere.**

![Developer Tools](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC)

## 🚀 Features

### 1. JSON Formatter

- **Pretty-print JSON** with proper indentation
- **Syntax highlighting** using react-syntax-highlighter with atomDark theme
- **Validation** with detailed error messages
- **Copy to clipboard** functionality
- Real-time formatting

### 2. SQL Formatter (Oracle)

- **Format SQL queries** specifically for Oracle dialect
- **Syntax highlighting** for improved readability
- **Keyword capitalization** and smart indentation
- **Copy formatted SQL** to clipboard
- Support for complex SQL statements

### 3. Base64 Image Converter

- **Bidirectional conversion** - Base64 to Image and Image to Base64
- **Decode Mode**: Paste Base64 string to preview images with auto-format detection
- **Encode Mode**: Upload images to get Base64 output with one-click copy
- **Auto-detection** of image format (JPEG, PNG, GIF, WebP)
- **Smart parsing** - automatically adds data URI prefix if missing
- **Instant validation** with error messages

## 🛠️ Tech Stack

- **React 19.2** - UI library
- **Vite 7.2** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **sql-formatter** - SQL parsing and formatting
- **react-syntax-highlighter** - Code syntax highlighting

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd offline-tools
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## 🏗️ Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## 📖 Usage

### JSON Formatter

1. Paste your JSON into the input textarea
2. Click "Format JSON"
3. View the beautified output with syntax highlighting
4. Click the copy icon to copy the formatted JSON

### SQL Formatter

1. Paste your SQL query into the input textarea
2. Click "Format SQL"
3. View the formatted query with proper indentation
4. Copy the result using the copy button

### Base64 Image Converter

**Decode Mode (Base64 → Image):**

1. Paste a Base64 encoded image string
2. The image will automatically preview in real-time
3. Works with or without the `data:image/...` prefix

**Encode Mode (Image → Base64):**

1. Click "Switch to Encode" button
2. Upload an image file (PNG, JPG, GIF, WebP)
3. View the Base64 output and image preview
4. Click "Copy" to copy the Base64 string to clipboard

## 🎨 UI Features

- **Dark Theme** - Easy on the eyes for long coding sessions with glassmorphism effects
- **Breathing Background** - Subtle animated ambient background for visual appeal
- **Responsive Design** - Works on desktop and mobile devices
- **Collapsible Sidebar** - Toggle sidebar for more workspace
- **Modern Icons** - Clean and intuitive Lucide icons
- **Smooth Animations** - Polished transitions, tool selection effects, and interactions

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Known Issues

None at the moment! If you find any bugs, please open an issue.

## 🔮 Future Enhancements

- More developer tools (JWT decoder, Hash generator, etc.)
- Export/Import functionality for formatted code
- Theme customization options
- Keyboard shortcuts
- Multi-tab support for comparing outputs

---

Built with ❤️ using React + Vite + Tailwind CSS
