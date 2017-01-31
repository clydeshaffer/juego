var ball = new RenderNode();

ball.points = CirclePoints(16, 16);

ball.position = new Vector2(200, 200);

worldTree.children.push(ball);

ball.position.x = 100;

var miniBall = new RenderNode();

miniBall.position = new Vector2(0, -24);

miniBall.points = CirclePoints(16, 8);

ball.children.push(miniBall);


var prevBall = miniBall;

var wiggle = function() {
    this.rotation = Math.sin(Time.totalTime / 1000) * Math.PI / 8;
};

ball.update = wiggle;
miniBall.update = wiggle;

function growTentacle() {
    var newBall = new RenderNode();
    newBall.position = new Vector2(0, -16);
    newBall.points = CirclePoints(16, 8);
    newBall.update = wiggle;
    prevBall.children.push(newBall);
    prevBall = newBall;
}

growTentacle();
growTentacle();
growTentacle();
growTentacle();


var rockmanSprite = new SpriteSheet('http://i.imgur.com/zyQUbWo.png', 10, 7);

var rockman = new RenderNode();
rockman.position = new Vector2(300,300);
rockman.sprite = rockmanSprite;
rockman.update = function() {
    this.spriteFrame = Math.floor(Time.totalTime / 125) % 70;
}

worldTree.children.push(rockman);

ctx.imageSmoothingEnabled = false;