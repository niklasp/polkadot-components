import type { ChainConfig } from "@/registry/new-york/polkadot-ui/lib/types";

// Generic helper functions that work with any polkadot config
export function getChainIds<T extends Record<string, ChainConfig>>(
  chains: T
): (keyof T)[] {
  return Object.keys(chains) as (keyof T)[];
}

export function getChainConfig<
  T extends Record<string, ChainConfig>,
  K extends keyof T
>(chains: T, chainId: K): T[K] {
  return chains[chainId];
}

export function isValidChainId<T extends Record<string, ChainConfig>>(
  chains: T,
  chainId: string
): chainId is string & keyof T {
  return chainId in chains;
}

export function isTestnetChain<T extends Record<string, ChainConfig>>(
  chains: T,
  chainId: keyof T
): boolean {
  return getChainConfig(chains, chainId).isTestnet;
}

export function getTestnetChains<T extends Record<string, ChainConfig>>(
  chains: T
): (keyof T)[] {
  return getChainIds(chains).filter((chainId) =>
    isTestnetChain(chains, chainId)
  );
}

export function getMainnetChains<T extends Record<string, ChainConfig>>(
  chains: T
): (keyof T)[] {
  return getChainIds(chains).filter(
    (chainId) => !isTestnetChain(chains, chainId)
  );
}
