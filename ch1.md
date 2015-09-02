# Capítulo 1: O que estamos fazendo ?

## Introdução

Olá eu sou o Professor Franklin Risby, prazer em conhece-lo! Iremos passar um tempo juntos para que eu lhe ensine um pouco sobre programação funcional. Eu já falei sobre mim, me conte sobre você! Espero que você já esteja familiarizado com JavaScript, tenha um pouco de experiência com Orientação a Objetos and fancy yourself a working class programmer. Você não precisa ter um PHD em Entomologia, você apenas precisa saber como encontrar e matar alguns ``Bugs``.

Não suponho que você tenha algum conhecimento anterior com programação funcional, mas suponho que tenha conhecimento de passar por situações desfavoráveis que aparecem quando trabalhamos com estados mutáveis, efeitos colaterais irrestritos e unprincipled design. Agora que estamos apresentados, vamos começar.


O propósito deste capítulo é lhe mostrar aquilo que procuramos quando escrevemos programas funcionais. Devemos ter a idéia sobre o que faz um programa ser **funcional**, ou iremos apenas escrever código a toa sem rumo algum, inclusive evitando a todo custo objetos - Um esforço inútil. We need a bullseye to hurl our code toward, some celestial compass for when the waters get rough.


Existem alguns principios de programação, vários credos que nos guia através dos vales sombrios de qualquer aplicação: DRY (don't repeat yourself), loose coupling high cohesion, YAGNI (ya ain't gonna need it), principle of least surprise, única responsabilidade, e assim por diante.

Não irei abusar usando cada princípio que tenho visto em todos esses anos... o caso
é que eles se aplicam no ambiente funcional, mesmo sendo de uma forma superficial para aquilo que queremos.
What I'd like you to get a feel for now, before we get any further, is our intention when we poke and prod at the keyboard; our functional Xanadu.

<!--BREAK-->

## Um encontro casual

Vamos começar com um toque de insanidade. Aqui temos uma aplicação de seagull(gaivota). Quando outros rebanhos se juntam ao grupo, eles tornam-se maiores, e quando se reproduzem, se multiplicam pelo número de gaivotas. Não temos a intenção de ter um bom código orientado a objeto, lembre-se, o código serve para destacar os perigos de nossas abordagens modernas, baseada em atribuição. Observe:

```js
var Flock = function(n) {
  this.seagulls = n;
};

Flock.prototype.conjoin = function(other) {
  this.seagulls += other.seagulls;
  return this;
};

Flock.prototype.breed = function(other) {
  this.seagulls = this.seagulls * other.seagulls;
  return this;
};

var flock_a = new Flock(4);
var flock_b = new Flock(2);
var flock_c = new Flock(0);

var result = flock_a.conjoin(flock_c)
    .breed(flock_b).conjoin(flock_a.breed(flock_b)).seagulls;
//=> 32
```

Quem neste mundo poderia criar uma abominação dessa ? É extremamente difícil controlar o estado interno mutável. E, meu Deus, além disso a resposta está errada! Deveria ser `16`, mas a `flock_a` acabou sendo alterada permanentemente no processo. Pobrezinha `flock_a`. Esta é a anarquia na I.T.! Isto sim é uma aritmética selvagem!

Se você não entende este programa, tudo bem, eu também não! O ponto é que *estado* e *valores mutáveis* são difíceis de serem acompanhados mesmo em pequenos exemplos.

Vamos tentar novamente com uma abordagem funcional:

```js
var conjoin = function(flock_x, flock_y) { return flock_x + flock_y };
var breed = function(flock_x, flock_y) { return flock_x * flock_y };

var flock_a = 4;
var flock_b = 2;
var flock_c = 0;

var result = conjoin(
  breed(flock_b, conjoin(flock_a, flock_c)), breed(flock_a, flock_b)
);
//=>16
```

Bem, dessa vez temos o valor certo. Temos muito menos código. *function nesting* é um pouco confuso...[Vamos remediar isso no capítulo5]. Assim é melhor, mas vamos mais fundo. Existem benefícios em chamar as coisas com seus devidos nomes. Had we done so, perceberíamos que estamos trabalhando apenas com adição (`conjoin`) e multiplicação (`breed`).

Não há nada especial nessas duas funções além de seus nomes. Vamos renomea-las para revelar sua verdadeira indentidade.

```js
var add = function(x, y) { return x + y };
var multiply = function(x, y) { return x * y };

var flock_a = 4;
var flock_b = 2;
var flock_c = 0;

var result = add(
  multiply(flock_b, add(flock_a, flock_c)), multiply(flock_a, flock_b)
);
//=>16
```
E assim, nós ganhamos o conhecimento dos antigos:

```js
// associative
add(add(x, y), z) == add(x, add(y, z));

// commutative
add(x, y) == add(y, x);

// identity
add(x, 0) == x;

// distributive
multiply(x, add(y,z)) == add(multiply(x, y), multiply(x, z));
```

Ah sim, essas antigas e fiéis propriedades matemáticas se revelam úteis. Não se assuste caso não conheça bem elas. Para muitos de nós, faz algum tempo desde que vimos essas informações. Vamos ver se nós podemos usar essas propriedades para simplificar nosso pequeno programa `seagull`.

```js
// Linha original
add(multiply(flock_b, add(flock_a, flock_c)), multiply(flock_a, flock_b));

// Aplicamos "identity property" para remover o que temos a mais (add(flock_a, flock_c) == flock_a)
add(multiply(flock_b, flock_a), multiply(flock_a, flock_b));

// Aplicamos "distributive property"
multiply(flock_b, add(flock_a, flock_a));
```
Brilhante, Não temos que escrever um pingo de código personalizado, apenas chamar nossas funções.
Definimos `add` e `multiply` nós mesmos, mas não há necessidade de escreve-las - Certamente existe uma implementação das mesmas fornecida por alguma biblioteca.

Você deve estar pensando "how very strawman of you to put such a mathy example up front". Ou "Programas reais não são tão simples e não podem ser fundamentados desta forma". Escolhi esse exemplo porque muitos de nós conhecemos bem adição e multiplicação, então fica fácil de ver como a matemática pode ser útil para nós aqui.

Então não se desespere ao longo deste livro, we'll sprinkle in some category theory, set theory, and lambda calculus para programar exemplos reais que possuirão a mesma simplicidade e resultados do nosso programa ``segull``. Você também não precisa ser um matemático, isto será apenas como usar um *framework* ou uma *api*.


Pode ser uma supresa para você, ouvir que podemos escrever no nosso dia-a-dia, programas completos usando a abordagem funcional proposta acima. Programas com uma excelente performance, concisos, elegantes e ainda sim fáceis de entender. Programas que não reinventam a roda todo momento. Se você é um criminoso, a lei não é uma coisa boa, mas neste livro, vamos querer reconhecer e obedecer as leis da matemática.

We'll want to use the theory where every piece tends to fit together so politely. We'll want to represent our specific problem in terms of generic, composable bits and then exploit their properties for our own selfish benefit. It will take a bit more discipline than the "anything goes" approach of imperative[^We'll go over the precise definition of imperative later in the book, but for now it's anything other than functional programming] programming, but the payoff of working within a principled, mathematical framework will astound you.

Nós vimos apenas um pequeno brilho de nossa ``estrela guia funcional``, mas existem mais alguns conceitos sólidos para vermos, antes de realmente começarmos nossa jornada.

[Capítulo 2: First Class Functions](ch2.md)
