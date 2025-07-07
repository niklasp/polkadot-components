import { BlockNumber } from "@/registry/new-york/blocks/block-number/components/block-number";
import { PolkadotProvider } from "@/registry/new-york/providers/polkadot-provider";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Polkadot UI Components Registry
          </h1>
          <p className="text-lg text-gray-600">
            Type-safe React components for the Polkadot ecosystem
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Features</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium">Type-Safe Chain Selection</h3>
                  <p className="text-sm text-gray-600">
                    usePolkadot("chain_name") with only registered chains
                    allowed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium">No Any Types</h3>
                  <p className="text-sm text-gray-600">
                    Complete type safety with chain-specific API typing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium">Intellisense Support</h3>
                  <p className="text-sm text-gray-600">
                    Full TypeScript intellisense for all chain queries
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Live Demo</h2>
            <PolkadotProvider isDev={true}>
              <BlockNumber />
            </PolkadotProvider>
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
          <div className="space-y-3">
            <div className="font-mono text-sm bg-black text-green-400 p-3 rounded">
              const &#123; api &#125; = usePolkadot("paseo_asset_hub");
            </div>
            <p className="text-sm text-gray-600">
              TypeScript only allows registered chains as parameters and
              provides full type safety for the specific chain's API structure.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
