import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-eL-UWn6d.js";import{r as o,t as s}from"./bonesVertex-BiF-eB3j.js";import{r as c,t as l}from"./clipPlaneVertex-BZpMxmsm.js";import{r as u,t as d}from"./clipPlaneVertexDeclaration-f70TK6xP.js";import{r as f,t as p}from"./helperFunctions-CklT_CQT.js";import{n as m,t as h}from"./morphTargetsVertex-ClgrPuBy.js";import{n as g,t as _}from"./morphTargetsVertexDeclaration-D5bz8MiY.js";import{n as v,t as y}from"./morphTargetsVertexGlobal-DJ-LeGH7.js";import{n as b,t as x}from"./morphTargetsVertexGlobalDeclaration-B_9Nm93V.js";import{n as S,t as C}from"./shadowMapVertexMetric-CTP7TpdD.js";import{n as w,t as T}from"./sceneUboDeclaration-BucOHbCW.js";import{n as E,t as D}from"./bakedVertexAnimationDeclaration-CDQs61LG.js";import{n as O,t as k}from"./instancesVertex-C56VJhRE.js";import{n as A,t as j}from"./bakedVertexAnimation-CR15jBnU.js";import{n as M,t as N}from"./meshUboDeclaration-DDlgBu5O.js";var P,F,I,L=e((()=>{n(),P=`shadowMapVertexExtraDeclaration`,F=`#if SM_NORMALBIAS==1
uniform lightDataSM: vec3f;
#endif
uniform biasAndScaleSM: vec3f;uniform depthValuesSM: vec2f;varying vDepthMetricSM: f32;
#if SM_USEDISTANCE==1
varying vPositionWSM: vec3f;
#endif
#if defined(SM_DEPTHCLAMP) && SM_DEPTHCLAMP==1
varying zSM: f32;
#endif
`,r.IncludesShadersStoreWGSL[P]||(r.IncludesShadersStoreWGSL[P]=F),I={name:P,shader:F}})),R,z,B,V=e((()=>{n(),R=`shadowMapVertexNormalBias`,z=`#if SM_NORMALBIAS==1
#if SM_DIRECTIONINLIGHTDATA==1
var worldLightDirSM: vec3f=normalize(-uniforms.lightDataSM.xyz);
#else
var directionToLightSM: vec3f=uniforms.lightDataSM.xyz-worldPos.xyz;var worldLightDirSM: vec3f=normalize(directionToLightSM);
#endif
var ndlSM: f32=dot(vNormalW,worldLightDirSM);var sinNLSM: f32=sqrt(1.0-ndlSM*ndlSM);var normalBiasSM: f32=uniforms.biasAndScaleSM.y*sinNLSM;worldPos=vec4f(worldPos.xyz-vNormalW*normalBiasSM,worldPos.w);
#endif
`,r.IncludesShadersStoreWGSL[R]||(r.IncludesShadersStoreWGSL[R]=z),B={name:R,shader:z}})),H=t({shadowMapVertexShaderWGSL:()=>K}),U,W,G,K,q=e((()=>{n(),i(),E(),x(),_(),f(),T(),N(),L(),u(),y(),h(),k(),o(),A(),V(),C(),c(),U=`shadowMapVertexShader`,W=`attribute position: vec3f;
#ifdef NORMAL
attribute normal: vec3f;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#ifdef INSTANCES
attribute world0: vec4f;attribute world1: vec4f;attribute world2: vec4f;attribute world3: vec4f;
#endif
#include<helperFunctions>
#include<sceneUboDeclaration>
#include<meshUboDeclaration>
#ifdef ALPHATEXTURE
varying vUV: vec2f;uniform diffuseMatrix: mat4x4f;
#ifdef UV1
attribute uv: vec2f;
#endif
#ifdef UV2
attribute uv2: vec2f;
#endif
#endif
#include<shadowMapVertexExtraDeclaration>
#include<clipPlaneVertexDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {var positionUpdated: vec3f=vertexInputs.position;
#ifdef UV1
var uvUpdated: vec2f=vertexInputs.uv;
#endif
#ifdef UV2
var uv2Updated: vec2f=vertexInputs.uv2;
#endif
#ifdef NORMAL
var normalUpdated: vec3f=vertexInputs.normal;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(positionUpdated,1.0);
#ifdef NORMAL
var normWorldSM: mat3x3f= mat3x3f(finalWorld[0].xyz,finalWorld[1].xyz,finalWorld[2].xyz);
#if defined(INSTANCES) && defined(THIN_INSTANCES)
var vNormalW: vec3f=normalUpdated/ vec3f(dot(normWorldSM[0],normWorldSM[0]),dot(normWorldSM[1],normWorldSM[1]),dot(normWorldSM[2],normWorldSM[2]));vNormalW=normalize(normWorldSM*vNormalW);
#else
#ifdef NONUNIFORMSCALING
normWorldSM=transposeMat3(inverseMat3(normWorldSM));
#endif
var vNormalW: vec3f=normalize(normWorldSM*normalUpdated);
#endif
#endif
#include<shadowMapVertexNormalBias>
vertexOutputs.position=scene.viewProjection*worldPos;
#include<shadowMapVertexMetric>
#ifdef ALPHATEXTURE
#ifdef UV1
vertexOutputs.vUV= (uniforms.diffuseMatrix* vec4f(uvUpdated,1.0,0.0)).xy;
#endif
#ifdef UV2
vertexOutputs.vUV= (uniforms.diffuseMatrix* vec4f(uv2Updated,1.0,0.0)).xy;
#endif
#endif
#include<clipPlaneVertex>
}`,r.ShadersStoreWGSL[U]||(r.ShadersStoreWGSL[U]=W),G=[a,D,b,g,p,w,M,I,d,v,m,O,s,j,B,S,l];for(let e of G)r.IncludesShadersStoreWGSL[e.name]||(r.IncludesShadersStoreWGSL[e.name]=e.shader);K={name:U,shader:W}}));export{K as n,H as r,q as t};