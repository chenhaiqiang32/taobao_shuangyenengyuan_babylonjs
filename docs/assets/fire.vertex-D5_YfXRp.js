import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./bonesDeclaration-D4017ZHx.js";import{i as a,n as o,r as s,t as c}from"./bakedVertexAnimation-CmDuYKpI.js";import{r as l,t as u}from"./bonesVertex-4uihoA7n.js";import{r as d,t as f}from"./clipPlaneVertex-CdGVP8lM.js";import{r as p,t as m}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as h,t as g}from"./logDepthDeclaration-CXHAYacR.js";import{n as _,t as v}from"./instancesDeclaration-wmdSHGgS.js";import{n as y,t as b}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as x,t as S}from"./instancesVertex-Dd3Zi5LO.js";import{n as C,t as w}from"./fogVertex-BNTM3_0Y.js";import{n as T,t as E}from"./logDepthVertex-B5lLzgZb.js";import{n as D,t as O}from"./vertexColorMixing-BPFrZgsz.js";var k,A,j,M;e((()=>{t(),r(),a(),v(),p(),g(),y(),S(),l(),o(),d(),E(),C(),O(),k=`fireVertexShader`,A=`precision highp float;attribute vec3 position;
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
varying vec2 vDiffuseUV;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
uniform float time;uniform float speed;
#ifdef DIFFUSE
varying vec2 vDistortionCoords1;varying vec2 vDistortionCoords2;varying vec2 vDistortionCoords3;
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
#ifdef DIFFUSE
vDiffuseUV=uv;vDiffuseUV.y-=0.2;
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#ifdef DIFFUSE
vec3 layerSpeed=vec3(-0.2,-0.52,-0.1)*speed;vDistortionCoords1.x=uv.x;vDistortionCoords1.y=uv.y+layerSpeed.x*time/1000.0;vDistortionCoords2.x=uv.x;vDistortionCoords2.y=uv.y+layerSpeed.y*time/1000.0;vDistortionCoords3.x=uv.x;vDistortionCoords3.y=uv.y+layerSpeed.z*time/1000.0;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`,n.ShadersStore[k]||(n.ShadersStore[k]=A),j=[i,s,_,m,h,b,x,u,c,f,T,w,D];for(let e of j)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);M={name:k,shader:A}}))();export{M as fireVertexShader};