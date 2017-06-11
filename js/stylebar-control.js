// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

wp.customize.controlConstructor['stylebar'] = wp.customize.Control.extend({

	ready : function() {
		'use strict';

		var control = this, 
			checkboxes = jQuery('input:checkbox', control.container);

		// console.log("stylebar control constructor extension script is
		// ready");
		// console.log(control.container);
		// console.log('and I found '+checkboxes.length+' checkboxes and my own
		// current value is: '+jQuery(this.container).val());
		// console.log(control.setting.get());

		checkboxes.on('change', function() {
			// console.log(this.value);
			// console.log(this.checked);
			// console.log(jQuery(this).parent());
			var fval = [];
			if (control.setting.get() != "") {
				fval = control.setting.get().split(",");
			}
			if (this.checked) {
				jQuery(this).parent().removeClass('button-secondary').addClass(
						'button-primary');
				fval.push(this.value);
				if (this.value == 'underline') {
					var $strikethrough = jQuery(
							'input:checkbox[value="strikethrough"]',
							control.container);
					if ($strikethrough.prop('checked')
							&& $strikethrough.prop('checked') === true) {
						$strikethrough.prop('checked', false);
						$strikethrough.parent().removeClass('button-primary')
								.addClass('button-secondary');
						var index = fval.indexOf('strikethrough');
						if (index != -1) {
							fval.remove(index);
						}
					}
				} else if (this.value == 'strikethrough') {
					var $underline = jQuery(
							'input:checkbox[value="underline"]',
							control.container);
					if ($underline.prop('checked')
							&& $underline.prop('checked') === true) {
						$underline.prop('checked', false);
						$underline.parent().removeClass('button-primary')
								.addClass('button-secondary');
						var index = fval.indexOf('underline');
						if (index != -1) {
							fval.remove(index);
						}
					}
				} else if (this.value == 'superscript') {
					var $subscript = jQuery(
							'input:checkbox[value="subscript"]',
							control.container);
					if ($subscript.prop('checked')
							&& $subscript.prop('checked') === true) {
						$subscript.prop('checked', false);
						$subscript.parent().removeClass('button-primary')
								.addClass('button-secondary');
						var index = fval.indexOf('subscript');
						if (index != -1) {
							fval.remove(index);
						}
					}
				} else if (this.value == 'subscript') {
					var $superscript = jQuery(
							'input:checkbox[value="superscript"]',
							control.container);
					if ($superscript.prop('checked')
							&& $superscript.prop('checked') === true) {
						$superscript.prop('checked', false);
						$superscript.parent().removeClass('button-primary')
								.addClass('button-secondary');
						var index = fval.indexOf('superscript');
						if (index != -1) {
							fval.remove(index);
						}
					}
				}
			} else {
				jQuery(this).parent().removeClass('button-primary').addClass(
						'button-secondary');
				var index = fval.indexOf(this.value);
				if (index != -1) {
					fval.remove(index);
				}
			}
			control.setting.set(fval.join(","));
			// console.log(control.setting.get());
		});

	}

});
