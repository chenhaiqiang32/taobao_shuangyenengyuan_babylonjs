import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./clipPlaneFragment-Birz0QQu.js";import{r as o,t as s}from"./clipPlaneFragmentDeclaration-BeW0wzU5.js";import{n as c,t as l}from"./logDepthFragment-DrurZwyM.js";import{n as u,t as d}from"./logDepthDeclaration-CXHAYacR.js";var f=t({linePixelShader:()=>g}),p,m,h,g,_=e((()=>{n(),o(),d(),l(),i(),p=`linePixelShader`,m=`#include<clipPlaneFragmentDeclaration>
uniform vec4 color;
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<logDepthFragment>
#include<clipPlaneFragment>
gl_FragColor=color;
#define CUSTOM_FRAGMENT_MAIN_END
}`,r.ShadersStore[p]||(r.ShadersStore[p]=m),h=[s,u,c,a];for(let e of h)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);g={name:p,shader:m}}));export{g as n,f as r,_ as t};