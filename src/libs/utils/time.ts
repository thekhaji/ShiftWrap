const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

// Returns a Date whose UTC components equal the current Seoul wall-clock time.
// Used only when WRITING checkIn/checkOut, so the DB stores Seoul time directly
// (not a true UTC instant). Every read site must use UTC-based getters/options
// to avoid double-applying the offset.
export function nowInSeoul(): Date {
    return new Date(Date.now() + SEOUL_OFFSET_MS);
}
