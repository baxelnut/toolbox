// Style
import "./Footer.css";

type FooterProps = {
  owner: string;
  ownerUrl: string;
};

export function Footer({ owner, ownerUrl }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <small>
          Built by{" "}
          <a href={ownerUrl} target="_blank" rel="noopener noreferrer">
            {owner}
          </a>
        </small>
      </div>
    </footer>
  );
}
