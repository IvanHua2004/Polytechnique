// const arr = [1, 2, 3];
// let res = arr.map((val, index, arr) => {
//   return { value: val, index: index, array: arr };
// });
// console.log(res);
/*
[ { value: 1, index: 0, array: [ 1, 2, 3 ] }, 
  { value: 2, index: 1, array: [ 1, 2, 3 ] }, 
  { value: 3, index: 2, array: [ 1, 2, 3 ] } ] 
*/

// Exercice : implémenter notre propre fonction "myMap" qui se comporte comme la méthode "map" d'un Array JS
// On ajoute notre propre méthode "myMap" au prototype des tableaux
Array.prototype.hello = function (callback) {
  const result = [];
  // this fait référence au tableau sur lequel on appelle myMap
  for (let i = 0; i < this.length; i++) {
    // on exécute la fonction callback sur chaque élément
    result.push(callback(this[i], i, this));
  }
  return result;
};


// --- Test ---
const testArray = [1, 2, 3];

// On appelle notre méthode personnalisée myMap
const res = testArray.hello((val, index, arr) => {
  return { value: val, index: index, array: arr };
});

console.log(res);

// const testArray = [1, 2, 3];
// res = testArray.myMap((val, index, arr) => {
//   return { value: val, index: index, array: arr };
// });
// console.log(res);
/*
[ { value: 1, index: 0, array: [ 1, 2, 3 ] }, 
  { value: 2, index: 1, array: [ 1, 2, 3 ] }, 
  { value: 3, index: 2, array: [ 1, 2, 3 ] } ] 
*/