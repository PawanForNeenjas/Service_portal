"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_AUTH_USERS = void 0;
const role_enum_1 = require("../../common/enums/role.enum");
exports.TEST_AUTH_USERS = {
    "user-customer": {
        id: 1001,
        login: "user-customer",
        name: "9AP Battery",
        email: "support@9apbattery.example.com",
        partnerId: 5101,
        role: role_enum_1.Role.CUSTOMER,
    },
    "user-dealer": {
        id: 1002,
        login: "user-dealer",
        name: "Priya Nair",
        email: "priya.nair@dealer.neenjas.com",
        partnerId: 6101,
        role: role_enum_1.Role.DEALER,
    },
    "user-cs": {
        id: 1003,
        login: "user-cs",
        name: "Rohan Kapoor",
        email: "rohan.kapoor@support.neenjas.com",
        partnerId: 6201,
        role: role_enum_1.Role.CUSTOMER_SERVICE,
    },
    "user-admin": {
        id: 1004,
        login: "user-admin",
        name: "Meera Iyer",
        email: "meera.iyer@neenjas.com",
        partnerId: 6202,
        role: role_enum_1.Role.ADMIN,
    },
};
//# sourceMappingURL=test-users.js.map