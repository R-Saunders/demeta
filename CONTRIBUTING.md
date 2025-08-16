# Contributing to DeMeta

Thank you for your interest in contributing to DeMeta! This document will help you get started with development and understand how to contribute effectively.

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 20 or higher)
- **npm** or **yarn** package manager
- **ExifTool** (for video processing)

### Node.js Version Management

This project uses Node.js 20. You can manage this with:

**Option 1: nvm (recommended)**

```bash
nvm use  # Automatically uses .nvmrc version
```

**Option 2: Manual installation**
Download Node.js 20 from [nodejs.org](https://nodejs.org/)

**Option 3: Other managers**

- `n use` (n manager)
- `fnm use` (fnm manager)

### Installation

```bash
git clone https://github.com/R-Saunders/demeta.git
cd demeta
```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install ExifTool** (required for video processing)

   **Ubuntu/WSL2:**

   ```bash
   sudo apt-get install libimage-exiftool-perl
   ```

   **macOS:**

   ```bash
   brew install exiftool
   ```

   **Windows:**
   Download from [ExifTool website](https://exiftool.org/)

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Check code formatting with Prettier
- `npm run formatter` - Format code with Prettier

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── test/          # Test endpoint
│   │   ├── video-metadata/ # Video metadata extraction
│   │   └── video-scrub/   # Video metadata scrubbing
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── metadata-scrubber.tsx  # Main application component
│   ├── theme-provider.tsx     # Theme context provider
│   ├── theme-toggle.tsx       # Theme toggle component
│   └── ui/               # Reusable UI components (shadcn/ui)
├── hooks/                # Custom React hooks
│   ├── use-mobile.tsx    # Mobile detection hook
│   └── use-toast.ts      # Toast notification hook
└── lib/                  # Utility functions
    └── utils.ts          # Common utility functions
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **File Processing**:
  - Images: Client-side canvas rendering
  - PDFs: pdf-lib
  - Office Documents: jszip + fast-xml-parser
  - Audio: music-metadata
  - Video: ExifTool (server-side)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## How to Report Bugs

1. **Check existing issues** to see if the bug has already been reported
2. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser/OS information
   - File type and size (if relevant)

## How to Suggest Features

1. **Check the roadmap** in [ROADMAP.md](ROADMAP.md) to see if it's already planned
2. **Create a feature request** with:
   - Clear description of the feature
   - Use case and benefits
   - Any technical considerations
   - Mockups or examples (if applicable)

## How to Contribute Code

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/demeta.git
cd demeta
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes

- Add TypeScript types where appropriate
- Include comments for complex logic
- Test your changes thoroughly
- **Code Formatting**: Run `npm run formatter` before committing to ensure consistent formatting

### 4. Test Your Changes

```bash
npm run lint          # Check code quality
npm run typecheck     # Verify TypeScript types
npm run build         # Ensure build succeeds
npm run dev           # Test locally
npm run format        # Check code formatting
npm run formatter     # Format code if needed
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve bug description"
```

**Commit Message Format:**

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code formatting changes (spacing, semicolons, etc.)
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks (dependencies, build tools, etc.)

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- Clear description of changes
- Link to related issues
- Screenshots (if UI changes)
- Test results

## 📝 Code Style Guidelines

### TypeScript

- Use strict TypeScript settings
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused and single-purpose
- Use proper prop types and interfaces

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design
- Maintain accessibility standards

## 🧪 Testing

Currently, the project doesn't have automated tests, but we're working on adding them. When contributing:

1. **Test manually** with different file types and sizes
2. **Test edge cases** (very large files, corrupted files, etc.)
3. **Test across browsers** (Chrome, Firefox, Safari, Edge)
4. **Test responsive design** on different screen sizes

## 🔒 Security Considerations

When working with file processing:

1. **Never log file contents** or sensitive metadata
2. **Validate file types** and sizes
3. **Handle errors gracefully** without exposing system information
4. **Follow security best practices** for file uploads

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

## 🎯 Getting Help

If you need help or have questions:

1. **Check existing issues** and discussions
2. **Create a new discussion** for general questions
3. **Join our community** (links coming soon)

## 📄 License

By contributing to DeMeta, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to DeMeta!** 🎉

Your contributions help make digital privacy more accessible to everyone.
