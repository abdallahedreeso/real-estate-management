import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import PropTypes from "prop-types";
import useSupabaseClient from "@/backend/supabase/supabase";
import { useSaleCopy } from "./copy";

export default function AuthorityUpload({ propertyId }) {
  const supabase = useSupabaseClient();
  const { userId } = useAuth();
  const c = useSaleCopy();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [documents, setDocuments] = useState([]);
  const load = async () => {
    const { data } = await supabase.from("listing_authority_documents").select("id,status,review_note,created_at")
      .eq("property_id", propertyId).order("created_at", { ascending: false });
    setDocuments(data || []);
  };
  useEffect(() => { let active = true; supabase.from("listing_authority_documents").select("id,status,review_note,created_at")
    .eq("property_id", propertyId).order("created_at", { ascending: false })
    .then(({ data }) => { if (active) setDocuments(data || []); });
    return () => { active = false; }; }, [supabase, propertyId]);
  const upload = async (event) => {
    event.preventDefault();
    if (!file || file.size > 10485760 || !["application/pdf","image/png","image/jpeg"].includes(file.type)) {
      setStatus(c.uploadNote); return;
    }
    setBusy(true); setStatus("");
    const path = `${propertyId}/${userId}/${crypto.randomUUID()}`;
    let uploaded = false;
    try {
      const { error: uploadError } = await supabase.storage.from("listing-authority").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      uploaded = true;
      const { error: recordError } = await supabase.from("listing_authority_documents").insert({ property_id: propertyId, owner_id: userId, object_path: path });
      if (recordError) throw recordError;
      setStatus(c.saved); setFile(null); event.target.reset(); await load();
    } catch (error) { if (uploaded) await supabase.storage.from("listing-authority").remove([path]); setStatus(error.message || c.saveFailed); }
    finally { setBusy(false); }
  };
  return <form onSubmit={upload} className="sale-form"><p>{c.authorityHint}</p><label>{c.authority}<input type="file" accept=".pdf,.png,.jpg,.jpeg" required onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><button type="submit" disabled={busy}>{c.upload}</button>{status && <p role="status">{status}</p>}<ul className="sale-list">{documents.map((item) => <li key={item.id}><span>{c[item.status]}</span>{item.review_note && <small>{item.review_note}</small>}</li>)}</ul></form>;
}
AuthorityUpload.propTypes = { propertyId: PropTypes.string.isRequired };
