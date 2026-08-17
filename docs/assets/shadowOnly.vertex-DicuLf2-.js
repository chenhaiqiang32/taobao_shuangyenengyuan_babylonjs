import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./bonesDeclaration-eL-UWn6d.js";import{r as a,t as o}from"./bonesVertex-BiF-eB3j.js";import{r as s,t as c}from"./clipPlaneVertex-BZpMxmsm.js";import{r as l,t as u}from"./clipPlaneVertexDeclaration-f70TK6xP.js";import{n as d,t as f}from"./lightVxUboDeclaration-4vuoQMlO.js";import{n as p,t as m}from"./logDepthDeclaration-xoumPMwY.js";import{n as h,t as g}from"./shadowsVertex-Bwz7etKz.js";import{n as _,t as v}from"./sceneUboDeclaration-BucOHbCW.js";import{n as y,t as b}from"./bakedVertexAnimationDeclaration-CDQs61LG.js";import{n as x,t as S}from"./instancesDeclaration-CgXh0JO7.js";import{n as C,t as w}from"./fogVertexDeclaration-B0s5rYSE.js";import{n as T,t as E}from"./instancesVertex-C56VJhRE.js";import{n as D,t as O}from"./bakedVertexAnimation-CR15jBnU.js";import{n as k,t as A}from"./fogVertex-HgX-n4Ue.js";import{n as j,t as M}from"./logDepthVertex-Bse0Ofhz.js";import{n as N,t as P}from"./lightVxFragmentDeclaration-DVqBCuLn.js";var F,I,L,R;e((()=>{t(),r(),y(),S(),v(),l(),m(),C(),P(),f(),E(),a(),D(),s(),M(),k(),g(),F=`shadowOnlyVertexShader`,I=`attribute position: vec3f;
#ifdef NORMAL
attribute normal: vec3f;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
#include<sceneUboDeclaration>
#ifdef POINTSIZE
uniform pointSize: f32;
#endif
varying vPositionW: vec3f;
#ifdef NORMAL
varying vNormalW: vec3f;
#endif
#ifdef VERTEXCOLOR
varying vColor: vec4f;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightVxFragment>[0..maxSimultaneousLights]
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying vViewDepth: f32;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(vertexInputs.position,1.0);vertexOutputs.position=scene.viewProjection*worldPos;vertexOutputs.vPositionW= worldPos.xyz;
#ifdef NORMAL
vertexOutputs.vNormalW=normalize(( finalWorld* vec4f(vertexInputs.normal,0.0)).xyz);
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_MAIN_END
}
`,n.ShadersStoreWGSL[F]||(n.ShadersStoreWGSL[F]=I),L=[i,b,x,_,u,p,w,N,d,T,o,O,c,j,A,h];for(let e of L)n.IncludesShadersStoreWGSL[e.name]||(n.IncludesShadersStoreWGSL[e.name]=e.shader);R={name:F,shader:I}}))();export{R as shadowOnlyVertexShaderWGSL};