// ui_timeout
var ui_timeout = window.wrappedJSObject ? createObjectIn(worker.GUIp, {defineAs: "timeout"}) : worker.GUIp.timeout = {};

ui_timeout.bar = null;
ui_timeout.timeout = 0;
ui_timeout._finishtDate = 0;
ui_timeout._tickInt = 0;
ui_timeout._tick = function() {
	if (Date.now() > this._finishDate) {
		worker.clearInterval(this._tickInt);
		if (this.bar.style.transitionDuration) {
			this.bar.style.transitionDuration = '';
		}
		this.bar.classList.remove('running');
		ui_utils.setVoiceSubmitState(!ui_improver.freezeVoiceButton.match('when_empty') || document.querySelector('#god_phrase').value, false);
	}
};
// creates timeout bar element
ui_timeout.create = function() {
	this.bar = document.createElement('div');
	this.bar.id = 'timeout_bar';
	document.body.insertBefore(this.bar, document.body.firstChild);
};
// starts timeout bar
ui_timeout.start = function() {
	worker.clearInterval(this._tickInt);
	this.bar.style.transitionDuration = '';
	this.bar.classList.remove('running');
	worker.setTimeout(ui_timeout._delayedStart, 10);
	this._finishtDate = Date.now() + this.timeout*1000;
	this._tickInt = worker.setInterval(ui_timeout._tick.bind(this), 100);
	ui_utils.setVoiceSubmitState(ui_improver.freezeVoiceButton.match('after_voice'), true);
};
ui_timeout._delayedStart = function() {
	var customTimeout = ui_storage.get('Option:voiceTimeout');
	if (parseInt(customTimeout) > 0) {
		ui_timeout.timeout = customTimeout;
		ui_timeout.bar.style.transitionDuration = customTimeout + 's';
	} else {
		ui_timeout.timeout = 20;
	}
	ui_timeout.bar.classList.add('running');
};
