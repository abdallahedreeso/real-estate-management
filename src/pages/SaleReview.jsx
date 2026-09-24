import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import useSupabaseClient from "@/backend/supabase/supabase";
import { useSaleCopy } from "@/sales/copy";
import "@/sales/sales.css";

export default function SaleReview() {
  const { userId } = useAuth();
  const supabase = useSupabaseClient();
  const c = useSaleCopy();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [authority, setAuthority] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [deals, setDeals] = useState([]);
  const [reports, setReports] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [listingEvents, setListingEvents] = useState([]);
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const staff = await supabase.from("sale_staff").select("role").eq("user_id", userId).eq("active", true).maybeSingle();
    if (staff.error || !staff.data) { setAllowed(false); setLoading(false); return; }
    setAllowed(true);
    const [listingResult, authorityResult, docResult, dealResult, reportResult, disputeResult, listingEventsResult] = await Promise.all([
      supabase.from("properties").select("property_id,title,seller_id,review_status").eq("property_type", "sale").eq("review_status", "pending"),
      supabase.from("listing_authority_documents").select("*").eq("status", "pending"),
      supabase.from("sale_documents").select("*").eq("review_status", "pending"),
      supabase.from("sale_deals").select("id,status,price_egp").in("status", ["accepted", "reviewing", "ready_for_partner", "release_pending", "refund_pending"]),
      supabase.from("listing_reports").select("*").eq("status", "open"),
      supabase.from("sale_disputes").select("*").neq("status", "resolved"),
      supabase.from("listing_events").select("id,property_id,event_type,actor_id,created_at").order("id", { ascending: false }).limit(50),
    ]);
    setListings(listingResult.data || []); setAuthority(authorityResult.data || []);
    setDocuments(docResult.data || []); setDeals(dealResult.data || []); setReports(reportResult.data || []); setDisputes(disputeResult.data || []);
    setListingEvents(listingEventsResult.data || []);
    setError([listingResult, authorityResult, docResult, dealResult, reportResult, disputeResult, listingEventsResult].find((result) => result.error)?.error?.message || "");
    setLoading(false);
  }, [supabase, userId]);
  useEffect(() => { if (userId) load(); }, [load, userId]);

  const action = async (name, params) => {
    setError("");
    const { error: actionError } = await supabase.rpc(name, params);
    if (actionError) setError(actionError.message);
    else await load();
  };
  const openDocument = async (bucket, path) => {
    const { data, error: urlError } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
    if (urlError) setError(urlError.message);
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  if (loading) return <main className="site-container sale-page"><p role="status">…</p></main>;
  if (!allowed) return <main className="site-container sale-page"><h1>{c.unavailable}</h1></main>;
  return <main className="site-container sale-page"><header><h1>{c.review}</h1></header>{error && <p role="alert">{error}</p>}<label className="sale-review-note">{c.reviewNote}<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} /></label>
    <section><h2>{c.listings}</h2><ul className="sale-list">{listings.map((item) => <li key={item.property_id}><Link to={`/property/${item.property_id}`}>{item.title}</Link><span>{c.pending}</span><button type="button" onClick={() => action("review_sale_listing", { p_property: item.property_id, p_approved: true })}>{c.approve}</button><button type="button" onClick={() => action("review_sale_listing", { p_property: item.property_id, p_approved: false })}>{c.reject}</button></li>)}</ul></section>
    <section><h2>{c.authority}</h2><ul className="sale-list">{authority.map((item) => <li key={item.id}><button type="button" onClick={() => openDocument("listing-authority", item.object_path)}>{item.property_id}</button><button type="button" onClick={() => action("review_listing_authority", { p_document: item.id, p_approved: true, p_note: reviewNote })}>{c.approve}</button><button type="button" disabled={reviewNote.trim().length < 10} onClick={() => action("review_listing_authority", { p_document: item.id, p_approved: false, p_note: reviewNote })}>{c.reject}</button></li>)}</ul></section>
    <section><h2>{c.documents}</h2><ul className="sale-list">{documents.map((item) => <li key={item.id}><button type="button" onClick={() => openDocument("sale-documents", item.object_path)}>{c[item.kind]}</button><Link to={`/Deals/${item.deal_id}`}>{c.deal}</Link><button type="button" onClick={() => action("review_sale_document", { p_document: item.id, p_approved: true, p_note: reviewNote })}>{c.approve}</button><button type="button" disabled={reviewNote.trim().length < 10} onClick={() => action("review_sale_document", { p_document: item.id, p_approved: false, p_note: reviewNote })}>{c.reject}</button></li>)}</ul></section>
    <section><h2>{c.dealReview}</h2><ul className="sale-list">{deals.map((item) => <li key={item.id}><Link to={`/Deals/${item.id}`}>{item.id.slice(0, 8)}</Link><span>{c[`status_${item.status}`] || item.status}</span>{item.status === "accepted" && <button type="button" onClick={() => action("advance_sale_review", { p_deal: item.id, p_next: "reviewing" })}>{c.startReview}</button>}{item.status === "reviewing" && <button type="button" onClick={() => action("advance_sale_review", { p_deal: item.id, p_next: "ready_for_partner" })}>{c.ready}</button>}{["accepted", "reviewing"].includes(item.status) && <button type="button" onClick={() => action("advance_sale_review", { p_deal: item.id, p_next: "verification_failed" })}>{c.failed}</button>}{["accepted", "reviewing"].includes(item.status) && <button type="button" disabled={reviewNote.trim().length < 10} onClick={() => action("cancel_sale_deal", { p_deal: item.id, p_reason: reviewNote })}>{c.cancel}</button>}{item.status === "ready_for_partner" && <span>{c.demoTitle}</span>}</li>)}</ul></section>
    <section><h2>{c.dispute}</h2><ul className="sale-list">{disputes.map((item) => <li key={item.id}><Link to={`/Deals/${item.deal_id}`}>{item.reason}</Link><button type="button" disabled={reviewNote.trim().length < 20} onClick={() => action("resolve_sale_dispute", { p_dispute: item.id, p_resolution: reviewNote })}>{c.resolve}</button></li>)}</ul></section>
    <section><h2>{c.report}</h2><ul className="sale-list">{reports.map((item) => <li key={item.id}><Link to={`/property/${item.property_id}`}>{item.reason}</Link><p>{item.details}</p><button type="button" disabled={reviewNote.trim().length < 10} onClick={() => action("resolve_listing_report", { p_report: item.id, p_resolution: "resolved", p_note: reviewNote })}>{c.resolve}</button><button type="button" disabled={reviewNote.trim().length < 10} onClick={() => action("resolve_listing_report", { p_report: item.id, p_resolution: "dismissed", p_note: reviewNote })}>{c.dismiss}</button></li>)}</ul></section>
    <section><h2>{c.timeline}</h2><ol className="sale-list">{listingEvents.map((item) => <li key={item.id}><Link to={`/property/${item.property_id}`}>{c[`event_${item.event_type}`] || item.event_type.replaceAll("_", " ")}</Link><small>{item.actor_id} · {new Date(item.created_at).toLocaleString()}</small></li>)}</ol></section>
  </main>;
}
