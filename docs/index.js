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

    // a list consisting all the snake segments that together represent the
    // snake. a snake segment is a SIZExSIZE div object.   
    let snake; 
    // the current direction of the head of the snake. 
    let direction; 
    // queue of directions that is used to update the direction of the snake. 
    let directionQueue; 

    // a single SIZExSIZE div object. 
    let food; 

    window.onload = function() {
        // registering keyboard listener 
        document.onkeydown = keyEvent;
        gameSetup(); 
        startGame(); 
    }; 

    /**
     * Processes the key the user has just pressed. 
     * If the user has pressed an arrow key or any of the 'wasd' keys, then
     * the corresponding direction gets queue'd. 
     * Handles the case when the user presses space bar to pause/resume gameplay. 
     * 
     * @param event the keyevent containing information of what
     *              key the user has just pressed. 
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
     * Adds the the given move to the snakes direction queue if the move 
     * is not given while the game is paused.
     * 
     * @param move  the next move direction to move the snake. 
     */
    function addMove(move) {
        if (!isPaused()) {
            directionQueue.push(move); 
        }
    }

    /**
     * Sets up the game by placing the snake piece and a randomly placed 
     * food piece on the screen. 
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
     * Handles the animation rate of the gameplay. 
     * Processes any snake direction updates from the direction queue and then 
     * updates position of the snake segments as well as the food pieces (if 
     * necessary) at a constant interval. 
     */
    function startGame() {
        setInterval(function() {
            if (!isPaused()) {
                if (directionQueue.length > 0) {
                    let nextDirection = directionQueue.shift();
                    if ((direction === null)                                                ||
                        (snake.length === 1)                                                ||
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
     * Updates the head position of the snake based on the current direction
     * of the snake. 
     * Handles the event in which the next head position collides with the current
     * food position, in which case the snake's length increments by one and a 
     * new food element is spawned if a spawn location exists, if not the user 
     * wins. 
     * Handles ending the game if the new head position collides with the snake 
     * itself.
     * In both cases of self-collision and winning, the game stops and resets 
     * to initial state. 
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
                }, SIZE); 
            }
        }
        
        if (userWon()) {
            clearGame("You've beat the game, congrats! :)")
        }
    }

    /**
     * Called whenever the user loses (dies on self-collides) or wins (no more empty 
     * tiles left on screen). Resets game to initial state. 
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
     * Clears any food elements on the screen and creates a new on with a 
     * random position.
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
     * Computes an x/y position and sets it to the new position of the food 
     * element. If the new position overlaps with the snake it will recompute 
     * a new position until an empty location is found.  
     */
    function getCoordinates() {
        // only compute a x/y position for the food if there is an empty SIZExSIZE
        // tile available. if not, the game is over and the user wins. 
        if (!userWon()) {
            food.style.left = getRandomPosition((WIDTH - SIZE) / SIZE) + "px"; 
            food.style.top = getRandomPosition((HEIGHT - SIZE) / SIZE) + "px";
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
    }

    /**
     * Toggles the game header text between "Snake Game!" and "Game Paused!".
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
     * @param range value used to calculate the range of the returned 
     *              random number.   
     * @returns     a random number x * SIZE where x is 1 <= x <= range.
     */
    function getRandomPosition(range) {
        return SIZE * Math.floor(Math.random() * range + 1); 
    }

    /**
     * Takes in two div objects in HTML DOM and returns if they are 
     * colliding (both objects have the same x/y position) 
     * 
     * @param objectA   div object to compare against parameter 'objectB'
     * @param objectB   div object to compare against parameter 'objectA'
     * @returns         true if the objects are colliding, false otherwise. 
     */
    function isCollision(objectA, objectB) {
        return (objectA.style.top === objectB.style.top && objectA.style.left === objectB.style.left); 
    }

    /**
     * @returns true if the game is currently paused, false otherwise. 
     */
    function isPaused() {
        return $("title").innerText.includes("Paused"); 
    }

    /**
     * @returns true if the user has won the game, false otherwise. 
     *          the user wins the game if there are no more empty SIZExSIZE
     *          spaces remaining (snake takes up the entirety of area). 
     *          
     */
    function userWon() {
        return snake.length >= ((WIDTH / SIZE) * (HEIGHT / SIZE)); 
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