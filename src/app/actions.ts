
"use server";

import { personalizedProductSuggestions } from "@/ai/flows/personalized-product-suggestions";
import { products as allProducts } from "@/data/products";
import type { Product, Interaction } from "@/lib/types";

function getRandomProducts(products: Product[], count: number) {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}


export async function getSuggestedProducts(
  interactions: Interaction[],
  seenProductIds: number[]
): Promise<Product[]> {
  try {
    let availableProducts = allProducts.filter(
      (p) => !seenProductIds.includes(p.id)
    );

    // If all products have been seen, reset and show all products again.
    if (availableProducts.length === 0) {
      availableProducts = allProducts;
    }
    
    // If there are no interactions, return a random slice of available products
    if (interactions.length === 0) {
       return availableProducts.sort(() => Math.random() - 0.5);
    }

    const userInteractions = interactions
      .map((i) => `${i.type}: ${i.productTitle}`)
      .join("\n");

    const availableProductsString = availableProducts
      .map((p) => `- ${p.title}: ${p.description}`)
      .join("\n");

    const aiResponse = await personalizedProductSuggestions({
      userInteractions: userInteractions || "No interactions yet.",
      availableProducts: availableProductsString,
    });

    const suggestedProductsString = aiResponse.suggestedProducts;
    const suggestedTitles = suggestedProductsString.split("\n").map(s => s.replace(/^- /, '').trim()).filter(Boolean);

    const orderedProducts: Product[] = [];
    const usedProductIds = new Set<number>();

    // Add products in the order suggested by the AI
    suggestedTitles.forEach(suggestedTitle => {
      // Find the best match from available products
      const foundProduct = availableProducts.find(p => 
        !usedProductIds.has(p.id) && 
        (p.title.toLowerCase().includes(suggestedTitle.toLowerCase()) || 
         suggestedTitle.toLowerCase().includes(p.title.toLowerCase()))
      );
      
      if (foundProduct) {
        orderedProducts.push(foundProduct);
        usedProductIds.add(foundProduct.id);
      }
    });

    // Add any remaining available products that the AI didn't mention
    availableProducts.forEach(p => {
      if (!usedProductIds.has(p.id)) {
        orderedProducts.push(p);
      }
    });
    
    if (orderedProducts.length === 0) {
      // Fallback if AI returns no suggestions or suggestions don't match
      return getRandomProducts(availableProducts, 10);
    }

    return orderedProducts;

  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    // Fallback: return available products in random order
    const available = allProducts.filter(p => !seenProductIds.includes(p.id));
    if (available.length > 0) {
      return available.sort(() => Math.random() - 0.5);
    }
    // If everything fails, return a random set from all products.
    return getRandomProducts(allProducts, 10);
  }
}
