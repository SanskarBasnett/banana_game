// Manages the Edit Profile dialog.
// Communicates with the game module through the player:updated event rather
// than a direct import, so neither module depends on the other.

import { getMe, updateProfile } from "../api/apiClient.js";
import { setPlayerName, showToast } from "../ui/Ui.controller.js";
import { AppEvents, emit } from "../events.js";

const editButton           = document.getElementById("editProfileButton");
const dialog               = document.getElementById("profileDialog");
const form                 = document.getElementById("profileForm");
const closeButton          = document.getElementById("closeProfileButton");
const cancelButton         = document.getElementById("cancelProfileButton");
const saveButton           = document.getElementById("saveProfileButton");
const usernameInput        = document.getElementById("profileUsername");
const emailInput           = document.getElementById("profileEmail");
const newPasswordInput     = document.getElementById("profileNewPassword");
const confirmPasswordInput = document.getElementById("profileConfirmPassword");
const message              = document.getElementById("profileMessage");

if (editButton && dialog && form) {

    function closeDialog() {
        dialog.close();
    }

    // Make confirm-password required only when the user has started typing a new password
    function syncPasswordFields() {
        const changingPassword = Boolean(newPasswordInput.value);
        confirmPasswordInput.required = changingPassword;
        if (!changingPassword) confirmPasswordInput.value = "";
    }

    // Fetch fresh profile data from the server each time the dialog opens
    // so the form always shows the actual stored values, not stale DOM text
    async function openDialog() {
        message.textContent = "";
        editButton.disabled = true;

        try {
            const data = await getMe();
            usernameInput.value = data.user.username;
            emailInput.value    = data.user.email;
            newPasswordInput.value     = "";
            confirmPasswordInput.value = "";
            syncPasswordFields();
            dialog.showModal();
        } catch (error) {
            showToast(error.message);
        } finally {
            editButton.disabled = false;
        }
    }

    editButton.addEventListener("click",  openDialog);
    newPasswordInput.addEventListener("input",    syncPasswordFields);
    confirmPasswordInput.addEventListener("input", () => { message.textContent = ""; });

    if (closeButton)  closeButton.addEventListener("click",  closeDialog);
    if (cancelButton) cancelButton.addEventListener("click", closeDialog);

    // Close on backdrop click
    dialog.addEventListener("click", (e) => { if (e.target === dialog) closeDialog(); });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        message.textContent = "";

        if (newPasswordInput.value !== confirmPasswordInput.value) {
            message.textContent = "Passwords do not match.";
            return;
        }

        saveButton.disabled    = true;
        saveButton.textContent = "Saving...";

        try {
            const data = await updateProfile({
                username:        usernameInput.value,
                email:           emailInput.value,
                newPassword:     newPasswordInput.value || undefined,
                confirmPassword: confirmPasswordInput.value || undefined
            });

            setPlayerName(data.user.username);
            closeDialog();
            form.reset();
            showToast("Profile updated successfully.");

            // Notify gameController to refresh stats and leaderboard
            emit(AppEvents.PLAYER_UPDATED);

        } catch (error) {
            message.textContent = error.message;
        } finally {
            saveButton.disabled    = false;
            saveButton.textContent = "Save Changes";
        }
    });
}
