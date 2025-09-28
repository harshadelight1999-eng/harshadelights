import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  errors?: string[]
  touched?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, errors, touched, ...props }, ref) => {
    const hasError = touched && errors && errors.length > 0

    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2",
            hasError && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
        {hasError && (
          <div className="mt-1">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export default Checkbox