import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./clipPlaneFragment-Birz0QQu.js";import{r as a,t as o}from"./clipPlaneFragmentDeclaration-BeW0wzU5.js";import{r as s,t as c}from"./fogFragmentDeclaration-Bnhxysih.js";import{n as l,t as u}from"./logDepthFragment-DrurZwyM.js";import{n as d,t as f}from"./fogFragment-B7tBOW4n.js";import{r as p,t as m}from"./helperFunctions-DIiOqH-9.js";import{n as h,t as g}from"./lightFragment-_152tcho.js";import{n as _,t as v}from"./lightFragmentDeclaration-xXRmKbWC.js";import{n as y,t as b}from"./lightUboDeclaration-D__UCulE.js";import{n as x,t as S}from"./lightsFragmentFunctions-Dy6RwJnW.js";import{n as C,t as w}from"./logDepthDeclaration-CXHAYacR.js";import{n as T,t as E}from"./shadowsFragmentFunctions-BDw1QEfW.js";import{n as D,t as O}from"./sceneUboDeclaration-DY0whaDI.js";import{n as k,t as A}from"./sceneFragmentDeclaration-Cgks9MNS.js";import{n as j,t as M}from"./imageProcessingCompatibility-CBHq_lTp.js";var N,P,F,I;e((()=>{t(),A(),O(),p(),v(),b(),S(),E(),a(),w(),s(),r(),g(),u(),d(),j(),N=`shadowOnlyPixelShader`,P=`precision highp float;
#include<__decl__sceneFragment>
uniform float alpha;uniform vec3 shadowColor;varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying float vViewDepth;
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#include<lightFragment>[0..1]
vec4 color=vec4(shadowColor,(1.0-clamp(shadow,0.,1.))*alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`,n.ShadersStore[N]||(n.ShadersStore[N]=P),F=[k,D,m,_,y,x,T,o,C,c,i,h,l,f,M];for(let e of F)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);I={name:N,shader:P}}))();export{I as shadowOnlyPixelShader};