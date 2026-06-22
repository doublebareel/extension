import { useEffect, useRef } from "react";

/**
 * 
 * returns a ref that always mirrors the latest value. Lets a listener registered
 * once read the current value via `ref.current`
 */
export default function useLatestRef<T>(value: T)
{
  const ref = useRef(value);

  useEffect(() =>
  {
    ref.current = value;
  }, [value]);

  return ref;
}
