import{n as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{n,t as r}from"./shaderStore-DBiNfWDC.js";import{r as i,t as a}from"./helperFunctions-DIiOqH-9.js";import{r as o,t as s}from"./imageProcessingDeclaration-CXLsq8po.js";import{r as c,t as l}from"./imageProcessingFunctions-C8qEcvGI.js";var u=t({imageProcessingPixelShader:()=>m}),d,f,p,m,h=e((()=>{n(),o(),i(),c(),d=`imageProcessingPixelShader`,f=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<imageProcessingDeclaration>
#include<helperFunctions>
#include<imageProcessingFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void)
{vec4 result=texture2D(textureSampler,vUV);result.rgb=max(result.rgb,vec3(0.));
#ifdef IMAGEPROCESSING
#ifndef FROMLINEARSPACE
result.rgb=toLinearSpace(result.rgb);
#endif
result=applyImageProcessing(result);
#else
#ifdef FROMLINEARSPACE
result=applyImageProcessing(result);
#endif
#endif
gl_FragColor=result;}`,r.ShadersStore[d]||(r.ShadersStore[d]=f),p=[s,a,l];for(let e of p)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);m={name:d,shader:f}}));export{u as n,h as r,m as t};