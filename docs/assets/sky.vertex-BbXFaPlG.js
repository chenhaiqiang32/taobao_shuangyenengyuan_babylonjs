import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./clipPlaneVertex-CdGVP8lM.js";import{r as a,t as o}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as s,t as c}from"./logDepthDeclaration-CXHAYacR.js";import{n as l,t as u}from"./fogVertexDeclaration-Ddbp3LVy.js";import{n as d,t as f}from"./fogVertex-BNTM3_0Y.js";import{n as p,t as m}from"./logDepthVertex-B5lLzgZb.js";var h,g,_,v;e((()=>{t(),c(),a(),l(),r(),m(),d(),h=`skyVertexShader`,g=`precision highp float;attribute vec3 position;
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
uniform mat4 world;uniform mat4 view;uniform mat4 viewProjection;
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<logDepthDeclaration>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
gl_Position=viewProjection*world*vec4(position,1.0);vec4 worldPos=world*vec4(position,1.0);vPositionW=vec3(worldPos);
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#ifdef VERTEXCOLOR
vColor=color;
#endif
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`,n.ShadersStore[h]||(n.ShadersStore[h]=g),_=[s,o,u,i,p,f];for(let e of _)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);v={name:h,shader:g}}))();export{v as skyVertexShader};