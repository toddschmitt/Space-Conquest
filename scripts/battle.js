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

    var battle = new Battle(currentTurn, [combatant1Fleet.clone(), combatant2Fleet.clone()], combatant1Fleet.location);
    for (var roundNum = 0; roundNum < 3; roundNum++) {
        var roundResult = new RoundResult(roundNum + 1);
        for (var phaseNum = 0; phaseNum < 3; phaseNum++) {
            roundResult.addResult(resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum, roundNum));
        }
        battle.addRoundResults(roundResult);
    }
    battle.setResultFleets(battle.resultsByRound[2].phaseResults[2].results.map((r) => r.resultantFleet));
    return battle;
}

function calculateLuckModifiers() {
    var r = getRndInteger(1, 8);
    switch (r) {
        case 1:
            return [1, 1, 1.25, .75];
        case 2:
            return [1, 1, 1.15, .85];
        case 3:
            return [1, 1, 1.1, .9];
        case 4:
            return [1, 1, 1, 1];
        case 5:
            return [1, 1, 1, 1];
        case 6:
            return [1.1, .90, 1, 1];
        case 7:
            return [1.15, .85, 1, 1];
        case 8:
            return [1.25, .75, 1, 1];
    }
}

function resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum, roundNum) {
    var phaseResult = new PhaseResult(phaseNum);

    var [c1AttackMod, c1DefenseMod, c2AttackMod, c2DefenseMod] = calculateLuckModifiers();

    //For this phase, generate the full attack power for combatant1
    var combatant1AttackPower = calculatePhaseAttackPower(combatant1Fleet, phaseNum) * c1AttackMod;
    var combatant2AttackPower = calculatePhaseAttackPower(combatant2Fleet, phaseNum) * c2AttackMod;
    //var combatant1DamageReduction = combatant1AttackPower > combatant2AttackPower ? battleWinnerDamageReduction : 1;
    //var combatant2DamageReduction = combatant1AttackPower < combatant2AttackPower ? battleWinnerDamageReduction : 1;

    var combatant1DamageReduction = c1DefenseMod;
    var combatant2DamageReduction = c2DefenseMod;

    var combatant1Losses = removeBattleLossesFromFleet(combatant2AttackPower * combatant1DamageReduction, combatant1Fleet);
    var combatant2Losses = removeBattleLossesFromFleet(combatant1AttackPower * combatant2DamageReduction, combatant2Fleet);

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

function test_montecarlo() {
    var count = {};
    for (var i = 0; i < 100000; i++) {
        var battle = test_battle();
        var resultFleet1 = battle.resultFleets.filter((f) => f.owner === player1Id)[0];
        var resultFleet2 = battle.resultFleets.filter((f) => f.owner === player2Id)[0];
        var key = player1Id + resultFleet1.ships.toString() + player2Id + resultFleet2.ships.toString();
        if (key in count) {
            count[key] = count[key] + 1;
        } else {
            count[key] = 1;
        }
    }
    for (var k in count) {
        var value = count[k];
        console.log(k + " " + value);
    }
}