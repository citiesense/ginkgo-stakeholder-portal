export function splitFullName(s){
  if(!s) return { name:"" };
  const p = String(s).trim().split(/\s+/);
  if (p.length===1) return { name:s };
  return { first_name:p[0], last_name:p.slice(1).join(' '), name:s };
}
export function slug(s){ return (s||"").toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
export function ok(body){ return { statusCode:200, body:JSON.stringify(body) }; }
export function err(status, msg, details){ return { statusCode:status, body:JSON.stringify({ ok:false, error:msg, details }) }; }
