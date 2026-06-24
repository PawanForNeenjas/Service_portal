import type { ReturnShipment } from "../types/domain";

export const returns: ReturnShipment[] = [
  {
    id: "RS001",
    odooStockPickingId: 10201,
    replacementId: "R001",
    courier: "Blue Dart",
    trackingNumber: "BD-7788120091",
    status: "Pending Pickup",
  },
];
