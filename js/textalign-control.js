wp.customize.controlConstructor['textalign'] = wp.customize.Control.extend({

	ready : function() {
		'use strict';

		var control = this,
			checkboxes = jQuery('input:radio', control.container);

		checkboxes.on('change', function() {
			//console.log('change event was detected');
			if(this.checked){
				//console.log('value of checked radio = '+this.value);
				control.setting.set(this.value);
				jQuery(this).parent().removeClass('button-secondary').addClass('button-primary');
				jQuery(this).parent().siblings('.button-primary').removeClass('button-primary').addClass('button-secondary');
			}
		});
	}

});
