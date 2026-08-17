import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./bonesDeclaration-D4017ZHx.js";import{i as o,n as s,r as c,t as l}from"./bakedVertexAnimation-CmDuYKpI.js";import{r as u,t as d}from"./bonesVertex-4uihoA7n.js";import{r as f,t as p}from"./clipPlaneVertex-CdGVP8lM.js";import{r as m,t as h}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{r as g,t as _}from"./helperFunctions-DIiOqH-9.js";import{n as v,t as y}from"./lightVxFragmentDeclaration-BQbiEj0E.js";import{n as b,t as x}from"./lightVxUboDeclaration-DhSwwWWS.js";import{n as S,t as C}from"./logDepthDeclaration-CXHAYacR.js";import{n as w,t as T}from"./shadowsVertex-C0uZgBeP.js";import{n as E,t as D}from"./sceneUboDeclaration-DY0whaDI.js";import{n as O,t as k}from"./backgroundUboDeclaration-SP4V6BZW.js";import{n as A,t as j}from"./instancesDeclaration-wmdSHGgS.js";import{n as M,t as N}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as P,t as F}from"./instancesVertex-Dd3Zi5LO.js";import{n as I,t as L}from"./fogVertex-BNTM3_0Y.js";import{n as R,t as z}from"./logDepthVertex-B5lLzgZb.js";var B,V,H,U=e((()=>{n(),B=`backgroundVertexDeclaration`,V=`uniform mat4 view;uniform mat4 viewProjection;
#ifdef MULTIVIEW
uniform mat4 viewProjectionR;
#endif
uniform float shadowLevel;
#ifdef DIFFUSE
uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;
#endif
#ifdef REFLECTION
uniform vec2 vReflectionInfos;uniform mat4 reflectionMatrix;uniform vec3 vReflectionMicrosurfaceInfos;uniform float fFovMultiplier;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
`,r.IncludesShadersStore[B]||(r.IncludesShadersStore[B]=V),H={name:B,shader:V}})),W=t({backgroundVertexShader:()=>J}),G,K,q,J,Y=e((()=>{n(),U(),D(),O(),g(),i(),o(),j(),m(),M(),y(),x(),C(),F(),u(),s(),f(),I(),T(),z(),G=`backgroundVertexShader`,K=`precision highp float;
#include<__decl__backgroundVertex>
#include<helperFunctions>
attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef MAINUV1
varying vec2 vMainUV1;
#endif
#ifdef MAINUV2
varying vec2 vMainUV2;
#endif
#if defined(DIFFUSE) && DIFFUSEDIRECTUV==0
varying vec2 vDiffuseUV;
#endif
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightVxFragment>[0..maxSimultaneousLights]
#ifdef REFLECTIONMAP_SKYBOX
varying vec3 vPositionUVW;
#endif
#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)
varying vec3 vDirectionW;
#endif
#include<logDepthDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef REFLECTIONMAP_SKYBOX
vPositionUVW=position;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
#ifdef MULTIVIEW
if (gl_ViewID_OVR==0u) {gl_Position=viewProjection*finalWorld*vec4(position,1.0);} else {gl_Position=viewProjectionR*finalWorld*vec4(position,1.0);}
#else
gl_Position=viewProjection*finalWorld*vec4(position,1.0);
#endif
vec4 worldPos=finalWorld*vec4(position,1.0);vPositionW=vec3(worldPos);
#ifdef NORMAL
mat3 normalWorld=mat3(finalWorld);
#ifdef NONUNIFORMSCALING
normalWorld=transposeMat3(inverseMat3(normalWorld));
#endif
vNormalW=normalize(normalWorld*normal);
#endif
#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)
vDirectionW=normalize(vec3(finalWorld*vec4(position,0.0)));
#ifdef EQUIRECTANGULAR_RELFECTION_FOV
mat3 screenToWorld=inverseMat3(mat3(finalWorld*viewProjection));vec3 segment=mix(vDirectionW,screenToWorld*vec3(0.0,0.0,1.0),abs(fFovMultiplier-1.0));if (fFovMultiplier<=1.0) {vDirectionW=normalize(segment);} else {vDirectionW=normalize(vDirectionW+(vDirectionW-segment));}
#endif
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef MAINUV1
vMainUV1=uv;
#endif
#ifdef MAINUV2
vMainUV2=uv2;
#endif
#if defined(DIFFUSE) && DIFFUSEDIRECTUV==0
if (vDiffuseInfos.x==0.)
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}
else
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#ifdef VERTEXCOLOR
vColor=colorUpdated;
#endif
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`,r.ShadersStore[G]||(r.ShadersStore[G]=K),q=[H,E,k,_,a,c,A,h,N,v,b,S,P,d,l,p,L,w,R];for(let e of q)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);J={name:G,shader:K}}));export{W as n,Y as r,J as t};