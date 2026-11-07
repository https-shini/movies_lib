import { NavLink } from "react-router";
import {
  PiCompass,
  PiCompassFill,
  PiHouse,
  PiHouseFill,
  PiMagnifyingGlass,
  PiMagnifyingGlassBold,
} from "react-icons/pi";
import "./MobileTabBar.css";

const TABS = [
  { to: "/", label: "Início", end: true, Icon: PiHouse, ActiveIcon: PiHouseFill },
  { to: "/discover", label: "Descobrir", Icon: PiCompass, ActiveIcon: PiCompassFill },
  { to: "/search", label: "Buscar", Icon: PiMagnifyingGlass, ActiveIcon: PiMagnifyingGlassBold },
];

/** Navegação principal no celular, ao alcance do polegar. */
const MobileTabBar = () => (
  <nav className="tabbar" aria-label="Navegação principal">
    <ul className="tabbar__list" role="list">
      {TABS.map(({ to, label, end, Icon, ActiveIcon }) => (
        <li key={to}>
          <NavLink to={to} end={end} className="tabbar__item">
            {({ isActive }) => (
              <>
                {isActive ? <ActiveIcon aria-hidden="true" /> : <Icon aria-hidden="true" />}
                <span>{label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default MobileTabBar;
