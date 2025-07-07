"use client";

import { createClient, TypedApi } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { createContext, useContext, useEffect, useState } from "react";
import {
  polkadotConfig,
  getChainIds,
  getChainConfig,
  isValidChainId,
  type ChainId,
  type ChainDescriptor,
} from "@/registry/new-york/polkadot-config";

// Type for the API based on configured chains
type ConfiguredChainApi<T extends ChainId> = TypedApi<ChainDescriptor<T>>;

// Create a composite API type that includes all registered chains
type CompositeApi = {
  [K in ChainId]: ConfiguredChainApi<K>;
};

interface PolkadotContextValue {
  // Current active chain and its API
  currentChain: ChainId;
  api: ConfiguredChainApi<ChainId> | null;
  isLoading: boolean;
  error: string | null;

  // All APIs for all registered chains
  apis: Partial<CompositeApi>;

  // Function to switch active chain (type-safe)
  setApi: (chainId: ChainId) => void;

  // Connection management
  disconnect: () => void;
  isConnected: (chainId: ChainId) => boolean;

  // Chain information
  chainName: string | null;
  availableChains: ChainId[];
}

const PolkadotContext = createContext<PolkadotContextValue | undefined>(
  undefined
);

interface PolkadotProviderProps {
  children: React.ReactNode;
  isDev?: boolean;
}

export function PolkadotProvider({
  children,
  isDev = false,
}: PolkadotProviderProps) {
  const [currentChain, setCurrentChain] = useState<ChainId>(
    isDev ? polkadotConfig.devChain : polkadotConfig.defaultChain
  );
  const [apis, setApis] = useState<Partial<CompositeApi>>({});
  const [clients, setClients] = useState<
    Map<ChainId, ReturnType<typeof createClient>>
  >(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<ChainId, boolean>>(
    new Map()
  );
  const [errorStates, setErrorStates] = useState<Map<ChainId, string | null>>(
    new Map()
  );

  // Initialize the default chain on mount
  useEffect(() => {
    const defaultChain = isDev
      ? polkadotConfig.devChain
      : polkadotConfig.defaultChain;
    initializeChain(defaultChain);
  }, [isDev]);

  const initializeChain = async (chainId: ChainId) => {
    // Don't initialize if already connected
    if (apis[chainId]) return;

    setLoadingStates((prev) => new Map(prev).set(chainId, true));
    setErrorStates((prev) => new Map(prev).set(chainId, null));

    try {
      const chainConfig = getChainConfig(chainId);

      console.log(
        `Connecting to ${chainConfig.displayName} at ${chainConfig.endpoint}`
      );

      // Create client with the selected chain
      const client = createClient(
        withPolkadotSdkCompat(getWsProvider(chainConfig.endpoint))
      );

      // Get typed API for the selected chain
      const typedApi = client.getTypedApi(
        chainConfig.descriptor
      ) as ConfiguredChainApi<typeof chainId>;

      setClients((prev) => new Map(prev).set(chainId, client));
      setApis((prev) => ({ ...prev, [chainId]: typedApi }));

      console.log(`Successfully connected to ${chainConfig.displayName}`);
    } catch (err) {
      console.error(`Failed to initialize ${chainId}:`, err);
      setErrorStates((prev) =>
        new Map(prev).set(
          chainId,
          err instanceof Error
            ? err.message
            : "Failed to initialize Polkadot API"
        )
      );
    } finally {
      setLoadingStates((prev) => new Map(prev).set(chainId, false));
    }
  };

  const setApi = (chainId: ChainId) => {
    if (!isValidChainId(chainId)) {
      console.error(`Invalid chain ID: ${chainId}`);
      return;
    }

    setCurrentChain(chainId);
    // Initialize the chain if not already connected
    if (!apis[chainId]) {
      initializeChain(chainId);
    }
  };

  const disconnect = () => {
    clients.forEach((client) => client.destroy());
    setClients(new Map());
    setApis({});
    setLoadingStates(new Map());
    setErrorStates(new Map());
    const defaultChain = isDev
      ? polkadotConfig.devChain
      : polkadotConfig.defaultChain;
    setCurrentChain(defaultChain);
  };

  const isConnected = (chainId: ChainId): boolean => {
    return !!apis[chainId];
  };

  const currentChainConfig = getChainConfig(currentChain);

  const value: PolkadotContextValue = {
    currentChain,
    api: apis[currentChain] || null,
    isLoading: loadingStates.get(currentChain) || false,
    error: errorStates.get(currentChain) || null,
    apis,
    setApi,
    disconnect,
    isConnected,
    chainName: currentChainConfig.displayName,
    availableChains: getChainIds(),
  };

  return (
    <PolkadotContext.Provider value={value}>
      {children}
    </PolkadotContext.Provider>
  );
}

export function usePolkadot(): PolkadotContextValue {
  const context = useContext(PolkadotContext);

  if (context === undefined) {
    throw new Error("usePolkadot must be used within a PolkadotProvider");
  }

  return context;
}

// Helper to get properly typed API (maintains backward compatibility)
export function useTypedPolkadotApi(): ConfiguredChainApi<ChainId> | null {
  const { api } = usePolkadot();
  return api;
}

// Type exports
export type { ChainId, ConfiguredChainApi, CompositeApi };
