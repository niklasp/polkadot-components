"use client";
import { useBlockNumber } from "../hooks/use-block-number";

export function BlockNumber() {
  const { data: blockNumber } = useBlockNumber();

  return <div>{blockNumber}</div>;
}
