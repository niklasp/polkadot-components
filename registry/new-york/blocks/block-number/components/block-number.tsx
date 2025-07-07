"use client";
import { useBlockNumber } from "../hooks/use-block-number";

export function BlockNumber() {
  const blockNumber = useBlockNumber();

  return <div>{blockNumber?.toString()}</div>;
}
