import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-D4017ZHx.js";import{i as o,n as s,r as c,t as l}from"./bakedVertexAnimation-CmDuYKpI.js";import{n as u,t as d}from"./morphTargetsVertexGlobalDeclaration-bu-rVdb5.js";import{n as f,t as p}from"./morphTargetsVertexDeclaration-BtRcDmbf.js";import{n as m,t as h}from"./morphTargetsVertexGlobal-DrG7AUxD.js";import{n as g,t as _}from"./morphTargetsVertex-BQx0GRhN.js";import{r as v,t as y}from"./bonesVertex-4uihoA7n.js";import{r as b,t as x}from"./clipPlaneVertex-CdGVP8lM.js";import{r as S,t as C}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as w,t as T}from"./instancesDeclaration-wmdSHGgS.js";import{n as E,t as D}from"./instancesVertex-Dd3Zi5LO.js";import{n as O,t as k}from"./pointCloudVertex-BUKBC9IE.js";var A,j,M,N=e((()=>{n(),A=`pointCloudVertexDeclaration`,j=`#ifdef POINTSIZE
uniform float pointSize;
#endif
`,r.IncludesShadersStore[A]||(r.IncludesShadersStore[A]=j),M={name:A,shader:j}})),P=t({depthVertexShader:()=>R}),F,I,L,R,z=e((()=>{n(),i(),o(),d(),p(),S(),T(),N(),h(),_(),D(),v(),s(),b(),k(),F=`depthVertexShader`,I=`attribute vec3 position;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
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
#ifdef STORE_CAMERASPACE_Z
uniform mat4 view;varying vec4 vViewPos;
#endif
#include<pointCloudVertexDeclaration>
varying float vDepthMetric;
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
#include<clipPlaneVertex>
gl_Position=viewProjection*worldPos;
#ifdef STORE_CAMERASPACE_Z
vViewPos=view*worldPos;
#else
#ifdef USE_REVERSE_DEPTHBUFFER
vDepthMetric=((-gl_Position.z+depthValues.x)/(depthValues.y));
#else
vDepthMetric=((gl_Position.z+depthValues.x)/(depthValues.y));
#endif
#endif
#if defined(ALPHATEST) || defined(BASIC_RENDER)
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#include<pointCloudVertex>
}
`,r.ShadersStore[F]||(r.ShadersStore[F]=I),L=[a,c,u,f,C,w,M,m,g,E,y,l,x,O];for(let e of L)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);R={name:F,shader:I}}));export{P as n,z as r,R as t};