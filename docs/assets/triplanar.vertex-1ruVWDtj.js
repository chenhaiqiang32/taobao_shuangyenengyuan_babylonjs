import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./bonesDeclaration-D4017ZHx.js";import{i as a,n as o,r as s,t as c}from"./bakedVertexAnimation-CmDuYKpI.js";import{r as l,t as u}from"./bonesVertex-4uihoA7n.js";import{r as d,t as f}from"./clipPlaneVertex-CdGVP8lM.js";import{r as p,t as m}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{r as h,t as g}from"./helperFunctions-DIiOqH-9.js";import{n as _,t as v}from"./lightFragmentDeclaration-xXRmKbWC.js";import{n as y,t as b}from"./lightUboDeclaration-D__UCulE.js";import{n as x,t as S}from"./logDepthDeclaration-CXHAYacR.js";import{n as C,t as w}from"./shadowsVertex-C0uZgBeP.js";import{n as T,t as E}from"./instancesDeclaration-wmdSHGgS.js";import{n as D,t as O}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as k,t as A}from"./instancesVertex-Dd3Zi5LO.js";import{n as j,t as M}from"./fogVertex-BNTM3_0Y.js";import{n as N,t as P}from"./logDepthVertex-B5lLzgZb.js";import{n as F,t as I}from"./vertexColorMixing-BPFrZgsz.js";var L,R,z,B;e((()=>{t(),h(),r(),a(),E(),p(),S(),D(),v(),b(),A(),l(),o(),d(),P(),j(),w(),I(),L=`triplanarVertexShader`,R=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<helperFunctions>
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSEX
varying vec2 vTextureUVX;
#endif
#ifdef DIFFUSEY
varying vec2 vTextureUVY;
#endif
#ifdef DIFFUSEZ
varying vec2 vTextureUVZ;
#endif
uniform float tileSize;
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying mat3 tangentSpace;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
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
void main(void)
{
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef DIFFUSEX
vTextureUVX=worldPos.zy/tileSize;
#endif
#ifdef DIFFUSEY
vTextureUVY=worldPos.xz/tileSize;
#endif
#ifdef DIFFUSEZ
vTextureUVZ=worldPos.xy/tileSize;
#endif
#ifdef NORMAL
vec3 xtan=vec3(0,0,1);vec3 xbin=vec3(0,1,0);vec3 ytan=vec3(1,0,0);vec3 ybin=vec3(0,0,1);vec3 ztan=vec3(1,0,0);vec3 zbin=vec3(0,1,0);vec3 normalizedNormal=normalize(normal);normalizedNormal*=normalizedNormal;vec3 worldBinormal=normalize(xbin*normalizedNormal.x+ybin*normalizedNormal.y+zbin*normalizedNormal.z);vec3 worldTangent=normalize(xtan*normalizedNormal.x+ytan*normalizedNormal.y+ztan*normalizedNormal.z);mat3 normalWorld=mat3(finalWorld);
#ifdef NONUNIFORMSCALING
normalWorld=transposeMat3(inverseMat3(normalWorld));
#endif
worldTangent=normalize((normalWorld*worldTangent).xyz);worldBinormal=normalize((normalWorld*worldBinormal).xyz);vec3 worldNormal=normalize((normalWorld*normalize(normal)).xyz);tangentSpace[0]=worldTangent;tangentSpace[1]=worldBinormal;tangentSpace[2]=worldNormal;
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`,n.ShadersStore[L]||(n.ShadersStore[L]=R),z=[g,i,s,T,m,x,O,_,y,k,u,c,f,N,M,C,F];for(let e of z)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);B={name:L,shader:R}}))();export{B as triplanarVertexShader};