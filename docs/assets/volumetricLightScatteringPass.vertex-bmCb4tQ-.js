import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-D4017ZHx.js";import{i as o,n as s,r as c,t as l}from"./bakedVertexAnimation-CmDuYKpI.js";import{n as u,t as d}from"./morphTargetsVertexGlobalDeclaration-bu-rVdb5.js";import{n as f,t as p}from"./morphTargetsVertexDeclaration-BtRcDmbf.js";import{n as m,t as h}from"./morphTargetsVertexGlobal-DrG7AUxD.js";import{n as g,t as _}from"./morphTargetsVertex-BQx0GRhN.js";import{r as v,t as y}from"./bonesVertex-4uihoA7n.js";import{n as b,t as x}from"./instancesDeclaration-wmdSHGgS.js";import{n as S,t as C}from"./instancesVertex-Dd3Zi5LO.js";var w=t({volumetricLightScatteringPassVertexShader:()=>O}),T,E,D,O,k=e((()=>{n(),i(),o(),d(),p(),x(),h(),_(),C(),v(),s(),T=`volumetricLightScatteringPassVertexShader`,E=`attribute vec3 position;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<instancesDeclaration>
uniform mat4 viewProjection;uniform vec2 depthValues;
#if defined(ALPHATEST) || defined(NEED_UV)
varying vec2 vUV;uniform mat4 diffuseMatrix;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#if (defined(ALPHATEST) || defined(NEED_UV)) && defined(UV1)
vec2 uvUpdated=uv;
#endif
#if (defined(ALPHATEST) || defined(NEED_UV)) && defined(UV2)
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
gl_Position=viewProjection*finalWorld*vec4(positionUpdated,1.0);
#if defined(ALPHATEST) || defined(BASIC_RENDER)
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
}
`,r.ShadersStore[T]||(r.ShadersStore[T]=E),D=[a,c,u,f,b,m,g,S,y,l];for(let e of D)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);O={name:T,shader:E}}));export{w as n,k as t};