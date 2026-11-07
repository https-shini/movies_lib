import { useCallback } from "react";
import { Link } from "react-router";
import { fetchTmdb } from "../services/tmdb";
import { useAsyncData } from "../hooks/useAsyncData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import MovieSection from "../components/MovieSection";
import "./MoviesGrid.css";
import "./Home.css";

const Home = () => {
  useDocumentTitle("");

  const loadPopular = useCallback(
    (signal) => fetchTmdb("popular", { params: { language: "pt-BR", region: "BR" }, signal }),
    [],
  );
  const loadTopRated = useCallback(
    (signal) => fetchTmdb("top_rated", { params: { language: "pt-BR" }, signal }),
    [],
  );
  const loadNowPlaying = useCallback(
    (signal) => fetchTmdb("now_playing", { params: { language: "pt-BR", region: "BR" }, signal }),
    [],
  );

  const popular = useAsyncData(loadPopular);
  const topRated = useAsyncData(loadTopRated);
  const nowPlaying = useAsyncData(loadNowPlaying);

  return (
    <main className="container home-page">
      <section className="home-hero">
        <p className="eyebrow">Seu próximo filme começa aqui</p>
        <h1>Histórias que merecem ser descobertas.</h1>
        <p>Explore novidades, encontre grandes clássicos e descubra filmes que combinam com seu momento.</p>
        <Link to="/discover" className="home-hero__cta">Explorar filmes</Link>
      </section>

      <MovieSection
        title="Em alta"
        description="Os filmes que estão chamando atenção agora."
        movies={popular.data?.results}
        isLoading={popular.isLoading}
        error={popular.error}
        discoverUrl="/discover?sort=popularity.desc"
      />

      <MovieSection
        title="Mais bem avaliados"
        description="Títulos que conquistaram as melhores avaliações."
        movies={topRated.data?.results}
        isLoading={topRated.isLoading}
        error={topRated.error}
        discoverUrl="/discover?sort=vote_average.desc"
      />

      <MovieSection
        title="Nos cinemas"
        description="Filmes em exibição nos cinemas brasileiros."
        movies={nowPlaying.data?.results}
        isLoading={nowPlaying.isLoading}
        error={nowPlaying.error}
        discoverUrl="/discover?sort=primary_release_date.desc"
      />
    </main>
  );
};

export default Home;
