import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : initialValue
  })

  const updateValue = (nextValue: T) => {
    setValue(nextValue)
    localStorage.setItem(key, JSON.stringify(nextValue))
  }

  return [value, updateValue] as const
}
