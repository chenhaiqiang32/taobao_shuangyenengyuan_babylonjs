import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./bonesDeclaration-D4017ZHx.js";import{i as a,n as o,r as s,t as c}from"./bakedVertexAnimation-CmDuYKpI.js";import{r as l,t as u}from"./bonesVertex-4uihoA7n.js";import{r as d,t as f}from"./clipPlaneVertex-CdGVP8lM.js";import{r as p,t as m}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as h,t as g}from"./lightFragmentDeclaration-xXRmKbWC.js";import{n as _,t as v}from"./lightUboDeclaration-D__UCulE.js";import{n as y,t as b}from"./logDepthDeclaration-CXHAYacR.js";import{n as x,t as S}from"./shadowsVertex-C0uZgBeP.js";import{n as C,t as w}from"./sceneUboDeclaration-DY0whaDI.js";import{n as T,t as E}from"./instancesDeclaration-wmdSHGgS.js";import{n as D,t as O}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as k,t as A}from"./instancesVertex-Dd3Zi5LO.js";import{n as j,t as M}from"./fogVertex-BNTM3_0Y.js";import{n as N,t as P}from"./logDepthVertex-B5lLzgZb.js";import{n as F,t as I}from"./sceneVertexDeclaration-D9ITZeOZ.js";var L,R,z,B;e((()=>{t(),r(),a(),E(),I(),w(),p(),b(),D(),g(),v(),A(),l(),o(),d(),P(),j(),S(),L=`shadowOnlyVertexShader`,R=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
#include<__decl__sceneVertex>
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying float vViewDepth;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`,n.ShadersStore[L]||(n.ShadersStore[L]=R),z=[i,s,T,F,C,m,y,O,h,_,k,u,c,f,N,M,x];for(let e of z)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);B={name:L,shader:R}}))();export{B as shadowOnlyVertexShader};