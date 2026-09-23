import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="site-container footer-top">
        <div className="footer-intro">
          <span className="brand-mark"><Building2 size={27} /><span>REAL<span>ESTATE</span></span></span>
          <h2>{t("redesign.footerTitle")}</h2>
          <p>{t("redesign.footerIntro")}</p>
        </div>
        <div className="footer-links"><h3>{t("redesign.footerExplore")}</h3><Link to="/">{t("navbar.home")}</Link><Link to="/About">{t("navbar.about")}</Link><Link to="/ContactUs">{t("navbar.contact")}</Link></div>
        <div className="footer-links"><h3>{t("redesign.footerContact")}</h3><a href="mailto:abdallahedreeso2@gmail.com"><Mail size={16} /> {t("redesign.footerEmail")} <ArrowUpRight size={15} /></a></div>
      </div>
      <div className="site-container footer-bottom"><span>© {new Date().getFullYear()} Real Estate. {t("redesign.rights")}</span><span>{t("redesign.footerNote")}</span></div>
    </footer>
  );
}
