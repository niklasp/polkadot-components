import type { ChainDefinition } from "polkadot-api";

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
