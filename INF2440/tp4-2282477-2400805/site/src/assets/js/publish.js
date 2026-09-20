function onLoad() {
    const form = document.getElementById("publish-form");
    const hasMax = document.getElementById("has-max");
    const maxViews = document.getElementById("max-views");
    const deleteAction = document.getElementById("delete-action");
    const privateAction = document.getElementById("private-action");
    const publicRadio = document.getElementById("public");
    const privateRadio = document.getElementById("private");

    function onChange() {
        const isPrivate = privateRadio.checked;
        const enabled = hasMax.checked;

        maxViews.required = enabled;
        deleteAction.required = enabled;
        maxViews.disabled = !enabled;
        deleteAction.disabled = !enabled;

        if (isPrivate) {
            // TODO : désactiver l'option de mise en privée pour une image privée et forcer la suppression immédiate
        } else {
            privateAction.required = enabled;
            privateAction.disabled = !enabled;
        }
    }

    publicRadio.addEventListener("change", onChange);
    privateRadio.addEventListener("change", onChange);
    hasMax.addEventListener("change", onChange);
    form.addEventListener("submit", onSubmit);

    onChange();
}

async function onSubmit(event) {
    event.preventDefault();

    document.body.classList.value = "";

    const formData = new FormData(event.target);
    const postData = new FormData();

    postData.append("title", formData.get("title"));
    postData.append("image", formData.get("image"));
    postData.append("status", formData.get("status"));
    postData.append("maxViews", formData.get("has-max") === "on" ? formData.get("max-views") : null);
    postData.append("immediateDelete", formData.get("action") === "delete-action");

    // TODO : envoyer une demande de publication d'une nouvelle image
    try {
        displaySecretCode('todo12');
    } catch (error) {
        displayError(error.message);
    }
}

function displayError(error) {
    document.getElementById("error-message").innerText = error;
    document.body.classList.value = "";
    document.body.classList.add("show-error");
}

function displaySecretCode(secretCode) {
    document.getElementById("code").innerText = secretCode;
    document.body.classList.value = "";
    document.body.classList.add("show-success");
}

onLoad();