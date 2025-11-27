import type { ITrailerModalProps } from "@/types/movie"

const TrailerModal = ({ show, trailerId, onClose }: ITrailerModalProps) => {

  if (!show) return null
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl aspect-video" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 cursor-pointer text-white hover:text-yellow-300 text-lg font-bold transition flex items-center gap-2"
        >
          <span className="text-xl">✕</span>
        </button>
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
          title="Movie Trailer"
          allow="autoplay"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export default TrailerModal
