"use client";
import { useQuery } from "@tanstack/react-query";

export function useBlockNumber() {
  const blockNumber = useQuery({
    queryKey: ["blockNumber"],
    queryFn: getBlockNumber,
  });

  return blockNumber;
}

export async function getBlockNumber() {
  return 1234567890;
}
