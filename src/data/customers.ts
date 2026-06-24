import type { Customer } from "../types/domain";

export const customers: Customer[] = [
  {
    id: "C001",
    odooPartnerId: 5101,
    name: "9AP Battery",
    phone: "+91 98765 11820",
    email: "support@9apbattery.example.com",
    address: "42 Residency Road, Bengaluru, Karnataka 560025",
  },
  {
    id: "C002",
    odooPartnerId: 5102,
    name: "ATC",
    phone: "+91 98450 22991",
    email: "support@atc.example.com",
    address: "18 Park Street, Ahmedabad, Gujarat 380009",
  },
  {
    id: "C003",
    odooPartnerId: 5103,
    name: "Akasa",
    phone: "+91 90080 44210",
    email: "support@akasa.example.com",
    address: "9 Lake View Road, Chennai, Tamil Nadu 600042",
  },
];
