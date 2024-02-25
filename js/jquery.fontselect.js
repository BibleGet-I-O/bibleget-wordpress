/*
 * jQuery.fontselect inspired by:
 *
 * jQuery.fontselect - A font selector for the Google Web Fonts api
 * Tom Moor, http://tommoor.com
 * Copyright (c) 2011 Tom Moor
 * MIT Licensed
 * @version 0.1
 *
 * Modified by John Romano D'Orazio, https://www.johnromanodorazio.com
 * Modification Date June 12, 2017
 * Modification Date March 25, 2020
 * Modification Date February 22, 2024
 *
 */

class FontSelect {
	static __bind = (fn, me) => (...args) => fn.apply(me, args);
	static init = async (settings) => {
		if (typeof FontSelect_Control !== "undefined") {
			if (
				FontSelect_Control.hasOwnProperty("bibleget_settings") &&
				FontSelect_Control.bibleget_settings.hasOwnProperty(
					"googlefontsapi_key"
				) &&
				FontSelect_Control.bibleget_settings.googlefontsapi_key != ""
			) {
				settings.api =
					"https://fonts.googleapis.com/css2?key=" +
					FontSelect_Control.bibleget_settings.googlefontsapi_key +
					"&amp;family=";
				const response = await fetch( `https://www.googleapis.com/webfonts/v1/webfonts?key=${FontSelect_Control.bibleget_settings.googlefontsapi_key}` );
				if ( response.ok ) {
					return response.json();
				}
			}
		}
		return new Promise((resolve, reject) => {
			reject(false);
		});
	}
	constructor( original, f ) {
		this.$original = jQuery( original );
		this.f = f;
		this.options = f.settings;
		this.active = false;
		this.setupHtml();

		const font = this.$original.val();
		let fontType = null;
		//console.log('FontSelect initialize >> this.$original.val() = ' + font);
		if ( font ) {
			//console.log('yes we have an initial font value...');
			//check if this font is in the websafe_fonts or in the google_fonts and act accordingly
			let idx = -1;
			for ( let key = 0; key < f.websafe_fonts.length; key++ ) {
				//console.log('key = ' + key);
				//console.log('f.websafe_fonts[key] = ' + f.websafe_fonts[key]);
				if ( f.websafe_fonts[ key ].hasOwnProperty( "fontFamily" ) &&
					f.websafe_fonts[ key ].fontFamily == font ) {
					idx = key;
					fontType = "websafe";
					//console.log('CONSTRUCTOR >> we are starting off with a websafe font');
					break;
				}
			}
			if ( idx == -1 ) {
				//font was not found among the websafe_fonts so is probably a google font
				for ( let ky = 0; ky < f.google_fonts.length; ky++ ) {
					if ( f.google_fonts[ ky ] == font ) {
						idx = ky;
						fontType = "googlefont";
						//console.log('CONSTRUCTOR >> we are starting off with a google font');
						break;
					}
				}
			}
		} // END IF FONT
		this.$original.data( "fonttype", fontType );
		this.$original.attr( "data-fonttype", fontType );
		//console.log('>>>> setting this.$original.data("fonttype") to:' +fontType);
		this.updateSelected(); //this will download the full font set for google fonts, which is useful so that preview text will be shown in this font
		this.bindEvents();
	}
	bindEvents() {
		jQuery( "li", this.$results )
			.click( FontSelect.__bind( this.selectFont, this ) )
			.mouseenter( FontSelect.__bind( this.activateFont, this ) )
			.mouseleave( FontSelect.__bind( this.deactivateFont, this ) );

		jQuery( "span", this.$select ).click( FontSelect.__bind( this.toggleDrop, this ) );
		this.$arrow.click( FontSelect.__bind( this.toggleDrop, this ) );
	}
	toggleDrop() {
		if ( this.active ) {
			this.$element.removeClass( "font-select-active" );
			this.$drop.hide();
			clearInterval( this.visibleInterval );
		} else {
			this.$element.addClass( "font-select-active" );
			this.$drop.show();
			this.moveToSelected();
		}

		this.active = !this.active;
	}
	selectFont() {
		const font = jQuery( "li.active", this.$results ).data( "value" );
		const fontType = jQuery( "li.active", this.$results ).data( "fonttype" );
		this.$original.data( "fonttype", fontType );
		this.$original.attr( "data-fonttype", fontType );
		//console.log('selectFont >> this.$original.data("fonttype") = ' + this.$original.data('fonttype'));
		this.$original.val( font ).change();
		this.updateSelected();
		this.toggleDrop();
	}
	moveToSelected() {
		const font = this.$original.val();
		let $li;
		//console.log("value of font: " + font);
		if ( font ) {
			//console.log("now finding the corresponding li element...");
			$li = jQuery( "li[data-value='" + font + "']", this.$results );
			//console.log($li);
		} else {
			$li = jQuery( "li", this.$results ).first();
		}
		$li.addClass( "active" );
		const pos = $li.position();
		//console.log("this li's position is: " + pos);
		if ( pos && pos.top && pos.top > 100 ) this.$results.scrollTop( pos.top );
	}
	activateFont( ev ) {
		jQuery( "li.active", this.$results ).removeClass( "active" );
		jQuery( ev.currentTarget ).addClass( "active" );
	}
	deactivateFont( ev ) {
		jQuery( ev.currentTarget ).removeClass( "active" );
	}
	updateSelected() {
		const font = this.$original.val();
		const fontType = this.$original.data( "fonttype" );
		//console.log('updateSelected >> this.$original.data("fonttype") = ' + fontType);
		if ( fontType === "googlefont" ) {
			jQuery( "span", this.$element )
				.text( this.toReadable( font ) )
				.css( this.toStyle( font ) );
			const link = this.options.api + font;

			if ( jQuery( "link[href*='" + font + "']" ).length > 0 ) {
				jQuery( "link[href*='" + font + "']" ).attr( "href", link );
			} else {
				jQuery( "link:last" ).after(
					'<link href="' + link + '" rel="stylesheet" type="text/css">'
				);
			}
		} else if ( fontType === "websafe" ) {
			jQuery( "span", this.$element ).text( font ).css( {
				"font-family": font,
				"font-weight": "normal",
				"font-style": "normal",
			} );
		}
	}
	setupHtml() {
		//console.log('setupHtml >> where is the culprit');
		//console.log('this.options.style: '+this.options.style);
		//console.log('this.options.placeholder: '+this.options.placeholder);
		this.$original.empty().hide();
		this.$element = jQuery( "<div>", { class: this.options.style } );
		this.$arrow = jQuery( "<div><b></b></div>" );
		this.$select = jQuery(
			"<a><span>" + this.options.placeholder + "</span></a>"
		);
		this.$drop = jQuery( "<div>", { class: "fs-drop" } );
		this.$results = jQuery( "<ul>", { class: "fs-results" } );
		this.$original.after(
			this.$element
				.append( this.$select.append( this.$arrow ) )
				.append( this.$drop )
		);
		this.$fontsAsHtml = jQuery( this.fontsAsHtml() );
		this.$drop.append( this.$results.append( this.$fontsAsHtml ) ).hide();

		this.$prefetch = jQuery( "<div>", { class: "font-select-prefetch" } );
		this.$results_prefetch = this.$results.clone();
		this.$fontsAsHtml_prefetch = this.$fontsAsHtml.clone();
		this.$prefetch.append(
			this.$results_prefetch.append( this.$fontsAsHtml_prefetch )
		);
		jQuery( "body" ).append( this.$prefetch );
		//console.log('setupHtml END');
	}
	fontsAsHtml() {
		//console.log('fontsAsHtml >> where is the culprit');
		const l = this.f.google_fonts.length,
			ll  = this.f.websafe_fonts.length;
		//console.log('this.f.google_fonts.length = ' +l);
		//console.log('this.f.websafe_fonts.length = '+ll);
		let r, s, h = "";
		for ( let idx = 0; idx < ll; idx++ ) {
			if ( this.f.websafe_fonts[ idx ].hasOwnProperty( "fontFamily" ) ) {
				//console.log('of course I have property fontFamily, silly!');
				let flbk = "";
				if ( this.f.websafe_fonts[ idx ].hasOwnProperty( "fallback" ) ) {
					flbk = "&apos;" + this.f.websafe_fonts[ idx ].fallback + "&apos;,";
				}
				let $style = "font-family:&apos;" +
					this.f.websafe_fonts[ idx ].fontFamily +
					"&apos;," +
					flbk +
					"&apos;" +
					( this.f.websafe_fonts[ idx ].hasOwnProperty( "genericFamily" )
						? this.f.websafe_fonts[ idx ].genericFamily
						: "" ) +
					"&apos;;";
				h +=
					'<li data-fonttype="websafe" data-value="' +
					this.f.websafe_fonts[ idx ].fontFamily +
					'" style="' +
					$style +
					'">' +
					this.f.websafe_fonts[ idx ].fontFamily +
					"</li>";
			}
			//else{
				//console.log('why on earth do I not have a fontFamily property? '+idx);
			//}
		}
		h +=
			'<div style="border-top:3px groove White;border-bottom:3px groove White;box-shadow:0px -2px 6px Black,0px 2px 3px Black;margin:9px auto 3px auto;padding:3px 0px;text-align:center;background-color:Gray;color:White;width:96%;">Google Web Fonts</div>';
		for ( let i = 0; i < l; i++ ) {
			r = this.toReadable( this.f.google_fonts[ i ] );
			s = this.toStyle( this.f.google_fonts[ i ] );
			//console.log('r >> ' + r);
			//console.log('s >> ' + s);
			h +=
				'<li data-fonttype="googlefont" data-value="' +
				this.f.google_fonts[ i ] +
				'" style="font-family: ' +
				s[ "font-family" ] +
				"; font-weight: " +
				s[ "font-weight" ] +
				";" +
				( s.hasOwnProperty( "font-style" )
					? " font-style: " + s[ "font-style" ] + ";"
					: "" ) +
				'">' +
				r +
				"</li>";
		}
		//console.log(h);
		//console.log('fontsAsHtml END');
		return h;
	}
	toReadable( font ) {
		const t = font.split( ":" );
		const rdbl = t[ 0 ].replace( /[+]/g, " " );
		if ( t[ 1 ] !== undefined &&
			t[ 1 ].length > 0 &&
			/^([0-9]*)([a-z]*)$/.test( t[ 1 ] ) ) {
			let q = t[ 1 ].match( /^([0-9]*)([a-z]*)$/ );
			q.splice( 0, 1 );
			return rdbl + " " + q.join( " " );
		}
		return rdbl;
	}
	toStyle( font ) {
		const t = font.split( ":" );
		if ( t[ 1 ] !== undefined && /[a-z]/.test( t[ 1 ] ) ) {
			//console.log("value of t[1]:");
			//console.log(t[1]);
			if ( /[0-9]/.test( t[ 1 ] ) ) {
				var q = t[ 1 ].match( /^([0-9]+)([a-z]+)$/ );
				//console.log("value of q:");
				//console.log(q);
				return {
					"font-family": this.toReadable( t[ 0 ] ),
					"font-weight": q[ 1 ] || 400,
					"font-style": q[ 2 ] || "normal",
				};
			} else {
				if ( t[ 1 ] == "bold" ) {
					return {
						"font-family": this.toReadable( t[ 0 ] ),
						"font-weight": "bold",
					};
				} else if ( t[ 1 ] == "italic" ) {
					return {
						"font-family": this.toReadable( t[ 0 ] ),
						"font-style": "italic",
					};
				} else return false;
			}
		} else {
			return {
				"font-family": this.toReadable( t[ 0 ] ),
				"font-weight": t[ 1 ] || 400,
				"font-style": "normal",
			};
		}
	}
}


(async ($) => {

	$.fontselect = {
		settings: {
			style: "font-select",
			placeholder: "Select a font",
			lookahead: 2,
			api: "https://fonts.googleapis.com/css?family=",
		}
	};

	//console.log('length of google fonts before api call: ' + $.fontselect.google_fonts.length);
	$.fontselect.google_fonts = await FontSelect.init($.fontselect.settings).then( data => data.items.map( item => item.family.replace(/ /g, "+") ), reject => reject ).catch(ex => {
		//console.log('Google Font API key not detected, using fallback list...');
		//console.warn(ex);
	}) || await fetch('../wp-content/plugins/bibleget-io/js/googlefonts-fallback.json').then(result => result.json());
	//console.log('length of google fonts after api call: ' + $.fontselect.google_fonts.length);

	Object.defineProperty($.fontselect, "version", {
		value: "1.0",
		writable: false,
	});

	Object.defineProperty($.fontselect, "websafe_fonts", {
		value: [
			{
				fontFamily: "Arial",
				fallback: "Helvetica",
				genericFamily: "sans-serif",
			},
			{
				fontFamily: "Arial Black",
				fallback: "Gadget",
				genericFamily: "sans-serif",
			},
			{
				fontFamily: "Book Antiqua",
				fallback: "Palatino",
				genericFamily: "serif",
			},
			{
				fontFamily: "Courier New",
				fallback: "Courier",
				genericFamily: "monospace",
			},
			{ fontFamily: "Georgia", genericFamily: "serif" },
			{
				fontFamily: "Impact",
				fallback: "Charcoal",
				genericFamily: "sans-serif",
			},
			{
				fontFamily: "Lucida Console",
				fallback: "Monaco",
				genericFamily: "monospace",
			},
			{
				fontFamily: "Lucida Sans Unicode",
				fallback: "Lucida Grande",
				genericFamily: "sans-serif",
			},
			{
				fontFamily: "Palatino Linotype",
				fallback: "Palatino",
				genericFamily: "serif",
			},
			{ fontFamily: "Tahoma", fallback: "Geneva", genericFamily: "sans-serif" },
			{
				fontFamily: "Times New Roman",
				fallback: "Times",
				genericFamily: "serif",
			},
			{
				fontFamily: "Trebuchet MS",
				fallback: "Helvetica",
				genericFamily: "sans-serif",
			},
			{
				fontFamily: "Verdana",
				fallback: "Geneva",
				genericFamily: "sans-serif",
			},
		],
		writable: false,
	});

	$.fn.fontselect = function(options) {
		return this.each(function() {
			if (options) {
				$.extend($.fontselect.settings, options);
			}
			return new FontSelect(this, $.fontselect);
		});
	};
})(jQuery);
