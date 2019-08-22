import { GameDataInterface } from "novadatainterface/GameDataInterface";
import { BuildingMap } from "./BuildingMap";
import { Planet } from "./Planet";
import { PlanetState } from "./PlanetState";
import { Ship } from "./Ship";
import { ShipState } from "./ShipState";
import { RecursivePartial, Stateful, StateIndexer } from "./Stateful";
import { getStateFromGetters, setStateFromSetters } from "./StateTraverser";
import { Steppable } from "./Steppable";
import { SystemState } from "./SystemState";



class System implements Stateful<SystemState>, Steppable {
    readonly ships: BuildingMap<Ship, ShipState>;
    readonly planets: BuildingMap<Planet, PlanetState>;
    private gameData: GameDataInterface;
    readonly uuid: string;

    constructor({ gameData, state }: { gameData: GameDataInterface, state: SystemState }) {
        this.uuid = state.uuid;
        this.gameData = gameData;

        this.ships = new BuildingMap<Ship, ShipState>(
            Ship.makeFactory(this.gameData),
            Ship.fullState
        );

        this.planets = new BuildingMap<Planet, PlanetState>(
            Planet.makeFactory(this.gameData),
            Planet.fullState
        );

        this.setState(state);
    }

    step(milliseconds: number): void {
        this.ships.forEach((ship) => ship.step(milliseconds));
    }

    getState(toGet: StateIndexer<SystemState> = {}): RecursivePartial<SystemState> {

        return getStateFromGetters<SystemState>(toGet, {
            planets: (toGet) => this.planets.getState(toGet),
            ships: (ships) => this.ships.getState(ships),
            uuid: () => this.uuid
        });
    }

    setState(state: Partial<SystemState>): StateIndexer<SystemState> {

        return setStateFromSetters<SystemState>(state, {
            planets: (planetStates) => this.planets.setState(planetStates),
            ships: (shipStates) => this.ships.setState(shipStates)
        });
    }

    getFullState(): SystemState {
        var state = this.getState({});
        var decoded = SystemState.decode(state);
        if (decoded.isLeft()) {
            throw decoded.value
        }
        else {
            return decoded.value;
        }
    }

    // static fromGameData(data: SystemData): SystemState {

    //     const planets: { [index: string]: PlanetState } = {};

    //     for (let planetID of data.planets) {

    //     }


    //     return {
    //         ships: {},

    //     }


    // }
}

function makeSystemFactory(gameData: GameDataInterface): (s: SystemState) => System {
    return function(state: SystemState) {
        return new System({ gameData, state });
    }
}

function fullSystemState(maybeState: RecursivePartial<SystemState>): SystemState | undefined {
    let decoded = SystemState.decode(maybeState)
    if (decoded.isRight()) {
        return decoded.value
    }
    else {
        return undefined;
    }
}



export { System, makeSystemFactory, fullSystemState };
