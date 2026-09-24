import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import useSupabaseClient from "@/backend/supabase/supabase";
import { formatEgp, useSaleCopy } from "./copy";
import "./sales.css";

export default function DealPanel({ conversation }) {
  const supabase = useSupabaseClient();
  const { userId } = useAuth();
  const { i18n } = useTranslation();
  const c = useSaleCopy();
  const [deal, setDeal] = useState(null);
  const [price, setPrice] = useState("");
  const [conditions, setConditions] = useState("");
  const [expires, setExpires] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const reload = async () => {
    const { data, error: queryError } = await supabase.from("sale_deals").select("*")
      .eq("conversation_id", conversation.id).maybeSingle();
    if (queryError) throw queryError;
    setDeal(data);
  };
  useEffect(() => { let active = true; supabase.from("sale_deals").select("*")
    .eq("conversation_id", conversation.id).maybeSingle().then(({ data, error: queryError }) => {
      if (active) { setDeal(data); if (queryError) setError(c.saveFailed); }
    }); return () => { active = false; }; }, [supabase, conversation.id, c]);

  const propose = async (event) => {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      const { error: actionError } = await supabase.rpc("propose_sale_deal", {
        p_conversation: conversation.id, p_price: Number(price), p_conditions: conditions.trim(),
        p_expires_at: new Date(expires).toISOString(),
      });
      if (actionError) throw actionError;
      await reload(); setNotice(c.saved); setConditions("");
    } catch (actionError) { setError(actionError.message || c.saveFailed); }
    finally { setBusy(false); }
  };
  const accept = async () => {
    setError(""); setNotice(""); setBusy(true);
    try {
      const { error: actionError } = await supabase.rpc("accept_sale_deal", { p_deal: deal.id, p_version: deal.offer_version });
      if (actionError) throw actionError;
      await reload(); setNotice(c.saved);
    } catch (actionError) { setError(actionError.message || c.saveFailed); }
    finally { setBusy(false); }
  };
  const canRevise = !deal || ["proposed", "expired", "cancelled", "verification_failed"].includes(deal.status);
  const expired = deal?.status === "proposed" && new Date(deal.expires_at).getTime() <= Date.now();
  const accepted = deal && (userId === deal.buyer_id ? deal.buyer_accepted_version : deal.seller_accepted_version) === deal.offer_version;
  return <section className="sale-panel" aria-label={c.deal}>
    <h2>{c.deal}</h2><p>{c.dealIntro}</p>
    <p className="sale-funding-notice" role="note">{c.fundingDisabled}</p>
    {deal && <div className="sale-panel-terms">
      <div><span>{c.status}</span><strong>{expired ? c.status_expired : c[`status_${deal.status}`] || deal.status}</strong></div>
      <div><span>{c.version}</span><strong>{deal.offer_version}</strong></div>
      <div><span>{c.price}</span><strong>{formatEgp(deal.price_egp, i18n.language)}</strong></div>
      <div><span>{c.fee}</span><strong>{formatEgp(Number(deal.price_egp) * deal.seller_fee_bps / 10000, i18n.language)} ({deal.seller_fee_bps / 100}%)</strong></div>
      <p>{deal.conditions}</p>
      <small>{c.expires}: {new Date(deal.expires_at).toLocaleString(i18n.language)}</small>
      <p>{deal.buyer_accepted_version === deal.offer_version ? c.buyerAccepted : c.notAccepted} · {deal.seller_accepted_version === deal.offer_version ? c.sellerAccepted : c.notAccepted}</p>
      {deal.status === "proposed" && !expired && !accepted && <button type="button" onClick={accept} disabled={busy}>{c.accept}</button>}
      <Link to={`/Deals/${deal.id}`}>{c.deal} →</Link>
    </div>}
    {canRevise && <form onSubmit={propose} className="sale-form">
      <h3>{deal ? c.revise : c.propose}</h3>
      <label>{c.price}<input type="number" min="1" step="1" required value={price} onChange={(event) => setPrice(event.target.value)} /></label>
      <label>{c.conditions}<textarea minLength={10} maxLength={5000} required value={conditions} onChange={(event) => setConditions(event.target.value)} /></label>
      <label>{c.expires}<input type="datetime-local" required value={expires} onChange={(event) => setExpires(event.target.value)} /></label>
      <p>{c.feeNote}</p><button type="submit" disabled={busy}>{c.submit}</button>
    </form>}
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
  </section>;
}
DealPanel.propTypes = { conversation: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired };
