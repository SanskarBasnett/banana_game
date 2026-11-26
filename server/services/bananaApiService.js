// External Banana API endpoint
const BANANA_API_URL = "http://marcconrad.com/uob/banana/api.php";

// Fetch a new puzzle from the external Banana API
async function getPuzzle() {
    try {
        // Send an HTTP GET request to the Banana API
        const response = await fetch(
            `${BANANA_API_URL}?out=json&base64=no`
        );

        // Check whether the API request was successful
        if (!response.ok) {
            throw new Error("Banana API request failed.");
        }

        // Receive and convert the JSON response into a JavaScript object
        const puzzle = await response.json();

        // Validate the received puzzle data
        if (!puzzle.question || puzzle.solution === undefined) {
            throw new Error("Invalid puzzle response.");
        }

        // Extract the puzzle image URL and correct solution
        return {
            imageUrl: puzzle.question,
            solution: Number(puzzle.solution)
        };

    } catch (error) {
        // Handle errors during external API communication
        console.error("Banana API error:", error);
        throw error;
    }
}

// Export the function so other backend modules can use it
module.exports = { getPuzzle };
