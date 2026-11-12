import type { IconType } from "react-icons";
import { NavLink } from "react-router";
import {
  PiCompass,
  PiCompassFill,
  PiHouse,
  PiHouseFill,
  PiMagnifyingGlass,
  PiMagnifyingGlassBold,
  PiUsers,
  PiUsersFill,
} from "react-icons/pi";
import { messages } from "../../i18n";
import "./MobileTabBar.css";

interface Tab {
  to: string;
  label: string;
  end: boolean;
  Icon: IconType;
  ActiveIcon: IconType;
}

const TABS: readonly Tab[] = [
  { to: "/", label: messages.nav.home, end: true, Icon: PiHouse, ActiveIcon: PiHouseFill },
  {
    to: "/discover",
    label: messages.nav.discover,
    end: false,
    Icon: PiCompass,
    ActiveIcon: PiCompassFill,
  },
  {
    to: "/pessoas",
    label: messages.nav.people,
    end: false,
    Icon: PiUsers,
    ActiveIcon: PiUsersFill,
  },
  {
    to: "/search",
    label: messages.nav.search,
    end: false,
    Icon: PiMagnifyingGlass,
    ActiveIcon: PiMagnifyingGlassBold,
  },
];

/** Navegação principal no celular, ao alcance do polegar. */
const MobileTabBar = () => (
  <nav className="tabbar" aria-label={messages.nav.mobileLabel}>
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
