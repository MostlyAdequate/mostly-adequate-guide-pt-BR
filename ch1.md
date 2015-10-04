# Capítulo 1: O que estamos fazendo ?

## Introdução

Olá eu sou o Professor Franklin Risby, prazer em conhece-lo! Iremos passar um tempo juntos para que eu lhe ensine um pouco sobre programação funcional. Eu já falei sobre mim, me conte sobre você! Espero que você já esteja familiarizado com JavaScript, tenha um pouco de experiência com Orientação a Objetos and fancy yourself a working class programmer. Você não precisa ter um PHD em Entomologia, você apenas precisa saber como encontrar e matar alguns ``Bugs``.

Não suponho que você tenha algum conhecimento anterior com programação funcional, mas suponho que tenha conhecimento de passar por situações desfavoráveis que aparecem quando trabalhamos com estados mutáveis, efeitos colaterais irrestritos e unprincipled design. Agora que estamos apresentados, vamos começar.


O propósito deste capítulo é lhe mostrar aquilo que procuramos quando escrevemos programas funcionais. Devemos ter a idéia sobre o que faz um programa ser **funcional**, ou iremos apenas escrever código a toa sem rumo algum, inclusive evitando a todo custo objetos - Um esforço inútil.
Precisamos de uma bússula, um norte para quando sentirmos que estamos perdidos.

Existem alguns principios de programação, vários credos que nos guia através dos vales sombrios de qualquer aplicação: DRY (don't repeat yourself / não se repita), loose coupling high cohesion (acoplamento e coesão), YAGNI (ya ain't gonna need it / você não vai precisar disso), principle of least surprise (princípio da menor surpresa), single responsibility (única responsabilidade), e assim por diante.

Não irei abusar usando cada princípio que tenho visto em todos esses anos... o caso
é que eles se aplicam no ambiente funcional, mesmo sendo de uma forma superficial para aquilo que queremos.
O que quero agora, antes de seguimos, é deixar claro que nosso objetivo aqui é a abordagem funcional.

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
Brilhante, não temos que escrever um pingo de código personalizado, apenas chamar nossas funções.
Definimos `add` e `multiply` nós mesmos, mas não há necessidade de escreve-las - Certamente existe uma implementação das mesmas fornecida por alguma biblioteca.

Você deve estar pensando "Que esperto você, dando um exemplo puramente matemático!". Ou "Programas reais não são tão simples e não podem ser resolvidos desta forma". Escolhi esse exemplo porque muitos de nós conhecemos bem adição e multiplicação, então é fácil perceber como a matemática pode ser útil para nós aqui.

Então não se desespere, iremos por partes em teoria da categoria, teoria dos conjuntos e cálculo  lambda para programar exemplos reais que possuirão a mesma simplicidade e resultados do nosso programa ``segull``. Você também não precisa ser um matemático, isto será apenas como usar um *framework* ou uma *api*.


Pode ser uma supresa para você, ouvir que podemos escrever no nosso dia-a-dia, programas completos usando a abordagem funcional proposta acima. Programas com uma excelente performance, concisos, elegantes e ainda sim fáceis de entender. Programas que não reinventam a roda todo momento. Se você é um criminoso, a lei não é uma coisa boa, mas neste livro, vamos querer reconhecer e obedecer as leis da matemática.

Queremos usar a teoria como um quebra-cabeça onde cada peça se encaixa perfeitamente. Queremos representar problemas específicos de modo genérico, componentizado e então explorar suas propriedades a nosso favor. Isso requer mais disciplina do que o "Bora programar!" da abordagem da programação imperativa[ Mais tarde falaremos a definição precisa do que é programação imperativa, mas de antemão é absolutamente qualquer coisa diferente de programação funcional], mas o benefício de trabalhar com princípios matemáticos na abordagem funcional vai te deixar de queixo caído.

Nós vimos apenas um pequeno brilho de nossa ``estrela guia funcional``, mas existem mais alguns conceitos sólidos para vermos, antes de realmente começarmos nossa jornada.

[Capítulo 2: Funcões de Primeira Classe - First Class Functions ](ch2.md)
