import ContactForm from "@/components/contact us/ContactForm";
import { useTranslation } from "react-i18next";
import { Mail, ArrowUpRight } from "lucide-react";

const ContactUs = () => {
  const { t } = useTranslation();
  return (
    <section className="contact-page" aria-labelledby="contact-title">
      <div className="site-container contact-grid">
        <div className="contact-intro">
          <div className="contact-marker" aria-hidden="true"><span /><span /></div>
          <h1 id="contact-title">{t("redesign.contactTitle")}</h1>
          <p>{t("redesign.contactIntro")}</p>
          <a href="mailto:abdallahedreeso2@gmail.com" className="contact-email"><Mail size={20} aria-hidden="true" /><span>abdallahedreeso2@gmail.com</span><ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
        <ContactForm />
      </div>
    </section>
  );
};

export default ContactUs;
