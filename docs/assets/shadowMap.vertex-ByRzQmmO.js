import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-D4017ZHx.js";import{i as o,n as s,r as c,t as l}from"./bakedVertexAnimation-CmDuYKpI.js";import{n as ee,t as u}from"./morphTargetsVertexGlobalDeclaration-bu-rVdb5.js";import{n as d,t as f}from"./morphTargetsVertexDeclaration-BtRcDmbf.js";import{n as p,t as m}from"./morphTargetsVertexGlobal-DrG7AUxD.js";import{n as h,t as g}from"./morphTargetsVertex-BQx0GRhN.js";import{r as _,t as v}from"./bonesVertex-4uihoA7n.js";import{r as y,t as te}from"./clipPlaneVertex-CdGVP8lM.js";import{r as ne,t as re}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{r as ie,t as b}from"./helperFunctions-DIiOqH-9.js";import{n as x,t as S}from"./shadowMapVertexMetric-B1-sgeFH.js";import{n as C,t as w}from"./sceneUboDeclaration-DY0whaDI.js";import{n as T,t as E}from"./instancesVertex-Dd3Zi5LO.js";import{n as D,t as O}from"./meshUboDeclaration-DmH0C9dB.js";import{n as k,t as A}from"./sceneVertexDeclaration-D9ITZeOZ.js";import{n as j,t as M}from"./meshVertexDeclaration-B0x68bHY.js";var N,P,F,I=e((()=>{n(),A(),M(),N=`shadowMapVertexDeclaration`,P=`#include<sceneVertexDeclaration>
#include<meshVertexDeclaration>
`,r.IncludesShadersStore[N]||(r.IncludesShadersStore[N]=P),F={name:N,shader:P}})),L,R,z,B=e((()=>{n(),w(),O(),L=`shadowMapUboDeclaration`,R=`layout(std140,column_major) uniform;
#include<sceneUboDeclaration>
#include<meshUboDeclaration>
`,r.IncludesShadersStore[L]||(r.IncludesShadersStore[L]=R),z={name:L,shader:R}})),V,H,U,W=e((()=>{n(),V=`shadowMapVertexExtraDeclaration`,H=`#if SM_NORMALBIAS==1
uniform vec3 lightDataSM;
#endif
uniform vec3 biasAndScaleSM;uniform vec2 depthValuesSM;varying float vDepthMetricSM;
#if SM_USEDISTANCE==1
varying vec3 vPositionWSM;
#endif
#if defined(SM_DEPTHCLAMP) && SM_DEPTHCLAMP==1
varying float zSM;
#endif
`,r.IncludesShadersStore[V]||(r.IncludesShadersStore[V]=H),U={name:V,shader:H}})),G,K,q,J=e((()=>{n(),G=`shadowMapVertexNormalBias`,K=`#if SM_NORMALBIAS==1
#if SM_DIRECTIONINLIGHTDATA==1
vec3 worldLightDirSM=normalize(-lightDataSM.xyz);
#else
vec3 directionToLightSM=lightDataSM.xyz-worldPos.xyz;vec3 worldLightDirSM=normalize(directionToLightSM);
#endif
float ndlSM=dot(vNormalW,worldLightDirSM);float sinNLSM=sqrt(1.0-ndlSM*ndlSM);float normalBiasSM=biasAndScaleSM.y*sinNLSM;worldPos.xyz-=vNormalW*normalBiasSM;
#endif
`,r.IncludesShadersStore[G]||(r.IncludesShadersStore[G]=K),q={name:G,shader:K}})),Y=t({shadowMapVertexShader:()=>$}),X,Z,Q,$,ae=e((()=>{n(),i(),o(),u(),f(),ie(),A(),M(),I(),w(),O(),B(),W(),ne(),m(),g(),E(),_(),s(),J(),S(),y(),X=`shadowMapVertexShader`,Z=`attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#ifdef INSTANCES
attribute vec4 world0;attribute vec4 world1;attribute vec4 world2;attribute vec4 world3;
#endif
#include<helperFunctions>
#include<__decl__shadowMapVertex>
#ifdef ALPHATEXTURE
varying vec2 vUV;uniform mat4 diffuseMatrix;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#include<shadowMapVertexExtraDeclaration>
#include<clipPlaneVertexDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#ifdef NORMAL
vec3 normalUpdated=normal;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);
#ifdef NORMAL
mat3 normWorldSM=mat3(finalWorld);
#if defined(INSTANCES) && defined(THIN_INSTANCES)
vec3 vNormalW=normalUpdated/vec3(dot(normWorldSM[0],normWorldSM[0]),dot(normWorldSM[1],normWorldSM[1]),dot(normWorldSM[2],normWorldSM[2]));vNormalW=normalize(normWorldSM*vNormalW);
#else
#ifdef NONUNIFORMSCALING
normWorldSM=transposeMat3(inverseMat3(normWorldSM));
#endif
vec3 vNormalW=normalize(normWorldSM*normalUpdated);
#endif
#endif
#include<shadowMapVertexNormalBias>
gl_Position=viewProjection*worldPos;
#include<shadowMapVertexMetric>
#ifdef ALPHATEXTURE
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#include<clipPlaneVertex>
}`,r.ShadersStore[X]||(r.ShadersStore[X]=Z),Q=[a,c,ee,d,b,k,j,F,C,D,z,U,re,p,h,T,v,l,q,x,te];for(let e of Q)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);$={name:X,shader:Z}}));export{$ as n,Y as r,ae as t};