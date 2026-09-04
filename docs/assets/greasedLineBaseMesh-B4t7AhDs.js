const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./greasedLine.vertex-Nl6PtxLC.js","./rolldown-runtime-B0Z9INg1.js","./shaderStore-DBiNfWDC.js","./sceneUboDeclaration-BucOHbCW.js","./instancesDeclaration-CgXh0JO7.js","./instancesVertex-C56VJhRE.js","./meshUboDeclaration-DDlgBu5O.js","./greasedLine.fragment-Bll41gv5.js","./greasedLine.vertex-Def_a7Tx.js","./instancesDeclaration-wmdSHGgS.js","./instancesVertex-Dd3Zi5LO.js","./greasedLine.fragment-BXSz7HUE.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{K as t,q as n}from"./tools.pure-h2tBewWA.js";import{i as r,r as i}from"./typeStore-Cabm4lgz.js";import{a,c as o,i as s,o as c}from"./math.vector.pure-BbmgcGD4.js";import{a as l,t as u}from"./math.color.pure-BXWfWpQ6.js";import{a as d,i as f}from"./internalTexture-DVPS5qKB.js";import{l as p,r as m,t as h}from"./buffer.pure-CB3-MG3t.js";import{b as g,x as _}from"./gaussianSplattingMesh.pure-Dg2Iimf-.js";import{n as v,r as y}from"./textBuilder-BgntHmEH.js";import{c as b,i as x}from"./math.path-CoUPG_kz.js";import{n as S,t as C}from"./preload-helper-Ckak8w_N.js";import{D as w,T,a as E,t as D}from"./mesh.pure-Btv4_j__.js";import{n as O,t as k}from"./rawTexture-B0F6CiFk.js";import{n as A,t as j}from"./materialDefines-CB4vGlYM.js";import{i as M,o as N}from"./material.detailMapConfiguration-BZVLhPXM.js";import{n as ee,s as te}from"./shaderMaterial.pure-iNn_bLTT.js";var P,F=e((()=>{l(),P=class{},P.DEFAULT_COLOR=u.White(),P.DEFAULT_WIDTH_ATTENUATED=1,P.DEFAULT_WIDTH=.1})),I,L=e((()=>{b(),p(),o(),y(),O(),_(),F(),I=class e{static ConvertPoints(e,t){if(e.length&&Array.isArray(e)&&typeof e[0]==`number`)return[e];if(e.length&&Array.isArray(e[0])&&typeof e[0][0]==`number`)return e;if(e.length&&!Array.isArray(e[0])&&e[0]instanceof c){let t=[];for(let n=0;n<e.length;n++){let r=e[n];t.push(r.x,r.y,r.z)}return[t]}if(e.length>0&&Array.isArray(e[0])&&e[0].length>0&&e[0][0]instanceof c){let t=[],n=e;for(let e of n)t.push(e.flatMap(e=>[e.x,e.y,e.z]));return t}if(e instanceof Float32Array){if(t?.floatArrayStride){let n=[],r=t.floatArrayStride*3;for(let t=0;t<e.length;t+=r){let i=Array(r);for(let n=0;n<r;n++)i[n]=e[t+n];n.push(i)}return n}return[Array.from(e)]}if(e.length&&e[0]instanceof Float32Array){let t=[];for(let n of e)t.push(Array.from(n));return t}return[]}static OmitZeroLengthPredicate(e,t,n){let r=[];return t.subtract(e).lengthSquared()>0&&r.push([e,t]),n.subtract(t).lengthSquared()>0&&r.push([t,n]),e.subtract(n).lengthSquared()>0&&r.push([n,e]),r.length===0?null:r}static OmitDuplicatesPredicate(t,n,r,i){let a=[];return e._SearchInPoints(t,n,i)||a.push([t,n]),e._SearchInPoints(n,r,i)||a.push([n,r]),e._SearchInPoints(r,t,i)||a.push([r,t]),a.length===0?null:a}static _SearchInPoints(e,t,n){for(let r of n)for(let n=0;n<r.length;n++)if(r[n]?.equals(e)&&(r[n+1]?.equals(t)||r[n-1]?.equals(t)))return!0;return!1}static MeshesToLines(e,t){let n=[];for(let r=0;r<e.length;r++){let i=e[r],a=i.getVerticesData(m.PositionKind),o=i.getIndices();if(a&&o)for(let e=0,s=0;e<o.length;e++){let l=o[s++]*3,u=o[s++]*3,d=o[s++]*3,f=new c(a[l],a[l+1],a[l+2]),p=new c(a[u],a[u+1],a[u+2]),m=new c(a[d],a[d+1],a[d+2]);if(t){let s=t(f,p,m,n,e,l,i,r,a,o);if(s)for(let e of s)n.push(e)}else n.push([f,p],[p,m],[m,f])}}return n}static ToVector3Array(e){if(Array.isArray(e[0])){let t=[],n=e;for(let e of n){let n=[];for(let t=0;t<e.length;t+=3)n.push(new c(e[t],e[t+1],e[t+2]));t.push(n)}return t}let t=e,n=[];for(let e=0;e<t.length;e+=3)n.push(new c(t[e],t[e+1],t[e+2]));return n}static ToNumberArray(e){return e.flatMap(e=>[e.x,e.y,e.z])}static GetPointsCountInfo(e){let t=Array(e.length),n=0;for(let r=e.length;r--;)t[r]=e[r].length/3,n+=t[r];return{total:n,counts:t}}static GetLineLength(t){if(t.length===0)return 0;let n;n=typeof t[0]==`number`?e.ToVector3Array(t):t;let r=s.Vector3[0],i=0;for(let e=0;e<n.length-1;e++){let t=n[e],a=n[e+1];i+=a.subtractToRef(t,r).length()}return i}static GetLineLengthArray(e,t){let n=t?new Float32Array(t,0,e.length/3):new Float32Array(e.length/3),r=0;for(let t=0,i=e.length/3-1;t<i;t++){let i=e[t*3+0],a=e[t*3+1],o=e[t*3+2];i-=e[t*3+3],a-=e[t*3+4],o-=e[t*3+5];let s=Math.sqrt(i*i+a*a+o*o);r+=s,n[t+1]=r}return n}static SegmentizeSegmentByCount(e,t,n){let r=[],i=t.subtract(e),a=s.Vector3[0];a.setAll(n);let o=s.Vector3[1];i.divideToRef(a,o);let c=e.clone();r.push(c);for(let e=0;e<n;e++)c=c.clone(),r.push(c.addInPlace(o));return r}static SegmentizeLineBySegmentLength(t,n){let r=t[0]instanceof c?e.GetLineSegments(t):typeof t[0]==`number`?e.GetLineSegments(e.ToVector3Array(t)):t,i=[];for(let t of r)if(t.length>n){let r=e.SegmentizeSegmentByCount(t.point1,t.point2,Math.ceil(t.length/n));for(let e of r)i.push(e)}else i.push(t.point1),i.push(t.point2);return i}static SegmentizeLineBySegmentCount(t,n){let r=typeof t[0]==`number`?e.ToVector3Array(t):t,i=e.GetLineLength(r)/n;return e.SegmentizeLineBySegmentLength(r,i)}static GetLineSegments(e){let t=[];for(let n=0;n<e.length-1;n++){let r=e[n],i=e[n+1],a=i.subtract(r).length();t.push({point1:r,point2:i,length:a})}return t}static GetMinMaxSegmentLength(t){let n=e.GetLineSegments(t).sort(e=>e.length);return{min:n[0].length,max:n[n.length-1].length}}static GetPositionOnLineByVisibility(e,t,n,r=!1){let i=t*n,a=0,o=0,c=e.length;for(let t=0;t<c;t++){if(i<=a+e[t].length){o=t;break}a+=e[t].length}let l=(i-a)/e[o].length;return e[o].point2.subtractToRef(e[o].point1,s.Vector3[0]),s.Vector3[0].scaleToRef(l,s.Vector3[1]),r||s.Vector3[1].addInPlace(e[o].point1),s.Vector3[1].clone()}static GetCircleLinePoints(e,t,n=0,r=e,i=Math.PI*2/t){let a=[];for(let o=0;o<=t;o++)a.push(new c(Math.cos(o*i)*e,Math.sin(o*i)*r,n));return a}static GetBezierLinePoints(e,t,n,r){return x.CreateQuadraticBezier(e,t,n,r).getPoints().flatMap(e=>[e.x,e.y,e.z])}static GetArrowCap(e,t,n,r,i,a=0,o=0){return{points:[e.clone(),e.add(t.multiplyByFloats(n,n,n))],widths:[r,i,a,o]}}static GetPointsFromText(e,t,n,r,i=0,a=!0){let o=[],s=v(e,t,n,r);for(let e of s){for(let t of e.paths){let e=[],n=t.getPoints();for(let t of n)e.push(t.x,t.y,i);o.push(e)}if(a)for(let t of e.holes){let e=[],n=t.getPoints();for(let t of n)e.push(t.x,t.y,i);o.push(e)}}return o}static Color3toRGBAUint8(e){let t=new Uint8Array(e.length*4);for(let n=0,r=0;n<e.length;n++)t[r++]=e[n].r*255,t[r++]=e[n].g*255,t[r++]=e[n].b*255,t[r++]=255;return t}static CreateColorsTexture(t,n,r,i){let a=i.getEngine().getCaps().maxTextureSize??1,o=n.length>a?a:n.length,s=Math.ceil(n.length/a);s>1&&(n=[...n,...Array(o*s-n.length).fill(n[0])]);let c=e.Color3toRGBAUint8(n),l=new k(c,o,s,g.TEXTUREFORMAT_RGBA,i,!1,!0,r);return l.name=t,l}static PrepareEmptyColorsTexture(e){return P.EmptyColorsTexture||(P.EmptyColorsTexture=new k(new Uint8Array(4),1,1,g.TEXTUREFORMAT_RGBA,e,!1,!1,k.NEAREST_NEAREST),P.EmptyColorsTexture.name=`grlEmptyColorsTexture`,P.EmptyColorsTexture.onDisposeObservable.addOnce(()=>{P.EmptyColorsTexture=null})),P.EmptyColorsTexture}static DisposeEmptyColorsTexture(){P.EmptyColorsTexture?.dispose(),P.EmptyColorsTexture=null}static BooleanToNumber(e){return+!!e}}}));function R(e,t){if(e===`vertex`){let e={CUSTOM_VERTEX_DEFINITIONS:`
                attribute float grl_widths;
                #ifdef GREASED_LINE_USE_OFFSETS
                    attribute vec3 grl_offsets;
                #endif
                attribute float grl_colorPointers;
                varying float grlCounters;
                varying float grlColorPointer;

                #ifdef GREASED_LINE_CAMERA_FACING
                    attribute vec4 grl_previousAndSide;
                    attribute vec4 grl_nextAndCounters;

                    vec2 grlFix( vec4 i, float aspect ) {
                        vec2 res = i.xy / i.w;
                        res.x *= aspect;
                        return res;
                    }
                #else
                    attribute vec3 grl_slopes;
                    attribute float grl_counters;
                #endif
                `,CUSTOM_VERTEX_UPDATE_POSITION:`
                #ifdef GREASED_LINE_USE_OFFSETS
                    vec3 grlPositionOffset = grl_offsets;
                #else
                    vec3 grlPositionOffset = vec3(0.);
                #endif

                #ifdef GREASED_LINE_CAMERA_FACING
                    positionUpdated += grlPositionOffset;
                #else
                    positionUpdated = (positionUpdated + grlPositionOffset) + (grl_slopes * grl_widths);
                #endif
                `,CUSTOM_VERTEX_MAIN_END:`
                grlColorPointer = grl_colorPointers;

                #ifdef GREASED_LINE_CAMERA_FACING

                    float grlAspect = grl_aspect_resolution_lineWidth.x;
                    float grlBaseWidth = grl_aspect_resolution_lineWidth.w;

                    vec3 grlPrevious = grl_previousAndSide.xyz;
                    float grlSide = grl_previousAndSide.w;

                    vec3 grlNext = grl_nextAndCounters.xyz;
                    grlCounters = grl_nextAndCounters.w;
                    float grlWidth = grlBaseWidth * grl_widths;
                    
                    vec3 worldDir = normalize(grlNext - grlPrevious);
                    vec3 nearPosition = positionUpdated + (worldDir * 0.01);
                    mat4 grlMatrix = viewProjection * finalWorld;
                    vec4 grlFinalPosition = grlMatrix * vec4(positionUpdated , 1.0);
                    vec4 screenNearPos = grlMatrix * vec4(nearPosition, 1.0);
                    vec2 grlLinePosition = grlFix(grlFinalPosition, grlAspect);
                    vec2 grlLineNearPosition = grlFix(screenNearPos, grlAspect);
                    vec2 grlDir = normalize(grlLineNearPosition - grlLinePosition);

                    vec4 grlNormal = vec4(-grlDir.y, grlDir.x, 0., 1.);

                    #ifdef GREASED_LINE_RIGHT_HANDED_COORDINATE_SYSTEM
                        grlNormal.xy *= -.5 * grlWidth;
                    #else
                        grlNormal.xy *= .5 * grlWidth;
                    #endif

                    grlNormal *= grl_projection;

                    #ifdef GREASED_LINE_SIZE_ATTENUATION
                        grlNormal.xy *= grlFinalPosition.w;
                        grlNormal.xy /= (vec4(grl_aspect_resolution_lineWidth.yz, 0., 1.) * grl_projection).xy;
                    #endif

                    grlFinalPosition.xy += grlNormal.xy * grlSide;
                    gl_Position = grlFinalPosition;

                    vPositionW = vec3(grlFinalPosition);
                #else
                    grlCounters = grl_counters;
                #endif
                `};return t&&(e[`!gl_Position\\=viewProjection\\*worldPos;`]=`//`),e}return e===`fragment`?{CUSTOM_FRAGMENT_DEFINITIONS:`
                    #ifdef PBR
                         #define grlFinalColor finalColor
                    #else
                         #define grlFinalColor color
                    #endif

                    varying float grlCounters;
                    varying float grlColorPointer;
                    uniform sampler2D grl_colors;
                `,CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR:`
                    float grlColorMode = grl_colorMode_visibility_colorsWidth_useColors.x;
                    float grlVisibility = grl_colorMode_visibility_colorsWidth_useColors.y;
                    float grlColorsWidth = grl_colorMode_visibility_colorsWidth_useColors.z;
                    float grlUseColors = grl_colorMode_visibility_colorsWidth_useColors.w;

                    float grlUseDash = grl_dashOptions.x;
                    float grlDashArray = grl_dashOptions.y;
                    float grlDashOffset = grl_dashOptions.z;
                    float grlDashRatio = grl_dashOptions.w;

                    grlFinalColor.a *= step(grlCounters, grlVisibility);
                    if(grlFinalColor.a == 0.) discard;

                    if(grlUseDash == 1.){
                        grlFinalColor.a *= ceil(mod(grlCounters + grlDashOffset, grlDashArray) - (grlDashArray * grlDashRatio));
                        if (grlFinalColor.a == 0.) discard;
                    }

                    #ifdef GREASED_LINE_HAS_COLOR
                        if (grlColorMode == 0.) {
                            grlFinalColor.rgb = grl_singleColor;
                        } else if (grlColorMode == 1.) {
                            grlFinalColor.rgb += grl_singleColor;
                        } else if (grlColorMode == 2.) {
                            grlFinalColor.rgb *= grl_singleColor;
                        }
                    #else
                        if (grlUseColors == 1.) {
                            #ifdef GREASED_LINE_COLOR_DISTRIBUTION_TYPE_LINE
                                vec4 grlColor = texture2D(grl_colors, vec2(grlCounters, 0.), 0.);
                            #else
                                vec2 lookup = vec2(fract(grlColorPointer / grl_textureSize.x), 1.0 - floor(grlColorPointer / grl_textureSize.x) / max(grl_textureSize.y - 1.0, 1.0));
                                vec4 grlColor = texture2D(grl_colors, lookup, 0.0);
                            #endif
                            if (grlColorMode == 0.) {
                                grlFinalColor = grlColor;
                            } else if (grlColorMode == 1.) {
                                grlFinalColor += grlColor;
                            } else if (grlColorMode == 2.) {
                                grlFinalColor *= grlColor;
                            }
                        }
                    #endif
                `}:null}var z=e((()=>{}));function B(e,t){if(e===`vertex`){let e={CUSTOM_VERTEX_DEFINITIONS:`
                attribute grl_widths: f32;
                attribute grl_colorPointers: f32;
                varying grlCounters: f32;
                varying grlColorPointer: f32;

                #ifdef GREASED_LINE_USE_OFFSETS
                    attribute grl_offsets: vec3f;   
                #endif

                #ifdef GREASED_LINE_CAMERA_FACING
                    attribute grl_previousAndSide : vec4f;
                    attribute grl_nextAndCounters : vec4f;

                    fn grlFix(i: vec4f, aspect: f32) -> vec2f {
                        var res = i.xy / i.w;
                        res.x *= aspect;
                        return res;
                    }
                #else
                    attribute grl_slopes: f32;
                    attribute grl_counters: f32;
                #endif


                `,CUSTOM_VERTEX_UPDATE_POSITION:`
                #ifdef GREASED_LINE_USE_OFFSETS
                    var grlPositionOffset: vec3f = input.grl_offsets;
                #else
                    var grlPositionOffset = vec3f(0.);
                #endif

                #ifdef GREASED_LINE_CAMERA_FACING
                    positionUpdated += grlPositionOffset;
                #else
                    positionUpdated = (positionUpdated + grlPositionOffset) + (input.grl_slopes * input.grl_widths);
                #endif
                `,CUSTOM_VERTEX_MAIN_END:`
                vertexOutputs.grlColorPointer = input.grl_colorPointers;

                #ifdef GREASED_LINE_CAMERA_FACING

                    let grlAspect: f32 = uniforms.grl_aspect_resolution_lineWidth.x;
                    let grlBaseWidth: f32 = uniforms.grl_aspect_resolution_lineWidth.w;

                    let grlPrevious: vec3f = input.grl_previousAndSide.xyz;
                    let grlSide: f32 = input.grl_previousAndSide.w;

                    let grlNext: vec3f = input.grl_nextAndCounters.xyz;
                    vertexOutputs.grlCounters = input.grl_nextAndCounters.w;

                    let grlWidth: f32 = grlBaseWidth * input.grl_widths;

                    let worldDir: vec3f = normalize(grlNext - grlPrevious);
                    let nearPosition: vec3f = positionUpdated + (worldDir * 0.01);
                    let grlMatrix: mat4x4f = uniforms.viewProjection * finalWorld;
                    let grlFinalPosition: vec4f = grlMatrix * vec4f(positionUpdated, 1.0); 
                    let screenNearPos: vec4f = grlMatrix * vec4(nearPosition, 1.0);
                    let grlLinePosition: vec2f = grlFix(grlFinalPosition, grlAspect);
                    let grlLineNearPosition: vec2f = grlFix(screenNearPos, grlAspect);
                    let grlDir: vec2f = normalize(grlLineNearPosition - grlLinePosition);

                    var grlNormal: vec4f = vec4f(-grlDir.y, grlDir.x, 0.0, 1.0);

                    let grlHalfWidth: f32 = 0.5 * grlWidth;
                    #if defined(GREASED_LINE_RIGHT_HANDED_COORDINATE_SYSTEM)
                        grlNormal.x *= -grlHalfWidth;
                        grlNormal.y *= -grlHalfWidth;
                    #else
                        grlNormal.x *= grlHalfWidth;
                        grlNormal.y *= grlHalfWidth;
                    #endif

                    grlNormal *= uniforms.grl_projection;

                    #if defined(GREASED_LINE_SIZE_ATTENUATION)
                        grlNormal.x *= grlFinalPosition.w;
                        grlNormal.y *= grlFinalPosition.w;

                        let pr = vec4f(uniforms.grl_aspect_resolution_lineWidth.yz, 0.0, 1.0) * uniforms.grl_projection;
                        grlNormal.x /= pr.x;
                        grlNormal.y /= pr.y;
                    #endif

                    vertexOutputs.position = vec4f(grlFinalPosition.xy + grlNormal.xy * grlSide, grlFinalPosition.z, grlFinalPosition.w);
                    vertexOutputs.vPositionW = vertexOutputs.position.xyz;
                
                #else
                    vertexOutputs.grlCounters = input.grl_counters;
                #endif
                `};return t&&(e[`!vertexOutputs\\.position\\s=\\sscene\\.viewProjection\\s\\*\\sworldPos;`]=`//`),e}return e===`fragment`?{CUSTOM_FRAGMENT_DEFINITIONS:`
                    #ifdef PBR
                         #define grlFinalColor finalColor
                    #else
                         #define grlFinalColor color
                    #endif

                    varying grlCounters: f32;
                    varying grlColorPointer: 32;

                    var grl_colors: texture_2d<f32>;
                    var grl_colorsSampler: sampler;
                `,CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR:`
                    let grlColorMode: f32 = uniforms.grl_colorMode_visibility_colorsWidth_useColors.x;
                    let grlVisibility: f32 = uniforms.grl_colorMode_visibility_colorsWidth_useColors.y;
                    let grlColorsWidth: f32 = uniforms.grl_colorMode_visibility_colorsWidth_useColors.z;
                    let grlUseColors: f32 = uniforms.grl_colorMode_visibility_colorsWidth_useColors.w;

                    let grlUseDash: f32 = uniforms.grl_dashOptions.x;
                    let grlDashArray: f32 = uniforms.grl_dashOptions.y;
                    let grlDashOffset: f32 = uniforms.grl_dashOptions.z;
                    let grlDashRatio: f32 = uniforms.grl_dashOptions.w;

                    grlFinalColor.a *= step(fragmentInputs.grlCounters, grlVisibility);
                    if (grlFinalColor.a == 0.0) {
                        discard;
                    }

                    if (grlUseDash == 1.0) {
                        let dashPosition = (fragmentInputs.grlCounters + grlDashOffset) % grlDashArray;
                        grlFinalColor.a *= ceil(dashPosition - (grlDashArray * grlDashRatio));

                        if (grlFinalColor.a == 0.0) {
                            discard;
                        }
                    }

                    #ifdef GREASED_LINE_HAS_COLOR
                        if (grlColorMode == 0.) {
                            grlFinalColor = vec4f(uniforms.grl_singleColor, grlFinalColor.a);
                        } else if (grlColorMode == 1.) {
                            grlFinalColor += vec4f(uniforms.grl_singleColor, grlFinalColor.a);
                        } else if (grlColorMode == 2.) {
                            grlFinalColor *= vec4f(uniforms.grl_singleColor, grlFinalColor.a);
                        }
                    #else
                        if (grlUseColors == 1.) {
                            #ifdef GREASED_LINE_COLOR_DISTRIBUTION_TYPE_LINE
                                let grlColor: vec4f = textureSample(grl_colors, grl_colorsSampler, vec2f(fragmentInputs.grlCounters, 0.));
                            #else
                                let lookup: vec2f = vec2(fract(fragmentInputs.grlColorPointer / uniforms.grl_textureSize.x), 1.0 - floor(fragmentInputs.grlColorPointer / uniforms.grl_textureSize.x) / max(uniforms.grl_textureSize.y - 1.0, 1.0));
                                let grlColor: vec4f = textureSample(grl_colors, grl_colorsSampler, lookup);
                            #endif
                            if (grlColorMode == 0.) {
                                grlFinalColor = grlColor;
                            } else if (grlColorMode == 1.) {
                                grlFinalColor += grlColor;
                            } else if (grlColorMode == 2.) {
                                grlFinalColor *= grlColor;
                            }
                        }
                    #endif


                `}:null}var V=e((()=>{}));function H(){G||(G=!0,i(`BABYLON.${W.GREASED_LINE_MATERIAL_NAME}`,W))}var U,W,G,K=e((()=>{O(),N(),o(),A(),F(),L(),z(),V(),r(),U=class extends j{constructor(){super(...arguments),this.GREASED_LINE_HAS_COLOR=!1,this.GREASED_LINE_SIZE_ATTENUATION=!1,this.GREASED_LINE_COLOR_DISTRIBUTION_TYPE_LINE=!1,this.GREASED_LINE_RIGHT_HANDED_COORDINATE_SYSTEM=!1,this.GREASED_LINE_CAMERA_FACING=!0,this.GREASED_LINE_USE_OFFSETS=!1}},W=class e extends M{isCompatible(e){return!0}constructor(t,n,r){r||={color:P.DEFAULT_COLOR};let i=new U;i.GREASED_LINE_HAS_COLOR=!!r.color&&!r.useColors,i.GREASED_LINE_SIZE_ATTENUATION=r.sizeAttenuation??!1,i.GREASED_LINE_COLOR_DISTRIBUTION_TYPE_LINE=r.colorDistributionType===1,i.GREASED_LINE_RIGHT_HANDED_COORDINATE_SYSTEM=(n??t.getScene()).useRightHandedSystem,i.GREASED_LINE_CAMERA_FACING=r.cameraFacing??!0,super(t,e.GREASED_LINE_MATERIAL_NAME,200,i,!0,!0),this.colorsTexture=null,this._forceGLSL=!1,this._forceGLSL=r?.forceGLSL||e.ForceGLSL,this._scene=n??t.getScene(),this._engine=this._scene.getEngine(),this._cameraFacing=r.cameraFacing??!0,this.visibility=r.visibility??1,this.useDash=r.useDash??!1,this.dashRatio=r.dashRatio??.5,this.dashOffset=r.dashOffset??0,this.width=r.width?r.width:r.sizeAttenuation?P.DEFAULT_WIDTH_ATTENUATED:P.DEFAULT_WIDTH,this._sizeAttenuation=r.sizeAttenuation??!1,this.colorMode=r.colorMode??0,this._color=r.color??null,this.useColors=r.useColors??!1,this._colorsDistributionType=r.colorDistributionType??0,this.colorsSampling=r.colorsSampling??k.NEAREST_NEAREST,this._colors=r.colors??null,this.dashCount=r.dashCount??1,this.resolution=r.resolution??new a(this._engine.getRenderWidth(),this._engine.getRenderHeight()),r.colorsTexture?this.colorsTexture=r.colorsTexture:this._colors?this.colorsTexture=I.CreateColorsTexture(`${t.name}-colors-texture`,this._colors,this.colorsSampling,this._scene):(this._color=this._color??P.DEFAULT_COLOR,I.PrepareEmptyColorsTexture(this._scene)),this._engine.onDisposeObservable.add(()=>{I.DisposeEmptyColorsTexture()})}getAttributes(e){e.push(`grl_offsets`),e.push(`grl_widths`),e.push(`grl_colorPointers`),e.push(`grl_counters`),this._cameraFacing?(e.push(`grl_previousAndSide`),e.push(`grl_nextAndCounters`)):e.push(`grl_slopes`)}getSamplers(e){e.push(`grl_colors`)}getActiveTextures(e){this.colorsTexture&&e.push(this.colorsTexture)}getUniforms(e=0){let t=[{name:`grl_singleColor`,size:3,type:`vec3`},{name:`grl_textureSize`,size:2,type:`vec2`},{name:`grl_dashOptions`,size:4,type:`vec4`},{name:`grl_colorMode_visibility_colorsWidth_useColors`,size:4,type:`vec4`}];return this._cameraFacing&&t.push({name:`grl_projection`,size:16,type:`mat4`},{name:`grl_aspect_resolution_lineWidth`,size:4,type:`vec4`}),e===1&&t.push({name:`viewProjection`,size:16,type:`mat4`}),{ubo:t,vertex:this._cameraFacing&&this._isGLSL(e)?`
                    uniform vec4 grl_aspect_resolution_lineWidth;
                    uniform mat4 grl_projection;
    `:``,fragment:this._isGLSL(e)?`
                    uniform vec4 grl_dashOptions;
                    uniform vec2 grl_textureSize;
                    uniform vec4 grl_colorMode_visibility_colorsWidth_useColors;
                    uniform vec3 grl_singleColor;
    `:``}}get isEnabled(){return!0}bindForSubMesh(e){if(this._cameraFacing){e.updateMatrix(`grl_projection`,this._scene.getProjectionMatrix()),this._isGLSL(this._material.shaderLanguage)||e.updateMatrix(`viewProjection`,this._scene.getTransformMatrix());let t=s.Vector4[0];t.x=this._aspect,t.y=this._resolution.x,t.z=this._resolution.y,t.w=this.width,e.updateVector4(`grl_aspect_resolution_lineWidth`,t)}let t=s.Vector4[0];t.x=I.BooleanToNumber(this.useDash),t.y=this._dashArray,t.z=this.dashOffset,t.w=this.dashRatio,e.updateVector4(`grl_dashOptions`,t);let n=s.Vector4[1];n.x=this.colorMode,n.y=this.visibility,n.z=this.colorsTexture?this.colorsTexture.getSize().width:0,n.w=I.BooleanToNumber(this.useColors),e.updateVector4(`grl_colorMode_visibility_colorsWidth_useColors`,n),this._color&&e.updateColor3(`grl_singleColor`,this._color);let r=this.colorsTexture??P.EmptyColorsTexture;e.setTexture(`grl_colors`,r),e.updateFloat2(`grl_textureSize`,r?.getSize().width??1,r?.getSize().height??1)}prepareDefines(e,t,n){e.GREASED_LINE_HAS_COLOR=!!this.color&&!this.useColors,e.GREASED_LINE_SIZE_ATTENUATION=this._sizeAttenuation,e.GREASED_LINE_COLOR_DISTRIBUTION_TYPE_LINE=this._colorsDistributionType===1,e.GREASED_LINE_RIGHT_HANDED_COORDINATE_SYSTEM=t.useRightHandedSystem,e.GREASED_LINE_CAMERA_FACING=this._cameraFacing,e.GREASED_LINE_USE_OFFSETS=!!n.offsets}getClassName(){return e.GREASED_LINE_MATERIAL_NAME}getCustomCode(e,t=0){return this._isGLSL(t)?R(e,this._cameraFacing):B(e,this._cameraFacing)}dispose(){this.colorsTexture?.dispose(),super.dispose()}get colors(){return this._colors}set colors(e){this.setColors(e)}setColors(e,t=!1,n=!1){let r=this._colors?.length??0;if(this._colors=e,e===null||e.length===0){this.colorsTexture?.dispose();return}if(!(t&&!n)){if(this.colorsTexture&&r===e.length&&!n){let t=I.Color3toRGBAUint8(e);this.colorsTexture.update(t)}else this.colorsTexture?.dispose(),this.colorsTexture=I.CreateColorsTexture(`${this._material.name}-colors-texture`,e,this.colorsSampling,this._scene)}}updateLazy(){this._colors&&this.setColors(this._colors,!1,!0)}get dashCount(){return this._dashCount}set dashCount(e){this._dashCount=e,this._dashArray=1/e}get sizeAttenuation(){return this._sizeAttenuation}set sizeAttenuation(e){this._sizeAttenuation=e,this.markAllDefinesAsDirty()}get color(){return this._color}set color(e){this.setColor(e)}setColor(e,t=!1){this._color===null&&e!==null||this._color!==null&&e===null?(this._color=e,t||this.markAllDefinesAsDirty()):this._color=e}get colorsDistributionType(){return this._colorsDistributionType}set colorsDistributionType(e){this._colorsDistributionType=e,this.markAllDefinesAsDirty()}get resolution(){return this._resolution}set resolution(e){this._aspect=e.x/e.y,this._resolution=e}serialize(){let e=super.serialize(),t={colorDistributionType:this._colorsDistributionType,colorsSampling:this.colorsSampling,colorMode:this.colorMode,dashCount:this._dashCount,dashOffset:this.dashOffset,dashRatio:this.dashRatio,resolution:this._resolution,sizeAttenuation:this._sizeAttenuation,useColors:this.useColors,useDash:this.useDash,visibility:this.visibility,width:this.width};return this._colors&&(t.colors=this._colors),this._color&&(t.color=this._color),e.greasedLineMaterialOptions=t,e}parse(e,t,n){super.parse(e,t,n);let r=e.greasedLineMaterialOptions;this.colorsTexture?.dispose(),r.color&&this.setColor(r.color,!0),r.colorDistributionType&&(this.colorsDistributionType=r.colorDistributionType),r.colors&&(this.colors=r.colors),r.colorsSampling&&(this.colorsSampling=r.colorsSampling),r.colorMode&&(this.colorMode=r.colorMode),r.useColors&&(this.useColors=r.useColors),r.visibility&&(this.visibility=r.visibility),r.useDash&&(this.useDash=r.useDash),r.dashCount&&(this.dashCount=r.dashCount),r.dashRatio&&(this.dashRatio=r.dashRatio),r.dashOffset&&(this.dashOffset=r.dashOffset),r.width&&(this.width=r.width),r.sizeAttenuation&&(this.sizeAttenuation=r.sizeAttenuation),r.resolution&&(this.resolution=r.resolution),this.colors?this.colorsTexture=I.CreateColorsTexture(`${this._material.name}-colors-texture`,this.colors,this.colorsSampling,t):I.PrepareEmptyColorsTexture(t),this.markAllDefinesAsDirty()}copyTo(e){let t=e;t.colorsTexture?.dispose(),this._colors&&(t.colorsTexture=I.CreateColorsTexture(`${t._material.name}-colors-texture`,this._colors,t.colorsSampling,this._scene)),t.setColor(this.color,!0),t.colorsDistributionType=this.colorsDistributionType,t.colorsSampling=this.colorsSampling,t.colorMode=this.colorMode,t.useColors=this.useColors,t.visibility=this.visibility,t.useDash=this.useDash,t.dashCount=this.dashCount,t.dashRatio=this.dashRatio,t.dashOffset=this.dashOffset,t.width=this.width,t.sizeAttenuation=this.sizeAttenuation,t.resolution=this.resolution,t.markAllDefinesAsDirty()}_isGLSL(e){return e===0||this._forceGLSL}},W.GREASED_LINE_MATERIAL_NAME=`GreasedLinePluginMaterial`,W.ForceGLSL=!1,G=!1})),q,J,Y=e((()=>{O(),te(),l(),o(),d(),L(),F(),S(),q=`GREASED_LINE_USE_OFFSETS`,J=class e extends ee{constructor(t,n,r){let i=n.getEngine(),o=i.isWebGPU&&!(r.forceGLSL||e.ForceGLSL),s=[`COLOR_DISTRIBUTION_TYPE_LINE 1.`,`COLOR_DISTRIBUTION_TYPE_SEGMENT 0.`,`COLOR_MODE_SET 0.`,`COLOR_MODE_ADD 1.`,`COLOR_MODE_MULTIPLY 2.`];n.useRightHandedSystem&&s.push(`GREASED_LINE_RIGHT_HANDED_COORDINATE_SYSTEM`);let c=[`position`,`grl_widths`,`grl_offsets`,`grl_colorPointers`];r.cameraFacing?(s.push(`GREASED_LINE_CAMERA_FACING`),c.push(`grl_previousAndSide`,`grl_nextAndCounters`)):(c.push(`grl_slopes`),c.push(`grl_counters`));let l=[`grlColorsWidth`,`grlUseColors`,`grlWidth`,`grlColor`,`grl_colorModeAndColorDistributionType`,`grlResolution`,`grlAspect`,`grlAizeAttenuation`,`grlDashArray`,`grlDashOffset`,`grlDashRatio`,`grlUseDash`,`grlVisibility`,`grlColors`];if(o||l.push(`world`,`viewProjection`,`view`,`projection`),super(t,n,{vertex:`greasedLine`,fragment:`greasedLine`},{uniformBuffers:o?[`Scene`,`Mesh`]:void 0,attributes:c,uniforms:l,samplers:o?[]:[`grlColors`],defines:s,extraInitializationsAsync:async()=>{o?await Promise.all([C(()=>import(`./greasedLine.vertex-Nl6PtxLC.js`).then(e=>(e.r(),e.n)),__vite__mapDeps([0,1,2,3,4,5,6]),import.meta.url),C(()=>import(`./greasedLine.fragment-Bll41gv5.js`).then(e=>(e.r(),e.n)),__vite__mapDeps([7,1,2]),import.meta.url)]):await Promise.all([C(()=>import(`./greasedLine.vertex-Def_a7Tx.js`).then(e=>(e.r(),e.n)),__vite__mapDeps([8,1,2,9,10]),import.meta.url),C(()=>import(`./greasedLine.fragment-BXSz7HUE.js`).then(e=>(e.r(),e.n)),__vite__mapDeps([11,1,2]),import.meta.url)])},shaderLanguage:+!!o}),this._color=u.White(),this._colorsDistributionType=0,this._colorsTexture=null,r||={color:P.DEFAULT_COLOR},this.visibility=r.visibility??1,this.useDash=r.useDash??!1,this.dashRatio=r.dashRatio??.5,this.dashOffset=r.dashOffset??0,this.dashCount=r.dashCount??1,this.width=r.width?r.width:r.sizeAttenuation&&r.cameraFacing?P.DEFAULT_WIDTH_ATTENUATED:P.DEFAULT_WIDTH,this.sizeAttenuation=r.sizeAttenuation??!1,this.color=r.color??u.White(),this.useColors=r.useColors??!1,this.colorsDistributionType=r.colorDistributionType??0,this.colorsSampling=r.colorsSampling??k.NEAREST_NEAREST,this.colorMode=r.colorMode??0,this._colors=r.colors??null,this._cameraFacing=r.cameraFacing??!0,this.resolution=r.resolution??new a(i.getRenderWidth(),i.getRenderHeight()),r.colorsTexture?this.colorsTexture=r.colorsTexture:this._colors?this.colorsTexture=I.CreateColorsTexture(`${this.name}-colors-texture`,this._colors,this.colorsSampling,n):(this._color=this._color??P.DEFAULT_COLOR,this.colorsTexture=I.PrepareEmptyColorsTexture(n)),o){let e=new f;e.setParameters(),e.samplingMode=this.colorsSampling,this.setTextureSampler(`grlColorsSampler`,e)}i.onDisposeObservable.add(()=>{I.DisposeEmptyColorsTexture()})}dispose(){this._colorsTexture&&this._colorsTexture!==P.EmptyColorsTexture&&this._colorsTexture.dispose(),super.dispose()}_setColorModeAndColorDistributionType(){this.setVector2(`grl_colorModeAndColorDistributionType`,new a(this._colorMode,this._colorsDistributionType))}updateLazy(){this._colors&&this.setColors(this._colors,!1,!0)}get colors(){return this._colors}set colors(e){this.setColors(e)}setColors(e,t=!1,n=!1){let r=this._colors?.length??0;if(this._colors=e,e===null||e.length===0){this._colorsTexture&&this._colorsTexture!==P.EmptyColorsTexture&&this._colorsTexture.dispose();let e=this.getScene();e&&(this.colorsTexture=I.PrepareEmptyColorsTexture(e));return}if(!(t&&!n)){if(this._colorsTexture&&r===e.length&&!n){let t=I.Color3toRGBAUint8(e);this._colorsTexture.update(t)}else this._colorsTexture&&this._colorsTexture!==P.EmptyColorsTexture&&this._colorsTexture.dispose(),this.colorsTexture=I.CreateColorsTexture(`${this.name}-colors-texture`,e,this.colorsSampling,this.getScene())}}get colorsTexture(){return this._colorsTexture??null}set colorsTexture(e){this._colorsTexture=e,this.setFloat(`grlColorsWidth`,this._colorsTexture.getSize().width),this.setTexture(`grlColors`,this._colorsTexture)}get width(){return this._width}set width(e){this._width=e,this.setFloat(`grlWidth`,e)}get useColors(){return this._useColors}set useColors(e){this._useColors=e,this.setFloat(`grlUseColors`,I.BooleanToNumber(e))}get colorsSampling(){return this._colorsSampling}set colorsSampling(e){this._colorsSampling=e}get visibility(){return this._visibility}set visibility(e){this._visibility=e,this.setFloat(`grlVisibility`,e)}get useDash(){return this._useDash}set useDash(e){this._useDash=e,this.setFloat(`grlUseDash`,I.BooleanToNumber(e))}get dashOffset(){return this._dashOffset}set dashOffset(e){this._dashOffset=e,this.setFloat(`grlDashOffset`,e)}get dashRatio(){return this._dashRatio}set dashRatio(e){this._dashRatio=e,this.setFloat(`grlDashRatio`,e)}get dashCount(){return this._dashCount}set dashCount(e){this._dashCount=e,this._dashArray=1/e,this.setFloat(`grlDashArray`,this._dashArray)}get sizeAttenuation(){return this._sizeAttenuation}set sizeAttenuation(e){this._sizeAttenuation=e,this.setFloat(`grlSizeAttenuation`,I.BooleanToNumber(e))}get color(){return this._color}set color(e){this.setColor(e)}setColor(e){e??=P.DEFAULT_COLOR,this._color=e,this.setColor3(`grlColor`,e)}get colorsDistributionType(){return this._colorsDistributionType}set colorsDistributionType(e){this._colorsDistributionType=e,this._setColorModeAndColorDistributionType()}get colorMode(){return this._colorMode}set colorMode(e){this._colorMode=e,this._setColorModeAndColorDistributionType()}get resolution(){return this._resolution}set resolution(e){this._resolution=e,this.setVector2(`grlResolution`,e),this.setFloat(`grlAspect`,e.x/e.y)}serialize(){let e=super.serialize(),t={colorDistributionType:this._colorsDistributionType,colorsSampling:this._colorsSampling,colorMode:this._colorMode,color:this._color,dashCount:this._dashCount,dashOffset:this._dashOffset,dashRatio:this._dashRatio,resolution:this._resolution,sizeAttenuation:this._sizeAttenuation,useColors:this._useColors,useDash:this._useDash,visibility:this._visibility,width:this._width,cameraFacing:this._cameraFacing};return this._colors&&(t.colors=this._colors),e.greasedLineMaterialOptions=t,e}parse(e,t,n){let r=e.greasedLineMaterialOptions;this._colorsTexture?.dispose(),r.color&&(this.color=r.color),r.colorDistributionType&&(this.colorsDistributionType=r.colorDistributionType),r.colorsSampling&&(this.colorsSampling=r.colorsSampling),r.colorMode&&(this.colorMode=r.colorMode),r.useColors&&(this.useColors=r.useColors),r.visibility&&(this.visibility=r.visibility),r.useDash&&(this.useDash=r.useDash),r.dashCount&&(this.dashCount=r.dashCount),r.dashRatio&&(this.dashRatio=r.dashRatio),r.dashOffset&&(this.dashOffset=r.dashOffset),r.width&&(this.width=r.width),r.sizeAttenuation&&(this.sizeAttenuation=r.sizeAttenuation),r.resolution&&(this.resolution=r.resolution),this.colorsTexture=r.colors?I.CreateColorsTexture(`${this.name}-colors-texture`,r.colors,this.colorsSampling,this.getScene()):I.PrepareEmptyColorsTexture(t),this._cameraFacing=r.cameraFacing??!0,this.setDefine(`GREASED_LINE_CAMERA_FACING`,this._cameraFacing)}},J.ForceGLSL=!1})),X,Z,Q,$,ne=e((()=>{K(),E(),p(),w(),n(),Y(),L(),(function(e){e[e.POINTS_MODE_POINTS=0]=`POINTS_MODE_POINTS`,e[e.POINTS_MODE_PATHS=1]=`POINTS_MODE_PATHS`})(X||={}),(function(e){e[e.FACES_MODE_SINGLE_SIDED=0]=`FACES_MODE_SINGLE_SIDED`,e[e.FACES_MODE_SINGLE_SIDED_NO_BACKFACE_CULLING=1]=`FACES_MODE_SINGLE_SIDED_NO_BACKFACE_CULLING`,e[e.FACES_MODE_DOUBLE_SIDED=2]=`FACES_MODE_DOUBLE_SIDED`})(Z||={}),(function(e){e[e.AUTO_DIRECTIONS_FROM_FIRST_SEGMENT=0]=`AUTO_DIRECTIONS_FROM_FIRST_SEGMENT`,e[e.AUTO_DIRECTIONS_FROM_ALL_SEGMENTS=1]=`AUTO_DIRECTIONS_FROM_ALL_SEGMENTS`,e[e.AUTO_DIRECTIONS_ENHANCED=2]=`AUTO_DIRECTIONS_ENHANCED`,e[e.AUTO_DIRECTIONS_FACE_TO=3]=`AUTO_DIRECTIONS_FACE_TO`,e[e.AUTO_DIRECTIONS_NONE=99]=`AUTO_DIRECTIONS_NONE`})(Q||={}),$=class extends D{constructor(e,t,n){super(e,t,null,null,!1,!1),this.name=e,this._options=n,this._lazy=!1,this._updatable=!1,this._engine=t.getEngine(),this._lazy=n.lazy??!1,this._updatable=n.updatable??!1,this._vertexPositions=[],this._indices=[],this._uvs=[],this._points=[],this._colorPointers=n.colorPointers??[],this._widths=n.widths??Array(n.points.length).fill(1)}getClassName(){return`GreasedLineMesh`}_updateWidthsWithValue(e){let t=0;for(let e of this._points)t+=e.length;let n=t/3*2-this._widths.length;for(let t=0;t<n;t++)this._widths.push(e)}updateLazy(){this._setPoints(this._points),this._options.colorPointers||this._updateColorPointers(),this._createVertexBuffers(this._options.ribbonOptions?.smoothShading),!this.doNotSyncBoundingInfo&&this.refreshBoundingInfo(),this.greasedLineMaterial?.updateLazy()}addPoints(e,t){for(let t of e)this._points.push(t);this._lazy||this.setPoints(this._points,t)}dispose(e,t=!1){super.dispose(e,t)}isLazy(){return this._lazy}get uvs(){return this._uvs}set uvs(e){this._uvs=e instanceof Float32Array?e:new Float32Array(e),this._createVertexBuffers()}get offsets(){return this._offsets}set offsets(e){this.material instanceof J&&this.material.setDefine(q,e?.length>0),this._offsets=e,this._offsetsBuffer?this._offsetsBuffer.update(e):this._createOffsetsBuffer(e)}get widths(){return this._widths}set widths(e){this._widths=e,this._lazy||this._widthsBuffer&&this._widthsBuffer.update(e)}get colorPointers(){return this._colorPointers}set colorPointers(e){this._colorPointers=e,this._lazy||this._colorPointersBuffer&&this._colorPointersBuffer.update(e)}get greasedLineMaterial(){if(this.material&&this.material instanceof J)return this.material;let e=this.material?.pluginManager?.getPlugin(W.GREASED_LINE_MATERIAL_NAME);if(e)return e}get points(){let e=[];return t.DeepCopy(this._points,e),e}setPoints(e,t){this._points=I.ConvertPoints(e,t?.pointsOptions??this._options.pointsOptions),this._updateWidths(),t?.colorPointers||this._updateColorPointers(),this._setPoints(this._points,t)}_initGreasedLine(){this._vertexPositions=[],this._indices=[],this._uvs=[]}_createLineOptions(){return{points:this._points,colorPointers:this._colorPointers,lazy:this._lazy,updatable:this._updatable,uvs:this._uvs,widths:this._widths,ribbonOptions:this._options.ribbonOptions}}serialize(e){super.serialize(e),e.type=this.getClassName(),e.lineOptions=this._createLineOptions()}_createVertexBuffers(e=!1){let t=new T;return t.positions=this._vertexPositions,t.indices=this._indices,t.uvs=this._uvs,e&&(t.normals=[],T.ComputeNormals(this._vertexPositions,this._indices,t.normals)),t.applyToMesh(this,this._options.updatable),t}_createOffsetsBuffer(e){let t=this._scene.getEngine(),n=new h(t,e,this._updatable,3);this.setVerticesBuffer(n.createVertexBuffer(`grl_offsets`,0,3)),this._offsetsBuffer=n}}}));export{ne as a,Y as c,H as d,K as f,F as g,P as h,X as i,W as l,L as m,Q as n,J as o,I as p,Z as r,q as s,$ as t,U as u};