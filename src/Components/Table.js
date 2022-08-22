export default class Table extends HTMLElement {

    #columns;
    #items;

    #rowCount;
    #currentPage = 0;


    constructor(options) {

        super().attachShadow({mode:'open'});
        this.#setStyle();
        this.#setLayout();

        this.#items = [];

        this.#rowCount = options['rowCount'];

        if(options.columns) {
            this.#columns = options.columns;
            this.#renderTitle(this.#columns);
        }
    }

    #setStyle() {
        const style = document.createElement('style');
        style.textContent = `
            :host { width:100%; height:100%; display: flex; flex-direction: column; overflow: auto; user-select: none; } 

            .header { position:sticky; top:0; height:10%; display: flex; flex-direction: column;}
            .col.title { background-color:gray; color: white; font-size: 1.5em; font-weight: bold; cursor:pointer; }  

            .content { height:90%; display: flex; flex-direction: column; }
            .row { flex-wrap: wrap; display: flex; flex-direction: row;  flex: 1; gap: 1px; }
            .col { display:flex; flex-direction: column; justify-content: center; text-align: center; }

            .d-none { display: none; }
            
        `;

        this.shadowRoot.appendChild(style);
    }

    #setLayout() {
        const header = document.createElement('DIV');
        header.className = 'header';

        const contentWrap = document.createElement('DIV');
        contentWrap.className = 'content wrap';

        this.shadowRoot.appendChild(header);
        this.shadowRoot.appendChild(contentWrap);
    }

    #renderTitle(columns = []) {

        if(columns.length <= 0) {
            console.error('컬럼명 없음');
            return false;
        }

        const titleRow = document.createElement('DIV');
        titleRow.className = 'row title';
        titleRow.role = 'row';

        const frag = document.createDocumentFragment();

        for(const column of columns) {
            const colTitle = document.createElement('DIV');
            colTitle.className = 'title col';

            const columnSize = column.size;
            columnSize ? colTitle.style.flexBasis = columnSize : colTitle.style.flex = '1';

            colTitle.key = column.key;
            colTitle.isAsc = true;

            colTitle.innerText = column.name;
            colTitle.addEventListener('pointerup', (evt) => {
                const currentTarget = evt.currentTarget;
                const key = currentTarget.key;

                const isAsc = currentTarget.isAsc;
                const items = this.#rowCount ? this.#items[this.#currentPage] : this.#items;

                this.render(this.orderBy(items, key, !isAsc));

                currentTarget.isAsc =  !isAsc;
            });
            frag.appendChild(colTitle);
        }

        titleRow.appendChild(frag);

        const header = this.shadowRoot.querySelector('.header');
        header.replaceChildren(titleRow);
    }

    get columns() {
        return this.#columns;
    }

    set columns(value) {
        this.#columns = value;
    }

    get items() {
        return this.#items;
    }

    set items(value) {
        this.#items = this.#rowCount ? this.pagination(value) : value;
    }

    get currentPage() {
        return this.#currentPage;
    }

    set currentPage(page) {
        this.#currentPage = page;
        this.render(this.#items[page]);
    }

    // 페이징 처리
    pagination(arr) {
        return arr.reduce((acc, val, i) => {
            const idx = Math.floor(i / this.#rowCount);
            const page = acc[idx] || (acc[idx] = []);
            page.push(val);

            return acc;
        }, []);
    }

    orderBy(items, key, isAsc) {
        const value = items[0][key];

        if(!isNaN(value)) {
            return this.orderByNum(items, key, isAsc);
        }

        if(new Date(value).toString() !== 'Invalid Date') {
            return this.orderByDate(items, key, isAsc);
        }

        return this.orderByString(items, key, isAsc);
    }

    orderByNum(items, key, isAsc) {
        const sorted = items.sort((a, b) => {
            return a[key] - b[key];
        });
        return isAsc ?  sorted : sorted.reverse();
    }

    orderByDate(items, key, isAsc) {
        const sorted = items.sort((a, b) => {
            return new Date(a[key]) - new Date(b[key]);
        });
        return isAsc ? sorted : sorted.reverse();
    }

    orderByString(items, key, isAsc) {
        const sorted = items.sort((a, b) => {
            return a[key].localeCompare(b[key]);
        });
        return isAsc ? sorted : sorted.reverse();
    }

    connectedCallback() {
        const items = this.#rowCount ? this.#items[this.#currentPage] : this.#items;
        this.render(items);
    }

    render(itemList = []) {

        if(itemList.length < 1) {
            console.error('NO DATA');
            return;
        }

        const contentWrapper = this.shadowRoot.querySelector('.content.wrap');
        const frag = document.createDocumentFragment();

        for(const item of itemList) {
            const row = this.rowTemplate(item);
            frag.appendChild(row);
        }

        contentWrapper.replaceChildren(frag);
        return this;
    }

    rowTemplate(item) {

        const template = document.createElement('DIV');
        template.className = 'row';
        template.role = 'row';

        for(const column of this.#columns) {
            const colDiv = document.createElement('DIV');
            colDiv.role = 'gridcell'
            colDiv.className = 'col';
            const {
                key
            } = column;
            colDiv.key = key;

            const columnSize = column.size;
            columnSize ? colDiv.style.flexBasis = columnSize
                : colDiv.style.flex = '1';


            colDiv.innerText = item[key];

            template.appendChild(colDiv);
        }
        return template;
    }
}

customElements.define('n-table', Table);