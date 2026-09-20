/* eslint-disable no-unused-vars */
import { Book } from "./books.js";

// TODO : Compléter les fonctions demandées et les rendre utilisables hors du fichier

/**
 * Génère une fonction de filtrage des livres par note.
 * @param {{min:number,max:number}} rating 
 * @returns {(book: Book) => boolean} fonction qui retourne vrai si le livre a une note dans la plage spécifiée (bornes incluses)
 */
export function createRatingFilter(rating = { min: 0, max: 5 }) {
    return (book) => {
        // Ignore les livres sans note
        if (book.rating === null || book.rating === undefined) {
            return false;
        }
        return book.rating >= rating.min && book.rating <= rating.max;
    };
}

const STAR = '★';
const EMPTY_STAR = '☆';

/**
 * Formate le titre et la note d'un livre en utilisant des étoiles pleines et vides.
 * @param {Book} book le livre à analyser 
 * @returns {string} le titre du livre suivi de sa note (arrondie à l'entier le plus proche) sous forme d'étoiles
 * @example Si book.rating = 3.2, retourne "Titre du livre: ★★★☆☆"
 * @example Si book.rating = undefined , retourne "Titre du livre: Pas de note"
 */
export function starFormatStrategy(book) {
    if (book.rating === null || book.rating === undefined) {
        return `${book.title}: Pas de note`;
    }

    const roundedRating = Math.round(book.rating);
    const fullStars = STAR.repeat(roundedRating);
    const emptyStars = EMPTY_STAR.repeat(5 - roundedRating);

    return `${book.title}: ${fullStars}${emptyStars}`;
}

/**
 * Formate le titre et la note d'un livre en utilisant un format numérique.
 * @param {Book} book le livre à analyser
 * @returns {string} le titre du livre suivi de sa note (arrondie au 0.5 le plus proche) sous forme numérique
 * @example Si book.rating = 3.2, retourne "Titre du livre: 3"
 * @example Si book.rating = undefined , retourne "Titre du livre: Pas de note"
 */
export function numberFormatStrategy(book) {
    if (book.rating === null || book.rating === undefined) {
        return `${book.title} : Pas de note`;
    }

    // Arrondir au 0.5 le plus proche
    const roundedRating = Math.round(book.rating * 2) / 2;

    return `${book.title} : ${roundedRating}`;
}