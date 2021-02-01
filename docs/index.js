"use strict"; 
(function () {
    const Direction = {
        UP: "UP", 
        DOWN: "DOWN", 
        LEFT: "LEFT", 
        RIGHT: "RIGHT"
    }; 

    const HEIGHT = 550;
    const WIDTH = 800;
    const SIZE = 25; 
    const DELAY = 75;  // milliseconds 

    // 
    let snake; 
    // 
    let directionQueue; 
    // 
    let direction; 

    let food; 

    window.onload = function() {
        // registering keyboard listener 
        document.onkeydown = keyEvent;
        gameSetup(); 
        startGame(); 
    }; 

    /**
     * 
     * @param event 
     */
    function keyEvent(event) {
        switch (event.keyCode) {
            case 38:  // 'up' key or 'w' 
            case 87: 
                addMove(Direction.UP); 
                break; 
            case 39:  // 'right' key or 'd'
            case 68: 
                addMove(Direction.RIGHT);
                break; 
            case 40:  // 'down' key or 's'
            case 83: 
                addMove(Direction.DOWN);  
                break; 
            case 37:  // 'left' key or 'a'
            case 65: 
                addMove(Direction.LEFT); 
                break; 
            case 32:  // space bar
                toggleGameHeader(); 
                break; 
        }
    }

    /**
     * 
     * @param move 
     */
    function addMove(move) {
        if (!isPaused()) {
            directionQueue.push(move); 
        }
    }

    /**
     * 
     */
    function gameSetup() {
        snake = []; 
        directionQueue = []; 
        direction = null;
        food = null; 
        
        let snakeSegment = document.createElement("div"); 
        snakeSegment.className = "snake"; 
        snakeSegment.style.left = "0px"; 
        snakeSegment.style.top = "0px"; 
        snake.push(snakeSegment); 
        $("game-area").appendChild(snakeSegment);

        spawnFood();
    }

    /**
     * 
     */
    function startGame() {
        setInterval(function() {
            if (!isPaused()) {
                if (directionQueue.length > 0) {
                    let nextDirection = directionQueue.shift();
                    if ((direction === null)                                                ||
                        (nextDirection === Direction.UP && direction !== Direction.DOWN)    ||
                        (nextDirection === Direction.RIGHT && direction !== Direction.LEFT) || 
                        (nextDirection === Direction.DOWN && direction !== Direction.UP)    || 
                        (nextDirection === Direction.LEFT && direction !== Direction.RIGHT)) { 
                            direction = nextDirection;
                    }
                }
                update(); 
            }
        }, DELAY); 
    }

    /**
     * 
     */
    function update() {
        let oldSnakeHead = snake[0]; 
        
        let newSnakeHead = document.createElement("div"); 
        newSnakeHead.className = "snake";            
        newSnakeHead.style.left = oldSnakeHead.style.left; 
        newSnakeHead.style.top = oldSnakeHead.style.top; 

        let position; 
        let changeHorizontalPosition = true; 
        switch (direction) {
            case Direction.UP: 
                position = (parseInt(oldSnakeHead.style.top) - SIZE); 
                if(position < 0) {
                    position = HEIGHT - SIZE; 
                }
                changeHorizontalPosition = false; 
                break; 
            case Direction.RIGHT: 
                position = (parseInt(oldSnakeHead.style.left) + SIZE); 
                if(position >= WIDTH) {
                    position = 0; 
                }
                break; 
            case Direction.DOWN:
                position = (parseInt(oldSnakeHead.style.top) + SIZE); 
                if(position >= HEIGHT) {
                    position = 0; 
                }
                changeHorizontalPosition = false; 
                break; 
            case Direction.LEFT:
                position = (parseInt(oldSnakeHead.style.left) - SIZE);
                if(position < 0) {
                    position = WIDTH - SIZE;
                }
                break;  
        }
        changeHorizontalPosition ? (newSnakeHead.style.left = position + "px") : 
                                   (newSnakeHead.style.top = position + "px"); 

        $("game-area").insertBefore(newSnakeHead, $("game-area").firstChild); 
        snake.unshift(newSnakeHead); 
        // checking to see if the new position for the snake head is the same 
        // position of the food element. 
        if (isCollision(newSnakeHead, food)) { 
            incrementStats(); 
            spawnFood();  
        } else {
            $("game-area").removeChild(snake.pop()); 
        }
        
        // checking for self collisions from the 4th piece, since the snake's head cannot collide 
        // with the the 2nd and 3rd pieces. 
        for(let i = 3; i < snake.length; i++) { 
            if (isCollision(snake[i], newSnakeHead)) { 
                snake[i].style.backgroundColor = "gray"; 
                setTimeout(function () {
                    clearGame("Uh-oh, you died :(");  
                }, SIZE * 2); 
            }
        }

        // check to see if the user has won the game, winning is where there are no more 
        // empty tiles remaining (snake takes up the entirety of area).
        if (snake.length === ((WIDTH / SIZE) * (HEIGHT / SIZE))) {
            clearGame("You've beat the game, congrats! :)")
        }
    }

    /**
     * 
     * @param message   the text to display in the alert dialog. 
     */
    function clearGame(message) {
        alert(message); 
        while($("game-area").firstChild) {
            $("game-area").removeChild($("game-area").firstChild); 
        }
        $("level").innerHTML = "1"; 
        gameSetup(); 
    }

    /**
     * Increments the user's level by one. 
     * Updates the high score if the incremented score exceeds the current high score. 
     */
    function incrementStats() {
        let count = +($("level").innerHTML);
        let record = +($("record").innerHTML); 
        $("level").innerHTML = ++count; 
        if(count > record) {
            $("record").innerHTML = count; 
        }  
    }

    /**
     * 
     */
    function spawnFood() {
        if($("game-area").contains(food)) {
            $("game-area").removeChild(food); 
        }
        food = document.createElement("div"); 
        food.className = "food"; 
        getCoordinates();
        $("game-area").appendChild(food); 
    }

    /**
     * 
     */
    function getCoordinates() {
        food.style.left = getRandomPosition(WIDTH - SIZE) + "px"; 
        food.style.top = getRandomPosition(HEIGHT - SIZE) + "px";
        let spotTaken = false; 
        for(let i = 0; i < snake.length; i++) {
            if (isCollision(snake[i], food)) {
                spotTaken = true; 
            }
        }

        if(spotTaken) {
            getCoordinates(); 
        }
    }

    /**
     * 
     */
    function toggleGameHeader() {
        if (isPaused()) {
            $("title").innerText = "Snake Game!"; 
            $("title").classList.remove("paused");
        } else {
            $("title").innerText = "Game Paused!"; 
            $("title").classList.add("paused"); 
        }
    }

    /**
     * 
     * @param range
     * @returns  
     */
    function getRandomPosition(range) {
        return SIZE * Math.floor(Math.random() * (range / SIZE) + 1); 
    }

    /**
     * 
     * @param objectA 
     * @param objectB 
     */
    function isCollision(objectA, objectB) {
        return (objectA.style.top === objectB.style.top && objectA.style.left === objectB.style.left); 
    }

    /**
     * @returns 
     */
    function isPaused() {
        return $("title").innerText.includes("Paused"); 
    }

    /**
     * Helper function to get the element by id.
     * 
     * @param  the string ID of the DOM element to retrieve
     * @return the DOM element denoted by the ID given
     */
    function $(id) {
        return document.getElementById(id);
    }

})(); 