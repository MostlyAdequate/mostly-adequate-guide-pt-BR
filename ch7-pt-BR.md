# Hindley-Milner e Eu

## Qual o seu tipo?

Se você é novo no mundo da programação funcional, não irá demorar para você estar totalmente envolvido em **type signatures** (tipos de assinatura). Types são uma meta-linguagem que permite que pessoas de origens distintas se comuniquem de forma rápida e efeciente. Em sua maioria, elas são escritas com um sistema chamado "Hindley-Milner", na qual examinaremos juntos neste capítulo.

Ao trabalhar com funções puras, type signatures possuem um poder expressivo muito maior do que qualquer outro idioma. Essas signatures cochicham no seu ouvido os segredos íntimos de uma função. Em uma única e compacta linha, elas expoem qual seu comportamento e intenção. Delas podemos deduzir teoremas. Types podem ser deduzidas, portanto não necessitando anotações explicitas. Elas podem ser ajustadas para uma forma precisa ou geral e abstrata. Elas não são apenas úteis para verificações em tempo de execução, mas faz com que seja a melhor forma de documentação disponível. Type signatures faz um papel importante na programação funcional - muito mais do que você imagina.

JavaScript é uma linguagem dinâmica, mas não significa que evitamos types completamente. Ainda trabalhamos com strings, numbers, booleans e assim por diante. Portanto não há nenhuma integração na linguagem, apenas guarde isso em mente. Não se preocupe, já que que estamos usando assinaturas para documentação, podemos usar comentários para o que precisamos.

Existem verificadores de tipos disponíveis para Javascript como [Flow](http://flowtype.org/) ou dialetos tipados como [TypeScript](http://www.typescriptlang.org/). O objetivo desse livro é equipá-lo com ferramentas para escrever código funcional, portanto iremos ficar com o sistema de tipos padrão usado nas linguagens funcionais.


## Contos enigmáticos

Nas páginas empoeiradas dos livros de matemática, no vasto mar de páginas brancas, nos posts em blogs, dentro dos códigos fontes, em todo lugar encontramos Hindley-Milner type signatures. O sistema é bem simples, mas merece uma rápida explicação e alguma prática para que possamos absorver totalmente essa pequena linguagem.

```js
//  capitalize :: String -> String
var capitalize = function(s){
  return toUpperCase(head(s)) + toLowerCase(tail(s));
}

capitalize("smurf");
//=> "Smurf"
```

Aqui `capitalize` recebe uma `String` e retorna outra `String`. Não importa a implementação, é a type signature que estamos interessados.

Em Hindley-Milner, funções são escritas como `a -> b` onde `a` e `b` são variáveis de qualquer tipo. Então a assinatura de `capitalize` pode ser lida como "uma função de `String` para `String`". E outras palavras, ela recebe `String` como entrada e retorna uma `String` como saída.

Vamos ver mais algumas assinaturas de funções:

```js
//  strLength :: String -> Number
var strLength = function(s){
  return s.length;
}

//  join :: String -> [String] -> String
var join = curry(function(what, xs){
  return xs.join(what);
});

//  match :: Regex -> String -> [String]
var match = curry(function(reg, s){
  return s.match(reg);
});

//  replace :: Regex -> String -> String -> String
var replace = curry(function(reg, sub, s){
  return s.replace(reg, sub);
});
```

`strLength` é a mesma idéia de antes: recebemos uma `String` e retorna um `Number`.

Os outros podem te deixar perplexo no primeiro momento. Sem compreender totalmente os detalhes, você pode apenas ver o último tipo como sendo o valor de retorno. Então para `match` você pode interpretar como: Isso recebe um `Regex` e uma `String` e returna uma `[String]`. Mas uma coisa interessante está acontecendo aqui, e gostaria de um tempo para lhe explicar.

Para `match` ficamos livre para agrupar a assinatura assim:

```js
//  match :: Regex -> (String -> [String])
var match = curry(function(reg, s){
  return s.match(reg);
});
```

Agora sim, agrupando a última parte com parênteses nos revela mais informações. Agora parece que a função recebe um `Regex` e retorna uma função de `String` para `[String]`. Uma função currying é o caso aqui: damos um `Regex` e recebemos uma função de volta, esperando ser chamada com uma `String`. É claro, não temos que pensar desta forma, mas é bom entender porque aquele último tipo é retornado.

```js
//  match :: Regex -> (String -> [String])

//  onHoliday :: String -> [String]
var onHoliday = match(/holiday/ig);
```

Cada argumento passado, retira um tipo fora da parte inicial da assinatura. `onHoliday` é `match` que já possui um `Regex`.

```js
//  replace :: Regex -> (String -> (String -> String))
var replace = curry(function(reg, sub, s){
  return s.replace(reg, sub);
});
```

Como você pode ver todos esse parênteses em `replace`, a notação extra pode se tornar um pouco sujo e redundânte, portanto simplesmente omitimos eles. Podemos informar os argumentos de uma só vez, se optar por isso, é mais fácil pensar nele como: `replace` recebe um `Regex`, uma `String`, outra `String` e retorna uma `String`.

Uma última coisinha aqui:

```js
//  id :: a -> a
var id = function(x){ return x; }

//  map :: (a -> b) -> [a] -> [b]
var map = curry(function(f, xs){
  return xs.map(f);
});
```

A função `id` recebe qualquer coisa do tipo `a` e retorna alguma coisa do mesmo tipo `a`. Podemos usar variáveis em tipos assim como usarmos no código. Variáveis como `a` e `b` são apenas convensão, mas são arbitrárias e podem ser substituídas com qualquer nome que quiser. Se elas forem a mesma variável, elas devem ser do mesmo tipo. Isto é uma regra importante, portanto vamos deixar claro: `a -> b` podem ser de qualquer tipo `a` para qualquer tipo `b`, mas `a -> a` devem ser do mesmo tipo. Por examplo, `id` pode ser `String -> String` ou `Number -> Number`, mas não `String -> Bool`.


`map` similarmente também usa type variables, mas desta vez colocamos o `b` que pode ser ou não do mesmo tipo que `a`. Podemos ler isso como: `map` recebe uma função de qualquer tipo `a`, para o mesmo tipo ou não `b`, então recebe um array de `a`'s que resulta e um array de `b`'s.

Felizmente, você foi surpreendido pela beleza expressiva de type signature. Isso literamente nos conta o que a função faz quase que palavra por palavra. Dada uma função de `a` para `b`, um array de `a`, e isso nos retorna um array de `b`. A única coisa que ela deve fazer é chamar a função para cada `a`. Qualquer outra coisa fora disso é incompatível.

Ser capaz de raciocinar sobre types a suas implicações, é uma habilidade que o fará ir mais longe no mundo funcional. Não só os papéis, blogs, documentos e etc se tornam mais digerível, mas a assinatura em sí praticamente lhe dará toda funcionalidade implementada. É preciso prátics para se tornar um leitor fluente de assinaturas, mas se persistir nisso, um mundo de informação estará disponível para você.

Aqui mais alguns exemplos para ver se você consegue sozinho decifrá-las.

```js
//  head :: [a] -> a
var head = function(xs){ return xs[0]; }

//  filter :: (a -> Bool) -> [a] -> [a]
var filter = curry(function(f, xs){
  return xs.filter(f);
});

//  reduce :: (b -> a -> b) -> b -> [a] -> b
var reduce = curry(function(f, x, xs){
  return xs.reduce(f, x);
});
```

`reduce` é quem sabe, a mais expressiva de todas. Isso é um assunto delicado, não se preocupe se não entender bem essa parte, não desanime.

## Estreitando as possibilidades

Uma vez que type variable foi introduzida, surge uma curiosa propriedade chamada *parametricity*[^http://en.wikipedia.org/wiki/Parametricity]. Essa propriedade afirma que uma função irá *agir em todos os tipos de maneira uniforme*. Vamos investigar.

```js
// head :: [a] -> a
```

Olhando para `head`, vemos que recebe `[a]` e retorna `a`. Além do tipo concreto `array`, não possui nenhuma outra informação, portanto sua funcionalidade é limitada para trabalhar apenas com esse array. Como é possível fazer algo com a variável `a` se não sabemos nada sobre ela? Em otras palavras, `a` diz que não possui um tipo *específico*, o que significa que pode ser de *qualquer* tipo, que faz com que essa função tenha que trabalhar uniformemente com *todos* os tipos. Isso é chamado de *parametricity*. Olhando a implementação, a única hipótese razoável é que a função retorna o primeiro, o último ou algum elemento do array. Mas o `head` nos dá a dica.

Mais um exemplo:

```js
// reverse :: [a] -> [a]
```

Conforme a assinatura acima, o que possivelmente `reverse` pode ser? Novamente, ela não pode fazer nada especifico com `a`. Ela não pode mudar `a` para um tipo diferente ou introduzir um `b`. Podemos re-ordenar? Sim, suponho que pode, mas deve ser feito de uma forma previsível. Outra possibilidade é que ela pode decidir em remover ou duplicar um elemento. Independente do caso, o ponto é, qualquer possível comportamente é limitado pelo tipo polimórfico imposto.

Essa limitação de possibilidade nos permite usar mecanimos de busca por type signatures como [Hoogle](https://www.haskell.org/hoogle) para encontrar alguma função que procuramos. As informaçãos em uma assinatura são muito poderosas.

## Livre como em teoremas

Além de nos dar a possibilidade de dedução, esse tipo de raciocínio nos permite usar *free theorems*. Segue alguns exemplos aleatórios de teoremas por [Wadler's paper on the subject](http://ttic.uchicago.edu/~dreyer/course/papers/wadler.pdf).

```js
// head :: [a] -> a
compose(f, head) == compose(head, map(f));

// filter :: (a -> Bool) -> [a] -> [a]
compose(map(f), filter(compose(p, f))) == compose(filter(p), map(f));
```

Você não precisa de nenhum código para entender os teoremas, eles seguem os tipos. A primeira diz que se pegarmos o `head` de uma array e aplicamos uma função `f` nela, o que é equivalente, e a propósito muito mais rápido, do que primeiro fazermos um `map(f)` em todos elementos e depois pegarmos o `head` do resultado.

Você deve estar pensando, bom isso é por causa do senso comum. Mas pelo que sei, computadores não possuem um senso comum. Em vez disso, eles devem possuir uma forma padrão de automatização de código. A matemática tem uma maneira de formalizar o que é intuitivo, o que é útil no meio desse terreno rígido da lógica do computador.

O teorema de `filter` é similar. Ele informa que compõe `f` e `p` para verificar oque deve ser filtrado, então aplica o `f` via `map` (lembre-se que filter, não irá transformar os elementos - sua assinatura obriga que `a` não seja alterado), isso sempre será equivalente a mapear nosso `f` então filtrar os resultado com o predicado `p`.

Esse são apenas dois exemplos, mas você pode aplicar esse raciocínio em qualquer assinatura do tipo polimórfico que sempre se aplicará. Em JavaScript, existem algumas ferramentas disponíveis para declarar regras de reescrita. O resultado é menos esforço e possibilidades infinitas.

## Em Resumo

Types signatures Hindley-Milner são onipresentes no mundo funcional. Embora sejam simples de ler e escrever, leva tempo até dominar a técnica de entender programas apenas pela assinatura. A partir daqui iremos adicionar assinaturas em cada linha de código.

[Capítulo 8: Tupperware](ch8-pt-BR.md)
