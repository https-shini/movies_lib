import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { BiCameraMovie, BiSearchAlt2, BiCompass } from "react-icons/bi";
import "./Navbar.css";

const Navbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearch("");
  };

  return (
    <header className="site-header">
      <nav id="navbar" aria-label="Navegação principal">
        <Link className="brand" to="/" aria-label="MoviesLib, página inicial">
          <BiCameraMovie aria-hidden="true" />
          <span>MoviesLib</span>
        </Link>
        <div className="nav-actions">
          <Link className="discover-link" to="/discover">
            <BiCompass aria-hidden="true" />
            <span>Descobrir</span>
          </Link>
          <form className="search-form" role="search" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="movie-search">Buscar filmes</label>
            <input id="movie-search" type="search" placeholder="Buscar filmes..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <button type="submit" aria-label="Pesquisar" disabled={!search.trim()}><BiSearchAlt2 aria-hidden="true" /></button>
          </form>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
