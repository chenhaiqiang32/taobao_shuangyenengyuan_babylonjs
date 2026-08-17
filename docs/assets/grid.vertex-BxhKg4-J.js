import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./clipPlaneVertex-CdGVP8lM.js";import{r as a,t as o}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as s,t as c}from"./logDepthDeclaration-CXHAYacR.js";import{n as l,t as u}from"./sceneUboDeclaration-DY0whaDI.js";import{n as d,t as f}from"./instancesDeclaration-wmdSHGgS.js";import{n as p,t as m}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as h,t as g}from"./instancesVertex-Dd3Zi5LO.js";import{n as _,t as v}from"./fogVertex-BNTM3_0Y.js";import{n as y,t as b}from"./logDepthVertex-B5lLzgZb.js";import{n as x,t as S}from"./sceneVertexDeclaration-D9ITZeOZ.js";var C,w,T,E;e((()=>{t(),f(),S(),u(),c(),p(),a(),g(),_(),r(),b(),C=`gridVertexShader`,w=`precision highp float;attribute vec3 position;attribute vec3 normal;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#include<instancesDeclaration>
#include<__decl__sceneVertex>
varying vec3 vPosition;varying vec3 vNormal;
#if defined(HORIZON_FADE) || defined(BELOW_LINE_COLOR) || defined(ORIGIN_MARKER)
varying vec3 vWorldPos;
#endif
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#ifdef OPACITY
varying vec2 vOpacityUV;uniform mat4 opacityMatrix;uniform vec2 vOpacityInfos;
#endif
#include<clipPlaneVertexDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
vec4 worldPos=finalWorld*vec4(position,1.0);
#include<fogVertex>
vec4 cameraSpacePosition=view*worldPos;gl_Position=projection*cameraSpacePosition;
#ifdef OPACITY
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
if (vOpacityInfos.x==0.)
{vOpacityUV=vec2(opacityMatrix*vec4(uv,1.0,0.0));}
else
{vOpacityUV=vec2(opacityMatrix*vec4(uv2,1.0,0.0));}
#endif 
#include<clipPlaneVertex>
#include<logDepthVertex>
vPosition=position;vNormal=normal;
#if defined(HORIZON_FADE) || defined(BELOW_LINE_COLOR) || defined(ORIGIN_MARKER)
vWorldPos=worldPos.xyz;
#endif
#define CUSTOM_VERTEX_MAIN_END
}`,n.ShadersStore[C]||(n.ShadersStore[C]=w),T=[d,x,l,s,m,o,h,v,i,y];for(let e of T)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);E={name:C,shader:w}}))();export{E as gridVertexShader};