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

var send_numberOfShipsRange;
var send_fleetGettingReady;
var send_selectedShipTypeName;
var send_restorePointForFleet;
var send_selectedSpacelane;

function onSendShipModalOpen() {
    setupSendSelectors();
    //var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

    numberOfShipsRange = 0;

    //If the user cancels the modal, the fleet at this planet will restore and no ships will be moved.
    send_restorePointForFleet = getCurrentPlayerFleetOnCurrentPlanet();


    var ships = new Ships(shipTypes);
    send_fleetGettingReady = new Fleet(currentPlayer, selectedPlanetIndex, 0, ships);

    //Fill in the planet name we're building on
    sendSelectors.sendShipFromPlanet.textContent = planets[selectedPlanetIndex].name;

    //Clean up the planet dropdown selector, remove all but the default
    if (sendSelectors.sendShipSelectPlanet.options.length > 1) {
        for (i = sendSelectors.sendShipSelectPlanet.options.length - 1; i >= 1; i--) {
            sendSelectors.sendShipSelectPlanet.remove(i);
        }
    }

    //Fill in the list of planets you can travel to, based on the available space lanes
    spaceLanes.filter((l) => l.planetFrom.id === selectedPlanetIndex).map((l) => l.planetTo.name).forEach((s) => {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(s));
        opt.value = s;
        sendSelectors.sendShipSelectPlanet.appendChild(opt);
    })
    sendSelectors.sendShipSelectPlanet.selectedIndex = 0;

    //If the planet dropdown selector changes, fill in how long it will take the ships to arrive
    sendSelectors.sendShipSelectPlanet.onchange = function (e) {
        var destinationIndex = planets.findIndex((p) => p.name === e.srcElement.value);
        send_selectedSpacelane = spaceLanes.filter((l) => l.planetFrom.id === selectedPlanetIndex && l.planetTo.id === destinationIndex)[0];

        sendSelectors.shipSendTransitTurns.innerHTML = send_selectedSpacelane.transitTime;

        sendSelectors.shipSendArrivalTurn.innerHTML = send_selectedSpacelane.transitTime + currentTurn;
    }


    //Fill in the ship types and quantity based on what ships are on the selected planet
    sendSelectors.shipSendShipsAvailable.innerHTML = getCurrentPlayerFleetOnCurrentPlanet().ships.toString();

    //Clean up the ship type to send, remove all but the default option
    if (sendSelectors.sendShipSelectShipType.options.length > 1) {
        for (i = sendSelectors.sendShipSelectShipType.options.length - 1; i >= 1; i--) {
            sendSelectors.sendShipSelectShipType.remove(i);
        }
    }

    //Fill in the list of ship types you can select, based on what ship types are on this planet
    var shipCount = getCurrentPlayerFleetOnCurrentPlanet().ships.shipCounts;

    shipTypes.forEach((s) => {
        if (shipCount[s.name] > 0) {
            var opt = document.createElement('option');
            opt.appendChild(document.createTextNode(s.name));
            opt.value = s.name;
            sendSelectors.sendShipSelectShipType.appendChild(opt);
        }
    })
    sendSelectors.sendShipSelectShipType.selectedIndex = 0;

    //When the ship type changes, set the range slider to max out at the total number of those ships
    sendSelectors.sendShipSelectShipType.onchange = function (st) {
        var shipCount = getCurrentPlayerFleetOnCurrentPlanet().ships.shipCounts;
        sendSelectors.sendShipRange.max = shipCount[st.srcElement.value];
        send_selectedShipTypeName = st.srcElement.value;
    }


    sendSelectors.sendShipRange.oninput = function (r) {
        sendSelectors.shipSendCount.innerHTML = this.value;
        send_numberOfShipsRange = this.value;
    }

    sendSelectors.addToFleetButton.onclick = function () {
        if (send_numberOfShipsRange > 0) {
            send_fleetGettingReady.ships.add(shipTypes.find((s) => s.name === send_selectedShipTypeName), parseInt(sendSelectors.sendShipRange.value));
            getCurrentPlayerFleetOnCurrentPlanet().ships.remove(shipTypes.find((s) => s.name === send_selectedShipTypeName), parseInt(sendSelectors.sendShipRange.value));
            sendSelectors.shipSendShipsInFleet.innerHTML = send_fleetGettingReady.ships.toString();
            sendSelectors.shipSendShipsAvailable.innerHTML = getCurrentPlayerFleetOnCurrentPlanet().ships.toString();
        } else {
            flashMessage("sendMessage", "No Ships Selected");
        }
    }

    sendSelectors.sendShipButton.onclick = function () {

        send_fleetGettingReady.location = send_selectedSpacelane.planetTo.id;
        send_fleetGettingReady.remainingTransit = send_selectedSpacelane.transitTime;
        fleets.push(send_fleetGettingReady);

        //If the fleet at the planet is empty now, delete it
        if (getCurrentPlayerFleetOnCurrentPlanet().ships.isEmpty()) {
            fleets.splice(fleets.findIndex((f) => f.location === selectedPlanetIndex && f.owner === currentPlayer && f.remainingTransit === 0), 1);
        } else {
            send_restorePointForFleet = getCurrentPlayerFleetOnCurrentPlanet();
        }
        MODAL_MODULE.hideAllModals();
    }
}

function onSendShipModalClose() {
    if (getCurrentPlayerFleetOnCurrentPlanet()) {
        //restore the fleet that was on this planet before we started altering it, in case someone hit x without send
        fleets.splice(fleets.findIndex((f) => f.location === selectedPlanetIndex && f.owner === currentPlayer && f.remainingTransit === 0), 1);
        fleets.push(send_restorePointForFleet);
    }

    refreshSelectedPlanetInfo(planets[selectedPlanetIndex]);
}