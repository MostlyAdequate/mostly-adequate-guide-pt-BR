# Capítulo 10: Aplicativo Functors

## Aplicando Aplicativos

O nome **aplicativos functor** é agradavelmente descritivo dado a sua origem funcional. Programadores funcionais são notórios por chegar com nomes como `mappend` ou `liftA4`, que parecem perfeitamente naturais quando vistos em um laboratório de matemática, mas mantém a clareza de um Darth Vader indeciso em um drive thru em qualquer outro contexto.  

De qualquer forma, o nome deve derramar o feijão sobre o que esta interface nos dá: a habilidade de aplicar functors uns aos outros.

Agora, por que uma pessoa, normal e racional como você iria querer tal coisa? O que significa aplicar um functor a outro?

Para Responder essas perguntas, nós vamos começar com uma situação que você já deve ter encontrado nas suas viagens funcionais. Vamos dizer, hipoteticamente, que nos temos dois functors (do mesmo tipo) e nos gostariamos de chamar uma função com o valor de ambos como argumentos. Algo simples como adicionar o valor de dois `Containers`.

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

O problema aqui é que nós estámos presos no mundo sequencial dos monads, onde nada será avaliado até o monad anterior ter finalizado seu négocio. Nós temos dois valores fortes e independentes, e eu devo 
