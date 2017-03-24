# Capítulo 5: Programando por Composição

## Reprodutor Funcional

Aqui está o `compose` ( composição ):

```js
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};
```

`f` e `g` são funções, e o `x` é o valor que está sendo passado por cada uma delas.

Composição é como uma reprodução de funções. Você como um reprodutor, seleciona duas funções que você considera útil, combina as mesmas, e produz uma nova função. Como abaixo:

```js
var toUpperCase = function(x) { return x.toUpperCase(); };
var exclaim = function(x) { return x + '!'; };
var shout = compose(exclaim, toUpperCase);

shout("send in the clowns");
//=> "SEND IN THE CLOWNS!"
```

A composição de duas funções retorna uma nova função. Isso faz todo sentido: compor duas unidades de um certo tipo (neste caso funções) deve criar uma nova unidade deste mesmo tipo. Se você juntar duas peças de lego não vai obter uma cabana. Existe uma teoria aqui, alguma lei implícita, e no tempo certo iremos descobrir.

Em nossa definição de `compose`, o `g` irá rodar antes do `f`, criando um fluxo de dados da direita para esquerda. Assim é muito mais legível do que aninhando várias chamadas de funções. A função acima sem usar composição ficaria assim:

```js
var shout = function(x){
  return exclaim(toUpperCase(x));
};
```

Em vez de dentro para fora, nós rodamos da direita para a esquerda, que suponho que é um passo para a esquerda[^boo]. Vamos ver um exemplo onde a ordem é importante:

```js
var head = function(x) { return x[0]; };
var reverse = reduce(function(acc, x){ return [x].concat(acc); }, []);
var last = compose(head, reverse);

last(['jumpkick', 'roundhouse', 'uppercut']);
//=> 'uppercut'
```
`reverse` inverte a lista, enquando `head` pega o primeiro item. O resultado é eficaz embora não muito performático. A sequencia de funções da composição deveria estar claro agora. Podemos definir uma versão da esquerda para direita, entretanto, usaremos o modelo mais próximo possível da versão matemática. É isso mesmo, composição veio direto dos livros de matemática. De fato, talvez seja a hora de darmos uma olhada para uma propriedade que é válida para qualquer composição.

```js
// associativity (associatividade)
var associative = compose(f, compose(g, h)) == compose(compose(f, g), h);
// true
```

Composição é associativa, o que significa que não interessa como você as agrupa. Então, se queremos colocar em caixa alta a string, podemos escrever assim:

```js
compose(toUpperCase, compose(head, reverse));

// ou
compose(compose(toUpperCase, head), reverse);
```

Já que não importa como nós agrupamos nossas chamadas para `compose`, o resultado sempre será o mesmo. Que nos permite escrever uma função `variadic` e usa-lá conforme abaixo:

```js
// anteriormente tivemos que criar duas composições, mas já que composição
// é associativa, podemos compor quantas funções quisermos e deixar
// ela decidir como agrupá-las.
var lastUpper = compose(toUpperCase, head, reverse);

lastUpper(['jumpkick', 'roundhouse', 'uppercut']);
//=> 'UPPERCUT'


var loudLastUpper = compose(exclaim, toUpperCase, head, reverse)

loudLastUpper(['jumpkick', 'roundhouse', 'uppercut']);
//=> 'UPPERCUT!'
```
Aplicando a propriedade associativa, nos dá flexibilidade e a paz de mente que o resultado será equivalente. A definição `variadic` um pouco mais complicada está inclusa com o suporte de algumas bibliotecas para este livro, e a definição normal você encontrará em bibliotecas como [lodash][lodash-website], [underscore][underscore-website], e [ramda][ramda-website].

Um dos benefícios da associativadade é que qualquer grupo de funções podem ser extraidas e agrupadas em sua própria composição. Vamos refatorar nosso exemplo anterior:

```js
var loudLastUpper = compose(exclaim, toUpperCase, head, reverse);

// ou
var last = compose(head, reverse);
var loudLastUpper = compose(exclaim, toUpperCase, last);

// ou
var last = compose(head, reverse);
var angry = compose(exclaim, toUpperCase);
var loudLastUpper = compose(angry, last);

// mais variações...
```

Não existe respostas certas ou erradas - estamos apenas encaixando nossas peças de lego da maneira que nos agrade. Geralmente é melhor agrupar as coisas de uma forma que sejam reusáveis como `last` e `angry`. Se está familiarizado com Fowler's "[Refactoring][refactoring-book]", reconhece esse processo como "[extract method][extract-method-refactor]"...exceto sem todos os estados dos objetos para se preocupar.

## Pointfree

Estilo `Pointfree` significa nunca ter que mencionar seus dados. Desculpe, vou explicar melhor. Significa que são funções que nunca mencionam os dados em que estão operando. Funções de primeira classe, currying, composição, todas elas trabalham juntas para criar esse estilo.

```js
// não é pointfree porque menciona os dados: word
var snakeCase = function (word) {
  return word.toLowerCase().replace(/\s+/ig, '_');
};

// é pointfree
var snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);
```

Viu como aplicamos parcialmente o `replace`? O que estamos fazendo é passando nossos dados através da cada função apenas com 1 argumento. Currying nos permite preparar cada função para somente receber o dado, operar sobre ele, e retorná-lo. O que vale lembrar é que na versão pointfree nós não precisamos dos dados para construir nossas funções, ao contrário da versão sem pointfree, que antes de qualquer coisa já devemos ter disponível nosso dado `word`.

Vamos ver outro exemplo:

```js
//não é pointfree porque menciona nosso dado: name
var initials = function (name) {
  return name.split(' ').map(compose(toUpperCase, head)).join('. ');
};

//pointfree
var initials = compose(join('. '), map(compose(toUpperCase, head)), split(' '));

initials("hunter stockton thompson");
// 'H. S. T'
```

Códigos em Pointfree podem novamente nos ajudar a remover nomes desnecessários e deixar nosso código consiso e genérico.
Pointfree é um bom exemplo de como testar se nosso código funcional está composto de pequenas funções que recebem uma entrada para uma saída. Não é possível compor um while loop, por exemplo. Mas cuidado, no entanto, pointfree é uma espada de dois gumes que pode as vezes não deixar clara sua real intenção. Nem todos códigos funcionais são pointfree e isso esta O.K. Vamos usá-las quando pudermos, quando não der, ficaremos com funções normais.

## Debugando
Um erro comum é compor algo como `map`, uma função de dois argumentos, sem primeiro aplicá-la parcialmente.

```js
// errado - terminamos dando um array para angry e aplicamos parcialmente map com sabe Deus o que.
var latin = compose(map, angry, reverse);

latin(["frog", "eyes"]);
// erro


// certo - cada função espera 1 argumento.
var latin = compose(map(angry), reverse);

latin(["frog", "eyes"]);
// ["EYES!", "FROG!"])
```

Se você está tendo problemas em debugar uma composição, podemos usar essa útil porém impura função `trace`, para ver o que está acontecendo.

```js
var trace = curry(function(tag, x){
  console.log(tag, x);
  return x;
});

var dasherize = compose(join('-'), toLower, split(' '), replace(/\s{2,}/ig, ' '));

dasherize('The world is a vampire');
// TypeError: Cannot read property 'apply' of undefined
```
Alguma coisa está errada aqui, vamos dar um `trace`

```js
var dasherize = compose(join('-'), toLower, trace("depois do split"), split(' '), replace(/\s{2,}/ig, ' '));
// depois do split [ 'The', 'world', 'is', 'a', 'vampire' ]
```

Ah! Precisamos usar o `map` nesse `toLower` já que o mesmo está lidando com um array.

```js
var dasherize = compose(join('-'), map(toLower), split(' '), replace(/\s{2,}/ig, ' '));

dasherize('The world is a vampire');

// 'the-world-is-a-vampire'
```

A função `trace` nos permite visualizar o dado em um determinado ponto para fins de depuração (debugging). Linguagens como haskell e purescript possuem funções similares para um fácil desenvolvimento.

Composição será nossa ferramenta para contruirmos programas, e por sorte, possui por trás uma forte teoria que nos garante que tudo irá funcionar. Vamos examinar essa teoria.

## Teoria das Categorias

Teoria das Categorias é uma ramificação da matemática abstrada que pode formalizar conceitos de várias outras ramificações diferentes tais como a teoria dos conjuntos, teoria dos tipos, teoria dos grupos, lógica e muito mais. Ele lida primeiramente com objetos, morfismo e transformações, que muito se asemelham a programação. Aqui temos um gráfico com os conceitos vistos separados por categoria.

<img src="images/cat_theory.png" />

Desculpe, eu não queria te assustar. Eu não espero que você já esteja intimamente familiarizado com todos esses conceitos. Meu objetivo aqui é te mostrar quanta duplicação nós temos, então você poderá ver porque a teoria categórica visa unificar todas essas coisas.

Em teoria categórica, temos algo chamado... uma categoria. A mesma é definida como uma coleção com os seguintes componentes:

  * Uma coleção de objetos
  * Uma coleção de morfismo
  * Uma noção de composição nos morfismos
  * Um morfismo distinto chamado identidade

Teoria das categorias é abstrata suficiente para modelar muitas coisas, mas vamos aplicar isso para tipos e funções, pois é o que nos preocupa no momento.

**Uma coleção de objetos**
Os objetos serão tipos de dados. No caso, ``String``, ``Boolean``, ``Number``, ``Object``, e etc. Geralmente vemos tipos de dados como um conjunto de todos valores possíveis. Podemos dar uma olhada no ``Boolean`` como um conjunto de `[true, false]` e ``Number`` como um conjunto de todos os valores numéricos possíveis. Tratando tipos como conjuntos é útil, porque podemos usar teoria dos conjuntos para trabalhar com eles.

**Uma coleção de morfismo**
Morfismo serão nossas funções puras padrão de cada dia.

**Uma noção de composição nos morfismos**
Esse, como você deve ter imaginado, é nosso novo brinquedo - `compose`. Discutimos que nossa função `compose` é associativa o que não é uma coincidência, pois é uma propriedade que deve manter qualquer composição na teoria das categorias.

Aqui temos uma imagem demostrando a composição:

<img src="images/cat_comp1.png" />
<img src="images/cat_comp2.png" />

Aqui um exemplo concreto em código:

```js
var g = function(x){ return x.length; };
var f = function(x){ return x === 4; };
var isFourLetterWord = compose(f, g);
```

**Um morfismo distinto chamado identidade**
Vamos introduzir uma função útil chamada `id`. Essa função simplesmente recebe uma entrada e te retorna o mesmo valor. Confira:

```js
var id = function(x){ return x; };
```

Você pode pensar "Mas para que diabos isso pode ser útil?". Iremos utilizá-la muitas vezes nos próximos capítulos, mas agora pense nela como uma função que pode servir de substituto do nosso valor - uma função que mascara nossos dados.

`id` deve interagir bem com compose(composição). Aqui temos uma propriedade que está em conformidade com cada unary[^unary: função de apenas um argumento] função f:

```js
// identity
compose(id, f) == compose(f, id) == f;
// true
```

Hey, isso é como a propriedade de indentidade em números. Se isso ainda não está claro, tome mais um tempo com isso. Entenda a futilidade. Breve veremos `id` sendo usado a todo momento, mas agora vemos ela agindo como um substituto de um valor que foi dado. Isso é muito útil quando escrevemos código no estilo pointfree.

Então, o que você tem é isso, uma categoria de tipos e funções. Se essa é sua primeira indrodução, imagino que você esteja ainda um pouco confuso do que é uma categoria e porque ela é útil. É sobre essa base de conhecimento que iremos trabalhar neste livro. A partir de agora, neste capítulo, nesta linha, você pode pelo menos ver isso como algo que nos traz alguma sabedoria sobre composição - ou seja, as propriedades associativa e de identidade.

O que são as outras categorias? Bom, nós podemos definir um grafo direcionado com nós, como objetos, arestas como morfismos e composição apenas sendo uma forma de concatenação. Podemos definir números como objetos e `>=` como morfismo[^na verdade qualquer ordem parcial ou total podem ser uma categoria]. Existem muitas categorias, mas para o propósito deste livro, vamos apenas nos preocupar com que vimos acima. Já cobrimos o suficiente a superfície e temos de seguir em frente.

## Em Resumo
Composição conecta nossas funções como se fossem vários tubos. Os dados fluirão através de nossa aplicação de forma adequada - funções puras são funções de uma entrada para uma saída, e quebrando essa cadeia, você estaria negligenciando a saída, tornando nosso programa inútil.

Nós adotamos a composição como um `design principle` acima de todos os outros. E o motivo é porque ele deixa nosso app simples e sensato. Teoria das categorias terá um papel muito importante na arquitetura do app, modelando os efeitos colaterais e garantindo a precisão do programa.

Estamos agora no ponto onde podemos ver bem alguns exemplos práticos. Vamos criar um exemplo de aplicação.

[Capítulo 6: Exemplo de Aplicação](ch6-pt-BR.md)

## Exercícios

```js
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
  var last_car = _.last(cars);
  return _.prop('in_stock', last_car);
};

// Exercício 2:
// ============
// use a função _.compose(), _.prop() e _.head() para ler o nome do primeiro carro
var nameOfFirstCar = undefined;


// Exercício 3:
// ============
// Use a função _average para refatorar averageDollarValue para ser do tipo composition
var _average = function(xs) { return _.reduce(_.add, 0, xs) / xs.length; }; // <- leave be

var averageDollarValue = function(cars) {
  var dollar_values = _.map(function(c) { return c.dollar_value; }, cars);
  return _average(dollar_values);
};


// Exercício 4:
// ============
// Escreva a função: sanitizeNames() usando compose para que percorra o array de carros e retorne uma lista dos `names` em lowercase e underscore: exemplo: sanitizeNames([{name: "Ferrari FF"}]) //=> ["ferrari_ff"]

var _underscore = _.replace(/\W+/g, '_'); //<-- leave this alone and use to sanitize

var sanitizeNames = undefined;


// Bonus 1:
// ============
// Refatore availablePrices usando compose.

var availablePrices = function(cars) {
  var available_cars = _.filter(_.prop('in_stock'), cars);
  return available_cars.map(function(x){
    return accounting.formatMoney(x.dollar_value);
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
```

[lodash-website]: https://lodash.com/
[underscore-website]: http://underscorejs.org/
[ramda-website]: http://ramdajs.com/
[refactoring-book]: http://martinfowler.com/books/refactoring.html
[extract-method-refactor]: http://refactoring.com/catalog/extractMethod.html
