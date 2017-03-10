# Capítulo 4: Currying

## Não vivo se viver é sem você

Uma vez meu pai me explicou que há certas coisas que você vive sem, até um dia tê-las. Forno de microondas e smartphones por exemplo. Algumas pessoas mais velhas lembram de viver uma vida plena sem internet. Para mim, currying é mais um exemplo.

O conceito é simples: Você pode chamar uma função com menos argumentos do que o esperado. E o que será retornado, é uma função que leva os argumentos restantes.

Você pode chamar todos de uma só vez, ou por partes.

```js
var add = function(x) {
  return function(y) {
    return x + y;
  };
};

var increment = add(1);
var addTen = add(10);

increment(2);
// 3

addTen(2);
// 12
```

Criamos a função `add` que receberá um argumento e retornará uma função. Quando nós a chamamos, a função retornada lembra do primeiro argumento através de uma `closure`. Chamar os argumentos todos de uma vez, é um pouco doloroso, no entanto, podemos usar uma função auxiliar chamada `curry` para definir e chamar funções como esta facilmente.

Vamos configurar algumas funções curry:

```js
var curry = require('lodash.curry');

var match = curry(function(what, x) {
  return x.match(what);
});

var replace = curry(function(what, replacement, x) {
  return x.replace(what, replacement);
});

var filter = curry(function(f, xs) {
  return xs.filter(f);
});

var map = curry(function(f, xs) {
  return xs.map(f);
});
```

O padrão que estou seguindo é simples, porém muito importante. Posicinei estrategicamente o dado que estamos operando (String, Array) como sendo o último argumento. Isso ficará mais claro logo.

```js
match(/\s+/g, "hello world");
// [ ' ' ]

match(/\s+/g)("hello world");
// [ ' ' ]

var hasSpaces = match(/\s+/g);
// function(x) { return x.match(/\s+/g) }

hasSpaces("hello world");
// [ ' ' ]

hasSpaces("spaceless");
// null

filter(hasSpaces, ["tori_spelling", "tori amos"]);
// ["tori amos"]

var findSpaces = filter(hasSpaces);
// function(xs) { return xs.filter(function(x) { return x.match(/\s+/g) }) }

findSpaces(["tori_spelling", "tori amos"]);
// ["tori amos"]

var noVowels = replace(/[aeiou]/ig);
// function(replacement, x) { return x.replace(/[aeiou]/ig, replacement) }

var censored = noVowels("*");
// function(x) { return x.replace(/[aeiou]/ig, "*") }

censored("Chocolate Rain");
// 'Ch*c*l*t* R**n'
```

O que demostramos aqui é a habilidade de "pre-carregar" uma função com um ou dois argumentos, para receber uma nova função que lembra esses argumentos.

Eu lhe encorajo a instalar `npm install lodash`, copiar os códigos acima e tentar por você mesmo. Pode ser no browser onde possua lodash ou ramda.

## Mais do que somente um tempero
Currying é útil para muitas coisas. Podemos criar novas funções apenas passando alguns argumentos como vistos em `hasSpaces`, `findSpaces`, e `censored`.

Temos também a habilidade de tranformar qualquer função que funcione com um único argumento, para que funcione também com arrays, para isso apenas a encapsulamos com nossa função `map`.

```js
var getChildren = function(x) {
  return x.childNodes;
};

var allTheChildren = map(getChildren);
```

Funções chamadas com menos argumentos do que o esperado, é tipicamente chamada de *partial application*(aplicação parcial). Usando essa técnica, eliminamos um monte de código desnecessário. Note que a função `allTheChildren` se parece com a função da biblioteca lodash[^note que os argumentos estão em ordem diferente].

```js
var allTheChildren = function(elements) {
  return _.map(elements, getChildren);
};
```
Nós geralmente não definimos funções que trabalham com arrays, isso porque podemos chamar `map(getChildren)` inline. O mesmo se dá com `sort`, `filter` e outras higher order functions(funções de ordem superior)[^Higher order function: Uma função que recebe ou retorna uma função].

Quando falamos sobre *funções puras*, dizemos que recebem 1 entrada e retornam 1 saída. Currying faz exatamente isso: cada argumento retorna uma nova função que espera os argumentos restantes. Ou seja, 1 entrada e 1 saída. Não importa se a saída é outra função - isso faz dela pura. Podemos passar mais de um argumento, mas é o mesmo que remover os `()` por conveniência.

## Em resumo

Currying é muito útil, e adoro trabalhar com funções curry no meu dia-a-dia. Essa é uma das ferramentas de nosso cinto de utilidades que faz com que a programação funcional seja menos verbosa e chata. Podemos criar novas funções úteis simplesmente passando alguns argumentos, mas além disso, mantemos a definição matemática da função, mesmo passando vários argumentos.

Vamos aprender mais uma ferramenta essencial chamada `compose`.

[Capítulo 5: Programando por Composição](ch5-pt-BR.md)

## Exercícios

Uma palavrinha antes de começar. Iremos usar uma biblioteca chamada *ramda*, que usa `currying` por padrão em todas suas funções. Outra alternativa é a biblioteca chamada *lodash-fp* que faz a mesma coisa, a mesma foi criada e é mantida pelo criador do lodash. Ambas funcionarão bem para aquilo que precisamos, escolha a que quiser.

[ramda](http://ramdajs.com)
[lodash-fp](https://github.com/lodash/lodash-fp)

Aqui estão alguns [testes unitários](https://github.com/MostlyAdequate/mostly-adequate-guide-pt-BR/tree/master/code/part1_exercises) para rodar em seus exercícios, se preferir apenas copie e cole em algum lugar onde consiga executar instruções javascript, por exemplo no DevTools ou NodeJs.

As respostas estão junto com o código no [repositório deste livro](https://github.com/MostlyAdequate/mostly-adequate-guide-pt-BR/tree/master/code/part1_exercises/answers)

```js
var _ = require('ramda');


// Exercício 1
//==============
// Refatore essa função, removendo todos argumentos para `aplicação parcial`

var words = function(str) {
  return _.split(' ', str);
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
  return _.filter(function(x){ return match(/q/i, x);  }, xs);
};


// Exercício 3
//==============
// Use a função auxiliar `_keepHighest` para refatorar a função `max` para
// não referenciar nenhum argumento

// NÃO ALTERE ESSA FUNÇÃO:
var _keepHighest = function(x,y){ return x >= y ? x : y; };

// REFATORE ESSA:
var max = function(xs) {
  return _.reduce(function(acc, x){
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
```
