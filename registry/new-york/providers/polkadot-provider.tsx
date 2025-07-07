"use client";

import { paseo_asset_hub } from "@polkadot-api/descriptors";
import { createClient, TypedApi } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { createContext, useContext } from "react";

const client = createClient(
  withPolkadotSdkCompat(getWsProvider("wss://sys.ibp.network/asset-hub-paseo"))
);

export interface PolkadotContextType {
  api: TypedApi<typeof paseo_asset_hub> | null;
}

export const PolkadotContext = createContext<PolkadotContextType>({
  api: null,
});

export function PolkadotProvider({ children }: { children: React.ReactNode }) {
  const api = client.getTypedApi(paseo_asset_hub);

  return (
    <PolkadotContext.Provider value={{ api }}>
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
