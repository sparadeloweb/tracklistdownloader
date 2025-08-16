# 🎵 Tracklist Downloader

A modern, responsive web application for downloading SoundCloud tracks and playlists. Built with React, TypeScript, and Vite, featuring a beautiful UI with customizable themes.

## ✨ Features

- **🔍 Smart Search**: Find tracks using SoundCloud's search API with intelligent matching
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🎨 Customizable Themes**: Choose from multiple color themes (orange, blue, green, purple, red)
- **🌍 Multi-language**: Available in English and Spanish
- **📥 Batch Downloads**: Download multiple tracks at once
- **🎵 Audio Preview**: Listen to tracks before downloading
- **⚡ Fast & Modern**: Built with Vite for lightning-fast development and builds

## 🚀 Live Demo

Visit the live application: [Tracklist Downloader](https://tracklistdownloader-front.dq97zj.easypanel.host/)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React Hooks
- **Internationalization**: Custom i18n system
- **Audio Player**: HLS.js for streaming support
- **Deployment**: Docker + EasyPanel

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sparadeloweb/tracklistdownloader.git
   cd tracklistdownloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure SoundCloud API**
   - Get your SoundCloud Client ID
   - Add it to `src/lib/soundcloud.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🐳 Docker Deployment

The application is containerized and ready for deployment:

```bash
docker build -t tracklistdownloader:latest .
docker run -p 80:80 tracklistdownloader:latest
```

## 🔧 Configuration

### Environment Variables

- `VITE_TRACKLIST_API_BASE`: Backend API base URL (optional)

### SoundCloud API

You'll need a SoundCloud Client ID to use the search functionality. Add it to `src/lib/soundcloud.ts`.

## 📱 Usage

1. **Add Tracklist**: Paste your track URLs (one per line)
2. **Search & Match**: The app will automatically search and find the best matches
3. **Download**: Choose individual tracks or batch download all
4. **Preview**: Listen to tracks before downloading

## 🤝 Contributing

This project is open for contributions! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Created by [Santiago Paradelo](https://www.linkedin.com/in/santiagorafaelparadelo/)**

- 💼 [LinkedIn Profile](https://www.linkedin.com/in/santiagorafaelparadelo/)
- 🐙 [GitHub Profile](https://github.com/sparadeloweb)

## 🔗 Related Projects

- **[Backend API](https://github.com/sparadeloweb/tracklistdownloaderapi)**: FastAPI backend for SoundCloud downloads
- **[Frontend App](https://github.com/sparadeloweb/tracklistdownloader)**: This React frontend application

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

**Happy downloading! 🎵**
