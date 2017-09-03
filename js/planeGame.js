class Enemy {
    constructor(ctx, config) {
        this.ctx = ctx;
        /**
         * 单个怪兽信息
         * @type {Array}
         * x,y : 坐标
         * status : 状态 0:存活 >0:死亡
         */
        this.enemys = [];
        this.border = {};
        this.config = {
            startx: 30,
            starty: 30,
            nowLevel: 2,
            numPerLine: 6,
            enemyImg: null,
            enemyBoomImg: null,
            enemyGap: 10,
            enemyBoomTime: 3,
            enemySpeed: 2,
            enemySpeedY: 50,
            enemyArea: {
                minX: 30,
                minY: 30,
                maxX: 670,
                maxY: 470
            },
            score: 1,
        }
        if (config) this.setConfig(config);
        this.setEnemys(0);
    }

    // 根据用户配置更改默认配置
    setConfig(config) {
        for (let key in config) {
            this.config[key] = config[key];
        }
    }

    /**
     * 设置怪兽坐标
     * @param {[int]} status 0:关卡初始化
     * @param {[int]} status 1:怪兽向平移
     * @param {[int]} status 2:怪兽向下移动
     * @param {[int]} status 3:怪兽死亡
     */
    setEnemys(status) {
        if (status == 0) {
            for (let i = 0; i < this.config.nowLevel; i++) {
                for (let j = 0; j < this.config.numPerLine; j++) {
                    this.enemys.push({
                        x: this.config.startx + j * (this.config.enemyImg.width + this.config.enemyGap),
                        y: this.config.starty + i * (this.config.enemyImg.height + this.config.enemyGap),
                        status: 0
                    });
                }
            }
            this.setBorder(status);
        } else if (status == 1) {
            if (this.config.enemySpeed < 0 && (this.border.minX + this.config.enemySpeed) < this.config.enemyArea.minX) {
                return this.setEnemys(2);
            }
            if (this.config.enemySpeed > 0 && (this.border.maxX + this.config.enemySpeed) > this.config.enemyArea.maxX) {
                return this.setEnemys(2);
            }
            for (let i = 0; i < this.enemys.length; i++) {
                this.enemys[i].x += this.config.enemySpeed;
            }
            this.setBorder(status);
        } else if (status == 2) {
            if (this.border.maxY + this.config.enemySpeedY > this.config.enemyArea.maxY) {
                return false;
            }
            for (let i = 0; i < this.enemys.length; i++) {
                this.enemys[i].y += this.config.enemySpeedY;
            }
            this.config.enemySpeed = -this.config.enemySpeed;
            this.setBorder(status);
            return true;
        }
        return true;
    }
    /**
     * 设置怪兽边界
     * @param {[int]} status 0:关卡初始化
     * @param {[int]} status 1:怪兽向平移
     * @param {[int]} status 2:怪兽向下移动
     * @param {[int]} status 3:怪兽死亡
     */
    setBorder(status) {
        if (status == 0) {
            this.border = {
                minX: this.enemys[0].x,
                minY: this.enemys[0].y,
                maxX: this.enemys[this.enemys.length - 1].x + this.config.enemyImg.width,
                maxY: this.enemys[this.enemys.length - 1].y + this.config.enemyImg.height,
            }
        } else if (status == 1) {
            this.border.minX = this.border.minX + this.config.enemySpeed;
            this.border.maxX = this.border.maxX + this.config.enemySpeed;
        } else if (status == 2) {
            this.border.minY = this.border.minY + this.config.enemySpeedY;
            this.border.maxY = this.border.maxY + this.config.enemySpeedY;
        } else if (status == 3) {
            this.border = {
                minX: this.config.enemyArea.maxX,
                minY: this.config.enemyArea.maxY,
                maxX: this.config.enemyArea.minX,
                maxY: this.config.enemyArea.minY,
            }
            for (let i = 0; i < this.enemys.length; i++) {
                if (this.enemys[i].status == 0) {
                    if (this.enemys[i].x < this.border.minX) {
                        this.border.minX = this.enemys[i].x;
                    }
                    if (this.enemys[i].y < this.border.minY) {
                        this.border.minY = this.enemys[i].y;
                    }
                    if (this.enemys[i].x + this.config.enemyImg.width > this.border.maxX) {
                        this.border.maxX = this.enemys[i].x + this.config.enemyImg.width;
                    }
                    if (this.enemys[i].y + this.config.enemyImg.height > this.border.maxY) {
                        this.border.maxY = this.enemys[i].y + this.config.enemyImg.height;
                    }
                }
            }
        }
    }
    // 存活怪兽数量
    liveEnemyNum() {
        let count = 0;
        for (let i = 0; i < this.enemys.length; i++) {
            if (this.enemys[i].status == 0) count++;
        }
        return count;
    }
    /**
     * 子弹射击
     * @param  {[type]} x      [description]
     * @param  {[type]} y      [description]
     * @param  {[type]} length [description]
     * @return {[bool]} true:击中怪兽 false:没有击中
     */
    shoot(x, y, length) {
        if (x < this.border.minX || x > this.border.maxX || y > this.border.maxY || y + length < this.border.minY)
            return false;
        let enemyOne = {};
        for (let i = 0; i < this.enemys.length; i++) {
            enemyOne = this.enemys[i];
            if (x >= enemyOne.x && x <= enemyOne.x + this.config.enemyImg.width && y >= enemyOne.y && y + length <= enemyOne.y + this.config.enemyImg.height && enemyOne.status == 0) {
                enemyOne.status = 1;
                if (this.liveEnemyNum() > 0) this.setBorder(3);
                return true;
            }
        }
        return false;
    }
    // 怪兽绘制
    draw() {
        for (let i = this.enemys.length - 1; i >= 0; i--) {
            if (this.enemys[i].status == 0) {
                this.ctx.drawImage(this.config.enemyImg, this.enemys[i].x, this.enemys[i].y, this.config.enemyImg.width, this.config.enemyImg.height);
            } else {
                this.ctx.drawImage(this.config.enemyBoomImg, this.enemys[i].x, this.enemys[i].y, this.config.enemyImg.width, this.config.enemyImg.height);
                this.enemys[i].status++;
                if (this.enemys[i].status > this.config.enemyBoomTime) {
                    this.enemys.splice(i, 1);
                }
            }

        }
    }

}

class PlaneGame {
    // 只需进行一次的配置
    constructor(config) {
        // 游戏默认配置
        this.config = {
            status: 'start', // 游戏开始默认为开始中
            level: 1, // 游戏默认等级
            totalLevel: 6, // 总共6关
            numPerLine: 6, // 游戏默认每行多少个怪兽
            canvasPadding: 30, // 默认画布的间隔
            bulletSize: 10, // 默认子弹长度
            bulletSpeed: 5, // 默认子弹的移动速度
            enemySpeed: 2, // 默认敌人移动距离
            enemySpeedY: 50, // 默认敌人移动距离
            enemySize: 50, // 默认敌人的尺寸
            enemyGap: 10, // 默认敌人之间的间距
            enemyIcon: './img/enemy.png', // 怪兽的图像
            enemyBoomIcon: './img/boom.png', // 怪兽死亡的图像
            enemyBoomTime: 3, // 怪兽死亡时间
            enemyDirection: 'right', // 默认敌人一开始往右移动
            planeSpeed: 5, // 默认飞机每一步移动的距离
            planeSize: {
                width: 60,
                height: 100
            }, // 默认飞机的尺寸,
            planeIcon: './img/plane.png',
        };
        if (config) this.setConfig(config);
        this.setImg();
        this.setKeydown();

        // 当前分数
        this.score = 0;
        // 当前关卡
        this.nowLevel = this.config.level;

        // 飞机坐标及移动距离
        this.plane = {
            x: 350 - this.config.planeSize.width / 2,
            y: 600 - this.config.canvasPadding - this.config.planeSize.height,
            move: 0,
        };

        // 元素获取
        document.getElementById("game").innerHTML = `
            <div id="game_info">
            </div>
            <div id="game_box">
                <p class="game_box_line">分数：<span id="game_box_score"></span></p>
                <canvas id="game_canvas" width="700" height="600"></canvas>
            </div>`;
        this.canvas = document.getElementById("game_canvas");
        this.ctx = this.canvas.getContext("2d");
        this.gameInfo = document.getElementById("game_info");
        this.gameBox = document.getElementById("game_box");
        this.gameNextLevel(-1);
    }

    // 每次游戏都需进行的配置
    gameInit() {
        this.scoreSpan = document.getElementById("game_box_score");
        // 飞机坐标及移动距离
        this.plane = {
            x: 350 - this.config.planeSize.width / 2,
            y: 600 - this.config.canvasPadding - this.config.planeSize.height,
            move: 0,
        };
        /**
         * 子弹坐标
         * @type {Array}
         * 例:[{x:10,y:20},{x:20,y:30}]
         */
        this.bullets = [];

        // 怪兽对象
        this.enemy = new Enemy(this.ctx, {
            startx: this.config.canvasPadding,
            starty: this.config.canvasPadding,
            nowLevel: this.nowLevel,
            enemyImg: this.enemyImg,
            enemyBoomImg: this.enemyBoomImg,
            enemyBoomTime: this.config.enemyBoomTime,
            enemySpeed: this.config.enemySpeed,
            enemySpeedY: this.config.enemySpeedY,
            enemyArea: {
                minX: this.config.canvasPadding,
                minY: this.config.canvasPadding,
                maxX: this.canvas.width - this.config.canvasPadding,
                maxY: this.canvas.height - this.config.canvasPadding - this.planeImg.height
            },
        });

        // 分数显示
        this.scoreSpan.innerHTML = this.score;
    }

    // 根据用户配置更改默认配置
    setConfig(config) {
        for (let key in config) {
            this.config[key] = config[key];
        }
    }

    // 初始化图像元素
    setImg() {
        // plane img
        this.planeImg = new Image();
        this.planeImg.src = this.config.planeIcon;
        this.planeImg.width = this.config.planeSize.width;
        this.planeImg.height = this.config.planeSize.height;
        // enemy img
        this.enemyImg = new Image();
        this.enemyImg.src = this.config.enemyIcon;
        this.enemyImg.width = this.config.enemySize;
        this.enemyImg.height = this.config.enemySize;
        // enemyBoom img
        this.enemyBoomImg = new Image();
        this.enemyBoomImg.src = this.config.enemyBoomIcon;
        this.enemyBoomImg.width = this.config.enemySize;
        this.enemyBoomImg.height = this.config.enemySize;
    }

    // 键盘事件绑定
    setKeydown() {
        document.onkeydown = (event) => {
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if (e && e.keyCode == 37) { // 按 ←
                console.log("left");
                this.plane.move = -this.config.planeSpeed;
            }
            if (e && e.keyCode == 39) { // 按 → 
                console.log("right");
                this.plane.move = this.config.planeSpeed;
            }
            if (e && e.keyCode == 32) { // space 键
                console.log("bullet");
                // this.scoreSpan.innerHTML = parseInt(this.scoreSpan.innerHTML) + 1;
                this.bullets.push({
                    x: this.plane.x + this.planeImg.width / 2,
                    y: this.plane.y
                })
            }

        };
        document.onkeyup = (event) => {
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if (e && e.keyCode == 37 && this.plane.move < 0) { // 松开 ←
                console.log("left cancel");
                this.plane.move = 0;
            }
            if (e && e.keyCode == 39 && this.plane.move > 0) { // 松开 → 
                console.log("rightt cancel");
                this.plane.move = 0;
            }
        };
    }

    drawBullet(index) {
        if (this.bullets[index].y <= -this.config.bulletSize) {
            this.bullets.splice(index, 1);
            return false;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(this.bullets[index].x, this.bullets[index].y);
        this.ctx.lineTo(this.bullets[index].x, this.bullets[index].y + this.config.bulletSize);
        this.ctx.closePath();
        this.ctx.stroke();
        this.bullets[index].y -= this.config.bulletSpeed;
        return true;
    }


    // 绘制场景
    draw() {
        this.ctx.clearRect(0, 0, 700, 600);
        // 绘制飞机
        if (this.plane.x + this.plane.move >= this.config.canvasPadding && this.plane.x + this.plane.move <= (700 - this.config.canvasPadding - this.planeImg.width)) this.plane.x += this.plane.move;
        this.ctx.drawImage(this.planeImg, this.plane.x, this.plane.y, this.planeImg.width, this.planeImg.height);
        // 绘制怪兽
        if (this.enemy.enemys.length == 0) {
            this.gameNextLevel(++this.nowLevel);
            return;
        }
        this.enemy.draw();
        if (!this.enemy.setEnemys(1)) {
            this.gameEnd();
            return;
        }
        // 绘制子弹
        this.ctx.strokeStyle = 'white';
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            // 向怪兽发射子弹
            if (this.enemy.shoot(this.bullets[i].x, this.bullets[i].y, this.config.bulletSize)) {
                // 击中
                this.bullets.splice(i, 1);
                this.score++;
                this.scoreSpan.innerHTML = this.score;
            } else {
                // 没击中
                this.drawBullet(i);
            }
        }
        window.requestAnimationFrame(this.draw.bind(this));
    }

    gameStart() {
        console.log("game start");
        this.gameInfo.style.display = "none";
        this.gameBox.style.display = "block";
        this.gameInit();
        this.draw();
    }

    gameNextLevel(level) {
        if (level == -1) {
            console.log("game start");
            this.gameInfo.innerHTML = `
                <div class="game_info_left">
                    <h1 class="game_info_line">射击游戏</h1>
                    <p class="game_info_line">
                        这是一个令人欲罢不能的射击游戏，使用 ← 和 → 操作你的飞机，使用空格（space）进行射击。一起来消灭宇宙怪兽吧！
                    </p>
                    <p class="game_info_line">
                        当前Level：<span id="game_info_line_nowLevel">${this.nowLevel}</span>
                    </p>
                    <button class="game_info_line btn" id="game_info_start_btn">
                        开始游戏
                    </button>
                </div>
                <div class="game_info_right">
                    <img src="img/bg.png">
                </div>`;
        } else {
            console.log("next level");
            this.gameInfo.innerHTML = `
                <div class="game_info_left">
                    <h1 class="game_info_line">游戏成功</h1>
                    <p class="game_info_line">
                        下一个Level：<span id="game_info_line_nowLevel">${level}</span>
                    </p>
                    <button class="game_info_line btn" id="game_info_start_btn">
                        继续游戏
                    </button>
                </div>
                <div class="game_info_right">
                    <img src="img/bg.png">
                </div>`;
        }
        this.gameBox.style.display = "none";
        this.gameInfo.style.display = "flex";
        this.btnStart = document.getElementById("game_info_start_btn");

        // 页面元素设置
        this.btnStart.onclick = () => {
            this.gameStart();
        }
    }

    gameEnd() {
        console.log("game end");
        this.gameInfo.innerHTML =
            `
                    <div class="game_info_left">
                        <h1 class="game_info_line">游戏结束</h1>
                        <p class="game_info_line">
                            最终得分：<span>${this.score}</span>
                        </p>
                        <button class="game_info_line btn" id="game_info_start_btn">
                            重新开始
                        </button>
                    </div>
                    <div class="game_info_right">
                        <img src="img/bg.png">
                    </div>`;
        this.gameBox.style.display = "none";
        this.gameInfo.style.display = "flex";
        this.btnStart = document.getElementById("game_info_start_btn");

        // 页面元素设置
        this.btnStart.onclick = () => {
            this.nowLevel = this.config.level;
            this.score = 0;
            this.gameStart();
        }
    }
}