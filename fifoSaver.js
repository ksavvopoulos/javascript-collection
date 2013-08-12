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
		var that;
		this.pending = true;
		that = this;
		return $.ajax({
			url: "http....",
			async: true,
			success: function() {
				if (that.toBeSaved.length) {
					return that.saveItem(that.toBeSaved.shift());
				} else {
					return that.pending = false;
				}
			}
		});
	}
};

$('element').click(function() {
	return fifoSaver.addItem($(this).grade);
});
