# Frontend Project Structure

This React TypeScript project follows a well-organized folder structure for maintainability and scalability.

## Folder Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Basic UI components (Button, Input, Card, etc.)
│   ├── forms/          # Form-specific components
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   └── features/       # Feature-specific components
├── pages/              # Page components for routing
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── contexts/           # React Context providers
├── styles/             # Additional styles (if needed)
└── assets/             # Static assets (images, icons, etc.)
```

## Design System

The project uses TailwindCSS with a custom design system including:

- **Primary Colors**: Blue palette for main actions
- **Secondary Colors**: Green palette for success states
- **Component Classes**: Pre-defined classes for buttons, cards, inputs
- **Responsive Design**: Mobile-first approach with TailwindCSS utilities

## Development

- **ESLint**: Code linting with TypeScript and React rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast development server and build tool

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
