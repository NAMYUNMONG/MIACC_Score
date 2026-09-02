import { ArrowUpRight, Music2, SlidersHorizontal } from "lucide-react";

const basePath = "/MIACC_Score/";

const tools = [
  {
    eyebrow: "WORSHIP SCORE",
    title: "콘티 작성",
    description: "예배 곡 정보와 악보 이미지를 정리하고, 섹션별 요청 사항을 담은 A4 콘티를 만듭니다.",
    href: `${basePath}score.html`,
    action: "콘티 만들기",
    icon: Music2,
    tone: "score",
    features: ["여러 곡 페이지", "악보 이미지 배치", "A4 PDF 출력"],
  },
  {
    eyebrow: "FOH · MIDAS M32",
    title: "M32 운영",
    description: "교회 FOH 운영 매뉴얼, Scene 파일, FX 가이드와 Audio Lab을 확인합니다.",
    href: `${basePath}m32/`,
    action: "M32 Hub 열기",
    icon: SlidersHorizontal,
    tone: "m32",
    features: ["운영 매뉴얼", "Scene 다운로드", "Interactive Audio Lab"],
  },
] as const;

export function LandingPage() {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <a className="landing-brand" href={basePath} aria-label="MIACC Worship Tools 홈">
          <span className="landing-brand-mark" aria-hidden="true">M</span>
          <span>MIACC <b>Worship Tools</b></span>
        </a>
        <span className="landing-context">MEDIA · PRODUCTION</span>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <p className="landing-kicker">SUNDAY SERVICE WORKSPACE</p>
        <h1 id="landing-title">예배 준비와 현장 운영을<br />하나의 흐름으로.</h1>
        <p className="landing-intro">필요한 작업을 선택하세요. 기존 콘티 작성 도구와 M32 운영 자료는 각각의 독립된 공간에서 그대로 사용할 수 있습니다.</p>
      </section>

      <section className="tool-grid" aria-label="MIACC 작업 선택">
        {tools.map(({ eyebrow, title, description, href, action, icon: Icon, tone, features }) => (
          <a className={`tool-card tool-card--${tone}`} href={href} key={title}>
            <div className="tool-card-top">
              <span className="tool-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.8} /></span>
              <span className="tool-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span>
            </div>
            <p className="tool-eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="tool-description">{description}</p>
            <ul className="tool-features">
              {features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <span className="tool-action">{action}<ArrowUpRight size={17} aria-hidden="true" /></span>
          </a>
        ))}
      </section>

      <footer className="landing-footer">
        <span>MIACC Media Production</span>
        <span>Score · FOH · M32</span>
      </footer>
    </main>
  );
}
