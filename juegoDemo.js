var ball = new Juego.RenderNode();

ball.points = Juego.CirclePoints(16, 16);

ball.position = new Vector2(200, 200);

Juego.worldTree.children.push(ball);

ball.position.x = 100;

var miniBall = new Juego.RenderNode();

miniBall.position = new Vector2(0, -24);

miniBall.points = Juego.CirclePoints(16, 8);

ball.children.push(miniBall);


var prevBall = miniBall;

var wiggle = function() {
    this.rotation = Math.sin(Juego.Time.totalTime / 1000) * Math.PI / 8;
};

ball.update = wiggle;
miniBall.update = wiggle;

function growTentacle() {
    var newBall = new Juego.RenderNode();
    newBall.position = new Vector2(0, -16);
    newBall.points = Juego.CirclePoints(16, 8);
    newBall.update = wiggle;
    prevBall.children.push(newBall);
    prevBall = newBall;
}

growTentacle();
growTentacle();
growTentacle();
growTentacle();


var rockmanSprite = new Juego.SpriteSheet('http://i.imgur.com/zyQUbWo.png', 10, 7);

var horizontalInputAxis = new Juego.InputAxis(37, 39);

var rockman = new Juego.RenderNode();
rockman.position = new Vector2(300,300);
rockman.sprite = rockmanSprite;
rockman.update = function() {
    this.spriteFrame = Math.floor(Juego.Time.totalTime / 125) % 70;
    this.position.x += horizontalInputAxis.sample() * Juego.Time.deltaTime / 25;
}

Juego.worldTree.children.push(rockman);

Juego.ctx.imageSmoothingEnabled = false;