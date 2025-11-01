# Flashcard App

A modern, responsive flashcard application built with React, TypeScript, and Tailwind CSS. Features include deck management, CSV import, manual card creation, and a unique card mixing functionality for tarot-like study sessions.

## Features

- 📚 **Deck Management**: Create, edit, and delete flashcard decks
- 📄 **CSV Import**: Import flashcards from CSV files
- ✏️ **Manual Creation**: Create cards manually with a user-friendly interface
- 🔮 **Card Mixing**: Mix cards from multiple decks for varied study sessions
- 💾 **Local Storage**: All data is stored locally in your browser
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ♿ **Accessible**: Full keyboard navigation and screen reader support

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd flashcard-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally
- `npm run vercel-build` - Build command used by Vercel

## Deployment

### Deploy to Vercel

This app is configured for easy deployment to Vercel:

1. **Automatic Deployment (Recommended)**:
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically deploy on every push to main

2. **Manual Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Deploy from GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the settings

### Environment Variables

No environment variables are required for basic functionality as the app uses localStorage for data persistence.

## Project Structure

```
src/
├── components/
│   └── flashcard/          # Flashcard-related components
├── lib/                    # Utility functions and storage
├── types/                  # TypeScript type definitions
└── App.tsx                 # Main application component
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation (if needed)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.