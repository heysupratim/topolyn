import { InventoryTable } from "./InventoryTable";

export function InventoryView() {
  return (
    <div
      id="nodelist"
      className="flex h-full flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:gap-2 lg:px-6"
    >
      <InventoryTable />
    </div>
  );
}
