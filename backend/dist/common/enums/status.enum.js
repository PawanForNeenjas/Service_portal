"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStatus = exports.ReplacementStatus = exports.TicketStatus = void 0;
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    TicketStatus["IN_SERVICE"] = "IN_SERVICE";
    TicketStatus["REPLACEMENT_APPROVED"] = "REPLACEMENT_APPROVED";
    TicketStatus["REPLACEMENT_DISPATCHED"] = "REPLACEMENT_DISPATCHED";
    TicketStatus["RESOLVED"] = "RESOLVED";
    TicketStatus["CLOSED"] = "CLOSED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var ReplacementStatus;
(function (ReplacementStatus) {
    ReplacementStatus["REQUESTED"] = "REQUESTED";
    ReplacementStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ReplacementStatus["APPROVED"] = "APPROVED";
    ReplacementStatus["DISPATCHED"] = "DISPATCHED";
    ReplacementStatus["DELIVERED"] = "DELIVERED";
    ReplacementStatus["COMPLETED"] = "COMPLETED";
})(ReplacementStatus || (exports.ReplacementStatus = ReplacementStatus = {}));
var ReturnStatus;
(function (ReturnStatus) {
    ReturnStatus["REQUESTED"] = "REQUESTED";
    ReturnStatus["PICKUP_SCHEDULED"] = "PICKUP_SCHEDULED";
    ReturnStatus["PICKED_UP"] = "PICKED_UP";
    ReturnStatus["RECEIVED"] = "RECEIVED";
    ReturnStatus["CLOSED"] = "CLOSED";
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
//# sourceMappingURL=status.enum.js.map