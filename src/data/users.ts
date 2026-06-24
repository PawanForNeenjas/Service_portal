import type { User } from "../types/domain";

export const users: User[] = [
  {
    id: "user-customer",
    odooPartnerId: 5101,
    customerId: "C001",
    name: "9AP Battery",
    role: "CUSTOMER",
    email: "support@9apbattery.example.com",
    phone: "+91 98765 11820",
  },
  {
    id: "user-dealer",
    odooPartnerId: 6101,
    dealerId: "D001",
    name: "Priya Nair",
    role: "DEALER",
    email: "priya.nair@dealer.neenjas.com",
    phone: "+91 98765 43210",
  },
  {
    id: "user-cs",
    odooPartnerId: 6201,
    name: "Rohan Kapoor",
    role: "CUSTOMER_SERVICE",
    email: "rohan.kapoor@support.neenjas.com",
    phone: "+91 98800 77112",
  },
  {
    id: "user-admin",
    odooPartnerId: 6202,
    name: "Meera Iyer",
    role: "ADMIN",
    email: "meera.iyer@neenjas.com",
    phone: "+91 98111 20440",
  },
];
