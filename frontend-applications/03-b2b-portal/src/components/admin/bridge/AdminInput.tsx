'use client'

import { useController } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AdminInputProps {
  name: string
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  className?: string
  helperText?: string
  control?: any
}

export function AdminTextInput({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  helperText,
  control,
  ...props
}: AdminInputProps) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label || name} is required` : false }
  })

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-red-500" : ""}>
          {label}
        </Label>
      )}
      <Input
        {...field}
        {...props}
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

export function AdminNumberInput({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  helperText,
  control,
  min,
  max,
  step,
  ...props
}: AdminInputProps & { min?: number; max?: number; step?: number }) {
  const {
    field: { value, onChange, ...field },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: {
      required: required ? `${label || name} is required` : false,
      min: min ? { value: min, message: `Minimum value is ${min}` } : undefined,
      max: max ? { value: max, message: `Maximum value is ${max}` } : undefined
    }
  })

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-red-500" : ""}>
          {label}
        </Label>
      )}
      <Input
        {...field}
        {...props}
        id={name}
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={cn(
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}