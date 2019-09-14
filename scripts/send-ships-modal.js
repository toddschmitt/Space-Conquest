var sendSelectors = {}

function setupSendSelectors() {
    sendSelectors.sendShipFromPlanet = byId("sendShipFromPlanet");
    sendSelectors.sendShipSelectPlanet = byId("sendShipSelectPlanet");
    sendSelectors.shipSendTransitTurns = byId("shipSendTransitTurns");
    sendSelectors.shipSendArrivalTurn = byId("shipSendArrivalTurn");
    sendSelectors.shipSendShipsAvailable = byId("shipSendShipsAvailable");
    sendSelectors.sendShipSelectShipType = byId("sendShipSelectShipType");
    sendSelectors.sendShipRange = byId("sendShipRange");
    sendSelectors.shipSendCount = byId("shipSendCount");
    sendSelectors.addToFleetButton = byId("addToFleetButton");
    sendSelectors.shipSendShipsInFleet = byId("shipSendShipsInFleet");
    sendSelectors.sendShipButton = byId("sendShipButton");
}

function onSendShipModalOpen() {
    setupSendSelectors();

    if (sendSelectors.sendShipSelectPlanet.options.length > 1) {
        for (i = sendSelectors.sendShipSelectPlanet.options.length - 1; i >= 1; i--) {
            sendSelectors.sendShipSelectPlanet.remove(i);
        }
    }

    var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

    sendSelectors.sendShipSelectPlanet.onchange = function (e) {
        var destinationIndex = planets.findIndex((p) => p.name === e.srcElement.value);
        var spaceLane = spaceLanes.filter((l) => l.planetFrom.id === selectedPlanetIndex && l.planetTo.id === destinationIndex)[0];

        sendSelectors.shipSendTransitTurns.innerHTML = spaceLane.transitTime;

        sendSelectors.shipSendArrivalTurn.innerHTML = spaceLane.transitTime + currentTurn;
    }
    sendSelectors.sendShipSelectPlanet.selectedIndex = 0;

    spaceLanes.filter((l) => l.planetFrom.id === selectedPlanetIndex).map((l) => l.planetTo.name).forEach((s) => {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(s));
        opt.value = s;
        sendSelectors.sendShipSelectPlanet.appendChild(opt);
    })

    sendSelectors.shipSendShipsAvailable.innerHTML = getCurrentPlayerFleetOnCurrentPlanet().ships.toString();


    // var slider = document.getElementById("myRange");
    // var output = document.getElementById("shipBuildCount");
    // output.innerHTML = slider.value;

    // slider.oninput = function () {
    //     var output = document.getElementById("shipBuildCount");
    //     output.innerHTML = this.value;

    //     var selectedShipType = shipTypes.filter((s) => s.name === select.options[select.selectedIndex].text)[0];
    //     var totalCost = this.value * selectedShipType.cost;

    //     var shipBuildCost = document.getElementById("shipBuildCost");
    //     shipBuildCost.innerHTML = totalCost;
    // }

    // var planetNameHeader = document.getElementById("sendShipFromPlanet");
    // planetNameHeader.textContent = planets[selectedPlanetIndex].name;

    // var creditsBuildShips = document.getElementById("creditsBuildShips");
    // creditsBuildShips.value = players[currentPlayerIndex].credits;

    // var buildShipButton = document.getElementById("buildShipButton");
    // buildShipButton.onclick = function () {
    //     var slider = document.getElementById("myRange");

    //     var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

    //     var selectedShipType = shipTypes.filter((s) => s.name === select.options[select.selectedIndex].text)[0];
    //     var totalCost = slider.value * selectedShipType.cost;

    //     if (totalCost <= players[currentPlayerIndex].credits) {
    //         //Pay for the ships we built
    //         players[currentPlayerIndex].credits -= totalCost;
    //         var creditsBuildShips = document.getElementById("creditsBuildShips");
    //         creditsBuildShips.value = players[currentPlayerIndex].credits;

    //         //See if we have a fleet on this planet right now, if so add to that fleet
    //         var myFleetHere = getCurrentPlayerFleetOnCurrentPlanet();
    //         if (myFleetHere) {
    //             myFleetHere.ships.add(selectedShipType, parseInt(slider.value));
    //         } else { //if not, make a new fleet at this planet
    //             var ships = new Ships();
    //             ships.add(selectedShipType, parseInt(slider.value));
    //             var fleet = new Fleet(currentPlayer, selectedPlanetIndex, 0, ships);
    //             fleets.push(fleet);
    //         }
    //         document.getElementsByName("credits")[0].value = players[currentPlayerIndex].credits;
    //         flashMessage("builtMessage", "Built!");
    //     }
    // }
}

function onSendShipModalClose() {
    refreshSelectedPlanetInfo(planets[selectedPlanetIndex]);
}