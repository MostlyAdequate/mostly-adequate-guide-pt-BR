require('../../support');
var Task = require('data.task');
var _ = require('ramda');

// Exercício 1
// ==========
// Use _.add(x,y) e _.map(f,x) para criar uma função que incrementa
// um valor dentro de um functor

var ex1 = undefined;



// Exercício 2
// ==========
// Use _.head para pegar o primeiro elemento desta lista
var xs = Identity.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);

var ex2 = undefined;



// Exercício 3
// ==========
// Use safeProp e _.head para encontrar a primeira letra do nome do usuário
var safeProp = _.curry(function (x, o) { return Maybe.of(o[x]); });

var user = { id: 2, name: "Albert" };

var ex3 = undefined;



// Exercício 4
// ==========
// Use Maybe para reescrever ex4 sem usar if

var ex4 = function (n) {
  if (n) { return parseInt(n); }
};

var ex4 = undefined;



// Exercício 5
// ==========
// Escreva uma função que pegue getPost e use toUpperCase no título do post

// getPost :: Int -> Future({id: Int, title: String})
var getPost = function (i) {
  return new Task(function(rej, res) {
    setTimeout(function(){
      res({id: i, title: 'Love them futures'})
    }, 300)
  });
};

var ex5 = undefined;



// Exercício 6
// ==========
// Escreva uma função que use checkActive() e showWelcome() para um acesso válido (grant access)
// ou retorne um erro

var showWelcome = _.compose(_.add( "Welcome "), _.prop('name'));

var checkActive = function(user) {
 return user.active ? Right.of(user) : Left.of('Your account is not active')
};

var ex6 = undefined;



// Exercício 7
// ==========
// Escreva uma função de validação que cheque um tamanho > 3. E deve retornar
// Right(x) se for maios que 3 Left("You need > 3") caso contrário

var ex7 = function(x) {
  return undefined; // <--- write me. (don't be pointfree)
};



// Exercício 8
// ==========
// Use o ex7 acima e Either como um functor para salvar o usuário se ele for válido, ou
// retorne uma mensagem de erro. Lembre-se que dois argumentos em either deve returnar
// o mesmo tipo.

var save = function(x) {
  return new IO(function() {
    console.log("SAVED USER!");
    return x + '-saved';
  });
};

var ex8 = undefined;

module.exports = {ex1: ex1, ex2: ex2, ex3: ex3, ex4: ex4, ex5: ex5, ex6: ex6, ex7: ex7, ex8: ex8};
