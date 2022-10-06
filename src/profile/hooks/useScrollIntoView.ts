import { useCallback, useEffect, useRef } from 'react';

type ElementProp = Element | null;
type ReturnTuple = [(e: unknown) => void, () => void];

export function useScrollIntoView(shouldScroll: boolean): ReturnTuple {
  const containerRef = useRef<ElementProp>(null);

  const refCallback = (element: unknown) => {
    containerRef.current = element as ElementProp;
  };

  const scrollIntoView = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView();
    }
  }, [containerRef]);

  useEffect(() => {
    if (shouldScroll) {
      scrollIntoView();
    }
  }, [shouldScroll, scrollIntoView]);

  return [refCallback, scrollIntoView];
}
