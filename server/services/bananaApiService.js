
const BANANA_API_URL = "http://marcconrad.com/uob/banana/api.php";

async function getPuzzle() {
    try {
        const response = await fetch(
            `${BANANA_API_URL}?out=json&base64=no`
        );

        if (!response.ok) {
            throw new Error("Banana API request failed.");
        }

        const puzzle = await response.json();

        if (!puzzle.question || puzzle.solution === undefined) {
            throw new Error("Invalid puzzle response.");
        }

        return {
            imageUrl: puzzle.question,
            solution: Number(puzzle.solution)
        };

    } catch (error) {
        console.error("Banana API error:", error);
        throw error;
    }
}

module.exports = { getPuzzle };
