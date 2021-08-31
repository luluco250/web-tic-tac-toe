/**
 * Dummy HTML tag function for syntax highlighters.
 * @returns {string} The original raw string.
 */
const html = x => x.raw[0];

const template = document.createElement("template");
template.innerHTML = html`
	<style>
		:host > div {
			--border-color: red;
			--border: 0.1em solid;
			display: inline-grid;
			grid-template:
				"a a a"
				"b b b"
				"c c c";
			border: var(--border);
			border-color: var(---border-color);
		}

		button {
			font: inherit;
			padding: 0;
			appearance: none;
			background: none;
			width: 2em;
			height: 2em;
			border: var(--border);
			border-color: var(---border-color);
		}

		button:active {
			background: rgba(0, 0, 0, 0.1);
		}
	</style>
	<div>
		<button id="nw"></button>
		<button id="n"></button>
		<button id="ne"></button>
		<button id="w"></button>
		<button id="c"></button>
		<button id="e"></button>
		<button id="sw"></button>
		<button id="s"></button>
		<button id="se"></button>
	</div>
`;

export class TicTacToeElement extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));

		/** @type {HTMLButtonElement[]} */
		this._buttons = [
			shadow.getElementById("nw"),
			shadow.getElementById("n"),
			shadow.getElementById("ne"),
			shadow.getElementById("w"),
			shadow.getElementById("c"),
			shadow.getElementById("e"),
			shadow.getElementById("sw"),
			shadow.getElementById("s"),
			shadow.getElementById("se"),
		];

		/** @type {number[][]} */
		this._history = [[0, 0, 0, 0, 0, 0, 0, 0, 0]];
		this._historyIndex = 0;

		/** @type {boolean} */
		this._firstPlayer = true;

		for (let i = 0; i < 9; ++i) {
			const button = this._buttons[i];
			button.addEventListener("click", () => this.markCell(i));
			button.addEventListener("contextmenu", e => {
				e.preventDefault();
				this.clearCell(i);
			});
		}
	}

	/**
	 * @param {number} indexOrX
	 * @param {number | undefined} y
	 */
	getCellAt(indexOrX, y) {
		const index = this._getIndex(indexOrX, y);
		const cells = this._getCells();
		return cells[index];
	}

	/**
	 * @param {number} indexOrX
	 * @param {number | undefined} y
	 */
	markCell(indexOrX, y) {
		const index = this._getIndex(indexOrX, y);
		const cells = this._getCells().slice();

		if (cells[index] !== 0)
			return;

		cells[index] = this.isPlayerOne ? 1 : 2;
		this._rewriteHistory(cells);
		this._renderAt(cells, index);
		this._switchPlayers();
	}

	/**
	 * @param {number} indexOrX
	 * @param {number | undefined} y
	 */
	clearCell(indexOrX, y) {
		const index = this._getIndex(indexOrX, y);
		const cells = this._getCells().slice();
		const value = cells[index];

		if (value === 0)
			return;

		cells[index] = 0;
		this._rewriteHistory(cells);
		this._renderAt(cells, index);
		this._isPlayerOne = value === 1;
	}

	clear() {
		this._history = [[0, 0, 0, 0, 0, 0, 0, 0, 0]];
		this._historyIndex = 0;
		this._isPlayerOne = true;
		this._render();
	}

	undo() {
		if (this._historyIndex <= 0)
			return;

		--this._historyIndex;
		this._switchPlayers();
		this._render();
	}

	redo() {
		if (this._historyIndex >= this._history.length - 1)
			return;

		++this._historyIndex;
		this._switchPlayers();
		this._render();
	}

	get isPlayerOne() {
		return this._firstPlayer;
	}

	set _isPlayerOne(value) {
		this._firstPlayer = value;
	}

	get isPlayerTwo() {
		return !this._firstPlayer;
	}

	set _isPlayerTwo(value) {
		this._firstPlayer = !value;
	}

	_switchPlayers() {
		this._firstPlayer = !this._firstPlayer;
	}

	/**
	 * @param {number} indexOrX
	 * @param {number | undefined} y
	 */
	_getIndex(indexOrX, y) {
		return y === undefined ? indexOrX : y * 3 + indexOrX;
	}

	_render() {
		const cells = this._getCells();

		for (let i = 0; i < cells.length; ++i) {
			this._renderAt(cells, i);
		}
	}

	_renderAt(cells, index) {
		const value = cells[index];
		this._buttons[index].innerHTML = value === 1 ? "❌" : value === 2 ? "⭕" : "";
	}

	_rewriteHistory(cells) {
		if (this._historyIndex < this._history.length - 1)
			this._history.splice(this._historyIndex + 1)

		this._history.push(cells);
		++this._historyIndex;
	}

	_getCells() {
		return this._history[this._historyIndex];
	}
}

customElements.define("tic-tac-toe", TicTacToeElement);
