import { getImageUrl } from './request.js';

let id = 0;

async function onLoad() {
    const privateForm = document.getElementById("private-form");
    privateForm.addEventListener("submit", onPrivateSubmit);

    const params = new URLSearchParams(window.location.search);
    id = params.get("id");
    const code = params.get("code");

    await loadImage(id, code);
}

/**
 * TODO : charger l'image avec l'id et le code
 * @param {string} id identifiant de l'image 
 * @param {string} code code d'accès à l'image privée
 */
async function loadImage(id, code) {
    try {
        const image = {
            id: 1,
            title: "Exemple d'image",
            status: "public",
            views: 10,
            maxViews: 100
        };
        if (image) {
            displayImage(image, code);
        } else {
            displayPrivate();
        }
    } catch (error) {
        displayError(error.message);
    }
}

async function onPrivateSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const code = formData.get("code");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    await loadImage(id, code);
}

function displayError(error) {
    document.getElementById("error-message").innerText = error;
    document.body.classList.value = "";
    document.body.classList.add("show-error");
}

function displayInfo(message) {
    document.getElementById("info-message").innerText = message;
    document.body.classList.value = "";
    document.body.classList.add("show-info");
}

function displayPrivate() {
    document.body.classList.value = "";
    document.body.classList.add("show-private");
}

/**
 * Affiche l'image et ses informations dans la page
 * @param {Image} image image à afficher
 * @param {string | null} code code d'accès à l'image privée
 * @returns
 */
function displayImage(image, code = null) {
    document.body.classList.value = "";
    document.body.classList.add("show-image");

    const dateString = formatDateToString(image.createdAt);
    const imageUrl = getImageUrl(image.id, code);
    const viewCountText = document.createTextNode(image.maxViews ? `${image.views} / ${image.maxViews}` : `${image.views}`);
    const imageVisibility = image.status === "public" ? "Publique" : "Privée";
    const imageVisibilityEdit = image.status === "public" ? "Privée" : "Publique";
    const hasPrivateAction = image.immediateDelete === false || image.immediateDelete === "false";
    const imageAction = hasPrivateAction ? "Privatisation" : "Suppression";
    const imageActionEdit = hasPrivateAction ? "Suppression" : "Privatisation";

    document.getElementById("image-title").innerText = image.title;
    document.getElementById("image-date").innerText = dateString;
    document.getElementById("image-display-1").src = imageUrl;
    document.getElementById("image-display-2").src = imageUrl;
    document.getElementById("view-count").appendChild(viewCountText);
    document.getElementById("image-visibility").innerText = imageVisibility;
    document.getElementById("image-action").innerText = imageAction;
    document.getElementById("visibility-edit").innerText = imageVisibilityEdit;
    document.getElementById("action-edit").innerText = imageActionEdit;

    if (!image.maxViews) {
        document.body.classList.add("no-action");
    }
    if (image.status === "private") {
        document.body.classList.add("no-codeinput");
        // TODO : rendre le champ de code non requis si l'image est privée

    }

    if (image.maxViews !== null && image.immediateDelete && image.views >= image.maxViews) {
        const editForm = document.getElementById("edit-form");
        const message = document.createElement("p");
        message.innerText = "Cette image est marquée pour suppression et ne peut pas être modifiée.";
        editForm.replaceWith(message);
        return;
    }

    const editForm = document.getElementById("edit-form");
    editForm.addEventListener("submit", (event) => { onEditSubmit(event, image, code) });
}

async function onEditSubmit(event, image, code = null) {
    event.preventDefault();
    const data = new FormData(event.target);
    if (!code) {
        code = data.get("edit-code");
    }

    try {
        const button = event.submitter;
        if (button && button.id === "delete-button") {
            // TODO : envoyer une demande de suppression de l'image

            displayInfo("L'image a été supprimée avec succès");
            return;
        }
        const updateContent = {};
        const title = data.get("title");
        if (title && title.length > 0) {
            updateContent.title = title;
        }
        const maxViews = data.get("max-views");
        if (maxViews && maxViews.length > 0) {
            // TODO : configurer à null si la valeur est 0 ou à la valeur numérique sinon
            updateContent.maxViews = -1;
        }
        const visibility = data.get("visibility");
        if (visibility) {
            updateContent.status = image.status === "public" ? "private" : "public";
        }
        const action = data.get("action");
        if (action) {
            updateContent.immediateDelete = !image.immediateDelete;
        }
        if (Object.keys(updateContent).length === 0) {
            return;
        }

        // TODO : envoyer une demande de mise à jour de l'image avec les nouvelles informations

        displayInfo("L'image a été modifiée avec succès");
    } catch (error) {
        displayError(error.message);
    }
}

/**
 * Fonction utilitaire qui transforme une date IS0-8601 en un affichage adapté
 * @param {string} iso date en format ISO-8601 
 * @returns date formaté en format `Publié le {jour} {mois} {année} à {HH}h{mm}
 */
function formatDateToString(iso) {
    const date = new Date(iso);

    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Toronto",
    };

    const parts = new Intl.DateTimeFormat("fr-FR", options).formatToParts(date);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));

    return `Publié le ${map.day} ${map.month} ${map.year} à ${map.hour}h${map.minute}`;
}

onLoad();