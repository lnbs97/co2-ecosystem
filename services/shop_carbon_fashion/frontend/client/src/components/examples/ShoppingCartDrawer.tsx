import ShoppingCartDrawer from "../ShoppingCartDrawer.tsx";
import { products } from "@/lib/products";
import { useState } from "react";
import { Button } from "../ui/button.tsx";

export default function ShoppingCartDrawerExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([
    {
      ...products[0],
      size: "M",
      quantity: 2,
    },
    {
      ...products[1],
      size: "32",
      quantity: 1,
    },
  ]);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)));
    }
  };

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setIsOpen(true)}>Open Cart</Button>
      <ShoppingCartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => console.log("Checkout clicked")}
      />
    </div>
  );
}
