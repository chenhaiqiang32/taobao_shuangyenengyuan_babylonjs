import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./fogFragmentDeclaration-Bnhxysih.js";import{n as o,t as s}from"./logDepthFragment-DrurZwyM.js";import{n as c,t as l}from"./fogFragment-B7tBOW4n.js";import{n as u,t as d}from"./logDepthDeclaration-CXHAYacR.js";import{n as f,t as p}from"./imageProcessingCompatibility-CBHq_lTp.js";var m=t({spritesPixelShader:()=>v}),h,g,_,v,y=e((()=>{n(),i(),d(),s(),c(),f(),h=`spritesPixelShader`,g=`#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
uniform bool alphaTest;varying vec4 vColor;varying vec2 vUV;uniform sampler2D diffuseSampler;
#include<fogFragmentDeclaration>
#include<logDepthDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
#ifdef PIXEL_PERFECT
vec2 uvPixelPerfect(vec2 uv) {vec2 res=vec2(textureSize(diffuseSampler,0));uv=uv*res;vec2 seam=floor(uv+0.5);uv=seam+clamp((uv-seam)/fwidth(uv),-0.5,0.5);return uv/res;}
#endif
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#ifdef PIXEL_PERFECT
vec2 uv=uvPixelPerfect(vUV);
#else
vec2 uv=vUV;
#endif
vec4 color=texture2D(diffuseSampler,uv);float fAlphaTest=float(alphaTest);if (fAlphaTest != 0.)
{if (color.a<0.95)
discard;}
color*=vColor;
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`,r.ShadersStore[h]||(r.ShadersStore[h]=g),_=[a,u,o,l,p];for(let e of _)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);v={name:h,shader:g}}));export{v as n,m as r,y as t};