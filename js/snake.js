/**
 * @author loki
 */
;
(function(){
    function Map(rows, cols){
        var self = this;
        self.rows = rows;
        self.cols = cols;
        self.cellSize = 12;
        self.topPadding = 10;
        self.leftPadding = 10;
        self.cells = {}; // 0:floor 1:snake 2:food
    }
    
    Map.prototype = {
        create: function(){
            var self = this;
            ctx.fillStyle = "gray";
            ctx.strokeStyle = '#0ff';
            ctx.beginPath();
            for (var x = 0; x < self.rows; x++) {
                self.cells[x] = {};
                for (var y = 0; y < self.cols; y++) {
                    ctx.fillRect(self.leftPadding + self.cellSize * y, self.topPadding + self.cellSize * x, self.cellSize, self.cellSize);
                    self.cells[x][y] = {
                        state: 0
                    };
                }
            }
            ctx.fill();
        },
        getCellByXY: function(x, y){
            return this.cells[x][y];
        },
        draw: function(){
            var self = this;
            ctx.beginPath();
            for (var x = 0; x < self.rows; x++) {
                for (var y = 0; y < self.cols; y++) {
                    var state = self.cells[x][y].state;
                    if (state == 1) {
                        ctx.fillStyle = '#FF0';
                    }
                    else 
                        if (state == 2) {
                            ctx.fillStyle = '#F00';
                        }
                        else {
                            ctx.fillStyle = 'gray';
                        }
                    ctx.fillRect(self.leftPadding + x * self.cellSize, self.topPadding + y * self.cellSize, self.cellSize, self.cellSize);
                }
            }
            ctx.fill();
        }
    };
    
    function Food(){
        var self = this, cell;
        self.x = Math.floor(Math.random() * map.rows);
        self.y = Math.floor(Math.random() * map.cols);
        self.onSnake = 0; // the food is generated on the snake body
        cell = map.getCellByXY(self.x, self.y);
        if (cell.state == 1) {
            self.onSnake = 1;
        }
        cell.state = 2;
    }
    
    function Snake(x, y, direct, len, speed){
        var self = this;
        self.body = [];
        if (len < 3) {
            len = 3;
        }
        else 
            if (len > 5) {
                len = 5;
            }
        for (var i = 0; i < len; i++) {
            var tmp_x = x + direct.x * i;
            var tmp_y = y + direct.y * i;
            this.body.unshift({
                x: tmp_x,
                y: tmp_y
            });
        }
        if (speed < 1) {
            self.speed = 1;
        }
        else 
            if (speed > 10) {
                self.speed = 10;
            }
            else {
                self.speed = speed;
            }
        self.direct = direct;
        self.timer = null;
        if (self.timer == null) {
            self.resume();
        }
    }
    Snake.prototype = {
        move: function(){
            var self = this;
            //console.debug(this.direct);
            var cell, head = self.body[0], newhead = {
                x: head.x + self.direct.x,
                y: head.y + self.direct.y
            };
            if (newhead.x < 0 || newhead.x > map.rows - 1 || newhead.y < 0 || newhead.y > map.cols - 1) {
                self.die();
                return false;
            }
            var len = self.body.length;
            var show = 0;
            for (var i = 0; i < len; i++) {
                var current = self.body[i];
                var currentCell = map.cells[current.x][current.y];
                if (newhead.x == current.x && newhead.y == current.y) { // check whether the snake hit his body
                    self.die();
                    return false;
                }
                currentCell.state = 1;
                if (i == 0) {
                    continue;
                }
                if (food.onSnake == 0) {
                    continue;
                }
                if (show == 1) {
                    continue;
                }
                if (food.x == current.x && food.y == current.y) {
                    currentCell.state = 2;
                    show = 1;
                }
            }
            var newheadCell = map.getCellByXY(newhead.x, newhead.y);
            newheadCell.state = 1;
            self.body.unshift(newhead);
            if (food.x == newhead.x && food.y == newhead.y) {
                self.eat();
            }
            else {
                var tail = self.body[self.body.length - 1];
                cell = map.getCellByXY(tail.x, tail.y);
                if (cell.state == 1) { // if it is a food, then still show
                    cell.state = 0;
                }
                self.body.pop();
            }
            map.draw();
        },
        eat: function(){
            food = new Food();
            //score.add(score_per_food);
            //score_panel.update(score.get());
        },
        changeDirect: function(e){
            var self = this;
            var newdirect = direct.getByKeyCode(e.keyCode);
            // if the direction is available, then change the direction
            if (!newdirect) {
                return false;
            }
            if (newdirect.x == -self.direct.x && newdirect.y == self.direct.y) {
                return false;
            }
            else 
                if (newdirect.y == -self.direct.y && newdirect.x == self.direct.x) {
                    return false;
                }
            self.direct = newdirect;
        },
        stop: function(){
            var self = this;
            if (self.timer) {
                clearInterval(self.timer);
                self.timer = null;
            }
        },
        resume: function(){
            var self = this;
            if (!self.timer) {
                self.timer = setInterval(function(){
                    self.move();
                }, 1000 / self.speed);
            }
        },
        die: function(){
            this.stop();
            alert('snake die.');
        }
    };
    
    function Direction(){
        this.direct = {
            37: {
                x: -1,
                y: 0
            },
            38: {
                x: 0,
                y: -1
            },
            39: {
                x: 1,
                y: 0
            },
            40: {
                x: 0,
                y: 1
            }
        };
    }
    Direction.prototype = {
        getByKeyCode: function(code){
            var direct = this.direct[code];
            //console.debug(direct);
            return direct;
        },
        getByRandom: function(){
            var key = Math.floor(Math.random() * 4 + 37);
            //console.debug(key);
            var result = this.direct[key];
            //console.debug(result);
            return result;
        }
    };
    
    function Score(){
        var self = this;
        self.score = 0;
    }
    Score.prototype = {
        add: function(score){
            var self = this;
            self.score += parseInt(score);
        },
        get: function(){
            return this.score;
        }
    };
    
    function start(){
        direct = new Direction();
        map = new Map(map_width, map_height);
        map.create();
        x = Math.floor(Math.random() * (map_width - snake_length * 2) + parseInt(snake_length));
        y = Math.floor(Math.random() * (map_height - snake_length * 2) + parseInt(snake_length));
        snake = new Snake(x, y, direct.getByRandom(), snake_length, snake_speed);
        food = new Food();
    }
    
    var canvas = document.getElementById('canvas1');
    var ctx = canvas.getContext('2d');
    var map, food, snake, map_width = 20, map_height = 20, snake_length = 5, snake_speed = 10;
    
    document.addEventListener('keydown', function(e){
        snake.changeDirect(e);
    }, false);
    start();
})();

