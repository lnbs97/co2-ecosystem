import Header from "../Header.tsx";

export default function HeaderExample() {
  return (
    <div className="bg-background">
      <Header
        cartItemCount={3}
        euroBalance={1250.00}
        co2Balance={5000}
        onCartClick={() => console.log("Cart clicked")}
      />
    </div>
  );
}
