import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./bonesDeclaration-D4017ZHx.js";import{i as a,n as o,r as s,t as c}from"./bakedVertexAnimation-CmDuYKpI.js";import{r as l,t as u}from"./bonesVertex-4uihoA7n.js";import{r as d,t as f}from"./clipPlaneVertex-CdGVP8lM.js";import{r as p,t as m}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as h,t as g}from"./lightFragmentDeclaration-xXRmKbWC.js";import{n as _,t as v}from"./lightUboDeclaration-D__UCulE.js";import{n as y,t as b}from"./logDepthDeclaration-CXHAYacR.js";import{n as x,t as S}from"./shadowsVertex-C0uZgBeP.js";import{n as C,t as w}from"./instancesDeclaration-wmdSHGgS.js";import{n as T,t as E}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as D,t as O}from"./instancesVertex-Dd3Zi5LO.js";import{n as k,t as A}from"./fogVertex-BNTM3_0Y.js";import{n as j,t as M}from"./logDepthVertex-B5lLzgZb.js";import{n as N,t as P}from"./vertexColorMixing-BPFrZgsz.js";var F,I,L,R;e((()=>{t(),r(),a(),w(),p(),b(),T(),g(),v(),O(),l(),o(),d(),k(),S(),P(),M(),F=`cellVertexShader`,I=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;
#endif
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
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vDiffuseInfos.x==0.)
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}
else
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`,n.ShadersStore[F]||(n.ShadersStore[F]=I),L=[i,s,C,m,y,E,h,_,D,u,c,f,A,x,N,j];for(let e of L)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);R={name:F,shader:I}}))();export{R as cellVertexShader};