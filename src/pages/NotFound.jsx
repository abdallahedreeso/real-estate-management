import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <section className="not-found site-container">
      <span>{t("redesign.notFoundEyebrow")}</span>
      <h1>{t("redesign.notFoundTitle")}</h1>
      <p>{t("redesign.notFoundIntro")}</p>
      <Link to="/" className="button-primary">{t("redesign.explore")} <ArrowUpRight size={18} /></Link>
    </section>
  );
}
