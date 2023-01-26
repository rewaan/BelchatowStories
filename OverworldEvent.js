class OverworldEvent {
    constructor({ map, event}) {
        this.map = map;
        this.event = event;
    }

    stand(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehaviour({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        })

        //Set up a handler to complete when correct person is done walking, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonStandComplete", completeHandler)
    }

    walk(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehaviour({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true
        })

        //Set up a handler to complete when correct person is done walking, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonWalkingComplete", completeHandler)

    }

    textMessage(resolve) {

        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
        })
        message.init( document.querySelector(".game-container") )
    }

    changeMap(resolve) {

        Object.values(this.map.gameObjects).forEach(obj => {
            obj.isMounted = false;
        })

        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
                x: this.event.x,
                y: this.event.y,
                direction: this.event.direction,
            });
            resolve();
            sceneTransition.fadeOut();
        })
    }

    changeMapWithCheck(resolve) {

        Object.values(this.map.gameObjects).forEach(obj => {
            obj.isMounted = false;
        })

        const sceneTransition = new SceneTransition();

        if (this.event.required.every(sf => playerState.storyFlags[sf])) {
            sceneTransition.init(document.querySelector(".game-container"), () => {
                this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
                    x: this.event.x,
                    y: this.event.y,
                    direction: this.event.direction,
                });
                resolve();
                sceneTransition.fadeOut();
            })
            return;
        }
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.overworld.startMap( window.OverworldMaps[this.event.defaultMap], {
                x: this.event.x,
                y: this.event.y,
                direction: this.event.direction,
            });
            resolve();
            sceneTransition.fadeOut();
        })
    }

    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }

}