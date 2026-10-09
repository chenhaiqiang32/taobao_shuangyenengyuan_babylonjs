import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./clipPlaneFragment-DVhwclLd.js";import{r as a,t as o}from"./clipPlaneFragmentDeclaration-DB0CCfyR.js";import{r as s,t as c}from"./fogFragmentDeclaration-DugSmsXA.js";import{n as l,t as u}from"./logDepthFragment-BQfCxjhi.js";import{n as d,t as f}from"./fogFragment-f3okXyv5.js";import{r as p,t as m}from"./helperFunctions-CklT_CQT.js";import{n as h,t as g}from"./lightFragment-Co9EmatE.js";import{n as _,t as v}from"./lightUboDeclaration-CkTG_9A_.js";import{n as y,t as b}from"./lightsFragmentFunctions-Dh0gyeN0.js";import{n as x,t as S}from"./logDepthDeclaration-xoumPMwY.js";import{n as C,t as w}from"./shadowsFragmentFunctions-CDnMl5j9.js";import{n as T,t as E}from"./depthPrePass-CI4Wrsnz.js";import{n as D,t as O}from"./imageProcessingCompatibility-D-xt4V5m.js";var k,A,j,M;e((()=>{t(),p(),v(),b(),w(),a(),S(),s(),r(),T(),g(),u(),d(),D(),k=`gradientPixelShader`,A=`uniform vEyePosition: vec4f;uniform topColor: vec4f;uniform bottomColor: vec4f;uniform offset: f32;uniform scale: f32;uniform smoothness: f32;varying vPositionW: vec3f;varying vPosition: vec3f;
#ifdef NORMAL
varying vNormalW: vec3f;
#endif
#ifdef VERTEXCOLOR
varying vColor: vec4f;
#endif
#include<helperFunctions>
#include<lightUboDeclaration>[0]
#include<lightUboDeclaration>[1]
#include<lightUboDeclaration>[2]
#include<lightUboDeclaration>[3]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying vViewDepth: f32;
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
var viewDirectionW: vec3f=normalize(uniforms.vEyePosition.xyz-fragmentInputs.vPositionW);var h: f32=fragmentInputs.vPosition.y*uniforms.scale+uniforms.offset;var mysmoothness: f32=clamp(uniforms.smoothness,0.01,max(uniforms.smoothness,10.));var baseColor: vec4f=mix(uniforms.bottomColor,uniforms.topColor,vec4f(max(pow(max(h,0.0),mysmoothness),0.0)));var diffuseColor: vec3f=baseColor.rgb;var alpha: f32=baseColor.a;
#ifdef ALPHATEST
if (baseColor.a<0.4) {discard;}
#endif
#define DEPTHPREPASS_SKIP_EARLY_RETURN
#include<depthPrePass>
#ifndef DEPTHPREPASS
#ifdef VERTEXCOLOR
baseColor=vec4f(baseColor.rgb*fragmentInputs.vColor.rgb,baseColor.a);
#endif
#ifdef NORMAL
var normalW: vec3f=normalize(fragmentInputs.vNormalW);
#else
var normalW: vec3f= vec3f(1.0,1.0,1.0);
#endif
#ifdef EMISSIVE
var diffuseBase: vec3f=baseColor.rgb;
#else
var diffuseBase: vec3f= vec3f(0.,0.,0.);
#endif
var info: lightingInfo;var shadow: f32=1.;var glossiness: f32=0.;var aggShadow: f32=0.;var numLights: f32=0.;
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=fragmentInputs.vColor.a;
#endif
var finalDiffuse: vec3f=clamp(diffuseBase*diffuseColor,vec3f(0.0),vec3f(1.0))*baseColor.rgb;var color: vec4f= vec4f(finalDiffuse,alpha);
#include<logDepthFragment>
#include<fogFragment>
fragmentOutputs.color=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
#endif
}
`,n.ShadersStoreWGSL[k]||(n.ShadersStoreWGSL[k]=A),j=[m,_,y,C,o,x,c,i,E,h,l,f,O];for(let e of j)n.IncludesShadersStoreWGSL[e.name]||(n.IncludesShadersStoreWGSL[e.name]=e.shader);M={name:k,shader:A}}))();export{M as gradientPixelShaderWGSL};