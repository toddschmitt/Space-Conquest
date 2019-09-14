function Fleet(owner, location, remainingTransit, ships) {
    this.owner = owner;
    this.location = location;
    this.remainingTransit = remainingTransit;
    this.ships = ships;
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

    remove(shipType, number) {
        this.shipCounts[shipType.name] -= number;
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

// function ShipType(name, attack, hp, phase, durability, cost, techLevel, specialAttack) {
//     this.name = name;
//     this.attack = attack;
//     this.hp = hp;
//     this.phase = phase;
//     this.durability = durability;
//     this.cost = cost;
//     this.techLevel = techLevel;
//     this.specialAttack = specialAttack;
// }

function SpaceLane(planetFrom, planetTo, transitTime) {
    this.planetFrom = planetFrom;
    this.planetTo = planetTo;
    this.transitTime = transitTime;
}

class Ship {
    constructor(count, name, abbreviation, attack, hp, phase, durability, cost, techLevel, specialAttack) {
        this.count = count;
        this.name = name;
        this.abbreviation = abbreviation;
        this.attack = attack;
        this.hp = hp;
        this.phase = phase;
        this.durability = durability;
        this.cost = cost;
        this.techLevel = techLevel;
        this.specialAttack = specialAttack;
    }
}

class FighterShip extends Ship {
    constructor(count) {
        super(count, "Fighter", "F", 7, 5, 3, 5, 25, 7, 0);
    }
}

class ShotGunBoatShip extends Ship {
    constructor(count) {
        super(count, "ShotgunBoat", "Sb", 10, 3, 2, 5, 50, 7, 0);
    }
}