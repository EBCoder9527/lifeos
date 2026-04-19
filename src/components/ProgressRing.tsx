interface ProgressRingProps {
  size: number
  strokeWidth: number
  progress: number
  color: string
  children?: React.ReactNode
}

export function ProgressRing({ size, strokeWidth, progress, color, children }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(progress, 1) * circumference)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            '--ring-circumference': circumference,
            '--ring-offset': offset,
            animation: 'ring-fill 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
          } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
