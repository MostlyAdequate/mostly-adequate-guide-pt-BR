# Tupperware


## O Poderoso Container

<img src="images/jar.jpg" alt="http://blog.dwinegar.com/2011/06/another-jar.html" />

Vimos como escrever programas que passam dados através de uma série de funções puras. Elas são
especificações declarativas de comportamento. Mas o que dizer em relação ao fluxo, tratamentos de
erros, ações assíncronas, estado, e ouso dizer, efeitos?! Neste capítulo descobriremos a fundação
pela qual todas essas úteis abstrações são construidas.

Primeiro contruiremos um container. Esse container deve saber lidar com qualquer tipo de valor; um
saco plástico que serve apenas para proteger um pudim é raramente útil. Nosso container será um
objeto, mas não informaremos nenhuma de suas propriedades ou métodos conforme o conceito de
orientação a objetos. Não, iremos tratá-lo como sendo nosso precioso - uma caixa que guarda nossos
valiosos dados.

```js
var Container = function(x) {
  this.__value = x;
}

Container.of = function(x) { return new Container(x); };
```

Aqui está nosso primeiro container. Vamos chamá-lo de `Container`. Usaremos `Container.of` como um
construtor que nos salva de termos que escrever o terrível deus `new` em todo lugar. Existem muito mais coisas na função `of` que você não consegue ver agora, mas por enquanto pense nela como um
caminho adequado para colocar valores dentro do nosso container.

Vamos examinar nossa nova caixa...

```js
Container.of(3)
//=> Container(3)


Container.of("hotdogs")
//=> Container("hotdogs")


Container.of(Container.of({name: "yoda"}))
//=> Container(Container({name: "yoda" }))
```

Se você está usando node, você verá `{__value: x}` embora seja um `Container(x)`. O Chrome irá
mostrar corretamente, isso não importa agora, o importante é entender como um `Container` se parece.
Em alguns ambientes você pode sobreescrever o método `inspect` se quiser, mas não iremos tão
longe. Para este livro, por motivos de significância educacional e por razões estéticas, escreveremos uma saída conceitual como se tivéssemos sobreescrito `inspect`.

Vamos deixar algumas coisas claras antes de seguir em frente:

* `Container` é um objeto com uma propriedade. Vários containers apenas lidam com uma coisa, mesmo não
    sendo limitados a apenas um. Nós arbitráriamente nomeamos sua propriedade de `__value`.

* O `__value` não pode ser de um tipo específico, ou nosso `Container` dificilmente teria esse nome.

* Uma vez o dado entrando no `Container` ele ficará lá. Nós até *podemos* pegá-lo usando `.__value`,
    mais isso anularia o propósito.

As razões do porque estamos fazendo isso, ficarão mais claras breve, por enquanto tenha paciência
comigo.

## Meu Primeiro Functor

Uma vez que o nosso valor, seja ele qual for, esteja no container, precisamos de uma forma de executar
funções nele.

```js
// (a -> b) -> Container a -> Container b
Container.prototype.map = function(f){
  return Container.of(f(this.__value))
}
```

Ora, é exatamente como o famoso `map` do Array, exceto que aqui temos `Container a` em vez de `[a]`.
E isso funciona essencialmente da mesma forma:

```js
Container.of(2).map(function(two){ return two + 2 })
//=> Container(4)


Container.of("flamethrowers").map(function(s){ return s.toUpperCase() })
//=> Container("FLAMETHROWERS")


Container.of("bombs").map(_.concat(' away')).map(_.prop('length'))
//=> Container(10)
```
Podemos trabalhar com nosso valor sem nunca ter de deixar o `Container`. E isso é notável. Nosso
valor no `Container` é passado para a função `map` para que possamos mexer nele, após isso o retorno vai para
o mesmo `Container` por questões de segurança. E como resultado de nunca deixar o `Container`,
podemos continuar mapeando e executando funções o quanto quisermos. Podemos até mesmo alterar o
valor conforme avançamos conforme mostrado nos três exemplos anteriores.

Espere um pouco, e se continuarmos a chamar `map`, isso parece ser um tipo de composição! Que tipo de mágica matemática está acontecendo aqui? Muito bem, acabamos de descobrir o que são *Functors*.

> Um Functor é um tipo que implementa `map` e obedece algumas leis

Sim, *Functor* é uma simples interface com um contrato. Poderíamos simplesmente chamá-lo de *Mappable*, mas onde está a diversão nisso ?

Functors vem da teoria das categorias e veremos a matemática em detalhes no final do capítulo, mas agora, vamos trabalhar na intuição e uso prático desta interface bizarramente nomeada.

Por qual motivo teríamos que engarrafar um valor e usar `map` para pegar seu valor? A resposta se revelará se fizermos a pergunta certa: O que ganhamos em pedir para nosso container aplicar funções para nós? Bem, abstração de aplicação de função. Quando damos um `map` em uma função, nós pedimos para o tipo do container executar isso para nós. De fato esse é um conceito muito poderoso.

## Schrödinger's Maybe

<img src="images/cat.png" alt="cool cat, need reference" />

`Container` é bem chato. De fato, é tipicamente chamado de `Identity` e tem o mesmo impacto que nossa função `id`[^novamente, existe uma conexão matemática que iremos ver no tempo certo]. No entando, existem outros functors, isto é, semelhantes tipos de containers que possuem uma função `map` adequada que podem prover comportamentos úteis enquanto mapeam. Vamos definir uma agora.

```js
var Maybe = function(x) {
  this.__value = x;
}

Maybe.of = function(x) {
  return new Maybe(x);
}

Maybe.prototype.isNothing = function() {
  return (this.__value === null || this.__value === undefined);
}

Maybe.prototype.map = function(f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value));
}
```

Agora, `Maybe` se parace muito com o `Container` com uma pequena modificação: Ela irá primeiramente verificar se existe um valor antes de chamar a função passada. Isso evita percorrermos valores nulos quando mapeamos[Note que esta é uma implementação simplificada apenas para aprendizado].

```js
Maybe.of("Malkovich Malkovich").map(match(/a/ig));
//=> Maybe(['a', 'a'])

Maybe.of(null).map(match(/a/ig));
//=> Maybe(null)

Maybe.of({name: "Boris"}).map(_.prop("age")).map(add(10));
//=> Maybe(null)

Maybe.of({name: "Dinah", age: 14}).map(_.prop("age")).map(add(10));
//=> Maybe(24)
```

Perceba que quando damos um map nas funções usando nossos valores nulos, nosso app não quebra com errors. Isso porque `Maybe` verifica se há um valor cada vez que a função é executada.

Essa notação de ponto(dot notation syntax) é perfeitamente boa e funcional, mas por razões mencionadas na parte 1, gostaria de manter nosso estilo pointfree. Coincidentemente, `map` está equipada para delegar para qualquer functor que a receber:

```js
//  map :: Functor f => (a -> b) -> f a -> f b
var map = curry(function(f, any_functor_at_all) {
  return any_functor_at_all.map(f);
});
```

É maravilhoso como podemos continuar usando composição como já faziamos, e o `map` funcionará como esperado. Este é o caso do `map` do ramda. Iremos usar notação de ponto quando for instrutivo e a versão pointfree quando ela for conveniente. Você notou isso? Deixamos escapar uma notação extra em nosso tipo de assinatura(type signature). O `Functor f =>` nos diz que `f` deve ser um Functor. Nada difícil, mas achei que deveria mencionar isso.

## Casos de Uso

Nos programas veremos `Maybe` tipicamente sendo usado em funções das quais podem falhar quando retornam um resultado.

```js
//  safeHead :: [a] -> Maybe(a)
var safeHead = function(xs) {
  return Maybe.of(xs[0]);
};

var streetName = compose(map(_.prop('street')), safeHead, _.prop('addresses'));

streetName({addresses: []});
// Maybe(null)

streetName({addresses: [{street: "Shady Ln.", number: 4201}]});
// Maybe("Shady Ln.")
```

`safeHead` é como nosso `_.head`, mas de uma forma mais segura. Uma coisa curiosa acontece quando indroduzimos `Maybe` dentro de nosso código; somos forçados a lidar com esses sorrateiros valores `null`. A função `safeHead` é honesta e olha na frente sobre uma possível falha - não há nada para se envergonhar - então ela retorna um `Maybe` para informar-nos isso. Somos mais do que meramente *informados*, no entanto, devido a sermos forçados a usar `map` para pegar o valor que queremos, uma vez que o valor fica escondido dentro do objeto `Maybe`. Essencialmente, ela é um verificador de `null` imposta pela função `safeHead`. Agora podemos dormir tranquilos sabendo que o valor `null` não irá elevar sua horrorosa cabeça decapitada quando menos esperarmos. Apis como essas tornam aplicações do papel em aplicações reais e robustas, e ainda garantem um software seguro.

As vezes uma função pode retornar um `Maybe(null)` explicitamente para sinalizar uma falha. Por exemplo:

```js
//  withdraw :: Number -> Account -> Maybe(Account)
var withdraw = curry(function(amount, account) {
  return account.balance >= amount ?
    Maybe.of({balance: account.balance - amount})
    :
    Maybe.of(null);
});

//  finishTransaction :: Account -> String
var finishTransaction = compose(remainingBalance, updateLedger);

//  getTwenty :: Account -> Maybe(String)
var getTwenty = compose(map(finishTransaction), withdraw(20));



getTwenty({ balance: 200.00});
// Maybe("Your balance is $180.00")

getTwenty({ balance: 10.00});
// Maybe(null)
```

`withdraw` irá torcer o nariz para nós e retornar `Maibe(null)` se o dinheiro não for suficiente. Essa função também comunica sua inconstância e nos deixa sem escolha de continuar o `map`. A direfença é que `null` foi intencional aqui. Em vez de um `Maybe(String)`, nós recebemos um `Maybe(null)` como sinal de falha, e nossa aplicação efetivamente interrompe seu trajeto. É importante notar: se o `withdraw` falhar, então `map` irá cortar o resto do nosso cálculo uma vez que não irá mais executar a função passada, no caso a `finishTransaction`. Este é exatamente o comportamento que queremos, de não alterar nosso registro ou mostrar o novo balanço da conta.

## Liberando o Valor

Um coisa que as pessoas geralmente esquecem, é que sempre haverá um final da linha; alguma função que envia um JSON, imprime na tela, altera nosso filesystem ou qualquer outra coisa. Não podemos entregar uma saída com `return`, devemos executar alguma função ou outra para enviar para o mundo exterior. Podemos nos expressar como no koan Zen Budista: "Se um programa não possui nenhum efeito observável, ele de fato executa?". Ele executa corretamente para sua própria satisfação? Suspeito que meramente executa alguns ciclos e depois volta a dormir...

O trabalho de nossa aplicação é de recuperar, transformar e carregar dados até a hora de dizer adeus, e a função que faz isso pode ser mapeada, assim o valor não precisa deixar o aconchego do seu container. De fato, um erro comum é tentar remover o valor de `Maybe` de uma forma ou de outra, como se o possível valor de dentro dela de repente se materializasse e tudo ficaria bem. Temos que endenter que isso pode ser uma parte de código onde nosso valor não foi feito para esse fim. Nosso código parece mais com gato de Schrödinger, ou seja, dois estados ao mesmo tempo, e deve manter esse fato até o final da função. Isso faz com que nosso código fique em um fluxo linear independente da lógica aplicada.

Existe uma alternativa. Se prefere retornar um valor customizado e continuar, podemos usar um pequeno helper chamado `maybe`.


```js
//  maybe :: b -> (a -> b) -> Maybe a -> b
var maybe = curry(function(x, f, m) {
  return m.isNothing() ? x : f(m.__value);
});

//  getTwenty :: Account -> String
var getTwenty = compose(
  maybe("You're broke!", finishTransaction), withdraw(20)
);


getTwenty({ balance: 200.00});
// "Your balance is $180.00"

getTwenty({ balance: 10.00});
// "You're broke!"
```
Iremos agora retornar um valor estático (do mesmo tipo que `finishTransaction` retorna) ou finalizar a transação sem usar `Maybe`. Com `maybe` estamos fazendo o equivalente a um `if/else` enquanto que com `map` a analogia imperativa seria: `if(x !== null) { return f(x) }`.

A introdução de `Maybe` pode causar algum desconforto no começo. Usuários de Swift e Scale vão saber do que estou falando pois essas linguagens possuem uma implementação na forma de `Option(al)`. Quando tem que lidar com verificações de `null` todo tempo(e tem vezes que sabemos com absoluta certeza que o valor existe), e muitas pessoas acham isso muito trabalhoso. Seja como for, com tempo isso vai ficando mais natural e você irá provavelmente gostar da segurança que isso traz. Afinal, na maioria das vezes isso irá prevenir problemas no código e salvar nossas peles.

Escrever código inseguro é como ter o trabalho de pintar e decorar ovos, para depois atirá-los no meio da rua; ou construir casas como o material que os três porquinhos construiram. Nos fará muito bem colocar segurança em nossas funções, e `Maybe` nos ajuda exatamente com isso.

Eu seria muito negligente se não mencionasse que em uma implementação "real", `Maybe` é dividido em duas partes: uma para algo e outra para nada. Isso nos permite obedecer a parametrização do `map`, então valores como `null` e `undefined` podem ainda ser mapeados, e a qualificação universal de valores de um functor serão respeitados. Você frequentemente verá tipos como `Some(x) / None` ou `Just(x) / Nothing` em vez de um `Maybe` que faz uma verificação de `null` no seu valor.

## Tratadores de Errors Puros

<img src="images/fists.jpg" alt="pick a hand... need a reference" />

Pode ser um choque, mas `throw/catch` não são muito puros. Quando um erro é lançado, em vez de retornar um valor de saída, nós disparamos os alarmes! A função ataca lançando milhares de 0's e 1's como escudos e lanças em uma frenética batalha contra nossa entrada. Com nosso novo amigo `Either`, podemos fazer melhor do que declarar guerra contra a entrada, podemos responder com uma mensagem educada. Vamos dar uma olhada.

```js
var Left = function(x) {
  this.__value = x;
}

Left.of = function(x) {
  return new Left(x);
}

Left.prototype.map = function(f) {
  return this;
}

var Right = function(x) {
  this.__value = x;
}

Right.of = function(x) {
  return new Right(x);
}

Right.prototype.map = function(f) {
  return Right.of(f(this.__value));
}
```

`Left` e `Right` são duas subclasses de um tipo abstrato que chamamos de `Either`. Não fiz cerimônias de como criar a superclasse `Either` já que não iremos usá-la, mas é bom saber disso. Não tem nada novo aqui além dos dois tipos. Vamos ver como eles agem:

```js
Right.of("rain").map(function(str){ return "b"+str; });
// Right("brain")

Left.of("rain").map(function(str){ return "b"+str; });
// Left("rain")

Right.of({host: 'localhost', port: 80}).map(_.prop('host'));
// Right('localhost')

Left.of("rolls eyes...").map(_.prop("host"));
// Left('rolls eyes...')
```

`Left` é um adolescente problematico que ignora nossa chamada ao `map`. `Right` irá funcionar como `Container` (a.k.a Identity). A vantagem aqui é de poder incorporar uma mensagem de erro dentro de `Left`.

Imagine que temos uma função que não será bem sucedida. Que tal calcularmos uma idade a partir de uma data de aniversário. Podemos usar `Maybe(null)` para sinalizar uma falha em nosso programa, o que não nos diz muito. Talvez queiramos saber o motivo da falha, Vamos escrever isso usando `Either`.

```js
var moment = require('moment');

//  getAge :: Date -> User -> Either(String, Number)
var getAge = curry(function(now, user) {
  var birthdate = moment(user.birthdate, 'YYYY-MM-DD');
  if(!birthdate.isValid()) return Left.of("Birth date could not be parsed");
  return Right.of(now.diff(birthdate, 'years'));
});

getAge(moment(), {birthdate: '2005-12-12'});
// Right(9)

getAge(moment(), {birthdate: '20010704'});
// Left("Birth date could not be parsed")
```

Agora, como `Maybe(null)`, estamos criando um curto circuito quando retornamos `Left`. A diferença, é que agora temos uma pista do porque nosso programa se perdeu. Algo a notar é que retornamos `Either(String, Number)`, que recebe a `String` para `Left` e o `Number` para `Right`. Esse tipo de assinatura é um pouco informal já que não tivemos muito tempo para definir um real `Either`, mas aprendemos bastante com esse tipo. Isso também nos informa que estamos pegando um mensagem de erro ou a idade.

```js
//  fortune :: Number -> String
var fortune  = compose(concat("If you survive, you will be "), add(1));

//  zoltar :: User -> Either(String, _)
var zoltar = compose(map(console.log), map(fortune), getAge(moment()));

zoltar({birthdate: '2005-12-12'});
// "If you survive, you will be 10"
// Right(undefined)

zoltar({birthdate: 'balloons!'});
// Left("Birth date could not be parsed")
```

Quando `birthdate` é válido, o programa mostra na tela o seu maior segredo (sua idade). Senão mostrará o `Left` com uma mensagem de erro clara como a luz do dia, mas ainda dentro do seu container. Então nos mostra um erro, mas de uma forma calma e educada, diferente de uma criança que perde o controle quando as coisas dão errado pra ela.

Neste exemplo, estamos logicamente dividindo nosso fluxo de controle dependendo da validade da data de nascimento, e ainda sim estamos nos movendo de forma linear da direita para esquerda, e não escalando através das chaves de instruções condicionais. Normalmente movemos o `console.log` para fora da função `zoltar` a damos `map` no momento da chamada, e isso é útil para ver como a parte `Right` se difere. Nós usamos `_` no tipo de assinatura direita para indicar que há um valor que deve ser ignorado[Em alguns navegadores você terá que usar `console.log.bin(console)` para usá-lo como sendo de primeira classe].

Gostaria de usar essa oportunidades para apontar algo que pode ser que você tenha perdido: `fortune` apesar de usar `Either` neste exemplo, não tem conhecimento sobre a presença de algum functor. Esse é o caso com `finishTransaction` no exemplo anterior. Quando chamada, uma função pode ser envolvida por `map` e transforma uma função não functor, em um functor. E esse processo é chamado de *lifting*. Funções tendem a trabalhar melhor com tipos normais de dados em vez de tipos container, portanto quando preciso, é feito o *lifting* dentro de um container adequado. Isso trás simplicidade e torna as funções mais reusáveis podendo serem alteradas para trabalhar com qualquer tipo de functor sobre demanda.

`Either` é ótima para erros comuns como validações mas também para coisas mais sérias, como interromper erros de execução de arquivos ausentes (missing files) ou problemas de conexão de sockets. Tente substituir alguns dos exemplos com `Maybe` por `Either` para obter melhor resultado.

Posso ter cometido um equívoco em introduzir `Either` como um mero container de mensagens de erros. Ele representa a disjunção lógica `OR` (a.k.a `||`) em um tipo. Também codifica a idéia de um *Coproduct* da teoria das categorias, do qual não falaremos neste livro, mas vale a pena ler sobre, pois possui muitas propriedades a serem exploradas. Ele é um tipo de soma canónica disjuntiva (soma de produtos), isso porque o seu total de números de possíveis valores é contido em dois tipos de containers[^Sei que isso é um pouco difícil, então aqui está um [ótimo artigo](https://www.fpcomplete.com/school/to-infinity-and-beyond/pick-of-the-week/sum-types)]. Existem muitas coisas que `Either` pode fazer, mas como um functor, ele é usado para tratamento de erros.

O mesmo se dá com `Maybe`, nós temos um pequeno `either`, que se comporta semelhantemente, mas que leva duas funções em vez de apenas uma, e um valor estático. Cada função precisa retornar o mesmo tipo.

```js
//  either :: (a -> c) -> (b -> c) -> Either a b -> c
var either = curry(function(f, g, e) {
  switch(e.constructor) {
    case Left: return f(e.__value);
    case Right: return g(e.__value);
  }
});

//  zoltar :: User -> _
var zoltar = compose(console.log, either(id, fortune), getAge(moment()));

zoltar({birthdate: '2005-12-12'});
// "If you survive, you will be 10"
// undefined

zoltar({birthdate: 'balloons!'});
// "Birth date could not be parsed"
// undefined
```

Finalmente, um uso para aquela misteriosa função `id`. Ela simplesmente retorna um `Left` para passar a mensagem de erro ao `console.log`. Tornamos nossa aplicação mais robusta forçando um tratamento de erro com `getAge`. We either slap the user with a hard truth like a high five from a palm reader or we carry on with our process. E com isso, estamos preparados oara seguir a diante para um tipo completamente diferente de functor.

## O Velho McDonald tinha Efeitos...

<img src="images/dominoes.jpg" alt="dominoes.. need a reference" />

No capítulo sobre pureza vimos um exemplo peculiar de uma função pura. Essa função continha um efeito colateral(side-effect), mas nós a tornamos pura envolvendo sua ação em outra função. Aqui temos outro exemplo disso:

```js
//  getFromStorage :: String -> (_ -> String)
var getFromStorage = function(key) {
  return function() {
    return localStorage[key];
  }
}
```

Se não tivéssemos envolvido `getFromStorage` em outra função, a mesma poderia mudar sua saída por depender de circunstâncias externas. Colocando outra função, sempre teremos a mesma saída dada uma mesma entrada: uma função que quando chamada, recupera um item do `localStorage`. E dessa forma(quem sabe com mais alguns Ave-Marias) ficamos com a conciência tranquila e com os nossos pecados perdoados.


Mas, isso não é muito útil. Pois é como um boneco de brinquedo dentro de seu pacote original, não podemos brincar com ele. Se houvesse uma forma de atingir o interior de um container e pegar o seu conteúdo...esse é `IO`:


```js
var IO = function(f) {
  this.__value = f;
}

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
}

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.__value));
}
```

`IO` é diferente dos demais functors anteriores por o `__value` ser sempre uma função. Não vemos `__value` como uma função, entretanto - este é um detalhe de implementação e é melhor ignorarmos isso. O que está acontecendo é exatamente o que vimos no exemplo `getFromStorage`: `IO` atrasa a ação impura envolvendo a mesma em uma função. Portanto pensamos em `IO` como contendo o valor de retorno de uma ação envolvida, e não propriamente uma função que foi envolvida. Isso fica mais visível na função `of`: Nós temos um `IO(x)`, o `IO(function(){ return x })` é necessário apenas para atrasar a execução.

Vamos ver isso em ação:

```js
//  io_window_ :: IO Window
var io_window = new IO(function(){ return window; });

io_window.map(function(win){ return win.innerWidth });
// IO(1430)

io_window.map(_.prop('location')).map(_.prop('href')).map(split('/'));
// IO(["http:", "", "localhost:8000", "blog", "posts"])


//  $ :: String -> IO [DOM]
var $ = function(selector) {
  return new IO(function(){ return document.querySelectorAll(selector); });
}

$('#myDiv').map(head).map(function(div){ return div.innerHTML; });
// IO('I am some inner html')
```

Aqui `io_window` é um real `IO` que podemos usar `map` diretamente, onde `$` é uma função que retorna um `IO` depois de ser chamada. Escrevi um valor de retorno *conceitual* para melhor entendimento do `IO`, embora na realidade ele sempre será um `{ __value: [Function] }`. Quando usamos o `map` de nosso `IO`, mantemos a função no final da composição onde a mesma se torna um novo `__value` a assim por diante. Nossa função mapeada não executa, ela fica anexada no final da execução da pilha, função por função como peças de dominó cuidadosamente colocadas, das quais ninguém ousa derrubar. O resultado é uma lembrança dos padrões de comandos(command pattern) ou uma fila(queue), propostas pela Gang of Four (Nota do tradutor: autores do livro "Design Patterns")

Tire um tempo para canalizar sua intuição functor. Se vermos a fundo os detalhes da implementação, nos sentiremos em casa mapeando qualquer tipo de container independente de sua pecualiriedade. Temos as leis do functor das quais iremos explorar no final do capítulo, para agradecer por esse super poder psíquico. De qualquer forma, finalmente podemos trabalhar com valores impuros sem sacrificar nossa preciosa pureza.

Agora, prendemos a besta numa jaula, mas teremos que deixá-la livre em alguns pontos. Quando nosso `IO` é mapeado, são criadas várias operações inpuras onde executá-las é realmente uma perturbação da paz. Então quando é o momento certo de soltá-las ? É mesmo possível executar nosso `IO` a ainda sim entrar de vestido branco no casamento? A resposta é sim, se colocarmos o ônus na chamada do código. Nosso código puro, apesar da trama nefasta e das intrigas, se mantém inocente e é o que chama e fica com toda responsabilidade de executar os efeitos. Vamos ver um exemplo para tornar isso concreto.

```js

////// Our pure library: lib/params.js ///////

//  url :: IO String
var url = new IO(function() { return window.location.href; });

//  toPairs =  String -> [[String]]
var toPairs = compose(map(split('=')), split('&'));

//  params :: String -> [[String]]
var params = compose(toPairs, last, split('?'));

//  findParam :: String -> IO Maybe [String]
var findParam = function(key) {
  return map(compose(Maybe.of, filter(compose(eq(key), head)), params), url);
};

////// Impure calling code: main.js ///////

// run it by calling __value()!
findParam("searchTerm").__value();
// Maybe(['searchTerm', 'wafflehouse'])
```
Nossa bibliotera fica de mãos limpas ao envolver a `url` em um `IO` e passando a responsabilidade para quem chama a função. Você precisa saber que empilhamos nossos containers; ter um `IO(Maybe([x]))` é perfeitamente aceitável, pois são três profundos functors(^`Array` é definitivamente um tipo de container mapeável) e extremamente expressivos.


Existem algo que está me incomodando e deveríamos nos acertar imediatamente: O `__value` de `IO` não é realmente um valor contido, também não é uma propriedade privada como o underscore propoe. Ele é o pino de uma granada que deve ser puxado por aquele que o chama de uma maneira mais pública possível. Vamos renomear essa propriedade para `unsafePerformIO` para lembrar nossos usuários de sua volatilidade.

```js
var IO = function(f) {
  this.unsafePerformIO = f;
}

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.unsafePerformIO));
}
```

Bem melhor. Agora nosso código de chamada fica sendo `findParam("searchTerm").unsafePerformIO()`, que fica claro como o dia
para nossos usuários(e leitores) da aplicação.

`IO` será um fiél companheiro, nos ajudando a domar essas selvagens e inpuras ações. A seguir, iremos ver um tipo similar em espírito, mas que é usado de uma forma extremamente diferente.

## Tarefas Assíncronas

Callbacks são a escada espiral para o inferno. Eles são fluxos de controle como os designs do artista gráfico M.C. Escher. Com cada callback aninhado e espremido entre os emaranhados de parênteses e chaves, eles se sentem como prisioneiros numa masmorra(o quão longe podemos ir?). Estou com calafrios só de pensar neles. Não vamos temer, temos um caminho bem melhor de lidar com código assíncrono e esse caminho começa com a letra "F".

O mecanismo interno dessa abordagem é um pouco complicado para colocarmos toda nesta página, portanto usaremos `Data.Task` (anteriormente `Data.Future`) de Quildreen Motta, a fantástica [Folktale](http://folktalejs.org/). Alguns exemplos de uso:

```js
// Node readfile example:
//=======================

var fs = require('fs');

//  readFile :: String -> Task(Error, JSON)
var readFile = function(filename) {
  return new Task(function(reject, result) {
    fs.readFile(filename, 'utf-8', function(err, data) {
      err ? reject(err) : result(data);
    });
  });
};

readFile("metamorphosis").map(split('\n')).map(head);
// Task("One morning, as Gregor Samsa was waking up from anxious dreams, he discovered that
// in bed he had been changed into a monstrous verminous bug.")


// Exemplo com jQuery getJSON:
//========================

//  getJSON :: String -> {} -> Task(Error, JSON)
var getJSON = curry(function(url, params) {
  return new Task(function(reject, result) {
    $.getJSON(url, params, result).fail(reject);
  });
});

getJSON('/video', {id: 10}).map(_.prop('title'));
// Task("Family Matters ep 15")

// Podemos colocar valores comuns também
Task.of(3).map(function(three){ return three + 1 });
// Task(4)
```

A função que estou chamando `reject` e `result`, são nossos callbacks de error e success nesta ordem. Como pode ver, simplesmente damos um `map` em `Task` para trabalhar com valores futuros como se eles já estivessem disponíveis. By now `map` should be old hat.

Se você está acostumado com promises, já entendeu que a função `map` é o `then` em `Task`, fazendo o papel de nossa promise. Não se preocupe se você não conhece promises, não iremos usá-las em nenhum lugar porque elas são inpuras, mas a analogia é válida.

Como `IO`, `Task` irá pacientemente esperar para executar, até que nós demos a luz verde. De fato, devido `Task` esperar por nosso comando, `IO` é efetivamente envolvido por `Task` para todas coisas assíncronas; `readFile` e `getJSON` não necessitam de um container `IO` a mais para serem puros. Além do mais, `Task` trabalha de forma similar quando usamos `map` sobre ela: Estamos colocando instruções para serem executadas no futuro como uma lista de tarefas em uma máquina do tempo - uma sofisticada forma tecnológica de procrastinação.

Para executar nossa `Task`, devemos chamar o método `fork`. Isso funciona como `unsafePerformIO`, mas como o nome sugere, isso irá pegar uma parte do processo e a avaliação continua sem bloquear a thread. Isso pode ser implementado de várias formas com thread e tal, mas aqui ele age como uma chamada normal assíncrona deveria agir, e a grande roda de eventos continua a girar. Vamos ver o `fork`:

```js
// Aplicação Pura
//=====================
// blogTemplate :: String

//  blogPage :: Posts -> HTML
var blogPage = Handlebars.compile(blogTemplate);

//  renderPage :: Posts -> HTML
var renderPage = compose(blogPage, sortBy('date'));

//  blog :: Params -> Task(Error, HTML)
var blog = compose(map(renderPage), getJSON('/posts'));


// Chando um código Impuro
//=====================
blog({}).fork(
  function(error){ $("#error").html(error.message); },
  function(page){ $("#main").html(page); }
);

$('#spinner').show();
```

Invocando `fork`, `Task` se apressa para encontrar alguns posts e mostrar na página. Enquanto isso nós mostramos um spinner("carregando") já que `fork` não espera por uma resposta. Finalmente, iremos ou mostrar um erro ou renderizar a página dependendo se o `getJSON` for bem sucedido ou não.

Tire um momento para considerar o quanto linear é nosso fluxo de controle aqui. Nós apenas lemos de baixo para cima, da direita para esquerda, mesmo que o programa faça alguns pulos na execução. Isso faz com que a leitura e raciocínio sobre a aplicação fique mais simples do que ter de saltar entre callbacks e blocos de tratamento de erros.

Meu Deus, você viu que `Task` também engoliu `Either`! E deve ser assim, porque para lidar com futuras falhas, já que nosso normal fluxo de controle não se aplica no mundo assíncrono. Isso tudo é muito bom, pois nos proporciona suficientes e puros tratadores de erros.

Mesmo com `Task`, nossas funções `IO` e `Either` não ficam de fora do trabalho. Vem comigo para ver um rápido exemplo que é um lado mais complexo e hipotético, mas que é útil como forma de ilustração.

```js
// Postgres.connect :: Url -> IO DbConnection
// runQuery :: DbConnection -> ResultSet
// readFile :: String -> Task Error String

// Aplicação Pura
//=====================

//  dbUrl :: Config -> Either Error Url
var dbUrl = function(c) {
  return (c.uname && c.pass && c.host && c.db)
    ? Right.of("db:pg://"+c.uname+":"+c.pass+"@"+c.host+"5432/"+c.db)
    : Left.of(Error("Invalid config!"));
}

//  connectDb :: Config -> Either Error (IO DbConnection)
var connectDb = compose(map(Postgres.connect), dbUrl);

//  getConfig :: Filename -> Task Error (Either Error (IO DbConnection))
var getConfig = compose(map(compose(connectDB, JSON.parse)), readFile);


// Chamada de código Impuro
//=====================
getConfig("db.json").fork(
  logErr("couldn't read file"), either(console.log, map(runQuery))
);
```

Neste exemplo, continuamos fazendo uso de `Either` e `IO` na parte de sucesso de `readFile`. `Task` toma conta das impurezas de ler um arquivo assincronamente, mas ainda temos que lidar com a validação do config com `Either` e disputar com `IO` a conexão do db. Como você pode ver, ainda sim continuamos a lidar com todas coisas síncronas.

Eu poderia continuar, mas isso é tudo. Simples como um `map`.

Na prática, você provavelmente terá várias tarefas assíncronas em um fluxo de trabalho, e nós ainda não temos conhecimento de todas api containers para enfrentar esse cenário. Não tema, vamos ver monads em breve, mas primeiro, devemos examinar a matemática que torna isso possível.

## Um Pouco de Teoria

Como mencionado antes, functors tem sua origem da teoria das categorias e satisfazem algumas leis. Primeiro vamos explorar algumas propriedades úteis.

```js
// identidade - identity
map(id) === id;

// composição - composition
compose(map(f), map(g)) === map(compose(f, g));
```

A lei da *identidade* é simples mas importante. Essas leis podem ser executadadas em nosso código portanto vamos testá-las em nossos functors para validar sua legitimidade

```js
var idLaw1 = map(id);
var idLaw2 = id;

idLaw1(Container.of(2));
//=> Container(2)

idLaw2(Container.of(2));
//=> Container(2)
```
Você viu, elas são iguais. Vamos ver agora a composição.

```js
var compLaw1 = compose(map(concat(" world")), map(concat(" cruel")));
var compLaw2 = map(compose(concat(" world"), concat(" cruel")));

compLaw1(Container.of("Goodbye"));
//=> Container('Goodbye cruel world')

compLaw2(Container.of("Goodbye"));
//=> Container('Goodbye cruel world')
```

Nas teoria das categorias, functors levam os objetos e morfismos de categoria, e mapeiam elas para uma diferente categoria. Por definição, essa nova categoria deve possuir uma identidade e a habilidade de compor mosfismo, mas não necessitamos verificar isso pois as leis mencionadas acima garantem o mesmo.

Talvez nossa definição de uma categoria ainda esteja um pouco confusa. Você pode pensar em uma categoria como uma rede de objetos onde a conexão é feita através de morfismo. Portanto um functor mapeia uma categoria para outra sem quebrar a rede. Se um objeto `a` está em nossa categoria de código `C`, e então a mapeamos para uma categoria `D` com um functor `F`, nos referimos esse objeto como `F a` (Se você colocá-los juntos, o que isso significa?!). De repente é melhor darmos uma olhada no diagrama:

<img src="images/catmap.png" alt="Categories mapped" />

Por exemplo, `Maybe` mapeia nossa categoria de tipos e funções para uma categoria onde cada objeto pode não existir e cada morfismo possui uma verificação `null`. Nós conseguimos isso no código envolvendo cada função com `map` e cada tipo com nosso functor. Sabemos que cada um de nossos tipos e funções, continuarão a compor nesse novo mundo. Tecnicamente, cada functor em nosso código, mapeia para uma sub-categoria de tipos e funções, das quais torna todo functor uma marca específica chamada endofunctor, mas para o que queremos pensaremos nisso como uma diferente categoria.

Podemos também visualizar o mapeamento de um morfismo e seus objetos correspondentes, como esse diagrama.

<img src="images/functormap.png" alt="functor diagram" />

Além de visualizar o morfismo mapeado a partir de uma categoria para outra sob o functor `F`, vemos que o diagrama sofre uma comutação, que no caso se você seguir as setas, cada rota produz o mesmo resultado. As diferentes rotas significam diferentes comportamentos, mas sempre terminamos com o mesmo tipo. Esse formalismo nos dá princípios na forma de pensar em nosso código - podemos sem medo aplicar fórmulas sem ter que analisar individualmente cada um dos cenários. Vamos ver um exemplo concreto.

```js
//  topRoute :: String -> Maybe(String)
var topRoute = compose(Maybe.of, reverse);

//  bottomRoute :: String -> Maybe(String)
var bottomRoute = compose(map(reverse), Maybe.of);


topRoute("hi");
// Maybe("ih")

bottomRoute("hi");
// Maybe("ih")
```

Ou visualmente:

<img src="images/functormapmaybe.png" alt="functor diagram 2" />

Podemos instantâneamente ver uma refatoração de código baseado em propriedades detidas por todos os functors.

Functors podem empilhar:

```js
var nested = Task.of([Right.of("pillows"), Left.of("no sleep for you")]);

map(map(map(toUpperCase)), nested);
// Task([Right("PILLOWS"), Left("no sleep for you")])
```

O que temos em `nested` é um futuro array de elementos que poderiam ser erros. Damos `map` em cada camada e executamos nossa função nesses elementos. Não vemos callbacks, if/else ou for loops; apenas um contexto explícito. Temos no entanto que ter que dar `map(map(map(f)))`. Podemos em vez disso compor funções. Você me ouviu bem:

```js
var Compose = function(f_g_x){
  this.getCompose = f_g_x;
}

Compose.prototype.map = function(f){
  return new Compose(map(map(f), this.getCompose));
}

var tmd = Task.of(Maybe.of("Rock over London"))

var ctmd = new Compose(tmd);

map(concat(", rock on, Chicago"), ctmd);
// Compose(Task(Maybe("Rock over London, rock on, Chicago")))

ctmd.getCompose;
// Task(Maybe("Rock over London, rock on, Chicago"))
```
Agora apenas um `map`. A composição de Functor é associativa e previamente definimos um `Container` que é atualmente chamado de o Functor `Identity`. Se temos uma identidade e uma composição associativa, então nós temos uma categoria. Essa categoria em particular tem categorias como objetos, e functors como morfismo, o que é suficiente para fritar o cérebro. Não iremos a fundo nisto, mas é bom apreciar as implicações desta arquitetura ou apreciar a beleza de sua simples abstração.

## Em Resumo

Vemos alguns diferentes tipos de functor, mas existem uma infinidade deles. Alguns que não mencionamos são muito notáveis, como as estruturas de dados iteráveis como trees, lists, maps, pairs e você mesmo pode criá-los. Outros podem ser encapsulados ou até mesmo apenas um modelo de tipos. Functors estão em nossa volta e iremos usá-los muito neste livro.

O que acha de chamar uma função com multiplos functors como argumento? O que acha de trabalhar uma sequencia ordenada de ações assíncronas ou impuras? Não temos ainda todas ferramentas necessárias para trabalhar neste mundo específico. Agora, vamos ir direto ao ponto e ver o que são monads.

[Capítulo 9: Monads](ch9-pt-BR.md)

## Exercícios

```js
require('../../support');
var Task = require('data.task');
var _ = require('ramda');

// Exercício 1
// ==========
// Use _.add(x,y) e _.map(f,x) para criar uma função que incrementa
// um valor dentro de um functor

var ex1 = undefined



// Exercício 2
// ==========
// Use _.head para pegar o primeiro elemento desta lista
var xs = Identity.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);

var ex2 = undefined



// Exercício 3
// ==========
// Use safeProp e _.head para encontrar a primeira letra do nome do usuário
var safeProp = _.curry(function (x, o) { return Maybe.of(o[x]); });

var user = { id: 2, name: "Albert" };

var ex3 = undefined


// Exercício 4
// ==========
// Use Maybe para reescrever ex4 sem usar if

var ex4 = function (n) {
  if (n) { return parseInt(n); }
};

var ex4 = undefined



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
}

var ex5 = undefined



// Exercício 6
// ==========
// Escreva uma função que use checkActive() e showWelcome() para um acesso válido (grant access)
// ou retorne um erro

var showWelcome = _.compose(_.add( "Welcome "), _.prop('name'))

var checkActive = function(user) {
 return user.active ? Right.of(user) : Left.of('Your account is not active')
}

var ex6 = undefined



// Exercício 7
// ==========
// Escreva uma função de validação que cheque um tamanho > 3. E deve retornar
// Right(x) se for maios que 3 Left("You need > 3") caso contrário

var ex7 = function(x) {
  return undefined // <--- me escreva. (não seja estilo pointfree)
}



// Exercício 8
// ==========
// Use o ex7 acima e Either como um functor para salvar o usuário se ele for válido, ou
// retorne uma mensagem de erro. Lembre-se que dois argumentos em either deve returnar
// o mesmo tipo.

var save = function(x){
  return new IO(function(){
    console.log("SAVED USER!");
    return x + '-saved';
  });
}

var ex8 = undefined
```
