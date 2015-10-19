require('../../support');
var _ = require('ramda');


// Exercício 1
//==============
// Refatore essa função, removendo todos argumentos para `aplicação parcial`

var words = function(str) {
  return split(' ', str);
};

// Exercício 1a
//==============
// Use a função `map` para fazer com que a função `word` funcione
// em um array de strings.

var sentences = undefined;


// Exercício 2
//==============
// Refatore essa função, removendo todos argumentos para `aplicação parcial`

var filterQs = function(xs) {
  return filter(function(x){ return match(/q/i, x);  }, xs);
};


// Exercício 3
//==============
// Use a função auxiliar `_keepHighest` para refatorar a função `max` para
// não referenciar nenhum argumento

// NÃO ALTERE ESSA FUNÇÃO:
var _keepHighest = function(x,y){ return x >= y ? x : y; };

// REFATORE ESSA:
var max = function(xs) {
  return reduce(function(acc, x){
    return _keepHighest(acc, x);
  }, 0, xs);
};


// Bonus 1:
// ============
// encapsule a função array slice para se tornar funcional e do tipo 'curry'.
// //[1,2,3].slice(0, 2)
var slice = undefined;


// Bonus 2:
// ============
// use a função acima slice, para definir a função 'take'
// para que ela retorne 'n' elementos. Faça ela ser 'curry' também.
var take = undefined;


module.exports = { words: words,
                   sentences: sentences,
                   filterQs: filterQs,
                   max: max,
                   slice: slice,
                   take: take
                 };
