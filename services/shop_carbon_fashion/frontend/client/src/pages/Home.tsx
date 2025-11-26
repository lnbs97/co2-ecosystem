import { useState } from "react";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import ShoppingCartDrawer from "@/components/ShoppingCartDrawer";
import ProductDetailModal from "@/components/ProductDetailModal";
import { products, Product } from "@/lib/products";
import { CartItem } from "@/components/ShoppingCartDrawer";
import { useToast } from "@/hooks/use-toast";
import { useCombinedTransfer, MERCHANT_ID } from "@/lib/api";

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { toast } = useToast();
  const { mutate: checkout, isPending: isCheckingOut } = useCombinedTransfer();

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
    const totalEuro = cartItems.reduce((sum, item) => sum + item.euroPrice * item.quantity, 0);
    const totalCo2 = cartItems.reduce((sum, item) => sum + item.co2Price * item.quantity, 0);

    if (totalEuro <= 0) return;

    checkout({
      toUserId: MERCHANT_ID,
      moneyAmount: totalEuro,
      co2Amount: totalCo2,
      description: `Checkout ${cartItems.length} items from EcoFashion`
    }, {
      onSuccess: () => {
        setCartItems([]);
        setIsCartOpen(false);
        toast({
          title: "Checkout Successful",
          description: `Paid €${totalEuro.toFixed(2)} and ${totalCo2} CO2 tokens.`,
        });
      },
      onError: (error) => {
        // Hier wird nun die spezifische Fehlermeldung des Servers angezeigt
        toast({
          title: "Transaction Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
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

      {isCheckingOut && (
        <div className="fixed inset-0 bg-black/20 z-[60] flex items-center justify-center pointer-events-auto">
          <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="font-medium">Processing Transaction...</p>
          </div>
        </div>
      )}

      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}