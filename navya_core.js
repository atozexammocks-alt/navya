/* NAVYA CORE — prototype foundation. Production must move auth/authorization to a server/database. */
(function(){
const U='navya_users_v2',S='navya_session_v2',O='navya_orgs_v2',P='navya_super_pin_v1';
const R=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}},W=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const N=v=>String(v||'').trim().toLowerCase(),ID=p=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
const SUPER_EMAIL='vikasattri3003@gmail.com';
window.NAVYA={
 superEmail:SUPER_EMAIL,
 session(){return R(S,null)},
 logout(){localStorage.removeItem(S);location.href='index.html'},
 organizations(){return R(O,[])},
 users(){return R(U,[])},
 ensureDemoSuperAdmin(){
  const us=R(U,[]);
  if(!us.some(x=>N(x.email)===SUPER_EMAIL)){us.push({id:'super_admin_vikas',organizationId:null,role:'SUPER_ADMIN',name:'Vikas Attri',email:SUPER_EMAIL,mobile:'',password:null});W(U,us)}
 },
 superPinSet(){return !!R(P,null)},
 setSuperPin(pin){pin=String(pin||'');if(!/^\d{4,8}$/.test(pin))return{ok:false,error:'PIN must be 4–8 digits.'};W(P,pin);this.ensureDemoSuperAdmin();return{ok:true}},
 loginSuper(pin){this.ensureDemoSuperAdmin();if(!this.superPinSet())return{ok:false,setup:true,error:'Super Admin PIN is not configured yet.'};if(String(pin)!==String(R(P,'')))return{ok:false,error:'Invalid Super Admin PIN.'};const s={userId:'super_admin_vikas',organizationId:null,role:'SUPER_ADMIN',email:SUPER_EMAIL,name:'Vikas Attri'};W(S,s);return{ok:true,session:s}},
 findOrganization(q){const x=N(q);return this.organizations().find(o=>N(o.code)===x||N(o.name)===x||N(o.email)===x)||null},
 rolesFor(org){return org?['OWNER','ADMIN','HOD','TEACHER','STUDENT','PARENT','ACCOUNTANT','COUNSELOR']:[]},
 loginOrganization(identity,password,orgQuery,role){
  const org=this.findOrganization(orgQuery); if(!org)return{ok:false,error:'Institute not found. Use registered institute name/code.'};
  const u=this.users().find(x=>x.organizationId===org.id&&N(x.email)===N(identity)&&x.password===String(password)&&(!role||x.role===role));
  if(!u)return{ok:false,error:'Invalid institute login details or role.'};
  const s={userId:u.id,organizationId:org.id,role:u.role,email:u.email,mobile:u.mobile||'',name:u.name,organizationName:org.name};W(S,s);return{ok:true,session:s,organization:org}
 },
 registerInstitute(d){
  const us=R(U,[]),os=R(O,[]),e=N(d.email); if(!d.name||!e||!d.password)return{ok:false,error:'Institute name, email and password are required.'};
  if(us.some(x=>N(x.email)===e))return{ok:false,error:'An account with this email already exists.'};
  const code=(String(d.name).replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase()||'INST')+'-'+Math.floor(1000+Math.random()*9000);
  const o={id:ID('org'),code,name:String(d.name).trim(),type:d.type||'Institute',email:e,mobile:String(d.mobile||'').trim(),createdAt:new Date().toISOString(),status:'ACTIVE'};
  const u={id:ID('usr'),organizationId:o.id,role:'OWNER',name:String(d.owner||'Institute Owner').trim(),email:e,mobile:String(d.mobile||'').trim(),password:String(d.password)};
  os.push(o);us.push(u);W(O,os);W(U,us);const s={userId:u.id,organizationId:o.id,role:u.role,email:u.email,mobile:u.mobile,name:u.name,organizationName:o.name};W(S,s);return{ok:true,session:s,organization:o}
 },
 addUser(d){const s=this.session();if(!s||s.role==='STUDENT'||s.role==='PARENT')return{ok:false,error:'Permission denied.'};const us=R(U,[]);if(us.some(x=>N(x.email)===N(d.email)&&x.organizationId===s.organizationId))return{ok:false,error:'User already exists.'};const u={id:ID('usr'),organizationId:s.organizationId,role:d.role,name:d.name,email:N(d.email),mobile:d.mobile||'',password:String(d.password||'1234')};us.push(u);W(U,us);return{ok:true,user:u}},
 organization(){const s=this.session();return s?this.findOrganization(s.organizationId):null},
 requireSession(){const s=this.session();if(!s){location.href='access.html';return null}return s},
 requireRole(roles){const s=this.requireSession();if(s&&!roles.includes(s.role)){location.href='access.html?error=permission';return null}return s}
};
NAVYA.ensureDemoSuperAdmin();
})();