import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./clipPlaneFragment-Birz0QQu.js";import{r as a,t as o}from"./clipPlaneFragmentDeclaration-BeW0wzU5.js";import{r as s,t as c}from"./fogFragmentDeclaration-Bnhxysih.js";import{n as l,t as u}from"./logDepthFragment-DrurZwyM.js";import{n as d,t as f}from"./fogFragment-B7tBOW4n.js";import{r as p,t as m}from"./gaussianSplattingFragmentDeclaration-lShk_ZKv.js";import{n as h,t as g}from"./logDepthDeclaration-CXHAYacR.js";import{n as _,t as v}from"./packingFunctions-Dcmyk7BJ.js";var y,b,x,S;e((()=>{t(),a(),g(),s(),v(),u(),d(),p(),r(),y=`gaussianSplattingPixelShader`,b=`#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#ifdef GPUPICKER_DEPTH
layout(location=0) out highp vec4 glFragData[2];
#endif
#ifdef GPUPICKER_PACK_DEPTH
#include<packingFunctions>
#endif
varying vec4 vColor;varying vec2 vPosition;
#define CUSTOM_FRAGMENT_DEFINITIONS
#include<gaussianSplattingFragmentDeclaration>
void main () {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec4 finalColor=gaussianColor(vColor);
#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
#ifdef GPUPICKER_DEPTH
glFragData[0]=finalColor;
#ifdef GPUPICKER_PACK_DEPTH
glFragData[1]=pack(gl_FragCoord.z);
#else
glFragData[1]=vec4(gl_FragCoord.z,0.0,0.0,1.0);
#endif
#else
gl_FragColor=finalColor;
#endif
#define CUSTOM_FRAGMENT_MAIN_END
}
`,n.ShadersStore[y]||(n.ShadersStore[y]=b),x=[o,h,c,_,l,f,m,i];for(let e of x)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);S={name:y,shader:b}}))();export{S as gaussianSplattingPixelShader};