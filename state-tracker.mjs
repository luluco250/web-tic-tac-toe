export class StateTracker {
	constructor(params) {
		this._index = 0;

		if (params === undefined) {
			this._history = [];
			return;
		}

		if (params.initialState !== undefined)
			this._history = [params.initialState];

		this.onChange = params.onChange;
	}

	push(state) {
		if (this._history.length === 0) {
			this._history = [state];
			return;
		}

		this._history.push(state);
		++this._index;
		this.onChange?.();
	}

	fork() {
		if (this._index < this._history.length - 1)
			return this._history.splice(this._index + 1);
	}

	next() {
		if (this._index < this._history.length - 1) {
			++this._index;
			this.onChange?.();
		}
	}

	back() {
		if (this._index > 0) {
			--this._index;
			this.onChange?.();
		}
	}

	toStart() {
		this.index = 0;
	}

	toEnd() {
		this.index = this._history.length - 1;
	}

	clear(state) {
		if (this._history.length === 0)
			return;

		this._history = [state];

		if (this._index !== 0) {
			this._index = 0;
			this.onChange?.();
		}
	}

	rewrite(state) {
		this.back();
		this.fork();
		this.push(state);
	}

	getHistory() {
		return this._history.slice();
	}

	get length() {
		return this._history.length;
	}

	get index() {
		return this._index;
	}

	set index(value) {
		if (this._history.length === 0 || value === this._index)
			return;

		this._index = Math.max(0, Math.min(value, this._history.length - 1));
		this.onChange?.();
	}

	get current() {
		return this._history[this._index];
	}
}
