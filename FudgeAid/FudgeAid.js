"use strict";
///<reference types="../../Core/Build/FudgeCore"/>
var ƒ = FudgeCore;
var ƒAid = FudgeAid;
var FudgeAid;
(function (FudgeAid) {
    ƒ.Serializer.registerNamespace(FudgeAid);
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Abstract class supporting versious arithmetical helper functions
     */
    class Arith {
        /**
         * Returns one of the values passed in, either _value if within _min and _max or the boundary being exceeded by _value
         */
        static clamp(_value, _min, _max, _isSmaller = (_value1, _value2) => { return _value1 < _value2; }) {
            if (_isSmaller(_value, _min))
                return _min;
            if (_isSmaller(_max, _value))
                return _max;
            return _value;
        }
    }
    FudgeAid.Arith = Arith;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Within a given precision, an object of this class finds the parameter value at which a given function
     * switches its boolean return value using interval splitting (bisection).
     * Pass the type of the parameter and the type the precision is measured in.
     */
    class ArithBisection {
        /**
         * Creates a new Solver
         * @param _function A function that takes an argument of the generic type <Parameter> and returns a boolean value.
         * @param _divide A function splitting the interval to find a parameter for the next iteration, may simply be the arithmetic mean
         * @param _isSmaller A function that determines a difference between the borders of the current interval and compares this to the given precision
         */
        constructor(_function, _divide, _isSmaller) {
            this.function = _function;
            this.divide = _divide;
            this.isSmaller = _isSmaller;
        }
        /**
         * Finds a solution with the given precision in the given interval using the functions this Solver was constructed with.
         * After the method returns, find the data in this objects properties.
         * @param _left The parameter on one side of the interval.
         * @param _right The parameter on the other side, may be "smaller" than [[_left]].
         * @param _epsilon The desired precision of the solution.
         * @param _leftValue The value on the left side of the interval, omit if yet unknown or pass in if known for better performance.
         * @param _rightValue The value on the right side of the interval, omit if yet unknown or pass in if known for better performance.
         * @throws Error if both sides of the interval return the same value.
         */
        solve(_left, _right, _epsilon, _leftValue = undefined, _rightValue = undefined) {
            this.left = _left;
            this.leftValue = _leftValue || this.function(_left);
            this.right = _right;
            this.rightValue = _rightValue || this.function(_right);
            if (this.isSmaller(_left, _right, _epsilon))
                return;
            if (this.leftValue == this.rightValue)
                throw (new Error("Interval solver can't operate with identical function values on both sides of the interval"));
            let between = this.divide(_left, _right);
            let betweenValue = this.function(between);
            if (betweenValue == this.leftValue)
                this.solve(between, this.right, _epsilon, betweenValue, this.rightValue);
            else
                this.solve(this.left, between, _epsilon, this.leftValue, betweenValue);
        }
        toString() {
            let out = "";
            out += `left: ${this.left.toString()} -> ${this.leftValue}`;
            out += "\n";
            out += `right: ${this.right.toString()} -> ${this.rightValue}`;
            return out;
        }
    }
    FudgeAid.ArithBisection = ArithBisection;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        constructor(_cmpCamera, _distanceStart = 2, _maxRotX = 75, _minDistance = 1, _maxDistance = 10) {
            super("CameraOrbit");
            this.axisRotateX = new ƒ.Axis("RotateX", 1, 0 /* PROPORTIONAL */, true);
            this.axisRotateY = new ƒ.Axis("RotateY", 1, 0 /* PROPORTIONAL */, true);
            this.axisDistance = new ƒ.Axis("Distance", 1, 0 /* PROPORTIONAL */, true);
            this.hndAxisOutput = (_event) => {
                let output = _event.detail.output;
                switch (_event.target.name) {
                    case "RotateX":
                        this.rotateX(output);
                        break;
                    case "RotateY":
                        this.rotateY(output);
                        break;
                    case "Distance":
                        this.distance += output;
                }
            };
            this.maxRotX = Math.min(_maxRotX, 89);
            this.minDistance = _minDistance;
            this.maxDistance = _maxDistance;
            let cmpTransform = new ƒ.ComponentTransform();
            this.addComponent(cmpTransform);
            this.rotatorX = new ƒ.Node("CameraRotationX");
            this.rotatorX.addComponent(new ƒ.ComponentTransform());
            this.addChild(this.rotatorX);
            this.translator = new ƒ.Node("CameraTranslate");
            this.translator.addComponent(new ƒ.ComponentTransform());
            this.translator.mtxLocal.rotateY(180);
            this.rotatorX.addChild(this.translator);
            this.translator.addComponent(_cmpCamera);
            this.distance = _distanceStart;
            this.axisRotateX.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisRotateY.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisDistance.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
        }
        get cmpCamera() {
            return this.translator.getComponent(ƒ.ComponentCamera);
        }
        get nodeCamera() {
            return this.translator;
        }
        set distance(_distance) {
            let newDistance = Math.min(this.maxDistance, Math.max(this.minDistance, _distance));
            this.translator.mtxLocal.translation = ƒ.Vector3.Z(newDistance);
        }
        get distance() {
            return this.translator.mtxLocal.translation.z;
        }
        set rotationY(_angle) {
            this.mtxLocal.rotation = ƒ.Vector3.Y(_angle);
        }
        get rotationY() {
            return this.mtxLocal.rotation.y;
        }
        set rotationX(_angle) {
            _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
            this.rotatorX.mtxLocal.rotation = ƒ.Vector3.X(_angle);
        }
        get rotationX() {
            return this.rotatorX.mtxLocal.rotation.x;
        }
        rotateY(_delta) {
            this.mtxLocal.rotateY(_delta);
        }
        rotateX(_delta) {
            this.rotationX = this.rotatorX.mtxLocal.rotation.x + _delta;
        }
        // set position of camera component relative to the center of orbit
        positionCamera(_posWorld) {
            let difference = ƒ.Vector3.DIFFERENCE(_posWorld, this.mtxWorld.translation);
            let geo = difference.geo;
            this.rotationY = geo.longitude;
            this.rotationX = -geo.latitude;
            this.distance = geo.magnitude;
        }
    }
    FudgeAid.CameraOrbit = CameraOrbit;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class CameraOrbitMovingFocus extends FudgeAid.CameraOrbit {
        constructor(_cmpCamera, _distanceStart = 5, _maxRotX = 85, _minDistance = 0, _maxDistance = Infinity) {
            super(_cmpCamera, _distanceStart, _maxRotX, _minDistance, _maxDistance);
            this.axisTranslateX = new ƒ.Axis("TranslateX", 1, 0 /* PROPORTIONAL */, true);
            this.axisTranslateY = new ƒ.Axis("TranslateY", 1, 0 /* PROPORTIONAL */, true);
            this.axisTranslateZ = new ƒ.Axis("TranslateZ", 1, 0 /* PROPORTIONAL */, true);
            this.hndAxisOutput = (_event) => {
                let output = _event.detail.output;
                switch (_event.target.name) {
                    case "TranslateX":
                        this.translateX(output);
                        break;
                    case "TranslateY":
                        this.translateY(output);
                        break;
                    case "TranslateZ":
                        this.translateZ(output);
                }
            };
            this.name = "CameraOrbitMovingFocus";
            this.axisTranslateX.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisTranslateY.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisTranslateZ.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
        }
        translateX(_delta) {
            this.mtxLocal.translateX(_delta);
        }
        translateY(_delta) {
            let translation = this.rotatorX.mtxWorld.getY();
            translation.normalize(_delta);
            this.mtxLocal.translate(translation, false);
        }
        translateZ(_delta) {
            // this.mtxLocal.translateZ(_delta);
            let translation = this.rotatorX.mtxWorld.getZ();
            translation.normalize(_delta);
            this.mtxLocal.translate(translation, false);
        }
    }
    FudgeAid.CameraOrbitMovingFocus = CameraOrbitMovingFocus;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    let IMAGE_RENDERING;
    (function (IMAGE_RENDERING) {
        IMAGE_RENDERING["AUTO"] = "auto";
        IMAGE_RENDERING["SMOOTH"] = "smooth";
        IMAGE_RENDERING["HIGH_QUALITY"] = "high-quality";
        IMAGE_RENDERING["CRISP_EDGES"] = "crisp-edges";
        IMAGE_RENDERING["PIXELATED"] = "pixelated";
    })(IMAGE_RENDERING = FudgeAid.IMAGE_RENDERING || (FudgeAid.IMAGE_RENDERING = {}));
    /**
     * Adds comfort methods to create a render canvas
     */
    class Canvas {
        static create(_fillParent = true, _imageRendering = IMAGE_RENDERING.AUTO, _width = 800, _height = 600) {
            let canvas = document.createElement("canvas");
            canvas.id = "FUDGE";
            let style = canvas.style;
            style.imageRendering = _imageRendering;
            style.width = _width + "px";
            style.height = _height + "px";
            style.marginBottom = "-0.25em";
            if (_fillParent) {
                style.width = "100%";
                style.height = "100%";
            }
            return canvas;
        }
    }
    FudgeAid.Canvas = Canvas;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class Node extends ƒ.Node {
        constructor(_name = Node.getNextName(), _transform, _material, _mesh) {
            super(_name);
            if (_transform)
                this.addComponent(new ƒ.ComponentTransform(_transform));
            if (_material)
                this.addComponent(new ƒ.ComponentMaterial(_material));
            if (_mesh)
                this.addComponent(new ƒ.ComponentMesh(_mesh));
        }
        static getNextName() {
            return "ƒAidNode_" + Node.count++;
        }
        get mtxMeshPivot() {
            let cmpMesh = this.getComponent(ƒ.ComponentMesh);
            return cmpMesh ? cmpMesh.mtxPivot : null;
        }
        async deserialize(_serialization) {
            // Quick and maybe hacky solution. Created node is completely dismissed and a recreation of the baseclass gets return. Otherwise, components will be doubled...
            let node = new ƒ.Node(_serialization.name);
            await node.deserialize(_serialization);
            // console.log(node);
            return node;
        }
    }
    Node.count = 0;
    FudgeAid.Node = Node;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeArrow extends FudgeAid.Node {
        constructor(_name, _color) {
            super(_name, ƒ.Matrix4x4.IDENTITY());
            let shaft = new FudgeAid.Node(_name + "Shaft", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Shaft"));
            let head = new FudgeAid.Node(_name + "Head", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Head"));
            shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 0.01, 1));
            head.mtxLocal.translateZ(0.5);
            head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.05, 0.1));
            head.mtxLocal.rotateX(90);
            shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            head.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            this.addChild(shaft);
            this.addChild(head);
        }
        static createInternalResources() {
            let map = new Map();
            map.set("Shaft", new ƒ.MeshCube("ArrowShaft"));
            map.set("Head", new ƒ.MeshPyramid("ArrowHead"));
            let coat = new ƒ.CoatColored(ƒ.Color.CSS("white"));
            map.set("Material", new ƒ.Material("Arrow", ƒ.ShaderUniColor, coat));
            map.forEach((_resource) => ƒ.Project.deregister(_resource));
            return map;
        }
        set color(_color) {
            for (let child of this.getChildren()) {
                child.getComponent(ƒ.ComponentMaterial).clrPrimary.copy(_color);
            }
        }
    }
    NodeArrow.internalResources = NodeArrow.createInternalResources();
    FudgeAid.NodeArrow = NodeArrow;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeCoordinateSystem extends FudgeAid.Node {
        constructor(_name = "CoordinateSystem", _transform) {
            super(_name, _transform);
            let arrowRed = new FudgeAid.NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
            let arrowGreen = new FudgeAid.NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
            let arrowBlue = new FudgeAid.NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));
            arrowRed.mtxLocal.rotateY(90);
            arrowGreen.mtxLocal.rotateX(-90);
            this.addChild(arrowRed);
            this.addChild(arrowGreen);
            this.addChild(arrowBlue);
        }
    }
    FudgeAid.NodeCoordinateSystem = NodeCoordinateSystem;
})(FudgeAid || (FudgeAid = {}));
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeAid;
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeAid) {
    var ƒ = FudgeCore;
    /**
     * Adds a light setup to the node given, consisting of an ambient light, a directional key light and a directional back light.
     * Exept of the node to become the container, all parameters are optional and provided default values for general purpose.
     */
    function addStandardLightComponents(_node, _clrAmbient = new ƒ.Color(0.2, 0.2, 0.2), _clrKey = new ƒ.Color(0.9, 0.9, 0.9), _clrBack = new ƒ.Color(0.6, 0.6, 0.6), _posKey = new ƒ.Vector3(4, 12, 8), _posBack = new ƒ.Vector3(-1, -0.5, -3)) {
        let key = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrKey));
        key.mtxPivot.translate(_posKey);
        key.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        let back = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrBack));
        back.mtxPivot.translate(_posBack);
        back.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        let ambient = new ƒ.ComponentLight(new ƒ.LightAmbient(_clrAmbient));
        _node.addComponent(key);
        _node.addComponent(back);
        _node.addComponent(ambient);
    }
    FudgeAid.addStandardLightComponents = addStandardLightComponents;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Handles the animation cycle of a sprite on a [[Node]]
     */
    class NodeSprite extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.framerate = 12; // animation frames per second, single frames can be shorter or longer based on their timescale
            this.frameCurrent = 0;
            this.direction = 1;
            /**
             * Show the next frame of the sequence or start anew when the end or the start was reached, according to the direction of playing
             */
            this.showFrameNext = (_event) => {
                this.frameCurrent = (this.frameCurrent + this.direction + this.animation.frames.length) % this.animation.frames.length;
                this.showFrame(this.frameCurrent);
            };
            this.cmpMesh = new ƒ.ComponentMesh(NodeSprite.mesh);
            // Define coat from the SpriteSheet to use when rendering
            this.cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderTexture, null));
            this.addComponent(this.cmpMesh);
            this.addComponent(this.cmpMaterial);
        }
        static createInternalResource() {
            let mesh = new ƒ.MeshSprite("Sprite");
            ƒ.Project.deregister(mesh);
            return mesh;
        }
        setAnimation(_animation) {
            this.animation = _animation;
            if (this.timer)
                ƒ.Time.game.deleteTimer(this.timer);
            this.showFrame(0);
        }
        /**
         * Show a specific frame of the sequence
         */
        showFrame(_index) {
            let spriteFrame = this.animation.frames[_index];
            this.cmpMesh.mtxPivot = spriteFrame.mtxPivot;
            this.cmpMaterial.mtxPivot = spriteFrame.mtxTexture;
            this.cmpMaterial.material.setCoat(this.animation.spritesheet);
            this.frameCurrent = _index;
            this.timer = ƒ.Time.game.setTimer(spriteFrame.timeScale * 1000 / this.framerate, 1, this.showFrameNext);
        }
        /**
         * Sets the direction for animation playback, negativ numbers make it play backwards.
         */
        setFrameDirection(_direction) {
            this.direction = Math.floor(_direction);
        }
    }
    NodeSprite.mesh = NodeSprite.createInternalResource();
    FudgeAid.NodeSprite = NodeSprite;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    /**
     * Describes a single frame of a sprite animation
     */
    class SpriteFrame {
    }
    FudgeAid.SpriteFrame = SpriteFrame;
    /**
     * Convenience for creating a [[CoatTexture]] to use as spritesheet
     */
    function createSpriteSheet(_name, _image) {
        let coat = new ƒ.CoatTextured();
        coat.name = _name;
        let texture = new ƒ.TextureImage();
        texture.image = _image;
        coat.texture = texture;
        return coat;
    }
    FudgeAid.createSpriteSheet = createSpriteSheet;
    /**
     * Handles a series of [[SpriteFrame]]s to be mapped onto a [[MeshSprite]]
     * Contains the [[MeshSprite]], the [[Material]] and the spritesheet-texture
     */
    class SpriteSheetAnimation {
        constructor(_name, _spritesheet) {
            this.frames = [];
            this.name = _name;
            this.spritesheet = _spritesheet;
        }
        /**
         * Stores a series of frames in this [[Sprite]], calculating the matrices to use in the components of a [[NodeSprite]]
         */
        generate(_rects, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            this.frames = [];
            let framing = new ƒ.FramingScaled();
            framing.setScale(1 / img.width, 1 / img.height);
            let count = 0;
            for (let rect of _rects) {
                let frame = this.createFrame(this.name + `${count}`, framing, rect, _resolutionQuad, _origin);
                frame.timeScale = 1;
                this.frames.push(frame);
                count++;
            }
        }
        /**
         * Add sprite frames using a grid on the spritesheet defined by a rectangle to start with, the number of frames,
         * the resolution which determines the size of the sprites mesh based on the number of pixels of the texture frame,
         * the offset from one cell of the grid to the next in the sequence and, in case the sequence spans over more than one row or column,
         * the offset to move the start rectangle when the margin of the texture is reached and wrapping occurs.
         */
        generateByGrid(_startRect, _frames, _resolutionQuad, _origin, _offsetNext, _offsetWrap = ƒ.Vector2.ZERO()) {
            let img = this.spritesheet.texture.texImageSource;
            let rectImage = new ƒ.Rectangle(0, 0, img.width, img.height);
            let rect = _startRect.copy;
            let rects = [];
            while (_frames--) {
                rects.push(rect.copy);
                rect.position.add(_offsetNext);
                if (rectImage.covers(rect))
                    continue;
                _startRect.position.add(_offsetWrap);
                rect = _startRect.copy;
                if (!rectImage.covers(rect))
                    break;
            }
            rects.forEach((_rect) => ƒ.Debug.log(_rect.toString()));
            this.generate(rects, _resolutionQuad, _origin);
        }
        createFrame(_name, _framing, _rect, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            let rectTexture = new ƒ.Rectangle(0, 0, img.width, img.height);
            let frame = new SpriteFrame();
            frame.rectTexture = _framing.getRect(_rect);
            frame.rectTexture.position = _framing.getPoint(_rect.position, rectTexture);
            let rectQuad = new ƒ.Rectangle(0, 0, _rect.width / _resolutionQuad, _rect.height / _resolutionQuad, _origin);
            frame.mtxPivot = ƒ.Matrix4x4.IDENTITY();
            frame.mtxPivot.translate(new ƒ.Vector3(rectQuad.position.x + rectQuad.size.x / 2, -rectQuad.position.y - rectQuad.size.y / 2, 0));
            frame.mtxPivot.scaleX(rectQuad.size.x);
            frame.mtxPivot.scaleY(rectQuad.size.y);
            // ƒ.Debug.log(rectQuad.toString());
            frame.mtxTexture = ƒ.Matrix3x3.IDENTITY();
            frame.mtxTexture.translate(frame.rectTexture.position);
            frame.mtxTexture.scale(frame.rectTexture.size);
            return frame;
        }
    }
    FudgeAid.SpriteSheetAnimation = SpriteSheetAnimation;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class ComponentStateMachine extends ƒ.ComponentScript {
        transit(_next) {
            this.instructions.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.instructions.act(this.stateCurrent, this);
        }
    }
    FudgeAid.ComponentStateMachine = ComponentStateMachine;
})(FudgeAid || (FudgeAid = {}));
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
var FudgeAid;
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
(function (FudgeAid) {
    /**
     * Core functionality of the state machine, holding solely the current state and, while in transition, the next state,
     * the instructions for the machine and comfort methods to transit and act.
     */
    class StateMachine {
        transit(_next) {
            this.instructions.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.instructions.act(this.stateCurrent, this);
        }
    }
    FudgeAid.StateMachine = StateMachine;
    /**
     * Set of instructions for a state machine. The set keeps all methods for dedicated actions defined for the states
     * and all dedicated methods defined for transitions to other states, as well as default methods.
     * Instructions exist independently from StateMachines. A statemachine instance is passed as parameter to the instruction set.
     * Multiple statemachine-instances can thus use the same instruction set and different instruction sets could operate on the same statemachine.
     */
    class StateMachineInstructions extends Map {
        /** Define dedicated transition method to transit from one state to another*/
        setTransition(_current, _next, _transition) {
            let active = this.getStateMethods(_current);
            active.transitions.set(_next, _transition);
        }
        /** Define dedicated action method for a state */
        setAction(_current, _action) {
            let active = this.getStateMethods(_current);
            active.action = _action;
        }
        /** Default transition method to invoke if no dedicated transition exists, should be overriden in subclass */
        transitDefault(_machine) {
            //
        }
        /** Default action method to invoke if no dedicated action exists, should be overriden in subclass */
        actDefault(_machine) {
            //
        }
        /** Invoke a dedicated transition method if found for the current and the next state, or the default method */
        transit(_current, _next, _machine) {
            _machine.stateNext = _next;
            try {
                let active = this.get(_current);
                let transition = active.transitions.get(_next);
                transition(_machine);
            }
            catch (_error) {
                // console.info(_error.message);
                this.transitDefault(_machine);
            }
            finally {
                _machine.stateCurrent = _next;
                _machine.stateNext = undefined;
            }
        }
        /** Invoke the dedicated action method if found for the current state, or the default method */
        act(_current, _machine) {
            try {
                let active = this.get(_current);
                active.action(_machine);
            }
            catch (_error) {
                // console.info(_error.message);
                this.actDefault(_machine);
            }
        }
        /** Find the instructions dedicated for the current state or create an empty set for it */
        getStateMethods(_current) {
            let active = this.get(_current);
            if (!active) {
                active = { action: null, transitions: new Map() };
                this.set(_current, active);
            }
            return active;
        }
    }
    FudgeAid.StateMachineInstructions = StateMachineInstructions;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    class Viewport {
        static expandCameraToInteractiveOrbit(_viewport, _showFocus = true, _speedCameraRotation = 1, _speedCameraTranslation = 0.01, _speedCameraDistance = 0.001) {
            _viewport.setFocus(true);
            _viewport.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
            _viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
            _viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
            _viewport.addEventListener("\u0192pointerdown" /* DOWN */, hndPointerDown);
            _viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
            _viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
            let cntMouseHorizontal = new ƒ.Control("MouseHorizontal");
            let cntMouseVertical = new ƒ.Control("MouseVertical");
            // camera setup
            let camera;
            camera = new FudgeAid.CameraOrbitMovingFocus(_viewport.camera, 5, 85, 0.01, 1000);
            _viewport.camera.projectCentral(_viewport.camera.getAspect(), _viewport.camera.getFieldOfView(), _viewport.camera.getDirection(), 0.01, 1000);
            // yset up axis to control
            camera.axisRotateX.addControl(cntMouseVertical);
            camera.axisRotateX.setFactor(_speedCameraRotation);
            camera.axisRotateY.addControl(cntMouseHorizontal);
            camera.axisRotateY.setFactor(_speedCameraRotation);
            // _viewport.getBranch().addChild(camera);
            let focus;
            if (_showFocus) {
                focus = new FudgeAid.NodeCoordinateSystem("Focus");
                focus.addComponent(new ƒ.ComponentTransform());
                _viewport.getBranch().addChild(focus);
            }
            redraw();
            return camera;
            function hndPointerMove(_event) {
                if (!_event.buttons)
                    return;
                let posCamera = camera.nodeCamera.mtxWorld.translation.copy;
                cntMouseHorizontal.setInput(_event.movementX);
                cntMouseVertical.setInput(_event.movementY);
                ƒ.Render.prepare(camera);
                if (_event.altKey || _event.buttons == 4) {
                    let offset = ƒ.Vector3.DIFFERENCE(posCamera, camera.nodeCamera.mtxWorld.translation);
                    camera.mtxLocal.translate(offset, false);
                }
                redraw();
            }
            function hndPointerDown(_event) {
                let pos = new ƒ.Vector2(_event.canvasX, _event.canvasY);
                let picks = ƒ.Picker.pickViewport(_viewport, pos);
                if (picks.length == 0)
                    return;
                picks.sort((_a, _b) => _a.zBuffer < _b.zBuffer ? -1 : 1);
                let posCamera = camera.nodeCamera.mtxWorld.translation;
                camera.mtxLocal.translation = picks[0].posWorld;
                ƒ.Render.prepare(camera);
                camera.positionCamera(posCamera);
                redraw();
            }
            function hndWheelMove(_event) {
                camera.distance *= 1 + (_event.deltaY * _speedCameraDistance);
                redraw();
            }
            function redraw() {
                if (focus)
                    focus.mtxLocal.translation = camera.mtxLocal.translation;
                ƒ.Render.prepare(camera);
                _viewport.draw();
            }
        }
    }
    FudgeAid.Viewport = Viewport;
})(FudgeAid || (FudgeAid = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VBaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvUmVmZXJlbmNlcy50cyIsIi4uL1NvdXJjZS9Bcml0aG1ldGljL0FyaXRoLnRzIiwiLi4vU291cmNlL0FyaXRobWV0aWMvQXJpdGhCaXNlY3Rpb24udHMiLCIuLi9Tb3VyY2UvQ2FtZXJhL0NhbWVyYU9yYml0LnRzIiwiLi4vU291cmNlL0NhbWVyYS9DYW1lcmFPcmJpdE1vdmluZ0ZvY3VzLnRzIiwiLi4vU291cmNlL0NhbnZhcy9DYW52YXMudHMiLCIuLi9Tb3VyY2UvR2VvbWV0cnkvTm9kZS50cyIsIi4uL1NvdXJjZS9HZW9tZXRyeS9Ob2RlQXJyb3cudHMiLCIuLi9Tb3VyY2UvR2VvbWV0cnkvTm9kZUNvb3JkaW5hdGVTeXN0ZW0udHMiLCIuLi9Tb3VyY2UvTGlnaHQvTm9kZUxpZ2h0U2V0dXAudHMiLCIuLi9Tb3VyY2UvU3ByaXRlL05vZGVTcHJpdGUudHMiLCIuLi9Tb3VyY2UvU3ByaXRlL1Nwcml0ZVNoZWV0QW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL1N0YXRlTWFjaGluZS9Db21wb25lbnRTdGF0ZU1hY2hpbmUudHMiLCIuLi9Tb3VyY2UvU3RhdGVNYWNoaW5lL1N0YXRlTWFjaGluZS50cyIsIi4uL1NvdXJjZS9WaWV3cG9ydC9WaWV3cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0RBQWtEO0FBQ2xELElBQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNyQixJQUFPLElBQUksR0FBRyxRQUFRLENBQUM7QUFDdkIsSUFBVSxRQUFRLENBRWpCO0FBRkQsV0FBVSxRQUFRO0lBQ2hCLENBQUMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxFQUZTLFFBQVEsS0FBUixRQUFRLFFBRWpCO0FDTEQsSUFBVSxRQUFRLENBZWpCO0FBZkQsV0FBVSxRQUFRO0lBQ2hCOztPQUVHO0lBQ0gsTUFBc0IsS0FB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QUssQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUU1RSxJQUFJLFFBQVEsR0FBZ0IsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBRyxlQUFlLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUgsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsb0NBQW9DO1lBRXBDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0MsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFD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T0FBTztnQkFDVCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpFLElBQUksU0FBUyxHQUFjLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztnQkFDbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pCLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELFNBQVMsWUFBWSxDQUFDLE1BQWtCO2dCQUN0QyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztnQkFDOUQsTUFBTSxFQUFFLENBQUM7WUFDWCxDQUFDO1lBRUQsU0FBUyxNQUFNO2dCQUNiLElBQUksS0FBSztvQkFDUCxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztnQkFDM0QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pCLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQixDQUFDO1FBQ0gsQ0FBQztLQUNGO0lBbEZZLGlCQUFRLFdBa0ZwQixDQUFBO0FBQ0gsQ0FBQyxFQXBGUyxRQUFRLEtBQVIsUUFBUSxRQW9GakIiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHR5cGVzPVwiLi4vLi4vQ29yZS9CdWlsZC9GdWRnZUNvcmVcIi8+XHJcbmltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuaW1wb3J0IMaSQWlkID0gRnVkZ2VBaWQ7XHJcbm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgxpIuU2VyaWFsaXplci5yZWdpc3Rlck5hbWVzcGFjZShGdWRnZUFpZCk7XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIC8qKlxyXG4gICAqIEFic3RyYWN0IGNsYXNzIHN1cHBvcnRpbmcgdmVyc2lvdXMgYXJpdGhtZXRpY2FsIGhlbHBlciBmdW5jdGlvbnNcclxuICAgKi9cclxuICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQXJpdGgge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBvbmUgb2YgdGhlIHZhbHVlcyBwYXNzZWQgaW4sIGVpdGhlciBfdmFsdWUgaWYgd2l0aGluIF9taW4gYW5kIF9tYXggb3IgdGhlIGJvdW5kYXJ5IGJlaW5nIGV4Y2VlZGVkIGJ5IF92YWx1ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYW1wPFQ+KF92YWx1ZTogVCwgX21pbjogVCwgX21heDogVCwgX2lzU21hbGxlcjogKF92YWx1ZTE6IFQsIF92YWx1ZTI6IFQpID0+IGJvb2xlYW4gPSAoX3ZhbHVlMTogVCwgX3ZhbHVlMjogVCkgPT4geyByZXR1cm4gX3ZhbHVlMSA8IF92YWx1ZTI7IH0pOiBUIHtcclxuICAgICAgaWYgKF9pc1NtYWxsZXIoX3ZhbHVlLCBfbWluKSkgcmV0dXJuIF9taW47XHJcbiAgICAgIGlmIChfaXNTbWFsbGVyKF9tYXgsIF92YWx1ZSkpIHJldHVybiBfbWF4O1xyXG4gICAgICByZXR1cm4gX3ZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgLyoqXHJcbiAgICogV2l0aGluIGEgZ2l2ZW4gcHJlY2lzaW9uLCBhbiBvYmplY3Qgb2YgdGhpcyBjbGFzcyBmaW5kcyB0aGUgcGFyYW1ldGVyIHZhbHVlIGF0IHdoaWNoIGEgZ2l2ZW4gZnVuY3Rpb24gXHJcbiAgICogc3dpdGNoZXMgaXRzIGJvb2xlYW4gcmV0dXJuIHZhbHVlIHVzaW5nIGludGVydmFsIHNwbGl0dGluZyAoYmlzZWN0aW9uKS4gXHJcbiAgICogUGFzcyB0aGUgdHlwZSBvZiB0aGUgcGFyYW1ldGVyIGFuZCB0aGUgdHlwZSB0aGUgcHJlY2lzaW9uIGlzIG1lYXN1cmVkIGluLlxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBBcml0aEJpc2VjdGlvbjxQYXJhbWV0ZXIsIEVwc2lsb24+IHtcclxuICAgIC8qKiBUaGUgbGVmdCBib3JkZXIgb2YgdGhlIGludGVydmFsIGZvdW5kICovXHJcbiAgICBwdWJsaWMgbGVmdDogUGFyYW1ldGVyO1xyXG4gICAgLyoqIFRoZSByaWdodCBib3JkZXIgb2YgdGhlIGludGVydmFsIGZvdW5kICovXHJcbiAgICBwdWJsaWMgcmlnaHQ6IFBhcmFtZXRlcjtcclxuICAgIC8qKiBUaGUgZnVuY3Rpb24gdmFsdWUgYXQgdGhlIGxlZnQgYm9yZGVyIG9mIHRoZSBpbnRlcnZhbCBmb3VuZCAqL1xyXG4gICAgcHVibGljIGxlZnRWYWx1ZTogYm9vbGVhbjtcclxuICAgIC8qKiBUaGUgZnVuY3Rpb24gdmFsdWUgYXQgdGhlIHJpZ2h0IGJvcmRlciBvZiB0aGUgaW50ZXJ2YWwgZm91bmQgKi9cclxuICAgIHB1YmxpYyByaWdodFZhbHVlOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgZnVuY3Rpb246IChfdDogUGFyYW1ldGVyKSA9PiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBkaXZpZGU6IChfbGVmdDogUGFyYW1ldGVyLCBfcmlnaHQ6IFBhcmFtZXRlcikgPT4gUGFyYW1ldGVyO1xyXG4gICAgcHJpdmF0ZSBpc1NtYWxsZXI6IChfbGVmdDogUGFyYW1ldGVyLCBfcmlnaHQ6IFBhcmFtZXRlciwgX2Vwc2lsb246IEVwc2lsb24pID0+IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNvbHZlclxyXG4gICAgICogQHBhcmFtIF9mdW5jdGlvbiBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYW4gYXJndW1lbnQgb2YgdGhlIGdlbmVyaWMgdHlwZSA8UGFyYW1ldGVyPiBhbmQgcmV0dXJucyBhIGJvb2xlYW4gdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0gX2RpdmlkZSBBIGZ1bmN0aW9uIHNwbGl0dGluZyB0aGUgaW50ZXJ2YWwgdG8gZmluZCBhIHBhcmFtZXRlciBmb3IgdGhlIG5leHQgaXRlcmF0aW9uLCBtYXkgc2ltcGx5IGJlIHRoZSBhcml0aG1ldGljIG1lYW5cclxuICAgICAqIEBwYXJhbSBfaXNTbWFsbGVyIEEgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBib3JkZXJzIG9mIHRoZSBjdXJyZW50IGludGVydmFsIGFuZCBjb21wYXJlcyB0aGlzIHRvIHRoZSBnaXZlbiBwcmVjaXNpb24gXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBfZnVuY3Rpb246IChfdDogUGFyYW1ldGVyKSA9PiBib29sZWFuLFxyXG4gICAgICBfZGl2aWRlOiAoX2xlZnQ6IFBhcmFtZXRlciwgX3JpZ2h0OiBQYXJhbWV0ZXIpID0+IFBhcmFtZXRlcixcclxuICAgICAgX2lzU21hbGxlcjogKF9sZWZ0OiBQYXJhbWV0ZXIsIF9yaWdodDogUGFyYW1ldGVyLCBfZXBzaWxvbjogRXBzaWxvbikgPT4gYm9vbGVhbikge1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uID0gX2Z1bmN0aW9uO1xyXG4gICAgICB0aGlzLmRpdmlkZSA9IF9kaXZpZGU7XHJcbiAgICAgIHRoaXMuaXNTbWFsbGVyID0gX2lzU21hbGxlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmRzIGEgc29sdXRpb24gd2l0aCB0aGUgZ2l2ZW4gcHJlY2lzaW9uIGluIHRoZSBnaXZlbiBpbnRlcnZhbCB1c2luZyB0aGUgZnVuY3Rpb25zIHRoaXMgU29sdmVyIHdhcyBjb25zdHJ1Y3RlZCB3aXRoLlxyXG4gICAgICogQWZ0ZXIgdGhlIG1ldGhvZCByZXR1cm5zLCBmaW5kIHRoZSBkYXRhIGluIHRoaXMgb2JqZWN0cyBwcm9wZXJ0aWVzLlxyXG4gICAgICogQHBhcmFtIF9sZWZ0IFRoZSBwYXJhbWV0ZXIgb24gb25lIHNpZGUgb2YgdGhlIGludGVydmFsLlxyXG4gICAgICogQHBhcmFtIF9yaWdodCBUaGUgcGFyYW1ldGVyIG9uIHRoZSBvdGhlciBzaWRlLCBtYXkgYmUgXCJzbWFsbGVyXCIgdGhhbiBbW19sZWZ0XV0uXHJcbiAgICAgKiBAcGFyYW0gX2Vwc2lsb24gVGhlIGRlc2lyZWQgcHJlY2lzaW9uIG9mIHRoZSBzb2x1dGlvbi5cclxuICAgICAqIEBwYXJhbSBfbGVmdFZhbHVlIFRoZSB2YWx1ZSBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBpbnRlcnZhbCwgb21pdCBpZiB5ZXQgdW5rbm93biBvciBwYXNzIGluIGlmIGtub3duIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuXHJcbiAgICAgKiBAcGFyYW0gX3JpZ2h0VmFsdWUgVGhlIHZhbHVlIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBpbnRlcnZhbCwgb21pdCBpZiB5ZXQgdW5rbm93biBvciBwYXNzIGluIGlmIGtub3duIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuXHJcbiAgICAgKiBAdGhyb3dzIEVycm9yIGlmIGJvdGggc2lkZXMgb2YgdGhlIGludGVydmFsIHJldHVybiB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNvbHZlKF9sZWZ0OiBQYXJhbWV0ZXIsIF9yaWdodDogUGFyYW1ldGVyLCBfZXBzaWxvbjogRXBzaWxvbiwgX2xlZnRWYWx1ZTogYm9vbGVhbiA9IHVuZGVmaW5lZCwgX3JpZ2h0VmFsdWU6IGJvb2xlYW4gPSB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgdGhpcy5sZWZ0ID0gX2xlZnQ7XHJcbiAgICAgIHRoaXMubGVmdFZhbHVlID0gX2xlZnRWYWx1ZSB8fCB0aGlzLmZ1bmN0aW9uKF9sZWZ0KTtcclxuICAgICAgdGhpcy5yaWdodCA9IF9yaWdodDtcclxuICAgICAgdGhpcy5yaWdodFZhbHVlID0gX3JpZ2h0VmFsdWUgfHwgdGhpcy5mdW5jdGlvbihfcmlnaHQpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuaXNTbWFsbGVyKF9sZWZ0LCBfcmlnaHQsIF9lcHNpbG9uKSlcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBpZiAodGhpcy5sZWZ0VmFsdWUgPT0gdGhpcy5yaWdodFZhbHVlKVxyXG4gICAgICAgIHRocm93KG5ldyBFcnJvcihcIkludGVydmFsIHNvbHZlciBjYW4ndCBvcGVyYXRlIHdpdGggaWRlbnRpY2FsIGZ1bmN0aW9uIHZhbHVlcyBvbiBib3RoIHNpZGVzIG9mIHRoZSBpbnRlcnZhbFwiKSk7XHJcblxyXG4gICAgICBsZXQgYmV0d2VlbjogUGFyYW1ldGVyID0gdGhpcy5kaXZpZGUoX2xlZnQsIF9yaWdodCk7XHJcbiAgICAgIGxldCBiZXR3ZWVuVmFsdWU6IGJvb2xlYW4gPSB0aGlzLmZ1bmN0aW9uKGJldHdlZW4pO1xyXG4gICAgICBpZiAoYmV0d2VlblZhbHVlID09IHRoaXMubGVmdFZhbHVlKVxyXG4gICAgICAgIHRoaXMuc29sdmUoYmV0d2VlbiwgdGhpcy5yaWdodCwgX2Vwc2lsb24sIGJldHdlZW5WYWx1ZSwgdGhpcy5yaWdodFZhbHVlKTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHRoaXMuc29sdmUodGhpcy5sZWZ0LCBiZXR3ZWVuLCBfZXBzaWxvbiwgdGhpcy5sZWZ0VmFsdWUsIGJldHdlZW5WYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgIGxldCBvdXQ6IHN0cmluZyA9IFwiXCI7XHJcbiAgICAgIG91dCArPSBgbGVmdDogJHt0aGlzLmxlZnQudG9TdHJpbmcoKX0gLT4gJHt0aGlzLmxlZnRWYWx1ZX1gO1xyXG4gICAgICBvdXQgKz0gXCJcXG5cIjtcclxuICAgICAgb3V0ICs9IGByaWdodDogJHt0aGlzLnJpZ2h0LnRvU3RyaW5nKCl9IC0+ICR7dGhpcy5yaWdodFZhbHVlfWA7XHJcbiAgICAgIHJldHVybiBvdXQ7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIGV4cG9ydCBjbGFzcyBDYW1lcmFPcmJpdCBleHRlbmRzIMaSLk5vZGUge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGF4aXNSb3RhdGVYOiDGki5BeGlzID0gbmV3IMaSLkF4aXMoXCJSb3RhdGVYXCIsIDEsIMaSLkNPTlRST0xfVFlQRS5QUk9QT1JUSU9OQUwsIHRydWUpO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGF4aXNSb3RhdGVZOiDGki5BeGlzID0gbmV3IMaSLkF4aXMoXCJSb3RhdGVZXCIsIDEsIMaSLkNPTlRST0xfVFlQRS5QUk9QT1JUSU9OQUwsIHRydWUpO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGF4aXNEaXN0YW5jZTogxpIuQXhpcyA9IG5ldyDGki5BeGlzKFwiRGlzdGFuY2VcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcblxyXG4gICAgcHJvdGVjdGVkIHRyYW5zbGF0b3I6IMaSLk5vZGU7XHJcbiAgICBwcm90ZWN0ZWQgcm90YXRvclg6IMaSLk5vZGU7XHJcbiAgICBwcml2YXRlIG1heFJvdFg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgbWluRGlzdGFuY2U6IG51bWJlcjtcclxuICAgIHByaXZhdGUgbWF4RGlzdGFuY2U6IG51bWJlcjtcclxuXHJcblxyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfY21wQ2FtZXJhOiDGki5Db21wb25lbnRDYW1lcmEsIF9kaXN0YW5jZVN0YXJ0OiBudW1iZXIgPSAyLCBfbWF4Um90WDogbnVtYmVyID0gNzUsIF9taW5EaXN0YW5jZTogbnVtYmVyID0gMSwgX21heERpc3RhbmNlOiBudW1iZXIgPSAxMCkge1xyXG4gICAgICBzdXBlcihcIkNhbWVyYU9yYml0XCIpO1xyXG5cclxuICAgICAgdGhpcy5tYXhSb3RYID0gTWF0aC5taW4oX21heFJvdFgsIDg5KTtcclxuICAgICAgdGhpcy5taW5EaXN0YW5jZSA9IF9taW5EaXN0YW5jZTtcclxuICAgICAgdGhpcy5tYXhEaXN0YW5jZSA9IF9tYXhEaXN0YW5jZTtcclxuXHJcbiAgICAgIGxldCBjbXBUcmFuc2Zvcm06IMaSLkNvbXBvbmVudFRyYW5zZm9ybSA9IG5ldyDGki5Db21wb25lbnRUcmFuc2Zvcm0oKTtcclxuICAgICAgdGhpcy5hZGRDb21wb25lbnQoY21wVHJhbnNmb3JtKTtcclxuXHJcbiAgICAgIHRoaXMucm90YXRvclggPSBuZXcgxpIuTm9kZShcIkNhbWVyYVJvdGF0aW9uWFwiKTtcclxuICAgICAgdGhpcy5yb3RhdG9yWC5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLnJvdGF0b3JYKTtcclxuICAgICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IMaSLk5vZGUoXCJDYW1lcmFUcmFuc2xhdGVcIik7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRvci5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgdGhpcy50cmFuc2xhdG9yLm10eExvY2FsLnJvdGF0ZVkoMTgwKTtcclxuICAgICAgdGhpcy5yb3RhdG9yWC5hZGRDaGlsZCh0aGlzLnRyYW5zbGF0b3IpO1xyXG5cclxuICAgICAgdGhpcy50cmFuc2xhdG9yLmFkZENvbXBvbmVudChfY21wQ2FtZXJhKTtcclxuICAgICAgdGhpcy5kaXN0YW5jZSA9IF9kaXN0YW5jZVN0YXJ0O1xyXG5cclxuICAgICAgdGhpcy5heGlzUm90YXRlWC5hZGRFdmVudExpc3RlbmVyKMaSLkVWRU5UX0NPTlRST0wuT1VUUFVULCB0aGlzLmhuZEF4aXNPdXRwdXQpO1xyXG4gICAgICB0aGlzLmF4aXNSb3RhdGVZLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICAgIHRoaXMuYXhpc0Rpc3RhbmNlLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjbXBDYW1lcmEoKTogxpIuQ29tcG9uZW50Q2FtZXJhIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvci5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50Q2FtZXJhKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG5vZGVDYW1lcmEoKTogxpIuTm9kZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBkaXN0YW5jZShfZGlzdGFuY2U6IG51bWJlcikge1xyXG4gICAgICBsZXQgbmV3RGlzdGFuY2U6IG51bWJlciA9IE1hdGgubWluKHRoaXMubWF4RGlzdGFuY2UsIE1hdGgubWF4KHRoaXMubWluRGlzdGFuY2UsIF9kaXN0YW5jZSkpO1xyXG4gICAgICB0aGlzLnRyYW5zbGF0b3IubXR4TG9jYWwudHJhbnNsYXRpb24gPSDGki5WZWN0b3IzLloobmV3RGlzdGFuY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZGlzdGFuY2UoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvci5tdHhMb2NhbC50cmFuc2xhdGlvbi56O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcm90YXRpb25ZKF9hbmdsZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMubXR4TG9jYWwucm90YXRpb24gPSDGki5WZWN0b3IzLlkoX2FuZ2xlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uWSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5tdHhMb2NhbC5yb3RhdGlvbi55O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcm90YXRpb25YKF9hbmdsZTogbnVtYmVyKSB7XHJcbiAgICAgIF9hbmdsZSA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLm1heFJvdFgsIF9hbmdsZSksIHRoaXMubWF4Um90WCk7XHJcbiAgICAgIHRoaXMucm90YXRvclgubXR4TG9jYWwucm90YXRpb24gPSDGki5WZWN0b3IzLlgoX2FuZ2xlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uWCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5yb3RhdG9yWC5tdHhMb2NhbC5yb3RhdGlvbi54O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByb3RhdGVZKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMubXR4TG9jYWwucm90YXRlWShfZGVsdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByb3RhdGVYKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMucm90YXRpb25YID0gdGhpcy5yb3RhdG9yWC5tdHhMb2NhbC5yb3RhdGlvbi54ICsgX2RlbHRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBwb3NpdGlvbiBvZiBjYW1lcmEgY29tcG9uZW50IHJlbGF0aXZlIHRvIHRoZSBjZW50ZXIgb2Ygb3JiaXRcclxuICAgIHB1YmxpYyBwb3NpdGlvbkNhbWVyYShfcG9zV29ybGQ6IMaSLlZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgbGV0IGRpZmZlcmVuY2U6IMaSLlZlY3RvcjMgPSDGki5WZWN0b3IzLkRJRkZFUkVOQ0UoX3Bvc1dvcmxkLCB0aGlzLm10eFdvcmxkLnRyYW5zbGF0aW9uKTtcclxuICAgICAgbGV0IGdlbzogxpIuR2VvMyA9IGRpZmZlcmVuY2UuZ2VvO1xyXG4gICAgICB0aGlzLnJvdGF0aW9uWSA9IGdlby5sb25naXR1ZGU7XHJcbiAgICAgIHRoaXMucm90YXRpb25YID0gLWdlby5sYXRpdHVkZTtcclxuICAgICAgdGhpcy5kaXN0YW5jZSA9IGdlby5tYWduaXR1ZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhuZEF4aXNPdXRwdXQ6IEV2ZW50TGlzdGVuZXIgPSAoX2V2ZW50OiBFdmVudCk6IHZvaWQgPT4ge1xyXG4gICAgICBsZXQgb3V0cHV0OiBudW1iZXIgPSAoPEN1c3RvbUV2ZW50Pl9ldmVudCkuZGV0YWlsLm91dHB1dDtcclxuICAgICAgc3dpdGNoICgoPMaSLkF4aXM+X2V2ZW50LnRhcmdldCkubmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJSb3RhdGVYXCI6XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVgob3V0cHV0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJSb3RhdGVZXCI6XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVkob3V0cHV0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJEaXN0YW5jZVwiOlxyXG4gICAgICAgICAgdGhpcy5kaXN0YW5jZSArPSBvdXRwdXQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuXHJcbiAgZXhwb3J0IGNsYXNzIENhbWVyYU9yYml0TW92aW5nRm9jdXMgZXh0ZW5kcyBDYW1lcmFPcmJpdCB7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1RyYW5zbGF0ZVg6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlRyYW5zbGF0ZVhcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1RyYW5zbGF0ZVk6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlRyYW5zbGF0ZVlcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1RyYW5zbGF0ZVo6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlRyYW5zbGF0ZVpcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKF9jbXBDYW1lcmE6IMaSLkNvbXBvbmVudENhbWVyYSwgX2Rpc3RhbmNlU3RhcnQ6IG51bWJlciA9IDUsIF9tYXhSb3RYOiBudW1iZXIgPSA4NSwgX21pbkRpc3RhbmNlOiBudW1iZXIgPSAwLCBfbWF4RGlzdGFuY2U6IG51bWJlciA9IEluZmluaXR5KSB7XHJcbiAgICAgIHN1cGVyKF9jbXBDYW1lcmEsIF9kaXN0YW5jZVN0YXJ0LCBfbWF4Um90WCwgX21pbkRpc3RhbmNlLCBfbWF4RGlzdGFuY2UpO1xyXG4gICAgICB0aGlzLm5hbWUgPSBcIkNhbWVyYU9yYml0TW92aW5nRm9jdXNcIjtcclxuXHJcbiAgICAgIHRoaXMuYXhpc1RyYW5zbGF0ZVguYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9DT05UUk9MLk9VVFBVVCwgdGhpcy5obmRBeGlzT3V0cHV0KTtcclxuICAgICAgdGhpcy5heGlzVHJhbnNsYXRlWS5hZGRFdmVudExpc3RlbmVyKMaSLkVWRU5UX0NPTlRST0wuT1VUUFVULCB0aGlzLmhuZEF4aXNPdXRwdXQpO1xyXG4gICAgICB0aGlzLmF4aXNUcmFuc2xhdGVaLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyYW5zbGF0ZVgoX2RlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5tdHhMb2NhbC50cmFuc2xhdGVYKF9kZWx0YSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB0cmFuc2xhdGVZKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIGxldCB0cmFuc2xhdGlvbjogxpIuVmVjdG9yMyA9IHRoaXMucm90YXRvclgubXR4V29ybGQuZ2V0WSgpO1xyXG4gICAgICB0cmFuc2xhdGlvbi5ub3JtYWxpemUoX2RlbHRhKTtcclxuICAgICAgdGhpcy5tdHhMb2NhbC50cmFuc2xhdGUodHJhbnNsYXRpb24sIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlWihfZGVsdGE6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAvLyB0aGlzLm10eExvY2FsLnRyYW5zbGF0ZVooX2RlbHRhKTtcclxuICAgICAgbGV0IHRyYW5zbGF0aW9uOiDGki5WZWN0b3IzID0gdGhpcy5yb3RhdG9yWC5tdHhXb3JsZC5nZXRaKCk7XHJcbiAgICAgIHRyYW5zbGF0aW9uLm5vcm1hbGl6ZShfZGVsdGEpO1xyXG4gICAgICB0aGlzLm10eExvY2FsLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbiwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBobmRBeGlzT3V0cHV0OiBFdmVudExpc3RlbmVyID0gKF9ldmVudDogRXZlbnQpOiB2b2lkID0+IHtcclxuICAgICAgbGV0IG91dHB1dDogbnVtYmVyID0gKDxDdXN0b21FdmVudD5fZXZlbnQpLmRldGFpbC5vdXRwdXQ7XHJcbiAgICAgIHN3aXRjaCAoKDzGki5BeGlzPl9ldmVudC50YXJnZXQpLm5hbWUpIHtcclxuICAgICAgICBjYXNlIFwiVHJhbnNsYXRlWFwiOlxyXG4gICAgICAgICAgdGhpcy50cmFuc2xhdGVYKG91dHB1dCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiVHJhbnNsYXRlWVwiOlxyXG4gICAgICAgICAgdGhpcy50cmFuc2xhdGVZKG91dHB1dCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiVHJhbnNsYXRlWlwiOlxyXG4gICAgICAgICAgdGhpcy50cmFuc2xhdGVaKG91dHB1dCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGV4cG9ydCBlbnVtIElNQUdFX1JFTkRFUklORyB7XHJcbiAgICBBVVRPID0gXCJhdXRvXCIsXHJcbiAgICBTTU9PVEggPSBcInNtb290aFwiLFxyXG4gICAgSElHSF9RVUFMSVRZID0gXCJoaWdoLXF1YWxpdHlcIixcclxuICAgIENSSVNQX0VER0VTID0gXCJjcmlzcC1lZGdlc1wiLFxyXG4gICAgUElYRUxBVEVEID0gXCJwaXhlbGF0ZWRcIlxyXG4gIH1cclxuICAvKipcclxuICAgKiBBZGRzIGNvbWZvcnQgbWV0aG9kcyB0byBjcmVhdGUgYSByZW5kZXIgY2FudmFzXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIENhbnZhcyB7XHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShfZmlsbFBhcmVudDogYm9vbGVhbiA9IHRydWUsIF9pbWFnZVJlbmRlcmluZzogSU1BR0VfUkVOREVSSU5HID0gSU1BR0VfUkVOREVSSU5HLkFVVE8sIF93aWR0aDogbnVtYmVyID0gODAwLCBfaGVpZ2h0OiBudW1iZXIgPSA2MDApOiBIVE1MQ2FudmFzRWxlbWVudCB7XHJcbiAgICAgIGxldCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgIGNhbnZhcy5pZCA9IFwiRlVER0VcIjtcclxuICAgICAgbGV0IHN0eWxlOiBDU1NTdHlsZURlY2xhcmF0aW9uID0gY2FudmFzLnN0eWxlO1xyXG4gICAgICBzdHlsZS5pbWFnZVJlbmRlcmluZyA9IF9pbWFnZVJlbmRlcmluZztcclxuICAgICAgc3R5bGUud2lkdGggPSBfd2lkdGggKyBcInB4XCI7XHJcbiAgICAgIHN0eWxlLmhlaWdodCA9IF9oZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgIHN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiLTAuMjVlbVwiO1xyXG4gICAgICBcclxuICAgICAgaWYgKF9maWxsUGFyZW50KSB7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcclxuICAgICAgICBzdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2FudmFzO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgaW1wb3J0IMaSID0gRnVkZ2VDb3JlO1xyXG5cclxuICBleHBvcnQgY2xhc3MgTm9kZSBleHRlbmRzIMaSLk5vZGUge1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY291bnQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZyA9IE5vZGUuZ2V0TmV4dE5hbWUoKSwgX3RyYW5zZm9ybT86IMaSLk1hdHJpeDR4NCwgX21hdGVyaWFsPzogxpIuTWF0ZXJpYWwsIF9tZXNoPzogxpIuTWVzaCkge1xyXG4gICAgICBzdXBlcihfbmFtZSk7XHJcbiAgICAgIGlmIChfdHJhbnNmb3JtKVxyXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5ldyDGki5Db21wb25lbnRUcmFuc2Zvcm0oX3RyYW5zZm9ybSkpO1xyXG4gICAgICBpZiAoX21hdGVyaWFsKVxyXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5ldyDGki5Db21wb25lbnRNYXRlcmlhbChfbWF0ZXJpYWwpKTtcclxuICAgICAgaWYgKF9tZXNoKVxyXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5ldyDGki5Db21wb25lbnRNZXNoKF9tZXNoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0TmV4dE5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgcmV0dXJuIFwixpJBaWROb2RlX1wiICsgTm9kZS5jb3VudCsrO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbXR4TWVzaFBpdm90KCk6IMaSLk1hdHJpeDR4NCB7XHJcbiAgICAgIGxldCBjbXBNZXNoOiDGki5Db21wb25lbnRNZXNoID0gdGhpcy5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50TWVzaCk7XHJcbiAgICAgIHJldHVybiBjbXBNZXNoID8gY21wTWVzaC5tdHhQaXZvdCA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiDGki5TZXJpYWxpemF0aW9uKTogUHJvbWlzZTzGki5TZXJpYWxpemFibGU+IHtcclxuICAgICAgLy8gUXVpY2sgYW5kIG1heWJlIGhhY2t5IHNvbHV0aW9uLiBDcmVhdGVkIG5vZGUgaXMgY29tcGxldGVseSBkaXNtaXNzZWQgYW5kIGEgcmVjcmVhdGlvbiBvZiB0aGUgYmFzZWNsYXNzIGdldHMgcmV0dXJuLiBPdGhlcndpc2UsIGNvbXBvbmVudHMgd2lsbCBiZSBkb3VibGVkLi4uXHJcbiAgICAgIGxldCBub2RlOiDGki5Ob2RlID0gbmV3IMaSLk5vZGUoX3NlcmlhbGl6YXRpb24ubmFtZSk7XHJcbiAgICAgIGF3YWl0IG5vZGUuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhub2RlKTtcclxuICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG5cclxuICBleHBvcnQgY2xhc3MgTm9kZUFycm93IGV4dGVuZHMgTm9kZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBpbnRlcm5hbFJlc291cmNlczogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+ID0gTm9kZUFycm93LmNyZWF0ZUludGVybmFsUmVzb3VyY2VzKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX2NvbG9yOiDGki5Db2xvcikge1xyXG4gICAgICBzdXBlcihfbmFtZSwgxpIuTWF0cml4NHg0LklERU5USVRZKCkpO1xyXG5cclxuICAgICAgbGV0IHNoYWZ0OiBOb2RlID0gbmV3IE5vZGUoX25hbWUgKyBcIlNoYWZ0XCIsIMaSLk1hdHJpeDR4NC5JREVOVElUWSgpLCA8xpIuTWF0ZXJpYWw+Tm9kZUFycm93LmludGVybmFsUmVzb3VyY2VzLmdldChcIk1hdGVyaWFsXCIpLCA8xpIuTWVzaD5Ob2RlQXJyb3cuaW50ZXJuYWxSZXNvdXJjZXMuZ2V0KFwiU2hhZnRcIikpO1xyXG4gICAgICBsZXQgaGVhZDogTm9kZSA9IG5ldyBOb2RlKF9uYW1lICsgXCJIZWFkXCIsIMaSLk1hdHJpeDR4NC5JREVOVElUWSgpLCA8xpIuTWF0ZXJpYWw+Tm9kZUFycm93LmludGVybmFsUmVzb3VyY2VzLmdldChcIk1hdGVyaWFsXCIpLCA8xpIuTWVzaD5Ob2RlQXJyb3cuaW50ZXJuYWxSZXNvdXJjZXMuZ2V0KFwiSGVhZFwiKSk7XHJcbiAgICAgIHNoYWZ0Lm10eExvY2FsLnNjYWxlKG5ldyDGki5WZWN0b3IzKDAuMDEsIDAuMDEsIDEpKTtcclxuICAgICAgaGVhZC5tdHhMb2NhbC50cmFuc2xhdGVaKDAuNSk7XHJcbiAgICAgIGhlYWQubXR4TG9jYWwuc2NhbGUobmV3IMaSLlZlY3RvcjMoMC4wNSwgMC4wNSwgMC4xKSk7XHJcbiAgICAgIGhlYWQubXR4TG9jYWwucm90YXRlWCg5MCk7XHJcblxyXG4gICAgICBzaGFmdC5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50TWF0ZXJpYWwpLmNsclByaW1hcnkgPSBfY29sb3I7XHJcbiAgICAgIGhlYWQuZ2V0Q29tcG9uZW50KMaSLkNvbXBvbmVudE1hdGVyaWFsKS5jbHJQcmltYXJ5ID0gX2NvbG9yO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZChzaGFmdCk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoaGVhZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlSW50ZXJuYWxSZXNvdXJjZXMoKTogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+IHtcclxuICAgICAgbGV0IG1hcDogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+ID0gbmV3IE1hcCgpO1xyXG4gICAgICBtYXAuc2V0KFwiU2hhZnRcIiwgbmV3IMaSLk1lc2hDdWJlKFwiQXJyb3dTaGFmdFwiKSk7XHJcbiAgICAgIG1hcC5zZXQoXCJIZWFkXCIsIG5ldyDGki5NZXNoUHlyYW1pZChcIkFycm93SGVhZFwiKSk7XHJcbiAgICAgIGxldCBjb2F0OiDGki5Db2F0Q29sb3JlZCA9IG5ldyDGki5Db2F0Q29sb3JlZCjGki5Db2xvci5DU1MoXCJ3aGl0ZVwiKSk7XHJcbiAgICAgIG1hcC5zZXQoXCJNYXRlcmlhbFwiLCBuZXcgxpIuTWF0ZXJpYWwoXCJBcnJvd1wiLCDGki5TaGFkZXJVbmlDb2xvciwgY29hdCkpO1xyXG5cclxuICAgICAgbWFwLmZvckVhY2goKF9yZXNvdXJjZSkgPT4gxpIuUHJvamVjdC5kZXJlZ2lzdGVyKF9yZXNvdXJjZSkpO1xyXG4gICAgICByZXR1cm4gbWFwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgY29sb3IoX2NvbG9yOiDGki5Db2xvcikge1xyXG4gICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmdldENoaWxkcmVuKCkpIHtcclxuICAgICAgICBjaGlsZC5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50TWF0ZXJpYWwpLmNsclByaW1hcnkuY29weShfY29sb3IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIGV4cG9ydCBjbGFzcyBOb2RlQ29vcmRpbmF0ZVN5c3RlbSBleHRlbmRzIE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZyA9IFwiQ29vcmRpbmF0ZVN5c3RlbVwiLCBfdHJhbnNmb3JtPzogxpIuTWF0cml4NHg0KSB7XHJcbiAgICAgIHN1cGVyKF9uYW1lLCBfdHJhbnNmb3JtKTtcclxuICAgICAgbGV0IGFycm93UmVkOiDGki5Ob2RlID0gbmV3IE5vZGVBcnJvdyhcIkFycm93UmVkXCIsIG5ldyDGki5Db2xvcigxLCAwLCAwLCAxKSk7XHJcbiAgICAgIGxldCBhcnJvd0dyZWVuOiDGki5Ob2RlID0gbmV3IE5vZGVBcnJvdyhcIkFycm93R3JlZW5cIiwgbmV3IMaSLkNvbG9yKDAsIDEsIDAsIDEpKTtcclxuICAgICAgbGV0IGFycm93Qmx1ZTogxpIuTm9kZSA9IG5ldyBOb2RlQXJyb3coXCJBcnJvd0JsdWVcIiwgbmV3IMaSLkNvbG9yKDAsIDAsIDEsIDEpKTtcclxuXHJcbiAgICAgIGFycm93UmVkLm10eExvY2FsLnJvdGF0ZVkoOTApO1xyXG4gICAgICBhcnJvd0dyZWVuLm10eExvY2FsLnJvdGF0ZVgoLTkwKTtcclxuXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoYXJyb3dSZWQpO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKGFycm93R3JlZW4pO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKGFycm93Qmx1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL0NvcmUvQnVpbGQvRnVkZ2VDb3JlLmQudHNcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGxpZ2h0IHNldHVwIHRvIHRoZSBub2RlIGdpdmVuLCBjb25zaXN0aW5nIG9mIGFuIGFtYmllbnQgbGlnaHQsIGEgZGlyZWN0aW9uYWwga2V5IGxpZ2h0IGFuZCBhIGRpcmVjdGlvbmFsIGJhY2sgbGlnaHQuXHJcbiAgICogRXhlcHQgb2YgdGhlIG5vZGUgdG8gYmVjb21lIHRoZSBjb250YWluZXIsIGFsbCBwYXJhbWV0ZXJzIGFyZSBvcHRpb25hbCBhbmQgcHJvdmlkZWQgZGVmYXVsdCB2YWx1ZXMgZm9yIGdlbmVyYWwgcHVycG9zZS4gXHJcbiAgICovXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGFkZFN0YW5kYXJkTGlnaHRDb21wb25lbnRzKFxyXG4gICAgX25vZGU6IMaSLk5vZGUsXHJcbiAgICBfY2xyQW1iaWVudDogxpIuQ29sb3IgPSBuZXcgxpIuQ29sb3IoMC4yLCAwLjIsIDAuMiksIF9jbHJLZXk6IMaSLkNvbG9yID0gbmV3IMaSLkNvbG9yKDAuOSwgMC45LCAwLjkpLCBfY2xyQmFjazogxpIuQ29sb3IgPSBuZXcgxpIuQ29sb3IoMC42LCAwLjYsIDAuNiksXHJcbiAgICBfcG9zS2V5OiDGki5WZWN0b3IzID0gbmV3IMaSLlZlY3RvcjMoNCwgMTIsIDgpLCBfcG9zQmFjazogxpIuVmVjdG9yMyA9IG5ldyDGki5WZWN0b3IzKC0xLCAtMC41LCAtMylcclxuICApOiB2b2lkIHtcclxuICAgIGxldCBrZXk6IMaSLkNvbXBvbmVudExpZ2h0ID0gbmV3IMaSLkNvbXBvbmVudExpZ2h0KG5ldyDGki5MaWdodERpcmVjdGlvbmFsKF9jbHJLZXkpKTtcclxuICAgIGtleS5tdHhQaXZvdC50cmFuc2xhdGUoX3Bvc0tleSk7XHJcbiAgICBrZXkubXR4UGl2b3QubG9va0F0KMaSLlZlY3RvcjMuWkVSTygpKTtcclxuXHJcbiAgICBsZXQgYmFjazogxpIuQ29tcG9uZW50TGlnaHQgPSBuZXcgxpIuQ29tcG9uZW50TGlnaHQobmV3IMaSLkxpZ2h0RGlyZWN0aW9uYWwoX2NsckJhY2spKTtcclxuICAgIGJhY2subXR4UGl2b3QudHJhbnNsYXRlKF9wb3NCYWNrKTtcclxuICAgIGJhY2subXR4UGl2b3QubG9va0F0KMaSLlZlY3RvcjMuWkVSTygpKTtcclxuXHJcbiAgICBsZXQgYW1iaWVudDogxpIuQ29tcG9uZW50TGlnaHQgPSBuZXcgxpIuQ29tcG9uZW50TGlnaHQobmV3IMaSLkxpZ2h0QW1iaWVudChfY2xyQW1iaWVudCkpO1xyXG5cclxuICAgIF9ub2RlLmFkZENvbXBvbmVudChrZXkpO1xyXG4gICAgX25vZGUuYWRkQ29tcG9uZW50KGJhY2spO1xyXG4gICAgX25vZGUuYWRkQ29tcG9uZW50KGFtYmllbnQpO1xyXG4gIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgdGhlIGFuaW1hdGlvbiBjeWNsZSBvZiBhIHNwcml0ZSBvbiBhIFtbTm9kZV1dXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIE5vZGVTcHJpdGUgZXh0ZW5kcyDGki5Ob2RlIHtcclxuICAgIHByaXZhdGUgc3RhdGljIG1lc2g6IMaSLk1lc2hTcHJpdGUgPSBOb2RlU3ByaXRlLmNyZWF0ZUludGVybmFsUmVzb3VyY2UoKTtcclxuICAgIHB1YmxpYyBmcmFtZXJhdGU6IG51bWJlciA9IDEyOyAvLyBhbmltYXRpb24gZnJhbWVzIHBlciBzZWNvbmQsIHNpbmdsZSBmcmFtZXMgY2FuIGJlIHNob3J0ZXIgb3IgbG9uZ2VyIGJhc2VkIG9uIHRoZWlyIHRpbWVzY2FsZVxyXG5cclxuICAgIHByaXZhdGUgY21wTWVzaDogxpIuQ29tcG9uZW50TWVzaDtcclxuICAgIHByaXZhdGUgY21wTWF0ZXJpYWw6IMaSLkNvbXBvbmVudE1hdGVyaWFsO1xyXG4gICAgcHJpdmF0ZSBhbmltYXRpb246IFNwcml0ZVNoZWV0QW5pbWF0aW9uO1xyXG4gICAgcHJpdmF0ZSBmcmFtZUN1cnJlbnQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGRpcmVjdGlvbjogbnVtYmVyID0gMTtcclxuICAgIHByaXZhdGUgdGltZXI6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgIHN1cGVyKF9uYW1lKTtcclxuXHJcbiAgICAgIHRoaXMuY21wTWVzaCA9IG5ldyDGki5Db21wb25lbnRNZXNoKE5vZGVTcHJpdGUubWVzaCk7XHJcbiAgICAgIC8vIERlZmluZSBjb2F0IGZyb20gdGhlIFNwcml0ZVNoZWV0IHRvIHVzZSB3aGVuIHJlbmRlcmluZ1xyXG4gICAgICB0aGlzLmNtcE1hdGVyaWFsID0gbmV3IMaSLkNvbXBvbmVudE1hdGVyaWFsKG5ldyDGki5NYXRlcmlhbChfbmFtZSwgxpIuU2hhZGVyVGV4dHVyZSwgbnVsbCkpO1xyXG4gICAgICB0aGlzLmFkZENvbXBvbmVudCh0aGlzLmNtcE1lc2gpO1xyXG4gICAgICB0aGlzLmFkZENvbXBvbmVudCh0aGlzLmNtcE1hdGVyaWFsKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBjcmVhdGVJbnRlcm5hbFJlc291cmNlKCk6IMaSLk1lc2hTcHJpdGUge1xyXG4gICAgICBsZXQgbWVzaDogxpIuTWVzaFNwcml0ZSA9IG5ldyDGki5NZXNoU3ByaXRlKFwiU3ByaXRlXCIpO1xyXG4gICAgICDGki5Qcm9qZWN0LmRlcmVnaXN0ZXIobWVzaCk7XHJcbiAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRBbmltYXRpb24oX2FuaW1hdGlvbjogU3ByaXRlU2hlZXRBbmltYXRpb24pOiB2b2lkIHtcclxuICAgICAgdGhpcy5hbmltYXRpb24gPSBfYW5pbWF0aW9uO1xyXG4gICAgICBpZiAodGhpcy50aW1lcilcclxuICAgICAgICDGki5UaW1lLmdhbWUuZGVsZXRlVGltZXIodGhpcy50aW1lcik7XHJcbiAgICAgIHRoaXMuc2hvd0ZyYW1lKDApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBhIHNwZWNpZmljIGZyYW1lIG9mIHRoZSBzZXF1ZW5jZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2hvd0ZyYW1lKF9pbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIGxldCBzcHJpdGVGcmFtZTogU3ByaXRlRnJhbWUgPSB0aGlzLmFuaW1hdGlvbi5mcmFtZXNbX2luZGV4XTtcclxuICAgICAgdGhpcy5jbXBNZXNoLm10eFBpdm90ID0gc3ByaXRlRnJhbWUubXR4UGl2b3Q7XHJcbiAgICAgIHRoaXMuY21wTWF0ZXJpYWwubXR4UGl2b3QgPSBzcHJpdGVGcmFtZS5tdHhUZXh0dXJlO1xyXG4gICAgICB0aGlzLmNtcE1hdGVyaWFsLm1hdGVyaWFsLnNldENvYXQodGhpcy5hbmltYXRpb24uc3ByaXRlc2hlZXQpO1xyXG4gICAgICB0aGlzLmZyYW1lQ3VycmVudCA9IF9pbmRleDtcclxuICAgICAgdGhpcy50aW1lciA9IMaSLlRpbWUuZ2FtZS5zZXRUaW1lcihzcHJpdGVGcmFtZS50aW1lU2NhbGUgKiAxMDAwIC8gdGhpcy5mcmFtZXJhdGUsIDEsIHRoaXMuc2hvd0ZyYW1lTmV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IHRoZSBuZXh0IGZyYW1lIG9mIHRoZSBzZXF1ZW5jZSBvciBzdGFydCBhbmV3IHdoZW4gdGhlIGVuZCBvciB0aGUgc3RhcnQgd2FzIHJlYWNoZWQsIGFjY29yZGluZyB0byB0aGUgZGlyZWN0aW9uIG9mIHBsYXlpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dGcmFtZU5leHQgPSAoX2V2ZW50OiDGki5FdmVudFRpbWVyKTogdm9pZCA9PiB7XHJcbiAgICAgIHRoaXMuZnJhbWVDdXJyZW50ID0gKHRoaXMuZnJhbWVDdXJyZW50ICsgdGhpcy5kaXJlY3Rpb24gKyB0aGlzLmFuaW1hdGlvbi5mcmFtZXMubGVuZ3RoKSAlIHRoaXMuYW5pbWF0aW9uLmZyYW1lcy5sZW5ndGg7XHJcbiAgICAgIHRoaXMuc2hvd0ZyYW1lKHRoaXMuZnJhbWVDdXJyZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGRpcmVjdGlvbiBmb3IgYW5pbWF0aW9uIHBsYXliYWNrLCBuZWdhdGl2IG51bWJlcnMgbWFrZSBpdCBwbGF5IGJhY2t3YXJkcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldEZyYW1lRGlyZWN0aW9uKF9kaXJlY3Rpb246IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguZmxvb3IoX2RpcmVjdGlvbik7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIC8qKlxyXG4gICAqIERlc2NyaWJlcyBhIHNpbmdsZSBmcmFtZSBvZiBhIHNwcml0ZSBhbmltYXRpb25cclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgU3ByaXRlRnJhbWUge1xyXG4gICAgcmVjdFRleHR1cmU6IMaSLlJlY3RhbmdsZTtcclxuICAgIG10eFBpdm90OiDGki5NYXRyaXg0eDQ7XHJcbiAgICBtdHhUZXh0dXJlOiDGki5NYXRyaXgzeDM7XHJcbiAgICB0aW1lU2NhbGU6IG51bWJlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGZvciBjcmVhdGluZyBhIFtbQ29hdFRleHR1cmVdXSB0byB1c2UgYXMgc3ByaXRlc2hlZXRcclxuICAgKi9cclxuICBleHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlU2hlZXQoX25hbWU6IHN0cmluZywgX2ltYWdlOiBIVE1MSW1hZ2VFbGVtZW50KTogxpIuQ29hdFRleHR1cmVkIHtcclxuICAgIGxldCBjb2F0OiDGki5Db2F0VGV4dHVyZWQgPSBuZXcgxpIuQ29hdFRleHR1cmVkKCk7XHJcbiAgICBjb2F0Lm5hbWUgPSBfbmFtZTtcclxuICAgIGxldCB0ZXh0dXJlOiDGki5UZXh0dXJlSW1hZ2UgPSBuZXcgxpIuVGV4dHVyZUltYWdlKCk7XHJcbiAgICB0ZXh0dXJlLmltYWdlID0gX2ltYWdlO1xyXG4gICAgY29hdC50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgIHJldHVybiBjb2F0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSG9sZHMgU3ByaXRlU2hlZXRBbmltYXRpb25zIGluIGFuIGFzc29jaWF0aXZlIGhpZXJhcmNoaWNhbCBhcnJheVxyXG4gICAqL1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgU3ByaXRlU2hlZXRBbmltYXRpb25zIHtcclxuICAgIFtrZXk6IHN0cmluZ106IFNwcml0ZVNoZWV0QW5pbWF0aW9uIHwgU3ByaXRlU2hlZXRBbmltYXRpb25zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIHNlcmllcyBvZiBbW1Nwcml0ZUZyYW1lXV1zIHRvIGJlIG1hcHBlZCBvbnRvIGEgW1tNZXNoU3ByaXRlXV1cclxuICAgKiBDb250YWlucyB0aGUgW1tNZXNoU3ByaXRlXV0sIHRoZSBbW01hdGVyaWFsXV0gYW5kIHRoZSBzcHJpdGVzaGVldC10ZXh0dXJlXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFNwcml0ZVNoZWV0QW5pbWF0aW9uIHtcclxuICAgIHB1YmxpYyBmcmFtZXM6IFNwcml0ZUZyYW1lW10gPSBbXTtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgc3ByaXRlc2hlZXQ6IMaSLkNvYXRUZXh0dXJlZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfbmFtZTogc3RyaW5nLCBfc3ByaXRlc2hlZXQ6IMaSLkNvYXRUZXh0dXJlZCkge1xyXG4gICAgICB0aGlzLm5hbWUgPSBfbmFtZTtcclxuICAgICAgdGhpcy5zcHJpdGVzaGVldCA9IF9zcHJpdGVzaGVldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3JlcyBhIHNlcmllcyBvZiBmcmFtZXMgaW4gdGhpcyBbW1Nwcml0ZV1dLCBjYWxjdWxhdGluZyB0aGUgbWF0cmljZXMgdG8gdXNlIGluIHRoZSBjb21wb25lbnRzIG9mIGEgW1tOb2RlU3ByaXRlXV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdlbmVyYXRlKF9yZWN0czogxpIuUmVjdGFuZ2xlW10sIF9yZXNvbHV0aW9uUXVhZDogbnVtYmVyLCBfb3JpZ2luOiDGki5PUklHSU4yRCk6IHZvaWQge1xyXG4gICAgICBsZXQgaW1nOiBUZXhJbWFnZVNvdXJjZSA9IHRoaXMuc3ByaXRlc2hlZXQudGV4dHVyZS50ZXhJbWFnZVNvdXJjZTtcclxuICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgICAgbGV0IGZyYW1pbmc6IMaSLkZyYW1pbmdTY2FsZWQgPSBuZXcgxpIuRnJhbWluZ1NjYWxlZCgpO1xyXG4gICAgICBmcmFtaW5nLnNldFNjYWxlKDEgLyBpbWcud2lkdGgsIDEgLyBpbWcuaGVpZ2h0KTtcclxuXHJcbiAgICAgIGxldCBjb3VudDogbnVtYmVyID0gMDtcclxuICAgICAgZm9yIChsZXQgcmVjdCBvZiBfcmVjdHMpIHtcclxuICAgICAgICBsZXQgZnJhbWU6IFNwcml0ZUZyYW1lID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLm5hbWUgKyBgJHtjb3VudH1gLCBmcmFtaW5nLCByZWN0LCBfcmVzb2x1dGlvblF1YWQsIF9vcmlnaW4pO1xyXG4gICAgICAgIGZyYW1lLnRpbWVTY2FsZSA9IDE7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChmcmFtZSk7XHJcblxyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBzcHJpdGUgZnJhbWVzIHVzaW5nIGEgZ3JpZCBvbiB0aGUgc3ByaXRlc2hlZXQgZGVmaW5lZCBieSBhIHJlY3RhbmdsZSB0byBzdGFydCB3aXRoLCB0aGUgbnVtYmVyIG9mIGZyYW1lcywgXHJcbiAgICAgKiB0aGUgcmVzb2x1dGlvbiB3aGljaCBkZXRlcm1pbmVzIHRoZSBzaXplIG9mIHRoZSBzcHJpdGVzIG1lc2ggYmFzZWQgb24gdGhlIG51bWJlciBvZiBwaXhlbHMgb2YgdGhlIHRleHR1cmUgZnJhbWUsXHJcbiAgICAgKiB0aGUgb2Zmc2V0IGZyb20gb25lIGNlbGwgb2YgdGhlIGdyaWQgdG8gdGhlIG5leHQgaW4gdGhlIHNlcXVlbmNlIGFuZCwgaW4gY2FzZSB0aGUgc2VxdWVuY2Ugc3BhbnMgb3ZlciBtb3JlIHRoYW4gb25lIHJvdyBvciBjb2x1bW4sXHJcbiAgICAgKiB0aGUgb2Zmc2V0IHRvIG1vdmUgdGhlIHN0YXJ0IHJlY3RhbmdsZSB3aGVuIHRoZSBtYXJnaW4gb2YgdGhlIHRleHR1cmUgaXMgcmVhY2hlZCBhbmQgd3JhcHBpbmcgb2NjdXJzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2VuZXJhdGVCeUdyaWQoX3N0YXJ0UmVjdDogxpIuUmVjdGFuZ2xlLCBfZnJhbWVzOiBudW1iZXIsIF9yZXNvbHV0aW9uUXVhZDogbnVtYmVyLCBfb3JpZ2luOiDGki5PUklHSU4yRCwgX29mZnNldE5leHQ6IMaSLlZlY3RvcjIsIF9vZmZzZXRXcmFwOiDGki5WZWN0b3IyID0gxpIuVmVjdG9yMi5aRVJPKCkpOiB2b2lkIHtcclxuICAgICAgbGV0IGltZzogVGV4SW1hZ2VTb3VyY2UgPSB0aGlzLnNwcml0ZXNoZWV0LnRleHR1cmUudGV4SW1hZ2VTb3VyY2U7XHJcbiAgICAgIGxldCByZWN0SW1hZ2U6IMaSLlJlY3RhbmdsZSA9IG5ldyDGki5SZWN0YW5nbGUoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KTtcclxuICAgICAgbGV0IHJlY3Q6IMaSLlJlY3RhbmdsZSA9IF9zdGFydFJlY3QuY29weTtcclxuICAgICAgbGV0IHJlY3RzOiDGki5SZWN0YW5nbGVbXSA9IFtdO1xyXG4gICAgICB3aGlsZSAoX2ZyYW1lcy0tKSB7XHJcbiAgICAgICAgcmVjdHMucHVzaChyZWN0LmNvcHkpO1xyXG4gICAgICAgIHJlY3QucG9zaXRpb24uYWRkKF9vZmZzZXROZXh0KTtcclxuXHJcbiAgICAgICAgaWYgKHJlY3RJbWFnZS5jb3ZlcnMocmVjdCkpXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgX3N0YXJ0UmVjdC5wb3NpdGlvbi5hZGQoX29mZnNldFdyYXApO1xyXG4gICAgICAgIHJlY3QgPSBfc3RhcnRSZWN0LmNvcHk7XHJcbiAgICAgICAgaWYgKCFyZWN0SW1hZ2UuY292ZXJzKHJlY3QpKVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlY3RzLmZvckVhY2goKF9yZWN0OiDGki5SZWN0YW5nbGUpID0+IMaSLkRlYnVnLmxvZyhfcmVjdC50b1N0cmluZygpKSk7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdGUocmVjdHMsIF9yZXNvbHV0aW9uUXVhZCwgX29yaWdpbik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVGcmFtZShfbmFtZTogc3RyaW5nLCBfZnJhbWluZzogxpIuRnJhbWluZ1NjYWxlZCwgX3JlY3Q6IMaSLlJlY3RhbmdsZSwgX3Jlc29sdXRpb25RdWFkOiBudW1iZXIsIF9vcmlnaW46IMaSLk9SSUdJTjJEKTogU3ByaXRlRnJhbWUge1xyXG4gICAgICBsZXQgaW1nOiBUZXhJbWFnZVNvdXJjZSA9IHRoaXMuc3ByaXRlc2hlZXQudGV4dHVyZS50ZXhJbWFnZVNvdXJjZTtcclxuICAgICAgbGV0IHJlY3RUZXh0dXJlOiDGki5SZWN0YW5nbGUgPSBuZXcgxpIuUmVjdGFuZ2xlKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XHJcbiAgICAgIGxldCBmcmFtZTogU3ByaXRlRnJhbWUgPSBuZXcgU3ByaXRlRnJhbWUoKTtcclxuXHJcbiAgICAgIGZyYW1lLnJlY3RUZXh0dXJlID0gX2ZyYW1pbmcuZ2V0UmVjdChfcmVjdCk7XHJcbiAgICAgIGZyYW1lLnJlY3RUZXh0dXJlLnBvc2l0aW9uID0gX2ZyYW1pbmcuZ2V0UG9pbnQoX3JlY3QucG9zaXRpb24sIHJlY3RUZXh0dXJlKTtcclxuXHJcbiAgICAgIGxldCByZWN0UXVhZDogxpIuUmVjdGFuZ2xlID0gbmV3IMaSLlJlY3RhbmdsZSgwLCAwLCBfcmVjdC53aWR0aCAvIF9yZXNvbHV0aW9uUXVhZCwgX3JlY3QuaGVpZ2h0IC8gX3Jlc29sdXRpb25RdWFkLCBfb3JpZ2luKTtcclxuICAgICAgZnJhbWUubXR4UGl2b3QgPSDGki5NYXRyaXg0eDQuSURFTlRJVFkoKTtcclxuICAgICAgZnJhbWUubXR4UGl2b3QudHJhbnNsYXRlKG5ldyDGki5WZWN0b3IzKHJlY3RRdWFkLnBvc2l0aW9uLnggKyByZWN0UXVhZC5zaXplLnggLyAyLCAtcmVjdFF1YWQucG9zaXRpb24ueSAtIHJlY3RRdWFkLnNpemUueSAvIDIsIDApKTtcclxuICAgICAgZnJhbWUubXR4UGl2b3Quc2NhbGVYKHJlY3RRdWFkLnNpemUueCk7XHJcbiAgICAgIGZyYW1lLm10eFBpdm90LnNjYWxlWShyZWN0UXVhZC5zaXplLnkpO1xyXG4gICAgICAvLyDGki5EZWJ1Zy5sb2cocmVjdFF1YWQudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICBmcmFtZS5tdHhUZXh0dXJlID0gxpIuTWF0cml4M3gzLklERU5USVRZKCk7XHJcbiAgICAgIGZyYW1lLm10eFRleHR1cmUudHJhbnNsYXRlKGZyYW1lLnJlY3RUZXh0dXJlLnBvc2l0aW9uKTtcclxuICAgICAgZnJhbWUubXR4VGV4dHVyZS5zY2FsZShmcmFtZS5yZWN0VGV4dHVyZS5zaXplKTtcclxuXHJcbiAgICAgIHJldHVybiBmcmFtZTtcclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuICBcclxuICBleHBvcnQgY2xhc3MgQ29tcG9uZW50U3RhdGVNYWNoaW5lPFN0YXRlPiBleHRlbmRzIMaSLkNvbXBvbmVudFNjcmlwdCBpbXBsZW1lbnRzIFN0YXRlTWFjaGluZTxTdGF0ZT4ge1xyXG4gICAgcHVibGljIHN0YXRlQ3VycmVudDogU3RhdGU7XHJcbiAgICBwdWJsaWMgc3RhdGVOZXh0OiBTdGF0ZTtcclxuICAgIHB1YmxpYyBpbnN0cnVjdGlvbnM6IFN0YXRlTWFjaGluZUluc3RydWN0aW9uczxTdGF0ZT47XHJcblxyXG4gICAgcHVibGljIHRyYW5zaXQoX25leHQ6IFN0YXRlKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb25zLnRyYW5zaXQodGhpcy5zdGF0ZUN1cnJlbnQsIF9uZXh0LCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWN0KCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmluc3RydWN0aW9ucy5hY3QodGhpcy5zdGF0ZUN1cnJlbnQsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8qKlxyXG4gKiBTdGF0ZSBtYWNoaW5lIG9mZmVycyBhIHN0cnVjdHVyZSBhbmQgZnVuZGFtZW50YWwgZnVuY3Rpb25hbGl0eSBmb3Igc3RhdGUgbWFjaGluZXNcclxuICogPFN0YXRlPiBzaG91bGQgYmUgYW4gZW51bSBkZWZpbmluZyB0aGUgdmFyaW91cyBzdGF0ZXMgb2YgdGhlIG1hY2hpbmVcclxuICovXHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIC8qKiBGb3JtYXQgb2YgbWV0aG9kcyB0byBiZSB1c2VkIGFzIHRyYW5zaXRpb25zIG9yIGFjdGlvbnMgKi9cclxuICB0eXBlIFN0YXRlTWFjaGluZU1ldGhvZDxTdGF0ZT4gPSAoX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pID0+IHZvaWQ7XHJcbiAgLyoqIFR5cGUgZm9yIG1hcHMgYXNzb2NpYXRpbmcgYSBzdGF0ZSB0byBhIG1ldGhvZCAqL1xyXG4gIHR5cGUgU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZDxTdGF0ZT4gPSBNYXA8U3RhdGUsIFN0YXRlTWFjaGluZU1ldGhvZDxTdGF0ZT4+O1xyXG4gIC8qKiBJbnRlcmZhY2UgbWFwcGluZyBhIHN0YXRlIHRvIG9uZSBhY3Rpb24gbXVsdGlwbGUgdHJhbnNpdGlvbnMgKi9cclxuICBpbnRlcmZhY2UgU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+IHtcclxuICAgIGFjdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPjtcclxuICAgIHRyYW5zaXRpb25zOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kPFN0YXRlPjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvcmUgZnVuY3Rpb25hbGl0eSBvZiB0aGUgc3RhdGUgbWFjaGluZSwgaG9sZGluZyBzb2xlbHkgdGhlIGN1cnJlbnQgc3RhdGUgYW5kLCB3aGlsZSBpbiB0cmFuc2l0aW9uLCB0aGUgbmV4dCBzdGF0ZSxcclxuICAgKiB0aGUgaW5zdHJ1Y3Rpb25zIGZvciB0aGUgbWFjaGluZSBhbmQgY29tZm9ydCBtZXRob2RzIHRvIHRyYW5zaXQgYW5kIGFjdC5cclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lPFN0YXRlPiB7XHJcbiAgICBwdWJsaWMgc3RhdGVDdXJyZW50OiBTdGF0ZTtcclxuICAgIHB1YmxpYyBzdGF0ZU5leHQ6IFN0YXRlO1xyXG4gICAgcHVibGljIGluc3RydWN0aW9uczogU3RhdGVNYWNoaW5lSW5zdHJ1Y3Rpb25zPFN0YXRlPjtcclxuXHJcbiAgICBwdWJsaWMgdHJhbnNpdChfbmV4dDogU3RhdGUpOiB2b2lkIHtcclxuICAgICAgdGhpcy5pbnN0cnVjdGlvbnMudHJhbnNpdCh0aGlzLnN0YXRlQ3VycmVudCwgX25leHQsIHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhY3QoKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb25zLmFjdCh0aGlzLnN0YXRlQ3VycmVudCwgdGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgb2YgaW5zdHJ1Y3Rpb25zIGZvciBhIHN0YXRlIG1hY2hpbmUuIFRoZSBzZXQga2VlcHMgYWxsIG1ldGhvZHMgZm9yIGRlZGljYXRlZCBhY3Rpb25zIGRlZmluZWQgZm9yIHRoZSBzdGF0ZXNcclxuICAgKiBhbmQgYWxsIGRlZGljYXRlZCBtZXRob2RzIGRlZmluZWQgZm9yIHRyYW5zaXRpb25zIHRvIG90aGVyIHN0YXRlcywgYXMgd2VsbCBhcyBkZWZhdWx0IG1ldGhvZHMuXHJcbiAgICogSW5zdHJ1Y3Rpb25zIGV4aXN0IGluZGVwZW5kZW50bHkgZnJvbSBTdGF0ZU1hY2hpbmVzLiBBIHN0YXRlbWFjaGluZSBpbnN0YW5jZSBpcyBwYXNzZWQgYXMgcGFyYW1ldGVyIHRvIHRoZSBpbnN0cnVjdGlvbiBzZXQuXHJcbiAgICogTXVsdGlwbGUgc3RhdGVtYWNoaW5lLWluc3RhbmNlcyBjYW4gdGh1cyB1c2UgdGhlIHNhbWUgaW5zdHJ1Y3Rpb24gc2V0IGFuZCBkaWZmZXJlbnQgaW5zdHJ1Y3Rpb24gc2V0cyBjb3VsZCBvcGVyYXRlIG9uIHRoZSBzYW1lIHN0YXRlbWFjaGluZS5cclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lSW5zdHJ1Y3Rpb25zPFN0YXRlPiBleHRlbmRzIE1hcDxTdGF0ZSwgU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+PiB7XHJcbiAgICAvKiogRGVmaW5lIGRlZGljYXRlZCB0cmFuc2l0aW9uIG1ldGhvZCB0byB0cmFuc2l0IGZyb20gb25lIHN0YXRlIHRvIGFub3RoZXIqL1xyXG4gICAgcHVibGljIHNldFRyYW5zaXRpb24oX2N1cnJlbnQ6IFN0YXRlLCBfbmV4dDogU3RhdGUsIF90cmFuc2l0aW9uOiBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+KTogdm9pZCB7XHJcbiAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0U3RhdGVNZXRob2RzKF9jdXJyZW50KTtcclxuICAgICAgYWN0aXZlLnRyYW5zaXRpb25zLnNldChfbmV4dCwgX3RyYW5zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEZWZpbmUgZGVkaWNhdGVkIGFjdGlvbiBtZXRob2QgZm9yIGEgc3RhdGUgKi9cclxuICAgIHB1YmxpYyBzZXRBY3Rpb24oX2N1cnJlbnQ6IFN0YXRlLCBfYWN0aW9uOiBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+KTogdm9pZCB7XHJcbiAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0U3RhdGVNZXRob2RzKF9jdXJyZW50KTtcclxuICAgICAgYWN0aXZlLmFjdGlvbiA9IF9hY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERlZmF1bHQgdHJhbnNpdGlvbiBtZXRob2QgdG8gaW52b2tlIGlmIG5vIGRlZGljYXRlZCB0cmFuc2l0aW9uIGV4aXN0cywgc2hvdWxkIGJlIG92ZXJyaWRlbiBpbiBzdWJjbGFzcyAqL1xyXG4gICAgcHVibGljIHRyYW5zaXREZWZhdWx0KF9tYWNoaW5lOiBTdGF0ZU1hY2hpbmU8U3RhdGU+KTogdm9pZCB7XHJcbiAgICAgIC8vXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKiBEZWZhdWx0IGFjdGlvbiBtZXRob2QgdG8gaW52b2tlIGlmIG5vIGRlZGljYXRlZCBhY3Rpb24gZXhpc3RzLCBzaG91bGQgYmUgb3ZlcnJpZGVuIGluIHN1YmNsYXNzICovXHJcbiAgICBwdWJsaWMgYWN0RGVmYXVsdChfbWFjaGluZTogU3RhdGVNYWNoaW5lPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbnZva2UgYSBkZWRpY2F0ZWQgdHJhbnNpdGlvbiBtZXRob2QgaWYgZm91bmQgZm9yIHRoZSBjdXJyZW50IGFuZCB0aGUgbmV4dCBzdGF0ZSwgb3IgdGhlIGRlZmF1bHQgbWV0aG9kICovXHJcbiAgICBwdWJsaWMgdHJhbnNpdChfY3VycmVudDogU3RhdGUsIF9uZXh0OiBTdGF0ZSwgX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcclxuICAgICAgX21hY2hpbmUuc3RhdGVOZXh0ID0gX25leHQ7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZTogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+ID0gdGhpcy5nZXQoX2N1cnJlbnQpO1xyXG4gICAgICAgIGxldCB0cmFuc2l0aW9uOiBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+ID0gYWN0aXZlLnRyYW5zaXRpb25zLmdldChfbmV4dCk7XHJcbiAgICAgICAgdHJhbnNpdGlvbihfbWFjaGluZSk7XHJcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xyXG4gICAgICAgIC8vIGNvbnNvbGUuaW5mbyhfZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0RGVmYXVsdChfbWFjaGluZSk7XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgX21hY2hpbmUuc3RhdGVDdXJyZW50ID0gX25leHQ7XHJcbiAgICAgICAgX21hY2hpbmUuc3RhdGVOZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEludm9rZSB0aGUgZGVkaWNhdGVkIGFjdGlvbiBtZXRob2QgaWYgZm91bmQgZm9yIHRoZSBjdXJyZW50IHN0YXRlLCBvciB0aGUgZGVmYXVsdCBtZXRob2QgKi9cclxuICAgIHB1YmxpYyBhY3QoX2N1cnJlbnQ6IFN0YXRlLCBfbWFjaGluZTogU3RhdGVNYWNoaW5lPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0KF9jdXJyZW50KTtcclxuICAgICAgICBhY3RpdmUuYWN0aW9uKF9tYWNoaW5lKTtcclxuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5pbmZvKF9lcnJvci5tZXNzYWdlKTtcclxuICAgICAgICB0aGlzLmFjdERlZmF1bHQoX21hY2hpbmUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEZpbmQgdGhlIGluc3RydWN0aW9ucyBkZWRpY2F0ZWQgZm9yIHRoZSBjdXJyZW50IHN0YXRlIG9yIGNyZWF0ZSBhbiBlbXB0eSBzZXQgZm9yIGl0ICovXHJcbiAgICBwcml2YXRlIGdldFN0YXRlTWV0aG9kcyhfY3VycmVudDogU3RhdGUpOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4ge1xyXG4gICAgICBsZXQgYWN0aXZlOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4gPSB0aGlzLmdldChfY3VycmVudCk7XHJcbiAgICAgIGlmICghYWN0aXZlKSB7XHJcbiAgICAgICAgYWN0aXZlID0geyBhY3Rpb246IG51bGwsIHRyYW5zaXRpb25zOiBuZXcgTWFwKCkgfTtcclxuICAgICAgICB0aGlzLnNldChfY3VycmVudCwgYWN0aXZlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYWN0aXZlO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcclxuICAgIHB1YmxpYyBzdGF0aWMgZXhwYW5kQ2FtZXJhVG9JbnRlcmFjdGl2ZU9yYml0KF92aWV3cG9ydDogxpIuVmlld3BvcnQsIF9zaG93Rm9jdXM6IGJvb2xlYW4gPSB0cnVlLCBfc3BlZWRDYW1lcmFSb3RhdGlvbjogbnVtYmVyID0gMSwgX3NwZWVkQ2FtZXJhVHJhbnNsYXRpb246IG51bWJlciA9IDAuMDEsIF9zcGVlZENhbWVyYURpc3RhbmNlOiBudW1iZXIgPSAwLjAwMSk6IENhbWVyYU9yYml0IHtcclxuICAgICAgX3ZpZXdwb3J0LnNldEZvY3VzKHRydWUpO1xyXG4gICAgICBfdmlld3BvcnQuYWN0aXZhdGVQb2ludGVyRXZlbnQoxpIuRVZFTlRfUE9JTlRFUi5ET1dOLCB0cnVlKTtcclxuICAgICAgX3ZpZXdwb3J0LmFjdGl2YXRlUG9pbnRlckV2ZW50KMaSLkVWRU5UX1BPSU5URVIuTU9WRSwgdHJ1ZSk7XHJcbiAgICAgIF92aWV3cG9ydC5hY3RpdmF0ZVdoZWVsRXZlbnQoxpIuRVZFTlRfV0hFRUwuV0hFRUwsIHRydWUpO1xyXG4gICAgICBfdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9QT0lOVEVSLkRPV04sIGhuZFBvaW50ZXJEb3duKTtcclxuICAgICAgX3ZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfUE9JTlRFUi5NT1ZFLCBobmRQb2ludGVyTW92ZSk7XHJcbiAgICAgIF92aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKMaSLkVWRU5UX1dIRUVMLldIRUVMLCBobmRXaGVlbE1vdmUpO1xyXG5cclxuICAgICAgbGV0IGNudE1vdXNlSG9yaXpvbnRhbDogxpIuQ29udHJvbCA9IG5ldyDGki5Db250cm9sKFwiTW91c2VIb3Jpem9udGFsXCIpO1xyXG4gICAgICBsZXQgY250TW91c2VWZXJ0aWNhbDogxpIuQ29udHJvbCA9IG5ldyDGki5Db250cm9sKFwiTW91c2VWZXJ0aWNhbFwiKTtcclxuXHJcbiAgICAgIC8vIGNhbWVyYSBzZXR1cFxyXG4gICAgICBsZXQgY2FtZXJhOiBDYW1lcmFPcmJpdE1vdmluZ0ZvY3VzO1xyXG4gICAgICBjYW1lcmEgPSBuZXcgQ2FtZXJhT3JiaXRNb3ZpbmdGb2N1cyhfdmlld3BvcnQuY2FtZXJhLCA1LCA4NSwgMC4wMSwgMTAwMCk7XHJcbiAgICAgIF92aWV3cG9ydC5jYW1lcmEucHJvamVjdENlbnRyYWwoX3ZpZXdwb3J0LmNhbWVyYS5nZXRBc3BlY3QoKSwgX3ZpZXdwb3J0LmNhbWVyYS5nZXRGaWVsZE9mVmlldygpLCBfdmlld3BvcnQuY2FtZXJhLmdldERpcmVjdGlvbigpLCAwLjAxLCAxMDAwKTtcclxuXHJcbiAgICAgIC8vIHlzZXQgdXAgYXhpcyB0byBjb250cm9sXHJcbiAgICAgIGNhbWVyYS5heGlzUm90YXRlWC5hZGRDb250cm9sKGNudE1vdXNlVmVydGljYWwpO1xyXG4gICAgICBjYW1lcmEuYXhpc1JvdGF0ZVguc2V0RmFjdG9yKF9zcGVlZENhbWVyYVJvdGF0aW9uKTtcclxuXHJcbiAgICAgIGNhbWVyYS5heGlzUm90YXRlWS5hZGRDb250cm9sKGNudE1vdXNlSG9yaXpvbnRhbCk7XHJcbiAgICAgIGNhbWVyYS5heGlzUm90YXRlWS5zZXRGYWN0b3IoX3NwZWVkQ2FtZXJhUm90YXRpb24pO1xyXG4gICAgICAvLyBfdmlld3BvcnQuZ2V0QnJhbmNoKCkuYWRkQ2hpbGQoY2FtZXJhKTtcclxuXHJcbiAgICAgIGxldCBmb2N1czogxpIuTm9kZTtcclxuICAgICAgaWYgKF9zaG93Rm9jdXMpIHtcclxuICAgICAgICBmb2N1cyA9IG5ldyBOb2RlQ29vcmRpbmF0ZVN5c3RlbShcIkZvY3VzXCIpO1xyXG4gICAgICAgIGZvY3VzLmFkZENvbXBvbmVudChuZXcgxpIuQ29tcG9uZW50VHJhbnNmb3JtKCkpO1xyXG4gICAgICAgIF92aWV3cG9ydC5nZXRCcmFuY2goKS5hZGRDaGlsZChmb2N1cyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlZHJhdygpO1xyXG4gICAgICByZXR1cm4gY2FtZXJhO1xyXG5cclxuXHJcblxyXG4gICAgICBmdW5jdGlvbiBobmRQb2ludGVyTW92ZShfZXZlbnQ6IMaSLkV2ZW50UG9pbnRlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghX2V2ZW50LmJ1dHRvbnMpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBwb3NDYW1lcmE6IMaSLlZlY3RvcjMgPSBjYW1lcmEubm9kZUNhbWVyYS5tdHhXb3JsZC50cmFuc2xhdGlvbi5jb3B5O1xyXG5cclxuICAgICAgICBjbnRNb3VzZUhvcml6b250YWwuc2V0SW5wdXQoX2V2ZW50Lm1vdmVtZW50WCk7XHJcbiAgICAgICAgY250TW91c2VWZXJ0aWNhbC5zZXRJbnB1dChfZXZlbnQubW92ZW1lbnRZKTtcclxuICAgICAgICDGki5SZW5kZXIucHJlcGFyZShjYW1lcmEpO1xyXG5cclxuICAgICAgICBpZiAoX2V2ZW50LmFsdEtleSB8fCBfZXZlbnQuYnV0dG9ucyA9PSA0KSB7XHJcbiAgICAgICAgICBsZXQgb2Zmc2V0OiDGki5WZWN0b3IzID0gxpIuVmVjdG9yMy5ESUZGRVJFTkNFKHBvc0NhbWVyYSwgY2FtZXJhLm5vZGVDYW1lcmEubXR4V29ybGQudHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgY2FtZXJhLm10eExvY2FsLnRyYW5zbGF0ZShvZmZzZXQsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlZHJhdygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBobmRQb2ludGVyRG93bihfZXZlbnQ6IMaSLkV2ZW50UG9pbnRlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBwb3M6IMaSLlZlY3RvcjIgPSBuZXcgxpIuVmVjdG9yMihfZXZlbnQuY2FudmFzWCwgX2V2ZW50LmNhbnZhc1kpO1xyXG4gICAgICAgIGxldCBwaWNrczogxpIuUGlja1tdID0gxpIuUGlja2VyLnBpY2tWaWV3cG9ydChfdmlld3BvcnQsIHBvcyk7XHJcbiAgICAgICAgaWYgKHBpY2tzLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBpY2tzLnNvcnQoKF9hOiDGki5QaWNrLCBfYjogxpIuUGljaykgPT4gX2EuekJ1ZmZlciA8IF9iLnpCdWZmZXIgPyAtMSA6IDEpO1xyXG5cclxuICAgICAgICBsZXQgcG9zQ2FtZXJhOiDGki5WZWN0b3IzID0gY2FtZXJhLm5vZGVDYW1lcmEubXR4V29ybGQudHJhbnNsYXRpb247XHJcbiAgICAgICAgY2FtZXJhLm10eExvY2FsLnRyYW5zbGF0aW9uID0gcGlja3NbMF0ucG9zV29ybGQ7XHJcbiAgICAgICAgxpIuUmVuZGVyLnByZXBhcmUoY2FtZXJhKTtcclxuICAgICAgICBjYW1lcmEucG9zaXRpb25DYW1lcmEocG9zQ2FtZXJhKTtcclxuICAgICAgICByZWRyYXcoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gaG5kV2hlZWxNb3ZlKF9ldmVudDogV2hlZWxFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGNhbWVyYS5kaXN0YW5jZSAqPSAxICsgKF9ldmVudC5kZWx0YVkgKiBfc3BlZWRDYW1lcmFEaXN0YW5jZSk7XHJcbiAgICAgICAgcmVkcmF3KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHJlZHJhdygpOiB2b2lkIHtcclxuICAgICAgICBpZiAoZm9jdXMpXHJcbiAgICAgICAgICBmb2N1cy5tdHhMb2NhbC50cmFuc2xhdGlvbiA9IGNhbWVyYS5tdHhMb2NhbC50cmFuc2xhdGlvbjtcclxuICAgICAgICDGki5SZW5kZXIucHJlcGFyZShjYW1lcmEpO1xyXG4gICAgICAgIF92aWV3cG9ydC5kcmF3KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0iXX0=