import { cn } from "@/lib/utils"

interface DividerProps {
  className?: string
}

const Divider = ({ className }: DividerProps) => {
  return (
    <hr className={cn("border-gray-200", className)} />
  )
}

export default Divider