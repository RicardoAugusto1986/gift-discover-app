"use client";

import type { Product, Interaction } from "@/lib/types";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from "react";
import { VideoCard } from "@/components/video-card";
import { getSuggestedProducts } from "@/app/actions";
import { ChevronDown, VolumeX, Moon, Sun, Volume2 } from "lucide-react";

type GiftFeedProps = {
  initialProducts: Product[];
  coverVideoUrl: string;
};

export default function GiftFeed({
  initialProducts,
  coverVideoUrl,
}: GiftFeedProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMuted, setIsMuted] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, startTransition] = useTransition();

  const [showCover, setShowCover] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1); // Start with cover

  const containerRef = useRef<HTMLDivElement>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const indexStr = entry.target.getAttribute("data-index");
            if (indexStr !== null) {
              const index = parseInt(indexStr, 10);
              setActiveIndex(index);
              if (index === -1 && isMuted) {
                setShowAudioPrompt(true);
              }
            }
          }
        }
      },
      { threshold: 0.6 }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((item) => observer.observe(item));

    return () => items.forEach((item) => observer.unobserve(item));
  }, [products, showCover, isMuted]);

  const fetchNewProducts = useCallback(() => {
    if (interactions.length < 3) return;

    startTransition(async () => {
      const seenProductIds = products.map((p) => p.id);
      const newProducts = await getSuggestedProducts(interactions, seenProductIds);
      if (newProducts.length > 0) {
        setProducts((currentProducts) => [...currentProducts, ...newProducts]);
      }
      setInteractions([]);
    });
  }, [interactions, products]);

  const handleInteraction = useCallback(
    (type: "like" | "share" | "click", product: Product) => {
      const newInteraction: Interaction = {
        type,
        productId: product.id,
        productTitle: product.title,
      };
      setInteractions((prev) => [...prev, newInteraction]);

      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
      interactionTimerRef.current = setTimeout(() => {
        fetchNewProducts();
      }, 5000);
    },
    [fetchNewProducts]
  );

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (showCover && container.scrollTop > 10) {
      setShowCover(false);
      setShowScrollIndicator(false);
    }
    
    // Infinite scroll logic
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtEnd = scrollTop + clientHeight >= scrollHeight - 5;
    
    if (!isLoading && isAtEnd && products.length > 0) {
        const firstVideoElement = container.querySelector('[data-index="0"]');
        if(firstVideoElement) {
            firstVideoElement.scrollIntoView({ behavior: 'instant' });
        }
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (showAudioPrompt) setShowAudioPrompt(false);
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
      onScroll={handleScroll}
    >
      {showCover && (
        <div data-index="-1" className="relative h-screen w-full snap-start flex items-center justify-center">
          <video
            src={coverVideoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold drop-shadow-lg">Gift Discover</h1>
            <p className="mt-4 text-xl drop-shadow-md">Scroll to find your next favorite gift</p>
          </div>
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      )}

      {products.map((product, index) => (
        <div key={`${product.id}-${index}`} data-index={index} className="snap-start h-screen">
          <VideoCard
            product={product}
            isMuted={isMuted}
            theme={theme}
            onInteraction={handleInteraction}
            onToggleTheme={toggleTheme}
            onToggleMute={toggleMute}
            shouldPlay={index === activeIndex}
          />
        </div>
      ))}

      {isLoading && (
        <div className="h-screen w-full snap-start flex items-center justify-center text-foreground">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p>Finding new gifts for you...</p>
          </div>
        </div>
      )}

      {showScrollIndicator && showCover && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 text-white animate-bounce opacity-70">
          <ChevronDown className="h-10 w-10" />
        </div>
      )}

      {showAudioPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={toggleMute}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative flex flex-col items-center justify-center z-10 text-white animate-pulse">
            <div className="flex items-center justify-center w-28 h-28 bg-black/50 rounded-full border-2 border-white/50 cursor-pointer">
              <VolumeX className="w-12 h-12" />
            </div>
            <p className="mt-4 text-lg font-medium bg-black/50 px-4 py-2 rounded-lg">Tap to unmute</p>
          </div>
        </div>
      )}
    </div>
  );
}
