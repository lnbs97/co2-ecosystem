import ProductGrid from "../ProductGrid.tsx";
import { products } from "@/lib/products";

export default function ProductGridExample() {
  return (
    <div className="bg-background">
      <ProductGrid
        products={products}
        onProductClick={(product) => console.log("Product clicked:", product.name)}
      />
    </div>
  );
}
