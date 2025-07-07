import type { ChainDefinition } from "polkadot-api";

// To add more chains, run: npx papi add <chain-name> -n <chain-name>
// Then import the descriptor here and add it to the chains configuration
import { paseo_asset_hub, paseo } from "@polkadot-api/descriptors";

export interface ChainConfig {
  readonly descriptor: ChainDefinition;
  readonly endpoint: string;
  readonly displayName: string;
  readonly isTestnet: boolean;
}

export interface PolkadotConfig<
  TChains extends Readonly<Record<string, ChainConfig>> = Readonly<
    Record<string, ChainConfig>
  >
> {
  readonly chains: TChains;
  readonly defaultChain: keyof TChains;
  readonly devChain: keyof TChains;
}

export function definePolkadotConfig<
  const TChains extends Readonly<Record<string, ChainConfig>>
>(config: PolkadotConfig<TChains>) {
  return config;
}

export const polkadotConfig = definePolkadotConfig({
  chains: {
    paseo_asset_hub: {
      descriptor: paseo_asset_hub,
      endpoint: "wss://sys.ibp.network/asset-hub-paseo",
      displayName: "Paseo Asset Hub",
      isTestnet: true,
    },
    paseo: {
      descriptor: paseo,
      endpoint: "wss://sys.ibp.network/paseo",
      displayName: "Paseo Relay Chain",
      isTestnet: true,
    },
    // Add more chains here after running `npx papi add <chain-name>`
    // Example for adding Polkadot mainnet:
    // 1. Run: npx papi add polkadot -n polkadot
    // 2. Import: import { polkadot } from "@polkadot-api/descriptors";
    // 3. Add configuration:
    // polkadot: {
    //   descriptor: polkadot,
    //   endpoint: "wss://polkadot-rpc.publicnode.com",
    //   displayName: "Polkadot",
    //   isTestnet: false,
    // },
  },
  defaultChain: "paseo_asset_hub",
  devChain: "paseo_asset_hub",
} as const);

// Export types for use in other files
export type ConfiguredChains = typeof polkadotConfig.chains;
export type ChainId = keyof ConfiguredChains;
export type ChainDescriptor<T extends ChainId> =
  ConfiguredChains[T]["descriptor"];

// Helper to get chain names
export const getChainIds = (): ChainId[] => {
  return Object.keys(polkadotConfig.chains) as ChainId[];
};

// Helper to get chain config
export const getChainConfig = <T extends ChainId>(
  chainId: T
): ConfiguredChains[T] => {
  return polkadotConfig.chains[chainId];
};

// Helper to validate chain ID
export const isValidChainId = (chainId: string): chainId is ChainId => {
  return chainId in polkadotConfig.chains;
};

// Helper to check if chain is testnet
export const isTestnetChain = (chainId: ChainId): boolean => {
  return getChainConfig(chainId).isTestnet;
};

// Helper to get testnet chains
export const getTestnetChains = (): ChainId[] => {
  return getChainIds().filter(isTestnetChain);
};

// Helper to get mainnet chains
export const getMainnetChains = (): ChainId[] => {
  return getChainIds().filter((chainId) => !isTestnetChain(chainId));
};
