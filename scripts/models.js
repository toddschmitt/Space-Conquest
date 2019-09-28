class Fleet {
    constructor(owner, location, remainingTransit, ships) {
        this.owner = owner;
        this.location = location;
        this.remainingTransit = remainingTransit;
        this.ships = ships;
        this.uuid = generateUUID();
    }

    clone() {
        return new Fleet(this.owner, this.location, this.remainingTransit, this.ships.clone(), this.uuid);
    }
}

class Ship {
    constructor(count, name, abbreviation, attack, hp, phases, durability, cost, techLevel, specialAttack) {
        this.count = count;
        this.name = name;
        this.abbreviation = abbreviation;
        this.attack = attack;
        this.hp = hp;
        this.phases = phases;
        this.durability = durability;
        this.cost = cost;
        this.techLevel = techLevel;
        this.specialAttack = specialAttack;
    }
}

class FighterShip extends Ship {
    constructor(count) {
        super(count, "Fighter", "F", 8, 5, [3], 5, 25, 7, 0);
    }
}

class ShotGunBoatShip extends Ship {
    constructor(count) {
        super(count, "ShotgunBoat", "Sb", 12, 3, [2], 5, 50, 7, 0);
    }
}

class Ships {
    constructor(shipTypes) {
        this.shipTypes = shipTypes;
        this.shipCounts = {};
        this.shipTypes.forEach((s) => {
            this.shipCounts[s.name] = 0;
        })
    }

    add(shipType, number) {
        this.shipCounts[shipType.name] += number;
    }

    addByName(name, number) {
        this.shipCounts[name] += number;
    }

    remove(shipType, number) {
        this.shipCounts[shipType.name] -= number;
    }

    isEmpty() {
        var numberOfShips = 0;
        this.shipTypes.forEach((s) => {
            numberOfShips += this.shipCounts[s.name];
        })
        return numberOfShips < 1;
    }

    clone() {
        var clone = new Ships(this.shipTypes);
        this.shipTypes.forEach((s) => {
            clone.add(s, this.shipCounts[s.name]);
        })
        return clone;
    }

    toString() {
        var fleetString = "";
        this.shipTypes.forEach((s) => {
            fleetString += s.abbreviation + ":" + this.shipCounts[s.name] + ",";
        })
        return fleetString;
    }
}

function Player(id) {
    this.id = id;
    this.credits = 0;

}

class Battle {
    constructor(turnNumber, startFleets, location) {
        this.turnNumber = turnNumber;
        this.startFleets = startFleets;
        this.location = location;
        this.resultFleets = null;
        this.resultsByRound = [];
    }

    addRoundResults(roundResult) {
        this.resultsByRound.push(roundResult);
    }

    setResultFleets(resultFleets) {
        this.resultFleets = resultFleets;
    }
    resolve() {
        this.shipCounts[shipType.name] += number;
        //returns list of resulting fleets
        //returns object of battle losses
    }

    toString(terse) {
        return "Start Fleet " + this.startFleets[0].owner + ": " + this.startFleets[0].ships.toString() + '\r' +
            "Start Fleet " + this.startFleets[1].owner + ": " + this.startFleets[1].ships.toString() + '\r' +
            this.resultsByRound.map((r) => r.toString(terse)).join('\r') +
            "End Fleet " + this.resultFleets[0].owner + this.resultFleets[0].ships.toString() + '\r' +
            "End Fleet " + this.resultFleets[1].owner + this.resultFleets[1].ships.toString() + '\r';
    }
}

class RoundResult {
    constructor(roundNumber) {
        this.roundNumber = roundNumber;
        this.phaseResults = [];
    }

    addResult(phaseResult) {
        this.phaseResults.push(phaseResult);
    }

    toString(terse) {
        var roundString = "";
        roundString += "Round: " + this.roundNumber + '\r';
        for (var i = 0; i < this.phaseResults.length; i++) {
            roundString += "Phase: " + (i + 1) + '\r';
            roundString += (this.phaseResults[i].toString(terse));
        }
        return roundString;
    }
}

class PhaseResult {
    constructor(phaseNumber) {
        this.phaseNumber = phaseNumber;
        this.results = [];
    }

    addResult(player, shipsLost, power, resultantFleet) {
        this.results.push({
            player: player,
            shipsLost: shipsLost,
            power: power,
            resultantFleet: resultantFleet
        })
    }

    toString(terse) {
        var phaseString = "";
        if (terse && this.results[0].power === 0 && this.results[1].power === 0)
            return "";
        var r = this.results[0];
        phaseString += (r.player + ": Power: " + r.power + '\r' + "Losses: " + r.shipsLost.toString() + '\r');
        r = this.results[1];
        phaseString += (r.player + ": Power: " + r.power + '\r' + "Losses: " + r.shipsLost.toString() + '\r');
        return phaseString;
    }
}


function SpaceLane(planetFrom, planetTo, transitTime) {
    this.planetFrom = planetFrom;
    this.planetTo = planetTo;
    this.transitTime = transitTime;
}