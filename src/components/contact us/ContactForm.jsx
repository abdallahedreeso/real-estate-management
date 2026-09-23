import { useState } from "react";
import { Input, Button, Form, message } from "antd";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import emailjs from "emailjs-com";

const { TextArea } = Input;

export default function ContactForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const clearError = (field) => setErrors((current) => current[field] ? { ...current, [field]: undefined } : current);

  const messageRegex = /^[\p{L}\p{N}\s.,'!?،؛()-]+$/u;
  const numericOnlyRegex = /^\d+$/;
  const lettersOnlyRegex = /^[\p{L}\s]+$/u;
  const egyptianPhoneRegex = /^(?:\+20|0020)?01[0125]\d{8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const nextErrors = {};
    if (!firstName) nextErrors.firstName = t("contactForm.required");
    else if (!lettersOnlyRegex.test(firstName)) nextErrors.firstName = t("contactForm.lettersOnly");
    if (!lastName) nextErrors.lastName = t("contactForm.required");
    else if (!lettersOnlyRegex.test(lastName)) nextErrors.lastName = t("contactForm.lettersOnly");
    if (!email) nextErrors.email = t("contactForm.required");
    else if (!emailRegex.test(email)) nextErrors.email = t("contactForm.invalidEmail");
    if (!subject) nextErrors.subject = t("contactForm.required");
    else if (!lettersOnlyRegex.test(subject)) nextErrors.subject = t("contactForm.lettersOnly");
    if (!phone) nextErrors.phone = t("contactForm.required");
    else if (!egyptianPhoneRegex.test(phone)) nextErrors.phone = t("contactForm.invalidPhone");
    if (!body) nextErrors.body = t("contactForm.required");
    else if (numericOnlyRegex.test(body)) nextErrors.body = t("contactForm.numbersOnly");
    else if (!messageRegex.test(body)) nextErrors.body = t("contactForm.invalidMessage");
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    const firstInvalid = Object.keys(validationErrors)[0];
    if (firstInvalid) {
      message.error(t("contactForm.fixErrors"));
      requestAnimationFrame(() => {
        const fieldIds = {
          firstName: "contact-first-name", lastName: "contact-last-name", email: "contact-email",
          subject: "contact-subject", phone: "contact-phone", body: "contact-message",
        };
        const field = document.getElementById(fieldIds[firstInvalid]);
        field?.focus({ preventScroll: true });
        field?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "center",
        });
      });
      return;
    }
    setLoading(true);
    try {
      await emailjs.send("service_14n2tub", "template_7jh3nau", {
        subject, email, body, firstName, lastName, seller_phone: phone,
      }, "wTm29m44MLbQaNTd3");
      message.success(t("contactForm.success"));
      setFirstName("");
      setLastName("");
      setSubject("");
      setEmail("");
      setBody("");
      setPhone("");
      setErrors({});
    } catch (error) {
      console.error("Failed to send email.", error);
      message.error(t("contactForm.sendError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-panel">
      <h2>{t("contactForm.title")}</h2>
      <Form layout="vertical" onFinish={handleSubmit} noValidate>
        <div className="contact-name-row">
          <Form.Item label={t("contactForm.firstName")} htmlFor="contact-first-name" required validateStatus={errors.firstName ? "error" : ""} help={errors.firstName}>
            <Input id="contact-first-name" autoComplete="given-name" value={firstName} onChange={(event) => { setFirstName(event.target.value); clearError("firstName"); }} aria-invalid={Boolean(errors.firstName)} />
          </Form.Item>
          <Form.Item label={t("contactForm.lastName")} htmlFor="contact-last-name" required validateStatus={errors.lastName ? "error" : ""} help={errors.lastName}>
            <Input id="contact-last-name" autoComplete="family-name" value={lastName} onChange={(event) => { setLastName(event.target.value); clearError("lastName"); }} aria-invalid={Boolean(errors.lastName)} />
          </Form.Item>
        </div>
        <Form.Item label={t("contactForm.email")} htmlFor="contact-email" required validateStatus={errors.email ? "error" : ""} help={errors.email}>
          <Input id="contact-email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); clearError("email"); }} aria-invalid={Boolean(errors.email)} />
        </Form.Item>
        <Form.Item label={t("contactForm.subject")} htmlFor="contact-subject" required validateStatus={errors.subject ? "error" : ""} help={errors.subject}>
          <Input id="contact-subject" value={subject} onChange={(event) => { setSubject(event.target.value); clearError("subject"); }} aria-invalid={Boolean(errors.subject)} />
        </Form.Item>
        <Form.Item label={t("contactForm.phone")} htmlFor="contact-phone" required validateStatus={errors.phone ? "error" : ""} help={errors.phone}>
          <Input id="contact-phone" type="tel" autoComplete="tel" dir="ltr" value={phone} onChange={(event) => { setPhone(event.target.value); clearError("phone"); }} aria-invalid={Boolean(errors.phone)} />
        </Form.Item>
        <Form.Item label={t("contactForm.message")} htmlFor="contact-message" required validateStatus={errors.body ? "error" : ""} help={errors.body}>
          <TextArea id="contact-message" rows={6} value={body} onChange={(event) => { setBody(event.target.value); clearError("body"); }} aria-invalid={Boolean(errors.body)} />
        </Form.Item>
        <Button htmlType="submit" loading={loading} disabled={loading} className="contact-submit">{t("contactForm.submit")} <ArrowUpRight size={19} aria-hidden="true" /></Button>
      </Form>
    </div>
  );
}
