import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.tsx";
import { Button } from "./ui/button.tsx";
import DualPrice from "./DualPrice.tsx";
import { Product } from "@/lib/products";
import { useState } from "react";
import { Check } from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, size: string) => void;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    if (selectedSize && product) {
      onAddToCart(product, selectedSize);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-product-detail">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {product.brand}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                {product.name}
              </h2>
            </div>

            <DualPrice
              euroPrice={product.euroPrice}
              co2Price={product.co2Price}
              size="lg"
            />

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="min-w-[3rem]"
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedSize || added}
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Added to Cart
                </>
              ) : (
                "Add to Cart"
              )}
            </Button>

            <div className="pt-6 border-t space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Product Details</h3>
                <p className="text-sm text-muted-foreground">
                  High-quality {product.category.toLowerCase()} designed for comfort and style.
                  Made with sustainable materials to reduce environmental impact.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">CO₂ Impact</h3>
                <p className="text-sm text-muted-foreground">
                  This product has a carbon footprint of {product.co2Price} CO₂ tokens.
                  We're committed to transparency in our environmental impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
