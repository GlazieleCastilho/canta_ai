import Link from "next/link";

/** Cabeçalho com a marca e as luzes de marquise do protótipo. */
export function Marquee({ subtitle, right }: { subtitle: string; right?: React.ReactNode }) {
  return (
    <>
      <div className="chase-lights" />
      <div className="topbar">
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="brand">
            <div className="mic">🎤</div>
            <div>
              <h1>Canta Aí</h1>
              <small>{subtitle}</small>
            </div>
          </div>
        </Link>
        {right}
      </div>
    </>
  );
}
