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
- 📝 **Detailed next steps**: Provides complete integration instructions

## Installation

### For Development (Local Testing)

```bash
# Clone the repository and navigate to CLI directory
git clone <repo-url>
cd registry-template-v4/cli

# Link the package locally for testing
npm link

# Or run directly without linking
node bin/polkadot-ui.js --help
```

### For Production

```bash
# Install globally (when published to npm)
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

## Testing the CLI

### Prerequisites

1. **Start the registry dev server**:

   ```bash
   cd registry-template-v4
   pnpm dev
   # Should run on http://localhost:3000
   ```

2. **Link the CLI globally** (one-time setup):
   ```bash
   cd registry-template-v4/cli
   npm link
   # This makes 'polkadot-ui' command available globally
   ```

### Create Test Project

```bash
# Create a fresh Next.js project
cd /tmp
npx create-next-app@latest test-polkadot-cli --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm --turbopack

# Navigate to project
cd test-polkadot-cli

# Fix pnpm store if needed
pnpm install
```

### Test the CLI

```bash
# Test listing components
polkadot-ui list --dev

# Test installing a Polkadot component
polkadot-ui add block-number --dev

# The CLI should:
# 1. Show interactive shadcn prompts (color selection, etc.)
# 2. Install the component and dependencies
# 3. Set up Polkadot API with Paseo Asset Hub
# 4. Show detailed next steps instructions
```

### Expected Output

```
Using development registry at localhost:3000
Installing block-number component...
✔ Project structure validated
Detected Tailwind CSS v4
Using shadcn@canary for compatibility
✔ You need to create a components.json file to add components. Proceed? … yes
✔ Which color would you like to use as the base color? › Neutral
✔ Writing components.json.
✔ Created 4 files:
  - components/block-number.tsx
  - hooks/use-block-number.ts
  - providers/polkadot-provider.tsx
  - components/ui/button.tsx

✓ Component installed successfully
Setting up Polkadot API...
✔ Paseo Asset Hub chain metadata and types generated
Adapting provider to use Paseo Asset Hub...
✔ Provider adapted to prefer "paseo_asset_hub" chain
✅ block-number component installed successfully with Polkadot API setup!

Next steps:
1. Wrap your app with the PolkadotProvider:
   // In your app/layout.tsx or pages/_app.tsx
   import { PolkadotProvider } from '@/providers/polkadot-provider';
   // Wrap your app:
   <PolkadotProvider>{children}</PolkadotProvider>

2. Import and use the component in your pages:
   import { BlockNumber } from '@/components/block-number';

3. The component will automatically connect to the blockchain!
```

## Development vs Production

| Feature            | Development (`--dev`)       | Production (default)                      |
| ------------------ | --------------------------- | ----------------------------------------- |
| Registry URL       | `http://localhost:3000`     | `https://polkadot-ui-registry.vercel.app` |
| Default Chain      | Paseo Asset Hub (testnet)   | Polkadot (mainnet)                        |
| Package Manager    | pnpm                        | pnpm                                      |
| Setup Requirements | Registry dev server running | Published registry                        |

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
3. **Shows interactive prompts** - Users can select shadcn preferences (colors,
   etc.)
4. **Installs component** - Uses shadcn CLI with user input
5. **Detects Polkadot components** - Checks for `polkadot-api` dependency or
   `requiresPolkadotApi` flag
6. **Sets up Polkadot API** - Only for components that need it:
   - Adds chain metadata (`papi add paseo_asset_hub` or `papi add polkadot`)
   - Generates TypeScript types (`papi`)
   - Adapts provider to prefer the configured chain
7. **Shows detailed next steps** - Complete integration instructions with code
   examples

## Troubleshooting

### Registry Server Not Found

```bash
# Make sure the registry dev server is running on port 3000
cd registry-template-v4
pnpm dev
# Check: curl http://localhost:3000/registry.json
```

### pnpm Store Version Error

```bash
# Fix with:
pnpm install
# This recreates node_modules with correct store version
```

### Tailwind CSS Not Found

```bash
# For Next.js projects created with --tailwind, this should be automatic
# For manual setup:
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### TypeScript Errors with Polkadot API

The CLI generates TypeScript definitions automatically. If you see type errors:

1. **Check `.papi` directory exists** with generated files
2. **Restart TypeScript server** in your editor
3. **Verify `@polkadot-api/descriptors` is installed** in node_modules
4. **Ensure the provider is properly imported** in your app

### Component Not Working

1. **Wrap your app with PolkadotProvider** as shown in next steps
2. **Check browser console** for connection errors
3. **Verify network connection** to Paseo Asset Hub (dev) or Polkadot (prod)

## File Structure After Installation

```
your-project/
├── .papi/
│   ├── polkadot-api.json
│   └── descriptors.d.ts
├── components/
│   ├── block-number.tsx
│   └── ui/
│       └── button.tsx
├── hooks/
│   └── use-block-number.ts
├── providers/
│   └── polkadot-provider.tsx
├── node_modules/
│   ├── polkadot-api/
│   ├── @polkadot-api/descriptors/
│   └── ...
└── package.json (updated with polkadot-api dependency)
```

## Contributing

To add new components to the registry:

1. **Add component files** to `registry/new-york/blocks/your-component/`
2. **Update `registry.json`** to include the new component
3. **Set `requiresPolkadotApi: true`** if it needs blockchain connection with
   papi
4. **Test with CLI**: `polkadot-ui add your-component --dev`
