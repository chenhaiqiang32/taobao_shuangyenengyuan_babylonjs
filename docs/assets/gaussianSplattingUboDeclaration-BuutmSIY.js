import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{t as r}from"./sceneUboDeclaration-DY0whaDI.js";import{t as i}from"./meshUboDeclaration-DmH0C9dB.js";var a,o,s,c=e((()=>{t(),r(),i(),a=`gaussianSplattingUboDeclaration`,o=`#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute vec3 position;attribute vec4 splatIndex0;attribute vec4 splatIndex1;attribute vec4 splatIndex2;attribute vec4 splatIndex3;
`,n.IncludesShadersStore[a]||(n.IncludesShadersStore[a]=o),s={name:a,shader:o}}));export{c as n,s as t};