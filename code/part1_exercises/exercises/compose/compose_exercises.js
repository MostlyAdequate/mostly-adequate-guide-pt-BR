require('../../support');
var _ = require('ramda');
var accounting = require('accounting');

// Dados de exemplo
var CARS = [
    {name: "Ferrari FF", horsepower: 660, dollar_value: 700000, in_stock: true},
    {name: "Spyker C12 Zagato", horsepower: 650, dollar_value: 648000, in_stock: false},
    {name: "Jaguar XKR-S", horsepower: 550, dollar_value: 132000, in_stock: false},
    {name: "Audi R8", horsepower: 525, dollar_value: 114200, in_stock: false},
    {name: "Aston Martin One-77", horsepower: 750, dollar_value: 1850000, in_stock: true},
    {name: "Pagani Huayra", horsepower: 700, dollar_value: 1300000, in_stock: false}
  ];

// Exercício 1:
// ============
// use a função _.compose() para reescrever a função abaixo. Dica: _.prop() é do tipo 'curry'.
var isLastInStock = function(cars) {
  var reversed_cars = _.last(cars);
  return _.prop('in_stock', reversed_cars)
};

// Exercício 2:
// ============
// use a função _.compose(), _.prop() e _.head() para ler o nome do primeiro carro
var nameOfFirstCar = undefined;


// Exercício 3:
// ============
// Use a função _average para refatorar averageDollarValue para ser do tipo composition
var _average = function(xs) { return reduce(add, 0, xs) / xs.length; }; // <- não mexa aqui

var averageDollarValue = function(cars) {
  var dollar_values = map(function(c) { return c.dollar_value; }, cars);
  return _average(dollar_values);
};


// Exercício 4:
// ============
// Escreva a função: sanitizeNames() usando compose para que percorra o array de carros e retorne uma lista dos `names` em lowercase e underscore: exemplo: sanitizeNames([{name: "Ferrari FF"}]) //=> ["ferrari_ff"]

var _underscore = replace(/\W+/g, '_'); //<-- não mexa aqui, apenas a use

var sanitizeNames = undefined;

// Bonus 1:
// ============
// Refatore availablePrices usando compose.

var availablePrices = function(cars) {
  var available_cars = _.filter(_.prop('in_stock'), cars);
  return available_cars.map(function(x){
    return accounting.formatMoney(x.dollar_value)
  }).join(', ');
};


// Bonus 2:
// ============
// Refatore no estilo pointfree. Dica: você pode usar a função _.flip()

var fastestCar = function(cars) {
  var sorted = _.sortBy(function(car){ return car.horsepower }, cars);
  var fastest = _.last(sorted);
  return fastest.name + ' is the fastest';
};

module.exports = { CARS: CARS,
                   isLastInStock: isLastInStock,
                   nameOfFirstCar: nameOfFirstCar,
                   fastestCar: fastestCar,
                   averageDollarValue: averageDollarValue,
                   availablePrices: availablePrices,
                   sanitizeNames: sanitizeNames
                 };
