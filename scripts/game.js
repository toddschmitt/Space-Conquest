var canvas;
var ctx;
var currentPlayer;
var currentTurn = 0;
var planets = [];
var spaceLanes = [];
var fleets;
var planetNames = ["Argys", "Bonton", "Crysis", "Dingus", "Elmo", "FoxDude", "GizmoWorld", "Hai", "Islendar", "Joko", "Klamata", "Lister"];
var maxNumberPlanets = planetNames.length;
var planetTechLevelDisto = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
var maxX = 600;
var maxY = 600;
var mapBorder = 20;
var planetDiameter = 20;
var selectedPlanetIndex = null;
var fleets = [];
var player1Id = 'Red';
var player2Id = 'Blue';
var computerNeutralId = 'Native';
var players = [];
var longestPossiblePath = distance(0, 0, maxX, maxY);
var shipTypes = [new ShotGunBoatShip(), new FighterShip()];
var modals = MODAL_MODULE;
var battles = [];
var battleWinnerDamageReduction = .8;

function init() {
	modals.register_modal('buildShip', '.modal_buildShips', onBuildShipModalOpen, onBuildShipModalClose);
	modals.register_modal('sendShips', '.modal_sendShips', onSendShipModalOpen, onSendShipModalClose);
	modals.init_modal();

	//Make the canvas and get the context
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");

	//Set the intial game state
	currentPlayer = 'Red';

	//create an array of random planets
	planets = createRandomPlanets();

	//set up the mouse listener for selecting planets
	canvas.onmousedown = mouseListener;

	//Make spacelanes between the planets
	for (var i = 0; i < maxNumberPlanets; i++) {
		for (var j = 0; j < maxNumberPlanets; j++) {
			if (i != j) {
				spaceLanes.push(new SpaceLane(planets[i], planets[j], calculateSpaceLaneDistance(planets[i], planets[j])));
			}
		}
	}

	//Make a homeworld for each player
	createRandomHomePlanet('Red');
	createRandomHomePlanet('Blue');

	//make the player objects
	players = [new Player(player1Id), new Player(player2Id)];

	drawMap();

	//Initialize buttons
	document.getElementsByName("buildShip")[0].disabled = true;
	//document.getElementsByName("sendShips")[0].disabled = true;
	document.getElementsByName("upgradeTech")[0].disabled = true;
	document.getElementsByName("decreaseTech")[0].disabled = true;
}

function calculateSpaceLaneDistance(planetFrom, planetTo) {
	//We're going to split the max path distance into 3 parts distance 1,2,3
	const distanceThresholds = [longestPossiblePath / 4, longestPossiblePath / 2];
	const d = planetDistance(planetFrom, planetTo);
	if (d < distanceThresholds[0])
		return 1;
	else if (d < distanceThresholds[1])
		return 2;
	else
		return 3;

}

function mouseListener(e) {
	// Get the current mouse position
	var r = canvas.getBoundingClientRect(),
		x = e.clientX - r.left,
		y = e.clientY - r.top;
	var clickedPlanet = false;

	for (var i = planets.length - 1, b; b = planets[i]; i--) {
		if (x >= b.x - planetDiameter && x <= b.x + planetDiameter &&
			y >= b.y - planetDiameter && y <= b.y + planetDiameter) {
			// The mouse honestly hits the rect
			clickedPlanet = true;
			selectedPlanetIndex = i;
			break;
		}
	}

	// Draw the rectangles by Z (ASC)
	if (clickedPlanet || !clickedPlanet && selectedPlanetIndex) {
		if (!clickedPlanet && selectedPlanetIndex != null)
			selectedPlanetIndex = null;
		drawMap();
		refreshSelectedPlanetInfo(planets[selectedPlanetIndex]);
	}
}

function refreshSelectedPlanetInfo(planet) {
	var planetsIown = planets.filter((p) => p.owner === currentPlayer).map((p) => {
		return p.id;
	});
	var planetsWhereIHaveFleets = fleets.filter((f) => f.owner === currentPlayer && !f.remainingTransit).map((f) => {
		return f.location
	});

	document.getElementsByName("planetName")[0].value = planet.name;

	if (planetsIown.includes(planet.id) || planetsWhereIHaveFleets.includes(planet.id)) {
		document.getElementsByName("techLevel")[0].value = planet.techLevel;
		document.getElementsByName("ownerName")[0].value = planet.owner;
		document.getElementsByName("incomePerTurn")[0].value = planet.income;
		document.getElementById("shipsRed").value =
			fleetToString(fleets.filter((f) => f.owner === 'Red' && f.location === planet.id && f.remainingTransit < 1)[0]);
		document.getElementById("shipsBlue").value =
			fleetToString(fleets.filter((f) => f.owner === 'Blue' && f.location === planet.id && f.remainingTransit < 1)[0]);
		document.getElementsByName("shipsNative")[0].value =
			fleetToString(fleets.filter((f) => f.owner === 'Native' && f.location === planet.id && f.remainingTransit < 1)[0]);

		var techLevelsAllowBuilding = shipTypes.map((x) => x.techLevel);
		if (selectedPlanetIndex != null && techLevelsAllowBuilding.includes(planets[selectedPlanetIndex].techLevel)) {
			document.getElementsByName("buildShip")[0].disabled = false;
		} else {
			document.getElementsByName("buildShip")[0].disabled = true;
		}
	} else {
		document.getElementsByName("techLevel")[0].value = "unknown";
		document.getElementsByName("ownerName")[0].value = "unknown";
		document.getElementsByName("incomePerTurn")[0].value = "unknown";
		document.getElementById("shipsRed").value = "unknown";
		document.getElementById("shipsBlue").value = "unknown";
		document.getElementsByName("shipsNative")[0].value = "unknown";

		document.getElementsByName("buildShip")[0].disabled = true;
	}

}

function fleetToString(fleet) {
	if (!fleet)
		return "none";
	return fleet.ships.toString();
}

function createRandomPlanets(name) {
	var planets = [];
	shuffle(planetTechLevelDisto);
	for (i = 0; i < maxNumberPlanets; i++) {
		var planet = {}
		planet.id = i;
		planet.name = planetNames[i];
		planet.x = (getRndInteger(mapBorder, maxX - mapBorder));
		planet.y = (getRndInteger(mapBorder, maxY - mapBorder));
		planet.techLevel = planetTechLevelDisto[i];
		planet.income = 50 * planet.techLevel;
		planet.owner = 'Native';
		if (planet.techLevel > 4) {
			var ships = new Ships(shipTypes);
			ships.add(new FighterShip(), getRndInteger(1, planet.techLevel));
			var fleet = new Fleet('Native', i, 0, ships);
			fleets.push(fleet);
		}
		planets.push(planet);
	}


	var listOfTooClosePlanets = [];
	do {
		if (listOfTooClosePlanets.length > 0) {
			for (var k = 0; k < listOfTooClosePlanets.length; k++) {
				planets[listOfTooClosePlanets[k]].x = (getRndInteger(mapBorder, maxX - mapBorder));
				planets[listOfTooClosePlanets[k]].y = (getRndInteger(mapBorder, maxY - mapBorder));
			}
			listOfTooClosePlanets = [];
		}

		//reposition planets to be not to close together
		for (var i = 0; i < maxNumberPlanets; i++) {
			for (var j = 0; j < maxNumberPlanets; j++) {
				if (i != j && !listOfTooClosePlanets.includes(i) && planetDistance(planets[i], planets[j]) < planetDiameter * 2) {
					listOfTooClosePlanets.push(i);
				}
			}
		}
	}
	while (listOfTooClosePlanets.length > 0);

	return planets;
}

function planetDistance(planeta, planetb) {
	return distance(planeta.x, planeta.y, planetb.x, planetb.y);
}

function createRandomHomePlanet(playerId) {

	var index = getRndInteger(0, maxNumberPlanets - 1);
	while (planets[index].owner != 'Native') {
		index = (index + 1) % (maxNumberPlanets - 1);
	}

	planets[index].owner = playerId;
	planets[index].techLevel = 7;
	planets[index].income = 50 * planets[index].techLevel;
	var ships = new Ships(shipTypes);
	ships.add(new FighterShip(), 10);
	var fleet = new Fleet(playerId, index, 0, ships);
	fleets.push(fleet);

	//remove Native fleets from home planet
	fleets = fleets.filter((f) => f.location != index || f.owner != 'Native');

}



function processBattle(fleet1, fleet2) {}

function advanceOneTurn() {
	//Move in transit fleets closer to their destination
	for (var i = 0; i < fleets.length; i++) {
		if (fleets[i].owner === currentPlayer && fleets[i].remainingTransit > 0) {
			fleets[i].remainingTransit--;
		}
	}

	//Consolidate fleets owned by same player at same planet
	fleets.sort(function (a, b) {
		if (a.remainingTransit != b.remainingTransit) {
			return a.remainingTransit - b.remainingTransit;
		}
		if (a.owner != b.owner) {
			return a < b ? -1 : 1;
		}
		return a.location - b.location;
	});

	if (fleets) {
		var owner = fleets[0].owner;
		var location = fleets[0].location;
		var toDelete = [];
		for (var i = 1; i < fleets.length; i++) {
			if (owner === fleets[i].owner && location === fleets[i].location) {
				toDelete.push(i - 1);
				Object.keys(fleets[i - 1].ships.shipCounts).forEach((k) => fleets[i].ships.addByName(k, fleets[i - 1].ships.shipCounts[k]));
			} else {
				owner = fleets[i].owner;
				location = fleets[i].location;
			}
		}
		toDelete.reverse();
		toDelete.forEach((d) => fleets.splice(d, 1));
	}

	//Resolve battles
	planets.forEach(function (p) {
		var planetFleets = fleets.filter((f) => f.location === p.id && f.remainingTransit < 1);
		if (planetFleets.length > 1) {
			var battle = resolveBattle(planetFleets);
			battles.push(battle);
		}
	});

	//Make new planet owners 

	//Process Native production and rebellion

	//Check for victory or loss

	if (currentTurn != 0) {
		currentPlayer = currentPlayer == player1Id ? player2Id : player1Id;
	} else {
		document.getElementsByName("startGameEndTurn")[0].innerHTML = 'End Turn';
	}

	var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

	currentTurn += 1;

	//Give the player their income
	var creditsEarned = planets.filter((p) => p.owner === currentPlayer).map((p) => p.income).reduce((total, planet) => total + planet.income);

	players[currentPlayerIndex].credits += creditsEarned;

	//Update the display
	document.getElementsByName("credits")[0].value = players[currentPlayerIndex].credits;
	document.getElementsByName("turnNumber")[0].value = currentTurn;
	document.getElementsByName("playerName")[0].value = currentPlayer;

	//Redraw the map
	drawMap();
}

function getCurrentPlayerFleetOnCurrentPlanet() {
	var fleet = fleets.filter((f) => f.owner === currentPlayer && !f.remainingTransit && f.location === selectedPlanetIndex);
	if (fleet)
		return fleet[0];
	else
		return fleet;
}