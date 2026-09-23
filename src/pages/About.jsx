import { Link } from "react-router-dom";
import { ArrowUpRight, Search, Heart, MessageCircle } from "lucide-react";
import image from "../assets/img/about-hero-v2.webp";
import { useTranslation } from "react-i18next";

const steps = [
  { icon: Search, title: "discover", text: "discoverText" },
  { icon: Heart, title: "favorites", text: "favoritesText" },
  { icon: MessageCircle, title: "connect", text: "connectText" },
];

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="site-container about-hero-grid">
          <div className="about-copy">
            <div className="about-marker" aria-hidden="true"><span /><span /></div>
            <h1 id="about-title">{t("redesign.aboutTitle")}</h1>
            <p>{t("redesign.aboutIntro")}</p>
            <Link to="/#explore" className="about-hero-link">{t("redesign.explore")} <ArrowUpRight size={19} /></Link>
          </div>
          <div className="about-photo"><img src={image} alt="Olive tree framing a welcoming courtyard entrance" className="rtl:-scale-x-100" fetchPriority="high" /><span className="about-photo-caption">{t("redesign.aboutTag")}</span></div>
        </div>
      </section>
      <section className="about-process">
        <div className="site-container">
          <div className="about-process-heading"><h2>{t("redesign.aboutProcess")}</h2><p>{t("redesign.aboutProcessIntro")}</p></div>
          <ol className="process-grid">{steps.map(({ icon: Icon, title, text }, index) => <li className="process-step" key={title}><span className="process-number">0{index + 1}</span><Icon size={30} strokeWidth={1.5} aria-hidden="true" /><h3>{t(`redesign.${title}`)}</h3><p>{t(`redesign.${text}`)}</p></li>)}</ol>
        </div>
      </section>
      <section className="about-owner">
        <div className="site-container about-owner-inner"><div><h2>{t("redesign.ownerTitle")}</h2><p>{t("redesign.ownerIntro")}</p></div><Link to="/AddProperty" className="owner-link">{t("redesign.ownerAction")} <ArrowUpRight size={19} /></Link></div>
      </section>
    </div>
  );
}
