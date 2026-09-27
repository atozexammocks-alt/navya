/* NAVYA CORE — Firebase-backed authentication/session foundation. Tenant authorization is enforced by Firebase Rules. */
(function(){
const U='navya_users_v2',S='navya_session_v2',O='navya_orgs_v2';
const R=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}},W=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const N=v=>String(v||'').trim().toLowerCase(),ID=p=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
const SUPER_EMAIL='vikasattri3003@gmail.com';
let fb=null, auth=null, db=null, storage=null;
function firebaseReady(){return typeof firebase!=='undefined' && !!window.NAVYA_FIREBASE_CONFIG}
function initFirebase(){if(fb||!firebaseReady())return false;fb=firebase.initializeApp(window.NAVYA_FIREBASE_CONFIG);auth=firebase.auth();db=firebase.firestore();storage=firebase.storage();return true}
window.NAVYA={
 superEmail:SUPER_EMAIL,
 firebase(){initFirebase();return{app:fb,auth,db,storage}},
 session(){return R(S,null)},
 setSession(s){W(S,s);return s},
 logout(){localStorage.removeItem(S);if(auth)auth.signOut().catch(()=>{});location.href='index.html'},
 organizations(){return R(O,[])}, users(){return R(U,[])},
 ensureDemoSuperAdmin(){const us=R(U,[]);if(!us.some(x=>N(x.email)===SUPER_EMAIL)){us.push({id:'super_admin_vikas',organizationId:null,role:'SUPER_ADMIN',name:'Vikas Attri',email:SUPER_EMAIL,mobile:''});W(U,us)}},
 // Firebase is the real auth source. The old local PIN store is intentionally no longer used.
 async setupSuperPin(pin){
  initFirebase(); pin=String(pin||'');
  if(!/^\d{6,8}$/.test(pin))return{ok:false,error:'Super Admin PIN must be 6–8 digits.'};
  try{let user=auth.currentUser;
   if(!user){try{const c=await auth.createUserWithEmailAndPassword(SUPER_EMAIL,pin);user=c.user}catch(e){if(e.code==='auth/email-already-in-use'){const c=await auth.signInWithEmailAndPassword(SUPER_EMAIL,pin);user=c.user}else throw e}}
   if(user && !user.emailVerified) await user.sendEmailVerification();
   return{ok:true,verificationSent:!!(user&&!user.emailVerified)};
  }catch(e){return{ok:false,error:e.message||'Firebase setup failed.'}}
 },
 async loginSuper(pin){
  initFirebase(); pin=String(pin||''); if(!/^\d{6,8}$/.test(pin))return{ok:false,error:'Enter the 6–8 digit Super Admin PIN.'};
  try{const c=await auth.signInWithEmailAndPassword(SUPER_EMAIL,pin);const u=c.user;
   if(!u.emailVerified){try{await u.sendEmailVerification()}catch{}return{ok:false,verification:true,error:'Verify the Super Admin email first. A new verification email was sent.'}}
   const s={userId:u.uid,organizationId:null,role:'SUPER_ADMIN',email:u.email,name:'Vikas Attri'};this.setSession(s);try{await auditEvent('LOGIN','AUTH',u.uid,'Super Admin sign-in')}catch{}return{ok:true,session:s};
  }catch(e){return{ok:false,code:e.code,error:e.message||'Invalid Super Admin PIN.'}}
 },
 async resendVerification(){
  initFirebase();const u=auth&&auth.currentUser;if(!u)return{ok:false,error:'No signed-in account is available.'};
  try{await u.sendEmailVerification();return{ok:true}}catch(e){return{ok:false,error:e.message||'Could not send verification email.'}}
 },
 superPinSet(){initFirebase();return !!(auth&&auth.currentUser&&auth.currentUser.email===SUPER_EMAIL)},
 findOrganization(q){const x=N(q);return this.organizations().find(o=>N(o.code)===x||N(o.name)===x||N(o.email)===x)||null},
 rolesFor(org){return org?['OWNER','ADMIN','HOD','TEACHER','STUDENT','PARENT','ACCOUNTANT','COUNSELOR']:[]},
 async findOrganizationFirebase(q){initFirebase();const x=String(q||'').trim();if(!db)return null;try{let snap=await db.collection('organizations').where('code','==',x.toUpperCase()).limit(1).get();if(!snap.empty)return{id:snap.docs[0].id,...snap.docs[0].data()};snap=await db.collection('organizations').where('name','==',x).limit(1).get();if(!snap.empty)return{id:snap.docs[0].id,...snap.docs[0].data()};return null}catch(e){return null}},
 async loginOrganization(identity,password,orgQuery,role){
  initFirebase();if(!auth||!db)return{ok:false,error:'Firebase is not available.'};
  try{const org=await this.findOrganizationFirebase(orgQuery);if(!org)return{ok:false,error:'Institute not found. Use registered institute name/code.'};
   let email=String(identity||'').trim();
   if(!email.includes('@')){const qs=await db.collection('users').where('organizationId','==',org.id).where('mobile','==',email).limit(1).get();if(qs.empty)return{ok:false,error:'Mobile number not found in this institute.'};email=qs.docs[0].data().email}
   const c=await auth.signInWithEmailAndPassword(email,String(password||''));const u=c.user;
   if(!u.emailVerified)return{ok:false,verification:true,error:'Please verify your email before logging in.'};
   const doc=await db.collection('users').doc(u.uid).get();if(!doc.exists)return{ok:false,error:'User profile not found.'};const d=doc.data();
   if(d.organizationId!==org.id||d.role!==role)return{ok:false,error:'Institute or role access denied.'};
   if(d.status==='BLOCKED'||d.status==='DISABLED')return{ok:false,error:'This user account is blocked or disabled by the institution.'};
   if(org.status==='BLOCKED'||org.status==='DISABLED')return{ok:false,error:'This institution is currently blocked or disabled.'};
   const s={userId:u.uid,organizationId:org.id,role:d.role,email:u.email,mobile:d.mobile||'',name:d.name||u.displayName||'',organizationName:org.name};this.setSession(s);try{await auditEvent('LOGIN','AUTH',u.uid,'Institution sign-in')}catch{}return{ok:true,session:s,organization:org};
  }catch(e){return{ok:false,error:e.message||'Invalid institute login details.'}}
 },
 async registerInstitute(d){
  initFirebase();if(!auth||!db)return{ok:false,error:'Firebase is not available.'};
  const e=N(d.email);if(!d.name||!e||!d.password)return{ok:false,error:'Institute name, email and password are required.'};
  try{const c=await auth.createUserWithEmailAndPassword(e,String(d.password));const u=c.user;const ref=db.collection('organizations').doc();const code=(String(d.name).replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase()||'INST')+'-'+Math.floor(1000+Math.random()*9000);const org={id:ref.id,code,name:String(d.name).trim(),type:d.type||'Institute',email:e,mobile:String(d.mobile||'').trim(),ownerId:u.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp(),status:'ACTIVE'};const profile={id:u.uid,organizationId:ref.id,role:'OWNER',name:String(d.ownerName||d.owner||'Institute Owner').trim(),email:e,mobile:String(d.phone||d.mobile||'').trim(),createdAt:firebase.firestore.FieldValue.serverTimestamp(),status:'ACTIVE'};await ref.set(org);await db.collection('users').doc(u.uid).set(profile);try{await u.sendEmailVerification()}catch{};const s={userId:u.uid,organizationId:ref.id,role:'OWNER',email:e,mobile:profile.mobile,name:profile.name,organizationName:org.name};this.setSession(s);return{ok:true,session:s,organization:{...org,createdAt:new Date().toISOString()},verificationSent:true};
  }catch(e){return{ok:false,error:e.message||'Institute registration failed.'}}
 },
 organization(){const s=this.session();return s?this.findOrganization(s.organizationId):null},
 requireSession(){const s=this.session();if(!s){location.href='access.html';return null}return s},
 requireRole(roles){const s=this.requireSession();if(s&&!roles.includes(s.role)){location.href='access.html?error=permission';return null}return s}
};
NAVYA.ensureDemoSuperAdmin();
async function auditEvent(action,entity,entityId,details){
  try{initFirebase();const s=NAVYA.session(),u=auth&&auth.currentUser;if(!db||!u||!u.emailVerified||!s)return;await db.collection('auditLogs').add({organizationId:s.organizationId||null,userId:u.uid,actor:s.name||u.email,actorEmail:u.email||'',action,entity,entityId:entityId||null,details:details||'',page:location.pathname||'/',createdAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){}
}
window.NAVYA.auditEvent=auditEvent;
function trackPageVisit(){
  try{initFirebase();if(!auth)return;auth.onAuthStateChanged(async u=>{const s=NAVYA.session();if(!u||!s||!u.emailVerified)return;try{await db.collection('auditLogs').add({organizationId:s.organizationId||null,userId:u.uid,actor:s.name||u.email,actorEmail:u.email||'',action:'PAGE_VIEW',entity:'PAGE',details:'Visited '+(document.title||location.pathname),page:location.pathname||'/',createdAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){}})}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',trackPageVisit);else trackPageVisit();
})();
