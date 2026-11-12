import { useState, type SyntheticEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { PiMagnifyingGlass } from "react-icons/pi";
import { interpolate, messages } from "../../i18n";
import BrandMark from "./BrandMark";
import "./AppHeader.css";

const text = messages.nav;

const NAV_ITEMS = [
  { to: "/", label: text.home, end: true },
  { to: "/discover", label: text.discover, end: false },
  { to: "/pessoas", label: text.people, end: false },
] as const;

const HeaderSearch = () => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    void navigate(`/search?q=${encodeURIComponent(query)}`);
    setValue("");
  };

  return (
    <form className="header-search" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="header-search-input">
        {text.searchLabel}
      </label>
      <PiMagnifyingGlass className="header-search__icon" aria-hidden="true" />
      <input
        id="header-search-input"
        className="header-search__input"
        type="search"
        placeholder={text.searchPlaceholder}
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      <button
        type="submit"
        className="header-search__submit"
        aria-label={text.searchSubmit}
        disabled={!value.trim()}
      >
        <PiMagnifyingGlass aria-hidden="true" />
      </button>
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
          aria-label={interpolate(text.homeLink, { brand: messages.brand.name })}
        >
          <BrandMark />
        </Link>

        <nav className="app-header__nav" aria-label={text.mainLabel}>
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
            aria-label={text.searchLabel}
          >
            <PiMagnifyingGlass aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
