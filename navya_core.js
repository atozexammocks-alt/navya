/* NAVYA tenant-aware client foundation. Browser storage is temporary demo state; production API/database must enforce authorization server-side. */
(function(){
const U='navya_users_v1',S='navya_session_v1',O='navya_orgs_v1';
const R=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const W=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const N=v=>String(v||'').trim().toLowerCase();
const ID=p=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
window.NAVYA={
 session(){return R(S,null)},
 logout(){localStorage.removeItem(S);location.href='index.html'},
 login(identity,password){
  const u=R(U,[]).find(x=>(N(x.email)===N(identity)||N(x.mobile)===N(identity))&&x.password===String(password));
  if(!u)return{ok:false,error:'Invalid login details.'};
  const s={userId:u.id,organizationId:u.organizationId,role:u.role,email:u.email,mobile:u.mobile,name:u.name};W(S,s);return{ok:true,session:s}
 },
 registerInstitute(d){
  const us=R(U,[]),os=R(O,[]),e=N(d.email);
  if(!d.name||!e||!d.password)return{ok:false,error:'Institute name, email and password are required.'};
  if(us.some(x=>N(x.email)===e))return{ok:false,error:'An account with this email already exists.'};
  const o={id:ID('org'),name:String(d.name).trim(),type:d.type||'Institute',email:e,mobile:String(d.mobile||'').trim(),createdAt:new Date().toISOString()};
  const u={id:ID('usr'),organizationId:o.id,role:'OWNER',name:String(d.owner||'Institute Owner').trim(),email:e,mobile:String(d.mobile||'').trim(),password:String(d.password)};
  os.push(o);us.push(u);W(O,os);W(U,us);
  const s={userId:u.id,organizationId:o.id,role:u.role,email:u.email,mobile:u.mobile,name:u.name};W(S,s);return{ok:true,session:s,organization:o}
 },
 organization(){const s=this.session();return s?R(O,[]).find(o=>o.id===s.organizationId)||null:null},
 updateOrganization(p){const s=this.session(),os=R(O,[]),i=s?os.findIndex(o=>o.id===s.organizationId):-1;if(i<0)return{ok:false,error:'Not logged in or organization not found.'};os[i]={...os[i],...p};W(O,os);return{ok:true,organization:os[i]}},
 requireSession(){const s=this.session();if(!s){location.href='auth.html?mode=login';return null}return s}
};
})();