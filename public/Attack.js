// Keycodes
const keyCodes = [LEFT, UP, RIGHT, DOWN] = [37, 38, 39, 40]
// KEY LISTENERS
let keyActions = {}

// Global var
const GAME_DURATION = 50
let [score, bestScore, interval] = [0, 0, GAME_DURATION]
let firstMove = true
let clock
let lastUpdate = Date.now()
let totalSeconds = 0

// Canvas
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
canvas.width = 850
canvas.height = 510

// Background image
const backgroundObj = { image: new Image(), ready: false, speed: 100 }
backgroundObj.image.onload = () => backgroundObj.ready = true
backgroundObj.image.src = "./sat.png"

// Plane
const playObj = { speed: 300, width: 180, height: 280, image: new Image(), ready: false }
playObj.image.onload = () => playObj.ready = true
playObj.image.src = "./plane1.png"

// Bird 
const ballObj = { width: 60, height: 60, image: new Image(), ready: false }
ballObj.image.onload = () => ballObj.ready = true
ballObj.image.src = "./favicon.png"

// Elements
let timerElem, scoreElem, bestScoreElem


/**
 * Add the key listeners
 */
function addEventListeners() {

	//Listening event to the pressed key
	addEventListener("keydown", (e) => {
		if (!keyCodes.find(key => e.keyCode === key)) return
		if (firstMove) {
			firstMove = false
			setTimer()
		}

		keyActions[e.keyCode] = true
	}, true)

	//Listening event when the key is released
	addEventListener("keyup", (e) => {
		delete keyActions[e.keyCode]
	}, true)
}

/**
 * Update rating values
 * @param {*} interval game time left
 * @param {*} score current score
 * @param {*} bestScore best score
 */
function updateScoreAndTime(interval, score, bestScore) {
	timerElem.setAttribute("value", 'Timer : ' + interval)
	bestScoreElem.setAttribute("value", 'Highest: ' + bestScore)
	scoreElem.setAttribute("value",'Score: ' + score)
}

/**
 * Calculate the elements position in canvas
 */
function calculateFirstPositions() {

	if (firstMove) {
		// First plane position in the middle
		playObj.x = (canvas.width / 2) - (playObj.width / 2)
		playObj.y = (canvas.height / 2) - (playObj.height / 2)
	}

	// Random first bird position
	ballObj.x = Math.round(Math.random() * (canvas.width - ballObj.width))
	ballObj.y = Math.round(Math.random() * (canvas.height - ballObj.height))
}


/**
 * Update the plane position and calculate if the bird
 * has been hit
 * @param {*} elapsed time (s)
 */
function updateElements(elapsed) {

	// distance (pixels) = (pixels/second) * seconds
	const distance = playObj.speed * elapsed
	// Max pixels before the plan cross the limits
	const planeLimit = playObj.width - 10
	const heightLimit = canvas.height - 10
	const widthLimit = canvas.width - 10

	// UP key
	if (keyActions.hasOwnProperty(UP)) {
		// Crossing top canvas side?
		(playObj.y > -planeLimit) ? playObj.y -= distance : playObj.y = heightLimit
	}

	// DOWN key
	if (keyActions.hasOwnProperty(DOWN)) {
		// Crossing bottom
		(playObj.y < heightLimit) ? playObj.y += distance : playObj.y = -planeLimit
	}

	// RIGHT key
	if (keyActions.hasOwnProperty(RIGHT)) {
		// Crossing right
		(playObj.x < widthLimit) ? playObj.x += distance : playObj.x = -planeLimit
	}

	// LEFT key
	if (keyActions.hasOwnProperty(LEFT)) {
		// Crossing left
		(playObj.x > -planeLimit) ? playObj.x -= distance : playObj.x = widthLimit
	}

	// Did we hit the bird?
	if (playObj.x <= (ballObj.x + (ballObj.width / 2)) &&
		playObj.y <= (ballObj.y + (ballObj.height / 2)) &&
		ballObj.x <= (playObj.x + (playObj.width / 2)) &&
		ballObj.y <= (playObj.y + (playObj.height / 2))) {
		score++
		calculateFirstPositions()
	}
}

/**
 * Paint all the elements in the canvas
 * @param {*} elapsed time (s)
 */
function paintElements(elapsed) {

	// We draw the backgroundImage all the time to refresh and delete the last plane position
	// We start moving the background when the first key has been pressed
	if (!firstMove) {
		totalSeconds += elapsed

		const numImages = Math.ceil(canvas.width / backgroundObj.image.width)
		const xpos = (totalSeconds * backgroundObj.speed) % backgroundObj.image.width // xpos pixels

		ctx.save()
		// Translate canvas (not with the background image)
		ctx.translate(-xpos, 0)

		// Infinite background animation
		for (let i = 0; i < numImages; i++) {
			// Draw background image over the translated canvas
			ctx.drawImage(backgroundObj.image, i * backgroundObj.image.width, 0)
		}

		ctx.restore()
	} else {
		// Reset background image in canvas to position 0 0 (dx dy)
		ctx.drawImage(backgroundObj.image, 0, 0, backgroundObj.image.width, backgroundObj.image.height)
		totalSeconds = 0
	}

	// Paint the plane. Size 80x80
	ctx.drawImage(playObj.image, playObj.x, playObj.y, playObj.width, playObj.height)
	// Paint the bird. Size 60x32
	ctx.drawImage(ballObj.image, ballObj.x, ballObj.y, ballObj.width, ballObj.height)
}

/**
 * Main program
 */
function main() {

	// No logic untill the elements are ready
	if (!backgroundObj.ready || !ballObj.ready || !playObj.ready) return

	// Calculate elapsed time (seconds)
	const now = Date.now()
	const elapsed = (now - lastUpdate) / 1000

	// Udpate elements
	updateElements(elapsed)
	// Paint elements
	paintElements(elapsed)
	// Update values
	updateScoreAndTime(String("0" + interval).slice(-2), score, bestScore)

	// Update time
	lastUpdate = now
}

/**
 * Control the game time
 */
function setTimer() {
	clock = setInterval(() => {
		// Game over 
		if (interval === 0) {
			clearInterval(clock)
			firstMove = true
			interval = GAME_DURATION
			score > bestScore ? bestScore = score : bestScore // Update best score
			score = 0
			return calculateFirstPositions()
		}

		// 1 less second
		interval--
	}, 1000)
}

// Append canvas to div tag
window.onload = function () {
	document.getElementById("board").appendChild(canvas)

	timerElem = document.getElementById("clock")
	bestScoreElem = document.getElementById("bestscore")
	scoreElem = document.getElementById("score")

	updateScoreAndTime(interval, score, bestScore)
}


//********************* PROGRAM *****************************/

// Calculate positions
calculateFirstPositions()

// Add key event listeners
addEventListeners()

// Execute main program every 1 ms
setInterval(main, 16)