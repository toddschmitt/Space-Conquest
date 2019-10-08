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
        super(count, "Fighter", "F", 10, 5, [3], 5, 25, 7, 0);
    }
}

class ShotGunShip extends Ship {
    constructor(count) {
        super(count, "ShotGunShip", "Sg", 18, 3, [2], 5, 50, 7, 0);
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
        return this.getCountOfShips() < 1;
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

    getCountOfShips() {
        var count = 0;
        this.shipTypes.forEach((s) => {
            count += this.shipCounts[s.name];
        })
        return count;
    }
}

function Player(id) {
    this.id = id;
    this.credits = 0;
}

class Messages {
    constructor() {
        this.messages = [];
        this.count = 0;
    }

    add(header, body, turn, recipients) {
        this.messages.push(new Message(this.count, header, body, turn, recipients));
        this.count++;
    }

    getLowestUnreadIdForPlayer(playerId) {
        var id = this.messages.find((m) => m.recipients.includes(playerId) && !m.readBy.includes(playerId))
        return id === undefined ? undefined : id.id;
    }

    readMessage(playerId, messageId) {
        if (!this.messages[messageId].readBy.includes(playerId)) {
            this.messages[messageId].readBy.push(playerId);
        }
        return this.messages[messageId];
    }

    getPreviousMessageId(playerId, messageId) {
        var filtered = this.messages.filter((m) => m.id < messageId && m.recipients.includes(playerId));
        return filtered.length < 1 ? undefined : filtered.map((f) => f.id).sort()[filtered.length - 1];
    }

    getNextMessageId(playerId, messageId) {
        var filtered = this.messages.filter((m) => m.id > messageId && m.recipients.includes(playerId));
        return filtered.length < 1 ? undefined : filtered.map((f) => f.id).sort()[0];
    }
}

function Message(id, header, body, turn, recipients) {
    this.header = header;
    this.body = body;
    this.turn = turn;
    this.recipients = recipients;
    this.readBy = [];
    this.id = id;
}

function BattleLuckModifiers(attackModifier, defenseModifier) {
    this.attackModifier = attackModifier;
    this.defenseModifier = defenseModifier;
}

function BattleLuckContainer(combatant1Modifiers, combatant2Modifiers) {
    this.combatant1Modifiers = combatant1Modifiers;
    this.combatant2Modifiers = combatant2Modifiers;
}

class Battle {
    constructor(turnNumber, startFleets, location, combatants) {
        this.turnNumber = turnNumber;
        this.startFleets = startFleets;
        this.location = location;
        this.resultFleets = null;
        this.resultsByRound = [];
        this.combatants = combatants;

    }

    addRoundResults(roundResult) {
        this.resultsByRound.push(roundResult);
    }

    setResultFleets(resultFleets) {
        this.resultFleets = resultFleets;
    }

    toString(terse) {
        return "Start Fleet " + this.startFleets[0].owner + ": " + this.startFleets[0].ships.toString() + '\n' +
            "Start Fleet " + this.startFleets[1].owner + ": " + this.startFleets[1].ships.toString() + '\n' +
            this.resultsByRound.map((r) => r.toString(terse)).join('\n') +
            "End Fleet " + this.resultFleets[0].owner + this.resultFleets[0].ships.toString() + '\n' +
            "End Fleet " + this.resultFleets[1].owner + this.resultFleets[1].ships.toString() + '\n';
    }

    toStringSummary() {
        return "<b>Start Fleet</b> \n" + this.startFleets[0].owner + ": " + this.startFleets[0].ships.toString() + '\n' +
            this.startFleets[1].owner + ": " + this.startFleets[1].ships.toString() + '\n\n' +
            "<b>End Fleet</b> \n" + this.resultFleets[0].owner + this.resultFleets[0].ships.toString() + '\n' +
            this.resultFleets[1].owner + this.resultFleets[1].ships.toString() + '\n';
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
        roundString += "Round: " + this.roundNumber + '\n';
        for (var i = 0; i < this.phaseResults.length; i++) {
            roundString += "Phase: " + (i + 1) + '\n';
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
        phaseString += (r.player + ": Power: " + r.power.toFixed(2) + '\n' + "Losses: " + r.shipsLost.toString() + '\n');
        r = this.results[1];
        phaseString += (r.player + ": Power: " + r.power.toFixed(2) + '\n' + "Losses: " + r.shipsLost.toString() + '\n');
        return phaseString;
    }
}


function SpaceLane(planetFrom, planetTo, transitTime) {
    this.planetFrom = planetFrom;
    this.planetTo = planetTo;
    this.transitTime = transitTime;
}