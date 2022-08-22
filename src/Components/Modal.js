export default class Modal extends HTMLElement {

    #template;

    constructor(template) {
        super().attachShadow({mode:'open'});
        this.#setStyle();

        this.#template = template;
    }
    #setStyle() {
        const style = document.createElement('style');
        style.textContent = `
            :host { position:fixed; top:0; left:0; user-select: none; width:100vw; height:100vh; backdrop-filter: contrast(.5); } 

            .content.wrap { display:flex; flex-direction:column; overflow:auto; width:80%; align-items:center; }
            .content.wrap > * {  }
            
        `;

        this.shadowRoot.appendChild(style);
    }

    get template() {
        return this.#template;
    }

    set template(template) {
        this.#template = template;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const contentWrap = document.createElement('DIV');
        contentWrap.className = 'content wrap';

        const template = this.#template ? this.#template : this.querySelector('template');

        contentWrap.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(contentWrap);
    }

    setValue(id, attribute, value) {
        const target = this.shadowRoot.querySelector(`[px-id=${id}]`);
        target[attribute] = value;
    }

}

customElements.define('n-modal', Modal);