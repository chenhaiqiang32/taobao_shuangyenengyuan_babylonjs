import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";var r,i,a,o=e((()=>{t(),r=`fogFragment`,i=`#ifdef FOG
float fog=CalcFogFactor();
#ifdef PBR
fog=toLinearSpace(fog);
#endif
color.rgb=mix(vFogColor,color.rgb,fog);
#endif
`,n.IncludesShadersStore[r]||(n.IncludesShadersStore[r]=i),a={name:r,shader:i}}));export{o as n,a as t};