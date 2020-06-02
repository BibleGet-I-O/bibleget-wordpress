/**
 * This file adds some LIVE to the Theme Customizer live preview. To leverage
 * this, set your custom settings to 'postMessage' and then add your handling
 * here. Your javascript should grab settings from customizer controls, and 
 * then make any necessary changes to the page using jQuery.
 */
( function( $ ) {

	//console.log("ready and a set and a gooooooo!");


	wp.customize( 'bibleget_fontfamily', function( value ) {
		value.bind( function( newval ) {
			var fontType = parent.jQuery('#bibleget-googlefonts').attr('data-fonttype');
			//alert(newval);
			//console.log('wp.customize bibleget_fontfamily BEGIN');
			//console.log(newval);
			var font = newval.replace(/\+/g, ' ');
			font = font.split(':');
			//console.log(font);
			//console.log('wp.customize bibleget_fontfamily END');
			if(fontType == 'googlefont'){
                var link = 'https://fonts.googleapis.com/css?family=' + newval;
    			if ($("link[href*='" + font + "']").length > 0){
    				$("link[href*='" + font + "']").attr('href',link)
    			}
    			else{
    				$('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
    			}
            }
			$('div.results').css('font-family', font[0] );
		} );
	} );

	wp.customize( 'bibleget_borderwidth', function( value ) {
		value.bind( function( newval ) {
			$('div.results').css('border-width', newval.toString()+'px' );
		} );
	} );

	wp.customize( 'bibleget_borderstyle', function( value ) {
		value.bind( function( newval ) {
			$('div.results').css('border-style', newval );
		} );
	} );

	wp.customize( 'bibleget_bordercolor', function( value ) {
		value.bind( function( newval ) {
			$('div.results').css('border-color', newval );
		} );
	} );

	wp.customize( 'bibleget_bgcolor', function( value ) {
		value.bind( function( newval ) {
			$('div.results').css('background-color', newval );
		} );
	} );

	wp.customize( 'bibleget_borderradius', function( value ) {
		value.bind( function( newval ) {
			$('div.results').css('border-radius', newval.toString()+'px' );
		} );
	} );

	wp.customize( 'bibleget_width', function( value ) {
		value.bind( function( newval ) {
			$('div.results').css('width', newval.toString()+'%' );
		} );
	} );

	wp.customize( 'bibleget_textalign', function( value ) {
		value.bind( function( newval ) {
			$('div.results .versesParagraph').css('text-align', newval );
		} );
	} );

	wp.customize( 'bibleget_marginleftright', function( value ) {
		value.bind( function( newval ) {
			if(newval == 'auto'){
				$('div.results').css('margin-left', newval );      
				$('div.results').css('margin-right', newval );      
			}
			else{
				$('div.results').css('margin-left', newval.toString()+'px' );            
				$('div.results').css('margin-right', newval.toString()+'px' );            
			}
		} );
	} );

	wp.customize( 'bibleget_margintopbottom', function( value ) {
		value.bind( function( newval ) {
			if(newval == 'auto'){
				$('div.results').css('margin-top', newval );      
				$('div.results').css('margin-bottom', newval );      
			}
			else{
				$('div.results').css('margin-top', newval.toString()+'px' );            
				$('div.results').css('margin-bottom', newval.toString()+'px' );            
			}
		} );
	} );

	wp.customize( 'bibleget_paddingleftright', function( value ) {
		value.bind( function( newval ) {
			if(newval == 'auto'){
				$('div.results').css('padding-left', newval );      
				$('div.results').css('padding-right', newval );      
			}
			else{
				$('div.results').css('padding-left', newval.toString()+'px' );            
				$('div.results').css('padding-right', newval.toString()+'px' );            
			}
		} );
	} );

	wp.customize( 'bibleget_paddingtopbottom', function( value ) {
		value.bind( function( newval ) {
			if(newval == 'auto'){
				$('div.results').css('padding-top', newval );      
				$('div.results').css('padding-bottom', newval );      
			}
			else{
				$('div.results').css('padding-top', newval.toString()+'px' );            
				$('div.results').css('padding-bottom', newval.toString()+'px' );            
			}
		} );
	} );

	wp.customize( 'version_fontcolor', function( value ) {
		value.bind( function( newval ) {
			$('div.results .bibleVersion').css('color', newval );
		} );
	} );

	wp.customize( 'bookchapter_fontcolor', function( value ) {
		value.bind( function( newval ) {
			$('div.results .bookChapter').css('color', newval );
		} );
	} );

	wp.customize( 'versenumber_fontcolor', function( value ) {
		value.bind( function( newval ) {
			$('div.results .versesParagraph .verseNum').css('color', newval );
		} );
	} );

	wp.customize( 'versetext_fontcolor', function( value ) {
		value.bind( function( newval ) {
			$('div.results .versesParagraph').css('color', newval );
		} );
	} );

	wp.customize( 'version_fontsize', function( value ) {
		value.bind( function( newval ) {
			$('div.results .bibleVersion').css('font-size', newval.toString()+'pt' ); //(newval / 10).toString()+'em'
		} );
	} );

	wp.customize( 'bookchapter_fontsize', function( value ) {
		value.bind( function( newval ) {
			$('div.results .bookChapter').css('font-size', newval.toString()+'pt' ); //(newval / 10).toString()+'em'
		} );
	} );

	wp.customize( 'versenumber_fontsize', function( value ) {
		value.bind( function( newval ) {
			$('div.results .versesParagraph .verseNum').css('font-size', newval.toString()+'pt' ); //(newval / 10).toString()+'em'
		} );
	} );

	wp.customize( 'versetext_fontsize', function( value ) {
		value.bind( function( newval ) {
			$('div.results .versesParagraph').css('font-size', newval.toString()+'pt' ); //(newval / 10).toString()+'em'
		} );
	} );

	wp.customize( 'version_fontstyle', function( value ) {
		value.bind( function( newval ) {
			dosetstyles($('div.results .bibleVersion'),newval.split(','));
		} );
	} );

	wp.customize( 'bookchapter_fontstyle', function( value ) {
		value.bind( function( newval ) {
			dosetstyles($('div.results .bookChapter'),newval.split(','));
		} );
	} );

	wp.customize( 'versenumber_fontstyle', function( value ) {
		value.bind( function( newval ) {
			dosetstyles($('div.results .versesParagraph .verseNum'),newval.split(','));
		} );
	} );

	wp.customize( 'versetext_fontstyle', function( value ) {
		value.bind( function( newval ) {
			dosetstyles($('div.results .versesParagraph'),newval.split(','));
		} );
	} );

	wp.customize( 'linespacing_verses', function( value ) {
		value.bind( function( newval ) {
			$('div.results .versesParagraph').css('line-height', newval.toString()+'%' );
		} );
	} );


} )( jQuery );

function dosetstyles($element,setstyles){

	if(setstyles.indexOf('bold') != -1){
		$element.css('font-weight','bold');
	}
	else {
		$element.css('font-weight','normal');
	}

	if(setstyles.indexOf('italic') != -1){
		$element.css('font-style','italic');      
	}
	else{
		$element.css('font-style','normal');
	}

	if(setstyles.indexOf('underline') != -1){
		$element.css('text-decoration','underline');      
	}
	else if(setstyles.indexOf('strikethrough') != -1){
		$element.css('text-decoration','line-through');      
	}
	else{
		$element.css('text-decoration','none');
	}

	if(setstyles.indexOf('superscript') != -1){
		$element.css('vertical-align','baseline'); 
		$element.css('position','relative'); 
		$element.css('top','-0.6em'); 
	}
	else if(setstyles.indexOf('subscript') != -1){
		$element.css('vertical-align','baseline'); 
		$element.css('position','relative'); 
		$element.css('top','0.6em'); 
	}
	else{
		$element.css('position','static'); 
	}
}

