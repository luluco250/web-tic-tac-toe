import { StateTracker } from "./state-tracker.mjs";

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

		this._stateTracker = new StateTracker({
			onChange: () => this._render(),
			initialState: {
				cells: [0, 0, 0, 0, 0, 0, 0, 0, 0],
				isPlayerOne: true,
			},
		});

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
		let cells = this._getCells();

		if (cells[index] !== 0)
			return;

		cells = cells.slice();
		cells[index] = this.isPlayerOne ? 1 : 2;
		this._stateTracker.push({
			cells,
			isPlayerOne: !this.isPlayerOne,
		});
	}

	/**
	 * @param {number} indexOrX
	 * @param {number | undefined} y
	 */
	clearCell(indexOrX, y) {
		const index = this._getIndex(indexOrX, y);
		let cells = this._getCells();
		const value = cells[index];

		if (value === 0)
			return;

		cells = cells.slice();
		cells[index] = 0;
		this._stateTracker.push({
			cells,
			isPlayerOne: value === 1,
		})
	}

	clear() {
		this._stateTracker.clear({
			cells: [0, 0, 0, 0, 0, 0, 0, 0, 0],
			isPlayerOne: true,
		});
	}

	undo() {
		this._stateTracker.back();
	}

	redo() {
		this._stateTracker.next();
	}

	_render() {
		const cells = this._getCells();

		for (let i = 0; i < cells.length; ++i)
			this._renderAt(cells, i);
	}

	_renderAt(cells, index) {
		const value = cells[index];
		this._buttons[index].innerHTML = (
			value === 1 ? "❌" :
			value === 2 ? "⭕" :
			""
		);
	}

	/**
	 * @param {number} indexOrX
	 * @param {number | undefined} y
	 */
	_getIndex(indexOrX, y) {
		return y === undefined ? indexOrX : y * 3 + indexOrX;
	}

	_getState() {
		return this._stateTracker.current;
	}

	_getCells() {
		return this._getState().cells;
	}

	get isPlayerOne() {
		return this._stateTracker.current.isPlayerOne;
	}

	get isPlayerTwo() {
		return !this.isPlayerOne();
	}
}

customElements.define("tic-tac-toe", TicTacToeElement);
