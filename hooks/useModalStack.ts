import { useState, useCallback } from "react";

export const useModalStack = () => {
  const [stack, setStack] = useState<string[]>([]);

  const push = useCallback((modalId: string) => {
    setStack((prev) => [...prev, modalId]);
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const isActive = useCallback(
    (modalId: string) => {
      return stack[stack.length - 1] === modalId;
    },
    [stack]
  );

  const clear = useCallback(() => {
    setStack([]);
  }, []);

  return {
    stack,
    push,
    pop,
    isActive,
    clear,
    hasModals: stack.length > 0
  };
};
