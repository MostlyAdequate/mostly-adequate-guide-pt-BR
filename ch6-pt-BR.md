# Capítulo 6: Exemplo de Aplicação

## Código Declarativo

Vamos mudar nossa metalidade. A partir de agora, vamos parar de dizer ao computador como fazer seu trabalho, ao invéz disso vamos escrever uma especificação do que queremos como resultado. Tenho certeza que achará muito menos estressante do que ficar tentando gerenciar tudo a todo tempo.

Declarativo, ao contrário de imperativo, o que significa que iremos escrever expressões, ao contrário de instruções passo a passo.

Pense no SQL. Não é "primeiro faça isso, então faça aquilo". Existe uma expressão que especifica o que queremos do banco da dados. Não decidimos como o trabalho será feito, ele faz. Quando o banco de dados é atualizado e o motor SQL otimizado, não temos que mudar nossa query. E isso porque existem muitas formas para interpretar nossa especificação e alcançar o mesmo resultado.

Para algumas pessoas, incluindo eu, é difícil entender o conceito de codificação declarativa de imediato, portanto vamos apontar alguns exemplos para sentirmos como é.

```js
// imperativo
var makes = [];
for (i = 0; i < cars.length; i++) {
  makes.push(cars[i].make);
}


// declarativo
var makes = cars.map(function(car){ return car.make; });
```

O laço imperativo precisa primeiro instanciar o array. O interpretador precisa avaliar essa declaração antes de seguir em frente. Em seguida,  ele diretamente percorre a lista de cars, aumentando manualmente um contador e nos mostra seus pedaços de uma forma vulgar de iteração explícita.

A versão `map` é uma expressão. Ele não requer nenhuma ordem de avaliação. Há muito mais liberdade aqui de como uma função map itera e como o array retornado pode ser montado. Isso especifica **oque**, não **como**. `map` usa a forma declarativa brilhante.

E além de ser mais clara e concisa, a função `map` pode ser otimizada à vontade e nosso precioso código não precisa mudar.

Para alguns de vocês que estão pensando "Sim, mas é muito mais rápido fazer o loop imperativo", eu sugiro que você se reeduque e veja como a JIT otimiza seu código. Aqui temos um [vídeo fantástico que pode te dar uma luz](https://www.youtube.com/watch?v=65-RbBwZQdU)

Aqui temos outro exemplo:

```js
// imperativo
var authenticate = function(form) {
  var user = toUser(form);
  return logIn(user);
};

// declarativo
var authenticate = compose(logIn, toUser);
```

Embora não haja necessariamente nada de errado com a versão imperativa, mas ainda existe uma avaliação de código passo a passo fritando nela. A expressão `compose` simplesmente declara um fato: A Autenticação é composição de `toUser` e `logIn`. Mais um vez, isso nós dá um espaço livre para suporte em alterações de código o que faz com que o código de nossa aplicação se torne uma especificação de alto nível.

Por não estarmos codificando em ordem de avaliação, o código declarativo presta-se para a computação paralela. Isso combinado com funções puras é o porque FP é uma boa opção para o futuro paralelo - não precisamos fazer nada de especial para alcançar sistemas paralos/concorrentes.

## Um flickr em programação funcional

Vamos agora construir um exemplo de aplicação de forma declarativa e com composição. Teremos ainda que lidar com alguns efeitos colaterais agora, mas vamos deixá-lo o mínimo possível e separá-lo da nossa base de código pura. Iremos criar um browser widget que consome imagens do flickr e mostra na tela. Vamos começar por partes nosso app. Aqui está o html:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
    <script src="flickr.js"></script>
  </head>
  <body></body>
</html>
```

E aqui o flickr.js:

```js
requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  }
});

require([
    'ramda',
    'jquery'
  ],
  function (_, $) {
    var trace = _.curry(function(tag, x) {
      console.log(tag, x);
      return x;
    });
    // app goes here
  });
```
Vamos usar [ramda](http://ramdajs.com) e vez de lodash ou qualquer outra biblioteca. Ramda inclui `compose`, `curry` e muito mais. Tenho usado requirejs, o que pode parecer um exagero, mas iremos usá-lo por todo livro e consistência é a chave. Também, já começei criando nossa função bacana `trace` para uma fácil depuração (debug).

Agora que isso está fora de nosso caminho, vamos para as especificações. Nosso app irá fazer 4 coisas.

1. Construir uma url para nosso termo de busca em particular
2. Fazer uma chamada para a api do flickr
3. Transformar a resposta json em imagens html
4. Mostra na tela

Existem 2 ações impuras mencionadas acima. Você consegue vê-los?
Esses pedaços que pegam os dados da api do flickr e colocam os mesmos na tela. Vamos definir eles primeiro então podemos colocá-los em quarentena.

```js
var Impure = {
  getJSON: _.curry(function(callback, url) {
    $.getJSON(url, callback);
  }),

  setHtml: _.curry(function(sel, html) {
    $(sel).html(html);
  })
};
```

Aqui nós apenas encapsulamos o métodos jQuery para ficarem `curried` e trocamos os argumentos para um posição favorável. Demos um namespace de `Impure` para que saibamos que são funções pegigosas. Em um próximo exemplo, vamos torná-los funções puras.

Agora temos que construir uma url para passar para nossa função `Impure.getJSON`.

```js
var url = function (term) {
  return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' +
    term + '&format=json&jsoncallback=?';
};
```

Existem formas fáceis e demasiadamente complexas de escrever nossa `url` no estilo **pointfree** usando monoids[^aprenderemos mais tarde] ou combinators. Escolhemos uma versão mais legível e montamos a string de uma forma comum (pointfull).

Vamos escrever uma função app que faz a chamada e coloca o conteúdo na tela.

```js
var app = _.compose(Impure.getJSON(trace("response")), url);

app("cats");
```

Isso chama nossa função `url`, então passa a string para nossa função `getJSON`, que está parcialmente aplicada com o `trace`. Carregando o app veremos a resposta da chamada da api no console.

<img src="images/console_ss.png"/>

Gostaríamos de construir nossas imagens fora deste json. Pois as srcs estão dentro de `items` e dentro de cada item dentro de `media` com a propriedade `m`.

de qualquer forma, para pegar essas propriedades aninhadas nós podemos usar uma função bacana da **ramda** chamada `_.prop()`. Segue uma versão para que você possa ver o que está acontecendo:

( Here's a homegrown version so you can see what's happening )

```js
var prop = _.curry(function(property, object){
  return object[property];
});
```

É um tanto chato. Nós apenas usamos a sintaxe `[]` para acessar a propriedade de qualquer objeto. Vamos usá-lo para pegar nossos srcs.

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var srcs = _.compose(_.map(mediaUrl), _.prop('items'));
```

Uma vez pego os `items`, devemos usar o `map` neles para extrair cada media url. Isso resulta em um array bacana de srcs. Vamos colocar em nosso app e imprimir eles na tela.

```js
var renderImages = _.compose(Impure.setHtml("body"), srcs);
var app = _.compose(Impure.getJSON(renderImages), url);
```

Tudo que fizemos foi criar um nova composição que irá chamar nossas `srcs` e colocá-las no corpo do html. Substituimos `trace` por `renderImages` agora que temos algo para renderizar além do json crú.
Isso irá grosseiramente mostrar nossos `srcs` diretamente no body.

Nosso último passo é mudar essas srcs em genuínas images. Numa aplicação grande, temos que usar alguma biblioteca template/dom como Handlebars ou React. Porém para essa aplicação, vamos apenas precisamos uma tag img, então vamos colocá-las usando jQuery.

```js
var img = function (url) {
  return $('<img />', { src: url });
};
```

O método `html()` do jQuery aceita um array de tags. Temos apenas que transformar nossos srcs em imagens e enviá-los para o `setHtml`.

```js
var images = _.compose(_.map(img), srcs);
var renderImages = _.compose(Impure.setHtml("body"), images);
var app = _.compose(Impure.getJSON(renderImages), url);
```

E terminamos!

<img src="images/cats_ss.png" />

Aqui está o código final:

```js
requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  }
});

require([
    'ramda',
    'jquery'
  ],
  function (_, $) {
    ////////////////////////////////////////////
    // Utils

    var Impure = {
      getJSON: _.curry(function(callback, url) {
        $.getJSON(url, callback);
      }),

      setHtml: _.curry(function(sel, html) {
        $(sel).html(html);
      })
    };

    var img = function (url) {
      return $('<img />', { src: url });
    };

    var trace = _.curry(function(tag, x) {
      console.log(tag, x);
      return x;
    });

    ////////////////////////////////////////////

    var url = function (t) {
      return 'http://api.flickr.com/services/feeds/photos_public.gne?tags=' +
        t + '&format=json&jsoncallback=?';
    };

    var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

    var srcs = _.compose(_.map(mediaUrl), _.prop('items'));

    var images = _.compose(_.map(img), srcs);

    var renderImages = _.compose(Impure.setHtml("body"), images);

    var app = _.compose(Impure.getJSON(renderImages), url);

    app("cats");
  });
```

Olhe isso. Uma linda especificação declarativa de **oque** as coisas são, não **como** elas são. Vemos agora cada linha como uma equação com propriedades que possuem. Podemos usar essas propriedades para pensar sobre nossa aplicação e a refatorar.

## Refatoração baseada em princípios

Existe uma otimização disponível - damos um map para passar por cada item para tranformá-lo em uma media url, depois outro map para passamos novamente nos srcs para transformá-los em tags img. Existe uma lei sobre o map e composição:

```js
// lei da composição map (map's composition law)
var law = compose(map(f), map(g)) == map(compose(f, g));
```

Podemos usar essa propriedade para otimizar nosso código. Vamos refatorar em cima desse princípio.

```js
// código original
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var srcs = _.compose(_.map(mediaUrl), _.prop('items'));

var images = _.compose(_.map(img), srcs);

```

Vamos alinhar nossos maps. Podemos alinhar nossas chamadas para `srcs` em `images` graças ao raciocínio equacional e pureza.

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var images = _.compose(_.map(img), _.map(mediaUrl), _.prop('items'));
```

Agora que alinhamos nossos `map` podemose aplicar a lei da composição.

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var images = _.compose(_.map(_.compose(img, mediaUrl)), _.prop('items'));
```

Agora o teremos um loop apenas transformando cada item dentro de img. Vamos apenas fazer isso um pouco mais legícel tirando função pra fora.

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var mediaToImg = _.compose(img, mediaUrl);

var images = _.compose(_.map(mediaToImg), _.prop('items'));
```

## Em resumo

Vimos como aplicar nossos conhecimentos em um pequeno, mas um app real. Usamos nossa estrutura matemática para pensar e refatorar nosso código. Mas em relação a tratamento de erros e ramificação de código? Como podemos tornar toda nossa aplicação pura em vez de aplicarmos algumas funções destrutivas a um namespace? Como podemos tornar nossa aplicação segura e mais expressiva? Essas são as questões que iremos abordar na parte 2.

[Capítulo 7: Hindley-Milner e Eu](ch7-pt_BR.md)
