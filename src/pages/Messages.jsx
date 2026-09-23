import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import useSupabaseClient from "@/backend/supabase/supabase";
import ChatBox from "@/components/chat/ChatBox";

export default function Messages() {
  const { userId } = useAuth();
  const { t } = useTranslation();
  const supabase = useSupabaseClient();
  const [conversations, setConversations] = useState([]);
  const [properties, setProperties] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [searchParams] = useSearchParams();
  const requestedConversation = searchParams.get("conversation");

  useEffect(() => {
    if (!userId || !supabase) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error: queryError } = await supabase.from("property_conversations")
        .select("id,property_id,seeker_id,seeker_display_name,seller_id,created_at")
        .or(`seeker_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (queryError) {
        console.error("Messages query failed:", { code: queryError.code, message: queryError.message });
        setError(true); setLoading(false); return;
      }
      const ids = [...new Set((data || []).map((item) => item.property_id))];
      const result = ids.length ? await supabase.from("properties").select("property_id,title,address").in("property_id", ids) : { data: [], error: null };
      if (!active) return;
      setConversations(data || []);
      setProperties(Object.fromEntries((result.data || []).map((item) => [item.property_id, item])));
      setSelectedId((current) => requestedConversation && data?.some((item) => item.id === requestedConversation) ? requestedConversation : current && data?.some((item) => item.id === current) ? current : data?.[0]?.id || null);
      if (result.error) console.error("Conversation property query failed:", { code: result.error.code, message: result.error.message });
      setError(Boolean(result.error));
      setLoading(false);
    };
    load();
    const refresh = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, [supabase, userId, retryKey, requestedConversation]);

  const selected = useMemo(() => conversations.find((item) => item.id === selectedId), [conversations, selectedId]);
  const seekerLabel = (item) => item.seeker_display_name?.trim() || t("inquiries.memberId", { id: item.seeker_id.slice(-6) });
  return <main className="inquiries-page site-container">
    <div className="inquiries-heading"><span>{t("inquiries.eyebrow")}</span><h1>{t("inquiries.title")}</h1><p>{t("inquiries.intro")}</p></div>
    {loading ? <p role="status">{t("inquiries.loading")}</p> : error ? <div className="inquiries-empty" role="alert"><MessageCircle size={32} aria-hidden="true" /><h2>{t("inquiries.loadFailed")}</h2><button type="button" onClick={() => setRetryKey((current) => current + 1)}>{t("inquiries.retry")}</button></div> : conversations.length === 0 ?
      <div className="inquiries-empty"><MessageCircle size={32} aria-hidden="true" /><h2>{t("inquiries.noConversations")}</h2><Link to="/#explore">{t("inquiries.explore")} <ArrowUpRight size={17} aria-hidden="true" /></Link></div> :
      <div className="inquiries-layout">
        <nav className="inquiries-list" aria-label={t("inquiries.conversations")}>
          {conversations.map((item) => <button type="button" key={item.id} className={selectedId === item.id ? "is-active" : ""} onClick={() => setSelectedId(item.id)} aria-current={selectedId === item.id ? "true" : undefined}>
            <strong>{item.seller_id === userId ? seekerLabel(item) : t("inquiries.ownerConversation")}</strong>
            <span>{properties[item.property_id]?.title || t("inquiries.propertyUnavailable")}</span>
          </button>)}
        </nav>
        {selected && <div className="inquiries-thread"><ChatBox key={selected.id} conversationId={selected.id} propertyId={selected.property_id} sellerId={selected.seller_id} propertyTitle={properties[selected.property_id]?.title || t("inquiries.propertyUnavailable")} counterpartName={selected.seller_id === userId ? seekerLabel(selected) : undefined} /><Link to={`/property/${selected.property_id}`}>{t("inquiries.viewProperty")} <ArrowUpRight size={16} aria-hidden="true" /></Link></div>}
      </div>}
  </main>;
}
