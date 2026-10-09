import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-D4017ZHx.js";import{i as o,n as s,r as c,t as l}from"./bakedVertexAnimation-CmDuYKpI.js";import{n as u,t as d}from"./morphTargetsVertexGlobalDeclaration-bu-rVdb5.js";import{n as f,t as p}from"./morphTargetsVertexDeclaration-BtRcDmbf.js";import{n as m,t as h}from"./morphTargetsVertexGlobal-DrG7AUxD.js";import{n as g,t as _}from"./morphTargetsVertex-BQx0GRhN.js";import{r as v,t as y}from"./bonesVertex-4uihoA7n.js";import{r as b,t as x}from"./clipPlaneVertex-CdGVP8lM.js";import{r as S,t as C}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as w,t as T}from"./instancesDeclaration-wmdSHGgS.js";import{n as E,t as D}from"./instancesVertex-Dd3Zi5LO.js";var O=t({glowMapGenerationVertexShader:()=>M}),k,A,j,M,N=e((()=>{n(),i(),o(),d(),p(),S(),T(),h(),_(),D(),v(),s(),b(),k=`glowMapGenerationVertexShader`,A=`attribute vec3 position;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform mat4 viewProjection;varying vec4 vPosition;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef DIFFUSE
varying vec2 vUVDiffuse;uniform mat4 diffuseMatrix;
#endif
#ifdef OPACITY
varying vec2 vUVOpacity;uniform mat4 opacityMatrix;
#endif
#ifdef EMISSIVE
varying vec2 vUVEmissive;uniform mat4 emissiveMatrix;
#endif
#ifdef VERTEXALPHA
attribute vec4 color;varying vec4 vColor;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);
#ifdef CUBEMAP
vPosition=worldPos;gl_Position=viewProjection*finalWorld*vec4(position,1.0);
#else
vPosition=viewProjection*worldPos;gl_Position=vPosition;
#endif
#ifdef DIFFUSE
#ifdef DIFFUSEUV1
vUVDiffuse=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef DIFFUSEUV2
vUVDiffuse=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef OPACITY
#ifdef OPACITYUV1
vUVOpacity=vec2(opacityMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef OPACITYUV2
vUVOpacity=vec2(opacityMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef EMISSIVE
#ifdef EMISSIVEUV1
vUVEmissive=vec2(emissiveMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef EMISSIVEUV2
vUVEmissive=vec2(emissiveMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef VERTEXALPHA
vColor=color;
#endif
#include<clipPlaneVertex>
}`,r.ShadersStore[k]||(r.ShadersStore[k]=A),j=[a,c,u,f,C,w,m,g,E,y,l,x];for(let e of j)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);M={name:k,shader:A}}));export{O as n,N as r,M as t};