import GiftFeed from "@/components/gift-feed";
import { products } from "@/data/products";

export default function Home() {
  const coverVideo = "https://gift.reviews/Gift-Shop/videos/best_gift2025.mp4";
  
  return (
    <main>
      <GiftFeed initialProducts={products} coverVideoUrl={coverVideo} />
    </main>
  );
}
