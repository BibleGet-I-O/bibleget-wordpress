jQuery(function($){
	$('#bibleget-googlefonts').fontselect({ lookahead: 200 }).change(function(){
		//console.log('fontselect-control.js BEGIN');
		//console.log($(this).val());
		//var font = $(this).val().replace(/\+/g, ' ');
		//font = font.split(':');
		//console.log(font);
		//console.log('fontselect-control.js END');
		//$('#bibleget-googlefonts').val( font[0] );
		//$('div.results').css('font-family', font[0] );
		//$(this).prev('select').val( $(this).val() );
		// replace + signs with spaces for css
		

		// split font into family and weight
		//font = font.split(':');

		// set family on paragraphs
		//$('p').css('font-family', font[0]);
		
	});

});
