import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: number
}

const Spinner = ({ className, size = 20 }: SpinnerProps) => {
  return (
    <svg
      className={cn("animate-spin", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 0116 0"
        className="opacity-75"
      />
    </svg>
  )
}

export default Spinner