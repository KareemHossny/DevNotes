import { useCallback, useEffect, useRef, useState } from "react";
import { getPosts } from "../services/postService";

const usePostSuggestions = (query, options = {}) => {
  const { minChars = 2, delay = 300, limit = 5 } = options;
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  useEffect(() => {
    const term = query.trim();

    if (term.length < minChars) {
      setIsLoading(false);
      setSuggestions([]);
      return;
    }

    const currentId = ++requestIdRef.current;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await getPosts(
          { search: term, limit },
          { signal: controller.signal }
        );
        if (requestIdRef.current !== currentId) return;
        setSuggestions(Array.isArray(data) ? data.slice(0, limit) : []);
      } catch (err) {
        const canceled = err?.code === "ERR_CANCELED" || err?.name === "CanceledError";
        if (canceled || requestIdRef.current !== currentId) return;
        setSuggestions([]);
      } finally {
        if (requestIdRef.current === currentId) {
          setIsLoading(false);
        }
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, minChars, delay, limit]);

  return {
    suggestions,
    isLoading,
    clearSuggestions,
  };
};

export default usePostSuggestions;
