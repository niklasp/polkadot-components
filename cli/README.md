# Polkadot UI CLI

A CLI tool for installing Polkadot UI components with automatic API setup.
Supports Next.js, Vite, and Create React App projects.

## Features

- 🚀 **Multi-framework support**: Works with Next.js, Vite, and Create React App
- 🔗 **Automatic Polkadot API setup**: Configures chains, generates types, and
  adapts providers
- 🎨 **Tailwind CSS v4 compatibility**: Automatically detects and uses
  appropriate shadcn version
- 🔄 **Smart chain selection**: Uses testnet (Paseo Asset Hub) for development,
  mainnet for production
- 📦 **Interactive installation**: Shows shadcn prompts while automating
  Polkadot setup

## Installation

### For Development (Local Testing)

```bash
# Link the package locally
cd cli
npm link

# Or run directly
node bin/polkadot-ui.js --help
```

### For Production

```bash
# Install globally (when published)
npm install -g polkadot-ui
```

## Usage

### List Available Components

```bash
# Production registry
polkadot-ui list

# Development registry (localhost:3000)
polkadot-ui list --dev
```

### Install Components

```bash
# Production - uses mainnet Polkadot
polkadot-ui add block-number

# Development - uses testnet Paseo Asset Hub
polkadot-ui add block-number --dev
```

## Development

### Testing Locally

1. **Start the registry dev server**:

   ```bash
   cd /path/to/registry-template-v4
   pnpm dev
   ```

2. **Create a test project**:

   ```bash
   # Next.js
   npx create-next-app@latest test-project --typescript --tailwind --eslint --app --use-pnpm

   # Vite
   npm create vite@latest test-project -- --template react-ts
   cd test-project && npm install && npm install -D tailwindcss @tailwindcss/vite
   ```

3. **Test the CLI**:
   ```bash
   cd test-project
   /path/to/registry-template-v4/cli/bin/polkadot-ui.js add block-number --dev
   ```

### Key Differences: Development vs Production

| Feature         | Development (`--dev`)     | Production (default)                      |
| --------------- | ------------------------- | ----------------------------------------- |
| Registry URL    | `http://localhost:3000`   | `https://polkadot-ui-registry.vercel.app` |
| Default Chain   | Paseo Asset Hub (testnet) | Polkadot (mainnet)                        |
| Package Manager | pnpm                      | pnpm                                      |

## Project Support

The CLI automatically detects your project type and adapts:

- **Next.js**: Components in `components/`, hooks in `hooks/`, providers in
  `providers/`
- **Vite/CRA**: Components in `src/components/`, hooks in `src/hooks/`,
  providers in `src/providers/`

## What the CLI Does

1. **Validates project structure** - Ensures React/TypeScript setup
2. **Detects Tailwind version** - Uses `shadcn@canary` for v4, `shadcn@latest`
   for v3
3. **Installs component** - Uses shadcn CLI with interactive prompts
4. **Sets up Polkadot API** - Only for components that need it:
   - Adds chain metadata (`papi add`)
   - Generates TypeScript types (`papi`)
   - Adapts provider to prefer the configured chain
5. **Provides next steps** - Clear instructions for integration

## Troubleshooting

### Registry Server Not Found

```bash
# Make sure the registry dev server is running on port 3000
cd registry-template-v4
pnpm dev
```

### Tailwind CSS Not Found

```bash
# Install Tailwind CSS in your project
npm install -D tailwindcss @tailwindcss/vite  # For Vite
npm install -D tailwindcss postcss autoprefixer  # For Next.js
```

### TypeScript Errors

The CLI generates TypeScript definitions automatically. If you see type errors:

1. Restart your TypeScript server
2. Check that `@polkadot-api/descriptors` is installed
3. Ensure the provider is properly wrapped around your app
