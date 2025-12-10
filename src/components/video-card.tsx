"use client";

import type { Product } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Heart, Share2, VolumeX, Volume2, Sun, Moon, Play, Pause } from "lucide-react";

type VideoCardProps = {
  product: Product;
  isMuted: boolean;
  theme: "light" | "dark";
  onInteraction: (type: "like" | "share" | "click", product: Product) => void;
  onToggleTheme: () => void;
  onToggleMute: () => void;
  shouldPlay: boolean;
};

export function VideoCard({
  product,
  isMuted,
  theme,
  onInteraction,
  onToggleTheme,
  onToggleMute,
  shouldPlay,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay && video.paused) {
      video.play().catch(() => {});
    } else if (!shouldPlay && !video.paused) {
      video.pause();
    }
  }, [shouldPlay]);


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    setIsPlaying(!video.paused);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (newLikedState) {
      onInteraction("like", product);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      handleLike();
    }
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteraction("share", product);
    const shareData = {
      title: product.title,
      text: `Check out this product: ${product.title}`,
      url: product.link,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
         await navigator.clipboard.writeText(product.link);
        toast({
          title: "Link Copied!",
          description: "Product link copied to clipboard.",
        });
      }
    } catch (error) {
      console.error("Share failed:", error);
       try {
        await navigator.clipboard.writeText(product.link);
        toast({
          title: "Link Copied!",
          description: "Product link copied to clipboard.",
        });
       } catch (copyError) {
         toast({
          variant: "destructive",
          title: "Share Unavailable",
          description: "Could not share or copy the link at this moment.",
        });
       }
    }
  };

  return (
    <div
      className="video-card relative h-screen w-full bg-background text-foreground"
      data-product-id={product.id}
      onDoubleClick={handleDoubleClick}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={product.video}
        loop
        playsInline
        className="w-full h-full object-cover"
      ></video>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="w-24 h-24 text-white/50" fill="currentColor" />
        </div>
      )}

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-heartBeat" />
        </div>
      )}

      <div className="absolute top-8 left-4 max-w-[80%] pointer-events-none">
        <h2 className="text-lg font-semibold text-white bg-black/40 p-2 rounded-lg backdrop-blur-sm shadow-lg">
          {product.title}
        </h2>
      </div>

      <div className="absolute right-3 bottom-1/4 md:bottom-36 flex flex-col items-center gap-5 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Like"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-2xl backdrop-blur-sm">
            <Heart
              className={cn(
                "w-8 h-8 transition-all duration-300 drop-shadow-lg text-white",
                isLiked && "text-red-500 fill-red-500"
              )}
            />
          </div>
          <span className="text-sm font-semibold drop-shadow-md">Like</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className="flex flex-col items-center gap-1 text-white" aria-label="Toggle Mute">
          <div className="w-12 h-12 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-2xl backdrop-blur-sm">
            {isMuted 
              ? <VolumeX className="w-8 h-8 drop-shadow-lg text-white" /> 
              : <Volume2 className="w-8 h-8 drop-shadow-lg text-white" />}
          </div>
          <span className="text-sm font-semibold drop-shadow-md">{isMuted ? 'Muted' : 'Sound'}</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white" aria-label="Share">
           <div className="w-12 h-12 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-2xl backdrop-blur-sm">
            <Share2 className="w-8 h-8 drop-shadow-lg text-white" />
          </div>
          <span className="text-sm font-semibold drop-shadow-md">Share</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onToggleTheme(); }} className="flex flex-col items-center gap-1 text-white" aria-label="Toggle Theme">
           <div className="w-12 h-12 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-2xl backdrop-blur-sm">
            {theme === "light" 
              ? <Moon className="w-8 h-8 drop-shadow-lg text-white" /> 
              : <Sun className="w-8 h-8 drop-shadow-lg text-white" />}
           </div>
           <span className="text-sm font-semibold drop-shadow-md">Theme</span>
        </button>
      </div>
      
      <Link
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => { e.stopPropagation(); onInteraction("click", product); }}
        className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-10"
      >
        <div className="group flex items-center gap-4 bg-card/80 backdrop-blur-md p-3 rounded-xl shadow-2xl transition-transform hover:scale-105 border border-white/20">
          <div className="relative w-16 h-16 flex-shrink-0">
             <Image
                src={product.productImage}
                alt={product.description}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-md object-cover"
              />
          </div>
          <div className="flex-grow overflow-hidden text-card-foreground">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{product.description}</p>
            <p className="text-lg font-bold text-green-500">{product.price}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
