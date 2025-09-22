'use client'

import { useController } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface AdminSelectProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  helperText?: string
  control?: any
  options: SelectOption[]
  multiple?: boolean
}

export function AdminSelectInput({
  name,
  label,
  placeholder = 'Select an option...',
  required = false,
  disabled = false,
  className,
  helperText,
  control,
  options,
  ...props
}: AdminSelectProps) {
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
      <Select
        value={field.value || ''}
        onValueChange={field.onChange}
        disabled={disabled}
        {...props}
      >
        <SelectTrigger
          className={cn(
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value.toString()}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}