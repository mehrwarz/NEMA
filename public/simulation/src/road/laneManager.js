import * as THREE from "three";
import {CONFIG} from "../../config/simulationConfig.js";

// Lane offsets are measured from the road center. Positive X is east, positive Z is north.
// Right-hand traffic:
// N: +X lanes, S: -X lanes, E: -Z lanes, W: +Z lanes.
export const LANES={
 north:[{id:"N_LEFT",offset:2.5,movement:"LEFT"},{id:"N_T1",offset:7.5,movement:"THROUGH"},{id:"N_T2",offset:12.5,movement:"THROUGH"}],
 south:[{id:"S_LEFT",offset:-2.5,movement:"LEFT"},{id:"S_T1",offset:-7.5,movement:"THROUGH"},{id:"S_T2",offset:-12.5,movement:"THROUGH"}],
 east:[{id:"E_SHARED",offset:-2.5,movement:"RANDOM"},{id:"E_THROUGH",offset:-7.5,movement:"THROUGH"}],
 west:[{id:"W_SHARED",offset:2.5,movement:"RANDOM"},{id:"W_THROUGH",offset:7.5,movement:"THROUGH"}]
};
export const travelSign=d=>d==="north"||d==="east"?1:-1;
export const stopBar=d=>d==="north"||d==="east"?-22:22;
export const chooseMovement=l=>l.movement==="RANDOM"?(Math.random()<.5?"LEFT":"THROUGH"):l.movement;
export const laneById=(d,id)=>LANES[d].find(l=>l.id===id);
export const compatible=(vehicle,target)=>vehicle.movement===target.movement;
export const adjacentLanes=(d,lane)=>{const a=LANES[d],i=a.indexOf(lane);return [a[i-1],a[i+1]].filter(Boolean)};

// Cubic paths are defined in world coordinates and end on the correct receiving lane.
export function turnCurve(direction,offset){
 const y=0.45, r=CONFIG.road.intersectionHalf;
 let p0,p1,p2,p3;
 if(direction==="north"){ // northbound left -> westbound shared lane (+Z)
   p0=new THREE.Vector3(offset,y,-r);p1=new THREE.Vector3(offset,y,-7);p2=new THREE.Vector3(7,y,offset);p3=new THREE.Vector3(-35,y,2.5);
 } else if(direction==="south"){ // southbound left -> eastbound shared lane (-Z)
   p0=new THREE.Vector3(offset,y,r);p1=new THREE.Vector3(offset,y,7);p2=new THREE.Vector3(-7,y,offset);p3=new THREE.Vector3(35,y,-2.5);
 } else if(direction==="east"){ // eastbound left -> northbound inner through lane
   p0=new THREE.Vector3(-r,y,offset);p1=new THREE.Vector3(-7,y,offset);p2=new THREE.Vector3(offset,y,7);p3=new THREE.Vector3(2.5,y,35);
 } else { // westbound left -> southbound inner through lane
   p0=new THREE.Vector3(r,y,offset);p1=new THREE.Vector3(7,y,offset);p2=new THREE.Vector3(offset,y,-7);p3=new THREE.Vector3(-2.5,y,-35);
 }
 return {curve:new THREE.CubicBezierCurve3(p0,p1,p2,p3),nextDirection: direction==="north"?"west":direction==="south"?"east":direction==="east"?"north":"south",nextLaneOffset: direction==="north"?2.5:direction==="south"?-2.5:direction==="east"?2.5:-2.5};
}
