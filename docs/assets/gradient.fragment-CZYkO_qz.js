import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./clipPlaneFragment-Birz0QQu.js";import{r as a,t as o}from"./clipPlaneFragmentDeclaration-BeW0wzU5.js";import{r as s,t as c}from"./fogFragmentDeclaration-Bnhxysih.js";import{n as l,t as u}from"./logDepthFragment-DrurZwyM.js";import{n as d,t as f}from"./fogFragment-B7tBOW4n.js";import{r as p,t as m}from"./helperFunctions-DIiOqH-9.js";import{n as h,t as g}from"./lightFragment-_152tcho.js";import{n as _,t as v}from"./lightFragmentDeclaration-xXRmKbWC.js";import{n as y,t as b}from"./lightUboDeclaration-D__UCulE.js";import{n as x,t as S}from"./lightsFragmentFunctions-Dy6RwJnW.js";import{n as C,t as w}from"./logDepthDeclaration-CXHAYacR.js";import{n as T,t as E}from"./shadowsFragmentFunctions-BDw1QEfW.js";import{n as D,t as O}from"./depthPrePass-CgCyzsEz.js";import{n as k,t as A}from"./imageProcessingCompatibility-CBHq_lTp.js";var j,M,N,P;e((()=>{t(),p(),v(),b(),S(),E(),a(),w(),s(),r(),D(),g(),u(),d(),k(),j=`gradientPixelShader`,M=`precision highp float;uniform vec4 vEyePosition;uniform vec4 topColor;uniform vec4 bottomColor;uniform float offset;uniform float scale;uniform float smoothness;varying vec3 vPositionW;varying vec3 vPosition;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0]
#include<__decl__lightFragment>[1]
#include<__decl__lightFragment>[2]
#include<__decl__lightFragment>[3]
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
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);float h=vPosition.y*scale+offset;float mysmoothness=clamp(smoothness,0.01,max(smoothness,10.));vec4 baseColor=mix(bottomColor,topColor,max(pow(max(h,0.0),mysmoothness),0.0));vec3 diffuseColor=baseColor.rgb;float alpha=baseColor.a;
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
#ifdef VERTEXCOLOR
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
#ifdef EMISSIVE
vec3 diffuseBase=baseColor.rgb;
#else
vec3 diffuseBase=vec3(0.,0.,0.);
#endif
lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor,0.0,1.0)*baseColor.rgb;vec4 color=vec4(finalDiffuse,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}
`,n.ShadersStore[j]||(n.ShadersStore[j]=M),N=[m,_,y,x,T,o,C,c,i,O,h,l,f,A];for(let e of N)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);P={name:j,shader:M}}))();export{P as gradientPixelShader};