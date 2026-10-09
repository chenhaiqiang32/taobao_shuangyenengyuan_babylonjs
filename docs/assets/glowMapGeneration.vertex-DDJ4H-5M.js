import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-eL-UWn6d.js";import{r as o,t as s}from"./bonesVertex-BiF-eB3j.js";import{r as c,t as l}from"./clipPlaneVertex-BZpMxmsm.js";import{r as u,t as d}from"./clipPlaneVertexDeclaration-f70TK6xP.js";import{n as f,t as p}from"./morphTargetsVertex-ClgrPuBy.js";import{n as m,t as h}from"./morphTargetsVertexDeclaration-D5bz8MiY.js";import{n as g,t as _}from"./morphTargetsVertexGlobal-DJ-LeGH7.js";import{n as v,t as y}from"./morphTargetsVertexGlobalDeclaration-B_9Nm93V.js";import{n as b,t as x}from"./bakedVertexAnimationDeclaration-CDQs61LG.js";import{n as S,t as C}from"./instancesDeclaration-CgXh0JO7.js";import{n as w,t as T}from"./instancesVertex-C56VJhRE.js";import{n as E,t as D}from"./bakedVertexAnimation-CR15jBnU.js";var O=t({glowMapGenerationVertexShaderWGSL:()=>M}),k,A,j,M,N=e((()=>{n(),i(),b(),y(),h(),u(),C(),_(),p(),T(),o(),E(),c(),k=`glowMapGenerationVertexShader`,A=`attribute position: vec3f;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform viewProjection: mat4x4f;varying vPosition: vec4f;
#ifdef UV1
attribute uv: vec2f;
#endif
#ifdef UV2
attribute uv2: vec2f;
#endif
#ifdef DIFFUSE
varying vUVDiffuse: vec2f;uniform diffuseMatrix: mat4x4f;
#endif
#ifdef OPACITY
varying vUVOpacity: vec2f;uniform opacityMatrix: mat4x4f;
#endif
#ifdef EMISSIVE
varying vUVEmissive: vec2f;uniform emissiveMatrix: mat4x4f;
#endif
#ifdef VERTEXALPHA
attribute color: vec4f;varying vColor: vec4f;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {var positionUpdated: vec3f=vertexInputs.position;
#ifdef UV1
var uvUpdated: vec2f=vertexInputs.uv;
#endif
#ifdef UV2
var uv2Updated: vec2f=vertexInputs.uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(positionUpdated,1.0);
#ifdef CUBEMAP
vertexOutputs.vPosition=worldPos;vertexOutputs.position=uniforms.viewProjection*finalWorld* vec4f(vertexInputs.position,1.0);
#else
vertexOutputs.vPosition=uniforms.viewProjection*worldPos;vertexOutputs.position=vertexOutputs.vPosition;
#endif
#ifdef DIFFUSE
#ifdef DIFFUSEUV1
vertexOutputs.vUVDiffuse= (uniforms.diffuseMatrix* vec4f(uvUpdated,1.0,0.0)).xy;
#endif
#ifdef DIFFUSEUV2
vertexOutputs.vUVDiffuse= (uniforms.diffuseMatrix* vec4f(uv2Updated,1.0,0.0)).xy;
#endif
#endif
#ifdef OPACITY
#ifdef OPACITYUV1
vertexOutputs.vUVOpacity= (uniforms.opacityMatrix* vec4f(uvUpdated,1.0,0.0)).xy;
#endif
#ifdef OPACITYUV2
vertexOutputs.vUVOpacity= (uniforms.opacityMatrix* vec4f(uv2Updated,1.0,0.0)).xy;
#endif
#endif
#ifdef EMISSIVE
#ifdef EMISSIVEUV1
vertexOutputs.vUVEmissive= (uniforms.emissiveMatrix* vec4f(uvUpdated,1.0,0.0)).xy;
#endif
#ifdef EMISSIVEUV2
vertexOutputs.vUVEmissive= (uniforms.emissiveMatrix* vec4f(uv2Updated,1.0,0.0)).xy;
#endif
#endif
#ifdef VERTEXALPHA
vertexOutputs.vColor=vertexInputs.color;
#endif
#include<clipPlaneVertex>
}`,r.ShadersStoreWGSL[k]||(r.ShadersStoreWGSL[k]=A),j=[a,x,v,m,d,S,g,f,w,s,D,l];for(let e of j)r.IncludesShadersStoreWGSL[e.name]||(r.IncludesShadersStoreWGSL[e.name]=e.shader);M={name:k,shader:A}}));export{O as n,N as r,M as t};