function drawMap() {
	//clear the map by drawing the background color over the whole thing
	ctx.beginPath();
	ctx.rect(0, 0, maxX, maxY);
	ctx.fillStyle = "lightblue";
	ctx.fill();
	ctx.closePath();

	if (selectedPlanetIndex != null) {
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

function drawSpaceLanes() {
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

function drawFleet(fleet, planet) {
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
	ctx.arc(planet.x + dx, planet.y + dy, 2, 0, Math.PI * 2, false);
	ctx.fill();
	ctx.closePath();

}

function drawPlanet(planet, selected) {
	ctx.beginPath();
	ctx.arc(planet.x, planet.y, planetDiameter / 2, 0, Math.PI * 2, false);
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