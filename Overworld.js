class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    startGameLoop() {
        const step = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const cameraPerson = this.map.gameObjects.hero;

            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                });
            })

            this.map.drawLowerImage(this.ctx, cameraPerson);
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            });
            this.map.drawUpperImage(this.ctx, cameraPerson);

            requestAnimationFrame(() => {
                step();
            })
        }
        step();
    }

    bindActionInput() {
        new KeyPressListener("Space", () => {
            this.map.checkForActionCutscene()
        })
    }

    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", evt => {
            if (evt.detail.whoId === "hero") {
                this.map.checkForFootstepCutscene()
            }
        })
    }

    startMap(mapConfig, heroInitialState=null) {
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();

        if (heroInitialState) {
            this.map.gameObjects.hero.x = heroInitialState.x;
            this.map.gameObjects.hero.y = heroInitialState.y;
            this.map.gameObjects.hero.direction = heroInitialState.direction;
        }
        this.event = new OverworldEvent({map: this.map, event: {type: "mapName", text: this.map.name}})
        this.event.init()
    }

    init() {
        this.startMap(window.OverworldMaps.Blok_10);

        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();
        this.directionInput.direction;

        this.startGameLoop();

        // this.map.startCutscene([
        //     {type: "changeMap", map: "DemoRoom"},
        //     {type: "textMessage", text: "WELCOME TO THE GAME MY FREND!"},
        // ])
    }
}