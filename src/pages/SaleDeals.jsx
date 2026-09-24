import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import useSupabaseClient from "@/backend/supabase/supabase";
import { formatEgp, useSaleCopy } from "@/sales/copy";
import "@/sales/sales.css";

export default function SaleDeals() {
  const { userId } = useAuth();
  const supabase = useSupabaseClient();
  const { i18n } = useTranslation();
  const c = useSaleCopy();
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { if (!userId) return; supabase.from("sale_deals").select("id,property_id,price_egp,status,expires_at,updated_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`).order("updated_at", { ascending: false })
    .then(({ data, error: queryError }) => { setDeals(data || []); setError(queryError?.message || ""); }); }, [supabase, userId]);
  return <main className="site-container sale-page"><header><h1>{c.deals}</h1><p>{c.dealIntro}</p></header>
    <p className="sale-funding-notice" role="note">{c.fundingDisabled}</p>{error && <p role="alert">{error}</p>}
    <ul className="sale-deal-list">{deals.map((deal) => <li key={deal.id}><Link to={`/Deals/${deal.id}`}><strong>{formatEgp(deal.price_egp, i18n.language)}</strong><span>{deal.status === "proposed" && new Date(deal.expires_at).getTime() <= Date.now() ? c.status_expired : c[`status_${deal.status}`] || deal.status}</span><time>{new Date(deal.updated_at).toLocaleDateString(i18n.language)}</time></Link></li>)}</ul>
  </main>;
}
