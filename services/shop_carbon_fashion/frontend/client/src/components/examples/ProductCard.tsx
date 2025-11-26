import ProductCard from "../ProductCard.tsx";
import { products } from "@/lib/products";

export default function ProductCardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="max-w-xs">
        <ProductCard
          product={products[0]}
          onClick={() => console.log("Product clicked")}
        />
      </div>
    </div>
  );
}
