
import { getMe, updateProfile } from "../api/apiClient.js";
import { setPlayerName, showToast } from "../ui/Ui.controller.js";

const editButton = document.getElementById("editProfileButton");
const dialog = document.getElementById("profileDialog");
const form = document.getElementById("profileForm");
const closeButton = document.getElementById("closeProfileButton");
const cancelButton = document.getElementById("cancelProfileButton");
const saveButton = document.getElementById("saveProfileButton");

const usernameInput = document.getElementById("profileUsername");
const emailInput = document.getElementById("profileEmail");
const newPasswordInput = document.getElementById("profileNewPassword");
const confirmPasswordInput = document.getElementById("profileConfirmPassword");
const message = document.getElementById("profileMessage");

if (editButton && dialog && form) {
    function closeDialog() {
        dialog.close();
    }

    function syncPasswordFields() {
        const changingPassword = Boolean(newPasswordInput.value);

        confirmPasswordInput.required = changingPassword;

        if (!changingPassword) {
            confirmPasswordInput.value = "";
        }
    }

    async function openDialog() {
        message.textContent = "";
        editButton.disabled = true;

        try {
            const data = await getMe();

            usernameInput.value = data.user.username;
            emailInput.value = data.user.email;
            newPasswordInput.value = "";
            confirmPasswordInput.value = "";
            syncPasswordFields();

            dialog.showModal();

        } catch (error) {
            showToast(error.message);
        } finally {
            editButton.disabled = false;
        }
    }

    editButton.addEventListener("click", openDialog);
    newPasswordInput.addEventListener("input", syncPasswordFields);
    confirmPasswordInput.addEventListener("input", () => {
        message.textContent = "";
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeDialog);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeDialog);
    }

    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            closeDialog();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        message.textContent = "";

        if (newPasswordInput.value !== confirmPasswordInput.value) {
            message.textContent = "Passwords do not match.";
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const data = await updateProfile({
                username: usernameInput.value,
                email: emailInput.value,
                newPassword: newPasswordInput.value || undefined,
                confirmPassword: confirmPasswordInput.value || undefined
            });

            setPlayerName(data.user.username);
            closeDialog();
            form.reset();

            showToast("Profile updated successfully.");
            window.dispatchEvent(new Event("player-updated"));

        } catch (error) {
            message.textContent = error.message;
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Changes";
        }
    });
}
