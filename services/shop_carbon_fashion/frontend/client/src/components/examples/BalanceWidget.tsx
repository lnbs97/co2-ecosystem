import BalanceWidget from "../BalanceWidget.tsx";

export default function BalanceWidgetExample() {
  return (
    <div className="p-8 bg-background">
      <BalanceWidget euroBalance={1250.00} co2Balance={5000} />
    </div>
  );
}
