"use client";
import { usePolkadot } from "@/registry/new-york/providers/polkadot-provider";
import { useEffect, useState } from "react";

export function useBlockNumber() {
  const { api } = usePolkadot();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    const subscription = api?.query.System.Number.watchValue("best").subscribe(
      (value) => {
        setBlockNumber(value);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [api]);

  return blockNumber;
}
