import ProductDetailModal from "../ProductDetailModal.tsx";
import { products } from "@/lib/products";
import { useState } from "react";
import { Button } from "../ui/button.tsx";

export default function ProductDetailModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setIsOpen(true)}>Open Product Detail</Button>
      <ProductDetailModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={products[0]}
        onAddToCart={(product, size) =>
          console.log(`Added ${product.name} in size ${size} to cart`)
        }
      />
    </div>
  );
}
