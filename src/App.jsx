import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// 🔧 COLE SUAS CHAVES DIRETAMENTE AQUI
// (substitua os valores abaixo pelos seus do Supabase)
const SUPABASE_URL = "https://qjddturrvvkfurqmqgyh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZGR0dXJydnZrZnVycW1xZ3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODkzMTgsImV4cCI6MjA5NDA2NTMxOH0.4l1Hwq1k1X11WKdeDVrHFppnrBpqfDCusRbBbr3b6-g;" // 
// ─────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TIPOS = ["Frontlight", "Painel de LED", "Empena", "Banca de Jornal"];

const BC = {
  Frontlight:      { bg: "#FFF3E0", tx: "#8B4B00" },
  "Painel de LED": { bg: "#E8F5E9", tx: "#1B5E20" },
  Empena:          { bg: "#E3F2FD", tx: "#0D47A1" },
  "Banca de Jornal":{ bg: "#FCE4EC", tx: "#880E4F" },
};

const EMPTY = {
  nome: "", tipo: "Frontlight", reg: "", end: "",
  preco: "", dim: "", ilum: "", obs: "", img: null,
};

// ── Componentes auxiliares ─────────────────────────

function Logo({ size = 18 }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1 }}>
      <span style={{ color: "#C1272D" }}>H</span>
      <span style={{ color: "#B8842A" }}>o</span>
      <span style={{ color: "#B8922A" }}>c</span>
      <span style={{ color: "#1B6CA8" }}>&gt;&gt;</span>
      <span style={{ color: "#111" }}>&lt;</span>
    </span>
  );
}

function Badge({ tipo }) {
  const c = BC[tipo] || BC["Frontlight"];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: c.bg, color: c.tx, letterSpacing: "0.04em" }}>
      {tipo}
    </span>
  );
}

function Spinner() {
  return <div style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #ddd", borderTopColor: "#C1272D", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

// ── Card ──────────────────────────────────────────

function Card({ p, selMode, selected, onToggle, onEdit, onDelete }) {
  return (
    <div
      onClick={selMode ? onToggle : undefined}
      style={{
        background: "white", borderRadius: 12, overflow: "hidden",
        border: selected ? "2px solid #1B6CA8" : "1px solid #e8e8e8",
        cursor: selMode ? "pointer" : "default",
        boxShadow: selected ? "0 0 0 3px rgba(27,108,168,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "border-color .15s, box-shadow .15s",
      }}
    >
      <div style={{ width: "100%", height: 130, background: "#f5f5f5", position: "relative", overflow: "hidden" }}>
        {p.img
          ? <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 28 }}>📷</div>
        }
        {selMode && (
          <div style={{
            position: "absolute", top: 8, left: 8, width: 22, height: 22, borderRadius: "50%",
            background: selected ? "#1B6CA8" : "rgba(255,255,255,0.92)",
            border: selected ? "2px solid #1B6CA8" : "2px solid #ccc",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: selected ? "#fff" : "transparent", fontSize: 12, transition: "all .15s",
          }}>✓</div>
        )}
      </div>

      <div style={{ padding: "10px 12px 8px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</div>
        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7 }}>
          {p.reg && <div>📍 {p.reg}</div>}
          {p.dim && <div>📐 {p.dim}</div>}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderTop: "1px solid #f0f0f0" }}>
        <Badge tipo={p.tipo} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {p.preco && <span style={{ fontSize: 12, fontWeight: 600, color: "#C1272D" }}>R$ {p.preco}</span>}
          {!selMode && (
            <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
              <button onClick={onEdit} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 6, border: "1px solid #e0e0e0", background: "white", cursor: "pointer" }}>✏️ Editar</button>
              <button onClick={onDelete} style={{ padding: "4px 8px", fontSize: 11, borderRadius: 6, border: "1px solid #fca5a5", background: "white", cursor: "pointer", color: "#C1272D" }}>🗑️</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal de Cadastro / Edição ─────────────────────

function Modal({ inicial, onSave, onClose, saving }) {
  const [form, setForm] = useState(inicial || EMPTY);
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("img", ev.target.result);
    reader.readAsDataURL(file);
  };

  const inp = (k, placeholder) => (
    <input value={form[k] || ""} onChange={e => set(k, e.target.value)} placeholder={placeholder}
      style={{ width: "100%", height: 36, padding: "0 10px", fontSize: 13, border: "1px solid #e0e0e0", borderRadius: 8, fontFamily: "inherit", background: "#fafafa", boxSizing: "border-box" }} />
  );

  const label = (txt) => (
    <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{txt}</label>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: 500, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{form.id ? "Editar ponto" : "Novo ponto de mídia"}</h3>
          <button onClick={onClose} style={{ border: "none", background: "#f5f5f5", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Foto */}
        <div style={{ marginBottom: 14 }}>
          {label("Foto do ponto")}
          <div onClick={() => fileRef.current.click()}
            style={{ border: "1.5px dashed #ddd", borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer", fontSize: 13, color: "#999" }}>
            📷 Clique para adicionar foto
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
          </div>
          {form.img && <img src={form.img} alt="" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />}
        </div>

        {/* Nome */}
        <div style={{ marginBottom: 12 }}>
          {label("Nome do ponto *")}
          {inp("nome", "Ex: Frontlight Zona Sul #01")}
        </div>

        {/* Tipo + Região */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            {label("Tipo de mídia *")}
            <select value={form.tipo} onChange={e => set("tipo", e.target.value)}
              style={{ width: "100%", height: 36, padding: "0 10px", fontSize: 13, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fafafa", fontFamily: "inherit" }}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            {label("Região *")}
            {inp("reg", "Ex: Zona Sul, Centro...")}
          </div>
        </div>

        {/* Endereço + Preço */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>{label("Endereço")}{inp("end", "Rua, número...")}</div>
          <div>{label("Preço mensal (R$)")}{inp("preco", "Ex: 3.500,00")}</div>
        </div>

        {/* Dimensões + Iluminação */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>{label("Dimensões")}{inp("dim", "Ex: 9m x 3m")}</div>
          <div>
            {label("Iluminação")}
            <select value={form.ilum || ""} onChange={e => set("ilum", e.target.value)}
              style={{ width: "100%", height: 36, padding: "0 10px", fontSize: 13, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fafafa", fontFamily: "inherit" }}>
              <option value="">—</option>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </div>
        </div>

        {/* Obs */}
        <div style={{ marginBottom: 20 }}>
          {label("Observações")}
          <textarea value={form.obs || ""} onChange={e => set("obs", e.target.value)}
            placeholder="Visibilidade, tráfego, disponibilidade..."
            style={{ width: "100%", height: 70, padding: "8px 10px", fontSize: 13, border: "1px solid #e0e0e0", borderRadius: 8, resize: "vertical", fontFamily: "inherit", background: "#fafafa", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", fontSize: 13, borderRadius: 8, border: "1px solid #e0e0e0", background: "white", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={() => onSave(form)} disabled={saving}
            style={{ padding: "8px 20px", fontSize: 13, borderRadius: 8, border: "none", background: saving ? "#e0e0e0" : "#C1272D", color: saving ? "#999" : "white", cursor: saving ? "default" : "pointer", fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
            {saving ? <><Spinner /> Salvando...</> : "✓ Salvar ponto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gerador de PDF ─────────────────────────────────

function buildPDF(lista, cli, emp) {
  const data = new Date().toLocaleDateString("pt-BR");
  const rows = lista.map(p => {
    const c = BC[p.tipo] || BC["Frontlight"];
    const imgTag = p.img
      ? `<img src="${p.img}" style="width:148px;height:104px;object-fit:cover;border-radius:4px;display:block;">`
      : `<div style="width:148px;height:104px;background:#eee;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#bbb;">Sem foto</div>`;
    return `
<div style="display:flex;gap:16px;padding:18px 0;border-bottom:0.5px solid #e8e8e8;">
  <div style="flex-shrink:0;">${imgTag}</div>
  <div style="flex:1;">
    <div style="display:inline-block;font-size:9px;padding:2px 8px;border-radius:20px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:5px;background:${c.bg};color:${c.tx};">${p.tipo}</div>
    <div style="font-size:14px;font-weight:600;color:#111;margin-bottom:8px;">${p.nome}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 12px;font-size:12px;">
      ${p.reg  ? `<div><div style="font-size:9px;text-transform:uppercase;color:#999;">Região</div><div>${p.reg}</div></div>` : ""}
      ${p.end  ? `<div><div style="font-size:9px;text-transform:uppercase;color:#999;">Endereço</div><div>${p.end}</div></div>` : ""}
      ${p.dim  ? `<div><div style="font-size:9px;text-transform:uppercase;color:#999;">Dimensões</div><div>${p.dim}</div></div>` : ""}
      ${p.ilum ? `<div><div style="font-size:9px;text-transform:uppercase;color:#999;">Iluminação</div><div>${p.ilum}</div></div>` : ""}
    </div>
    ${p.preco ? `<div style="font-size:15px;font-weight:700;color:#C1272D;margin-top:8px;">R$ ${p.preco}<span style="font-size:11px;font-weight:400;color:#888;">/mês</span></div>` : ""}
    ${p.obs   ? `<div style="font-size:11px;color:#888;margin-top:5px;font-style:italic;">${p.obs}</div>` : ""}
  </div>
</div>`;
  }).join("");

  return `
<div style="background:linear-gradient(135deg,#C1272D 0%,#8B1B1F 100%);padding:26px 30px 20px;display:flex;justify-content:space-between;align-items:flex-end;">
  <div>
    <div style="font-size:24px;font-weight:700;color:#fff;line-height:1;letter-spacing:-0.5px;">
      <span>H</span><span style="color:#e8aa60;">oc</span><span style="color:#6ab0e0;">&gt;&gt;</span><span style="color:#d0e8f5;">✕</span><span style="color:#fff;">&lt;</span>
    </div>
    <div style="font-size:9px;letter-spacing:.2em;color:rgba(255,255,255,.7);margin-top:3px;">SMARTMIDIA</div>
  </div>
  <div style="text-align:right;color:rgba(255,255,255,.85);font-size:11px;line-height:1.7;">
    <div style="color:#fff;font-size:13px;font-weight:600;">${cli}</div>
    ${emp ? `<div>${emp}</div>` : ""}
    <div>Data: ${data}</div>
  </div>
</div>
<div style="background:#1B6CA8;padding:10px 30px;display:flex;gap:28px;">
  <div><div style="font-size:9px;text-transform:uppercase;color:rgba(255,255,255,.6);">Pontos</div><div style="font-size:13px;font-weight:600;color:#fff;">${lista.length}</div></div>
  <div><div style="font-size:9px;text-transform:uppercase;color:rgba(255,255,255,.6);">Documento</div><div style="font-size:13px;font-weight:600;color:#fff;">Proposta Comercial</div></div>
</div>
<div style="padding:20px 30px;">${rows}</div>
<div style="background:#1a1a1a;padding:12px 30px;display:flex;align-items:center;justify-content:space-between;">
  <div style="color:rgba(255,255,255,.4);font-size:10px;">© ${new Date().getFullYear()} Hocxx Smartmidia</div>
  <div style="color:rgba(255,255,255,.85);font-size:11px;font-weight:500;">📸 @hocxx.midia</div>
</div>`;
}

// ── App Principal ──────────────────────────────────

export default function App() {
  const [pontos, setPontos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dbOk, setDbOk]         = useState(true);
  const [screen, setScreen]     = useState("inventario");
  const [modal, setModal]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [sel, setSel]           = useState(new Set());
  const [search, setSearch]     = useState("");
  const [fTipo, setFTipo]       = useState("");
  const [fReg, setFReg]         = useState("");
  const [fTipoProp, setFTipoProp] = useState("");
  const [fRegProp, setFRegProp]   = useState("");
  const [cliNome, setCliNome]   = useState("");
  const [cliEmp, setCliEmp]     = useState("");
  const [pdfHTML, setPdfHTML]   = useState(null);

  // ── Carregar pontos ──
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("pontos").select("*").order("id");
      if (error) {
        console.error(error);
        setDbOk(false);
      } else {
        setPontos(data || []);
      }
      setLoading(false);
    })();
  }, []);

  const regioes = [...new Set(pontos.map(p => p.reg).filter(Boolean))].sort();

  // ── Salvar (criar ou editar) ──
  const salvar = async (form) => {
    if (!form.nome.trim()) { alert("Informe o nome do ponto."); return; }
    setSaving(true);
    if (form.id && typeof form.id === "number" && pontos.find(p => p.id === form.id)) {
      const { error } = await supabase.from("pontos").update({
        nome: form.nome, tipo: form.tipo, reg: form.reg, end: form.end,
        preco: form.preco, dim: form.dim, ilum: form.ilum, obs: form.obs, img: form.img,
      }).eq("id", form.id);
      if (!error) setPontos(prev => prev.map(p => p.id === form.id ? { ...p, ...form } : p));
    } else {
      const { data, error } = await supabase.from("pontos").insert([{
        nome: form.nome, tipo: form.tipo, reg: form.reg, end: form.end,
        preco: form.preco, dim: form.dim, ilum: form.ilum, obs: form.obs, img: form.img,
      }]).select().single();
      if (!error && data) setPontos(prev => [...prev, data]);
    }
    setSaving(false);
    setModal(null);
  };

  // ── Excluir ──
  const excluir = async (id) => {
    if (!confirm("Remover este ponto?")) return;
    await supabase.from("pontos").delete().eq("id", id);
    setPontos(prev => prev.filter(p => p.id !== id));
    setSel(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const toggleSel = (id) => setSel(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  const invFilt = pontos.filter(p =>
    (!fTipo || p.tipo === fTipo) && (!fReg || p.reg === fReg) &&
    (!search || p.nome.toLowerCase().includes(search.toLowerCase()) || (p.reg||"").toLowerCase().includes(search.toLowerCase()))
  );
  const propFilt = pontos.filter(p => (!fTipoProp || p.tipo === fTipoProp) && (!fRegProp || p.reg === fRegProp));

  const gerarPDF = () => {
    if (!sel.size) { alert("Selecione ao menos um ponto."); return; }
    setPdfHTML(buildPDF(pontos.filter(p => sel.has(p.id)), cliNome || "Cliente", cliEmp));
  };

  const baixarPDF = () => {
    if (!pdfHTML) return;
    const cli = (cliNome || "Cliente").replace(/\s/g, "_");
    const data = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Proposta Hocxx</title>
<style>body{margin:0;padding:0;font-family:'Helvetica Neue',sans-serif;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
</head><body><div style="max-width:720px;margin:0 auto;">${pdfHTML}</div>
<script>window.onload=function(){window.print();}<\/script></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Proposta_Hocxx_${cli}_${data}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  const sel$ = { fontSize: 13, padding: "0 10px", height: 34, border: "1px solid #e0e0e0", borderRadius: 8, background: "white", fontFamily: "inherit" };
  const inp$ = { fontSize: 13, padding: "0 10px", height: 34, border: "1px solid #e0e0e0", borderRadius: 8, background: "white", fontFamily: "inherit" };

  // ── Tela de loading ──
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16 }}>
      <Spinner />
      <span style={{ fontSize: 14, color: "#888" }}>Carregando inventário...</span>
    </div>
  );

  // ── Tela de erro de conexão ──
  if (!dbOk) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h2 style={{ fontSize: 18, color: "#C1272D" }}>Banco de dados não configurado</h2>
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
        Abra o arquivo <code>src/App.jsx</code> e substitua<br />
        <code>SUPABASE_URL</code> e <code>SUPABASE_KEY</code><br />
        com as suas chaves do Supabase.
      </p>
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f9f9f9" }}>

        {/* TOPBAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 52, background: "white", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <Logo size={18} />
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "#aaa", textTransform: "uppercase", marginTop: 1 }}>Smartmidia</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[["inventario", "🗂 Inventário"], ["proposta", "📄 Nova Proposta"]].map(([id, label]) => (
              <button key={id} onClick={() => { setScreen(id); if (id === "proposta") { setSel(new Set()); setPdfHTML(null); } }}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "1px solid", fontFamily: "inherit",
                  borderColor: screen === id ? "#e0e0e0" : "transparent",
                  background: screen === id ? "#f5f5f5" : "transparent",
                  fontWeight: screen === id ? 600 : 400,
                  color: screen === id ? "#111" : "#888",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── INVENTÁRIO ── */}
        {screen === "inventario" && (
          <div style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ponto..." style={{ ...inp$, flex: 1, minWidth: 140 }} />
              <select value={fTipo} onChange={e => setFTipo(e.target.value)} style={sel$}>
                <option value="">Todos os tipos</option>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={fReg} onChange={e => setFReg(e.target.value)} style={sel$}>
                <option value="">Todas as regiões</option>
                {regioes.map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={() => setModal({ form: { ...EMPTY } })}
                style={{ padding: "0 16px", height: 34, background: "#C1272D", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                + Novo Ponto
              </button>
            </div>

            {invFilt.length === 0
              ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#bbb" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                  <div style={{ fontSize: 14 }}>Nenhum ponto encontrado.<br />Clique em "+ Novo Ponto" para começar.</div>
                </div>
              : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
                  {invFilt.map(p => (
                    <Card key={p.id} p={p} selMode={false}
                      onEdit={() => setModal({ form: { ...p } })}
                      onDelete={() => excluir(p.id)}
                    />
                  ))}
                </div>
            }
          </div>
        )}

        {/* ── PROPOSTA ── */}
        {screen === "proposta" && (
          <div style={{ padding: "18px 20px 100px" }}>
            <div style={{ background: "#EBF4FB", border: "1px solid #B5D4F4", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#1B5080", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              ℹ️ Selecione os pontos, preencha os dados do cliente e gere o PDF.
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>Dados do cliente</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
              <input value={cliNome} onChange={e => setCliNome(e.target.value)} placeholder="Nome do cliente" style={inp$} />
              <input value={cliEmp}  onChange={e => setCliEmp(e.target.value)}  placeholder="Empresa / Marca"  style={inp$} />
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>Filtrar pontos</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <select value={fTipoProp} onChange={e => setFTipoProp(e.target.value)} style={sel$}>
                <option value="">Todos os tipos</option>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={fRegProp} onChange={e => setFRegProp(e.target.value)} style={sel$}>
                <option value="">Todas as regiões</option>
                {regioes.map(r => <option key={r}>{r}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>{sel.size} selecionado{sel.size !== 1 ? "s" : ""}</span>
            </div>

            {propFilt.length === 0
              ? <div style={{ textAlign: "center", padding: "50px 20px", color: "#bbb" }}><div style={{ fontSize: 36 }}>🗺️</div><div style={{ fontSize: 13, marginTop: 8 }}>Nenhum ponto encontrado.</div></div>
              : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
                  {propFilt.map(p => (
                    <Card key={p.id} p={p} selMode={true} selected={sel.has(p.id)} onToggle={() => toggleSel(p.id)} />
                  ))}
                </div>
            }

            {pdfHTML && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Prévia da proposta</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setPdfHTML(null)} style={{ padding: "6px 14px", fontSize: 13, borderRadius: 8, border: "1px solid #e0e0e0", background: "white", cursor: "pointer", fontFamily: "inherit" }}>Fechar</button>
                    <button onClick={baixarPDF} style={{ padding: "6px 16px", fontSize: 13, borderRadius: 8, border: "none", background: "#1B6CA8", color: "white", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>⬇ Baixar PDF</button>
                  </div>
                </div>
                <div style={{ background: "#f0f0ee", borderRadius: 10, padding: 14 }}>
                  <div style={{ background: "white", borderRadius: 4, overflow: "hidden", maxWidth: 580, margin: "0 auto" }}
                    dangerouslySetInnerHTML={{ __html: pdfHTML }} />
                </div>
              </div>
            )}

            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #eee", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 40 }}>
              <span style={{ fontSize: 13, color: "#888" }}><strong style={{ color: "#111" }}>{sel.size}</strong> ponto(s) selecionado(s)</span>
              <button onClick={gerarPDF}
                style={{ padding: "8px 20px", fontSize: 13, borderRadius: 8, border: "none", background: "#1B6CA8", color: "white", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
                📄 Gerar Proposta PDF
              </button>
            </div>
          </div>
        )}

        {/* MODAL */}
        {modal && <Modal inicial={modal.form} onSave={salvar} onClose={() => setModal(null)} saving={saving} />}
      </div>
    </>
  );
}
