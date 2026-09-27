/* NAVYA DATA — tenant-scoped Firestore helpers */
(function(){
  function ready(){return NAVYA.firebase().db}
  function ctx(){const s=NAVYA.requireSession(); if(!s) throw new Error('Session required'); return s}
  function clean(x){const o={...x}; delete o.id; delete o.createdAt; delete o.updatedAt; return o}
  async function list(collection){
    const s=ctx(), db=ready(); let q=db.collection(collection);
    if(s.role!=='SUPER_ADMIN') q=q.where('organizationId','==',s.organizationId);
    const snap=await q.limit(500).get();
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  async function get(collection,id){const s=ctx(),db=ready();const d=await db.collection(collection).doc(id).get();if(!d.exists)throw new Error('Record not found');const x=d.data();if(s.role!=='SUPER_ADMIN'&&x.organizationId!==s.organizationId)throw new Error('Access denied');return{id:d.id,...x}}
  async function add(collection,data){const s=ctx(),db=ready();const x={...clean(data),organizationId:s.role==='SUPER_ADMIN'?(data.organizationId||null):s.organizationId,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};if(!x.organizationId&&s.role!=='SUPER_ADMIN')throw new Error('Organization context missing');const ref=await db.collection(collection).add(x);await audit('CREATE',collection,ref.id,'Record created');return ref.id}
  async function update(collection,id,data){const s=ctx(),db=ready();await get(collection,id);await db.collection(collection).doc(id).update({...clean(data),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});await audit('UPDATE',collection,id,'Record updated');}
  async function remove(collection,id){const s=ctx(),db=ready();await get(collection,id);await db.collection(collection).doc(id).delete();await audit('DELETE',collection,id,'Record deleted');}
  async function audit(action,entity,entityId,details){const s=NAVYA.session();if(!s)return;try{await ready().collection('auditLogs').add({organizationId:s.organizationId||null,userId:s.userId,actor:s.name||s.email,actorEmail:s.email||'',action,entity,entityId:entityId||null,details:details||'',page:location.pathname||'/',createdAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){}}
  window.NAVYA_DATA={list,get,add,update,remove,audit};
})();