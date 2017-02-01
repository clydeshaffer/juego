var rockmanSprite = new Juego.SpriteSheet('http://i.imgur.com/zyQUbWo.png', 10, 7);
rockmanSprite.center = new Vector2(20, 25);

var horizontalInputAxis = new Juego.Input.Axis(37, 39);
var jumpButton = new Juego.Input.Button(32);

var rockman = new Juego.RenderNode();
rockman.position = new Vector2(300,300);
rockman.scale = new Vector2(2, 2);
rockman.sprite = rockmanSprite;
rockman.update = function() {
    this.velocity.x = horizontalInputAxis.sample() * 100;
    if(this.position.y >= 475) {
        this.position.y = 475;
        this.velocity.y = 0;
        this.acceleration.y = 0;
        if(jumpButton.getButtonDown()) this.velocity.y = -300;

        if(this.velocity.x == 0) {
            this.spriteFrame = 0;
        } else {
            this.spriteFrame = Math.floor(Juego.Time.totalTime * 8) % 3 + 3;
            this.scale.x = Math.sign(this.velocity.x) * Math.abs(this.scale.y);
        }
    } else {
        this.spriteFrame = 6;
        rockman.acceleration.y = 400;
        if(this.velocity.x != 0) {
            this.scale.x = Math.sign(this.velocity.x) * Math.abs(this.scale.y);
        }
    }
}

var ground = new Juego.RenderNode();
ground.points = [
    new Vector2(0, 0),
    new Vector2(800, 0),
    new Vector2(800, 100),
    new Vector2(0, 100)
];
ground.position = new Vector2(0, 500);

ground.fillStyle = Juego.ctx.createLinearGradient(0, 0, 0, 100);
ground.fillStyle.addColorStop(0, "brown");
ground.fillStyle.addColorStop(1, "black");

var sky = new Juego.RenderNode();
sky.points = [
    new Vector2(0, 0),
    new Vector2(800, 0),
    new Vector2(800, 600),
    new Vector2(0, 600)
];
sky.fillStyle = Juego.ctx.createLinearGradient(0, 0, 0, 600);
sky.fillStyle.addColorStop(0, "gray");
sky.fillStyle.addColorStop(0.5, "gray");
sky.fillStyle.addColorStop(1, "black");

Juego.worldTree.addChild(sky);
Juego.worldTree.addChild(rockman);
Juego.worldTree.addChild(ground);


var transformationTester = new Juego.RenderNode()
transformationTester.points = Juego.CirclePoints(8, 16);
transformationTester.position.x = 400;
transformationTester.position.y = 200;
transformationTester.scale = transformationTester.scale.scale(2);

var transformationTesterChild = new Juego.RenderNode();
transformationTesterChild.points = Juego.CirclePoints(4, 8);
transformationTesterChild.position.x = 16;
transformationTester.addChild(transformationTesterChild);
Juego.worldTree.addChild(transformationTester);

transformationTester.update = function() {
    this.rotation += Juego.Time.deltaTime * Math.PI / 2;
    transformationTesterChild.rotation += Juego.Time.deltaTime;
    transformationTesterChild.position = transformationTesterChild.position.rotate(Juego.Time.deltaTime * 2);
}

var localToWorldTestGadget = new Juego.RenderNode();
localToWorldTestGadget.points = Juego.CirclePoints(3, 4);
localToWorldTestGadget.strokeStyle = "white";


Juego.worldTree.addChild(localToWorldTestGadget);

localToWorldTestGadget.update = function() {
    this.position = transformationTesterChild.localToWorld(new Vector2(8, 0));
}

Juego.ctx.imageSmoothingEnabled = false;
