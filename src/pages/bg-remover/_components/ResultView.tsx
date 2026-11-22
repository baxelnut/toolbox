// Style
import "./ResultView.css";
// Utils
import { cx } from "@/lib/cx";

type ResultViewProps = {
  originalUrl: string;
  cutoutUrl: string;
  background: string | null;
  view: "after" | "before";
  onViewChange: (view: "after" | "before") => void;
  width: number;
  height: number;
  resized: boolean;
};

export function ResultView({
  originalUrl,
  cutoutUrl,
  background,
  view,
  onViewChange,
  width,
  height,
  resized,
}: ResultViewProps) {
  const after = view === "after";
  const solid = after && background !== null;

  return (
    <section className="result" aria-label="Result">
      <div className="result__tabs" role="group" aria-label="Compare">
        <button
          type="button"
          className="tab result__tab"
          aria-pressed={after}
          onClick={() => onViewChange("after")}
        >
          After
        </button>
        <button
          type="button"
          className="tab result__tab"
          aria-pressed={!after}
          onClick={() => onViewChange("before")}
        >
          Before
        </button>
      </div>
      <div
        className={cx("result__frame", !solid && "result__frame--checker")}
        style={solid ? { backgroundColor: background } : undefined}
      >
        <img
          className="result__img"
          src={after ? cutoutUrl : originalUrl}
          alt={after ? "Image with the background removed" : "Original image"}
          width={width}
          height={height}
        />
      </div>
      <small className="mono">
        {width} x {height} px
        {resized ? ". Scaled down to fit 4096 px." : ""}
      </small>
    </section>
  );
}
