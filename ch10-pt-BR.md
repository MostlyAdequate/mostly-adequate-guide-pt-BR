# Capítulo 10: Aplicativo Functors

## Aplicando Aplicativos

O nome **aplicativo functor** é agradavelmente descritivo dado a sua origem funcional. Programadores funcionais são notórios por chegar com nomes como `mappend` ou `liftA4`, que parecem perfeitamente naturais quando vistos em um laboratório de matemática, mas mantém a clareza de um Darth Vader indeciso em um drive thru em qualquer outro contexto.  

De qualquer forma, o nome deve derramar o feijão sobre o que esta interface nos dá: a habilidade de aplicar functors uns aos outros.

Agora, por que uma pessoa, normal e racional como você iria querer tal coisa? O que significa aplicar um functor a outro?

Para Responder essas perguntas, nós vamos começar com uma situação que você já deve ter encontrado nas suas viagens funcionais. Vamos dizer, hipoteticamente, que nos temos dois functors (do mesmo tipo) e nós gostaríamos de chamar uma função com o valor de ambos como argumentos. Algo simples como adicionar o valor de dois `Containers`.

```js
// Não podemos fazer isso porque os números estão engarrafados.
add(Container.of(2), Container.of(3));
// NaN

// Vamos usar nosso mapa confiável
const containerOfAdd2 = map(add, Container.of(2));
// Container(add(2))
```

Nós temos um `Container` com uma função parcialmente aplicada dentro. Mais especificamente, nós temos um `Container(add(2))` e nós gostariamos de aplicar o seu `add(2)` para 3 no `Container(3)` para completar a chamada. Em outras palavras, nós gostariamos de aplicar um functor em outro.

Agora, Acontece que nós já temos as ferramentas para terminar essa tarefa. Nós podemos usar o `chain` e depois mapear com o `map` a aplicação parcial `add(2)` assim:

```js
Container.of(2).chain(two => Container.of(3).map(add(two)));
```

O problema aqui é que nós estámos presos no mundo sequencial dos monads, onde nada será avaliado até o monad anterior ter finalizado seu négocio. Nós temos dois valores fortes e independentes, e eu acho desnecessário atrasar a criação de `Container(3)` meramente para satisfazer as demandas sequencias do monad.

Na verdade, seria adorável se nós podessemos sucintamente aplicar o conteúdo de um functor para outro valor sem essas funções desnecessárias e variáveis que devemos achar neste pote de picles.

## Navios em garrafas

<img src="images/ship_in_a_bottle.jpg" alt="https://www.deviantart.com/hollycarden" />

`ap` é uma função que aplica o conteúdo de uma função de um functor para o valor do conteúdo em outro. Fale isso 5 vezes rapído.

```js
Container.of(add(2)).ap(Container.of(3));
// Container(5)

// Todos juntos agora

Container.of(2).map(add).ap(Container.of(3));
// Container(5)
```

Aqui estámos, bonitos e arrumados. Boas notícias para o `Container(3)`, que foi libertado da prisão da função monádica aninhada. Vale a pena mencionar que `add`, nesse caso, é parcialmente aplicado durante o primeiro `map`, então isso só acontece quando `add` é [curried](https://pt.wikipedia.org/wiki/Currying)

Nós podemos definir `ap` como:

```js
Container.prototype.ap = function (otherContainer) {
  return otherContainer.map(this.$value);
};
```

Lembre-se, `this.$value` será uma função e estará aceitando outros functors, então, só iremos precisar usar o `map`. E com isso, Nós temos a definição da nossa interface:

> Um aplicativo functor é um functor apontado com um método `ap`

Note a dependência em **apontado**. A interface apontada é crucial aqui, como veremos nos exemplos a seguir.

Agora, eu sinto o seu ceticismo (ou talvez confusão e horror), mas mantenha a mente aberta; Esse caractere `ap` será útil. Antes de entrarmos nesses assunto, vamos explorar uma propriedade legal.

```js
F.of(x).map(f) === F.of(f).ap(F.of(x));
```

No inglês adequado, mapear o `f` é equivalente a m`ap`ear um functor de `f`. Ou no inglês mais adequado ainda, nós podemos trocar o 'x' em nosso container e `map(f)` ou nós podemos levantar ambos `f` e `x` em nosso container e utilizar `ap` neles. Isso nós permite-nos escrever da esquerda para a direita:

```js
Maybe.of(add).ap(Maybe.of(2)).ap(Maybe.of(3));
// Maybe(5)

Task.of(add).ap(Task.of(2)).ap(Task.of(3));
// Task(5)
```
