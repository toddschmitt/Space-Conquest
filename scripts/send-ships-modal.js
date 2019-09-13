function onSendShipModalOpen() {
    var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);
    var select = document.getElementById("buildShipSelect");

    if (select.options.length > 1) {
        for (i = select.options.length - 1; i >= 1; i--) {
            select.remove(i);
        }
    }

    select.onchange = function (e) {
        var shipCost = document.getElementById("shipCost");
        shipCost.innerHTML = shipTypes.filter((s) => s.name === e.srcElement.value)[0].cost;
    }

    //For every unique ship type, we are going to enter them into the dropdown selection so that
    // you can choose to make that type of ship.
    shipTypes.forEach((s) => {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(s.name));
        opt.value = s.name;
        select.appendChild(opt);
    })
    select.selectedIndex = 0;

    var slider = document.getElementById("myRange");
    var output = document.getElementById("shipBuildCount");
    output.innerHTML = slider.value;

    slider.oninput = function () {
        var output = document.getElementById("shipBuildCount");
        output.innerHTML = this.value;

        var selectedShipType = shipTypes.filter((s) => s.name === select.options[select.selectedIndex].text)[0];
        var totalCost = this.value * selectedShipType.cost;

        var shipBuildCost = document.getElementById("shipBuildCost");
        shipBuildCost.innerHTML = totalCost;
    }

    var planetNameHeader = document.getElementById("buildShipPlanet");
    planetNameHeader.textContent = planets[selectedPlanetIndex].name;

    var creditsBuildShips = document.getElementById("creditsBuildShips");
    creditsBuildShips.value = players[currentPlayerIndex].credits;

    var buildShipButton = document.getElementById("buildShipButton");
    buildShipButton.onclick = function () {
        var slider = document.getElementById("myRange");

        var currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer);

        var selectedShipType = shipTypes.filter((s) => s.name === select.options[select.selectedIndex].text)[0];
        var totalCost = slider.value * selectedShipType.cost;

        if (totalCost <= players[currentPlayerIndex].credits) {
            //Pay for the ships we built
            players[currentPlayerIndex].credits -= totalCost;
            var creditsBuildShips = document.getElementById("creditsBuildShips");
            creditsBuildShips.value = players[currentPlayerIndex].credits;

            //See if we have a fleet on this planet right now, if so add to that fleet
            var myFleetHere = getCurrentPlayerFleetOnCurrentPlanet();
            if (myFleetHere) {
                myFleetHere.ships.add(selectedShipType, parseInt(slider.value));
            } else { //if not, make a new fleet at this planet
                var ships = new Ships();
                ships.add(selectedShipType, parseInt(slider.value));
                var fleet = new Fleet(currentPlayer, selectedPlanetIndex, 0, ships);
                fleets.push(fleet);
            }
            document.getElementsByName("credits")[0].value = players[currentPlayerIndex].credits;
            flashMessage("builtMessage", "Built!");
        }
    }
}

function onSendShipModalClose() {
    refreshSelectedPlanetInfo(planets[selectedPlanetIndex]);
}