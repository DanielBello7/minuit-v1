/* eslint-disable react-hooks/exhaustive-deps */
import { ensure_error } from "@repo/libs";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { sonner } from "@/components/sonner";

/**
 * Hook for wrapping async actions with built-in loading and error handling.
 * This is a shared implementation used across all apps.
 *
 * @example
 * const { isLoading, run } = useAsyncHandler();
 * await run(async () => { await api.doSomething(); });
 */
export function useAsync(dependencies: unknown[] = []) {
  const [isLoading, setIsLoading] = useState(false);

  const run = useCallback(
    async <T>(
      callback: () => Promise<T | undefined>,
      onFail?: () => void,
    ): Promise<T | undefined> => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        return await callback();
      } catch (error) {
        onFail?.();
        console.log(
          JSON.stringify((error as AxiosError).response?.data, null, 2),
        );
        sonner.error(ensure_error(error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, ...dependencies],
  );

  return {
    isLoading,
    setIsLoading,
    run,
  };
}
