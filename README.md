# 🖼️ BG Remover - Image Background Remover

> Remove image backgrounds with one click. Powered by Remove.bg API + Next.js + Cloudflare.

![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-orange)

## ✨ Features

- 🚀 **Fast Processing** - Remove backgrounds in under 5 seconds
- 🎨 **High Quality** - Powered by Remove.bg AI
- 📱 **Responsive** - Works on desktop and mobile
- 🔒 **Secure** - Images processed securely, never stored
- 🌐 **Global CDN** - Deployed on Cloudflare's edge network

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes → Cloudflare Workers
- **AI**: Remove.bg API
- **Deployment**: Cloudflare Pages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Remove.bg API Key

### Environment Setup

1. Get your Remove.bg API key from [remove.bg/api](https://www.remove.bg/api)

2. Create a `.env.local` file:

```env
REMOVE_BG_API_KEY=your-api-key-here
```

3. For Cloudflare Pages deployment, add the environment variable in your dashboard:
   - Variable name: `REMOVE_BG_API_KEY`
   - Value: your Remove.bg API key

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Deploy to Cloudflare Pages

1. Push to GitHub
2. Connect your GitHub repo to Cloudflare Pages
3. Add environment variable `REMOVE_BG_API_KEY`
4. Deploy!

```bash
# Or deploy directly with Wrangler
npm run deploy
```

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── remove/
│   │   │       └── route.ts    # Remove.bg API endpoint
│   │   ├── layout.tsx
│   │   └── page.tsx             # Main page
│   ├── components/
│   │   ├── UploadZone.tsx       # Drag & drop upload
│   │   ├── ResultPreview.tsx     # Before/After preview
│   │   └── StatusMessage.tsx     # Loading states
│   └── styles/
│       └── globals.css
├── wrangler.toml
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🎨 Design

Cyber-tech blue theme with:
- Primary: `#00aaff` (Cyber Blue)
- Secondary: `#0066ff` (Deep Blue)
- Background: `#060b18` (Dark)

## 📄 License

MIT © 2026
