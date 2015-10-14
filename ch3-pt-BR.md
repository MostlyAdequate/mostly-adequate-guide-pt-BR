# Capítulo 3: Alegria Pura com Funções Puras

## Ser puro novamente

Antes de seguir em frente, temos que entender o que é uma função pura.

>Uma função pura, é aquela dada um mesmo valor de entrada, vai sempre retornar o mesmo valor de saída, sem efeitos colaterais.

Por exemplo `slice` e `splice`, ambas fazem a mesma coisa, cada uma usando uma forma direfente. Nós dizemos que `slice` é pura, isso porque retorna sempre a mesma coisa dada a mesma entrada. Mas `splice` não, ela come um pedaço do array alterando assim o seu valor original, e isso é um efeito colateral.

```js
var xs = [1,2,3,4,5];

// pura
xs.slice(0,3);
//=> [1,2,3]

xs.slice(0,3);
//=> [1,2,3]

xs.slice(0,3);
//=> [1,2,3]


// impura
xs.splice(0,3);
//=> [1,2,3]

xs.splice(0,3);
//=> [4,5]

xs.splice(0,3);
//=> []
```

Em programação funcional não gostamos de funções como `splice`, de dados *mutáveis*, ou seja, que alteram os dados. O que buscamos são funções confiáveis que retornam sempre o mesmo resultado, não funções bagunceiras como `splice`.

Vamos ver outro exemplo.

```js
// impura
var minimum = 21;

var checkAge = function(age) {
  return age >= minimum;
};



// pura
var checkAge = function(age) {
  var minimum = 21;
  return age >= minimum;
};
```

O retorno da função "impura" `checkAge` depende da variável mutável `minimum`. Em outras palavras, ela é dependente do ambiente do sistema, o que é decepcionante, porque isso aumenta a carga cognitiva por ser afetada por um ambiente externo.

O exemplo acima pode não parecer um problema, mas essa dependência de estados é um dos maiores fatores de complexidade em sistemas[^http://www.curtclifton.net/storage/papers/MoseleyMarks06a.pdf]. A função `checkAge` pode retornar diferentes resultados dependendo dos fatores externos, o que não só a desqualifica de ser uma função pura, mas se torna complexo de entender o que está acontecendo no código, cada vez que temos que analisa-lo.

Mas em uma forma pura ela se torna completamente auto-suficiente. Podemos tornar a variável `minimum` imutável, que preservará sua pureza, onde seu estado nunca muda. Para fazer isso temos que criar um objeto de congelamento.

```js
var immutableState = Object.freeze({
  minimum: 21
});
```

## Efeitos colaterais podem incluir...

Vamor dar uma olhada nesses "efeitos colaterais" para melhorar nossa intuição.
Mas o que são esses nefastos *efeitos colaterais* mencionados na definição de *funções puras*? Bom, iremos nos referir a *efeitos*, como qualquer coisa que ocorra além do cálculo de um resultado.

Não há nada particularmente ruim em "efeitos", e continuaremos a usá-los ao longo dos capítulos. Essa parte *colateral* que tem a conotação negativa. Aguás paradas não são uma incubadora de larvas, o problema é ficar *estagnada/parada*, isso sim produz a proliferação de larvas, e eu lhe garanto que efeitos *colaterais* são semelhantes a isso em seus programas.

>Um *efeito colateral* é a alteração de uma estado no sistema ou uma *interação observável* com o mundo externo, que ocorre durante o cálculo de uma resultado.

Efeitos colaterais podem incluir: (Mas não estão limitados apenas a isso.)

  * modificar um arquivo de sistema (file system)
  * inserir registros no banco de dados
  * fazer uma requisição http
  * mutações: alteração de estado em uma variável
  * exibições na tela / logging
  * recebendo dados do usuário
  * acesso ao DOM
  * acessar o estado do sistema

E a lista vai crescendo. Qualquer interação com o mundo exterior em uma função é um efeito colateral, o que lhe leva pensar que isso pode ser muito prático. Mas a filosofia da programação funcional postula que, efeitos colaterais são a principal causa de comportamentos incorretos.

Não estamos proibindo seu uso, em vez disso, queremos apenas conte-los e roda-los de uma forma controlada e segura. Iremos aprender como fazer isso quando trabalharmos com *functors* e *nomads* nos próximos capítulos, mas agora, vamos tentar deixar essas funções traiçoeiras bem separadas de nossas funções puras.

Efeitos colaterais desqualifica uma função de ser *pura* e isso faz sentido: funções puras por definição, deve sempre retornar a mesma saída dada um mesma entrada, o que não é possível garantir quando lidamos com fatores externos dentro de nossa função local.

Vamos dar uma olhada mais de perto porque insistimos na questão de "mesma entrada e mesma saída". Vamos olhar uma questão de matemática da 8ª série.

## Matemática da 8ª série

Retirado de mathisfun.com:

> Uma função é uma relação especial entre valores:
> Cada uma de suas entradas retornam exatamente um valor de saída.

Em outra palavras, é apenas a relação entre dois valores: a entrada e a saída. Embora cada entrada tenha a mesma saída, não necessariamente tenha que ser única por entrada. Abaixo mostra um diagrama de uma função perfeitamente válida de `x` para `y`;

<img src="images/function-sets.gif" />[^http://www.mathsisfun.com/sets/function.html]

Em contraste, o diagrama seguinte mostra uma relação, que *não* é uma função, uma vez que o valor `5` aponta para várias saídas.

<img src="images/relation-not-function.gif" />[^http://www.mathsisfun.com/sets/function.html]

Funções podem ser descritas como um conjunto de pares (entrada, saída):`[(1,2), (3,6), (5,10)]`[^Parece que essa função dobra sua entrada].

Ou talvez uma tabela:
<table> <tr> <th>Input</th> <th>Output</th> </tr> <tr> <td>1</td> <td>2</td> </tr> <tr> <td>2</td> <td>4</td> </tr> <tr> <td>3</td> <td>6</td> </tr> </table>

E mesmo como um gráfico com `x` de entrada e `y` de saída:

<img src="images/fn_graph.png" width="300" height="300" />

Não há necessidade de explicar detalhes de implementação já que a entrada determina a saída. Uma vez que funções são simplesmente mapeamentos de entrada para saída, podemos simplesmente chamar um objeto literal com `[]` em vez de `()`.

```js
var toLowerCase = {"A":"a", "B": "b", "C": "c", "D": "d", "E": "e", "D": "d"};

toLowerCase["C"];
//=> "c"

var isPrime = {1:false, 2: true, 3: true, 4: false, 5: true, 6:false};

isPrime[3];
//=> true
```

Tudo bem, você quer calcular em vez de escrever manualmente os valores das coisas, mas isso é apenas uma ilustração de uma maneira diferente de pensar sobre funções.[^Você deve estar pensando "e quando as funções possuem vários argumentos?". De fato, em termos matemáticos isso se torna um pouco inconveniente. Mas no momento, vamos considerar a entrada apenas um array ou um objeto de `argumentos`. Quando aprendermos sobre *currying*, veremos como podemos definir de uma forma matematicamente correta uma função.]

Se prepare para a revelação dramática: Funções Puras *são* funções matemáticas e isso é do que se trata a programação funcional. Programando com esses pequenos anjos, nos trazem enormes benefícios. Vamos dar uma olhada em algumas razões pelas quais estamos dispostos a ir tão longe para preservar a pureza.

## Em busca de pureza

### Cacheável

Para começar, funções puras podem sempre ter seu resultado cacheado. Isso é tipicamente feito usando uma técnica chamada `memoization`:

```js
var squareNumber  = memoize(function(x){ return x*x; });

squareNumber(4);
//=> 16

squareNumber(4); // returna o cache para a entrada 4
//=> 16

squareNumber(5);
//=> 25

squareNumber(5); // returna o cache para entrada 5
//=> 25
```

Aqui é somente uma implementação simplificada, embora existam muitas outras versões robustas disponíveis.

```js
var memoize = function(f) {
  var cache = {};

  return function() {
    var arg_str = JSON.stringify(arguments);
    cache[arg_str] = cache[arg_str] || f.apply(f, arguments);
    return cache[arg_str];
  };
};
```

Note que você pode transformar funções impuras em puras, para isso precisa atrasar sua avaliação:

```js
var pureHttpCall = memoize(function(url, params){
  return function() { return $.getJSON(url, params); }
});
```

O interessante aqui é que nós não fizemos a chamada http ainda - em vez disso é retornada uma função que fará a chamada apenas quando for invocada. Essa função agora é pura porque sempre retornará a mesma saída dada a mesma entrada: A função que fará a chamada http receberá os parâmetros `url` e `params`.

Nossa função `memoize` funciona perfeitamente, embora ela não faça o cache do resultado da chamada http, em vez disso ela coloca em cache a função gerada.

Isso não é muito útil agora, mas breve vamos aprender alguns truques que usarão essa abordagem. O que temos que entender aqui, é que nós podemos colocar em cache qualquer função não importa o quão destrutiva pareçam.

### Portátil / Auto-Documentável

Funções puras são completamente auto contidas. Tudo que a função precisa é que a sirvam com "uma bandeja de prata". Para e pense por um momento... Como isso pode ser benéfico? Para começar, as dependências das funções são explicitas, portanto fácil de ver e entender - e não coisas entranhas acontecendo por trás dos panos.

```js
//impura
var signUp = function(attrs) {
  var user = saveUser(attrs);
  welcomeUser(user);
};

//pura
var signUp = function(Db, Email, attrs) {
  return function() {
    var user = saveUser(Db, attrs);
    welcomeUser(Email, user);
  };
};
```

O exemplo aqui mostra que a função pura deve ser transparente sobre suas dependências, e portanto nos diga exatamente o que ela faz. Apenas olhando sua assinatura, pelo menos, sabemos que ela vai usar `Db`, `Email` e `attrs`.

Iremos aprender como criar funções puras não apenas adiando sua avaliação, mas aqui deve estar claro funções puras são muito mais informativas que as traiçoeiras funções inpuras.

Outra coisa que temos que salientar é que somos forçados a "injetar" dependências, ou passa-los como argumentos, o que torna nosso app muito mais flexível porque parametrizamos nosso banco de dados, e-mail ou qualquer outra informação necessária[^Não se preocupe, iremos ver uma forma de fazer isso de uma forma menos chata do que parece]. Se precisarmos informar um outro Db, basta chamar nossa função como este outro Db. Se precisarmos criar um novo aplicativo e quisermos usar essa nossa função confiável, basta passarmos os novos parâmetros para `Db` e `Email`.

No cenário Javascript, portabilidade pode significar serializar e enviar funções através de um socket. Isso pode significar executar nosso app em web workers. Portabilidade é uma ferramenta poderosa.

Ao contrário dos "típicos" métodos e procedimentos da programação imperativa, que estão profundamente enraizados em seus ambientes devido aos estados, dependências e efeitos disponíveis, funções puras rodam em qualquer lugar, onde seu coração desejar.

Quando foi a última vez que você copiou um método para um novo app? Uma de minhas citações favoritas vem do criador do Erlang, Joe Armstrong: "O problema com linguagens orientadas a objetos, é que carregam consigo toda esse ambiente implícito. Você quer uma banana, mas em vez disso você recebe um gorila segurando uma banana... e toda selva junto".

### Testável

A seguir, percebemos que funções puras tornam os testes muito mais fáceis. Não temos que criar uma plataforma "real" de pagamento e testar todos estados do mundo externo. Temos apenas que informar as entradas e testar as saídas.

In fact, we find the functional community pioneering new test tools that can blast our functions with generated input and assert that properties hold on the output. It's beyond the scope of this book, but I strongly encourage you to search for and try *Quickcheck* - a testing tool that is tailored for a purely functional environment.

### Reasonable

Many believe the biggest win when working with pure functions is *referential transparency*. A spot of code is referentially transparent when it can be substituted for its evaluated value without changing the behavior of the program.

Since pure functions always return the same output given the same input, we can rely on them to always return the same results and thus preserve referential transparency. Let's see an example.

```js

var decrementHP = function(player) {
  return player.set("hp", player.hp-1);
};

var isSameTeam = function(player1, player2) {
  return player1.team === player2.team;
};

var punch = function(player, target) {
  if(isSameTeam(player, target)) {
    return target;
  } else {
    return decrementHP(target);
  }
};

var jobe = Immutable.Map({name:"Jobe", hp:20, team: "red"});
var michael = Immutable.Map({name:"Michael", hp:20, team: "green"});

punch(jobe, michael);
//=> Immutable.Map({name:"Michael", hp:19, team: "green"})
```

`decrementHP`, `isSameTeam` and `punch` are all pure and therefore referentially transparent. We can use a technique called *equational reasoning* wherein one substitutes "equals for equals" to reason about code. It's a bit like manually evaluating the code without taking into account the quirks of programmatic evaluation. Using referential transparency, let's play with this code a bit.

First we'll inline the function `isSameTeam`.

```js
var punch = function(player, target) {
  if(player.team === target.team) {
    return target;
  } else {
    return decrementHP(target);
  }
};
```

Since our data is immutable, we can simply replace the teams with their actual value

```js
var punch = function(player, target) {
  if("red" === "green") {
    return target;
  } else {
    return decrementHP(target);
  }
};
```

We see that it is false in this case so we can remove the entire if branch

```js
var punch = function(player, target) {
  return decrementHP(target);
};

```

And if we inline `decrementHP`, we see that, in this case, punch becomes a call to decrement the `hp` by 1.

```js
var punch = function(player, target) {
  return target.set("hp", target.hp-1);
};
```

This ability to reason about code is terrific for refactoring and understanding code in general. In fact, we used this technique to refactor our flock of seagulls program. We used equational reasoning to harness the properties of addition and multiplication. Indeed, we'll be using these techniques throughout the book.

### Parallel Code

Finally, and here's the coup de grâce, we can run any pure function in parallel since it does not need access to shared memory and it cannot, by definition, have a race condition due to some side effect.

This is very much possible in a server side js environment with threads as well as in the browser with web workers though current culture seems to avoid it due to complexity when dealing with impure functions.


## In Summary

We've seen what pure functions are and why we, as functional programmers, believe they are the cat's evening wear. From this point on, we'll strive to write all our functions in a pure way. We'll require some extra tools to help us do so, but in the meantime, we'll try to separate the impure functions from the rest of the pure code.

Writing programs with pure functions is a tad laborious without some extra tools in our belt. We have to juggle data by passing arguments all over the place, we're forbidden to use state, not to mention effects. How does one go about writing these masochistic programs? Let's acquire a new tool called curry.

[Chapter 4: Currying](ch4.md)
