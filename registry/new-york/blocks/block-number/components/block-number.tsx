"use client";

import { useBlockNumber } from "../hooks/use-block-number";

export function BlockNumber() {
  const { blockNumber, isLoading, error } = useBlockNumber();

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <h3 className="text-lg font-semibold text-red-600">Error</h3>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-md bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Current Block</h3>
          <p className="text-sm text-gray-600">
            Latest block number from Paseo Asset Hub
          </p>
        </div>
        <div className="text-right">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-blue-600">
              {blockNumber?.toLocaleString() || "—"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
