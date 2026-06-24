import type { Warranty } from "../types/domain";

export const warranties: Warranty[] = [
  {
    id: "W001",
    productId: "P001",
    customerId: "C001",
    purchaseDate: "2025-09-18",
    expiryDate: "2027-09-17",
    status: "ACTIVE",
  },
  {
    id: "W002",
    productId: "P002",
    customerId: "C002",
    purchaseDate: "2024-07-12",
    expiryDate: "2026-07-11",
    status: "EXPIRING_SOON",
  },
];
