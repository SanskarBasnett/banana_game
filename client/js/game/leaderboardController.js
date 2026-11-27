// Fetches and renders the global leaderboard table.
// Isolated here so leaderboard changes don't risk touching puzzle or timer logic.

import { getLeaderboard } from "../api/apiClient.js";

const leaderboardDisplay = document.getElementById("leaderboard");
const MEDALS = ["🥇", "🥈", "🥉"];

export async function updateLeaderboard() {
    try {
        const data = await getLeaderboard();
        leaderboardDisplay.textContent = "";

        if (data.leaderboard.length === 0) {
            leaderboardDisplay.textContent = "No players yet.";
            return;
        }

        // Read the current username from the DOM to highlight the logged-in player's row
        const currentUsername = document.getElementById("username").textContent.trim();

        const table = document.createElement("table");
        table.classList.add("leaderboard-table");

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["Rank", "Player", "Score"].forEach(title => {
            const th = document.createElement("th");
            th.scope = "col";
            th.textContent = title;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        const tbody = document.createElement("tbody");
        data.leaderboard.forEach((player, index) => {
            const row = document.createElement("tr");

            if (player.username === currentUsername) {
                row.classList.add("current-user-row");
            }

            const rankCell  = document.createElement("td");
            rankCell.textContent = index < 3 ? `${MEDALS[index]} ${index + 1}` : index + 1;

            const nameCell  = document.createElement("td");
            nameCell.textContent = player.username;

            const scoreCell = document.createElement("td");
            scoreCell.textContent = player.totalScore;

            row.append(rankCell, nameCell, scoreCell);
            tbody.appendChild(row);
        });

        table.append(thead, tbody);
        leaderboardDisplay.appendChild(table);

    } catch (error) {
        leaderboardDisplay.textContent = "Unable to load leaderboard.";
        console.error("Leaderboard loading error:", error);
    }
}
