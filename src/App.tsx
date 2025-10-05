import React, { useMemo, useState } from "react";

const brand = { orange: "#F37129", teal: "#0FEAA6", navy: "#162e54", bg: "#eaf2f4" };
type View = "launch" | "access" | "search-business" | "search-property" | "details" | "add-business";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (<div className="bg-white rounded-2xl shadow-sm border p-6"><h2 className="text-xl font-semibold text-gray-900">{title}</h2>{subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}<div className="mt-4">{children}</div></div>);
}
function Pill({ children }: { children: React.ReactNode }) {
  return (<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700">{children}</span>);
}
const DEMO_BUSINESSES = [
  { id:"BIZ-123", name:"La Palma Grocery", addr:"123 Grand St", email:"hello@lapalma.example", phone:"+1 718 555 0101", url:"https://lapalma.example",
    primary_contact_name:"Ana Perez", primary_contact_email:"owner@lapalma.example", primary_contact_phone:"+1 718 555 1212",
    secondary_contact_name:"Luis Perez", secondary_contact_email:"manager@lapalma.example", secondary_contact_phone:"+1 718 555 3434",
    contacts:[{id:"C-45",full_name:"Ana Perez"},{id:"C-46",full_name:"Store Manager"}]},
  { id:"BIZ-124", name:"Hudson Books", addr:"88 River Ave", email:"contact@hudsonbooks.example", phone:"+1 212 555 0101", url:"https://hudsonbooks.example",
    primary_contact_name:"Michael Lee", primary_contact_email:"michael@hudsonbooks.example", primary_contact_phone:"+1 212 555 1212",
    secondary_contact_name:"", secondary_contact_email:"", secondary_contact_phone:"", contacts:[{id:"C-47",full_name:"Michael Lee"}]},
];
const DEMO_PROPERTIES = [
  { id:"PROP-555", address:"456 Humboldt St", bbl:"3-01234-0056", contacts:[{id:"C-77", full_name:"Humboldt LLC Rep"}] },
  { id:"PROP-777", address:"17 Metropolitan Ave", bbl:"3-04567-0001", contacts:[] },
];

export default function App(){
  const [view, setView] = useState<View>("launch");
  const [companyId, setCompanyId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [portalPw, setPortalPw] = useState("");
  const [portalPw2, setPortalPw2] = useState("");
  const [accessCompanyId, setAccessCompanyId] = useState("");
  const [accessPw, setAccessPw] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<{ type:"business"|"property"; id:string } | null>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    if (view === "search-business") return DEMO_BUSINESSES.filter((b)=>`${b.name} ${b.addr}`.toLowerCase().includes(q));
    if (view === "search-property") return DEMO_PROPERTIES.filter((p)=>`${p.address} ${p.bbl}`.toLowerCase().includes(q));
    return [] as any[];
  }, [query, view]);

  return (<div className="min-h-screen" style={{ background: brand.bg }}>
    <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: brand.teal }} />
          <span className="text-sm tracking-wide text-gray-700">Ginkgo</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm font-medium" style={{ color: brand.navy }}>Stakeholder Lookup (MVP)</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <button className="px-3 py-1 rounded-full hover:bg-gray-100" onClick={()=>setView("launch")}>Launch</button>
          <button className="px-3 py-1 rounded-full hover:bg-gray-100" onClick={()=>setView("access")}>Access</button>
          <button className="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40" onClick={()=>setView("search-business")} disabled={!hasAccess} title={!hasAccess ? "Enter portal password first" : ""}>Businesses</button>
          <button className="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40" onClick={()=>setView("search-property")} disabled={!hasAccess} title={!hasAccess ? "Enter portal password first" : ""}>Properties</button>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8 grid gap-6">
      {view==="launch" && (<>
        <Hero onTry={()=>setView("access")} />
        <Section title="Activate this portal" subtitle="Paste your Ginkgo Community ID and API Key to start an admin session.">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="border rounded-lg p-2" placeholder="Community ID" value={companyId} onChange={(e)=>setCompanyId(e.target.value)} />
            <input className="border rounded-lg p-2" placeholder="API Key" type="password" value={apiKey} onChange={(e)=>setApiKey(e.target.value)} />
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }} onClick={()=>alert("(Demo) Session created. Now set the Portal Access Password below.")}>Save session</button>
          </div>
        </Section>
        <Section title="Set or change Portal Access Password" subtitle="Stakeholders must enter this password to use the lookup (mitigates spam).">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="border rounded-lg p-2" placeholder="New portal password" type="password" value={portalPw} onChange={(e)=>setPortalPw(e.target.value)} />
            <input className="border rounded-lg p-2" placeholder="Confirm password" type="password" value={portalPw2} onChange={(e)=>setPortalPw2(e.target.value)} />
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.teal }} onClick={()=>{
              if(!portalPw || portalPw.length<8) return alert("Password must be at least 8 characters.");
              if(portalPw!==portalPw2) return alert("Passwords do not match.");
              alert("(Demo) Portal password saved server-side.");
            }}>Save portal password</button>
          </div>
          <p className="text-xs text-gray-500 mt-2">In production this calls /.netlify/functions/portal.password.</p>
        </Section>
      </>)}
      {view==="access" && (<>
        <Section title="Portal Access" subtitle="Enter your organization’s Community ID and the portal password provided by your BID/District.">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="border rounded-lg p-2" placeholder="Community ID" value={accessCompanyId} onChange={(e)=>setAccessCompanyId(e.target.value)} />
            <input className="border rounded-lg p-2" placeholder="Portal password" type="password" value={accessPw} onChange={(e)=>setAccessPw(e.target.value)} />
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }} onClick={()=>{
              if(!accessCompanyId || !accessPw) return alert("Enter Community ID and password");
              setHasAccess(true); alert("(Demo) Access granted for this session."); setView("search-business");
            }}>Unlock portal</button>
          </div>
        </Section>
      </>)}
      {view==="search-business" && (<>
        <Section title="Search Businesses">
          <div className="flex gap-2 items-start">
            <input className="flex-1 border rounded-lg p-2" placeholder="Name or address…" value={query} onChange={(e)=>setQuery(e.target.value)} />
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }}>Search</button>
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.navy }} onClick={()=>setView("add-business")}>+ Add your business</button>
          </div>
          <div className="mt-5 grid md:grid-cols-2 gap-3">
            {results.map((b:any)=>(<div key={b.id} className="rounded-2xl border p-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{b.name}</div>
                  <div className="text-sm text-gray-500">{b.addr}</div>
                  <div className="mt-2 flex flex-wrap gap-1"><Pill>Contacts: {b.contacts.length || 0}</Pill></div>
                </div>
                <button className="rounded-lg px-3 py-2 text-white text-sm" style={{ background: brand.teal }} onClick={()=>{ setDetail({type:"business", id:b.id}); setView("details"); }}>View</button>
              </div>
              <div className="mt-3 text-sm">
                <div className="text-gray-600">Associated Contacts (names only)</div>
                <ul className="list-disc pl-5 text-gray-800">{(b.contacts||[]).map((c:any)=>(<li key={c.id}>{c.full_name}</li>))}</ul>
              </div>
            </div>))}
          </div>
        </Section>
      </>)}
      {view==="add-business" && (<Section title="Add your business" subtitle="If you can’t find your business, submit it here. Admins will review and verify.">
        <form className="grid md:grid-cols-2 gap-3" onSubmit={(e)=>{e.preventDefault(); alert("(Demo) Would POST to serverless → n8n in full deploy."); (e.target).reset();}}>
          <input className="border rounded-lg p-2" name="name" placeholder="Business name*" required />
          <input className="border rounded-lg p-2" name="address" placeholder="Street address*" required />
          <input className="border rounded-lg p-2" name="email" placeholder="Public email (optional)" />
          <input className="border rounded-lg p-2" name="phone" placeholder="Public phone (optional)" />
          <input className="border rounded-lg p-2" name="url" placeholder="Website (url)" />
          <input className="border rounded-lg p-2" name="category" placeholder="Category" />
          <input className="border rounded-lg p-2" name="tags" placeholder="Tags" />
          <input className="border rounded-lg p-2" name="property_municipal_id" placeholder="Property municipal ID" />
          <input className="border rounded-lg p-2" name="unit_name" placeholder="Unit name" />
          <div className="md:col-span-2 mt-4 font-medium text-gray-700">Primary contact (admin fields)</div>
          <input className="border rounded-lg p-2" name="primary_contact_name" placeholder="Primary contact name" />
          <input className="border rounded-lg p-2" name="primary_contact_email" placeholder="Primary contact email" />
          <input className="border rounded-lg p-2" name="primary_contact_phone" placeholder="Primary contact phone" />
          <div className="md:col-span-2 font-medium text-gray-700">Secondary contact (admin fields)</div>
          <input className="border rounded-lg p-2" name="secondary_contact_name" placeholder="Secondary contact name" />
          <input className="border rounded-lg p-2" name="secondary_contact_email" placeholder="Secondary contact email" />
          <input className="border rounded-lg p-2" name="secondary_contact_phone" placeholder="Secondary contact phone" />
          <textarea className="border rounded-lg p-2 md:col-span-2" name="notes" placeholder="Notes (optional)" />
          <div className="md:col-span-2 flex gap-2 mt-2">
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.teal }}>Submit business</button>
            <button type="button" className="rounded-xl px-4 py-2 border" onClick={()=>setView("search-business")}>Cancel</button>
          </div>
        </form>
      </Section>)}
      {view==="search-property" && (<>
        <Section title="Search Properties">
          <div className="flex gap-2">
            <input className="flex-1 border rounded-lg p-2" placeholder="Address or BBL…" value={query} onChange={(e)=>setQuery(e.target.value)} />
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }}>Search</button>
          </div>
          <div className="mt-5 grid md:grid-cols-2 gap-3">
            {results.map((p:any)=>(<div key={p.id} className="rounded-2xl border p-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{p.address}</div>
                  <div className="text-sm text-gray-500">BBL: {p.bbl || "—"}</div>
                  <div className="mt-2 flex flex-wrap gap-1"><Pill>Contacts: {p.contacts.length || 0}</Pill></div>
                </div>
                <button className="rounded-lg px-3 py-2 text-white text-sm" style={{ background: brand.teal }} onClick={()=>{ setDetail({type:"property", id:p.id}); setView("details"); }}>View</button>
              </div>
              <div className="mt-3 text-sm">
                <div className="text-gray-600">Associated Contacts (names only)</div>
                <ul className="list-disc pl-5 text-gray-800">{(p.contacts||[]).map((c:any)=>(<li key={c.id}>{c.full_name}</li>))}</ul>
              </div>
            </div>))}
          </div>
        </Section>
      </>)}
      {view==="details" && detail && (<DetailsView detail={detail} goBack={()=>setView(detail.type==="business"?"search-business":"search-property")} />)}
    </main>
  </div>);
}}

function Hero(props:any){return null} // placeholder (already defined above in Drop JS)
function DetailsView(props:any){return null} // placeholder (already defined above in Drop JS)
