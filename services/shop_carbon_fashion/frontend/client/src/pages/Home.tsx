import { useState } from "react";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import ShoppingCartDrawer from "@/components/ShoppingCartDrawer";
import ProductDetailModal from "@/components/ProductDetailModal";
import { products, Product } from "@/lib/products";
import { CartItem } from "@/components/ShoppingCartDrawer";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { toast } = useToast();

  const euroBalance = 1250.00;
  const co2Balance = 5000;

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddToCart = (product: Product, size: string) => {
    const existingItem = cartItems.find(
      (item) => item.id === product.id && item.size === size
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          euroPrice: product.euroPrice,
          co2Price: product.co2Price,
          image: product.image,
          size,
          quantity: 1,
        },
      ]);
    }

    toast({
      title: "Added to cart",
      description: `${product.name} (Size: ${size})`,
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(
        cartItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Checkout functionality would be implemented here with the wallet API",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        euroBalance={euroBalance}
        co2Balance={co2Balance}
        onCartClick={() => setIsCartOpen(true)}
      />
      <ProductGrid products={products} onProductClick={handleProductClick} />
      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
      />
      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
