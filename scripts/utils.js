function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

		// swap elements array[i] and array[j]
		// we use "destructuring assignment" syntax to achieve that
		// you'll find more details about that syntax in later chapters
		// same can be written as:
		// let t = array[i]; array[i] = array[j]; array[j] = t
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

function flashMessage(selectorId, message) {
	document.getElementById(selectorId).innerHTML = message;
	setTimeout(function () {
		document.getElementById(selectorId).innerHTML = "";
	}, 2000)
}

var byId = function (id) {
	return document.getElementById(id);
};