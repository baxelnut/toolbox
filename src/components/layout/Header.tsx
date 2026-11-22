import { Link, NavLink } from "react-router";
// Style
import "./Header.css";
// App
import { ROUTES } from "@/app/routes";

type HeaderLink = { to: string; label: string };

type HeaderProps = {
  brand: string;
  links: readonly HeaderLink[];
};

export function Header({ brand, links }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        <Link className="header__brand" to={ROUTES.home}>
          {brand}
        </Link>
        <nav className="header__nav" aria-label="Tools">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="header__link">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
