export default class ComboBox extends HTMLElement {

    #items;
    #up = `<svg class="arrow" width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 11L9 2L17 11" stroke="#1B1B1B" stroke-width="2" stroke-linecap="round"/></svg>`;
    #down = `<svg class="arrow" width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 1L9 10L1 0.999999" stroke="#1B1B1B" stroke-width="2" stroke-linecap="round"/></svg>`;

    #isDropDown = true;

    #onChange;

    constructor(options) {
        super().attachShadow({mode: 'open'});
        this.#setStyle();

        if(options?.isDropDown) {
            this.#isDropDown = options.isDropDown;
        }

        this.#setLayout();
    }

    #setStyle() {
        const style = document.createElement('style');
        style.textContent = `
            :host { cursor:pointer; font-size:1em;  }
            :host {
                --bg-color-ul: #FFFFFF;
                --bg-color-li_on: #007BFE;

                --color-ul: #000000;
                --color-li_on: #FFFFFF;
            }
            DIV, BUTTON, UL, LI, SPAN { margin:0; padding:0; }

            .btn-pick { width: 100%; line-height: 2; display: flex; flex-direction: row; justify-content: space-between; padding: 0.2em 0.5em; background-color: #FFFFFF; }

            .list-box { display:none; list-style: none; background-color: var(--bg-color-ul); color: var(--color-ul); margin-top: .5em; border:1px solid black; }
            .list-box.on { display:flex; flex-direction:column; height:10em; overflow-y: auto;}

            .list-box > LI { padding:.25em .5em;  }
            .list-box > LI.on { background-color: var(--bg-color-li_on); color: var(--color-li_on); }


            .arrow { }
            .on > .arrow { } 
        `;

        this.shadowRoot.appendChild(style);
    }

    #setLayout(defaultOption = {'value':0,'name':'전체'}) {
        const box = document.createElement('DIV');
        box.className = 'box';

        const button = document.createElement('BUTTON');
        button.className = 'btn-pick';

        const spanPick = document.createElement('SPAN');
        spanPick.className = 'pick';
        spanPick.textContent = defaultOption.name;
        spanPick.value = defaultOption.value;


        const spanIcon = document.createElement('SPAN');
        spanIcon.className = 'icon';
        spanIcon.innerHTML = this.#isDropDown ? this.#down : this.#up;
        const iconObserver = new MutationObserver((mutations) => {
            mutations
                .forEach(mutation => {
                    const target = mutation.target;
                    const isOn = target.classList.contains('on');
                    target.innerHTML = isOn ?
                        ( this.#isDropDown ? this.#up : this.#down) :
                        ( this.#isDropDown ? this.#down : this.#up) ;

                    const listBox = this.shadowRoot.querySelector('UL.list-box');
                    if(isOn) {
                        listBox.classList.add('on');
                    } else {
                        listBox.classList.remove('on');
                    }
                });
        })
        iconObserver.observe(spanIcon, {attributeFilter: ["class"]});

        button.appendChild(spanPick);
        button.appendChild(spanIcon);
        button.addEventListener('pointerup', (evt) => {
            evt.stopImmediatePropagation();
            const currentTarget = evt.currentTarget;
            const spanIcon = currentTarget.querySelector('SPAN.icon');
            spanIcon.classList.toggle('on');
        });

        const ul = document.createElement('UL');
        ul.className = 'list-box';

        box.appendChild(button);
        box.appendChild(ul);

        this.shadowRoot.appendChild(box);
    }

    get items() {
        return this.#items;
    }

    set items(items) {
        this.#items = items;
        this.renderItems();
    }

    get onChange() {
        return this.#onChange;
    }

    set onChange(fnOnChange) {
        this.#onChange = fnOnChange;
    }

    attributeChangedCallback(name, old, newValue) {
        if(name === 'value' && this.#onChange) {
            this.#onChange(newValue);
        }
    }

    static get observedAttributes() { return ['value']; }

    connectedCallback() {
        const drop = this.getAttribute('drop');
        if(drop !== undefined && drop === 'up') {
            this.#isDropDown = false;
            const box = this.shadowRoot.querySelector('.box');
            box.insertBefore(box.querySelector('UL'), box.querySelector('BUTTON'));
        }
    }

    renderItems() {
        const target = this.shadowRoot.querySelector('UL.list-box');

        const frag = document.createDocumentFragment();
        for(const item of this.#items) {

            const li = document.createElement('LI');

            li.value = item.value;
            li.textContent = item.name;
            li.addEventListener('pointerup', (evt) => {
                evt.stopPropagation();
                const currentTarget = evt.currentTarget;

                currentTarget.parentElement.querySelector('LI.on')?.classList.remove('on');
                currentTarget.classList.add('on');

                const value = currentTarget.value;
                this.value = value;
                this.setAttribute('value', value);

                const textContent = currentTarget.textContent;
                const pickSpan = this.shadowRoot.querySelector('SPAN.pick');
                pickSpan.textContent = textContent;

                this.closeListBox();
            });

            frag.appendChild(li);
        }

        target.replaceChildren(frag);
    }

    openListBox() {
        const spanIcon = this.shadowRoot.querySelector('SPAN.icon');
        spanIcon.classList.add('on');
    }
    closeListBox() {
        const spanIcon = this.shadowRoot.querySelector('SPAN.icon');
        spanIcon.classList.remove('on');
    }
}

customElements.define('n-combo-box', ComboBox);