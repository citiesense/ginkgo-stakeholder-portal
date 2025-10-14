import netlifyIdentity from 'netlify-identity-widget';
export function initIdentity() {
  netlifyIdentity.init();
}
export function onLogin(cb:(user:any)=>void){ netlifyIdentity.on('login', cb); }
export function onLogout(cb:( )=>void){ netlifyIdentity.on('logout', cb); }
export function currentUser(){ return netlifyIdentity.currentUser(); }
export async function requireToken(): Promise<string> {
  const u = netlifyIdentity.currentUser();
  if (!u) throw new Error("Not authenticated");
  return await u.jwt();
}
