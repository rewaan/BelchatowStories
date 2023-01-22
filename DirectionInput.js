class DirectionInput {
    constructor() {
        this.heldDirections = [];

        this.map = {
            "KeyW": "up",
            "ArrowUp": "up",
            "KeyA": "left",
            "ArrowLeft": "left",
            "KeyD": "right",
            "ArrowRight": "right",
            "KeyS": "down",
            "ArrowDown": "down",
        }
    }

    get direction() {
        return this.heldDirections[0];
    }

    init() {
        document.addEventListener("keydown", event => {
            const dir = this.map[event.code];
            if (dir && this.heldDirections.indexOf(dir) === -1) {
                this.heldDirections.unshift(dir);
            }
        });
        document.addEventListener("keyup", event => {
            const dir = this.map[event.code];
            const index = this.heldDirections.indexOf(dir);
            if (index > -1) {
                this.heldDirections.splice(index, 1);
            }
        })
    }
}