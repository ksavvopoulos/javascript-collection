var fifoSaver;

fifoSaver = {
	pending: false,
	toBeSaved: [],
	addItem: function(x) {
		this.toBeSaved.push(x);
		if (this.pending === false) {
			return this.saveItem(this.toBeSaved.shift());
		}
	},
	saveItem: function(x) {
		this.pending = true;
		return $.ajax({
			url: "http....",
			async: true,
			success: function() {
				if (saver.toBeSaved.length) {
					return saver.saveItem(saver.toBeSaved.shift());
				} else {
					return saver.pending = false;
				}
			}
		});
	}
};

$('element').click(function() {
	return fifoSaver.addItem($(this).grade);
});
