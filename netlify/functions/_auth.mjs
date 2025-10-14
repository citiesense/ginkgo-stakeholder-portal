export function requireIdentityUser(context){
  const user = context?.clientContext?.user;
  if (!user) return { ok:false, status:401, error:"Unauthorized" };
  return { ok:true, user };
}
