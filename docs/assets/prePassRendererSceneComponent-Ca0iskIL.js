import{n as e}from"./rolldown-runtime-B0Z9INg1.js";import{a as t,r as n}from"./tools.pure-h2tBewWA.js";import{i as r,r as i}from"./typeStore-Cabm4lgz.js";import{c as a,n as o,o as s}from"./math.vector.pure-BbmgcGD4.js";import{E as c,O as l,T as u,_ as d,a as f,r as p}from"./decorators-BejFUSV1.js";import{n as m,t as h}from"./shaderStore-DBiNfWDC.js";import{r as g,t as _}from"./abstractEngine.pure-DEGx6D9x.js";import{a as v,t as y}from"./pointerEvents-DEq8PU8C.js";import{i as b,t as ee}from"./keyboardEvents-5ImBgOBB.js";import{b as x,x as S}from"./gaussianSplattingMesh.pure-sjzNmdWe.js";import{i as C,t as w}from"./math.axis-DWuXdmG6.js";import{Dn as te,En as ne,Un as T,Vn as re,a as ie,ar as ae,i as oe,ir as se}from"./icoSphereBuilder.pure-SThGoKkt.js";import{a as ce,i as le}from"./morphTarget-BW-U5bn6.js";import{S as E,b as ue,x as de}from"./morphTargetManager-CsneV98G.js";import{Bi as fe,Gd as pe,Hd as D,Id as me,Nd as he,Od as ge,Pd as O,Q as _e,Qd as k,Rd as A,Ri as j,Td as M,Vd as ve,Xd as ye,Z as be,_a as xe,cd as Se,cf as N,et as Ce,ff as we,ga as Te,gf as Ee,kd as P,of as De,pf as F,qd as I,rf as L,tf as Oe,tt as R,va as ke,vf as z,wd as Ae}from"./spriteSceneComponent-68llXiw_.js";import{h as B,m as je}from"./transformNode-C9hC2rym.js";import{r as Me}from"./gaussianSplattingMesh-BsQHz2WM.js";var V,Ne=e((()=>{l(),p(),E(),b(),a(),t(),V=(()=>{var e;let t,r=[],i=[],a,o=[],l=[],d,p=[],m=[],h,g=[],_=[],v,y=[],b=[],x,S=[],C=[];return e=class{constructor(){this.keysForward=c(this,r,[87]),this.keysBackward=(c(this,i),c(this,o,[83])),this.keysUp=(c(this,l),c(this,p,[69])),this.keysDown=(c(this,m),c(this,g,[81])),this.keysRight=(c(this,_),c(this,y,[68])),this.keysLeft=(c(this,b),c(this,S,[65])),this._keys=(c(this,C),[])}attachControl(e){e=n.BackCompatCameraNoPreventDefault(arguments),!this._onCanvasBlurObserver&&(this._scene=this.camera.getScene(),this._engine=this._scene.getEngine(),this._onCanvasBlurObserver=this._engine.onCanvasBlurObservable.add(()=>{this._keys.length=0}),this._onKeyboardObserver=this._scene.onKeyboardObservable.add(t=>{let n=t.event;if(t.type===ee.KEYDOWN)(this.keysForward.indexOf(n.keyCode)!==-1||this.keysBackward.indexOf(n.keyCode)!==-1||this.keysUp.indexOf(n.keyCode)!==-1||this.keysDown.indexOf(n.keyCode)!==-1||this.keysLeft.indexOf(n.keyCode)!==-1||this.keysRight.indexOf(n.keyCode)!==-1)&&(this._keys.indexOf(n.keyCode)===-1&&this._keys.push(n.keyCode),e||n.preventDefault());else if(this.keysForward.indexOf(n.keyCode)!==-1||this.keysBackward.indexOf(n.keyCode)!==-1||this.keysUp.indexOf(n.keyCode)!==-1||this.keysDown.indexOf(n.keyCode)!==-1||this.keysLeft.indexOf(n.keyCode)!==-1||this.keysRight.indexOf(n.keyCode)!==-1){let t=this._keys.indexOf(n.keyCode);t>=0&&this._keys.splice(t,1),e||n.preventDefault()}}))}detachControl(){this._scene&&(this._onKeyboardObserver&&this._scene.onKeyboardObservable.remove(this._onKeyboardObserver),this._onCanvasBlurObserver&&this._engine.onCanvasBlurObservable.remove(this._onCanvasBlurObserver),this._onKeyboardObserver=null,this._onCanvasBlurObserver=null),this._keys.length=0}getClassName(){return`FlyCameraKeyboardInput`}_onLostFocus(){this._keys.length=0}getSimpleName(){return`keyboard`}checkInputs(){if(this._onKeyboardObserver){let e=this.camera,t=e.movement.input.getEntry(`keyboard`,`translate`);if(!t)return;let n=t.sensitivity??1,r=e._localDirection.copyFromFloats(0,0,0);for(let e=0;e<this._keys.length;e++){let t=this._keys[e];this.keysForward.indexOf(t)===-1?this.keysBackward.indexOf(t)===-1?this.keysUp.indexOf(t)===-1?this.keysDown.indexOf(t)===-1?this.keysRight.indexOf(t)===-1?this.keysLeft.indexOf(t)!==-1&&--r.x:r.x+=1:--r.y:r.y+=1:--r.z:r.z+=1}if(r.x!==0||r.y!==0||r.z!==0){let t=e._computeLocalCameraSpeed()*n;r.normalize().scaleInPlace(t),e.getScene().useRightHandedSystem&&(r.z*=-1),e.getViewMatrix().invertToRef(e._cameraTransformMatrix),s.TransformNormalToRef(r,e._cameraTransformMatrix,e._transformedDirection),e.cameraDirection.addInPlace(e._transformedDirection)}}}},(()=>{let n=typeof Symbol==`function`&&Symbol.metadata?Object.create(null):void 0;t=[f()],a=[f()],d=[f()],h=[f()],v=[f()],x=[f()],u(null,null,t,{kind:`field`,name:`keysForward`,static:!1,private:!1,access:{has:e=>`keysForward`in e,get:e=>e.keysForward,set:(e,t)=>{e.keysForward=t}},metadata:n},r,i),u(null,null,a,{kind:`field`,name:`keysBackward`,static:!1,private:!1,access:{has:e=>`keysBackward`in e,get:e=>e.keysBackward,set:(e,t)=>{e.keysBackward=t}},metadata:n},o,l),u(null,null,d,{kind:`field`,name:`keysUp`,static:!1,private:!1,access:{has:e=>`keysUp`in e,get:e=>e.keysUp,set:(e,t)=>{e.keysUp=t}},metadata:n},p,m),u(null,null,h,{kind:`field`,name:`keysDown`,static:!1,private:!1,access:{has:e=>`keysDown`in e,get:e=>e.keysDown,set:(e,t)=>{e.keysDown=t}},metadata:n},g,_),u(null,null,v,{kind:`field`,name:`keysRight`,static:!1,private:!1,access:{has:e=>`keysRight`in e,get:e=>e.keysRight,set:(e,t)=>{e.keysRight=t}},metadata:n},y,b),u(null,null,x,{kind:`field`,name:`keysLeft`,static:!1,private:!1,access:{has:e=>`keysLeft`in e,get:e=>e.keysLeft,set:(e,t)=>{e.keysLeft=t}},metadata:n},S,C),n&&Object.defineProperty(e,Symbol.metadata,{enumerable:!0,configurable:!0,writable:!0,value:n})})(),e})(),ue.FlyCameraKeyboardInput=V})),H,Pe=e((()=>{l(),p(),E(),v(),a(),C(),t(),H=(()=>{var e;let t,r=[],i=[],a,s=[],l=[];return e=class{constructor(){this.buttons=c(this,r,[0,1,2]),this.buttonsYaw=(c(this,i),[-1,0,1]),this.buttonsPitch=[-1,0,1],this.buttonsRoll=[2],this.activeButton=-1,this.angularSensibility=c(this,s,1e3),this._observer=c(this,l),this._previousPosition=null,this._pointerConditions={}}attachControl(e){e=n.BackCompatCameraNoPreventDefault(arguments),this._noPreventDefault=e,this._observer=this.camera.getScene()._inputManager._addCameraPointerObserver(e=>{this._pointerInput(e)},y.POINTERDOWN|y.POINTERUP|y.POINTERMOVE),this._rollObserver=this.camera.getScene().onBeforeRenderObservable.add(()=>{this.camera.rollCorrect&&this.camera.restoreRoll(this.camera.rollCorrect)})}detachControl(){this._observer&&(this.camera.getScene()._inputManager._removeCameraPointerObserver(this._observer),this.camera.getScene().onBeforeRenderObservable.remove(this._rollObserver),this._observer=null,this._rollObserver=null,this._previousPosition=null,this._noPreventDefault=void 0)}getClassName(){return`FlyCameraMouseInput`}getSimpleName(){return`mouse`}_pointerInput(e){let t=e.event,n=this.camera.getEngine();if(!this.touchEnabled&&t.pointerType===`touch`||e.type!==y.POINTERMOVE&&this.buttons.indexOf(t.button)===-1)return;let r=t.target;if(e.type===y.POINTERDOWN){try{r?.setPointerCapture(t.pointerId)}catch{}this._previousPosition={x:t.clientX,y:t.clientY},this.activeButton=t.button,this._noPreventDefault||t.preventDefault(),n.isPointerLock&&this._onMouseMove(e.event)}else if(e.type===y.POINTERUP){try{r?.releasePointerCapture(t.pointerId)}catch{}this.activeButton=-1,this._previousPosition=null,this._noPreventDefault||t.preventDefault()}else if(e.type===y.POINTERMOVE){if(!this._previousPosition){n.isPointerLock&&this._onMouseMove(e.event);return}let r=t.clientX-this._previousPosition.x,i=t.clientY-this._previousPosition.y;this._rotateCamera(r,i),this._previousPosition={x:t.clientX,y:t.clientY},this._noPreventDefault||t.preventDefault()}}_onMouseMove(e){if(!this.camera.getEngine().isPointerLock)return;let t=e.movementX,n=e.movementY;this._rotateCamera(t,n),this._previousPosition=null,this._noPreventDefault||e.preventDefault()}_rotateCamera(e,t){let n=this.camera;this._pointerConditions.button=this.activeButton;let r=n.movement.input.resolveInteraction(`pointer`,this._pointerConditions);if(!r||r.interaction!==`rotate`)return;let i=n._calculateHandednessMultiplier(),a=r.sensitivityX??r.sensitivity??1/this.angularSensibility,s=r.sensitivityY??r.sensitivity??1/this.angularSensibility,c=e*i*a,l=t*i*s,u=o.RotationYawPitchRoll(n.rotation.y,n.rotation.x,n.rotation.z),d;if(this.buttonsPitch.some(e=>e===this.activeButton)&&(d=o.RotationAxis(w.X,l),u.multiplyInPlace(d)),this.buttonsYaw.some(e=>e===this.activeButton)){d=o.RotationAxis(w.Y,c),u.multiplyInPlace(d);let e=n.bankedTurnLimit+n._trackRoll;if(n.bankedTurn&&-e<n.rotation.z&&n.rotation.z<e){let e=n.bankedTurnMultiplier*-c;d=o.RotationAxis(w.Z,e),u.multiplyInPlace(d)}}this.buttonsRoll.some(e=>e===this.activeButton)&&(d=o.RotationAxis(w.Z,-c),n._trackRoll-=c,u.multiplyInPlace(d)),u.toEulerAnglesToRef(n.rotation)}},(()=>{let n=typeof Symbol==`function`&&Symbol.metadata?Object.create(null):void 0;t=[f()],a=[f()],u(null,null,t,{kind:`field`,name:`buttons`,static:!1,private:!1,access:{has:e=>`buttons`in e,get:e=>e.buttons,set:(e,t)=>{e.buttons=t}},metadata:n},r,i),u(null,null,a,{kind:`field`,name:`angularSensibility`,static:!1,private:!1,access:{has:e=>`angularSensibility`in e,get:e=>e.angularSensibility,set:(e,t)=>{e.angularSensibility=t}},metadata:n},s,l),n&&Object.defineProperty(e,Symbol.metadata,{enumerable:!0,configurable:!0,writable:!0,value:n})})(),e})(),ue.FlyCameraMouseInput=H})),U,Fe=e((()=>{E(),Pe(),Ne(),U=class extends de{constructor(e){super(e)}addKeyboard(){return this.add(new V),this}addMouse(){return this.add(new H),this}}}));function Ie(){G||(G=!0,i(`BABYLON.FlyCamera`,W))}var W,G,K=e((()=>{l(),p(),a(),ce(),Fe(),t(),g(),r(),W=(()=>{var e;let t=le,r,i=[],a=[],o,l=[],p=[],m,h=[],g=[],v,y=[],b=[];return e=class extends t{get angularSensibility(){let e=this.inputs.attached.mouse;return e?e.angularSensibility:0}set angularSensibility(e){let t=this.inputs.attached.mouse;t&&(t.angularSensibility=e)}get keysForward(){let e=this.inputs.attached.keyboard;return e?e.keysForward:[]}set keysForward(e){let t=this.inputs.attached.keyboard;t&&(t.keysForward=e)}get keysBackward(){let e=this.inputs.attached.keyboard;return e?e.keysBackward:[]}set keysBackward(e){let t=this.inputs.attached.keyboard;t&&(t.keysBackward=e)}get keysUp(){let e=this.inputs.attached.keyboard;return e?e.keysUp:[]}set keysUp(e){let t=this.inputs.attached.keyboard;t&&(t.keysUp=e)}get keysDown(){let e=this.inputs.attached.keyboard;return e?e.keysDown:[]}set keysDown(e){let t=this.inputs.attached.keyboard;t&&(t.keysDown=e)}get keysLeft(){let e=this.inputs.attached.keyboard;return e?e.keysLeft:[]}set keysLeft(e){let t=this.inputs.attached.keyboard;t&&(t.keysLeft=e)}get keysRight(){let e=this.inputs.attached.keyboard;return e?e.keysRight:[]}set keysRight(e){let t=this.inputs.attached.keyboard;t&&(t.keysRight=e)}constructor(e,t,n,r=!0){super(e,t,n,r),this.ellipsoid=c(this,i,new s(1,1,1)),this.ellipsoidOffset=(c(this,a),c(this,l,new s(0,0,0))),this.checkCollisions=(c(this,p),c(this,h,!1)),this.applyGravity=(c(this,g),c(this,y,!1)),this.cameraDirection=(c(this,b),s.Zero()),this._trackRoll=0,this.rollCorrect=100,this.bankedTurn=!1,this.bankedTurnLimit=Math.PI/2,this.bankedTurnMultiplier=1,this._needMoveForGravity=!1,this._oldPosition=s.Zero(),this._diffPosition=s.Zero(),this._newPosition=s.Zero(),this._collisionMask=-1,this._onCollisionPositionChange=(e,t,n=null)=>{(e=>{this._newPosition.copyFrom(e),this._newPosition.subtractToRef(this._oldPosition,this._diffPosition),this._diffPosition.length()>_.CollisionsEpsilon&&(this.position.addInPlace(this._diffPosition),this.onCollide&&n&&this.onCollide(n))})(t)},this.inputs=new U(this),this.inputs.addKeyboard().addMouse()}attachControl(e,t){t=n.BackCompatCameraNoPreventDefault(arguments),this.inputs.attachElement(t)}detachControl(){this.inputs.detachElement(),this.cameraDirection=new s(0,0,0)}get collisionMask(){return this._collisionMask}set collisionMask(e){this._collisionMask=isNaN(e)?-1:e}_collideWithWorld(e){let t;t=this.parent?s.TransformCoordinates(this.position,this.parent.getWorldMatrix()):this.position,t.subtractFromFloatsToRef(0,this.ellipsoid.y,0,this._oldPosition),this._oldPosition.addInPlace(this.ellipsoidOffset);let n=this.getScene().collisionCoordinator;this._collider||=n.createCollider(),this._collider._radius=this.ellipsoid,this._collider.collisionMask=this._collisionMask;let r=e;this.applyGravity&&(r=e.add(this.getScene().gravity)),n.getNewPosition(this._oldPosition,r,this._collider,3,null,this._onCollisionPositionChange,this.uniqueId)}_checkInputs(){this._localDirection||(this._localDirection=s.Zero(),this._transformedDirection=s.Zero()),this.inputs.checkInputs(),super._checkInputs()}set needMoveForGravity(e){this._needMoveForGravity=e}get needMoveForGravity(){return this._needMoveForGravity}_decideIfNeedsToMove(){return this._needMoveForGravity||Math.abs(this.cameraDirection.x)>0||Math.abs(this.cameraDirection.y)>0||Math.abs(this.cameraDirection.z)>0}_updatePosition(){this.checkCollisions&&this.getScene().collisionsEnabled?this._collideWithWorld(this.cameraDirection):super._updatePosition()}restoreRoll(e){let t=this._trackRoll,n=t-this.rotation.z,r=.001;Math.abs(n)>=r&&(this.rotation.z+=n/e,Math.abs(t-this.rotation.z)<=r&&(this.rotation.z=t))}dispose(){this.inputs.clear(),super.dispose()}getClassName(){return`FlyCamera`}},(()=>{let n=typeof Symbol==`function`&&Symbol.metadata?Object.create(t[Symbol.metadata]??null):void 0;r=[d()],o=[d()],m=[f()],v=[f()],u(null,null,r,{kind:`field`,name:`ellipsoid`,static:!1,private:!1,access:{has:e=>`ellipsoid`in e,get:e=>e.ellipsoid,set:(e,t)=>{e.ellipsoid=t}},metadata:n},i,a),u(null,null,o,{kind:`field`,name:`ellipsoidOffset`,static:!1,private:!1,access:{has:e=>`ellipsoidOffset`in e,get:e=>e.ellipsoidOffset,set:(e,t)=>{e.ellipsoidOffset=t}},metadata:n},l,p),u(null,null,m,{kind:`field`,name:`checkCollisions`,static:!1,private:!1,access:{has:e=>`checkCollisions`in e,get:e=>e.checkCollisions,set:(e,t)=>{e.checkCollisions=t}},metadata:n},h,g),u(null,null,v,{kind:`field`,name:`applyGravity`,static:!1,private:!1,access:{has:e=>`applyGravity`in e,get:e=>e.applyGravity,set:(e,t)=>{e.applyGravity=t}},metadata:n},y,b),n&&Object.defineProperty(e,Symbol.metadata,{enumerable:!0,configurable:!0,writable:!0,value:n})})(),e})(),G=!1})),Le=e((()=>{K(),K(),Ie()}));function Re(){q||(q=!0,x.prototype.createTransformFeedback=function(){let e=this._gl.createTransformFeedback();if(!e)throw Error(`Unable to create Transform Feedback`);return e},x.prototype.deleteTransformFeedback=function(e){this._gl.deleteTransformFeedback(e)},x.prototype.bindTransformFeedback=function(e){this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK,e)},x.prototype.beginTransformFeedback=function(e=!0){this._gl.beginTransformFeedback(e?this._gl.POINTS:this._gl.TRIANGLES)},x.prototype.endTransformFeedback=function(){this._gl.endTransformFeedback()},x.prototype.setTranformFeedbackVaryings=function(e,t){this._gl.transformFeedbackVaryings(e,t,this._gl.INTERLEAVED_ATTRIBS)},x.prototype.bindTransformFeedbackBuffer=function(e){this._gl.bindBufferBase(this._gl.TRANSFORM_FEEDBACK_BUFFER,0,e?e.underlyingResource:null)},x.prototype.readTransformFeedbackBuffer=function(e){this._gl.getBufferSubData(this._gl.TRANSFORM_FEEDBACK_BUFFER,0,e)})}var q,ze=e((()=>{S(),q=!1})),Be=e((()=>{z(),z(),Ee()})),Ve=e((()=>{F(),F(),we()})),He=e((()=>{ae(),ae(),se()})),Ue=e((()=>{L(),L(),Oe()})),We=e((()=>{te(),te(),ne()})),Ge=e((()=>{T(),T(),re()})),Ke=e((()=>{k(),k(),ye()})),qe=e((()=>{B(),B(),je()})),Je=e((()=>{I(),I(),pe()})),Ye=e((()=>{D(),D(),ve()})),Xe=e((()=>{N(),N(),De()})),Ze=e((()=>{A(),A(),me()})),Qe=e((()=>{O(),O(),he()})),$e=e((()=>{ie(),ie(),oe()})),et=e((()=>{P(),P(),ge()})),tt=e((()=>{M(),M(),Ae()})),nt=e((()=>{Se(),Be(),Ve(),He(),Ue(),ke(),We(),Ge(),Ke(),Me(),qe(),Je(),Ye(),xe(),Xe(),Te(),Ze(),Qe(),$e(),et(),tt()})),J,rt=e((()=>{J=class{_isUbo(e){return e.addUniform!==void 0}constructor(e){this._isUbo(e)?(this.setMatrix3x3=e.updateMatrix3x3.bind(e),this.setMatrix2x2=e.updateMatrix2x2.bind(e),this.setFloat=e.updateFloat.bind(e),this.setFloat2=e.updateFloat2.bind(e),this.setFloat3=e.updateFloat3.bind(e),this.setFloat4=e.updateFloat4.bind(e),this.setFloatArray=e.updateFloatArray.bind(e),this.setArray=e.updateArray.bind(e),this.setIntArray=e.updateIntArray.bind(e),this.setMatrix=e.updateMatrix.bind(e),this.setMatrices=e.updateMatrices.bind(e),this.setVector3=e.updateVector3.bind(e),this.setVector4=e.updateVector4.bind(e),this.setColor3=e.updateColor3.bind(e),this.setColor4=e.updateColor4.bind(e),this.setDirectColor4=e.updateDirectColor4.bind(e),this.setInt=e.updateInt.bind(e),this.setInt2=e.updateInt2.bind(e),this.setInt3=e.updateInt3.bind(e),this.setInt4=e.updateInt4.bind(e)):(this.setMatrix3x3=e.setMatrix3x3.bind(e),this.setMatrix2x2=e.setMatrix2x2.bind(e),this.setFloat=e.setFloat.bind(e),this.setFloat2=e.setFloat2.bind(e),this.setFloat3=e.setFloat3.bind(e),this.setFloat4=e.setFloat4.bind(e),this.setFloatArray=e.setFloatArray.bind(e),this.setArray=e.setArray.bind(e),this.setIntArray=e.setIntArray.bind(e),this.setMatrix=e.setMatrix.bind(e),this.setMatrices=e.setMatrices.bind(e),this.setVector3=e.setVector3.bind(e),this.setVector4=e.setVector4.bind(e),this.setColor3=e.setColor3.bind(e),this.setColor4=e.setColor4.bind(e),this.setDirectColor4=e.setDirectColor4.bind(e),this.setInt=e.setInt.bind(e),this.setInt2=e.setInt2.bind(e),this.setInt3=e.setInt3.bind(e),this.setInt4=e.setInt4.bind(e))}}}));function it(){X||(X=!0,i(`BABYLON.WebGL2ParticleSystem`,Y))}var Y,X,Z=e((()=>{fe(),rt(),r(),ze(),Y=class{constructor(e,t){this._renderVAO=[],this._updateVAO=[],this.alignDataInBuffer=!1,Re(),this._parent=e,this._engine=t,this._updateEffectOptions={attributes:[`position`,`initialPosition`,`age`,`life`,`seed`,`size`,`color`,`direction`,`initialDirection`,`angle`,`cellIndex`,`cellStartOffset`,`noiseCoordinates1`,`noiseCoordinates2`],uniformsNames:`currentCount.timeDelta.emitterWM.lifeTime.color1.color2.sizeRange.scaleRange.gravity.emitPower.direction1.direction2.minEmitBox.maxEmitBox.radius.directionRandomizer.height.coneAngle.stopFactor.emitIndex.emitCount.angleRange.radiusRange.cellInfos.noiseStrength.limitVelocityDamping.flowMapProjection.flowMapStrength`.split(`.`),uniformBuffersNames:[],samplers:[`randomSampler`,`randomSampler2`,`sizeGradientSampler`,`angularSpeedGradientSampler`,`velocityGradientSampler`,`limitVelocityGradientSampler`,`noiseSampler`,`dragGradientSampler`,`flowMapSampler`,`meshPositionSampler`,`meshNormalSampler`],defines:``,fallbacks:null,onCompiled:null,onError:null,indexParameters:null,maxSimultaneousLights:0,transformFeedbackVaryings:[]},this._baseUniformsNamesLength=this._updateEffectOptions.uniformsNames.length}contextLost(){this._updateEffect=void 0,this._renderVAO.length=0,this._updateVAO.length=0}isUpdateBufferCreated(){return!!this._updateEffect}isUpdateBufferReady(){return this._updateEffect?.isReady()??!1}createUpdateBuffer(e){if(this._updateEffectOptions.uniformsNames.length=this._baseUniformsNamesLength,this._updateEffectOptions.transformFeedbackVaryings=[`outPosition`],this._updateEffectOptions.transformFeedbackVaryings.push(`outAge`),this._updateEffectOptions.transformFeedbackVaryings.push(`outSize`),this._updateEffectOptions.transformFeedbackVaryings.push(`outLife`),this._updateEffectOptions.transformFeedbackVaryings.push(`outSeed`),this._updateEffectOptions.transformFeedbackVaryings.push(`outDirection`),this._parent.particleEmitterType instanceof j&&this._updateEffectOptions.transformFeedbackVaryings.push(`outInitialPosition`),this._parent._colorGradientsTexture||this._updateEffectOptions.transformFeedbackVaryings.push(`outColor`),this._parent._needsInitialDirection&&this._updateEffectOptions.transformFeedbackVaryings.push(`outInitialDirection`),this._parent.noiseTexture&&(this._updateEffectOptions.transformFeedbackVaryings.push(`outNoiseCoordinates1`),this._updateEffectOptions.transformFeedbackVaryings.push(`outNoiseCoordinates2`)),this._updateEffectOptions.transformFeedbackVaryings.push(`outAngle`),this._parent.isAnimationSheetEnabled&&(this._updateEffectOptions.transformFeedbackVaryings.push(`outCellIndex`),this._parent.spriteRandomStartCell&&this._updateEffectOptions.transformFeedbackVaryings.push(`outCellStartOffset`)),this._updateEffectOptions.defines=e,e.indexOf(`ATTRACTORS`)!==-1){this._updateEffectOptions.uniformsNames.push(`attractorCount`);for(let e=0;e<this._parent.maxAttractors;e++)this._updateEffectOptions.uniformsNames.push(`attractorPositionAndStrength[`+e+`]`)}return e.indexOf(`STARTSIZEGRADIENTS`)!==-1&&this._updateEffectOptions.uniformsNames.push(`startSizeGradientFactor`),e.indexOf(`LIFETIMEGRADIENTS`)!==-1&&this._updateEffectOptions.uniformsNames.push(`lifeTimeGradientRange`),e.indexOf(`MESHEMITTER`)!==-1&&(this._updateEffectOptions.uniformsNames.push(`meshTriangleCount`),this._updateEffectOptions.uniformsNames.push(`meshTextureWidth`)),this._updateEffect=this._engine.createEffect(`gpuUpdateParticles`,this._updateEffectOptions,this._engine),new J(this._updateEffect)}createVertexBuffers(e,t){this._updateVAO.push(this._createUpdateVAO(e)),this._renderVAO.push(this._engine.recordVertexArrayObject(t,null,this._parent._getWrapper(this._parent.blendMode).effect)),this._engine.bindArrayBuffer(null),this._renderVertexBuffers=t}createParticleBuffer(e){return e}bindDrawBuffers(e,t,n){n?this._engine.bindBuffers(this._renderVertexBuffers,n,t):this._engine.bindVertexArrayObject(this._renderVAO[e],null)}preUpdateParticleBuffer(){let e=this._engine;if(this._engine.enableEffect(this._updateEffect),!e.setState)throw Error(`GPU particles cannot work without a full Engine. ThinEngine is not supported`)}updateParticleBuffer(e,t,n){this._updateEffect.setTexture(`randomSampler`,this._parent._randomTexture),this._updateEffect.setTexture(`randomSampler2`,this._parent._randomTexture2),this._parent._flowMap&&this._updateEffect.setTexture(`flowMapSampler`,this._parent._flowMap),this._parent._sizeGradientsTexture&&this._updateEffect.setTexture(`sizeGradientSampler`,this._parent._sizeGradientsTexture),this._parent._angularSpeedGradientsTexture&&this._updateEffect.setTexture(`angularSpeedGradientSampler`,this._parent._angularSpeedGradientsTexture),this._parent._velocityGradientsTexture&&this._updateEffect.setTexture(`velocityGradientSampler`,this._parent._velocityGradientsTexture),this._parent._limitVelocityGradientsTexture&&this._updateEffect.setTexture(`limitVelocityGradientSampler`,this._parent._limitVelocityGradientsTexture),this._parent._dragGradientsTexture&&this._updateEffect.setTexture(`dragGradientSampler`,this._parent._dragGradientsTexture),this._parent.noiseTexture&&this._updateEffect.setTexture(`noiseSampler`,this._parent.noiseTexture),this._parent._meshPositionTexture&&this._updateEffect.setTexture(`meshPositionSampler`,this._parent._meshPositionTexture),this._parent._meshNormalTexture&&this._updateEffect.setTexture(`meshNormalSampler`,this._parent._meshNormalTexture),this._engine.bindVertexArrayObject(this._updateVAO[e],null);let r=this._engine;r.bindTransformFeedbackBuffer(t.getBuffer()),r.setRasterizerState(!1),r.beginTransformFeedback(!0),r.drawArraysType(3,0,n),r.endTransformFeedback(),r.setRasterizerState(!0),r.bindTransformFeedbackBuffer(null)}releaseBuffers(){}releaseVertexBuffers(){for(let e=0;e<this._updateVAO.length;e++)this._engine.releaseVertexArrayObject(this._updateVAO[e]);this._updateVAO.length=0;for(let e=0;e<this._renderVAO.length;e++)this._engine.releaseVertexArrayObject(this._renderVAO[e]);this._renderVAO.length=0}_createUpdateVAO(e){let t={};t.position=e.createVertexBuffer(`position`,0,3);let n=3;t.age=e.createVertexBuffer(`age`,n,1),n+=1,t.size=e.createVertexBuffer(`size`,n,3),n+=3,t.life=e.createVertexBuffer(`life`,n,1),n+=1,t.seed=e.createVertexBuffer(`seed`,n,4),n+=4,t.direction=e.createVertexBuffer(`direction`,n,3),n+=3,this._parent.particleEmitterType instanceof j&&(t.initialPosition=e.createVertexBuffer(`initialPosition`,n,3),n+=3),this._parent._colorGradientsTexture||(t.color=e.createVertexBuffer(`color`,n,4),n+=4),this._parent._needsInitialDirection&&(t.initialDirection=e.createVertexBuffer(`initialDirection`,n,3),n+=3),this._parent.noiseTexture&&(t.noiseCoordinates1=e.createVertexBuffer(`noiseCoordinates1`,n,3),n+=3,t.noiseCoordinates2=e.createVertexBuffer(`noiseCoordinates2`,n,3),n+=3),this._parent._angularSpeedGradientsTexture?(t.angle=e.createVertexBuffer(`angle`,n,1),n+=1):(t.angle=e.createVertexBuffer(`angle`,n,2),n+=2),this._parent._isAnimationSheetEnabled&&(t.cellIndex=e.createVertexBuffer(`cellIndex`,n,1),n+=1,this._parent.spriteRandomStartCell&&(t.cellStartOffset=e.createVertexBuffer(`cellStartOffset`,n,1)));let r=this._engine.recordVertexArrayObject(t,null,this._updateEffect);return this._engine.bindArrayBuffer(null),r}},X=!1})),Q,at,ot=e((()=>{m(),Q=`gpuUpdateParticlesPixelShader`,at=`#version 300 es
void main() {discard;}
`,h.ShadersStore[Q]||(h.ShadersStore[Q]=at)})),$,st,ct=e((()=>{m(),$=`gpuUpdateParticlesVertexShader`,st=`#version 300 es
#define PI 3.14159
uniform float currentCount;uniform float timeDelta;uniform float stopFactor;uniform float emitIndex;uniform float emitCount;
#ifndef LOCAL
uniform mat4 emitterWM;
#endif
uniform vec2 lifeTime;uniform vec2 emitPower;uniform vec2 sizeRange;uniform vec4 scaleRange;
#ifdef FLOWMAP
uniform mat4 flowMapProjection;uniform float flowMapStrength;uniform sampler2D flowMapSampler;
#endif
#ifndef COLORGRADIENTS
uniform vec4 color1;uniform vec4 color2;
#endif
uniform vec3 gravity;uniform sampler2D randomSampler;uniform sampler2D randomSampler2;uniform vec4 angleRange;
#ifdef BOXEMITTER
uniform vec3 direction1;uniform vec3 direction2;uniform vec3 minEmitBox;uniform vec3 maxEmitBox;
#endif
#ifdef POINTEMITTER
uniform vec3 direction1;uniform vec3 direction2;
#endif
#ifdef HEMISPHERICEMITTER
uniform float radius;uniform float radiusRange;uniform float directionRandomizer;
#endif
#ifdef SPHEREEMITTER
uniform float radius;uniform float radiusRange;
#ifdef DIRECTEDSPHEREEMITTER
uniform vec3 direction1;uniform vec3 direction2;
#else
uniform float directionRandomizer;
#endif
#endif
#ifdef CYLINDEREMITTER
uniform float radius;uniform float height;uniform float radiusRange;
#ifdef DIRECTEDCYLINDEREMITTER
uniform vec3 direction1;uniform vec3 direction2;
#else
uniform float directionRandomizer;
#endif
#endif
#ifdef CONEEMITTER
uniform vec2 radius;uniform float coneAngle;uniform vec2 height;
#ifdef DIRECTEDCONEEMITTER
uniform vec3 direction1;uniform vec3 direction2;
#else
uniform float directionRandomizer;
#endif
#endif
in vec3 position;
#ifdef CUSTOMEMITTER
in vec3 initialPosition;
#endif
in float age;in float life;in vec4 seed;in vec3 size;
#ifndef COLORGRADIENTS
in vec4 color;
#endif
in vec3 direction;
#ifndef BILLBOARD
in vec3 initialDirection;
#endif
#ifdef ANGULARSPEEDGRADIENTS
in float angle;
#else
in vec2 angle;
#endif
#ifdef ANIMATESHEET
in float cellIndex;
#ifdef ANIMATESHEETRANDOMSTART
in float cellStartOffset;
#endif
#endif
#ifdef NOISE
in vec3 noiseCoordinates1;in vec3 noiseCoordinates2;
#endif
out vec3 outPosition;
#ifdef CUSTOMEMITTER
out vec3 outInitialPosition;
#endif
out float outAge;out float outLife;out vec4 outSeed;out vec3 outSize;
#ifndef COLORGRADIENTS
out vec4 outColor;
#endif
out vec3 outDirection;
#ifndef BILLBOARD
out vec3 outInitialDirection;
#endif
#ifdef ANGULARSPEEDGRADIENTS
out float outAngle;
#else
out vec2 outAngle;
#endif
#ifdef ANIMATESHEET
out float outCellIndex;
#ifdef ANIMATESHEETRANDOMSTART
out float outCellStartOffset;
#endif
#endif
#ifdef NOISE
out vec3 outNoiseCoordinates1;out vec3 outNoiseCoordinates2;
#endif
#ifdef SIZEGRADIENTS
uniform sampler2D sizeGradientSampler;
#endif 
#ifdef ANGULARSPEEDGRADIENTS
uniform sampler2D angularSpeedGradientSampler;
#endif 
#ifdef VELOCITYGRADIENTS
uniform sampler2D velocityGradientSampler;
#endif
#ifdef LIMITVELOCITYGRADIENTS
uniform sampler2D limitVelocityGradientSampler;uniform float limitVelocityDamping;
#endif
#ifdef DRAGGRADIENTS
uniform sampler2D dragGradientSampler;
#endif
#ifdef NOISE
uniform vec3 noiseStrength;uniform sampler2D noiseSampler;
#endif
#ifdef ANIMATESHEET
uniform vec4 cellInfos;
#endif
#ifdef ATTRACTORS
uniform int attractorCount;uniform vec4 attractorPositionAndStrength[MAX_ATTRACTORS];
#endif
#ifdef STARTSIZEGRADIENTS
uniform float startSizeGradientFactor;
#endif
#ifdef LIFETIMEGRADIENTS
uniform vec2 lifeTimeGradientRange;
#endif
#ifdef MESHEMITTER
uniform sampler2D meshPositionSampler;uniform int meshTriangleCount;uniform int meshTextureWidth;uniform vec3 direction1;uniform vec3 direction2;
#ifdef MESHNORMALS
uniform sampler2D meshNormalSampler;
#endif
#endif
vec3 getRandomVec3(float offset) {return texture(randomSampler2,vec2(float(gl_VertexID)*offset/currentCount,0)).rgb;}
vec4 getRandomVec4(float offset) {return texture(randomSampler,vec2(float(gl_VertexID)*offset/currentCount,0));}
void main() {float newAge=age+timeDelta;
#ifdef EMITRATECTRL
float particleIndex=float(gl_VertexID);float offsetFromEmitIndex=particleIndex-emitIndex;if (offsetFromEmitIndex<0.0) {offsetFromEmitIndex+=currentCount; }
bool shouldEmit=offsetFromEmitIndex<emitCount && stopFactor != 0.;
#else
bool shouldEmit=newAge>=life && stopFactor != 0.;
#endif
if (shouldEmit) {vec3 newPosition;vec3 newDirection;vec4 randoms=getRandomVec4(seed.x);outLife=lifeTime.x+(lifeTime.y-lifeTime.x)*randoms.r;
#ifdef LIFETIMEGRADIENTS
outLife=lifeTimeGradientRange.x+(lifeTimeGradientRange.y-lifeTimeGradientRange.x)*randoms.r;
#endif
#ifdef EMITRATECTRL
outAge=0.0;
#else
outAge=newAge-life;
#endif
outSeed=seed;
#ifdef SIZEGRADIENTS 
vec2 sizeGradientRange=texture(sizeGradientSampler,vec2(0,0)).rg;outSize.x=sizeGradientRange.x+(sizeGradientRange.y-sizeGradientRange.x)*seed.y;
#else
outSize.x=sizeRange.x+(sizeRange.y-sizeRange.x)*randoms.g;
#endif
outSize.y=scaleRange.x+(scaleRange.y-scaleRange.x)*randoms.b;outSize.z=scaleRange.z+(scaleRange.w-scaleRange.z)*randoms.a; 
#ifdef STARTSIZEGRADIENTS
outSize.x*=startSizeGradientFactor;
#endif
#ifndef COLORGRADIENTS
outColor=color1+(color2-color1)*randoms.b;
#endif
#ifndef ANGULARSPEEDGRADIENTS 
outAngle.y=angleRange.x+(angleRange.y-angleRange.x)*randoms.a;outAngle.x=angleRange.z+(angleRange.w-angleRange.z)*randoms.r;
#else
outAngle=angleRange.z+(angleRange.w-angleRange.z)*randoms.r;
#endif 
#ifdef POINTEMITTER
vec3 randoms2=getRandomVec3(seed.y);vec3 randoms3=getRandomVec3(seed.z);newPosition=vec3(0,0,0);newDirection=direction1+(direction2-direction1)*randoms3;
#elif defined(BOXEMITTER)
vec3 randoms2=getRandomVec3(seed.y);vec3 randoms3=getRandomVec3(seed.z);newPosition=minEmitBox+(maxEmitBox-minEmitBox)*randoms2;newDirection=direction1+(direction2-direction1)*randoms3; 
#elif defined(HEMISPHERICEMITTER)
vec3 randoms2=getRandomVec3(seed.y);vec3 randoms3=getRandomVec3(seed.z);float phi=2.0*PI*randoms2.x;float theta=acos(2.0*randoms2.y-1.0);float randX=cos(phi)*sin(theta);float randY=cos(theta);float randZ=sin(phi)*sin(theta);newPosition=(radius-(radius*radiusRange*randoms2.z))*vec3(randX,abs(randY),randZ);newDirection=newPosition+directionRandomizer*randoms3; 
#elif defined(SPHEREEMITTER)
vec3 randoms2=getRandomVec3(seed.y);vec3 randoms3=getRandomVec3(seed.z);float phi=2.0*PI*randoms2.x;float theta=acos(2.0*randoms2.y-1.0);float randX=cos(phi)*sin(theta);float randY=cos(theta);float randZ=sin(phi)*sin(theta);newPosition=(radius-(radius*radiusRange*randoms2.z))*vec3(randX,randY,randZ);
#ifdef DIRECTEDSPHEREEMITTER
newDirection=direction1+(direction2-direction1)*randoms3;
#else
newDirection=normalize(newPosition+directionRandomizer*randoms3);
#endif
#elif defined(CYLINDEREMITTER)
vec3 randoms2=getRandomVec3(seed.y);vec3 randoms3=getRandomVec3(seed.z);float yPos=(randoms2.x-0.5)*height;float angle=randoms2.y*PI*2.;float inverseRadiusRangeSquared=((1.-radiusRange)*(1.-radiusRange));float positionRadius=radius*sqrt(inverseRadiusRangeSquared+(randoms2.z*(1.-inverseRadiusRangeSquared)));float xPos=positionRadius*cos(angle);float zPos=positionRadius*sin(angle);newPosition=vec3(xPos,yPos,zPos);
#ifdef DIRECTEDCYLINDEREMITTER
newDirection=direction1+(direction2-direction1)*randoms3;
#else
angle=angle+((randoms3.x-0.5)*PI)*directionRandomizer;newDirection=vec3(cos(angle),(randoms3.y-0.5)*directionRandomizer,sin(angle));newDirection=normalize(newDirection);
#endif
#elif defined(CONEEMITTER)
vec3 randoms2=getRandomVec3(seed.y);float s=2.0*PI*randoms2.x;
#ifdef CONEEMITTERSPAWNPOINT
float h=0.0001;
#else
float h=randoms2.y*height.y;h=1.-h*h; 
#endif
float lRadius=radius.x-radius.x*randoms2.z*radius.y;lRadius=lRadius*h;float randX=lRadius*sin(s);float randZ=lRadius*cos(s);float randY=h *height.x;newPosition=vec3(randX,randY,randZ); 
vec3 randoms3=getRandomVec3(seed.z);
#ifdef DIRECTEDCONEEMITTER
newDirection=direction1+(direction2-direction1)*randoms3;
#else
if (abs(cos(coneAngle))==1.0) {newDirection=vec3(0.,1.0,0.);} else {newDirection=normalize(newPosition+directionRandomizer*randoms3); }
#endif
#elif defined(MESHEMITTER)
vec3 randoms2=getRandomVec3(seed.y);vec3 randoms3=getRandomVec3(seed.z);int triIdx=int(floor(randoms2.x*float(meshTriangleCount)));triIdx=min(triIdx,meshTriangleCount-1);int baseTexel=triIdx*3;int t0=baseTexel;int t1=baseTexel+1;int t2=baseTexel+2;vec3 v0=texelFetch(meshPositionSampler,ivec2(t0 % meshTextureWidth,t0/meshTextureWidth),0).xyz;vec3 v1=texelFetch(meshPositionSampler,ivec2(t1 % meshTextureWidth,t1/meshTextureWidth),0).xyz;vec3 v2=texelFetch(meshPositionSampler,ivec2(t2 % meshTextureWidth,t2/meshTextureWidth),0).xyz;float bu=randoms2.y;float bv=randoms2.z*(1.0-bu);float bw=1.0-bu-bv;newPosition=bu*v0+bv*v1+bw*v2;
#ifdef MESHNORMALS
vec3 n0=texelFetch(meshNormalSampler,ivec2(t0 % meshTextureWidth,t0/meshTextureWidth),0).xyz;vec3 n1=texelFetch(meshNormalSampler,ivec2(t1 % meshTextureWidth,t1/meshTextureWidth),0).xyz;vec3 n2=texelFetch(meshNormalSampler,ivec2(t2 % meshTextureWidth,t2/meshTextureWidth),0).xyz;newDirection=normalize(bu*n0+bv*n1+bw*n2);
#else
newDirection=direction1+(direction2-direction1)*randoms3;
#endif
#elif defined(CUSTOMEMITTER)
newPosition=initialPosition;outInitialPosition=initialPosition;
#else 
newPosition=vec3(0.,0.,0.);newDirection=2.0*(getRandomVec3(seed.w)-vec3(0.5,0.5,0.5));
#endif
float power=emitPower.x+(emitPower.y-emitPower.x)*randoms.a;
#ifdef LOCAL
outPosition=newPosition;
#else
outPosition=(emitterWM*vec4(newPosition,1.)).xyz;
#endif
#ifdef CUSTOMEMITTER
outDirection=direction;
#ifndef BILLBOARD 
outInitialDirection=direction;
#endif
#else
#ifdef LOCAL
vec3 initial=newDirection;
#else 
vec3 initial=(emitterWM*vec4(newDirection,0.)).xyz;
#endif
outDirection=initial*power;
#ifndef BILLBOARD 
outInitialDirection=initial;
#endif
#endif
#ifdef ANIMATESHEET 
outCellIndex=cellInfos.x;
#ifdef ANIMATESHEETRANDOMSTART
outCellStartOffset=randoms.a*outLife;
#endif 
#endif
#ifdef NOISE
outNoiseCoordinates1=noiseCoordinates1;outNoiseCoordinates2=noiseCoordinates2;
#endif
} else {float directionScale=timeDelta;outAge=newAge;float ageGradient=newAge/life;
#ifdef VELOCITYGRADIENTS
vec2 velocityGradientRange=texture(velocityGradientSampler,vec2(ageGradient,0)).rg;directionScale*=velocityGradientRange.x+(velocityGradientRange.y-velocityGradientRange.x)*seed.w;
#endif
#ifdef DRAGGRADIENTS
vec2 dragGradientRange=texture(dragGradientSampler,vec2(ageGradient,0)).rg;directionScale*=1.0-(dragGradientRange.x+(dragGradientRange.y-dragGradientRange.x)*seed.x);
#endif
#if defined(CUSTOMEMITTER)
outPosition=position+(direction-position)*ageGradient; 
outInitialPosition=initialPosition;
#else
outPosition=position+direction*directionScale;
#endif
outLife=life;outSeed=seed;
#ifndef COLORGRADIENTS 
outColor=color;
#endif
#ifdef SIZEGRADIENTS
vec2 sizeGradientRange=texture(sizeGradientSampler,vec2(ageGradient,0)).rg;outSize.x=sizeGradientRange.x+(sizeGradientRange.y-sizeGradientRange.x)*seed.y;outSize.yz=size.yz;
#else
outSize=size;
#endif 
#ifndef BILLBOARD 
outInitialDirection=initialDirection;
#endif
#ifdef CUSTOMEMITTER
outDirection=direction;
#else
vec3 updatedDirection=direction+gravity*timeDelta;
#ifdef FLOWMAP
vec4 clipSpace=(flowMapProjection*vec4(position,1.));vec3 ndcSpace=clipSpace.xyz/clipSpace.w;vec2 flowMapUV=ndcSpace.xy*0.5+0.5;vec4 flowMapValue=texture(flowMapSampler,flowMapUV);vec3 flowMapDirection=(flowMapValue.xyz*2.0-1.0)*flowMapValue.w;updatedDirection+=flowMapDirection*timeDelta*flowMapStrength;
#endif
#ifdef LIMITVELOCITYGRADIENTS
vec2 limitVelocityRange=texture(limitVelocityGradientSampler,vec2(ageGradient,0)).rg;float limitVelocity=limitVelocityRange.x+(limitVelocityRange.y-limitVelocityRange.x)*seed.y;float currentVelocity=length(updatedDirection);if (currentVelocity>limitVelocity) {updatedDirection=updatedDirection*limitVelocityDamping;}
#endif
#ifdef ATTRACTORS
{for (int i=0; i<attractorCount; i++) {vec3 toAttractor=attractorPositionAndStrength[i].xyz-outPosition;float distSq=dot(toAttractor,toAttractor)+1.0;updatedDirection+=(attractorPositionAndStrength[i].w/distSq)*normalize(toAttractor)*timeDelta;}}
#endif
outDirection=updatedDirection;
#ifdef NOISE
float fetchedR=texture(noiseSampler,vec2(noiseCoordinates1.x,noiseCoordinates1.y)*vec2(0.5)+vec2(0.5)).r;float fetchedG=texture(noiseSampler,vec2(noiseCoordinates1.z,noiseCoordinates2.x)*vec2(0.5)+vec2(0.5)).r;float fetchedB=texture(noiseSampler,vec2(noiseCoordinates2.y,noiseCoordinates2.z)*vec2(0.5)+vec2(0.5)).r;vec3 force=vec3(2.*fetchedR-1.,2.*fetchedG-1.,2.*fetchedB-1.)*noiseStrength;outDirection=outDirection+force*timeDelta;outNoiseCoordinates1=noiseCoordinates1;outNoiseCoordinates2=noiseCoordinates2;
#endif 
#endif 
#ifdef ANGULARSPEEDGRADIENTS
vec2 angularSpeedRange=texture(angularSpeedGradientSampler,vec2(ageGradient,0)).rg;float angularSpeed=angularSpeedRange.x+(angularSpeedRange.y-angularSpeedRange.x)*seed.z;outAngle=angle+angularSpeed*timeDelta;
#else
outAngle=vec2(angle.x+angle.y*timeDelta,angle.y);
#endif
#ifdef ANIMATESHEET 
float offsetAge=outAge;float dist=cellInfos.y-cellInfos.x;
#ifdef ANIMATESHEETRANDOMSTART
outCellStartOffset=cellStartOffset;offsetAge+=cellStartOffset;
#else
float cellStartOffset=0.;
#endif 
float ratio=0.;if (cellInfos.w==1.0) {ratio=clamp(mod(cellStartOffset+cellInfos.z*offsetAge,life)/life,0.,1.0);}
else {ratio=clamp(cellStartOffset+cellInfos.z*offsetAge/life,0.,1.0);}
outCellIndex=float(int(cellInfos.x+ratio*dist));
#endif
}}`,h.ShadersStore[$]||(h.ShadersStore[$]=st)})),lt=e((()=>{Z(),ot(),ct(),Z(),it()})),ut=e((()=>{})),dt=e((()=>{ut(),R(),_e(),R(),Ce(be)}));export{K as A,Ve as C,Le as D,ze as E,V as F,Ne as I,Fe as M,H as N,W as O,Pe as P,He as S,Re as T,qe as _,Z as a,We as b,nt as c,$e as d,Qe as f,Je as g,Ye as h,Y as i,U as j,Ie as k,tt as l,Xe as m,lt as n,J as o,Ze as p,it as r,rt as s,dt as t,et as u,Ke as v,Be as w,Ue as x,Ge as y};