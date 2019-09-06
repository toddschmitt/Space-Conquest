var canvas;
var ctx;
var currentPlayer;
var currentTurn = 0;
var planets = [];
var spaceLanes = [];
var fleets;
var planetNames = ["Argys", "Bonton", "Crysis", "Dingus", "Elmo", "FoxDude", "GizmoWorld", "Hai", "Islendar", "Joko", "Klamata", "Lister"];
var maxNumberPlanets = planetNames.length;
var planetTechLevelDisto = [1,1,2,2,3,3,4,4,5,5,6,6];
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

function init() {
	init_modal();

	//Make the canvas and get the context
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	
	//Set the intial game state
	currentPlayer = 'Red';
	
	//create an array of random planets
	for (i = 0; i < maxNumberPlanets; i++) {
		planets = createRandomPlanets();
	}
	
	//set up the mouse listener for selecting planets
	canvas.onmousedown = mouseListener;
	
	//Make spacelanes between the planets
	for (var i = 0; i < maxNumberPlanets; i++)
	{
		for (var j = 0; j < maxNumberPlanets; j++){
			if(i != j )
			{
				spaceLanes.push(new SpaceLane(planets[i], planets[j], calculateSpaceLaneDistance(planets[i], planets[j]) ));
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
	document.getElementsByName("sendShips")[0].disabled = true;
	document.getElementsByName("upgradeTech")[0].disabled = true;
	document.getElementsByName("decreaseTech")[0].disabled = true;
	
}

function calculateSpaceLaneDistance(planetFrom, planetTo){
	//We're going to split the max path distance into 3 parts distance 1,2,3
	const distanceThresholds = [longestPossiblePath / 4, longestPossiblePath / 2];
	const d = planetDistance(planetFrom, planetTo);
	if(d < distanceThresholds[0])
		return 1;
	else if (d < distanceThresholds[1])
		return 2;
	else
		return 3;

}

function mouseListener(e) {
    // Get the current mouse position
    var r = canvas.getBoundingClientRect(),
        x = e.clientX - r.left, y = e.clientY - r.top;
    var clickedPlanet = false;

    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(var i = planets.length - 1, b; b = planets[i]; i--) {
        if(x >= b.x - planetDiameter && x <= b.x + planetDiameter * 2 &&
           y >= b.y - planetDiameter && y <= b.y + planetDiameter * 2) {
            // The mouse honestly hits the rect
            clickedPlanet = true;
            selectedPlanetIndex = i;
            break;
        }
    }
	
    // Draw the rectangles by Z (ASC)
    if (clickedPlanet || !clickedPlanet && selectedPlanetIndex )
	{
		if(!clickedPlanet && selectedPlanetIndex)
			selectedPlanetIndex = null;
		drawMap();
		refreshSelectedPlanetInfo(planets[selectedPlanetIndex]);
	}
}

function refreshSelectedPlanetInfo(planet) {
	var planetsIown = planets.filter((p) => p.owner === currentPlayer).map((p)=> {return p.id;});
	var planetsWhereIHaveFleets = fleets.filter((f) => f.owner === currentPlayer && !f.remainingTransit).map((f) => {return f.location});
	
	document.getElementsByName("planetName")[0].value = planet.name;

	if(planetsIown.includes(planet.id) || planetsWhereIHaveFleets.includes(planet.id)) {
		document.getElementsByName("techLevel")[0].value = planet.techLevel;
		document.getElementsByName("ownerName")[0].value = planet.owner;
		document.getElementsByName("incomePerTurn")[0].value = planet.income;
		document.getElementsByName("shipsRed")[0].value = 
			fleetToString(fleets.filter((f) => f.owner === 'Red' && f.location === planet.id && f.remainingTransit < 1 )[0]);
		document.getElementsByName("shipsBlue")[0].value = 
			fleetToString(fleets.filter((f) => f.owner === 'Blue' && f.location === planet.id && f.remainingTransit < 1 )[0]);
		document.getElementsByName("shipsNative")[0].value = 
			fleetToString(fleets.filter((f) => f.owner === 'Native' && f.location === planet.id && f.remainingTransit < 1 )[0]);

		var techLevelsAllowBuilding = shipTypes.map((x) => x.techLevel);
		if(selectedPlanetIndex && techLevelsAllowBuilding.includes(planets[selectedPlanetIndex].techLevel)){
			document.getElementsByName("buildShip")[0].disabled = false;
		}
		else {
			document.getElementsByName("buildShip")[0].disabled = true;
		}
	} else {
		document.getElementsByName("techLevel")[0].value = "unknown";
		document.getElementsByName("ownerName")[0].value = "unknown";
		document.getElementsByName("incomePerTurn")[0].value = "unknown";
		document.getElementsByName("shipsRed")[0].value = "unknown";
		document.getElementsByName("shipsBlue")[0].value = "unknown";
		document.getElementsByName("shipsNative")[0].value = "unknown";

		document.getElementsByName("buildShip")[0].disabled = true;
	}

}

function fleetToString(fleet) {
	if (!fleet)
		return "none";
	return "F:"+fleet.ships.fighter+",Sb:"+fleet.ships.shotgunBoat;
}

function drawMap(){
	//clear the map by drawing the background color over the whole thing
	ctx.beginPath();
	ctx.rect(0, 0, maxX, maxY);
	ctx.fillStyle = "#eee";
	ctx.fill();
	ctx.closePath();
	
	if(selectedPlanetIndex != null) {
		drawSpaceLanes();
	}

	//draw Planets
	for (var i = 0; i < maxNumberPlanets; i++) {
		drawPlanet(planets[i], i === selectedPlanetIndex);
	}

	//draw Fleets 
	var playerFleets = fleets.filter((f) => f.owner === currentPlayer && !f.remainingTransit);
	for (var i = 0; i < playerFleets.length; i++) {
		var planet = planets.filter((p) => p.id === playerFleets[i].location)[0];
		drawFleet(playerFleets[i], planet);
		
		var enemyFleets = fleets.filter((f) => f.location === playerFleets[i].location && !f.remainingTransit);

		enemyFleets.forEach((ef) => drawFleet(ef, planet));
	}

}

function drawSpaceLanes()
{
	var spaceLanesToShow = spaceLanes.filter((sp) => sp.planetTo.id === selectedPlanetIndex);

	spaceLanesToShow.forEach((sp) => {
		// Dashed line
		ctx.beginPath();
		ctx.setLineDash([5, 15]);
		ctx.strokeStyle = "green";
		ctx.moveTo(sp.planetFrom.x, sp.planetFrom.y);
		ctx.lineTo(sp.planetTo.x, sp.planetTo.y);
		ctx.stroke();

		//Draw distances
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.font = "13px Arial";
		ctx.fillText(sp.transitTime, sp.planetFrom.x + planetDiameter, sp.planetFrom.y + 5);
	});

}

function drawFleet(fleet, planet){
	var dx;
	var dy;
	ctx.beginPath();
	switch (fleet.owner) {
		case 'Red':
			ctx.fillStyle = "red";
			dx = -4;
			dy = -4;
		break;
		case 'Blue':
			ctx.fillStyle = "blue";
			dx = 4;
			dy = -4;
		break;
		default:
			ctx.fillStyle = "white";
			dx = 0;
			dy = -2;
		break;
	}
	ctx.arc(planet.x + dx, planet.y + dy, 2, 0, Math.PI*2, false);
	ctx.fill();
	ctx.closePath();

}

function drawPlanet(planet, selected) {
	ctx.beginPath();
	ctx.arc(planet.x, planet.y, planetDiameter/2, 0, Math.PI*2, false);
	if (selected)
		ctx.fillStyle = "green";
	else
		ctx.fillStyle = "gray";
	ctx.fill();
	ctx.closePath();
	
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.font = "12px Arial";
	ctx.fillText(planet.name, planet.x, planet.y - 15);
}

function createRandomPlanets(name)
{
	var planets = [];
	shuffle(planetTechLevelDisto);
	for (i = 0; i < maxNumberPlanets; i++) {
		var planet = {}
		planet.id = i;
		planet.name = planetNames[i];
		planet.x = (getRndInteger(mapBorder, maxX - mapBorder));
		planet.y = (getRndInteger(mapBorder, maxY - mapBorder));
		planet.techLevel = planetTechLevelDisto[i];
		planet.income = 100 * planet.techLevel;
		planet.owner = 'Native';
		if(planet.techLevel > 4) {
			var ships = new Ships(getRndInteger(1,planet.techLevel), 0);
			var fleet = new Fleet('Native', i, 0, ships);
			fleets.push(fleet);
		}
		planets.push(planet);
	}


	var listOfTooClosePlanets = [];
	do {
		if(listOfTooClosePlanets.length > 0) {
			for(var k = 0; k < listOfTooClosePlanets.length; k++){
				planets[listOfTooClosePlanets[k]].x = (getRndInteger(mapBorder, maxX - mapBorder));
				planets[listOfTooClosePlanets[k]].y = (getRndInteger(mapBorder, maxY - mapBorder));
			}
			listOfTooClosePlanets = [];
		}

		//reposition planets to be not to close together
		for (var i = 0; i < maxNumberPlanets; i++) {
			for (var j = 0; j < maxNumberPlanets; j++) {
				if(i != j && !listOfTooClosePlanets.includes(i) && planetDistance(planets[i], planets[j]) < planetDiameter * 2) {
					listOfTooClosePlanets.push(i);
				}
			}
		}
	}
	while(listOfTooClosePlanets.length > 0);

	return planets;
}

function planetDistance (planeta, planetb){
	return distance(planeta.x, planeta.y, planetb.x, planetb.y);
}

function createRandomHomePlanet(playerId) {

	var index = getRndInteger(0, maxNumberPlanets - 1);
	while(planets[index].owner != 'Native'){
		index = (index + 1) % (maxNumberPlanets - 1);
	}

	planets[index].owner = playerId;
	planets[index].techLevel = 7;
	planets[index].income = 100 * planets[index].techLevel;
	var ships = new Ships(10,0);
	var fleet = new Fleet(playerId, index, 0, ships);
	fleets.push(fleet);

	//remove Native fleets from home planet
	fleets = fleets.filter((f) => f.location != index || f.owner != 'Native');
	
}



function processBattle(fleet1, fleet2) {
}

function advanceOneTurn() {
	if(currentTurn !=0) {
		currentPlayer = currentPlayer == player1Id ? player2Id : player1Id;
	} else {
		document.getElementsByName("startGameEndTurn")[0].value = 'End Turn';
	}

	var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

	currentTurn +=1;

	//Give the player their income
	var creditsEarned = planets.filter((p) => p.owner === currentPlayer).map((p) => p.income).reduce((total,planet) => total + planet.income);
	
	players[currentPlayerIndex].credits += creditsEarned;

	//Resolve battles

	//Move in transit fleets closer to their destination

	//Process Native production and rebellion

	//Check for victory or loss
	

	//Update the display
	document.getElementsByName("credits")[0].value = players[currentPlayerIndex].credits;
	document.getElementsByName("turnNumber")[0].value = currentTurn;
	document.getElementsByName("playerName")[0].value = currentPlayer;

	//Redraw the map
	drawMap();
}



