# Monadic Onions

## Pointy Functor Factory

Antes de seguirmos adiante, tenho uma confisão a fazer: Eu não tenho sido totalmente honesto sobre esse método `of` que  temos colocado em cada um de nossos tipos. O que acontece é que ele não está lá apenas para evitar o `new`, mas para colocar valores no que chamamos de *default minimal context*  (contexto mínimo padrão). Sim, `of` atualmente não toma o lugar de um contrutor - ele é parte de uma importante interface que chamamos de *Pointed*.

> Um *pointed functor* é um functor com um método `of`

O importante aqui é a habilidade de colocar qualquer valor em nosso tipo e começar a mapear.

```js
IO.of("tetris").map(concat(" master"));
// IO("tetris master")

Maybe.of(1336).map(add(1));
// Maybe(1337)

Task.of([{id: 2}, {id: 3}]).map(_.prop('id'));
// Task([2,3])

Either.of("The past, present and future walk into a bar...").map(
  concat("it was tense.")
);
// Right("The past, present and future walk into a bar...it was tense.")
```

Lembrando que o construtor de `IO` e `Task`, espera uma função como argumento, mas `Maybe` e `Either` não.
A motivação para essa interface, é para um comum e consistente caminho para colocar um valor dentro de nosso functor, sem a complexidade e as específicas demandas dos construtores. O termo "default minimal context" ainda não é muito preciso, mas passa bem a idéia: Gostaríamos de colocar qualquer valor em nosso tipo e usar `map`, de forma trivial, como é o comportamento esperado de qualquer functor.

Uma importante correção que devo fazer agora, é que `Left.of` não faz nenhum sentido. Cada functor deve ter apenas um caminho para inserir um valor e com `Either`, que é um `new Right(x)`. Definimos `of` usando `Right` porque se nosso tipo *pode* usar `map`, então *deve* usar `map`.
Olhando os exemplos acima, já devemos ter a intuição de como `of` irá funcionar, e `Left` quebra esse modelo.

Você pode ter ouvido sobre funções como `pure`, `point`, `unit` e `return`. Esses são vários apelidos para nosso método `of`, "international function of mystery". O uso de `of` vai se tornando cada vez mais importante quando começamos a usar monads, o que veremos a seguir, porque é nossa a reponsabilidade colocar os valores de volta ao nosso tipo manualmente.

Existem vários truques ou bibliotécas em javascript para evitar o uso do `new`, então vamos já usá-las, e também usar `of` como sendo um adulto responsável daqui em diante. Eu recomendo usar uma instância de functor das bibliotecas `folktale`, `ramda` ou `fantasy-land` já que elas proporcionam um correto método `of` com construtores bacanas que não dependem de `new`.

## Mixing Metaphors

<img src="images/onion.png" alt="http://www.organicchemistry.com/wp-content/uploads/BPOCchapter6-6htm-41.png" />

Monads são como cebolas, me permita demostrar isso com uma situação comum:

```js
//  cat :: IO (IO String)
var cat = compose(map(print), readFile);

cat(".git/config")
// IO(IO("[core]\nrepositoryformatversion = 0\n"))
```

O que temos aqui é um `IO` preso dentro de outro `IO`. Para lidar com isso, temos que usar `map(map(f))`, e para observar o efeito, temos que usar `unsafePerformIO().unsafePerformIO()`. Embora seja legal vermos esses dois efeitos empacotados e prontos para serem usados em nossa aplicação, isso no entanto é como mexer em algo perigoso e que no fim ficamos apenas com uma API entranhamente desconfortável. Vamos ver outra situação:

```js
//  safeProp :: Key -> {Key: a} -> Maybe a
var safeProp = curry(function(x, obj) {
  return new Maybe(obj[x]);
});

//  safeHead :: [a] -> Maybe a
var safeHead = safeProp(0);

//  firstAddressStreet :: User -> Maybe (Maybe (Maybe Street) )
var firstAddressStreet = compose(
  map(map(safeProp('street'))), map(safeHead), safeProp('addresses')
);

firstAddressStreet(
  {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]}
);
// Maybe(Maybe(Maybe({name: 'Mulburry', number: 8402})))
```
Novamente vemos essa situação de um functor aninhado, o que é legal de ver que há três possíveis falhas em nossa função, mas é um pouco presunçoso de nossa parte esperar por três chamadas de `map` para pegar o valor. Esse padrão começará a ser mais frequente, então precisamo fazer brilhar símbolo do podereso monad sobre os céus escuros da noite.

Eu disse que monad são como cebolas, e isso porque lágrimas caem a cada camada que tiramos desses functors aninhados usando `map` para pegar o valor interno. Podemos enxugar nossas lágrimas, respirar fundo e usar um método chamado `join`.

```js
var mmo = Maybe.of(Maybe.of("nunchucks"));
// Maybe(Maybe("nunchucks"))

mmo.join();
// Maybe("nunchucks")

var ioio = IO.of(IO.of("pizza"));
// IO(IO("pizza"))

ioio.join()
// IO("pizza")

var ttt = Task.of(Task.of(Task.of("sewers")));
// Task(Task(Task("sewers")));

ttt.join()
// Task(Task("sewers"))
```

Se temos duas camadas do mesmo tipo, podemos uní-los com `join`. Essa habilidade de unir, é o que faz um monad um monad. Vamos avançar na definição com algo um pouco mais preciso.  

> Monads são pointed functors que podem achatar 

Qualquer functor que define um método `join`, possui um método `of` e obedece a algumas regras é um monad. Definir um `join` não é tão difícil, então vamos fazer um para `Maybe`:

```js
Maybe.prototype.join = function() {
  return this.isNothing() ? Maybe.of(null) : this.__value;
}
```

Se temos `Maybe(Maybe(x))`, então `.__value` irá apenas remover a camada desnecessária para que possamos dar o `map` diretamente. Pois caso contrário, teríamos apenas um `Maybe` sem que tenhamos nada para ser mapeado diretamente.

Agora que temos um método `join`, vamos jogar nosso pó mágico sobre o exemplo `firstAddressStreet`, e ver isso na prática. 

```js
//  join :: Monad m => m (m a) -> m a
var join = function(mma){ return mma.join(); }

//  firstAddressStreet :: User -> Maybe Street
var firstAddressStreet = compose(
  join, map(safeProp('street')), join, map(safeHead), safeProp('addresses')
);

firstAddressStreet(
  {addresses: [{street: {name: 'Mulburry', number: 8402}, postcode: "WC2N" }]}
);
// Maybe({name: 'Mulburry', number: 8402})
```
Colocamos um `join` nos lugares onde temos `Maybe`'s aninhados para deixá-lo sob controle. Vamos fazer o mesmo com `IO` para melhor compreensão.

```js
IO.prototype.join = function() {
  return this.unsafePerformIO();
}
```

Novamente, nós simplesmente removemos uma camada. Lembre-se, não estamos jogando fora a pureza, estamos apenas removendo uma camada que temos em excesso.

```js
//  log :: a -> IO a
var log = function(x) {
  return new IO(function() { console.log(x); return x; });
}

//  setStyle :: Selector -> CSSProps -> IO DOM
var setStyle = curry(function(sel, props) {
  return new IO(function() { return jQuery(sel).css(props); });
});

//  getItem :: String -> IO String
var getItem = function(key) {
  return new IO(function() { return localStorage.getItem(key); });
};

//  applyPreferences :: String -> IO DOM
var applyPreferences = compose(
  join, map(setStyle('#main')), join, map(log), map(JSON.parse), getItem
);


applyPreferences('preferences').unsafePerformIO();
// Object {backgroundColor: "green"}
// <div style="background-color: 'green'"/>
```

`getItem` retorna um `IO String` então damos um `map` para parseá-lo. Ambos `log` e `setStyle` retornam `IO`'s, portanto devemos usar `join` para deixá-los sob controle.

## Minha corrente bate em meu peito

<img src="images/chain.jpg" alt="chain" />

Você deve ter notado um padrão. Frequentemente acabamos chamando um `join` logo após um `map`. Vamos abstrair isso em uma função chamada `chain`.

```js
//  chain :: Monad m => (a -> m b) -> m a -> m b
var chain = curry(function(f, m){
  return m.map(f).join(); // ou compose(join, map(f))(m)
});
```

Apenas combinamos map/join em uma única função. Se você já leu algo sobre monads, deve ter visto `chain` como `>>=` (pronounced bind) ou `flatMap` que são apelidos para o mesmo conceito. Pessoalmente acho que `flatMap` é um nome mais apropriado, mas ficaremos com `chain` já que é o nome mais aceito na comunidade JS. Vamos refatorar os dois exemplos acima com `chain`:

```js
// map/join
var firstAddressStreet = compose(
  join, map(safeProp('street')), join, map(safeHead), safeProp('addresses')
);

// chain
var firstAddressStreet = compose(
  chain(safeProp('street')), chain(safeHead), safeProp('addresses')
);



// map/join
var applyPreferences = compose(
  join, map(setStyle('#main')), join, map(log), map(JSON.parse), getItem
);

// chain
var applyPreferences = compose(
  chain(setStyle), chain(log), map(JSON.parse), getItem
);
```

Troquei todo `map/join` com nossa nova função `chain` para organizar as coisas. Clareza é bom em tudo, mas `chain` faz mais do que podemos ver. Isso porque `chain` sem esforço possui alguns efeitos, no caso pode capturar *sequence* e *variable assignment* de uma forma puramente funcional.

```js
// getJSON :: Url -> Params -> Task JSON
// querySelector :: Selector -> IO DOM


getJSON('/authenticate', {username: 'stale', password: 'crackers'})
  .chain(function(user) {
    return getJSON('/friends', {user_id: user.id});
});
// Task([{name: 'Seimith', id: 14}, {name: 'Ric', id: 39}]);


querySelector("input.username").chain(function(uname) {
  return querySelector("input.email").chain(function(email) {
    return IO.of(
      "Welcome " + uname.value + " " + "prepare for spam at " + email.value
    );
  });
});
// IO("Welcome Olivia prepare for spam at olivia@tremorcontrol.net");


Maybe.of(3).chain(function(three) {
  return Maybe.of(2).map(add(three));
});
// Maybe(5);


Maybe.of(null).chain(safeProp('address')).chain(safeProp('street'));
// Maybe(null);
```

Poderíamos ter escrito esses exemplos com `compose`, mas precisaríamos de algumas funções auxiliares, e esse estilo requer uma assinatura de variável explicita através de uma closure de qualquer forma. Em vez disso, usamos uma versão digamos corrigida de `chain`, que propositalmente pode ser derivada de `map` e `join` de qualquer tipo automaticamente: `t.prototype.chain = function(f) { return this.map(f).join(); }`. Podemos também definir `chain` manualmente se quisermos um falso senso de performance, mas creio que devemos cuidar para manter a correta funcionalidade - que no caso é, um `map` seguido de um `join`. Um fato interessante é que podemos derivar `map` de graça se criarmos `chain`, simplesmente por colocar o valor de volta ao finalizar o processo com `of`. Com `chain`, podemos também definir `join` como `chain(id)`. Como muito da matemática, todos esses princípios estão interligados. Várias dessas derivações são mencionadas no repositório [fantasyland](https://github.com/fantasyland/fantasy-land), que é uma especificação oficial de tipos algébricos em Javascript.

Bom, vamos aos exemplos acima. o primeiro exemplo, nós vemos duas `Task`'s encadeadas em sequencias de ações assíncronas - primeiro é lido o `user`, depois procura os friends com o id do user. Usamos `chain` para evitar uma situação como `Task(Task([Friend]))`. 

Em seguida, usamos `querySelector` para encontrar alguma diferente entrada e criar uma mensagem de boas vindas. Observe como temos acesso a ambos `name` e` email` na função mais interna - isto é uma atribuição de variável de forma funcional no seu melhor estilo. Já que `IO` está graciosamente nos emprestando o seu valor, estamos encarregados de colocá-lo de volta da forma como o encontramos - nós não queremos quebrar a sua confiança (e nosso programa). `IO.of` é a ferramenta perfeita para o trabalho e é por isso que Pointed é um requisito importante para a interface Monad. No entanto, poderíamos escolher `map` já que também iria retornar o tipo correto:

```js
querySelector("input.username").chain(function(uname) {
  return querySelector("input.email").map(function(email) {
    return "Welcome " + uname.value + " prepare for spam at " + email.value;
  });
});
// IO("Welcome Olivia prepare for spam at olivia@tremorcontrol.net");
```

Finalmente, temos dois exemplos usando `Maybe`. Já que `chain` está mapeando por baixo dos panos, se algum valor é `null`, paramos de computar imediatamente.

Não se assuste se esses exemplos são um pouco difíceis de entender no primeiro momento. Dedique um tempo com eles. Tente aos poucos. Quebre-os em pedaços e remonte-os. Lembre-se de usar `map` quando for retornar um valor "normal", e use `chain` quando retornar outro functor.

Vale lembrar, isso não lida com dois diferentes tipos aninhados. Functor composition e logo, monad transformers, podem nos ajudar nas seguintes situações:

#Power trip

O estilo de programação em Containers pode ser confusos nos primeiro momento. As vezes ficamos confusos para saber quantos containers nosso valor está, e se usamos `map` ou `chain` (logo veremos outros métodos de containers). Podemos fortemente melhorar nosso debug com alguns truques como o de implementar `inspec`, e aprenderemos como criar uma "stack" que pode lidar com qualquer efeito lançado na mesma, mas existem situações que iremos questionar se vale a pena o esforço.

Gostaria de levantar a espada monadic de fogo por um momento, para demostrar o poder de programar desta forma.

Vamos ler um arquivo, e em seguida fazer upload diretamente:

```js
// readFile :: Filename -> Either String (Future Error String)
// httpPost :: String -> Future Error JSON

//  upload :: String -> Either String (Future Error JSON)
var upload = compose(map(chain(httpPost('/uploads'))), readFile);
```

Aqui, estamos separando nosso código várias vezes. Olhando pelo tipo de assinatura, posso ver que estamos nos protegendo de 3 erros - `readFile` usa `Either` para validar a entrada (quem sabe se certificando que o arquivo está presente), pode ocorrer um erro em `readFile` quando acessando o arquivo como expressado no primeiro tipo de parâmetro de `Future`, e o upload pode falhar por qualquer razão na qual é mostrado em `Future` no `httpPost`. Pegamos ao acaso duas ações sequenciais assíncronas com `chain`.

Tudo é realizado em um fluxo linear da esquerda para direita. Tudo isso é puro e declarativo. Isso mantém o raciocínio equacional e propriedades confiáveis. Nós não somos obrigados a adicionar nomes de variáveis desnecessárias e confusas. Nossa função `upload` foi escrita contra interfaces genéricas e apis não específicas.

Em contraste, vamos dar uma olhada numa forma imperativa para expor isso:

```js
//  upload :: String -> (String -> a) -> Void
var upload = function(filename, callback) {
  if(!filename) {
    throw "You need a filename!";
  } else {
    readFile(filename, function(err, contents) {
      if(err) throw err;
      httpPost(contents, function(err, json) {
        if(err) throw err;
        callback(json);
      });
    });
  }
}
```

Nossa, não é de fato uma aritmética dos infernos. Estamos nos batendo num labirinto volátil de loucura. Imagine isso sendo um típico app com variáveis mutáveis em todo momento! Estaríamos num poço de piche de fato.

#Teoria

A primeira lei que veremos é a associativa, mas provavelmente não da forma que você está acostumados a ver.

```js
  // associatividade
  compose(join, map(join)) == compose(join, join)
```

Essas leis estão relacionadas a natureza de monads, a associatividade com foco em unir primeiramente os tipos internos ou externos para conseguir chegar ao mesmo resultado. Uma imagem pode ser mais instrutiva:

<img src="images/monad_associativity.png" alt="monad associativity law" />

Começando de cima para esquerda, podemos usar `join` para extrair dois `M`'s de `M(M(M a))`, depois para alcançar nosso desejado `M a` usamos outro `join`. Outra alternativa é, podemos usar o conceito flatMap nos dois `M`s com `map(join)`. Iremos acabar com o mesmo `M a` independente se unirmos a parte interna ou externa do `M`s, e assim é como a associetividade de destaca aqui. Vale notar que `map(join) != join`. Os passos internos podem variar no valor, mas no resultado final do último `join` será sempre o mesmo.

A segunda lei é similar:

```js
  // indentidade para todo (M a)
  compose(join, of) == compose(join, map(of)) == id
```

Essa lei afirma que para qualquer monad `M`, `of` e `join` aponta para `id`. Podemos também usar `map(of)` e atacá-lo de dentro para fora. Chamamos isso de "identidade triângulo" porque é o que parece quando visualizada:

<img src="images/triangle_identity.png" alt="monad identity law" />

Se começarmos de cima para esquerda diretamente, podemose ver que `of` de fato remove nosso `M a` para outro `M` container. Então se nos movemos para baixo e damos `join`, resulta no mesmo se apenas chamassemos `id` de primeira. Se movendo da direita para esquerda usando `map` e chamar `of` em `a`, acabaremos também com `M (M a)`, e usando `join` nos levará de volta ao quadro um anterior.

Devo mencionar que apenas escrevi `of`, de qualquer modo, isso deve ser o `M.of` específico para qualquer monad que estamos usando.

Bom, eu ví essas leis, identidade e associetividade em algum lugar antes...Espere, deixe eu pensar...Sim é claro! Elas são as leis de uma categoria. Então isso significa que precisamos de uma função de composição para completar a definição. Observe:

```js
  var mcompose = function(f, g) {
    return compose(chain(f), chain(g));
  }

  // identidade a esquerda
  mcompose(M, f) == f

  // identidade a direita
  mcompose(f, M) == f

  // associatividade
  mcompose(mcompose(f, g), h) == mcompose(f, mcompose(g, h))
```

De fato elas são leis de categoria. Monads formam uma categoria chamada "Kleisli category" onde todos os objetos são monads e os morfismos são funções encadeadas. Não pretendo tentá-lo com bits e bobs da teoria das categorias sem antes explicar como todas essas peças se encaixam. A intenção é apenas arranhar a superficie o suficiente para mostrar sua relevância, e despertar algum interesse enquanto você se foca nas propriedades práticas que podemos usar no dia-a-dia.


## Em Resumo

Monads nos permite perfurar dentro de cálculos aninhados. Podemos assinar variáveis, executar efeitos sequenciais, executar tarefas assíncronas, de uma forma simples. Monads vêm para o resgate quando um valor encontra-se preso em múltiplas camadas do mesmo tipo. Com a ajuda do seu fiél companheiro "pointed", monads são capazes de nos emprestar um valor encapsulado, e sabe que quando estivermos prontos, devolveremos o valor novamente.

Sim, monads são muito poderosos, e nós ainda usando funções containers extras. Por exemplo, se queremos executar várias chamadas de api de uma vez só, e depois juntar os resultados? Podemos fazer isso com monads, mas teríamos que esperar a finalização de cada uma para seguir para a próxima. E se queremos combinar várias validações? Nós gostaríamos de continuar validando para depois pegar uma lista completa dos erros, mas monads iria nos parar na primeira aparição de um 	`Left`. 

No próximo capítulo, veremos como applicative functor se aplica dentro do mundo dos containers e porque nós preferimos ele do que monads em vários casos.

[Capítulo 10: Applicative Functors](ch10-pt-BR.md)


## Exercícios

```js
// Exercício 1
// ==========
// Use safeProp e map/join ou chain pegar se de forma segura o street name
// quando informado um user

var safeProp = _.curry(function (x, o) { return Maybe.of(o[x]); });
var user = {
  id: 2,
  name: "albert",
  address: {
    street: {
      number: 22,
      name: 'Walnut St'
    }
  }
};

var ex1 = undefined;


// Exercício 2
// ==========
// Use getFile para pegar o filename, remova o diretório deixe somente o file,
// então de forma pura faça o login.

var getFile = function() {
  return new IO(function(){ return __filename; });
}

var pureLog = function(x) {
  return new IO(function(){
    console.log(x);
    return 'logged ' + x;
  });
}

var ex2 = undefined;



// Exercício 3
// ==========
// Use getPost() depois passe o id dos post's para getComments().
//
var getPost = function(i) {
  return new Task(function (rej, res) {
    setTimeout(function () {
      res({ id: i, title: 'Love them tasks' });
    }, 300);
  });
}

var getComments = function(i) {
  return new Task(function (rej, res) {
    setTimeout(function () {
      res([
        {post_id: i, body: "This book should be illegal"},
        {post_id: i, body: "Monads are like smelly shallots"}
      ]);
    }, 300);
  });
}


var ex3 = undefined;


// Exercício 4
// ==========
// Use validateEmail, addToMailingList e emailBlast para implementar ex4's 
// tipo de assinatura

//  addToMailingList :: Email -> IO([Email])
var addToMailingList = (function(list){
  return function(email) {
    return new IO(function(){
      list.push(email);
      return list;
    });
  }
})([]);

function emailBlast(list) {
  return new IO(function(){
    return 'emailed: ' + list.join(',');
  });
}

var validateEmail = function(x){
  return x.match(/\S+@\S+\.\S+/) ? (new Right(x)) : (new Left('invalid email'));
}

//  ex4 :: Email -> Either String (IO String)
var ex4 = undefined;
```
