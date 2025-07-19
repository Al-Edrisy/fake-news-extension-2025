# VeriNews - Fake News Detection Browser Extension

A Chrome extension that helps users verify news claims and detect fake news using AI-powered analysis.

## Features

- **Real-time News Verification**: Analyze news articles and claims directly from web pages
- **AI-Powered Analysis**: Uses advanced AI models to detect fake news patterns
- **Floating Verify Button**: Quick verification with text selection
- **Professional UI**: Modern, responsive interface with theme support
- **Context Menu Integration**: Right-click to verify selected text
- **Notification System**: Audio feedback for verification results

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Al-Edrisy/fake-news-extension-2025.git
   cd news_cheeker/apps/fake-news-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the build output

## Usage

1. **Text Selection**: Select any text on a webpage and click the floating "Verify" button
2. **Context Menu**: Right-click on selected text and choose "Verify with VeriNews"
3. **Popup Interface**: View detailed analysis results in the extension popup
4. **Settings**: Access extension options through the extension menu

## Environment Variables

To set the backend API base URL, create a `.env` file in the project root with:

```
VITE_API_BASE_URL=http://13.60.241.86:5000
```

This will configure the extension to use your AWS backend.

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Extension**: Chrome Extension Manifest V3
- **Build Tool**: Vite with extension-specific configuration

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AdminDashboard.tsx
│   ├── AdminLogin.tsx
│   └── Navbar.tsx
├── pages/              # Extension pages
│   ├── Admin.tsx
│   ├── Docs.tsx
│   ├── Index.tsx
│   └── Services.tsx
├── popup/              # Extension popup
├── options/            # Extension options page
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── main.tsx           # Main entry point

public/
├── background.js       # Background script
├── content.js         # Content script
├── manifest.json      # Extension manifest
└── notification.mp3   # Audio feedback
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build extension for production
- `npm run preview` - Preview the built extension
- `npm run lint` - Run ESLint

### Building for Production

```bash
npm run build
```

The built extension will be in the `dist/` folder, ready to be loaded into Chrome.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

All Rights Reserved. Use, copying, or distribution is strictly prohibited without explicit written permission from the owner (SALIH OTMAN, Al-Edrisy, 2025).

## Support

For issues and feature requests, please open an issue on the GitHub repository.
