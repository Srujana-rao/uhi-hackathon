let store=[];
exports.list = async()=>store;
exports.getById = async(id)=>store.find(s=>s._id===id);
exports.create = async(data)=>{ const o={...data,_id:(Math.random()*1e18).toString(36)}; store.push(o); return o; };
