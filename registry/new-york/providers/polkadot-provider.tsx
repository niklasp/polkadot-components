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
} from "@/registry/new-york/lib/polkadot-config";

// Type for the API based on configured chains
type ConfiguredChainApi<T extends ChainId> = TypedApi<ChainDescriptor<T>>;

// Union type for all possible APIs
type PolkadotApi = {
  [K in ChainId]: ConfiguredChainApi<K>;
}[ChainId];

// Context type for each chain
type ChainContextType<T extends ChainId> = {
  api: ConfiguredChainApi<T> | null;
  chainName: string | null;
  isLoading: boolean;
  error: string | null;
};

// Global context for all chains
type GlobalPolkadotContextType = {
  [K in ChainId]: ChainContextType<K>;
} & {
  availableChains: ChainId[];
  switchChain: (chainId: ChainId) => void;
};

// Create contexts for each chain
const chainContexts = {} as {
  [K in ChainId]: React.Context<ChainContextType<K>>;
};

// Initialize contexts for all configured chains
getChainIds().forEach((chainId) => {
  chainContexts[chainId] = createContext<ChainContextType<typeof chainId>>({
    api: null,
    chainName: null,
    isLoading: true,
    error: null,
  });
});

export function PolkadotProvider({
  children,
  isDev = false,
}: {
  children: React.ReactNode;
  isDev?: boolean;
}) {
  const [chainStates, setChainStates] = useState<{
    [K in ChainId]: ChainContextType<K>;
  }>(() => {
    const initialState = {} as any;
    getChainIds().forEach((chainId) => {
      initialState[chainId] = {
        api: null,
        chainName: null,
        isLoading: true,
        error: null,
      };
    });
    return initialState;
  });

  const [initializedChains, setInitializedChains] = useState<Set<ChainId>>(
    new Set()
  );

  const initializeChain = async (chainId: ChainId) => {
    if (initializedChains.has(chainId)) return;

    try {
      setChainStates((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          isLoading: true,
          error: null,
        },
      }));

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

      setChainStates((prev) => ({
        ...prev,
        [chainId]: {
          api: typedApi,
          chainName: chainConfig.displayName,
          isLoading: false,
          error: null,
        },
      }));

      setInitializedChains((prev) => new Set([...prev, chainId]));

      console.log(`Successfully connected to ${chainConfig.displayName}`);
    } catch (error) {
      console.error(`Failed to initialize ${chainId}:`, error);
      setChainStates((prev) => ({
        ...prev,
        [chainId]: {
          ...prev[chainId],
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    }
  };

  const switchChain = (chainId: ChainId) => {
    if (!isValidChainId(chainId)) {
      console.error(`Invalid chain ID: ${chainId}`);
      return;
    }
    initializeChain(chainId);
  };

  useEffect(() => {
    // Initialize the appropriate chain based on environment
    const defaultChain = isDev
      ? polkadotConfig.devChain
      : polkadotConfig.defaultChain;
    initializeChain(defaultChain);
  }, [isDev]);

  // Create context providers for each chain
  const contextProviders = getChainIds().reduce(
    (providers, chainId) => {
      const Context = chainContexts[chainId];
      const chainState = chainStates[chainId];

      return (children: React.ReactNode) => (
        <Context.Provider value={chainState}>
          {providers(children)}
        </Context.Provider>
      );
    },
    (children: React.ReactNode) => <>{children}</>
  );

  return contextProviders(children);
}

// Type-safe hook for specific chain
export function usePolkadot<T extends ChainId>(
  chainId: T
): ChainContextType<T> {
  const context = useContext(chainContexts[chainId]);
  if (!context) {
    throw new Error(
      `usePolkadot("${String(chainId)}") must be used within a PolkadotProvider`
    );
  }
  return context;
}

// Helper to get properly typed API (maintains backward compatibility)
export function useTypedPolkadotApi(): PolkadotApi | null {
  // Default to dev chain for backward compatibility
  const { api } = usePolkadot(polkadotConfig.devChain);
  return api;
}

// Type export for external use
export type { ChainId, ConfiguredChainApi };
