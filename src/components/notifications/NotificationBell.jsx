import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, MessageCircle, X } from "lucide-react";
import useSupabaseClient from "@/backend/supabase/supabase";

export default function NotificationBell() {
  const { userId } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === "visible");
  const rootRef = useRef(null);
  const announcedIds = useRef(new Set());
  const visibleToast = toastQueue[0];
  const load = useCallback(async () => {
    if (!userId || !supabase) return;
    const [listResult, countResult] = await Promise.all([
      supabase.from("notifications").select("id,conversation_id,property_id,sender_id,created_at,read_at,properties(title)")
        .eq("recipient_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("notifications").select("id", { count: "exact", head: true })
        .eq("recipient_id", userId).is("read_at", null),
    ]);
    if (listResult.error || countResult.error) { setError(true); return; }
    setError(false);
    setItems(listResult.data || []);
    setUnread(countResult.count || 0);
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId || !supabase) return;
    load();
    const channel = supabase.channel(`notifications:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` }, ({ new: incoming }) => {
        if (incoming.recipient_id !== userId) return;
        if (!announcedIds.current.has(incoming.id)) {
          announcedIds.current.add(incoming.id);
          if (announcedIds.current.size > 1000) announcedIds.current.delete(announcedIds.current.values().next().value);
          setToastQueue((current) => [...current, incoming]);
        }
        load();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` }, load)
      .subscribe((status) => { if (status === "SUBSCRIBED") load(); });
    const refresh = () => { if (document.visibilityState === "visible") load(); };
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      document.removeEventListener("visibilitychange", updateVisibility);
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, load]);

  useEffect(() => { if (!userId) { setItems([]); setUnread(0); setOpen(false); setToastQueue([]); announcedIds.current.clear(); } }, [userId]);

  useEffect(() => {
    if (!visibleToast || !pageVisible) return;
    const timer = window.setTimeout(() => setToastQueue((current) => current.slice(1)), 6500);
    return () => window.clearTimeout(timer);
  }, [visibleToast, pageVisible]);

  useEffect(() => {
    if (!open) return;
    const close = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [open]);

  const markRead = async (ids = null) => {
    if (ids && !ids.length) return;
    let query = supabase.from("notifications")
      .update({ read_at: new Date().toISOString() }).eq("recipient_id", userId).is("read_at", null);
    if (ids) query = query.in("id", ids);
    const { error: updateError } = await query;
    if (updateError) { setError(true); return; }
    load();
  };

  return <div className="notification-root" ref={rootRef}>
    <button type="button" className="notification-trigger" onClick={() => setOpen((value) => !value)} aria-label={t("notifications.label", { count: unread })} aria-expanded={open}>
      <Bell size={20} aria-hidden="true" />{unread > 0 && <span className="notification-count">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <div className="notification-panel" role="region" aria-label={t("notifications.title")}>
      <div className="notification-panel-head"><strong>{t("notifications.title")}</strong>{unread > 0 && <button type="button" onClick={() => markRead()}><CheckCheck size={16} aria-hidden="true" />{t("notifications.markAllRead")}</button>}</div>
      {error ? <p className="notification-state" role="alert">{t("notifications.error")}</p> : items.length === 0 ? <p className="notification-state">{t("notifications.empty")}</p> : <div className="notification-list">{items.map((item) => <button type="button" key={item.id} className={`notification-item ${item.read_at ? "" : "is-unread"}`} onClick={() => { markRead(item.read_at ? [] : [item.id]); setOpen(false); navigate(`/Messages?conversation=${encodeURIComponent(item.conversation_id)}`); }}>
        <span className="notification-item-icon"><MessageCircle size={18} aria-hidden="true" /></span><span><strong>{t("notifications.newMessage")}</strong><span className="notification-property">{item.properties?.title || t("notifications.propertyUnavailable")}</span><small>{new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</small></span>
      </button>)}</div>}
      <button type="button" className="notification-inbox" onClick={() => { setOpen(false); navigate("/Messages"); }}>{t("notifications.openInbox")}</button>
    </div>}
    {visibleToast && <div className="notification-toast" role="status" aria-live="polite">
      <span className="notification-toast-icon"><MessageCircle size={19} aria-hidden="true" /></span>
      <button type="button" className="notification-toast-open" onClick={() => { markRead([visibleToast.id]); setToastQueue((current) => current.slice(1)); navigate(`/Messages?conversation=${encodeURIComponent(visibleToast.conversation_id)}`); }}>
        <strong>{t("notifications.newMessage")}</strong>
        <span>{items.find((item) => item.id === visibleToast.id)?.properties?.title || t("notifications.openInbox")}</span>
      </button>
      <button type="button" className="notification-toast-close" onClick={() => setToastQueue((current) => current.slice(1))} aria-label={t("notifications.dismiss")}><X size={17} aria-hidden="true" /></button>
    </div>}
  </div>;
}
