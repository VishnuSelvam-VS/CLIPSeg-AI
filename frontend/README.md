# CLIPSeg AI Frontend

React-based frontend for CLIPSeg AI image segmentation application.

## Features

- Modern, responsive UI built with React 19 and Tailwind CSS
- Interactive split-view slider for comparing original and segmented images
- Drag-and-drop image upload
- Real-time segmentation results
- Download functionality for segmented images
- Quick-select prompt chips
- Smooth animations and transitions

## Tech Stack

- **React 19.2** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **JavaScript ES6+** - Modern JavaScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs on http://localhost:5173

### Build

```bash
npm run build
```

Creates optimized production build in `dist/`

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Component styles (minimal)
│   ├── index.css        # Tailwind CSS imports
│   └── main.jsx         # React entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## Key Components

### App.jsx

Main application component with:
- Image upload handling
- API communication
- Results display with interactive slider
- Download functionality

### Interactive Slider

Split-view comparison slider features:
- Drag to compare original vs segmented
- Mouse and touch support
- Smooth, responsive interaction
- CSS clip-path for efficient rendering

## Configuration

### API Endpoint

Update the API URL in `src/App.jsx`:

```javascript
const response = await fetch('http://localhost:8000/segment', {
  method: 'POST',
  body: formData,
});
```

### Styling

Customize colors and design in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles
- Component className props - Tailwind utility classes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
- No IE11 support

## Dependencies

### Production
- `react` - UI framework
- `react-dom` - React DOM rendering

### Development
- `@vitejs/plugin-react` - Vite React plugin
- `tailwindcss` - CSS framework
- `autoprefixer` - CSS post-processing
- `postcss` - CSS transformation
- `eslint` - Code linting
- `vite` - Build tool

## Troubleshooting

### Port already in use

If port 5173 is in use, Vite will automatically try the next available port.

### Build errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Slow HMR

Check for:
- Too many files being watched
- Antivirus interfering with file watching
- Large node_modules directory

## Contributing

1. Follow React best practices
2. Use functional components and hooks
3. Maintain Tailwind CSS utility classes
4. Keep components focused and reusable
5. Test in multiple browsers

## License

Part of CLIPSeg AI project

---

For more information, see the main [README.md](../README.md)
