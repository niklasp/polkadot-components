"use client";

import { createClient, TypedApi } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { createContext, useContext, useEffect, useState } from "react";

// Dynamic import to get available descriptors
const getDescriptors = async () => {
  try {
    // This will be dynamically updated by the CLI to import the correct chain
    const descriptors = await import("@polkadot-api/descriptors");
    return descriptors;
  } catch (error) {
    console.error("Failed to load polkadot-api descriptors:", error);
    throw new Error("Polkadot API descriptors not found. Please run: npx papi");
  }
};

// Default endpoints for common chains
const getChainEndpoint = (chainName: string): string => {
  const endpoints: Record<string, string> = {
    polkadot: "wss://rpc.polkadot.io",
    kusama: "wss://kusama-rpc.polkadot.io",
    westend: "wss://westend-rpc.polkadot.io",
    rococo: "wss://rococo-rpc.polkadot.io",
    asset_hub_polkadot: "wss://polkadot-asset-hub-rpc.polkadot.io",
    asset_hub_kusama: "wss://kusama-asset-hub-rpc.polkadot.io",
    paseo_asset_hub: "wss://sys.ibp.network/asset-hub-paseo",
  };

  return endpoints[chainName] || endpoints.polkadot;
};

export interface PolkadotContextType {
  api: TypedApi<any> | null;
  chainName: string | null;
  isLoading: boolean;
  error: string | null;
}

export const PolkadotContext = createContext<PolkadotContextType>({
  api: null,
  chainName: null,
  isLoading: true,
  error: null,
});

export function PolkadotProvider({ children }: { children: React.ReactNode }) {
  const [api, setApi] = useState<TypedApi<any> | null>(null);
  const [chainName, setChainName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeApi = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically load descriptors
        const descriptors = await getDescriptors();

        // Get the first available chain descriptor
        const descriptorKeys = Object.keys(descriptors).filter(
          (key) =>
            key !== "default" && typeof (descriptors as any)[key] === "object"
        );

        if (descriptorKeys.length === 0) {
          throw new Error("No chain descriptors found");
        }

        // Prefer polkadot if available, otherwise use the first one
        const selectedChain = descriptorKeys.includes("polkadot")
          ? "polkadot"
          : descriptorKeys[0];

        const chainDescriptor = (descriptors as any)[selectedChain];
        const endpoint = getChainEndpoint(selectedChain);

        console.log(`Connecting to ${selectedChain} at ${endpoint}`);

        // Create client with the selected chain
        const client = createClient(
          withPolkadotSdkCompat(getWsProvider(endpoint))
        );

        // Get typed API for the selected chain
        const typedApi = client.getTypedApi(chainDescriptor);

        if (isMounted) {
          setApi(typedApi);
          setChainName(selectedChain);
          setIsLoading(false);
          console.log(`Successfully connected to ${selectedChain}`);
        }
      } catch (error) {
        console.error("Failed to initialize Polkadot API:", error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Unknown error");
          setIsLoading(false);
        }
      }
    };

    initializeApi();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PolkadotContext.Provider value={{ api, chainName, isLoading, error }}>
      {children}
    </PolkadotContext.Provider>
  );
}

export function usePolkadot() {
  const context = useContext(PolkadotContext);
  if (!context) {
    throw new Error("usePolkadot must be used within a PolkadotProvider");
  }
  return context;
}
