"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATIC_CONNECTIONS = void 0;
// Predefined flight corridors (road connections) in the delivery network
exports.STATIC_CONNECTIONS = [
    // WH-A (Civic Center) connections
    { from: 'WH-A', to: 'C-01' },
    { from: 'WH-A', to: 'C-02' },
    { from: 'WH-A', to: 'C-03' },
    { from: 'WH-A', to: 'C-06' },
    // WH-B (Fisherman's Wharf) connections
    { from: 'WH-B', to: 'C-01' },
    { from: 'WH-B', to: 'C-03' },
    { from: 'WH-B', to: 'C-04' },
    // Destination connections to form a fully searchable network
    { from: 'C-01', to: 'C-02' },
    { from: 'C-01', to: 'C-03' },
    { from: 'C-02', to: 'C-05' },
    { from: 'C-02', to: 'C-06' },
    { from: 'C-03', to: 'C-04' },
    { from: 'C-04', to: 'C-05' },
    { from: 'C-05', to: 'C-06' },
];
