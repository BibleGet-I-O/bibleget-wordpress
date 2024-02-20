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
 *
 *
 */

class Fontselect {
	static __bind = (fn, me) => () => fn.apply(me, arguments);
	constructor( original, o, f ) {
		this.$original = $( original );
		this.options = o;
		this.fonts = f;
		this.active = false;
		this.setupHtml();

		var font = this.$original.val();
		var fontType = null;
		//console.log('Fontselect initialize >> this.$original.val() = ' + font);
		if ( font ) {
			//console.log('yes we have an initial font value...');
			//check if this font is in the websafe_fonts or in the google_fonts and act accordingly
			var idx = -1;
			for ( var key = 0; key < $.fontselect.websafe_fonts.length; key++ ) {
				//console.log('key = ' + key);
				//console.log('$.fontselect.websafe_fonts[key] = ' + $.fontselect.websafe_fonts[key]);
				if ( $.fontselect.websafe_fonts[ key ].hasOwnProperty( "fontFamily" ) &&
					$.fontselect.websafe_fonts[ key ].fontFamily == font ) {
					idx = key;
					fontType = "websafe";
					//console.log('CONSTRUCTOR >> we are starting off with a websafe font');
					break;
				}
			}
			if ( idx == -1 ) {
				//font was not found among the websafe_fonts so is probably a google font
				for ( var ky = 0; ky < $.fontselect.google_fonts.length; ky++ ) {
					if ( $.fontselect.google_fonts[ ky ] == font ) {
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
		$( "li", this.$results )
			.click( __bind( this.selectFont, this ) )
			.mouseenter( __bind( this.activateFont, this ) )
			.mouseleave( __bind( this.deactivateFont, this ) );

		$( "span", this.$select ).click( __bind( this.toggleDrop, this ) );
		this.$arrow.click( __bind( this.toggleDrop, this ) );
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
		var font = $( "li.active", this.$results ).data( "value" );
		var fontType = $( "li.active", this.$results ).data( "fonttype" );
		this.$original.data( "fonttype", fontType );
		this.$original.attr( "data-fonttype", fontType );
		//console.log('selectFont >> this.$original.data("fonttype") = ' + this.$original.data('fonttype'));
		this.$original.val( font ).change();
		this.updateSelected();
		this.toggleDrop();
	}
	moveToSelected() {
		var $li, font = this.$original.val();
		//console.log("value of font: " + font);
		if ( font ) {
			//console.log("now finding the corresponding li element...");
			$li = $( "li[data-value='" + font + "']", this.$results );
			//console.log($li);
		} else {
			$li = $( "li", this.$results ).first();
		}
		$li.addClass( "active" );
		var pos = $li.position().top;
		//console.log("this li's position is: " + pos);
		if ( pos > 100 ) this.$results.scrollTop( $li.position().top );
	}
	activateFont( ev ) {
		$( "li.active", this.$results ).removeClass( "active" );
		$( ev.currentTarget ).addClass( "active" );
	}
	deactivateFont( ev ) {
		$( ev.currentTarget ).removeClass( "active" );
	}
	updateSelected() {
		var font = this.$original.val();
		var fontType = this.$original.data( "fonttype" );
		//console.log('updateSelected >> this.$original.data("fonttype") = ' + fontType);
		if ( fontType == "googlefont" ) {
			$( "span", this.$element )
				.text( this.toReadable( font ) )
				.css( this.toStyle( font ) );
			var link = this.options.api + font;

			if ( $( "link[href*='" + font + "']" ).length > 0 ) {
				$( "link[href*='" + font + "']" ).attr( "href", link );
			} else {
				$( "link:last" ).after(
					'<link href="' + link + '" rel="stylesheet" type="text/css">'
				);
			}
		} else if ( fontType == "websafe" ) {
			$( "span", this.$element ).text( font ).css( {
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
		this.$element = $( "<div>", { class: this.options.style } );
		this.$arrow = $( "<div><b></b></div>" );
		this.$select = $(
			"<a><span>" + this.options.placeholder + "</span></a>"
		);
		this.$drop = $( "<div>", { class: "fs-drop" } );
		this.$results = $( "<ul>", { class: "fs-results" } );
		this.$original.after(
			this.$element
				.append( this.$select.append( this.$arrow ) )
				.append( this.$drop )
		);
		this.$fontsAsHtml = $( this.fontsAsHtml() );
		this.$drop.append( this.$results.append( this.$fontsAsHtml ) ).hide();

		this.$prefetch = $( "<div>", { class: "font-select-prefetch" } );
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
		var l = this.fonts.length, ll = $.fontselect.websafe_fonts.length;
		//console.log('this.fonts.length = ' +l);
		//console.log('$.fontselect.websafe_fonts.length = '+ll);
		var r, s, h = "";
		for ( var idx = 0; idx < ll; idx++ ) {
			if ( $.fontselect.websafe_fonts[ idx ].hasOwnProperty( "fontFamily" ) ) {
				//console.log('of course I have property fontFamily, silly!');
				var flbk = "";
				if ( $.fontselect.websafe_fonts[ idx ].hasOwnProperty( "fallback" ) ) {
					flbk =
						"&apos;" + $.fontselect.websafe_fonts[ idx ].fallback + "&apos;,";
				}
				var $style = "font-family:&apos;" +
					$.fontselect.websafe_fonts[ idx ].fontFamily +
					"&apos;," +
					flbk +
					"&apos;" +
					( $.fontselect.websafe_fonts[ idx ].hasOwnProperty( "genericFamily" )
						? $.fontselect.websafe_fonts[ idx ].genericFamily
						: "" ) +
					"&apos;;";
				h +=
					'<li data-fonttype="websafe" data-value="' +
					$.fontselect.websafe_fonts[ idx ].fontFamily +
					'" style="' +
					$style +
					'">' +
					$.fontselect.websafe_fonts[ idx ].fontFamily +
					"</li>";
			}
			//else{
			//    console.log('why on earth do I not have a fontFamily property? '+idx);
			//}
		}
		h +=
			'<div style="border-top:3px groove White;border-bottom:3px groove White;box-shadow:0px -2px 6px Black,0px 2px 3px Black;margin:9px auto 3px auto;padding:3px 0px;text-align:center;background-color:Gray;color:White;width:96%;">Google Web Fonts</div>';
		for ( var i = 0; i < l; i++ ) {
			r = this.toReadable( this.fonts[ i ] );
			s = this.toStyle( this.fonts[ i ] );
			//console.log('r >> ' + r);
			//console.log('s >> ' + s);
			h +=
				'<li data-fonttype="googlefont" data-value="' +
				this.fonts[ i ] +
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
		var t = font.split( ":" );
		var rdbl = t[ 0 ].replace( /[+]/g, " " );
		if ( t[ 1 ] !== undefined &&
			t[ 1 ].length > 0 &&
			/^([0-9]*)([a-z]*)$/.test( t[ 1 ] ) ) {
			var q = t[ 1 ].match( /^([0-9]*)([a-z]*)$/ );
			q.splice( 0, 1 );
			return rdbl + " " + q.join( " " );
		}
		return rdbl;
	}
	toStyle( font ) {
		var t = font.split( ":" );
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


(function ($) {
	$.fontselect = {
		google_fonts: [
			"Aclonica",
			"Allan",
			"Annie+Use+Your+Telescope",
			"Anonymous+Pro",
			"Allerta+Stencil",
			"Allerta",
			"Amaranth",
			"Anton",
			"Architects+Daughter",
			"Arimo",
			"Artifika",
			"Arvo",
			"Asset",
			"Astloch",
			"Bangers",
			"Bentham",
			"Bevan",
			"Bigshot+One",
			"Bowlby+One",
			"Bowlby+One+SC",
			"Brawler",
			"Buda",
			"Cabin",
			"Calligraffitti",
			"Candal",
			"Cantarell",
			"Cardo",
			"Carter One",
			"Caudex",
			"Cedarville+Cursive",
			"Cherry+Cream+Soda",
			"Chewy",
			"Coda",
			"Coming+Soon",
			"Copse",
			"Corben",
			"Cousine",
			"Covered+By+Your+Grace",
			"Crafty+Girls",
			"Crimson+Text",
			"Crushed",
			"Cuprum",
			"Damion",
			"Dancing+Script",
			"Dawning+of+a+New+Day",
			"Didact+Gothic",
			"Droid+Sans",
			"Droid+Sans+Mono",
			"Droid+Serif",
			"EB+Garamond",
			"Expletus+Sans",
			"Fontdiner+Swanky",
			"Forum",
			"Francois+One",
			"Geo",
			"Give+You+Glory",
			"Goblin+One",
			"Goudy+Bookletter+1911",
			"Gravitas+One",
			"Gruppo",
			"Hammersmith+One",
			"Holtwood+One+SC",
			"Homemade+Apple",
			"Inconsolata",
			"Indie+Flower",
			"IM+Fell+DW+Pica",
			"IM+Fell+DW+Pica+SC",
			"IM+Fell+Double+Pica",
			"IM+Fell+Double+Pica+SC",
			"IM+Fell+English",
			"IM+Fell+English+SC",
			"IM+Fell+French+Canon",
			"IM+Fell+French+Canon+SC",
			"IM+Fell+Great+Primer",
			"IM+Fell+Great+Primer+SC",
			"Irish+Grover",
			"Irish+Growler",
			"Istok+Web",
			"Josefin+Sans",
			"Josefin+Slab",
			"Judson",
			"Jura",
			"Just+Another+Hand",
			"Just+Me+Again+Down+Here",
			"Kameron",
			"Kenia",
			"Kranky",
			"Kreon",
			"Kristi",
			"La+Belle+Aurore",
			"Lato",
			"League+Script",
			"Lekton",
			"Limelight",
			"Lobster",
			"Lobster Two",
			"Lora",
			"Love+Ya+Like+A+Sister",
			"Loved+by+the+King",
			"Luckiest+Guy",
			"Maiden+Orange",
			"Mako",
			"Maven+Pro",
			"Meddon",
			"MedievalSharp",
			"Megrim",
			"Merriweather",
			"Metrophobic",
			"Michroma",
			"Miltonian Tattoo",
			"Miltonian",
			"Modern Antiqua",
			"Monofett",
			"Molengo",
			"Mountains of Christmas",
			"Muli",
			"Neucha",
			"Neuton",
			"News+Cycle",
			"Nixie+One",
			"Nobile",
			"Nova+Cut",
			"Nova+Flat",
			"Nova+Mono",
			"Nova+Oval",
			"Nova+Round",
			"Nova+Script",
			"Nova+Slim",
			"Nova+Square",
			"Nunito",
			"OFL+Sorts+Mill+Goudy+TT",
			"Old+Standard+TT",
			"Open+Sans",
			"Open+Sans+Condensed",
			"Orbitron",
			"Oswald",
			"Over+the+Rainbow",
			"Reenie+Beanie",
			"Pacifico",
			"Patrick+Hand",
			"Paytone+One",
			"Permanent+Marker",
			"Philosopher",
			"Play",
			"Playfair+Display",
			"Podkova",
			"PT+Sans",
			"PT+Sans+Narrow",
			"PT+Serif",
			"PT+Serif Caption",
			"Puritan",
			"Quattrocento",
			"Quattrocento+Sans",
			"Radley",
			"Raleway",
			"Redressed",
			"Rock+Salt",
			"Rokkitt",
			"Roboto",
			"Ruslan+Display",
			"Schoolbell",
			"Shadows+Into+Light",
			"Shanti",
			"Sigmar+One",
			"Six+Caps",
			"Slackey",
			"Smythe",
			"Sniglet",
			"Special+Elite",
			"Stardos+Stencil",
			"Sue+Ellen+Francisco",
			"Sunshiney",
			"Swanky+and+Moo+Moo",
			"Syncopate",
			"Tangerine",
			"Tenor+Sans",
			"Terminal+Dosis+Light",
			"The+Girl+Next+Door",
			"Tinos",
			"Ubuntu",
			"Ultra",
			"Unkempt",
			"UnifrakturCook",
			"UnifrakturMaguntia",
			"Varela",
			"Varela Round",
			"Vibur",
			"Vollkorn",
			"VT323",
			"Waiting+for+the+Sunrise",
			"Wallpoet",
			"Walter+Turncoat",
			"Wire+One",
			"Yanone+Kaffeesatz",
			"Yeseva+One",
			"Zeyada",
		],
	};

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

	$.fn.fontselect = (options) => {

		const settings = {
			style: "font-select",
			placeholder: "Select a font",
			lookahead: 2,
			api: "https://fonts.googleapis.com/css?family=",
		};

		return this.each(function () {
			if (options) {
				$.extend(settings, options);
			}
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
					var $ths = this;
					jQuery.ajax({
						url: "https://www.googleapis.com/webfonts/v1/webfonts",
						data: {
							key: FontSelect_Control.bibleget_settings.googlefontsapi_key,
						},
						dataType: "json",
						type: "get",
						success: function (data) {
							//console.log(data);
							var webfontList = data.items;
							$.fontselect.google_fonts = [];
							for (var it = 0; it < webfontList.length; it++) {
								$.fontselect.google_fonts[it] = webfontList[it].family.replace(
									/ /g,
									"+"
								);
							}
							//console.log('new fontselect.google_fonts:');
							//console.log($.fontselect.google_fonts);
							return new Fontselect($ths, settings, $.fontselect.google_fonts);
						}/*,
						error: function (jqXHR, textStatus, errorThrown) {
							//console.log('error retrieving google fonts list :: '+textStatus+': '+errorThrown);
						}*/
					});
				}
				//console.log(bibleget_settings);
			} else {
				return new Fontselect(this, settings, $.fontselect.google_fonts);
			}
		});
	};
})(jQuery);
