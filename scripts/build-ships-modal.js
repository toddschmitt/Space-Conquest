var buildSelectors = {}

function setupBuildSelectors() {
    buildSelectors.buildShipSelect = byId("buildShipSelect");
    buildSelectors.shipCost = byId("shipCost");
    buildSelectors.buildSlider = byId("buildSlider");
    buildSelectors.shipBuildCount = byId("shipBuildCount");
    buildSelectors.shipBuildCost = byId("shipBuildCost");
    buildSelectors.buildShipPlanet = byId("buildShipPlanet");
    buildSelectors.creditsBuildShips = byId("creditsBuildShips");
    buildSelectors.buildShipButton = byId("buildShipButton");
}

function onBuildShipModalOpen() {
    setupBuildSelectors();
    var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

    //Fill in the planet name we're building on
    buildSelectors.buildShipPlanet.textContent = planets[selectedPlanetIndex].name;

    if (buildSelectors.buildShipSelect.options.length > 1) {
        for (i = buildSelectors.buildShipSelect.options.length - 1; i >= 1; i--) {
            buildSelectors.buildShipSelect.remove(i);
        }
    }

    buildSelectors.buildShipSelect.onchange = function (e) {
        buildSelectors.shipCost.innerHTML = shipTypes.filter((s) => s.name === e.srcElement.value)[0].cost;
    }

    //For every unique ship type, we are going to enter them into the dropdown selection so that
    // you can choose to make that type of ship.
    shipTypes.forEach((s) => {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(s.name));
        opt.value = s.name;
        buildSelectors.buildShipSelect.appendChild(opt);
    })
    buildSelectors.buildShipSelect.selectedIndex = 0;


    buildSelectors.shipBuildCount.innerHTML = buildSelectors.buildSlider.value;

    buildSelectors.buildSlider.oninput = function () {
        buildSelectors.shipBuildCount.innerHTML = this.value;

        var selectedShipType = shipTypes.filter((s) => s.name ===
            buildSelectors.buildShipSelect.options[buildSelectors.buildShipSelect.selectedIndex].text)[0];
        var totalCost = this.value * selectedShipType.cost;

        buildSelectors.shipBuildCost.innerHTML = totalCost;
    }

    buildSelectors.creditsBuildShips.value = players[currentPlayerIndex].credits;

    buildSelectors.buildShipButton.onclick = function () {

        var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

        var selectedShipType = shipTypes.filter((s) => s.name === buildSelectors.buildShipSelect.options[buildSelectors.buildShipSelect.selectedIndex].text)[0];
        var totalCost = buildSelectors.buildSlider.value * selectedShipType.cost;

        if (totalCost <= players[currentPlayerIndex].credits) {
            //Pay for the ships we built
            players[currentPlayerIndex].credits -= totalCost;

            buildSelectors.creditsBuildShips.value = players[currentPlayerIndex].credits;

            //See if we have a fleet on this planet right now, if so add to that fleet
            var myFleetHere = getCurrentPlayerFleetOnCurrentPlanet();
            if (myFleetHere) {
                myFleetHere.ships.add(selectedShipType, parseInt(buildSelectors.buildSlider.value));
            } else { //if not, make a new fleet at this planet
                var ships = new Ships();
                ships.add(selectedShipType, parseInt(buildSelectors.buildSlider.value));
                var fleet = new Fleet(currentPlayer, selectedPlanetIndex, 0, ships);
                fleets.push(fleet);
            }
            document.getElementsByName("credits")[0].value = players[currentPlayerIndex].credits;
            flashMessage("builtMessage", "Built!");
        }
    }
}

function onBuildShipModalClose() {
    refreshSelectedPlanetInfo(planets[selectedPlanetIndex]);
}