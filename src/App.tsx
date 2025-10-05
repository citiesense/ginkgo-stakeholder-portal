import React, { useMemo, useState } from "react";

// --- Simple, self‑contained mockup. No external APIs. ---
// Brand tokens (Ginkgo)
const brand = {
  orange: "#F37129",
  teal: "#0FEAA6",
  navy: "#162e54",
  bg: "#eaf2f4",
};

type View =
  | "launch"
  | "access"
  | "search-business"
  | "search-property"
  | "details"
  | "add-business";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700">
      {children}
    </span>
  );
}

// Fake data for demo purposes — now includes business public + primary/secondary fields
const DEMO_BUSINESSES = [
  {
    id: "BIZ-123",
    name: "La Palma Grocery",
    addr: "123 Grand St",
    // Public business contact fields
    email: "hello@lapalma.example",
    phone: "+1 718 555 0101",
    url: "https://lapalma.example",
    // Primary/Secondary contacts (admin-style fields)
    primary_contact_name: "Ana Perez",
    primary_contact_email: "owner@lapalma.example",
    primary_contact_phone: "+1 718 555 1212",
    secondary_contact_name: "Luis Perez",
    secondary_contact_email: "manager@lapalma.example",
    secondary_contact_phone: "+1 718 555 3434",
    contacts: [
      { id: "C-45", full_name: "Ana Perez" },
      { id: "C-46", full_name: "Store Manager" },
    ],
  },
  {
    id: "BIZ-124",
    name: "Hudson Books",
    addr: "88 River Ave",
    email: "contact@hudsonbooks.example",
    phone: "+1 212 555 0101",
    url: "https://hudsonbooks.example",
    primary_contact_name: "Michael Lee",
    primary_contact_email: "michael@hudsonbooks.example",
    primary_contact_phone: "+1 212 555 1212",
    secondary_contact_name: "",
    secondary_contact_email: "",
    secondary_contact_phone: "",
    contacts: [{ id: "C-47", full_name: "Michael Lee" }],
  },
];

const DEMO_PROPERTIES = [
  {
    id: "PROP-555",
    address: "456 Humboldt St",
    bbl: "3-01234-0056",
    contacts: [{ id: "C-77", full_name: "Humboldt LLC Rep" }],
  },
  {
    id: "PROP-777",
    address: "17 Metropolitan Ave",
    bbl: "3-04567-0001",
    contacts: [],
  },
];

// --- Tiny smoke tests so we catch regressions quickly in the mock ---
(function devSmokeTests() {
  try {
    console.assert(Array.isArray(DEMO_BUSINESSES) && DEMO_BUSINESSES.length > 0, "DEMO_BUSINESSES should have items");
    console.assert(Object.keys(brand).includes("orange") && Object.keys(brand).includes("bg"), "brand tokens present");
  } catch {}
})();

export default function App() {
  const [view, setView] = useState<View>("launch");
  const [companyId, setCompanyId] = useState(""); // backend param name, label as Community ID in UI
  const [apiKey, setApiKey] = useState("");
  const [portalPw, setPortalPw] = useState("");
  const [portalPw2, setPortalPw2] = useState("");
  const [accessCompanyId, setAccessCompanyId] = useState("");
  const [accessPw, setAccessPw] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<{ type: "business" | "property"; id: string } | null>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    if (view === "search-business") {
      return DEMO_BUSINESSES.filter((b) => \`\${b.name} \${b.addr}\`.toLowerCase().includes(q));
    }
    if (view === "search-property") {
      return DEMO_PROPERTIES.filter((p) => \`\${p.address} \${p.bbl}\`.toLowerCase().includes(q));
    }
    return [] as any[];
  }, [query, view]);

  return (
    <div className="min-h-screen" style={{ background: brand.bg }}>
      {/* Top bar */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: brand.teal }} />
            <span className="text-sm tracking-wide text-gray-700">Ginkgo</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm font-medium" style={{ color: brand.navy }}>
              Stakeholder Lookup (MVP)
            </span>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <button className="px-3 py-1 rounded-full hover:bg-gray-100" onClick={() => setView("launch")}>Launch</button>
            <button className="px-3 py-1 rounded-full hover:bg-gray-100" onClick={() => setView("access")}>Access</button>
            <button className="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40" onClick={() => setView("search-business")} disabled={!hasAccess} title={!hasAccess ? "Enter portal password first" : ""}>Businesses</button>
            <button className="px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40" onClick={() => setView("search-property")} disabled={!hasAccess} title={!hasAccess ? "Enter portal password first" : ""}>Properties</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 grid gap-6">
        {view === "launch" && (
          <>
            <Hero onTry={() => setView("access")} />

            <Section
              title="Activate this portal"
              subtitle="Paste your Ginkgo Community ID and API Key to start an admin session."
            >
              <div className="grid md:grid-cols-3 gap-3">
                <input className="border rounded-lg p-2" placeholder="Community ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="API Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }} onClick={() => alert("(Demo) Session created. Now set the Portal Access Password below.")}>Save session</button>
              </div>
            </Section>

            <Section
              title="Set or change Portal Access Password"
              subtitle="Stakeholders must enter this password to use the lookup (mitigates spam)."
            >
              <div className="grid md:grid-cols-3 gap-3">
                <input className="border rounded-lg p-2" placeholder="New portal password" type="password" value={portalPw} onChange={(e) => setPortalPw(e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="Confirm password" type="password" value={portalPw2} onChange={(e) => setPortalPw2(e.target.value)} />
                <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.teal }} onClick={() => {
                  if (!portalPw || portalPw.length < 8) return alert("Password must be at least 8 characters.");
                  if (portalPw !== portalPw2) return alert("Passwords do not match.");
                  alert("(Demo) Portal password saved server-side.");
                }}>Save portal password</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">In production this calls <code>/.netlify/functions/portal.password</code>.</p>
            </Section>

            <Section title="How it works">
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2">
                <li>Public search returns non-PII only (record basics + associated contact <b>names</b>).</li>
                <li>A contact can <b>reveal</b> full details by entering a matching email or phone (server-side check).</li>
                <li>Portal access is protected by a tenant password that you set above.</li>
              </ul>
            </Section>
          </>
        )}

        {view === "access" && (
          <>
            <Section title="Portal Access" subtitle="Enter your organization’s Community ID and the portal password provided by your BID/District.">
              <div className="grid md:grid-cols-3 gap-3">
                <input className="border rounded-lg p-2" placeholder="Community ID" value={accessCompanyId} onChange={(e) => setAccessCompanyId(e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="Portal password" type="password" value={accessPw} onChange={(e) => setAccessPw(e.target.value)} />
                <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }} onClick={() => {
                  if (!accessCompanyId || !accessPw) return alert("Enter Community ID and password");
                  // Demo: grant access locally. In prod, POST to /.netlify/functions/access.login
                  setHasAccess(true);
                  setCompanyId(accessCompanyId);
                  alert("(Demo) Access granted for this session.");
                  setView("search-business");
                }}>Unlock portal</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">In production this posts to <code>/.netlify/functions/access.login</code> and sets an HttpOnly cookie.</p>
            </Section>

            <Section title="Rotate API key / Update credentials" subtitle="If your API key was rotated or portal password changed, update it here without redeploying.">
              <div className="grid md:grid-cols-3 gap-3">
                <input className="border rounded-lg p-2" placeholder="Community ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="New API Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.teal }} onClick={() => { alert("(Demo) API key updated for this session."); }}>Save new API Key</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">This would call <code>/.netlify/functions/portal.credentials</code> to persist encrypted per tenant.</p>
            </Section>
          </>
        )}

        {view === "search-business" && (
          <>
            <Section title="Search Businesses">
              <div className="flex gap-2 items-start">
                <input className="flex-1 border rounded-lg p-2" placeholder="Name or address…" value={query} onChange={(e) => setQuery(e.target.value)} />
                <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }}>Search</button>
                <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.navy }} onClick={() => setView("add-business")}>+ Add your business</button>
              </div>
              <div className="mt-5 grid md:grid-cols-2 gap-3">
                {results.map((b: any) => (
                  <div key={b.id} className="rounded-2xl border p-4 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{b.name}</div>
                        <div className="text-sm text-gray-500">{b.addr}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Pill>Contacts: {b.contacts.length || 0}</Pill>
                        </div>
                      </div>
                      <button className="rounded-lg px-3 py-2 text-white text-sm" style={{ background: brand.teal }} onClick={() => { setDetail({ type: "business", id: b.id }); setView("details"); }}>View</button>
                    </div>
                    <div className="mt-3 text-sm">
                      <div className="text-gray-600">Associated Contacts (names only)</div>
                      <ul className="list-disc pl-5 text-gray-800">{(b.contacts || []).map((c: any) => (<li key={c.id}>{c.full_name}</li>))}</ul>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {view === "add-business" && <AddBusinessView onCancel={() => setView("search-business")} />}

        {view === "search-property" && (
          <>
            <Section title="Search Properties">
              <div className="flex gap-2">
                <input className="flex-1 border rounded-lg p-2" placeholder="Address or BBL…" value={query} onChange={(e) => setQuery(e.target.value)} />
                <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }}>Search</button>
              </div>
              <div className="mt-5 grid md:grid-cols-2 gap-3">
                {results.map((p: any) => (
                  <div key={p.id} className="rounded-2xl border p-4 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{p.address}</div>
                        <div className="text-sm text-gray-500">BBL: {p.bbl || "—"}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Pill>Contacts: {p.contacts.length || 0}</Pill>
                        </div>
                      </div>
                      <button className="rounded-lg px-3 py-2 text-white text-sm" style={{ background: brand.teal }} onClick={() => { setDetail({ type: "property", id: p.id }); setView("details"); }}>View</button>
                    </div>
                    <div className="mt-3 text-sm">
                      <div className="text-gray-600">Associated Contacts (names only)</div>
                      <ul className="list-disc pl-5 text-gray-800">{(p.contacts || []).map((c: any) => (<li key={c.id}>{c.full_name}</li>))}</ul>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {view === "details" && detail && (
          <DetailsView detail={detail} goBack={() => setView(detail.type === "business" ? "search-business" : "search-property")} />
        )}
      </main>
    </div>
  );
}

function Hero({ onTry }: { onTry: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border shadow-sm" style={{ background: brand.navy }}>
      <div className="p-8 md:p-12 text-white">
        <h1 className="text-2xl md:text-3xl font-semibold">Stakeholder Self‑Service Lookup</h1>
        <p className="mt-2 text-white/80 max-w-2xl">Let property owners and business representatives look up their record, verify identity, reveal contact details, submit updates, or add a missing business—without creating an account.</p>
        <div className="mt-5 flex gap-3">
          <a
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: brand.orange }}
            href="#"
            onClick={(e) => { e.preventDefault(); onTry(); }}
          >
            ▶︎ Try the interactive mockup
          </a>
          <a className="px-4 py-2 rounded-xl text-sm font-medium border border-white/30" href="https://api.ginkgo.city/#!/community/" target="_blank" rel="noreferrer">View Ginkgo API</a>
        </div>
      </div>
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full opacity-20" style={{ background: brand.teal }} />
    </div>
  );
}

function DetailsView({ detail, goBack }: { detail: { type: "business" | "property"; id: string }; goBack: () => void }) {
  const mock = detail.type === "business" ? DEMO_BUSINESSES.find((b) => b.id === detail.id) : DEMO_PROPERTIES.find((p) => p.id === detail.id);

  const [idType, setIdType] = useState<"email" | "phone">("email");
  const [idValue, setIdValue] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealMsg, setRevealMsg] = useState<string>("");

  function logEvent(name: string, payload: any) {
    // Placeholder for Ginkgo Create_Events integration
    // POST https://api.ginkgo.city/community/Create_Events with context
    console.log("EVENT:", name, payload);
  }

  function handleReveal() {
    // Mock: if email contains "owner" or phone ends with 212, reveal the first contact
    const pass = idType === "email" ? /owner|ana|michael/.test(idValue.toLowerCase()) : /212$/.test(idValue);
    const revealed = pass && mock && (mock as any).contacts
      ? (mock as any).contacts.map((c: any) => ({
          ...c,
          email: \`\${c.full_name.split(" ")[0].toLowerCase()}\` + "@example.com",
          phone: "+1-718-555-1212",
          contact_type: "Owner",
        }))
      : [];
    setMatches(revealed);
    setIsRevealed(pass && revealed.length > 0);
    setRevealMsg(pass ? "Verified – details revealed." : "No match. Try a different email or phone.");
    logEvent("contact_reveal_attempt", { type: idType, value: idValue, pass, record_type: detail.type, record_id: detail.id });
  }

  return (
    <div className="grid gap-6">
      <button className="text-sm underline text-gray-600 w-fit" onClick={goBack}>← Back to {detail.type === "business" ? "Businesses" : "Properties"}</button>

      <Section title={detail.type === "business" ? (mock as any)?.name || "Business" : (mock as any)?.address || "Property"} subtitle={detail.type === "business" ? (mock as any)?.addr : \`BBL: \${(mock as any)?.bbl || "—"}\`}>
        {detail.type === "business" && (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="font-medium mb-1">Public contact</div>
              <div>Email: {(mock as any)?.email || "—"}</div>
              <div>Phone: {(mock as any)?.phone || "—"}</div>
              <div>Website: {(mock as any)?.url ? <a className="underline" href={(mock as any).url} onClick={(e) => e.preventDefault()}>{(mock as any).url}</a> : "—"}</div>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="font-medium mb-1">Associated Contacts (names only)</div>
              <ul className="list-disc pl-5">{((mock as any)?.contacts || []).map((c: any) => (<li key={c.id}>{c.full_name}</li>))}</ul>
            </div>

            {isRevealed && (
              <>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="font-medium mb-1">Primary contact (admin fields)</div>
                  <div>Name: {(mock as any)?.primary_contact_name || "—"}</div>
                  <div>Email: {(mock as any)?.primary_contact_email || "—"}</div>
                  <div>Phone: {(mock as any)?.primary_contact_phone || "—"}</div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="font-medium mb-1">Secondary contact (admin fields)</div>
                  <div>Name: {(mock as any)?.secondary_contact_name || "—"}</div>
                  <div>Email: {(mock as any)?.secondary_contact_email || "—"}</div>
                  <div>Phone: {(mock as any)?.secondary_contact_phone || "—"}</div>
                </div>
              </>
            )}
          </div>
        )}
        {detail.type === "property" && (
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-1">Associated Contacts (names only)</div>
            <ul className="list-disc pl-5">{((mock as any)?.contacts || []).map((c: any) => (<li key={c.id}>{c.full_name}</li>))}</ul>
          </div>
        )}
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Reveal contact details" subtitle="Enter a matching email or phone to reveal full details for contacts on this record.">
          <div className="flex gap-2">
            <select className="border rounded-lg p-2" value={idType} onChange={(e) => setIdType(e.target.value as any)}>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            <input className="flex-1 border rounded-lg p-2" placeholder={idType === "email" ? "you@domain.com" : "+17185551212"} value={idValue} onChange={(e) => setIdValue(e.target.value)} />
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.orange }} onClick={handleReveal}>Reveal</button>
          </div>

          <p className="text-xs text-gray-500 mt-2">{revealMsg}</p>

          {matches.length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">No matches yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {matches.map((m) => (
                <li key={m.id} className="border rounded-xl p-3 bg-gray-50">
                  <div className="font-medium">{m.full_name}</div>
                  <div className="text-sm">Email: {m.email}</div>
                  <div className="text-sm">Phone: {m.phone}</div>
                  <div className="text-sm">Role (contact_type): {m.contact_type}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Submit an update" subtitle="Add a missing contact or suggest corrections.">
          <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); alert("Thanks! In the live version this posts to /.netlify/functions/contact.submit"); (e.target as HTMLFormElement).reset(); logEvent("contact_update_submitted", { record_type: detail.type, record_id: detail.id }); }}>
            {/* Optional: include existing contact_id to update an existing record */}
            <input className="border rounded-lg p-2" placeholder="(Optional) Existing Contact ID" />
            <input className="border rounded-lg p-2" placeholder="Full name" required />
            <input className="border rounded-lg p-2" placeholder="Email" />
            <input className="border rounded-lg p-2" placeholder="Phone (+1…)" />
            <input className="border rounded-lg p-2" placeholder="Role (Owner, Manager…)" />
            <textarea className="border rounded-lg p-2" placeholder="Notes (optional)" />
            <button className="rounded-xl px-4 py-2 text-white font-medium mt-1 w-fit" style={{ background: brand.teal }}>Submit update</button>
          </form>
        </Section>
      </div>
    </div>
  );
}

function AddBusinessView({ onCancel }: { onCancel: () => void }) {
  function logEvent(name: string, payload: any) {
    console.log("EVENT:", name, payload);
  }
  return (
    <div className="grid gap-6">
      <button className="text-sm underline text-gray-600 w-fit" onClick={onCancel}>← Back to Businesses</button>

      <Section title="Add your business" subtitle="If you can’t find your business, submit it here. Admins will review and verify.">
        <form
          className="grid md:grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            alert("(Demo) This would POST to /.netlify/functions/business.create → n8n /portal/business-create with the mapped fields.");
            logEvent("business_create_submitted", {});
            (e.target as HTMLFormElement).reset();
          }}
        >
          {/* Required basics */}
          <input className="border rounded-lg p-2" name="name" placeholder="Business name*" required />
          <input className="border rounded-lg p-2" name="address" placeholder="Street address*" required />

          {/* Public business contact fields */}
          <input className="border rounded-lg p-2" name="email" placeholder="Public email (optional)" />
          <input className="border rounded-lg p-2" name="phone" placeholder="Public phone (optional)" />

          {/* Website uses the url field per mapping */}
          <input className="border rounded-lg p-2" name="url" placeholder="Website (url)" />

          {/* Category / tags */}
          <input className="border rounded-lg p-2" name="category" placeholder="Category (e.g., Retail > Grocery)" />
          <input className="border rounded-lg p-2" name="tags" placeholder="Tags (comma separated)" />

          {/* Property and unit linking (optional) */}
          <input className="border rounded-lg p-2" name="property_municipal_id" placeholder="Property municipal ID (optional)" />
          <input className="border rounded-lg p-2" name="unit_name" placeholder="Unit name (optional)" />

          {/* Primary contact (admin fields) */}
          <div className="md:col-span-2 mt-4 font-medium text-gray-700">Primary contact (admin fields)</div>
          <input className="border rounded-lg p-2" name="primary_contact_name" placeholder="Primary contact name" />
          <input className="border rounded-lg p-2" name="primary_contact_email" placeholder="Primary contact email" />
          <input className="border rounded-lg p-2" name="primary_contact_phone" placeholder="Primary contact phone" />

          {/* Secondary contact (admin fields) */}
          <div className="md:col-span-2 font-medium text-gray-700">Secondary contact (admin fields)</div>
          <input className="border rounded-lg p-2" name="secondary_contact_name" placeholder="Secondary contact name" />
          <input className="border rounded-lg p-2" name="secondary_contact_email" placeholder="Secondary contact email" />
          <input className="border rounded-lg p-2" name="secondary_contact_phone" placeholder="Secondary contact phone" />

          {/* Notes */}
          <textarea className="border rounded-lg p-2 md:col-span-2" name="notes" placeholder="Notes (optional)" />

          <div className="md:col-span-2 flex gap-2 mt-2">
            <button className="rounded-xl px-4 py-2 text-white font-medium" style={{ background: brand.teal }}>Submit business</button>
            <button type="button" className="rounded-xl px-4 py-2 border" onClick={onCancel}>Cancel</button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-3">Field mapping applied: <b>url</b> for website; <b>primary_contact_*</b> and <b>secondary_contact_*</b> for admin contacts; <b>email/phone</b> reserved for public business contact info.</p>
      </Section>
    </div>
  );
}
