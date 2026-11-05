import { useEffect, useState } from "react";
import { BellPlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAgentSession } from "@/contexts/AgentSessionContext";
import { AgentSessionExpiredError, ticketControlRequest } from "@/lib/ticket-control";

type Announcement = { id: string; type: "PANNE" | "TARIF" | "NOTE"; title: string; message: string; effective_date: string | null; created_at: string };
const labels = { PANNE: "Panne ou perturbation", TARIF: "Tarif", NOTE: "Note" };

export default function AnnouncementAdministration() {
  const { session, clearSession } = useAgentSession();
  const [items, setItems] = useState<Announcement[]>([]);
  const [type, setType] = useState<Announcement["type"]>("NOTE");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!session) return;
    setLoading(true); setError("");
    try { const data = await ticketControlRequest<{ announcements: Announcement[] }>({ action: "list_announcements" }, session.token); setItems(data.announcements || []); }
    catch (err) { if (err instanceof AgentSessionExpiredError) clearSession(); setError(err instanceof Error ? err.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [session?.token]);

  async function create() {
    if (!session || saving || !title.trim() || !message.trim()) return;
    setSaving(true); setError("");
    try {
      await ticketControlRequest({ action: "create_announcement", type, title: title.trim(), message: message.trim(), effective_date: effectiveDate }, session.token);
      setTitle(""); setMessage(""); setEffectiveDate(""); toast.success("L’information est publiée dans INFO."); await load();
    } catch (err) { if (err instanceof AgentSessionExpiredError) clearSession(); setError(err instanceof Error ? err.message : "Publication impossible."); }
    finally { setSaving(false); }
  }
  async function remove(id: string) {
    if (!session || saving) return;
    setSaving(true);
    try { await ticketControlRequest({ action: "delete_announcement", announcement_id: id }, session.token); toast.success("Information supprimée."); await load(); }
    catch (err) { if (err instanceof AgentSessionExpiredError) clearSession(); setError(err instanceof Error ? err.message : "Suppression impossible."); }
    finally { setSaving(false); }
  }

  return <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-800"><BellPlus /></span><div><h2 className="text-xl font-extrabold">INFO — annonces clients</h2><p className="text-sm text-slate-600">Publiez une panne, un changement de tarif ou une note.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="announcement-type">Type</Label><Select value={type} onValueChange={value => setType(value as Announcement["type"])}><SelectTrigger id="announcement-type" className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(labels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="announcement-date">Date concernée (facultatif)</Label><Input id="announcement-date" type="date" value={effectiveDate} onChange={event => setEffectiveDate(event.target.value)} className="h-12 rounded-xl" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="announcement-title">Titre</Label><Input id="announcement-title" value={title} maxLength={120} onChange={event => setTitle(event.target.value)} placeholder="Ex. Départ reporté" className="h-12 rounded-xl" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="announcement-message">Message</Label><Textarea id="announcement-message" value={message} maxLength={2000} onChange={event => setMessage(event.target.value)} placeholder="Écrivez l’information à transmettre aux clients…" className="min-h-28 rounded-xl" /></div></div>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Button disabled={saving || !title.trim() || !message.trim()} onClick={() => void create()} className="mt-4 h-12 rounded-xl bg-brand-navy font-bold text-white hover:bg-brand-navy/90">{saving ? <Loader2 className="animate-spin" /> : <BellPlus />} Publier dans INFO</Button><div className="mt-6 space-y-3 border-t border-slate-100 pt-5"><h3 className="font-bold">Informations publiées</h3>{loading ? <p role="status" className="text-sm text-slate-600">Chargement…</p> : items.length === 0 ? <p className="text-sm text-slate-500">Aucune information publiée.</p> : items.map(item => <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-4"><div><p className="text-xs font-bold uppercase text-blue-800">{labels[item.type]}</p><p className="mt-1 font-bold">{item.title}</p><p className="mt-1 whitespace-pre-line text-sm text-slate-600">{item.message}</p></div><Button variant="ghost" size="icon" aria-label={`Supprimer ${item.title}`} disabled={saving} onClick={() => void remove(item.id)} className="shrink-0 text-red-700 hover:bg-red-50"><Trash2 /></Button></div>)}</div></section>;
}
