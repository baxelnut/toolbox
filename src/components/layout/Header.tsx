import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
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
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className="header" ref={headerRef}>
      <div className="header__inner">
        <Link className="header__brand" to={ROUTES.home}>
          {brand}
        </Link>
        <button
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="header-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="header__toggle-bar" />
          <span className="header__toggle-bar" />
          <span className="header__toggle-bar" />
        </button>
        <nav
          id="header-nav"
          className={`header__nav ${open ? "header__nav--open" : ""}`}
          aria-label="Tools"
        >
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
