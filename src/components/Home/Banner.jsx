import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Search } from "lucide-react";
import image from "../../assets/img/home-hero-v2.webp";

export default function Banner() {
  const { t } = useTranslation();

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="site-container hero-grid">
        <div className="hero-copy">
          <div className="hero-marker" aria-hidden="true"><span /> <span /></div>
          <h1 id="hero-title"><span>{t("marketing.rent")}</span> <em>{t("marketing.dreamTitle")}</em></h1>
          <p>{t("marketing.subtitle")}</p>
          <div className="hero-actions">
            <a className="hero-primary" href="#explore"><Search size={19} /> {t("redesign.explore")} <ArrowUpRight size={18} /></a>
            <Link className="hero-secondary" to="/About">{t("redesign.story")} <ArrowUpRight size={18} /></Link>
          </div>
          <div className="hero-proof"><span className="proof-rule" /><span>{t("redesign.heroNote")}</span></div>
        </div>
        <div className="hero-visual">
          <img src={image} alt="Limestone courtyard home with a teal entrance" className="hero-image rtl:-scale-x-100" fetchPriority="high" />
          <div className="hero-image-caption"><span>{t("redesign.imageNote")}</span><span className="hero-caption-line" aria-hidden="true" /></div>
        </div>
      </div>
    </section>
  );
}
