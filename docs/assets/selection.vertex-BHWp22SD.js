import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./shaderStore-DBiNfWDC.js";import{r,t as i}from"./bonesDeclaration-D4017ZHx.js";import{i as a,n as o,r as s,t as c}from"./bakedVertexAnimation-CmDuYKpI.js";import{n as l,t as u}from"./morphTargetsVertexGlobalDeclaration-bu-rVdb5.js";import{n as d,t as f}from"./morphTargetsVertexDeclaration-BtRcDmbf.js";import{n as p,t as m}from"./morphTargetsVertexGlobal-DrG7AUxD.js";import{n as h,t as g}from"./morphTargetsVertex-BQx0GRhN.js";import{r as _,t as v}from"./bonesVertex-4uihoA7n.js";import{r as y,t as b}from"./clipPlaneVertex-CdGVP8lM.js";import{r as x,t as S}from"./clipPlaneVertexDeclaration-DT4GmWBy.js";import{n as C,t as w}from"./instancesDeclaration-wmdSHGgS.js";import{n as T,t as E}from"./instancesVertex-Dd3Zi5LO.js";var D,O,k,A;e((()=>{t(),r(),a(),u(),f(),x(),w(),m(),g(),E(),_(),o(),y(),D=`selectionVertexShader`,O=`attribute vec3 position;
#ifdef INSTANCES
attribute float instanceSelectionId;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform mat4 viewProjection;
#ifdef STORE_CAMERASPACE_Z
uniform mat4 view;
#else
uniform vec2 depthValues;
#endif
#ifdef INSTANCES
flat varying float vSelectionId;
#endif
#ifdef STORE_CAMERASPACE_Z
varying float vViewPosZ;
#else
varying float vDepthMetric;
#endif
#ifdef ALPHATEST
varying vec2 vUV;uniform mat4 diffuseMatrix;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
vec3 positionUpdated=position;
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);gl_Position=viewProjection*worldPos;
#ifdef ALPHATEST
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef STORE_CAMERASPACE_Z
vViewPosZ=(view*worldPos).z;
#else
#ifdef USE_REVERSE_DEPTHBUFFER
vDepthMetric=((-gl_Position.z+depthValues.x)/(depthValues.y));
#else
vDepthMetric=((gl_Position.z+depthValues.x)/(depthValues.y));
#endif
#endif
#ifdef INSTANCES
vSelectionId=instanceSelectionId;
#endif
#include<clipPlaneVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`,n.ShadersStore[D]||(n.ShadersStore[D]=O),k=[i,s,l,d,S,C,p,h,T,v,c,b];for(let e of k)n.IncludesShadersStore[e.name]||(n.IncludesShadersStore[e.name]=e.shader);A={name:D,shader:O}}))();export{A as selectionVertexShader};