import { getImageUrl } from './request.js';

/**
 * TODO : Charger les images et les afficher dans la page.
 * En cas d'erreur, afficher le message d'erreur.
 */
async function onLoad() {

    try {
        const todoImages = [{
            id: 1,
            title: "Exemple d'image",
            status: "public",
            views: 10,
            maxViews: 100
        }];
        displayImages(todoImages);
    } catch (error) {
        displayError(error.message);
    }
}

/**
 * Affiche un message d'erreur.
 * @param {string} message erreur à afficher
 */
function displayError(message) {
    document.getElementById("error-message").innerText = message;
    document.body.classList.value = "";
    document.body.classList.add("show-error");
}

/**
 * Affiche les images dans la page.
 * @param {Array} images liste des images à afficher
 * @returns
 */
function displayImages(images) {
    if (!images.length) {
        document.body.classList.value = "";
        document.body.classList.add("show-noimage");
        return;
    }

    const imagesSection = document.getElementById('images-section');
    images.forEach(image => {
        const imageElement = buildImageElement(image);
        imagesSection.appendChild(imageElement);
    });

    document.body.classList.value = "";
    document.body.classList.add("show-images");
}


function buildImageElement(image) {
    const a = document.createElement("a");
    // TODO : Mettre le lien vers la page de l'image en format /image?id=ID_DE_L_IMAGE

    const preview = document.createElement("div");
    preview.className = "image-preview";
    if (image.status === "public") {
        const imageUrl = getImageUrl(image.id);
        const imgMain = document.createElement("img");
        imgMain.src = imageUrl;
        const imgForeground = document.createElement("img");
        imgForeground.src = imageUrl;
        imgForeground.className = "foreground-image";
        preview.append(imgMain, imgForeground);
    }
    a.appendChild(preview);

    const titleDiv = document.createElement("div");
    titleDiv.className = "image-title";
    titleDiv.textContent = image.title;
    a.appendChild(titleDiv);

    const visDiv = document.createElement("div");
    visDiv.className = "image-text";
    const visStatus = document.createElement('span');
    // TODO : Mettre le texte de la visibilité en fonction du statut de l'image
    visStatus.textContent = image.status;
    visDiv.append(document.createTextNode('Visibilité :'), visStatus);
    a.appendChild(visDiv);

    const viewDiv = document.createElement("div");
    viewDiv.className = "image-view";
    const countDiv = document.createElement("div");
    countDiv.className = "view-count";
    const iconDiv = document.createElement("div");
    iconDiv.className = "view-icon";
    // TODO : Mettre le nombre de vues et le nombre maximum de vues si défini en format "vues / maxVues" ou "vues" sinon
    const viewsText = document.createTextNode(`todo/2`);
    countDiv.append(iconDiv, viewsText);
    viewDiv.appendChild(countDiv);
    a.appendChild(viewDiv);

    return a;
}

onLoad();