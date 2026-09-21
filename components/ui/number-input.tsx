'use client'

import { useEffect, useState } from 'react'
import { Input } from './input'

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> & {
  value: string | number
  onValueChange: (value: string) => void
  allowDecimal?: boolean
}

function formatDigits(value: string | number, allowDecimal: boolean) {
  const raw = String(value ?? '').replace(/[^\d.,-]/g, '')
  const normalized = allowDecimal ? raw.replace(/(?!^)-/g, '').replace(',', '.') : raw.replace(/\D/g, '')
  const [integer, decimal] = normalized.split('.')
  const formattedInteger = integer ? Number(integer).toLocaleString('en-US') : ''
  return allowDecimal && decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger
}

function parseValue(value: string, allowDecimal: boolean) {
  const normalized = value.replace(/,/g, '').replace(/[^\d.-]/g, '')
  if (allowDecimal) return normalized
  return normalized.replace(/\D/g, '')
}

export function NumberInput({ value, onValueChange, allowDecimal = false, ...props }: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatDigits(value, allowDecimal))

  useEffect(() => {
    setDisplayValue(formatDigits(value, allowDecimal))
  }, [value, allowDecimal])

  return <Input {...props} type="text" inputMode={allowDecimal ? 'decimal' : 'numeric'} value={displayValue} onChange={event => {
    const next = parseValue(event.target.value, allowDecimal)
    setDisplayValue(formatDigits(next, allowDecimal))
    onValueChange(next)
  }} />
}
