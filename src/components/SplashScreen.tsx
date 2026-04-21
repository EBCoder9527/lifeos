interface SplashScreenProps {
  visible: boolean
  fadeOut: boolean
}

export function SplashScreen({ visible, fadeOut }: SplashScreenProps) {
  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(160deg, #faf8f5 0%, #f0ecff 50%, #fdf0f3 100%)',
      }}
    >
      {/* Logo / brand */}
      <div className="flex flex-col items-center animate-fade-in">
        {/* Breathing ring */}
        <div className="relative w-20 h-20 mb-6">
          <svg viewBox="0 0 80 80" className="w-full h-full animate-[splash-breathe_2.4s_ease-in-out_infinite]">
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="url(#splash-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="160 54"
            />
            <defs>
              <linearGradient id="splash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c6fea" />
                <stop offset="100%" stopColor="#f093a0" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl">
            🌱
          </span>
        </div>

        {/* Product name */}
        <h1
          className="text-2xl font-bold tracking-wide mb-2"
          style={{
            background: 'linear-gradient(135deg, #7c6fea, #f093a0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          LifeOS
        </h1>

        {/* Tagline */}
        <p className="text-sm text-[#8b8a9a] mt-1 tracking-wide">
          别着急，新的今天正在加载
        </p>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1.5 mt-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7c6fea] animate-[splash-bounce_1.2s_ease-in-out_infinite]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-[splash-bounce_1.2s_ease-in-out_0.15s_infinite]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#f093a0] animate-[splash-bounce_1.2s_ease-in-out_0.3s_infinite]" />
        </div>
      </div>
    </div>
  )
}
