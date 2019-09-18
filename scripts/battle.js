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

    for (var roundNum = 0; roundNum < 3; roundNum++) {
        for (var phaseNum = 0; phaseNum < 4; phaseNum++) {
            resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum, roundNum);
        }
    }
}

function resolveBattlePhase(combatant1Fleet, combatant2Fleet, phaseNum, roundNum) {
    //For this phase, generate the full attack power for combatant1
    var shipsTypesAttacking = shipTypes.filter((s) => s.phases.includes(phaseNum));
    var combatant1AttackPower = 0;

    shipsTypesAttacking.forEach(function (type) {
        var number = combatant1Fleet.ships.shipCounts[type.name];
        if (number > 0) {
            for (var i = 0; i < number; i++) {
                combatant1AttackPower += getRndInteger(1, type.attack);
            }
        }
    })
}