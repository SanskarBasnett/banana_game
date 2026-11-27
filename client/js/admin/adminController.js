
import {
    getAdminUsers,
    deleteUser,
    resetUserScore,
    resetAllScores
} from "../api/apiClient.js";

const table = document.getElementById("adminUserTable");
const message = document.getElementById("adminMessage");
const resetAllButton = document.getElementById("resetAllScoresButton");

function setMessage(text) {
    if (message) message.textContent = text;
}

// Rows are built with textContent, not innerHTML, to avoid injecting markup.

async function loadUsers() {
    table.textContent = "Loading users...";

    try {
        const data = await getAdminUsers();
        renderUsers(data.users);
    } catch (error) {
        table.textContent = "Unable to load users.";
        setMessage(error.message);
    }
}

function renderUsers(users) {
    table.textContent = "";

    if (users.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "No users.";
        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    users.forEach((user) => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = user.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = user.username;

        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;

        const scoreCell = document.createElement("td");
        scoreCell.textContent = user.totalScore;

        const actionsCell = document.createElement("td");

        const resetScoreButton = document.createElement("button");
        resetScoreButton.type = "button";
        resetScoreButton.className = "btn btn-ghost";
        resetScoreButton.textContent = "Reset score";
        resetScoreButton.addEventListener("click", () =>
            onResetScore(user.id, user.username, resetScoreButton)
        );

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () =>
            onDeleteUser(user.id, user.username, deleteButton)
        );

        actionsCell.append(resetScoreButton, deleteButton);

        row.append(idCell, nameCell, emailCell, scoreCell, actionsCell);

        table.appendChild(row);
    });
}

async function onResetScore(id, username, button) {
    const ok = window.confirm(
        `Reset ${username}'s score to 0? This removes their score entries and updates the leaderboard.`
    );

    if (!ok) return;

    button.disabled = true;
    setMessage("");

    try {
        await resetUserScore(id);
        setMessage("Score reset.");
        await loadUsers();
    } catch (error) {
        setMessage(error.message);
    } finally {
        button.disabled = false;
    }
}

async function onDeleteUser(id, username, button) {
    const ok = window.confirm(
        `Delete user "${username}" (id ${id})? This permanently removes the account and all their scores.`
    );

    if (!ok) return;

    button.disabled = true;
    setMessage("");

    try {
        await deleteUser(id);
        setMessage("User deleted.");
        await loadUsers();
    } catch (error) {
        setMessage(error.message);
    } finally {
        button.disabled = false;
    }
}

if (resetAllButton) {
    resetAllButton.addEventListener("click", async () => {
        const ok = window.confirm(
            "Reset ALL scores for ALL users? This clears every score and resets the leaderboard."
        );

        if (!ok) return;

        resetAllButton.disabled = true;
        setMessage("");

        try {
            await resetAllScores();
            setMessage("All scores reset. Leaderboard cleared.");
            await loadUsers();
        } catch (error) {
            setMessage(error.message);
        } finally {
            resetAllButton.disabled = false;
        }
    });
}

loadUsers();
