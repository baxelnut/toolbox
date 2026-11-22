// Style
import "./Footer.css";

type FooterProps = {
  owner: string;
  ownerUrl: string;
  bbaUrl: string;
};

export function Footer({ owner, ownerUrl, bbaUrl }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <small>
          Built by{" "}
          <a href={ownerUrl} target="_blank" rel="noopener noreferrer">
            {owner}
          </a>
        </small>
        {bbaUrl && (
          <small>
            <a href={bbaUrl} target="_blank" rel="noopener noreferrer">
              Barito Bahalap Agency
            </a>
          </small>
        )}
      </div>
    </footer>
  );
}
