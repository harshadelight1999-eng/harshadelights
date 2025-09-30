'use client'

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminArrayInputProps {
  name: string
  label?: string
  children: React.ReactNode
  addLabel?: string
  removeLabel?: string
  disabled?: boolean
  className?: string
  helperText?: string
  maxItems?: number
  minItems?: number
}

export function AdminArrayInput({
  name,
  label,
  children,
  addLabel = 'Add Item',
  removeLabel = 'Remove',
  disabled = false,
  className,
  helperText,
  maxItems,
  minItems = 0,
}: AdminArrayInputProps) {
  const { control } = useFormContext()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  })

  const canAdd = !maxItems || fields.length < maxItems
  const canRemove = fields.length > minItems

  const handleAdd = () => {
    if (canAdd) {
      append({}) // Add empty object - children components will define structure
    }
  }

  const handleRemove = (index: number) => {
    if (canRemove) {
      remove(index)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{label}</h3>
          <Badge variant="secondary">{fields.length} items</Badge>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Item {index + 1}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={disabled}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    disabled={disabled || !canRemove}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Clone children and inject the field index */}
                {React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                      // @ts-ignore
                      name: `${name}.${index}.${child.props.name}`,
                      control,
                    })
                  }
                  return child
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fields.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-sm text-muted-foreground">No items added yet</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={disabled || !canAdd}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{addLabel}</span>
        </Button>

        {helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>

      {maxItems && fields.length >= maxItems && (
        <p className="text-sm text-amber-600">
          Maximum of {maxItems} items allowed
        </p>
      )}
    </div>
  )
}