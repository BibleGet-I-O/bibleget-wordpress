// Array Remove - By John Resig (MIT Licensed)
/*Array.prototype.remove = function(from, to) {
	const rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
*/
wp.customize.controlConstructor['stylebar'] = wp.customize.Control.extend({

	ready : function() {
		'use strict';

		const control = this, 
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
			//var fval = [];
			//console.log(typeof control.settings);
			/*
			if (control.hasOwnProperty(settings) && typeof control.settings === 'object' && control.settings.length > 0 ) {
				//fval = control.setting.get().split(",");
			}
			*/
			if (this.checked) {
				jQuery(this).parent().removeClass('button-secondary').addClass(
						'button-primary');
				if(jQuery(this).hasClass('superscript')){
					let $subscript = jQuery('input:checkbox.subscript', control.container);
					if ($subscript.prop('checked') && $subscript.prop('checked') === true) {
						$subscript.prop('checked', false);
						$subscript.parent().removeClass('button-primary').addClass('button-secondary');
					}
					control.settings.valign_setting.set(1);
				}
				else if(jQuery(this).hasClass('subscript')){
					const $superscript = jQuery('input:checkbox.superscript', control.container);
					if ($superscript.prop('checked') && $superscript.prop('checked') === true) {
						$superscript.prop('checked', false);
						$superscript.parent().removeClass('button-primary').addClass('button-secondary');
					}
					control.settings.valign_setting.set(2);
				}

			} else {
				jQuery(this).parent().removeClass('button-primary').addClass('button-secondary');
				//console.log('a checkbox was unchecked, which has a value of :'+this.value);
				if(jQuery(this).hasClass('superscript')){
					const $subscript = jQuery('input:checkbox.subscript', control.container);
					if ($subscript.prop('checked') === false) {
						control.settings.valign_setting.set(3);
					}
				}
				else if(jQuery(this).hasClass('subscript')){
					const $superscript = jQuery('input:checkbox.superscript', control.container);
					if ($superscript.prop('checked') === false) {
						control.settings.valign_setting.set(3);
					}
				}
			}
		});

	}

});
