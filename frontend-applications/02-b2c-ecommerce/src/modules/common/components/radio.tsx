import { cn } from "@/lib/utils"

interface RadioProps {
  checked?: boolean
  className?: string
  "data-testid"?: string
}

const Radio = ({ checked = false, className, ...props }: RadioProps) => {
  return (
    <div 
      className={cn(
        "h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center",
        checked && "border-orange-600",
        className
      )}
      {...props}
    >
      {checked && (
        <div className="h-2 w-2 rounded-full bg-orange-600" />
      )}
    </div>
  )
}

export default Radio