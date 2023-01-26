class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = {};
        this.walls = config.walls || {};
        this.configObjects = config.configObjects;

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;
        this.cutSceneSpaces = config.cutsceneSpaces || {};
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y)
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y)
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        if (this.walls[`${x},${y}`]) {
            return true;
        }
        return Object.values(this.gameObjects).find(obj => {
            if (obj.x === x && obj.y === y) {return true;}
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
                return true;
            }
            return false;
        })

    }

    mountObjects() {
        Object.keys(this.configObjects).forEach(key => {
            let object = this.configObjects[key];
            object.id = key;
            let instance;

            if (object.type === "Person") {
                instance = new Person(object);
            }
            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;
        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
            await eventHandler.init();
        }
        this.isCutscenePlaying = false;
        
    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutSceneSpaces[`${hero.x},${hero.y}`];
        if (!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events)
        }
    }

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {
            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf];
                })
            })
            relevantScenario && this.startCutscene(relevantScenario.events)
        }
    }

}

window.OverworldMaps = {
    Blok_10: {
        id: "Blok_10_start",
        lowerSrc: "/images/maps/blok_10.png",
        upperSrc: "/images/maps/blok_10_upper.png",
        gameObjects: {},
        configObjects: {
            hero:{
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(2),
                isPlayerControlled: true
            },
            npcA: {
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "/images/characters/people/npc1.png",
                behaviorLoop: [
                    {type: "walk", direction: "left", time: 800},
                    {type: "walk", direction: "up", time: 800},
                    {type: "walk", direction: "right", time: 1200},
                    {type: "walk", direction: "down", time: 300},
                ],
                talking: [
                    {
                        required: ["TALKED_TO_DARO"],
                        events: [
                            {type: "textMessage", text: "Daro jest taki przystojny...", faceHero: "npcA"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "Go away...", faceHero: "npcA"},
                            {type: "textMessage", text: "I said... GO AWAY!"},
                            {who: "hero", type: "walk", direction: "left"},
                        ]
                    }
                ]
            },
            npcB:{
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(4),
                src: "/images/characters/people/npc2.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 800},
                    {type: "stand", direction: "up", time: 800},
                    {type: "stand", direction: "right", time: 1200},
                    {type: "stand", direction: "up", time: 300},
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Elo jestem Daroo", faceHero: "npcB"},
                            {type: "textMessage", text: "Z pusta samarooo"},
                            {type: "addStoryFlag", flag: "TALKED_TO_DARO"},
                        ]
                    }
                ]
            },
        },

        walls: walls.blok_walls(),
        cutsceneSpaces: {
            [utils.asGridCoord(1,3)] : [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Plac",
                            x: utils.withGrid(1),
                            y: utils.withGrid(3),
                            direction: "left",
                        }
                    ]
                }
            ],
            [utils.asGridCoord(11,3)] : [
                {
                    events: [
                        {
                            required: ["TALKED_TO_DARO"],
                            type: "changeMapWithCheck",
                            map: "Inter",
                            defaultMap: "Plac",
                            x: utils.withGrid(1),
                            y: utils.withGrid(3),
                            direction: "right",
                        }
                    ]
                }
            ],
        }
    },
    Inter: {
        id: "Inter_start",
        lowerSrc: "/images/maps/inter.png",
        upperSrc: "/images/maps/inter_upper.png",
        gameObjects: {},
        configObjects: {
            hero: {
                type: "Person",
                x: utils.withGrid(1),
                y: utils.withGrid(3),
                isPlayerControlled: true
            },
        },
        walls: walls.inter_walls(),
        cutsceneSpaces: {
            [utils.asGridCoord(1,3)] : [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Blok_10",
                            x: utils.withGrid(11),
                            y: utils.withGrid(3),
                            direction: "left",
                        }
                    ]
                }
            ],
        }

    },
    Plac: {
        id: "Plac_start",
        lowerSrc: "/images/maps/plac_u_krzycha.png",
        upperSrc: "/images/maps/plac_u_krzycha_upper.png",
        gameObjects: {},
        configObjects: {
            hero: {
                type: "Person",
                x: utils.withGrid(1),
                y: utils.withGrid(3),
                isPlayerControlled: true
            },
        },
        walls: walls.plac_walls(),
        cutsceneSpaces: {
            [utils.asGridCoord(1,3)] : [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Blok_10",
                            x: utils.withGrid(1),
                            y: utils.withGrid(3),
                            direction: "right",
                        }
                    ]
                }
            ],
        }
    },
}