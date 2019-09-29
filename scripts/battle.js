function resolveBattle(fleets) {
    var player1Id = 'Red';
    var player2Id = 'Blue';
    var computerNeutralId = 'Native';

    var combatant1;
    var combatant2;

    combatant1 = fleets.find((f) => f.owner === player1Id) != undefined ? player1Id : player2Id;
    combatant2 = fleets.find((f) => f.owner === player2Id) != undefined ? player2Id : computerNeutralId;

    combatant1Fleet = fleets.filter((f) => f.owner === combatant1)[0];
    combatant2Fleet = fleets.filter((f) => f.owner === combatant2)[0];

    var combatant1ShipCount = combatant1Fleet.ships.getCountOfShips();
    var combatant2ShipCount = combatant2Fleet.ships.getCountOfShips();

    const battleLuckContainer = new BattleLuckContainer(
        calculateLuckModifiers(combatant1ShipCount < combatant2ShipCount),
        calculateLuckModifiers(combatant2ShipCount < combatant1ShipCount)
    )

    var battle = new Battle(currentTurn, [combatant1Fleet.clone(), combatant2Fleet.clone()], combatant1Fleet.location);
    for (var roundNum = 0; roundNum < 3; roundNum++) {
        var roundResult = new RoundResult(roundNum + 1);
        for (var phaseNum = 0; phaseNum < 3; phaseNum++) {
            roundResult.addResult(resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum, roundNum, battleLuckContainer));
        }
        battle.addRoundResults(roundResult);
    }
    battle.setResultFleets(battle.resultsByRound[2].phaseResults[2].results.map((r) => r.resultantFleet));
    return battle;
}

function calculateLuckModifiers(underdog) {
    var r = getRndInteger(0, 7);
    if (underdog)
        r++;

    return new BattleLuckModifiers(.6 + .25 * r, 1 - .09 * r);
}

function resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum, roundNum, battleLuckContainer) {
    var phaseResult = new PhaseResult(phaseNum);

    //For this phase, generate the full attack power for combatant1
    var combatant1AttackPower = calculatePhaseAttackPower(combatant1Fleet, phaseNum) * battleLuckContainer.combatant1Modifiers.attackModifier;
    var combatant2AttackPower = calculatePhaseAttackPower(combatant2Fleet, phaseNum) * battleLuckContainer.combatant2Modifiers.attackModifier;

    var combatant1Losses = removeBattleLossesFromFleet(combatant2AttackPower * battleLuckContainer.combatant1Modifiers.defenseModifier, combatant1Fleet);
    var combatant2Losses = removeBattleLossesFromFleet(combatant1AttackPower * battleLuckContainer.combatant2Modifiers.defenseModifier, combatant2Fleet);

    shipTypes.forEach((st) => {
        //Effects of durability, bring ships back from the dead.
        var saved = 0;
        var i;
        for (i = 0; i < -1 * combatant1Losses.shipCounts[st.name]; i++) {
            if (getRndInteger(1, 100) <= st.durability) {
                saved++;
            }
        }
        combatant1Losses.add(st, saved);

        saved = 0;
        for (i = 0; i < -1 * combatant2Losses.shipCounts[st.name]; i++) {
            if (getRndInteger(1, 100) <= st.durability) {
                saved++;
            }
        }
        combatant2Losses.add(st, saved);

        //Merge the ships losses and the fleet to get the resultant fleet
        combatant1Fleet.ships.add(st, combatant1Losses.shipCounts[st.name]);
        combatant2Fleet.ships.add(st, combatant2Losses.shipCounts[st.name]);
    });

    phaseResult.addResult(combatant1Fleet.owner, combatant1Losses, combatant1AttackPower, combatant1Fleet);
    phaseResult.addResult(combatant2Fleet.owner, combatant2Losses, combatant2AttackPower, combatant2Fleet);

    return phaseResult;
}

function calculatePhaseAttackPower(fleet, phaseNum) {
    var shipsTypesAttacking = shipTypes.filter((s) => s.phases.includes(phaseNum + 1));
    var attackPower = 0;
    shipsTypesAttacking.forEach(function (type) {
        var number = fleet.ships.shipCounts[type.name];
        if (number > 0) {
            for (var i = 0; i < number; i++) {
                attackPower += getRndInteger(0, type.attack);
            }
        }
    })

    return attackPower;
}

function removeBattleLossesFromFleet(damageFromAttack, fleet) {
    var shipsFlat = [];
    var lossesShips = new Ships(shipTypes);
    shipTypes.forEach((st) => {
        var cnt = fleet.ships.shipCounts[st.name];
        for (var i = 0; i < cnt; i++) {
            shipsFlat.push({
                hp: st.hp,
                name: st.name,
                durability: st.durability
            });
        }

    });

    while (damageFromAttack > 0 && shipsFlat.length > 0) {
        var index = getRndInteger(0, shipsFlat.length - 1);
        var ship = shipsFlat[index];

        if (damageFromAttack >= ship.hp) {
            lossesShips.addByName(ship.name, -1);
            shipsFlat.splice(index, 1);
        }
        damageFromAttack -= ship.hp;
    }
    return lossesShips;
}


function test_battle() {
    var battleTestFleets = [];
    var ships = new Ships(shipTypes);
    ships.add(new FighterShip(), 6);
    var fleet = new Fleet('Red', 1, 0, ships);
    battleTestFleets.push(fleet);

    ships = new Ships(shipTypes);
    ships.add(new FighterShip(), 3);
    ships.add(new ShotGunShip(), 2);
    fleet = new Fleet('Blue', 1, 0, ships);
    battleTestFleets.push(fleet);

    var battle = resolveBattle(battleTestFleets);
    console.log(battle.toString(true));
    return battle;
}

function test_removeBattleLossesFromFleet() {
    var ships = new Ships(shipTypes);
    ships.add(new FighterShip(), 10);
    var fleet = new Fleet('Red', 1, 0, ships);

    console.log("Expected: Lose 1 Fighter");
    console.log("Actual:" + removeBattleLossesFromFleet(5, fleet).toString());
    console.log("Expected: Lose 2 Fighter");
    console.log("Actual:" + removeBattleLossesFromFleet(8, fleet).toString());
}

function test_montecarlo(iterations) {
    if (iterations === undefined) {
        iterations = 100000;
    }
    var dict = {};
    for (var i = 0; i < iterations; i++) {
        var battle = test_battle();
        var resultFleet1 = battle.resultFleets.filter((f) => f.owner === player1Id)[0];
        var resultFleet2 = battle.resultFleets.filter((f) => f.owner === player2Id)[0];
        var key = player1Id + resultFleet1.ships.toString() + player2Id + resultFleet2.ships.toString();
        if (key in dict) {
            dict[key] = dict[key] + 1;
        } else {
            dict[key] = 1;
        }
    }
    // Create items array
    var items = Object.keys(dict).map(function (key) {
        return [key, dict[key]];
    });

    // Sort the array based on the second element
    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    for (var k = 0; k < items.length; k++) {
        var count = items[k][1];
        var percentage = items[k][1] / iterations * 100;
        console.log(items[k][0] + " " + count + " " + percentage.toFixed(2) + "%");
    }
}