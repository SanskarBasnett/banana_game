// Isolated module for all communication with the external Banana API.
// Keeping it here means no route or controller knows the URL or calls fetch
// directly — if the provider changes, only this file needs updating.

const BANANA_API_URL = "https://marcconrad.com/uob/banana/api.php";
const MAX_RETRIES    = 2;
const RETRY_DELAY_MS = 500;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getPuzzle(attempt = 1) {
    try {
        // AbortSignal.timeout cancels the request after 5 s — without this,
        // a slow external API would hang the player's request indefinitely
        const response = await fetch(`${BANANA_API_URL}?out=json&base64=no`, {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`Banana API responded with status ${response.status}.`);
        }

        const puzzle = await response.json();

        // Validate before trusting — the external API shape is not under our control
        if (typeof puzzle.question !== "string" || puzzle.question.trim() === "") {
            throw new Error("Invalid puzzle response: missing image URL.");
        }

        const solution = Number(puzzle.solution);

        // Banana puzzle answers are always a single digit 0–9
        if (!Number.isInteger(solution) || solution < 0 || solution > 9) {
            throw new Error(`Invalid puzzle response: unexpected solution "${puzzle.solution}".`);
        }

        return { imageUrl: puzzle.question, solution };

    } catch (error) {
        // Retry on transient failures before surfacing an error to the player
        if (attempt <= MAX_RETRIES) {
            console.warn(`Banana API attempt ${attempt} failed: ${error.message}. Retrying…`);
            await wait(RETRY_DELAY_MS);
            return getPuzzle(attempt + 1);
        }

        console.error(`Banana API failed after ${attempt} attempts:`, error);
        throw new Error("Unable to load a puzzle right now. Please try again shortly.");
    }
}

module.exports = { getPuzzle };
