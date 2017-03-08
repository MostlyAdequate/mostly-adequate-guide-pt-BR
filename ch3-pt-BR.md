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

O exemplo acima pode não parecer um problema, mas essa dependência de estados é um dos maiores fatores de complexidade em sistemas[^http://www.curtclifton.net/storage/papers/MoseleyMarks06a.pdf]. A função `checkAge` pode retornar diferentes resultados dependendo dos fatores externos, o que não só a desqualifica de ser uma função pura, mas se torna complexo de entender o que está acontecendo no código cada vez que temos que analisá-lo.

Mas em uma forma pura ela se torna completamente auto-suficiente. Podemos tornar a variável `minimum` imutável, que preservará sua pureza, onde seu estado nunca muda. Para fazer isso temos que criar um objeto de congelamento.

```js
var immutableState = Object.freeze({
  minimum: 21
});
```

## Efeitos colaterais podem incluir...

Vamor dar uma olhada nesses "efeitos colaterais" para melhorar nossa intuição.
Mas o que são esses nefastos *efeitos colaterais* mencionados na definição de *funções puras*? Bom, iremos nos referir a *efeitos*, como qualquer coisa que ocorra além do cálculo de um resultado.

Não há nada particularmente ruim em "efeitos", e continuaremos a usá-los ao longo dos capítulos. Essa parte *colateral* que tem a conotação negativa. A água por sí só não é uma incubadora de larvas, o problema é ficar *estagnada/parada*, isso sim produz a proliferação de larvas, e eu lhe garanto que efeitos *colaterais* são semelhantes a isso em seus programas.

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

Não estamos proibindo seu uso, em vez disso, queremos apenas contê-los e roda-los de uma forma controlada e segura. Iremos aprender como fazer isso quando trabalharmos com *functors* e *nomads* nos próximos capítulos, mas agora, vamos tentar deixar essas funções traiçoeiras bem separadas de nossas funções puras.

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

Se prepare para a revelação dramática: Funções Puras *são* funções matemáticas e isso é do que se trata a programação funcional. Programar com esses pequenos anjos, nos trazem enormes benefícios. Vamos dar uma olhada em algumas razões pelas quais estamos dispostos a ir tão longe para preservar a pureza.

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

Funções puras são completamente auto contidas. Tudo que a função precisa é que a sirvam com "uma bandeja de prata". Pare e pense por um momento... Como isso pode ser benéfico? Para começar, as dependências das funções são explicitas, portanto fica fácil de ver e entender - ao contrário de coisas entranhas acontecendo por trás dos panos.

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

Iremos aprender como criar funções puras não apenas atrasando sua avaliação, mas aqui deve estar claro, funções puras são muito mais informativas que as traiçoeiras funções inpuras.

Outra coisa que temos que salientar é que somos forçados a "injetar" dependências, ou passá-los como argumentos, o que torna nosso app muito mais flexível porque parametrizamos nosso banco de dados, e-mail ou qualquer outra informação necessária[^Não se preocupe, veremos como fazer isso de uma forma menos chata do que parece]. Se precisarmos informar um outro Db, basta chamar nossa função como este outro Db. Se precisarmos criar um novo aplicativo e quisermos usar essa nossa função confiável, basta passarmos os novos parâmetros para `Db` e `Email`.

No cenário Javascript, portabilidade pode significar serializar e enviar funções através de um socket. Isso pode significar executar nosso app em web workers. Portabilidade é uma ferramenta poderosa.

Ao contrário dos "típicos" métodos e procedimentos da programação imperativa, que estão profundamente enraizados em seus ambientes devido aos estados, dependências e efeitos disponíveis, funções puras rodam em qualquer lugar, onde seu coração desejar.

Quando foi a última vez que você copiou um método para um novo app? Uma de minhas citações favoritas vem do criador do Erlang, Joe Armstrong: "O problema com linguagens orientadas a objetos, é que carregam consigo todo esse ambiente implícito. Você quer uma banana, mas em vez disso você recebe um gorila segurando uma banana... e toda selva junto".

### Testável

A seguir, percebemos que funções puras tornam os testes muito mais fáceis. Não temos que criar uma plataforma "real" de pagamento e testar todos estados do mundo externo. Temos apenas que informar as entradas e testar as saídas.

De fato, encontramos a comunidade funcional criando novas ferramentas de testes, que podem gerar várias entradas em nossas funções, testando suas saídas. Isto está além do escopo deste livro, mas eu lhe encorajo a procurar por *Quickcheck* - Uma ferramenta de testes para ambientes puramente funcionais.

### Razoável

Muitos acreditam que o maior beneficio em trabalhar com funções puras é a *referência transparente*. Um pedaço de código é referenciamente transparente, quando o mesmo pode ser substituído por seu valor avaliado sem alterar o comportamento do programa.

Já que funções puras sempre retornam a mesma saída dada a mesma entrada, temos a certeza que sempre retornam o mesmo resultado e assim preservam a transparência referencial. Vamos ver um exemplo:

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

A funções `decrementHP`, `isSameTeam` e `punch` são puras, portanto são referenciamente transparentes. Podemos usar uma técnica chamada *raciocínio equacional* onde você pode substituir o raciocínio sobre o código de "igual para igual". É como avaliar manualmente o código, independente das peculiaridades da avaliação programática. Vamos brincar um pouco com este código usando transparência referencial.

Primeiro, eliminamos `isSameTeam`.

```js
var punch = function(player, target) {
  if(player.team === target.team) {
    return target;
  } else {
    return decrementHP(target);
  }
};
```

Já que nossos dados são imutáveis, podemos simplesmente substituir as equipes com seus valores reais.

```js
var punch = function(player, target) {
  if("red" === "green") {
    return target;
  } else {
    return decrementHP(target);
  }
};
```

Aqui vemos que o valor nesse caso é falso, então podemos remover essa parte.

```js
var punch = function(player, target) {
  return decrementHP(target);
};

```
E se também retirarmos `decrementHP`, vemos que, neste caso, `punch` se torna apenas uma chamada para decrementar o `hp` por 1;

```js
var punch = function(player, target) {
  return target.set("hp", target.hp-1);
};
```

Essa capacidade de raciocinar sobre o código é ótima para refatorar e entender codigos em geral. De fato, nós usamos essa técnica para refatorar nosso `flock` do programa `seagul`. Nós usamos `raciocínio equacional` para aproveitar as propriedades da adição e multiplicação.
Na verdade, iremos usar essa técnica ao longo do livro.

### Código paralelo

Finalmente, aqui está o golpe de misericórdia, podemos rodar qualquer função pura em paralelo, já que a mesma não precisa de acesso a memória compartilhada e não pode, por definição, possuir concorrência devido a algum efeito coleteral.

Isto é totalmente possível tanto em um ambiente servidor js com threads, bem como no navegador com `web workers`, embora a cultura atual pareça evitá-la devido a complexidade quando se trata de funções impuras.

## Em Resumo

Nós vimos o que são funções puras, e porque nós, como programadores funcionais, acreditamos que são uma maravilha. Deste ponto em diante, vamos nos esforçar para escrever todas nossas funções de forma `pura`. Vamos precisar de algumas ferramentas para nos ajudar a fazer isso, mas enquanto isso, vamos tentar separar as funções inpuras do resto do do nosso código `puro`.

Escrever programas com funções puras é um pouco trabalhoso sem a ajuda de ferramentas adicionais em nosso `cinto de utilidades`. Temos que fazer alguns malabarismos passando argumentos para tudo quanto é lugar, estamos proibidos de usar estados, para não mencionar os efeitos colaterais. Como se faz para escrever esses programas mazoquistas? Vamos adquirir uma nova ferramenta chamada `curry`.

[Chapter 4: Currying](ch4-pt-BR.md)
