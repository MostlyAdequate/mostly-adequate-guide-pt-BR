<img src="images/cover.png"/>

# Sobre o livro


Este livro é sobre o paradigma funcional. E para aprender, usaremos a linguagem funcional mais popular do mundo: JavaScript. Alguns pensam que essa linguagem não é um boa escolha por acharem que ela é predominantemente imperativa. No entanto, acredito que é a melhor forma de aprender ``FP`` por vários motivos:

 * Você provavelmente usa JavaScript no seu trabalho:

    Isso torna possível a prática e a aplicação dos conhecimentos adquiridos em projetos reais, e não somente em pequenos projetos criados em seu tempo livre com linguagens puramente funcionais.

 * Nós não temos que aprender absolutamente tudo antes, para começar a programar.

    Em uma ``linguagem funcional pura``, você não pode declarar uma variável ou ler um nó do ``DOM`` sem usar ``monads``. Aqui aprendemos a purificar nosso código com algumas trapaças. E também é mais fácil de começar com JavaScript, pois ele possui uma mistura de paradigmas, e você pode usar suas práticas comuns enquanto não possui todos conhecimentos necessários.

 * A linguagem é totalmente capaz de escrever código funcional de alto nível.

    Nós temos tudo que precisamos para simular linguagens como Sclala ou Haskell com o auxílio de uma ou duas bibliotecas. Atualmente OOP (Object-oriented programing/Programação Orientada a Objetos) é dominante no mercado, e claramente em JavaScript isso é um pouco desajeitado. Seria como "acampar no meio de uma estrada" ou "fazer sapateado usando botas de boracha". Nós temos que usar ``bind`` em todos lugares onde queremos usar o escopo do ``this``, nós não temos classes[ainda], temos que tratar o comportamento do ``new`` quando o mesmo é esquecido de ser invocado, membros privados são apenas disponíveis por meio de ``closures``. E por isso, para muitos de nós, ``FP`` parece ser mais natural.

Dito isto, programar em linguagem funcional será sem dúvida a melhor forma de aprender os conceitos propostos neste livro. JavaScript será o meio de aprendermos este paradigma, onde você mesmo é quem irá aplicá-lo. Felizmente, todas as interfaces são matemáticas e portanto universais. Você se sentirá familiarizado com linguagens como Swiftz, Scala, Haskell, Purescript e outros ambientes matematicamente inclinados.

### Gitbook (para uma melhor experiência)

* [Leia online](http://drboolean.gitbooks.io/mostly-adequate-guide/)
* [Download EPUB](https://www.gitbook.com/download/epub/book/drboolean/mostly-adequate-guide)
* [Download Mobi (Kindle)](https://www.gitbook.com/download/mobi/book/drboolean/mostly-adequate-guide)

### Faça você mesmo

```
git clone https://github.com/MostlyAdequate/mostly-adequate-guide-pt-BR

cd mostly-adequate-guide-pt-BR/
npm install gitbook-cli -g
gitbook init

brew update
brew cask install calibre

gitbook mobi . ./functional.mobi
```

# Conteúdo

Veja [SUMMARY.md](SUMMARY-pt-BR.md)

### Contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING-pt-BR.md)

### Traduções

Veja [TRANSLATIONS.md](TRANSLATIONS-pt-BR.md)


# Planos para o futuro

* **Parte 1:** É um guia para as noções básicas. Estou atualizando conforme encontro erros, pois este é apenas um esboço inicial. Sinta-se a vontade para ajudar!
* **Parte 2:** Abordar tipos de classes (type class) como **functors**, **monads** e **traversable**
. E espero encontrar um tempo para abordar **transformers** e criar uma aplicação de fato pura.
* **Parte 3:** Unir a programação prática com as maluquices acadêmicas. Veremos **comonads**, **f-algebras**, **free monads**, **yoneda**, e outras construções categóricas
