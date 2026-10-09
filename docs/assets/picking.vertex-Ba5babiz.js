import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-eL-UWn6d.js";import{r as o,t as s}from"./bonesVertex-BiF-eB3j.js";import{n as c,t as l}from"./morphTargetsVertex-ClgrPuBy.js";import{n as u,t as d}from"./morphTargetsVertexDeclaration-D5bz8MiY.js";import{n as f,t as p}from"./morphTargetsVertexGlobal-DJ-LeGH7.js";import{n as m,t as h}from"./morphTargetsVertexGlobalDeclaration-B_9Nm93V.js";import{n as g,t as _}from"./bakedVertexAnimationDeclaration-CDQs61LG.js";import{n as v,t as y}from"./instancesDeclaration-CgXh0JO7.js";import{n as b,t as x}from"./instancesVertex-C56VJhRE.js";import{n as S,t as C}from"./bakedVertexAnimation-CR15jBnU.js";var w=t({pickingVertexShaderWGSL:()=>O}),T,E,D,O,k=e((()=>{n(),i(),g(),h(),d(),y(),p(),l(),x(),o(),S(),T=`pickingVertexShader`,E=`attribute position: vec3f;
#if defined(INSTANCES)
attribute instanceMeshID: f32;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<instancesDeclaration>
uniform viewProjection: mat4x4f;
#if defined(INSTANCES)
flat varying vMeshID: f32;
#endif
@vertex
fn main(input : VertexInputs)->FragmentInputs {var positionUpdated: vec3f=vertexInputs.position;
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld*vec4f(positionUpdated,1.0);vertexOutputs.position=uniforms.viewProjection*worldPos;
#if defined(INSTANCES)
vertexOutputs.vMeshID=vertexInputs.instanceMeshID;
#endif
}
`,r.ShadersStoreWGSL[T]||(r.ShadersStoreWGSL[T]=E),D=[a,_,m,u,v,f,c,b,s,C];for(let e of D)r.IncludesShadersStoreWGSL[e.name]||(r.IncludesShadersStoreWGSL[e.name]=e.shader);O={name:T,shader:E}}));export{O as n,w as r,k as t};