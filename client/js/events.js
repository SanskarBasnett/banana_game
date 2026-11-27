// Central registry of all custom event names.
// Using named constants instead of raw strings means a typo in any emitter
// or listener fails at the reference, not silently at runtime.

export const AppEvents = {
    // Emitted after a player's score or profile changes.
    // Any module displaying player data listens for this to refresh itself
    // without needing a direct import of the module that caused the change.
    PLAYER_UPDATED: "player:updated",

    // Emitted when a new puzzle round starts
    PUZZLE_STARTED: "puzzle:started",

    // Emitted when a round ends (answered or timed out).
    // detail.reason is "answered" or "timeout"
    PUZZLE_ENDED: "puzzle:ended",

    // Emitted after the user saves profile changes
    PROFILE_SAVED: "profile:saved"
};

// Dispatch a CustomEvent on the window so any module can listen with
// window.addEventListener(AppEvents.X, handler) without importing the emitter
export function emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
}
