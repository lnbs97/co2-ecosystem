import DualPrice from "../DualPrice.tsx";

export default function DualPriceExample() {
  return (
    <div className="p-8 space-y-6 bg-background">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Small</p>
        <DualPrice euroPrice={29.99} co2Price={45} size="sm" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Medium (default)</p>
        <DualPrice euroPrice={89.99} co2Price={180} size="md" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Large</p>
        <DualPrice euroPrice={189.99} co2Price={420} size="lg" />
      </div>
    </div>
  );
}
