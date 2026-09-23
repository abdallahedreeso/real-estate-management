import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import useSupabaseClient from "@/backend/supabase/supabase";

export default function ChatBox({ propertyId, sellerId, propertyTitle, conversationId, counterpartName }) {
  const { t, i18n } = useTranslation();
  const { userId } = useAuth();
  const { user } = useUser();
  const displayName = (user?.fullName || user?.username || user?.firstName || "").trim().slice(0, 120);
  const supabase = useSupabaseClient();
  const [threadId, setThreadId] = useState(conversationId || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const endRef = useRef(null);

  const loadMessages = useCallback(async (id) => {
    const { data, error: queryError } = await supabase.from("property_messages")
      .select("id,sender_id,body,created_at")
      .eq("conversation_id", id).order("created_at", { ascending: true }).limit(200);
    if (queryError) throw queryError;
    setMessages(data || []);
  }, [supabase]);

  useEffect(() => {
    let active = true;
    setThreadId(conversationId || null);
    setMessages([]);
    setError("");
    setLoadFailed(false);
    if (!userId || !supabase) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        let id = conversationId;
        let savedName;
        if (id && userId !== sellerId && displayName) {
          const { data, error: queryError } = await supabase.from("property_conversations")
            .select("seeker_display_name").eq("id", id).single();
          if (queryError) throw queryError;
          savedName = data.seeker_display_name;
        }
        if (!id && propertyId && userId !== sellerId) {
          const { data, error: queryError } = await supabase.from("property_conversations")
            .select("id,seeker_display_name").eq("property_id", propertyId).eq("seeker_id", userId).maybeSingle();
          if (queryError) throw queryError;
          id = data?.id;
          savedName = data?.seeker_display_name;
        }
        if (id && userId !== sellerId && displayName && savedName !== displayName) {
          const { error: nameError } = await supabase.from("property_conversations")
            .update({ seeker_display_name: displayName }).eq("id", id);
          if (nameError) console.error("Could not refresh inquiry display name:", { code: nameError.code, message: nameError.message });
        }
        if (id) {
          const { data, error: queryError } = await supabase.from("property_messages")
            .select("id,sender_id,body,created_at")
            .eq("conversation_id", id).order("created_at", { ascending: true }).limit(200);
          if (queryError) throw queryError;
          if (active) { setThreadId(id); setMessages(data || []); }
        }
      } catch (loadError) {
        console.error("Conversation query failed:", { code: loadError.code, message: loadError.message });
        if (active) { setError(t("inquiries.loadFailed")); setLoadFailed(true); }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [conversationId, propertyId, sellerId, supabase, userId, displayName, t, retryKey]);

  useEffect(() => {
    if (!threadId || !supabase) return;
    const markVisibleRead = () => supabase.from("notifications").update({ read_at: new Date().toISOString() })
      .eq("conversation_id", threadId).eq("recipient_id", userId).is("read_at", null)
      .then(({ error: readError }) => { if (readError) console.error("Could not mark notifications as read:", readError.message); });
    markVisibleRead();
    const channel = supabase.channel(`inquiry:${threadId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "property_messages", filter: `conversation_id=eq.${threadId}`,
      }, ({ new: incoming }) => {
        setMessages((current) => current.some((item) => item.id === incoming.id) ? current : [...current, incoming]);
        if (incoming.sender_id !== userId && document.visibilityState === "visible") markVisibleRead();
      }).subscribe();
    const refresh = () => { if (document.visibilityState === "visible") { loadMessages(threadId).catch(() => {}); markVisibleRead(); } };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      supabase.removeChannel(channel);
    };
  }, [threadId, supabase, loadMessages, userId]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !userId || sending || loading || loadFailed) return;
    setSending(true);
    setError("");
    try {
      let id = threadId;
      if (!id) {
        const { data, error: createError } = await supabase.from("property_conversations")
          .insert({ property_id: propertyId, seeker_id: userId, seller_id: sellerId, seeker_display_name: displayName || null })
          .select("id").single();
        if (createError) {
          if (createError.code !== "23505") throw createError;
          const existing = await supabase.from("property_conversations").select("id")
            .eq("property_id", propertyId).eq("seeker_id", userId).single();
          if (existing.error) throw existing.error;
          id = existing.data.id;
        } else id = data.id;
        setThreadId(id);
      }
      const { data, error: sendError } = await supabase.from("property_messages")
        .insert({ conversation_id: id, sender_id: userId, body })
        .select("id,sender_id,body,created_at").single();
      if (sendError) throw sendError;
      setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data]);
      setDraft("");
    } catch (sendError) {
      console.error("Message send failed:", { code: sendError.code, message: sendError.message });
      setError(t("inquiries.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  return <section className="inquiry-chat" aria-label={t("inquiries.chatLabel")}>
    <header className="inquiry-chat-header"><strong>{propertyTitle}</strong><span>{counterpartName ? t("inquiries.fromSeeker", { name: counterpartName }) : t("inquiries.privateConversation")}</span></header>
    <div className="inquiry-chat-messages" aria-live="polite">
      {loading ? <p className="inquiry-chat-state">{t("inquiries.loading")}</p> : messages.length === 0 ? <p className="inquiry-chat-state">{t("inquiries.empty")}</p> : messages.map((item) => {
        const isOwn = item.sender_id === userId;
        const senderName = isOwn ? (displayName ? t("inquiries.youNamed", { name: displayName }) : t("inquiries.you")) : counterpartName || t("inquiries.ownerConversation");
        return <div key={item.id} className={`inquiry-message ${isOwn ? "is-own" : ""}`}>
          <span className="inquiry-message-sender">{senderName}</span>
          <p>{item.body}</p><time dateTime={item.created_at}>{new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}</time>
        </div>;
      })}
      <div ref={endRef} />
    </div>
    <form className="inquiry-chat-compose" onSubmit={send}>
      <label className="sr-only" htmlFor={`inquiry-${conversationId || propertyId}`}>{t("inquiries.messageLabel")}</label>
      <input id={`inquiry-${conversationId || propertyId}`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder={t("inquiries.placeholder")} disabled={loading || sending || loadFailed} />
      <button type="submit" disabled={!draft.trim() || loading || sending || loadFailed} aria-label={t("inquiries.send")}><Send size={18} aria-hidden="true" /></button>
    </form>
    {error && <div className="inquiry-chat-error" role="alert">{error}{loadFailed && <button type="button" onClick={() => setRetryKey((current) => current + 1)}>{t("inquiries.retry")}</button>}</div>}
  </section>;
}

ChatBox.propTypes = {
  propertyId: PropTypes.string.isRequired,
  sellerId: PropTypes.string.isRequired,
  propertyTitle: PropTypes.string,
  conversationId: PropTypes.string,
  counterpartName: PropTypes.string,
};
