import { getAdminUsers, deleteUser, resetUserScore, resetAllScores } from "../api/apiClient.js";

const table          = document.getElementById("adminUserTable");
const message        = document.getElementById("adminMessage");
const resetAllButton = document.getElementById("resetAllScoresButton");

function setMessage(text) {
    if (message) message.textContent = text;
}

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
        const row  = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "No users.";
        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    users.forEach((user) => {
        const row = document.createElement("tr");

        const idCell    = document.createElement("td");
        idCell.textContent = user.id;

        const nameCell  = document.createElement("td");
        // textContent prevents any username containing HTML from being injected
        nameCell.textContent = user.username;

        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;

        const scoreCell = document.createElement("td");
        scoreCell.textContent = user.totalScore;

        const actionsCell = document.createElement("td");

        const resetBtn = document.createElement("button");
        resetBtn.type = "button";
        resetBtn.className = "btn btn-ghost";
        resetBtn.textContent = "Reset score";
        resetBtn.addEventListener("click", () => onResetScore(user.id, user.username, resetBtn));

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "btn btn-danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => onDeleteUser(user.id, user.username, deleteBtn));

        actionsCell.append(resetBtn, deleteBtn);
        row.append(idCell, nameCell, emailCell, scoreCell, actionsCell);
        table.appendChild(row);
    });
}

async function onResetScore(id, username, button) {
    if (!window.confirm(`Reset ${username}'s score to 0?`)) return;

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
    if (!window.confirm(`Delete user "${username}" (id ${id})? This cannot be undone.`)) return;

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
        if (!window.confirm("Reset ALL scores for ALL users? This clears the leaderboard.")) return;

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
