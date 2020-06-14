let config = require("visual-config-exposer").default;

const DEBUG = false;

function calcGameSize() {
    if (window.mobile()) {
        return {
            w: window.innerWidth,
            h: window.innerHeight
        }
    }

    let aspectRatio = 10 / 16;
    let inverseAspectRatio = 16 / 10;

    let w = window.innerWidth;
    let h = w / aspectRatio;

    if (h > window.innerHeight) {
        h = window.innerHeight;
        w = h / inverseAspectRatio;
    }

    return {
        w, h
    }
}

function getBlockSize() {
    if (window.mobile()) {
        return config.settings.blockSize * 0.8;
    } else {
        return config.settings.blockSize;
    }
}

// --- Constants ---
const gameSize = calcGameSize();
let blockSize;
const blockSpeed = 350;
const blockSpeedIncrement = 10;
const blockFallingSpeed = 600;
let charHeight;
const playerFallingSpeed = 500;
// ---------------   

class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.image = window.images.block;
        this.rotation = 0;
        this.rotDir = random(100) < 50 ? 1 : -1;
        this.size = blockSize * 1.3;
    }

    draw(speed) {
        this.x += speed;

        if (this.size - blockSize > 0.1) {
            this.size = lerp(this.size, blockSize, 0.3);
        }

        imageMode(CENTER);
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        image(this.image, 0, 0, this.size, this.size);
        pop();
        imageMode(CORNER);
    }
}

class Player {
    constructor() {
        this.blocks = [];
        this.detached = [];
        this.placed = [];

        for (let i = 0; i < config.settings.blockCount; i++) {
            let x = (width / 2 - gameSize.w / 2 + blockSize * 2) + blockSize * i * 1.05;
            this.blocks.push(new Block(x, height - height / 2.5));
        }

        this.dir = 1;
        this.speed = blockSpeed;

        this.maxCharY = this.blocks[0].y - blockSize / 2 - charHeight;
        this.character = {
            x: width / 2,
            y: this.maxCharY,
            rot: 0,
            dir: random(100) < 50 ? -1 : 1
        };

        this.idleWidth = (charHeight / window.images.idle.height) * window.images.idle.width;
        this.jumpWidth = (charHeight / window.images.jump.height) * window.images.jump.width;

        this.comboCount = 0;
    }

    checkBounds() {
        if (this.blocks[0].x - blockSize / 2 < width / 2 - gameSize.w / 2) {
            this.dir = 1;
        }
        if (this.blocks[this.blocks.length - 1].x + blockSize / 2 > width / 2 + gameSize.w / 2) {
            this.dir = -1;
        }
    }

    updateCharacter() {
        let img;
        let imgWidth;

        if (this.character.y < this.maxCharY) {
            this.character.y += 250 * deltaTime / 1000;
            img = window.images.jump;
            imgWidth = this.jumpWidth;
        } else {
            img = window.images.idle;
            imgWidth = this.idleWidth;
        }

        if (this.blocks.length > 0) {
            this.character.x = this.blocks[0].x + (this.blocks[this.blocks.length - 1].x - this.blocks[0].x) / 2 - imgWidth / 2;
                
            if (this.character.y > this.maxCharY) {
                this.character.y = this.maxCharY;
            }
        } else {
            this.character.rot += this.character.dir * PI * 3 * deltaTime / 1000;
            this.character.y += playerFallingSpeed * deltaTime / 1000;
        }

        push();
        translate(this.character.x + imgWidth / 2, this.character.y + charHeight / 2);
        rotate(this.character.rot);
        imageMode(CENTER);
        image(img, 0, 0, imgWidth, charHeight);
        imageMode(CORNER);
        pop()
    }

    draw() {
        if (this.blocks.length > 0) this.checkBounds();

        this.blocks.map(b => {
            b.draw(this.speed * this.dir * deltaTime / 1000)
            return b;
        });

        this.placed = this.placed.filter(b => {
            b.draw(0);
            return b.y < height + blockSize * 1.1;
        });

        this.detached = this.detached.filter(b => {
            b.draw(0);
            b.y += blockFallingSpeed * deltaTime / 1000;
            b.rotation += b.rotDir * PI * deltaTime / 1000;
            b.x += blockFallingSpeed / 4 * b.rotDir * deltaTime / 1000;
            return b.y < height + blockSize * 1.1;
        });

        if (config.settings.showPlayer) this.updateCharacter();
    }

    mousePressed() {
        let newPlaced = [];

        this.blocks = this.blocks.filter(b => {
            if (this.placed.length == 0) {
                newPlaced.push(new Block(b.x, b.y));
                return true;
            }
            
            let minx = this.placed[this.placed.length - this.blocks.length].x - blockSize / 2;
            let maxx = this.placed[this.placed.length - 1].x + blockSize / 2;

            if (b.x + blockSize / 2 > minx && b.x - blockSize / 2 < maxx) {
                newPlaced.push(new Block(b.x, b.y));
                return true;
            }

            this.detached.push(new Block(b.x, b.y))
            return false;
        });
        
        if (!newPlaced.length == 0) {

            // check for combo

            if (this.placed.length != 0 && abs(newPlaced[0].x - this.placed[this.placed.length - this.blocks.length].x) < 10) {
                this.comboCount++;
                
                // snap new placed
                
                newPlaced = newPlaced.map((b, i) => {
                    b.x = this.placed[this.placed.length - newPlaced.length + i].x;
                    return b;
                });

            } else {
                this.comboCount = 0;
            }

            // ---------------  
            
            this.placed.push(...newPlaced);

            this.placed = this.placed.map(b => {
                b.y += blockSize * 1.05
                return b;
            });

            this.character.y = this.maxCharY - charHeight / 2;

            this.speed += blockSpeedIncrement;
        } else {
            this.finishGame();
            return false;
        }

        return true;
    }

    finishGame() {
        this.detached.push(...this.blocks);
        this.detached.push(...this.placed);
        this.blocks.length = 0;
        this.placed.length = 0;
    }
}

let player;

class Game {
    constructor() {
        this.defaults();
    
        blockSize = getBlockSize();
        charHeight = blockSize * 2.3;

        player = new Player();

        this.comboTextSize = this.scoreFontSize * 2.5;
        this.c_comboTextSize = this.comboTextSize;
        this.comboText = "";
        this.comboTextRotation = 0;
        this.comboTextY =  (height / 2) * 0.5;
        this.c_comboTextY = this.comboTextY;

        if (config.settings.fixedLength) {
            this.gameLength = config.settings.gameLength;
        }
    }

    permaUpdate() {
        
        // Draw screen bounds
        fill(color("rgba(0, 0, 0, 0.2)"));
        rect(0, 0, width / 2 - gameSize.w / 2, height);
        rect(width / 2 + gameSize.w / 2, 0, width / 2 - gameSize.w / 2, height);
        // ------------------------------ 
        
        player.draw();
    
        if (config.settings.depth) {
            setGradient(0, height - height / 4444, width, height / 5, color("rgba(0, 0, 0, 0)"), color("rgba(0, 0, 0, 0.4)"));
        }
    }

    drawComboText() {
        this.c_comboTextSize = lerp(this.c_comboTextSize, 0, 0.065);

        if (this.c_comboTextSize > this.comboTextSize * 0.1) {

            this.comboTextRotation = lerp(this.comboTextRotation, 0, 0.03);

            this.c_comboTextY = lerp(this.c_comboTextY, this.comboTextY * 1.4, 0.02);

            noStroke();
            textStyle(BOLD);
            textAlign(CENTER);
            textSize(this.c_comboTextSize);
            textFont(config.preGameScreen.fontFamily);
            fill(config.settings.comboTextColor);
            push();
            translate(width / 2, this.c_comboTextY);
            rotate(this.comboTextRotation);
            text(`x${player.comboCount + 1}: ${this.comboText}`, 0, 0);
            pop();
        }
    }

    updateGame() {
        if (config.settings.showComboText && this.comboText != "") {
            this.drawComboText();
        }

        if (this.gameLength) {
            this.gameLength -= deltaTime / 1000;
            if (this.gameLength < 0) {
                this.finishGame();
            }
        }
    }

    onMousePress() {
        if (player.mousePressed()) {
            this.score++;
            this.c_scoreFontSize = this.scoreFontSize * 2;
            if (player.comboCount > 1) {
                this.comboText = randomFromArray(Object.values(config.settings.comboTexts));
                this.c_comboTextSize = this.comboTextSize;
                this.c_comboTextY = this.comboTextY;
                this.comboTextRotation = random(-PI / 5, PI / 5);
            }
            playSound(window.sounds.tap);
        } else {
            if (!this.finished) {
                this.finishGame();
                playSound(window.sounds.lose);
            }
        }
    }

    finishGame() {
        if (!this.finished) {
            this.finished = true;
            player.finishGame();
        }
    }

    defaults() {
        noStroke();

        this.pressed = false;

        this.score = 0;

        // turn this var to true to end the game
        this.finished = false;
        
        this.particles = [];
    
        this.instructionsFontSize = height / 30;
        this.scoreFontSize = height / 20;
        this.delayBeforeExit = 1.2;

        // Don'touch these
        this.started = false;
        this.c_instructionsFontSize = 0;
        this.c_scoreFontSize = 0;
    }

    mousePressed() {
        if ((mouseIsPressed || keyIsDown(32)) && !this.mouse_pressed) {
            this.mouse_pressed = true;

            if (!this.started) {
                this.started = true;
            }
            if (this.started) {
                this.onMousePress();
            }
        } else if (!mouseIsPressed && !keyIsDown(32)){
            this.mouse_pressed = false;
        }        
    }

    calcBgImageSize() {
        // background image size calculations
        this.bgImage = window.images.background;
        let originalRatios = {
            width: window.innerWidth / this.bgImage.width,
            height: window.innerHeight / this.bgImage.height
        };
 
        let coverRatio = Math.max(originalRatios.width, originalRatios.height);
        this.bgImageWidth = this.bgImage.width * coverRatio;
        this.bgImageHeight = this.bgImage.height * coverRatio;
    }

    draw() {
        clear();    
        try {
            image(this.bgImage, width / 2 - this.bgImageWidth / 2, height / 2 - this.bgImageHeight / 2, this.bgImageWidth, this.bgImageHeight);
        } catch (err) {
            this.calcBgImageSize();
        }

        if (window.currentScreen == "gameScreen") {
            // Draw fps if in debug mode           
            if (DEBUG) {
                noStroke();
                fill(0);
                textAlign(LEFT);
                textFont("Arial");
                textSize(16);
                text(floor(frameRate()), 0, 15);
            }

            this.mousePressed();

            this.permaUpdate();

            if (this.started) {
                this.updateGame();
            }

            this.particles = this.particles.filter(p => {
                p.draw();
                return !p.dead;
            })

            // Animate instructions font size 
            // in and out
            if (this.instructionsFontSize - this.c_instructionsFontSize > 0.1 && !this.started) {
                this.c_instructionsFontSize = lerp(this.c_instructionsFontSize, this.instructionsFontSize, 0.2);
            }

            if (this.c_instructionsFontSize > 0.1) {
           
                if (this.started) {
                    this.c_instructionsFontSize = lerp(this.c_instructionsFontSize, 0, 0.4); 
                }
                
                textStyle(NORMAL);
                noStroke();
                fill(color(config.settings.textColor));
                textFont(config.preGameScreen.fontFamily);
                textSize(this.c_instructionsFontSize);
                textAlign(CENTER);

                text(config.settings.instructions1, width / 2, height / 10);
                text(config.settings.instructions2, width / 2, (height / 10) * 1.5);
                text(config.settings.instructions3, width / 2, (height / 10) * 2);
            }

            if (this.started) {
                this.c_scoreFontSize = lerp(this.c_scoreFontSize, this.scoreFontSize, 0.2);
                
                textStyle(NORMAL);
                noStroke();
                fill(color(config.settings.textColor));
                textAlign(CENTER);
                textSize(this.c_scoreFontSize);
                textFont(config.preGameScreen.fontFamily);
                text(this.score, width / 2, height / 6);

                if (!this.finished) {
                    textSize(this.scoreFontSize * 0.7);
                    textAlign(RIGHT);
                    text(this.gameLength.toFixed(1), width / 2 + gameSize.w / 2 - 30, 30);
                }
            }

            if (this.finished) {
                this.delayBeforeExit -= deltaTime / 1000;
            
                if (this.delayBeforeExit < 0) {
                    window.setEndScreenWithScore(this.score);
                }
            }       
        }
    }
}

// Helper functions

function playSound(sound) {
    try {   
        if (window.soundEnabled) {
            sound.play();
        }
    } catch (err) {
        console.log("error playing sound");
    }
}

function randomFromArray(arr) {
    return arr[floor(random(arr.length))];
}

function setGradient(x, y, w, h, c1, c2) {
    for (let i = y; i <= y + h; i++) {
        let inter = map(i, y, y + h, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(x, i, x + w, i);
    }
}

class Particle {
    constructor(x, y, acc, size, _color) {
        this.x = x;
        this.y = y;
        this.acc = acc;
        this.size = size;
        this.lifespan = random(0.5, 0.1);
        this.iLifespan = this.lifespan;
        this.iSize = this.size;
        this.dead = false;
        if (_color) {
            this.color = _color;
        }
        this.image;
        this.rotation = 0;
        this.rotSpeed = 0;
    }

    setLifespan(lifespan) {
        this.lifespan = lifespan;
        this.iLifespan = lifespan;
    }

    draw() {
        if (this.lifespan > 0) this.size = map(this.lifespan, this.iLifespan, 0, this.iSize, 0);

        this.lifespan -= deltaTime / 1000;

        this.rotation += this.rotSpeed * deltaTime / 1000;

        if (this.lifespan <= 0) this.dead = true;

        if (!this.dead) {

            this.x += this.acc.x;
            this.y += this.acc.y;

            if (this.image) {
                imageMode(CENTER);
                image(this.image, this.x, this.y, this.size, this.size);
                imageMode(CORNER);
            } else {
                fill(this.color);
                circle(this.x, this.y, this.size);
            }
        }
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.debugColor = color(255, 0, 0);
    }

    center() {
        return new Vector2(this.x + this.w / 2, this.y + this.h / 2);
    }

    top() {
        return this.y;
    }

    bottom() {
        return this.y + this.h;
    }

    left() {
        return this.x;
    }

    right() {
        return this.x + this.w;
    }

    includes(v) {
        if (v != null) {
            return v.x > this.x && v.y > this.y && v.x < this.right() && v.y < this.bottom();
        }
        return false;
    }
    
    debug() {
        if (DEBUG) {
            stroke(this.debugColor);
            rectMode(CORNER);
            noFill();
            rect(this.x, this.y, this.w, this.h);
        }
    }

    static FromPosition(x, y, w, h = w) {
        return new Rectangle(x - w / 2, y - h / 2, w, h);
    }
}

function intersectRect(r1, r2) {
    return !(r2.left() > r1.right() ||
        r2.right() < r1.left() ||
        r2.top() > r1.bottom() ||
        r2.bottom() < r1.top());
}

function randomParticleAcc(amt) {
    let x = random(-amt, amt);
    let y = random(-amt, amt);
    return { x, y };
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
}

//------------------------------ 

module.exports = Game;
