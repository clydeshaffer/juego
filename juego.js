function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

Vector2.prototype.toString = function() { return "(" + this.x + ", " + this.y + ")"; }

Vector2.prototype.plot = function(context) {
    context.fillRect(this.x, this.y, 1, 1);
}

Vector2.prototype.add = function(v) { return new Vector2(this.x + v.x, this.y + v.y); }

Vector2.prototype.scale = function(v) {
    if(typeof v == "number") {
        return new Vector2(this.x * v, this.y * v);
    } else {
        return new Vector2(this.x * v.x, this.y * v.y);
    }
}

Vector2.prototype.rotate = function(radians) {
    var cos = Math.cos(-radians);
    var sin = Math.sin(-radians);
    return new Vector2(
        (cos * this.x) + (sin * this.y),
        (cos * this.y) - (sin * this.x)
    );
}

Vector2.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
}

Vector2.prototype.midpoint = function (v) {
    return this.add(v).scale(0.5);
}

Vector2.randomOnUnitCircle = function() {
    var angle = Math.random() * Math.PI * 2;
    return new Vector2(Math.cos(angle), Math.sin(angle));
}

Vector2.zero = new Vector2(0, 0);

var Juego = new (function () {


    function CirclePoints(n, r) {
        var points = [];
        var angleStep = 2 * Math.PI / n;
        var i = 0;
        for(i = 0; i < n; i++) {
            points.push(new Vector2(Math.cos(i * angleStep) * r, Math.sin(i * angleStep) * r));
        }
        return points;
    }

    function randInt(x) {
        return Math.floor(Math.random() * x);
    }

    var canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    function _x(v) { return v ? v.x : v};
    function _y(v) { return v ? v.y : v};

    function V_(someFunc) {
        return function(v1, v2, v3, a, b, c, d, e) {
            return someFunc(_x(v1), _y(v1),
                _x(v2), _y(v2),
                _x(v3), _y(v3),
                a, b, c, d, e);
        }
    }

    var vctx = {};
    var funcsToBind = [
        "fillRect",
        "strokeRect",
        "lineTo",
        "moveTo",
        "translate",
        "scale"
    ];

    function plot(v) {
        vctx.fillRect(v, new Vector2(1, 1));
    }

    funcsToBind.forEach(function(funcName) {
        vctx[funcName] = V_(ctx[funcName].bind(ctx));
    })

    function tracePoints(pointArray) {
        ctx.beginPath();
        vctx.moveTo(pointArray[0]);
        pointArray.forEach(vctx.lineTo);
        vctx.lineTo(pointArray[0]);
        ctx.closePath();
        ctx.stroke();       
    }


    function testPoints(a, b, c) {
        if(Array.isArray(a)) return testPoints(a[0], a[1], a[2]);

        var midAC = a.midpoint(c);
        var bToMidAC = midAC.add(b.scale(-1));
        return (bToMidAC.dot(midAC) < 0);
    }

    function bindArray(arr) {
        return function(i) {
            return arr[i];
        }
    }

    function testConvex(pointArray) {
        var arrfunc = bindArray(pointArray);
        for(var i = pointArray.length; i < pointArray.length * 2; i ++) {
            var iA = (i - 1) % pointArray.length;
            var iB = i % pointArray.length;
            var iC = (i + 1) % pointArray.length;

            if(!testPoints([iA, iB, iC].map(arrfunc))) return false;

        }
        return true;
    }

    function mutate(pointArray, iterations, strength) {
        var k = iterations * pointArray.length;
        for(var i = 0; i < pointArray.length; i ++) {
            var imod = i % pointArray.length;

            var oldPoint = pointArray[imod];
            var offset = Vector2.randomOnUnitCircle().scale(strength);
            pointArray[imod] = oldPoint.add(offset);
            if(!testConvex(pointArray)) {
                pointArray[imod] = oldPoint;
            }

        }
    }

    function SpriteSheet(url, columns, rows) {
        this.center = new Vector2(0, 0);
        this.rows = rows;
        this.columns = columns;
        this.frameCount = rows * columns;
        this.tileRows = 1;
        this.tileColumns = 1;
        this.ready = false;
        this.imgElem = document.createElement("img");
        this.imgElem.style = "display:none;";
        var self = this;
        this.imgElem.onload = function() {
            self.ready = true;
        }
        document.body.appendChild(this.imgElem);
        this.imgElem.src = url;
    }

    SpriteSheet.prototype.draw = function(frame, tileColumns, tileRows) {
        if(this.ready) {
            tileColumns = tileColumns || 1;
            tileRows = tileRows || 1;
            var c = frame % this.columns;
            var r = (frame - c) / this.columns;
            var width = this.imgElem.width / this.columns;
            var height = this.imgElem.height / this.rows;

            for(var i = 0; i < tileColumns; i++) {
                for(var k = 0; k < tileRows; k++) {
                    ctx.drawImage(this.imgElem,
                        c * this.imgElem.width / this.columns, r * this.imgElem.height / this.rows,
                        width,  height,
                        i * width - this.center.x, k * height - this.center.y,
                        width, height);
                }
            }
        }
    }

    function doNothing() {}

    function RenderNode() {
        this.position = new Vector2(0, 0);
        this.rotation = 0;
        this.scale = new Vector2(1,1);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.children = [];
        this.parent = null;
        this.points = [];
        this.sprite = null;
        this.spriteFrame = 0;
        this.strokeStyle = "black";
        this.fillStyle = null;
        this.update = doNothing;
        this.static = false;
        this.traversalFlag = false; //security against cyclic RenderNode hierarchy
    }

    RenderNode.prototype.updateTree = function(traversal) {
        if(this.traversalFlag == traversal) return;
        this.traversalFlag = traversal;
        this.update();


        //d = v0t + 1/2 a t^2
        this.velocity = this.velocity.add(this.acceleration.scale(Time.deltaTime));
        var deltaPosition = this.velocity.scale(Time.deltaTime).add(this.acceleration.scale(Math.pow(Time.deltaTime, 2) / 2));
        this.position = this.position.add(deltaPosition);

        this.children.forEach(function(child) {
            child.updateTree(traversal);
        });
    }

    RenderNode.prototype.renderTree = function(traversal) {
        if(this.traversalFlag == traversal) return;
        this.traversalFlag = traversal;
        ctx.save();    
        vctx.translate(this.position);
        ctx.rotate(this.rotation);
        vctx.scale(this.scale); 
        if(this.sprite) {
            this.sprite.draw(this.spriteFrame, this.tileColumns, this.tileRows);
        }
        if(this.strokeStyle) {
            ctx.strokeStyle = this.strokeStyle;
            tracePoints(this.points);
        }
        if(this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        this.children.forEach(function(child) {
            child.renderTree();
        });
        ctx.restore();
    }

    RenderNode.prototype.addChild = function(newChild) {
        this.children.push(newChild);
        newChild.parent = this;
    }

    RenderNode.prototype.transformLocalPoint = function(vec) {
        return vec.scale(this.scale).rotate(this.rotation).add(this.position);
    }

    RenderNode.prototype.localToWorld = function(vec) {
        var v = vec;
        v = this.transformLocalPoint(v);
        if(this.parent) {
            v = this.parent.localToWorld(v);
        }
        return v;
    }

    var worldTree = new RenderNode();

    var previousRenderTime = 0;
    var traversalFlag = true;

    var Time = {
        deltaTime : 0,
        totalTime : 0
    }

    var Input = {};

    Input.Axis = function(negativeKey, positiveKey) {
        this.positiveKey = positiveKey;
        this.negativeKey = negativeKey;

        this.positiveKeyPressed = 0;
        this.negativeKeyPressed = 0;

        var self = this;
        function makeKeyUpdate(keyStatus) {
            return function(event) {
                if(event.keyCode == positiveKey) {
                    self.positiveKeyPressed = keyStatus;
                } else if(event.keyCode == negativeKey) {
                    self.negativeKeyPressed = keyStatus;
                }
            }
        }

        window.addEventListener("keydown", makeKeyUpdate(1));
        window.addEventListener("keyup", makeKeyUpdate(0));
    }

    Input.Axis.prototype.sample = function() {
        return this.positiveKeyPressed - this.negativeKeyPressed;
    }

    Input.buttons = [];

    Input.Button = function(keyCode) {
        this.pressed = false;
        this.wasPressed = false;
        var self = this;
        function makeKeyUpdate(keyStatus) {
            return function(event) {
                if(event.keyCode == keyCode) {
                    self.pressed = keyStatus;
                }
            }
        }

        window.addEventListener("keydown", makeKeyUpdate(1));
        window.addEventListener("keyup", makeKeyUpdate(0));

        Input.buttons.push(this);
    }

    Input.Button.prototype.sample = function() {
        return this.pressed;
    }

    Input.Button.prototype.getButtonDown = function() {
        return this.pressed && !this.wasPressed;
    }

    Input.Button.prototype.getButtonUp = function() {
        return !this.pressed && this.wasPressed;
    }

    Input.tick = function() {
        Input.buttons.forEach(function(button) {
            button.wasPressed = button.pressed;
        });
    }

    function drawFrame(timestamp) {
        var deltaT = timestamp - previousRenderTime;
        ctx.clearRect(0, 0, 800, 600);
        Time.totalTime = timestamp / 1000;
        Time.deltaTime = deltaT / 1000;
        worldTree.updateTree(traversalFlag);
        traversalFlag = !traversalFlag;
        worldTree.renderTree(traversalFlag);
        traversalFlag = !traversalFlag;
        previousRenderTime = timestamp;
        Input.tick();
        window.requestAnimationFrame(drawFrame);
    }

    function initRenderTimer(timestamp) {
        previousRenderTime = timestamp;
        window.requestAnimationFrame(drawFrame);
    }

    window.requestAnimationFrame(initRenderTimer);


    this.CirclePoints = CirclePoints;
    this.randInt = randInt;
    this.RenderNode = RenderNode;
    this.Input = Input;
    this.SpriteSheet = SpriteSheet;
    this.Time = Time;
    this.worldTree = worldTree;
    this.ctx = ctx;
    this.vctx = vctx;
})();