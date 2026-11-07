import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { PiMagnifyingGlass } from "react-icons/pi";
import { messages } from "../../i18n";
import BrandMark from "./BrandMark";
import "./AppHeader.css";

const NAV_ITEMS = [
  { to: "/", label: "Início", end: true },
  { to: "/discover", label: "Descobrir" },
];

const HeaderSearch = () => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setValue("");
  };

  return (
    <form className="header-search" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="header-search-input">
        Buscar filmes
      </label>
      <PiMagnifyingGlass className="header-search__icon" aria-hidden="true" />
      <input
        id="header-search-input"
        className="header-search__input"
        type="search"
        placeholder="Buscar filmes"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  );
};

const AppHeader = () => {
  const { pathname } = useLocation();
  const isSearchPage = pathname === "/search";

  return (
    <header className="app-header">
      <div className="app-header__inner shell">
        <Link
          to="/"
          className="app-header__brand"
          aria-label={`${messages.brand.name}, página inicial`}
        >
          <BrandMark />
        </Link>

        <nav className="app-header__nav" aria-label="Principal">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="app-header__link">
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header__actions">
          {!isSearchPage && <HeaderSearch />}
          <Link
            to="/search"
            className="icon-btn app-header__search-link"
            aria-label="Buscar filmes"
          >
            <PiMagnifyingGlass aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
