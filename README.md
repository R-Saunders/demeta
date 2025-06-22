# MetadataScrub

A Next.js application that helps you protect your privacy by removing metadata from image files. Upload your images, review the metadata, and download a clean version with sensitive information removed.

## Features

- Upload and analyze image files for metadata
- Review and select which metadata fields to remove
- Download cleaned images with metadata scrubbed
- Modern, responsive UI built with Tailwind CSS and Radix UI
- Support for various image formats

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

## Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd metadata-scrubber
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 4. Open your browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── metadata-scrubber.tsx  # Main application component
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks
└── lib/               # Utility functions
```

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **ExifReader** - Image metadata extraction
- **Lucide React** - Icons

## Development Notes

- The application uses TypeScript for type safety
- ESLint and TypeScript errors are ignored during builds for development convenience
- The app supports remote images from placehold.co for development purposes
- All UI components are built with accessibility in mind using Radix UI primitives

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
