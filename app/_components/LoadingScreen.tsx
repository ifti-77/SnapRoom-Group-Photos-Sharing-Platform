interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = "cooking assets...",
  subtext = "hang tight, don't close the tab",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-[2px] p-4"
          : "w-full py-16 flex items-center justify-center"
      } text-neutral-900 select-none`}
    >
      <div className="w-full max-w-xs border-2 border-neutral-900 bg-white p-6 flex flex-col items-center text-center">
        {/* Brutalist square bouncing dots */}
        <div className="flex items-center gap-1.5 mb-5">
          <span className="w-2.5 h-2.5 bg-neutral-900 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 bg-neutral-900 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 bg-neutral-900 animate-bounce" />
        </div>

        {/* Monospace Status Tag */}
        <span className="text-[10px] font-mono uppercase tracking-widest bg-neutral-100 border border-neutral-300 px-2 py-0.5 mb-3 text-neutral-600">
          syncing // buffer
        </span>

        {/* Main message */}
        <p className="font-mono text-sm font-bold uppercase tracking-tight">
          {message}
        </p>

        {/* Subtext note */}
        {subtext && (
          <p className="text-xs text-neutral-500 font-mono mt-1.5">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}