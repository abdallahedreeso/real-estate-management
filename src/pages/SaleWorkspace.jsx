import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import useSupabaseClient from "@/backend/supabase/supabase";
import { formatEgp, useSaleCopy } from "@/sales/copy";
import "@/sales/sales.css";

const documentKinds = ["identity", "seller_authority", "title", "encumbrance", "agreement", "registration", "handover", "other"];

export default function SaleWorkspace() {
  const { id } = useParams();
  const { userId } = useAuth();
  const { i18n } = useTranslation();
  const supabase = useSupabaseClient();
  const c = useSaleCopy();
  const [deal, setDeal] = useState(null);
  const [events, setEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [kind, setKind] = useState("identity");
  const [file, setFile] = useState(null);
  const [reason, setReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: dealError } = await supabase.from("sale_deals").select("*").eq("id", id).maybeSingle();
    if (dealError || !data) { setDeal(null); setError(dealError?.message || c.unavailable); setLoading(false); return; }
    const [eventsResult, documentsResult, disputesResult, paymentsResult] = await Promise.all([
      supabase.from("sale_events").select("*").eq("deal_id", id).order("id", { ascending: false }),
      supabase.from("sale_documents").select("*").eq("deal_id", id).order("created_at", { ascending: false }),
      supabase.from("sale_disputes").select("*").eq("deal_id", id).order("created_at", { ascending: false }),
      supabase.from("sale_payment_references").select("id,provider,provider_reference,state,amount_egp,created_at").eq("deal_id", id).order("created_at", { ascending: false }),
    ]);
    setDeal(data); setEvents(eventsResult.data || []); setDocuments(documentsResult.data || []); setDisputes(disputesResult.data || []); setPayments(paymentsResult.data || []);
    setError(eventsResult.error?.message || documentsResult.error?.message || disputesResult.error?.message || paymentsResult.error?.message || "");
    setLoading(false);
  }, [supabase, id, c]);
  useEffect(() => { load(); }, [load]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file || file.size > 10485760 || !["application/pdf","image/png","image/jpeg"].includes(file.type)) {
      setError(c.uploadNote); return;
    }
    setBusy(true); setError("");
    const path = `${id}/${userId}/${crypto.randomUUID()}`;
    let uploaded = false;
    try {
      const { error: uploadError } = await supabase.storage.from("sale-documents").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      uploaded = true;
      const { error: recordError } = await supabase.from("sale_documents").insert({ deal_id: id, uploaded_by: userId, kind, object_path: path });
      if (recordError) throw recordError;
      setFile(null); event.target.reset(); await load();
    } catch (actionError) { if (uploaded) await supabase.storage.from("sale-documents").remove([path]); setError(actionError.message || c.saveFailed); }
    finally { setBusy(false); }
  };
  const openDocument = async (path) => {
    const { data, error: urlError } = await supabase.storage.from("sale-documents").createSignedUrl(path, 60);
    if (urlError) setError(urlError.message);
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  const openDispute = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    const { error: actionError } = await supabase.from("sale_disputes").insert({ deal_id: id, opened_by: userId, reason: reason.trim() });
    if (actionError) setError(actionError.message);
    else { setReason(""); await load(); }
    setBusy(false);
  };
  const cancel = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    const { error: actionError } = await supabase.rpc("cancel_sale_deal", { p_deal: id, p_reason: cancelReason.trim() });
    if (actionError) setError(actionError.message);
    else { setCancelReason(""); await load(); }
    setBusy(false);
  };

  if (loading) return <main className="site-container sale-page"><p role="status">…</p></main>;
  if (!deal) return <main className="site-container sale-page"><p role="alert">{error || c.unavailable}</p></main>;
  return <main className="site-container sale-page">
    <Link to="/Deals">← {c.deals}</Link>
    <header><h1>{c.deal}</h1><p>{c.dealIntro}</p></header>
    <p className="sale-funding-notice" role="note">{c.fundingDisabled}</p>
    {error && <p role="alert">{error}</p>}
    <div className="sale-summary"><div><span>{c.status}</span><strong>{deal.status === "proposed" && new Date(deal.expires_at).getTime() <= Date.now() ? c.status_expired : c[`status_${deal.status}`] || deal.status}</strong></div><div><span>{c.price}</span><strong>{formatEgp(deal.price_egp, i18n.language)}</strong></div><div><span>{c.fee}</span><strong>{formatEgp(Number(deal.price_egp) * deal.seller_fee_bps / 10000, i18n.language)}</strong></div></div>
    <p>{deal.conditions}</p><p>{c.feeNote}</p>
    <section><h2>{c.payment}</h2>{payments.length === 0 ? <p>{c.fundingDisabled}</p> : <ul className="sale-list">{payments.map((item) => <li key={item.id}><strong>{c[`payment_${item.state}`] || item.state}</strong><span>{formatEgp(item.amount_egp, i18n.language)}</span><small>{c.partnerRef}: {item.provider_reference}</small></li>)}</ul>}</section>
    <div className="sale-workspace-grid">
      <section><h2>{c.evidence}</h2><p>{c.uploadNote}</p>
        <form onSubmit={upload} className="sale-form"><label>{c.kind}<select value={kind} onChange={(event) => setKind(event.target.value)}>{documentKinds.map((item) => <option key={item} value={item}>{c[item]}</option>)}</select></label><input type="file" accept=".pdf,.png,.jpg,.jpeg" required onChange={(event) => setFile(event.target.files?.[0] || null)} /><button type="submit" disabled={busy}>{c.upload}</button></form>
        <ul className="sale-list">{documents.map((item) => <li key={item.id}><button type="button" onClick={() => openDocument(item.object_path)}>{c[item.kind]}</button><span>{c[item.review_status]}</span>{item.review_note && <small>{item.review_note}</small>}</li>)}</ul>
      </section>
      <section><h2>{c.timeline}</h2><ol className="sale-list">{events.map((item) => <li key={item.id}><strong>{c[`event_${item.event_type}`] || item.event_type.replaceAll("_", " ")}</strong><time>{new Date(item.created_at).toLocaleString(i18n.language)}</time></li>)}</ol></section>
    </div>
    <section className="sale-issues"><h2>{c.dispute}</h2><form onSubmit={openDispute} className="sale-form"><label>{c.disputeReason}<textarea minLength={20} maxLength={3000} required value={reason} onChange={(event) => setReason(event.target.value)} /></label><button type="submit" disabled={busy}>{c.openDispute}</button></form><ul className="sale-list">{disputes.map((item) => <li key={item.id}><span>{item.reason}</span><strong>{item.status}</strong></li>)}</ul></section>
    {deal.status === "proposed" && userId && [deal.buyer_id, deal.seller_id].includes(userId) && <section><h2>{c.cancel}</h2><form onSubmit={cancel} className="sale-form"><label>{c.cancelReason}<textarea minLength={10} maxLength={1000} required value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></label><button type="submit" disabled={busy}>{c.cancel}</button></form></section>}
  </main>;
}
