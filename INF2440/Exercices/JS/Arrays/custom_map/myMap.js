// Implémentation de notre propre fonction myMap
Array.prototype.myMap = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

// Test
const testArray = [1, 2, 3];
const res = testArray.myMap((val, index, arr) => {
  return { value: val, index: index, array: arr };
});

console.log(res);