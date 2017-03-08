# Capítulo 2: Funções de Primeira Classe

## Revisão rápida

Quando dizemos que funções são de primeira classe (first class), significa que são como qualquer outra...classes normais [^como assim professor?]. Podem ser tratados como qualquer outro tipo de dado, não há nenhum comportamento em particular - pode ser um valor dentro de um array, pode ser um argumento de função, pode ser atribuido a uma variável...aquilo que precisar.

Isso é o básico do Javascript, mas se você procurar alguns códigos no github, verá a ignorância sobre esse conceito. Preciso lhe mostrar um exemplo? Claro, vamos lá!

```js
var hi = function(name){
  return "Hi " + name;
};

var greeting = function(name) {
  return hi(name);
};
```

Aqui a função `hi` atribuida na função `greeting` é completamente redundante. E porquê ? Em Javascript funções são *callable*, o que significa que podem ser invocadas ou não. Quando a `hi` está com `()` no final, ela vai ser chamada e retornar um valor. Caso contrário, simplesmente retorna a função que foi atribuída a ela.
Só para termos certeza, vamos dar uma olhadinha de novo.

```js
hi;
// function(name){
//  return "Hi " + name
// }

hi("jonas");
// "Hi jonas"
```

Já que `greeting` somente chama a função `hi` com o mesmo argumento, podemos escrever simplesmente assim:

```js
var greeting = hi;


greeting("times");
// "Hi times"
```

Em outras palavras, `hi` já é uma função que espera apenas um argumento, então porque inserir outra função para simplesmente chamar `hi` dentro dela com o mesmo maldito argumento? Isso não faz o menor sentido. É como você vestir seu casaco mais pesado apenas para ir comprar um sorvete.

Isso é verboso e uma má prática, colocar uma função dentro da outra somente para retardar sua avaliação. (Logo veremos esse caso, mas tem a ver com manuteção de código);

Entender bem essa parte antes de seguirmos é importantissímo, por isso vamos ver mais alguns exemplos divertidos que encontrei no npm modules.

```js
// ignorante
var getServerStuff = function(callback){
  return ajaxCall(function(json){
    return callback(json);
  });
};

// claro
var getServerStuff = ajaxCall;
```

O mundo está cheio de código ajax como este. Esta é a razão do porque os dois são equivalentes.

```js
// essa linha
return ajaxCall(function(json){
  return callback(json);
});

// faz a mesma coisa que essa
return ajaxCall(callback);

// então refatorando a getServerStuff ...
var getServerStuff = function(callback){
  return ajaxCall(callback);
};

// ... que é a mesma coisa que fazer isso
var getServerStuff = ajaxCall; // <-- Olha, sem os ()'s
```

E isso, amigos, é como geralmente é feito. Uma vez mais veremos porque eu sou tão insistente.

```js
var BlogController = (function() {
  var index = function(posts) {
    return Views.index(posts);
  };

  var show = function(post) {
    return Views.show(post);
  };

  var create = function(attrs) {
    return Db.create(attrs);
  };

  var update = function(post, attrs) {
    return Db.update(post, attrs);
  };

  var destroy = function(post) {
    return Db.destroy(post);
  };

  return {
    index: index, show: show, create: create, update: update, destroy: destroy
  };
})();
```
Esse controller rodículo é 99% "fru-fru". Nós podemos reescrever isso assim:

```js
var BlogController = {
  index: Views.index,
  show: Views.show,
  create: Db.create,
  update: Db.update,
  destroy: Db.destroy
};
```

... ou simplesmente não fazer nada, pois não fazem nada além de agrupar Views e Db.

## Porque a preferência por primeira classe?

OK, vamos dar uma olhada o porque da preferência por funções de primeira classe. Como vimos em `getServerStuff` e `BlogController`, é muito fácil colocarmos camadas enganosas que não tem valor algum a não ser deixar o código mais complexo e difícil de manter.

Além disso, se a função externa precisa ser alterada, temos que alterar a função interna.

```js
httpGet('/post/2', function(json){
  return renderPost(json);
});
```

Se `httpGet` foi alterada para enviar um possível `err` (erro), então teremos que alterar a função interna.

```js
// vamos ter que entrar em cada httpGet na aplicação e explicitamente passar a variável 'err'
httpGet('/post/2', function(json, err){
  return renderPost(json, err);
});
```

Se tivessemos escrito como uma função de primeira classe, muito menos código precisaria ser alterado.

```js
// renderPost é chamado através do httpGet com quantos argumentos forem necessários
httpGet('/post/2', renderPost);
```

Além de remover funções desnecessárias, temos a questão de nomes de argumentos. Nomes são um problema. Muitos nomes não fazem ou perdem o sentido, especialmente em códigos antigos/legados ou também conforme a aplicação cresce.

Um dos problemas que temos em muitos projetos, são muitos nomes diferentes para os mesmos conceitos. Existe a questão também de deixar o código mais genérico possível. Por exemplo, essas duas funções fazem a mesma coisa, mas uma delas é infinitamente mais genérica e com muito mais chance de ser reutilizável.

```js
// código específico para nosso blog
var validArticles = function(articles) {
  return articles.filter(function(article){
    return article !== null && article !== undefined;
  });
};

// muito mais relevante para o blog, e para futuros projetos
var compact = function(xs) {
  return xs.filter(function(x) {
    return x !== null && x !== undefined;
  });
};
```

Quando nomeamos coisas, a ligamos a um tipo de dado específico ( neste caso `articles` ). Isso acontece frequentemente, e isso é uma fonte de repetições.

Preciso te alertar que, pela natureza do Javascript ser orientado a objetos, você precisa prestar atenção no `this`, ele pode lhe morder no pescoço. Se uma função usa `this` e nós a invocamos como primeira classe, estamos sujeito e graves desilusões.

```js
var fs = require('fs');

// assustador
fs.readFile('freaky_friday.txt', Db.save);

// agora um pouco menos
fs.readFile('freaky_friday.txt', Db.save.bind(Db));

```

Ao usar `bind`, damos a possíbilidade de `Db` acessar seu próprio protótipo. Eu evito usar `this` como se fosse uma fralda suja. Isso não é necessário quando escrevermos código funcional. Entretanto, quando você usa outras bibliotecas, precisa saber lidar com o mundo maluco em torno de você.

Alguns vão dizer que `this` é necessário em termos de desempenho. Mas se você for do tipo micro-otimizadores, por favor, feche esse livro. Se você não conseguir seu dinheiro de volta, de repente possa trocá-lo por algo mais complicado.

Dito isto, estamos pronto para seguir em frente.

[Capítulo 3: Alegria Pura com Funções Puras](ch3-pt-BR.md)
