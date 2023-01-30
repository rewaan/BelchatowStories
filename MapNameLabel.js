class MapNameLabel {
    constructor({text, onComplete}) {
        this.text = text;
        this.onComplete = onComplete;
        this.element = null;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("MapLabel");

        this.element.innerHTML = (`
            <p class="MapLabel_p"></p>
        `)

        let span = document.createElement("span");
        span.textContent = this.text;
        span.classList.add("revealed");
        this.element.appendChild(span);

        setTimeout(() => {
            this.done();
        }, 3000)
    }

    done() {
        this.element.remove();
        this.onComplete();
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
    }
}