"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSegmentsIntersect = doSegmentsIntersect;
exports.isSegmentIntersectingPolygon = isSegmentIntersectingPolygon;
function onSegment(p, q, r) {
    return (q.x <= Math.max(p.x, r.x) &&
        q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) &&
        q.y >= Math.min(p.y, r.y));
}
function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (Math.abs(val) < 1e-9)
        return 0; // collinear
    return val > 0 ? 1 : 2; // 1 = Clockwise, 2 = Counter-Clockwise
}
function doSegmentsIntersect(p1, q1, p2, q2) {
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);
    // General case
    if (o1 !== o2 && o3 !== o4)
        return true;
    // Special Cases
    if (o1 === 0 && onSegment(p1, p2, q1))
        return true;
    if (o2 === 0 && onSegment(p1, q2, q1))
        return true;
    if (o3 === 0 && onSegment(p2, p1, q2))
        return true;
    if (o4 === 0 && onSegment(p2, q1, q2))
        return true;
    return false;
}
function isSegmentIntersectingPolygon(p, q, polygon) {
    const len = polygon.length;
    if (len < 3)
        return false;
    for (let i = 0; i < len; i++) {
        const next = (i + 1) % len;
        if (doSegmentsIntersect(p, q, polygon[i], polygon[next])) {
            return true;
        }
    }
    return false;
}
