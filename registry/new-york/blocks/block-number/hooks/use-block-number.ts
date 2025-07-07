"use client";
import { usePolkadot } from "@/registry/new-york/providers/polkadot-provider";
import { useEffect, useState } from "react";

export function useBlockNumber() {
  // Use the type-safe hook with chain parameter - only registered chains allowed!
  const {
    api,
    isLoading: apiLoading,
    error: apiError,
  } = usePolkadot("paseo_asset_hub");
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!api || apiLoading) return;

    // No type assertions needed - TypeScript knows the exact API structure!
    const subscription = api.query.System.Number.watchValue("best").subscribe(
      (value) => {
        setBlockNumber(value);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [api, apiLoading]);

  return {
    blockNumber,
    isLoading: apiLoading,
    error: apiError,
  };
}
