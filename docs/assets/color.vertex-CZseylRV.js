import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-D4017ZHx.js";import{i as o,n as s,r as c,t as l}from"./bakedVertexAnimation-CmDuYKpI.js";import{r as u,t as d}from"./bonesVertex-4uihoA7n.js";import{r as f,t as p}from"./clipPlaneVertex-CdGVP8lM.js";import{r as m,t as h}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as g,t as _}from"./instancesDeclaration-wmdSHGgS.js";import{n as v,t as y}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as b,t as x}from"./instancesVertex-Dd3Zi5LO.js";import{n as S,t as C}from"./fogVertex-BNTM3_0Y.js";import{n as w,t as T}from"./vertexColorMixing-BPFrZgsz.js";var E=t({colorVertexShader:()=>A}),D,O,k,A,j=e((()=>{n(),i(),o(),m(),v(),_(),x(),u(),s(),f(),S(),T(),D=`colorVertexShader`,O=`attribute vec3 position;
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#ifdef FOG
uniform mat4 view;
#endif
#include<instancesDeclaration>
uniform mat4 viewProjection;
#ifdef MULTIVIEW
uniform mat4 viewProjectionR;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);
#ifdef MULTIVIEW
if (gl_ViewID_OVR==0u) {gl_Position=viewProjection*worldPos;} else {gl_Position=viewProjectionR*worldPos;}
#else
gl_Position=viewProjection*worldPos;
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<vertexColorMixing>
#define CUSTOM_VERTEX_MAIN_END
}`,r.ShadersStore[D]||(r.ShadersStore[D]=O),k=[a,c,h,y,g,b,d,l,p,C,w];for(let e of k)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);A={name:D,shader:O}}));export{E as n,j as r,A as t};