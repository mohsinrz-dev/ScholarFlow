import { useState, useEffect, useRef, useCallback } from 'react'

export function useApi(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const execute = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const result = await fetcherRef.current({ signal: abortRef.current.signal })
      setData(result)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    execute()
    return () => abortRef.current?.abort()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
