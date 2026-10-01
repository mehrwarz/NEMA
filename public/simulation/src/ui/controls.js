export function setupControls(signals){let demo=false,timer=0,index=0;const states=[
 {phases:{green:[2,3,5,6,7,9],yellow:[],red:[4,11,8,10,13,15],fly:[]}},
 {phases:{green:[4,11,8,10],yellow:[],red:[2,3,5,6,7,9,13,15],fly:[]}},
 {phases:{green:[7,8,9,10],yellow:[],red:[2,3,4,5,6,11,13,15],fly:[]}},
 {phases:{green:[13,15],yellow:[],red:[2,3,4,5,6,7,8,9,10,11],fly:[]}}
 ];
 document.getElementById("apply").onclick=()=>{try{demo=false;signals.apply(JSON.parse(document.getElementById("signalInput").value))}catch(e){document.getElementById("status").textContent="JSON error: "+e.message}};
 document.getElementById("demo").onclick=()=>{demo=!demo;document.getElementById("demo").textContent=demo?"Stop Demo":"Signal Demo";timer=0;index=0;if(demo)signals.apply(states[0])};return {update(dt){if(!demo)return;timer+=dt;if(timer>=5){timer=0;index=(index+1)%states.length;signals.apply(states[index])}}}}
