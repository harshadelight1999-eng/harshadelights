import { cn } from "@/lib/utils"

interface SkeletonCardDetailsProps {
  className?: string
}

const SkeletonCardDetails = ({ className }: SkeletonCardDetailsProps) => {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  )
}

export default SkeletonCardDetails