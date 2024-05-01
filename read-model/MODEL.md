<h1 align="center"> Documentação aprofundada </h1>

<p align="center">
  <a href="#decisões-arquiteturais">Decisões Arquiteturais</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#estrutura-do-projeto">Estrutura do projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#funcionamento">Funcionamento</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/https-shini/web-chat">Voltar</a>
</p>

<br>

## Decisões Arquiteturais:

- O projeto Filmes Explorer segue uma arquitetura cliente-servidor, onde o frontend é responsável pela interface do usuário e o backend gerencia a lógica de negócios e a comunicação com a API do TMDB. <br>
- O uso da API do TMDB permite obter informações sobre os filmes, como títulos, sinopses, elenco e avaliações.

<br>

## Estrutura do projeto

➜  **HTML (index.html):**
   - O frontend inclui arquivos HTML para estruturar o conteúdo da página. O arquivo HTML define os elementos como formulários de entrada de usuário, área de exibição de filmes e detalhes do filme.

➜  **CSS (style.css):**
   - O frontend utiliza arquivos CSS para estilizar e projetar a interface do usuário. Os arquivos CSS definem as cores, fontes, layouts e estilos visuais que tornam o aplicativo atraente e fácil de usar.

➜  **JavaScript (script.js):**
   - O frontend inclui arquivos JavaScript para adicionar interatividade à página. Os arquivos JavaScript manipulam eventos do usuário, como cliques e submissões de formulários, e se comunicam com a API do TMDB para obter informações sobre os filmes. Além disso, o JavaScript é responsável por atualizar dinamicamente a interface do usuário para refletir os resultados da pesquisa e os detalhes do filme.

➜  **ReactJS:**
   - O frontend é desenvolvido com ReactJS, uma biblioteca JavaScript para construção de interfaces de usuário.
   - **React Router:**
     - O React Router é usado para a navegação entre diferentes páginas no aplicativo, como a página inicial e a página de detalhes do filme.

➜  **Vite:**
   - O Vite é utilizado para a configuração do projeto frontend. Ele fornece uma experiência de desenvolvimento rápida e eficiente.

➜  **TMDB API:**
   - O frontend interage com a API do TMDB para obter informações sobre os filmes, como títulos, sinopses, elenco e avaliações.

<br>

## **Funcionamento:**

- Os usuários acessam o aplicativo através de um navegador web.
- Eles podem pesquisar por filmes usando o campo de busca.
- Ao clicar em um filme, podem ver detalhes adicionais na página de detalhes do filme.
- A navegação entre diferentes páginas é realizada utilizando o React Router.

<br>

> **Informações Importantes sobre o Aplicativo** <br>
O projeto Filmes Explorer permite aos usuários explorar e descobrir informações sobre filmes utilizando a API do TMDB. <br>
Os detalhes dos filmes, como títulos, sinopses, elenco e avaliações, são obtidos através da API do TMDB. <br>
O frontend é desenvolvido com ReactJS e utiliza o Vite para compilação e configuração do projeto. <br>
