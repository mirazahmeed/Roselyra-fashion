"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center p-8">
        <h2 className="text-2xl font-display uppercase tracking-wider mb-4">
          Something went wrong
        </h2>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-noir text-cream text-sm uppercase tracking-widest hover:bg-noir/80 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
