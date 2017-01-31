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
ground.fillStyle = "brown";

var sky = new Juego.RenderNode();
sky.points = [
    new Vector2(0, 0),
    new Vector2(800, 0),
    new Vector2(800, 600),
    new Vector2(0, 600)
];
sky.fillStyle = "gray";

Juego.worldTree.children.push(sky);
Juego.worldTree.children.push(rockman);
Juego.worldTree.children.push(ground);

Juego.ctx.imageSmoothingEnabled = false;