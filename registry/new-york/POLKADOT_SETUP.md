# Polkadot API Setup

After installing this component, you need to set up Polkadot API descriptors:

## 1. Generate descriptors

```bash
npx papi
```

## 2. Add the chains your app should connect to

You can add all
[known chains](https://github.com/polkadot-api/polkadot-api/tree/main/packages/known-chains),
e.g. Polkadot, Kusama, Paseo, ... or
[from websockets or files](https://papi.how/codegen#codegen)

```bash
pnpm papi add polkadot_people -n polkadot_people
# if using npx
# npx papi add polkadot_people -n polkadot_people

# or from websocket endpoint
pnpm papi add -w wss://rpc1.paseo.popnetwork.xyz pop
# npx papi add polkadot_people -n polkadot_people
```

## 3. Reinstall dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

## 4. Wrap your app with the PolkadotProvider

```tsx
import { PolkadotProvider } from "@/providers/polkadot-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PolkadotProvider>{children}</PolkadotProvider>
      </body>
    </html>
  );
}
```

The `.papi/polkadot-api.json` file configures which chains to generate
descriptors for. You can modify it to target different Polkadot/Kusama chains.
