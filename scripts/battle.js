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

    var battle = new Battle(currentTurn, [combatant1Fleet, combatant2Fleet], combatant1Fleet.location);
    for (var roundNum = 0; roundNum < 3; roundNum++) {
        var roundResult = new RoundResult(roundNum + 1);
        for (var phaseNum = 0; phaseNum < 3; phaseNum++) {
            roundResult.addResult(resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum));
        }
        battle.addRoundResults(roundResult);
    }
    battles.push(battle);
}

function resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum) {
    var phaseResult = new PhaseResult(phaseNum);

    //For this phase, generate the full attack power for combatant1
    var combatant1AttackPower = calculatePhaseAttackPower(combatant1Fleet, phaseNum);
    var combatant2AttackPower = calculatePhaseAttackPower(combatant2Fleet, phaseNum);
    var combatant1DamageReduction = combatant1AttackPower > combatant2AttackPower ? battleWinnerDamageReduction : 1;
    var combatant2DamageReduction = combatant1AttackPower < combatant2AttackPower ? battleWinnerDamageReduction : 1;

    var combatant1Losses = removeBattleLossesFromFleet(combatant2AttackPower * combatant1DamageReduction, combatant1Fleet);
    var combatant2Losses = removeBattleLossesFromFleet(combatant1AttackPower * combatant2DamageReduction, combatant2Fleet);

    //Effects of durability, bring ships back from the dead.

    //Merge the ships losses and the fleet to get the resultant fleet
    shipTypes.forEach((st) => {
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
                attackPower += getRndInteger(1, type.attack);
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
        var index = getRndInteger(0, shipsFlat.length);
        var ship = shipsFlat[index];
        damageFromAttack -= ship.hp;
        if (damageFromAttack >= ship.hp) {
            lossesShips.addByName(ship.name, -1);
            shipsFlat.splice(index, 1);
        }
    }
    return lossesShips;
}


function battleTest() {
    var battleTestFleets = [];
    var ships = new Ships(shipTypes);
    ships.add(new FighterShip(), getRndInteger(1, 10));
    var fleet = new Fleet('Red', 1, 0, ships);
    battleTestFleets.push(fleet);

    ships = new Ships(shipTypes);
    ships.add(new FighterShip(), getRndInteger(1, 10));
    fleet = new Fleet('Blue', 1, 0, ships);
    battleTestFleets.push(fleet);

    resolveBattle(battleTestFleets);
    console.log(battles[0].toString());

}