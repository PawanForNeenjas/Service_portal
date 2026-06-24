"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerProductMatrix = void 0;
exports.findCustomerProductConfigurationById = findCustomerProductConfigurationById;
const seedRows = [
    { customerName: "9AP Battery", volt: "57", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "9AP Battery", volt: "57.6", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "9AP Battery", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "9AP Battery", volt: "68.4", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "9AP Battery", volt: "68.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "9AP Battery", volt: "72", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "9AP Battery", volt: "73", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Akasa", volt: "57", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Akasa", volt: "57", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Akasa", volt: "58.4", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Akasa", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Akasa", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Akasa", volt: "69.3", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Akasa", volt: "69.35", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Akasa", volt: "69.35", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Akira", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Ampere", volt: "56", amp: "50", rating: "2.2KW (WP)" },
    { customerName: "Ampere", volt: "56", amp: "50", rating: "3.3KW (WP)" },
    { customerName: "Ampere", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Amplift", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Amplift", volt: "73", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "ATC", volt: "54.6", amp: "10", rating: "900W (WP)" },
    { customerName: "ATC", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Battery Smart", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Battery Smart", volt: "58.4", amp: "35", rating: "2.2KW (WP)" },
    { customerName: "Bentrok", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "BHM safari", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "BHM safari", volt: "73", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "Bhumika Transport", volt: "58.4", amp: "25", rating: "1.8KW (NWP)" },
    { customerName: "Bhumika Transport", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Eastman", volt: "58.4", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "58.4", amp: "50", rating: "3.3KW (WP)" },
    { customerName: "Eastman", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "68.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "73", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "73", amp: "25", rating: "1.8KW (NWP)" },
    { customerName: "Eastman", volt: "73", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Eastman", volt: "73", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "73", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "Eastman", volt: "73", amp: "45", rating: "3.3KW (NWP)" },
    { customerName: "Eastman", volt: "73", amp: "45", rating: "3.3KW (WP)" },
    { customerName: "Eastman", volt: "83.95", amp: "38", rating: "3.3KW (WP)" },
    { customerName: "Eastman main branch", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Eastman main branch", volt: "58.4", amp: "50", rating: "3.3KW (WP)" },
    { customerName: "Eastman main branch", volt: "73", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "Eastman main branch", volt: "73", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Eastman main branch", volt: "73", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "Eastman main branch", volt: "73", amp: "45", rating: "3.3KW (WP)" },
    { customerName: "Eastman main branch", volt: "83.95", amp: "38", rating: "3.3KW (NWP)" },
    { customerName: "Eastman main branch", volt: "83.95", amp: "38", rating: "3.3KW (WP)" },
    { customerName: "Electromotion e vidyut", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Electromotion e vidyut", volt: "69.35", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Emo", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Emo", volt: "58.8", amp: "45", rating: "2.2KW (WP)" },
    { customerName: "Emo", volt: "58.8", amp: "45", rating: "3.3KW (WP)" },
    { customerName: "Euler", volt: "50.73", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "Euler", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Euler", volt: "107", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Euler", volt: "107", amp: "40", rating: "3.3KW (WP)" },
    { customerName: "Euler", volt: "108", amp: "40", rating: "3.3KW (WP)" },
    { customerName: "Euler", volt: "170", amp: "40", rating: "3.3KW (WP)" },
    { customerName: "Exide", volt: "58.4", amp: "15", rating: "900W (WP)" },
    { customerName: "Exide", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Exide", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Exide", volt: "60", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "GODAWARI", volt: "42", amp: "3", rating: "150W WP" },
    { customerName: "GODAWARI", volt: "56.5", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "GODAWARI", volt: "58.4", amp: "18", rating: "900W (WP)" },
    { customerName: "GODAWARI", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "GODAWARI", volt: "58.4", amp: "30", rating: "1.8KW (WP)" },
    { customerName: "GODAWARI", volt: "67.2", amp: "8", rating: "900W (WP)" },
    { customerName: "GODAWARI", volt: "69.3", amp: "8", rating: "1.8KW (NWP)" },
    { customerName: "GODAWARI", volt: "69.3", amp: "8", rating: "2.2KW (WP)" },
    { customerName: "GODAWARI", volt: "69.3", amp: "8", rating: "900W (WP)" },
    { customerName: "GODAWARI", volt: "69.35", amp: "8", rating: "900W (WP)" },
    { customerName: "Greenfuel", volt: "56", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Greenfuel", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "GreenFuel Energy", volt: "56", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "GreenFuel Energy", volt: "56", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "GreenFuel Energy", volt: "58.4", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "GreenFuel Energy", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Greenway Mobility, exide battery", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "I Power", volt: "56", amp: "10", rating: "900W (WP)" },
    { customerName: "I Power", volt: "58.4", amp: "15", rating: "900W (WP)" },
    { customerName: "I Power", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "I Power", volt: "58.4", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "I Power", volt: "58.4", amp: "40", rating: "3.3KW (NWP)" },
    { customerName: "I Power", volt: "69.35", amp: "40", rating: "3.3KW (NWP)" },
    { customerName: "I Power", volt: "69.35", amp: "40", rating: "3.3KW (WP)" },
    { customerName: "IKKIS", volt: "56", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "IKKIS", volt: "57", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Intevlo", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Inverted", volt: "56", amp: "10", rating: "900W (WP)" },
    { customerName: "Inverted", volt: "56", amp: "15", rating: "900W (WP)" },
    { customerName: "Inverted", volt: "56", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Inverted", volt: "56", amp: "50", rating: "3.3KW (NWP)" },
    { customerName: "Inverted", volt: "57.6", amp: "22", rating: "1.8KW (NWP)" },
    { customerName: "Inverted", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Inverted", volt: "59", amp: "15", rating: "900W (WP)" },
    { customerName: "Inverted", volt: "66.5", amp: "25", rating: "1.8KW (NWP)" },
    { customerName: "Inverted", volt: "66.5", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Inverted", volt: "80.5", amp: "10", rating: "900W (WP)" },
    { customerName: "Joy Auto", volt: "54.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Joy Auto", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Kinetic Green", volt: "56", amp: "10", rating: "2.2KW (WP)" },
    { customerName: "Kinetic Green", volt: "56", amp: "10", rating: "900W (WP)" },
    { customerName: "Kinetic Green", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Kinetic Green", volt: "58.4", amp: "45", rating: "3.3KW (WP)" },
    { customerName: "Kinetic Green", volt: "58.5", amp: "10", rating: "900W (WP)" },
    { customerName: "Kinetic Green", volt: "58.8", amp: "45", rating: "2.2KW (WP)" },
    { customerName: "Kinetic Green", volt: "58.8", amp: "45", rating: "3.3KW (WP)" },
    { customerName: "Kinetic Green", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Kinetic Green", volt: "66.4", amp: "10", rating: "2.2KW (WP)" },
    { customerName: "Kinetic Green", volt: "66.4", amp: "10", rating: "900W (WP)" },
    { customerName: "Kinetic Green", volt: "83", amp: "10", rating: "900W (WP)" },
    { customerName: "Konwert India", volt: "58.4", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Konwert India", volt: "84", amp: "27", rating: "2.2KW (WP)" },
    { customerName: "Meshi Battery", volt: "69.3", amp: "8", rating: "900W (WP)" },
    { customerName: "Meshi Battery", volt: "100.8", amp: "20", rating: "1.8KW (NWP)" },
    { customerName: "Revolt", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Revolt", volt: "83.5", amp: "10", rating: "900W (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "8", rating: "900W (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "15", rating: "900W (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "18", rating: "2.2KW (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "18", rating: "900W (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "20", rating: "900W (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "30", rating: "1.8KW (NWP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "35", rating: "1.8KW (NWP)" },
    { customerName: "Rolfe", volt: "58.4", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Rolfe", volt: "69.35", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "Rolfe", volt: "69.35", amp: "20", rating: "900W (WP)" },
    { customerName: "Rolfe", volt: "69.35", amp: "25", rating: "1.8KW (NWP)" },
    { customerName: "Rolfe", volt: "69.35", amp: "45", rating: "3.3KW (NWP)" },
    { customerName: "Rolfe", volt: "73", amp: "20", rating: "1.8KW (WP)" },
    { customerName: "Rolfe", volt: "73", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "Rolfe", volt: "73", amp: "25", rating: "1.8KW (NWP)" },
    { customerName: "Rolfe", volt: "73", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "Rolfe", volt: "73", amp: "45", rating: "3.3KW (NWP)" },
    { customerName: "Rolfe", volt: "87.6", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Ruchira Green Earth", volt: "58.4", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "Saera Electric", volt: "56", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Saera Electric", volt: "58.4", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Saera Electric", volt: "66.5", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Saera Electric", volt: "66.5", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Saera Electric", volt: "69.3", amp: "8", rating: "900W (WP)" },
    { customerName: "Saera Electric", volt: "69.35", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Safeli", volt: "56.5", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Safeli", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Safeli", volt: "73", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Stefen Electric", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Stefen Electric", volt: "65.35", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "Terra Nova", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Terra Nova", volt: "58.4", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "TI Clean Mobility", volt: "56", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "TI Clean Mobility", volt: "58.4", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "TI Clean Mobility", volt: "58.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "TI Clean Mobility", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Trontek", volt: "58.4", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Trontek", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Trontek", volt: "58.4", amp: "26", rating: "1.8KW (WP)" },
    { customerName: "Trontek", volt: "58.4", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Trontek", volt: "73", amp: "20", rating: "1.8KW (WP)" },
    { customerName: "Trontek", volt: "73", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "56", amp: "15", rating: "900W (WP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "57.6", amp: "22", rating: "2.2KW (WP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "58", amp: "15", rating: "900W (WP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "58.4", amp: "15", rating: "900W (WP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "58.4", amp: "20", rating: "2.2KW (WP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "59", amp: "15", rating: "900W (WP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "59", amp: "22", rating: "1.8KW (NWP)" },
    { customerName: "UPGRID SOLUTIONS", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Veelo Mobility", volt: "58.4", amp: "15", rating: "900W (WP)" },
    { customerName: "Veelo Mobility", volt: "73", amp: "30", rating: "2.2KW (WP)" },
    { customerName: "X Battery", volt: "54.7", amp: "50", rating: "3.3KW (WP)" },
    { customerName: "X Battery", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
    { customerName: "Yatri", volt: "55.5", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Yatri", volt: "69.35", amp: "40", rating: "3.3KW (WP)" },
    { customerName: "Zen Mobility", volt: "58.4", amp: "25", rating: "1.8KW (WP)" },
    { customerName: "Zen Mobility", volt: "58.4", amp: "25", rating: "2.2KW (WP)" },
    { customerName: "Zen Mobility", volt: "59.5", amp: "40", rating: "2.2KW (WP)" },
];
exports.customerProductMatrix = seedRows.map((row) => {
    const id = buildConfigurationId(row);
    const displayName = `${row.volt} / ${row.amp} / ${row.rating}`;
    return {
        id,
        customerName: row.customerName,
        volt: row.volt,
        amp: row.amp,
        rating: row.rating,
        displayName,
        brandCode: buildBrandCode(row.customerName),
        modelCode: buildModelCode(row.volt, row.amp, row.rating),
        productType: "Configured Product",
        internalReference: buildInternalReference(row),
    };
});
function findCustomerProductConfigurationById(id) {
    return exports.customerProductMatrix.find((configuration) => configuration.id === id);
}
function buildConfigurationId(row) {
    return `cfg-${slugify(row.customerName)}-${slugify(row.volt)}-${slugify(row.amp)}-${slugify(row.rating)}`;
}
function buildBrandCode(customerName) {
    const initials = customerName
        .split(/[^A-Za-z0-9]+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => part[0])
        .join("");
    return sanitize(initials || customerName, "CFG", 3);
}
function buildModelCode(volt, amp, rating) {
    const numeric = `${volt}${amp}${rating}`.replace(/\D/g, "");
    if (numeric) {
        return numeric.slice(0, 6);
    }
    return sanitize(`${volt}${amp}${rating}`, "000", 6);
}
function buildInternalReference(row) {
    return `${buildBrandCode(row.customerName)}-${buildModelCode(row.volt, row.amp, row.rating)}`;
}
function sanitize(value, fallback, maxLength) {
    const normalized = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!normalized) {
        return fallback;
    }
    return normalized.slice(0, maxLength);
}
function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
//# sourceMappingURL=customer-product-matrix.data.js.map