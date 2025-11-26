import { Card } from "./ui/card.tsx";
import DualPrice from "./DualPrice.tsx";
import { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden hover-elevate active-elevate-2 transition-transform duration-200"
      onClick={onClick}
      data-testid={`card-product-${product.id}`}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {product.brand}
        </div>
        <h3 className="text-base font-medium text-foreground line-clamp-2">
          {product.name}
        </h3>
        <DualPrice euroPrice={product.euroPrice} co2Price={product.co2Price} size="sm" />
      </div>
    </Card>
  );
}
