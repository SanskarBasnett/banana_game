const { getPuzzle } = require("./services/bananaApiService");

async function testAPI() {
    try {
        const puzzle = await getPuzzle();

        console.log("Puzzle image:", puzzle.imageUrl);
        console.log("Correct answer:", puzzle.solution);

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testAPI();