import { Role } from "../../common/enums/role.enum";

export type TestAuthUser = {
  id: number;
  login: string;
  name: string;
  email: string;
  partnerId?: number;
  role: Role;
};

export const TEST_AUTH_USERS: Record<string, TestAuthUser> = {
  "user-customer": {
    id: 1001,
    login: "user-customer",
    name: "9AP Battery",
    email: "support@9apbattery.example.com",
    partnerId: 5101,
    role: Role.CUSTOMER,
  },
  "user-dealer": {
    id: 1002,
    login: "user-dealer",
    name: "Priya Nair",
    email: "priya.nair@dealer.neenjas.com",
    partnerId: 6101,
    role: Role.DEALER,
  },
  "user-cs": {
    id: 1003,
    login: "user-cs",
    name: "Rohan Kapoor",
    email: "rohan.kapoor@support.neenjas.com",
    partnerId: 6201,
    role: Role.CUSTOMER_SERVICE,
  },
  "user-admin": {
    id: 1004,
    login: "user-admin",
    name: "Meera Iyer",
    email: "meera.iyer@neenjas.com",
    partnerId: 6202,
    role: Role.ADMIN,
  },
};
