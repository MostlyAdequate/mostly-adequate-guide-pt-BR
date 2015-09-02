<img src="images/cover.png"/>

# Sobre o livro


Este livro é sobre o paradigma funcional. E para aprender, usaremos a linguagem funcional mais popular do mundo: JavaScript. Alguns pensam que essa linguagem não é um boa escolha por acharem que ela é predominantemente imperativa. No entanto, acredito que é a melhor forma de aprender ``FP`` por vários motivos:

 * Você provavelmente usa JavaScript no seu trabalho:

    Isso torna possível a prática e a aplicação dos conhecimentos adquiridos em projetos reais, e não somente em pequenos projetos criados em seu tempo livre com linguagens puramente funcionais.

 * Nós não temos que aprender absolutamente tudo antes, para começar a programar.

    Em uma ``linguagem funcional pura``, você não pode declarar uma variável ou ler um nó do ``DOM`` sem usar ``monads``. Here we can cheat a little as we learn to purify our codebase. E também é mais fácil de começar com JavaScript, pois ele possui uma mistura de paradigmas, e você pode usar suas práticas comuns enquanto não possui todos conhecimentos necessários.

 * A linguagem é totalmente capaz de escrever código funcional de alto nível.

    Nós temos tudo que precisamos para simular linguagens como Sclala ou Haskell com o auxílio de uma ou duas bibliotecas. Atualmente OOP (Object-oriented programing/Programação Orientada a Objetos) é dominante no mercado, e claramente em JavaScript isso é um pouco desajeitado. It's akin to camping off of a highway or tap dancing in galoshes. Nós temos que usar ``bind`` em todos lugares onde queremos usar o escopo do ``this``, nós não temos classes[ainda], temos que tratar o comportamento do ``new`` quando o mesmo é esquecido de ser invocado, membros privados são apenas disponíveis por meio de ``closures``. Para muitos de nós, ``FP`` parece ser mais natural.

Dito isto, linguagens funcionais fortemente tipadas são sem dúvida a melhor forma de aprender o paradigma proposto neste livro. JavaScript será o meio de aprendermos este paradigma, onde você mesmo é quem irá aplicá-lo. Felizmente, todas as interfaces são matemáticas e portanto universais. Você se sentirá familiarizado com linguagens como swiftz, scalaz, haskell, purescript e outros ambientes matematicamente inclinados.

# Outros Idiomas

- [English (original)](https://github.com/MostlyAdequate/mostly-adequate-guide)
- [French](https://github.com/MostlyAdequate/mostly-adequate-guide-fr)
- [Português](https://github.com/MostlyAdequate/mostly-adequate-guide-pt-BR)
- [Russian](https://github.com/MostlyAdequate/mostly-adequate-guide-ru)
- [中文版](https://github.com/llh911001/mostly-adequate-guide-chinese)

# Conteúdo

## Parte 1

* [Capítulo 1: O que estamos fazendo ?](ch1.md)
  * [Introdução](ch1.md#introductions)
  * [Um encontro casual](ch1.md#a-brief-encounter)
* [Chapter 2: First Class Functions](ch2.md)
  * [A quick review](ch2.md#a-quick-review)
  * [Why favor first class?](ch2.md#why-favor-first-class)
* [Chapter 3: Pure Happiness with Pure Functions](ch3.md)
  * [Oh to be pure again](ch3.md#oh-to-be-pure-again)
  * [Side effects may include...](ch3.md#side-effects-may-include)
  * [8th grade math](ch3.md#8th-grade-math)
  * [The case for purity](ch3.md#the-case-for-purity)
  * [In Summary](ch3.md#in-summary)
* [Chapter 4: Currying](ch4.md)
  * [Can't live if livin' is without you](ch4.md#cant-live-if-livin-is-without-you)
  * [More than a pun / Special sauce](ch4.md#more-than-a-pun--special-sauce)
  * [In Summary](ch4.md#in-summary)
* [Chapter 5: Coding by Composing](ch5.md)
  * [Functional Husbandry](ch5.md#functional-husbandry)
  * [Pointfree](ch5.md#pointfree)
  * [Debugging](ch5.md#debugging)
  * [Category Theory](ch5.md#category-theory)
  * [In Summary](ch5.md#in-summary)
* [Chapter 6: Example Application](ch6.md)
  * [Declarative Coding](ch6.md#declarative-coding)
  * [A flickr of functional programming](ch6.md#a-flickr-of-functional-programming)
  * [A Principled Refactor](ch6.md#a-principled-refactor)
  * [In Summary](ch6.md#in-summary)

## Part 2

* [Chapter 7: Hindley-Milner and Me](ch7.md)
  * [What's your type?](ch7.md#whats-your-type)
  * [Tales from the cryptic](ch7.md#tales-from-the-cryptic)
  * [Narrowing the possibility](ch7.md#narrowing-the-possibility)
  * [Free as in theorem](ch7.md#free-as-in-theorem)
  * [In Summary](ch7.md#in-summary)
* [Chapter 8: Tupperware](ch8.md)
  * [The Mighty Container](ch8.md#the-mighty-container)
  * [My First Functor](ch8.md#my-first-functor)
  * [Schrödinger’s Maybe](ch8.md#schrodingers-maybe)
  * [Pure Error Handling](ch8.md#pure-error-handling)
  * [Old McDonald had Effects…](ch8.md#old-mcdonald-had-effects)
  * [Asynchronous Tasks](ch8.md#asynchronous-tasks)
  * [A Spot of Theory](ch8.md#a-spot-of-theory)
  * [In Summary](ch8.md#in-summary)
* [Chapter 9: Monadic Onions](ch9.md)
  * [Pointy Functor Factory](ch9.md#pointy-functor-factory)
  * [Mixing Metaphors](ch9.md#mixing-metaphors)
  * [My chain hits my chest](ch9.md#my-chain-hits-my-chest)
  * [Theory](ch9.md#theory)
  * [In Summary](ch9.md#in-summary)


# Planos para o futuro

* Parte 1 é um guia para as noções básicas. Estou alterando conforme encontro erros, pois este é apenas um esboço inicial. Sinta-se a vontade para ajudar!
* Parte 2 abordar tipos de classes (type class) como **functors**, **monads** e **traversable**. I hope to squeeze in transformers and a pure application.

* Parte 3 will start to dance the fine line between practical programming and academic absurdity. We'll look at comonads, f-algebras, free monads, yoneda, and other categorical constructs.
