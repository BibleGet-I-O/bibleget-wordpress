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
 * 
 */

(function($){

	$.fontselect = { google_fonts: [
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
	    			             "Buda:300",
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
	    			             "Corben:700",
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
	    			             "Jura:500",
	    			             "Jura:600",
	    			             "Just+Another+Hand",
	    			             "Just+Me+Again+Down+Here",
	    			             "Kameron",
	    			             "Kenia",
	    			             "Kranky",
	    			             "Kreon",
	    			             "Kristi",
	    			             "La+Belle+Aurore",
	    			             "Lato:100",
	    			             "Lato:100italic",
	    			             "Lato:300", 
	    			             "Lato",
	    			             "Lato:bold",  
	    			             "Lato:900",
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
	    			             "Maven+Pro:500",
	    			             "Maven+Pro:700",
	    			             "Maven+Pro:900",
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
	    			             "Muli:300", 
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
	    			             "Nunito:light",
	    			             "Nunito",
	    			             "OFL+Sorts+Mill+Goudy+TT",
	    			             "Old+Standard+TT",
	    			             "Open+Sans:300",
	    			             "Open+Sans",
	    			             "Open+Sans:600",
	    			             "Open+Sans:800",
	    			             "Open+Sans+Condensed:300",
	    			             "Orbitron",
	    			             "Orbitron:500",
	    			             "Orbitron:700",
	    			             "Orbitron:900",
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
	    			             "PT+Sans+Narrow:regular,bold",
	    			             "PT+Serif",
	    			             "PT+Serif Caption",
	    			             "Puritan",
	    			             "Quattrocento",
	    			             "Quattrocento+Sans",
	    			             "Radley",
	    			             "Raleway:100",
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
	    			             "Sniglet:800",
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
	    			             "UnifrakturCook:bold",
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
	    			             "Yanone+Kaffeesatz:300",
	    			             "Yanone+Kaffeesatz:400",
	    			             "Yanone+Kaffeesatz:700",
	    			             "Yeseva+One",
	    			             "Zeyada"]
	};
	
	Object.defineProperty($.fontselect,"version",{
		value: "1.0",
		writable: false
	});	

	Object.defineProperty($.fontselect,"websafe_fonts",{
		value: [
	  				{ "fontFamily": "Arial", 				"fallback": "Helvetica",	"genericFamily": "sans-serif" },
 					{ "fontFamily": "Arial Black",			"fallback": "Gadget",		"genericFamily": "sans-serif" },
 					{ "fontFamily": "Book Antiqua",			"fallback": "Palatino",		"genericFamily": "serif" },
 					{ "fontFamily": "Courier New",			"fallback": "Courier",		"genericFamily": "monospace" },
 					{ "fontFamily": "Georgia",											"genericFamily": "serif" },
 					{ "fontFamily": "Impact",				"fallback": "Charcoal",		"genericFamily": "sans-serif" },
 					{ "fontFamily": "Lucida Console",		"fallback": "Monaco",		"genericFamily": "monospace" },
 					{ "fontFamily": "Lucida Sans Unicode",	"fallback": "Lucida Grande","genericFamily": "sans-serif" },
 					{ "fontFamily": "Palatino Linotype",	"fallback": "Palatino",		"genericFamily": "serif" },
 					{ "fontFamily": "Tahoma",				"fallback": "Geneva",		"genericFamily": "sans-serif" },
 					{ "fontFamily": "Times New Roman",		"fallback": "Times",		"genericFamily": "serif" },
 					{ "fontFamily": "Trebuchet MS",			"fallback": "Helvetica",	"genericFamily": "sans-serif" },
 					{ "fontFamily": "Verdana",				"fallback": "Geneva",		"genericFamily": "sans-serif" }
         ],
		writable: false
	});

	$.fn.fontselect = function(options) {

		var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
		

		var settings = {
				style: 'font-select',
				placeholder: 'Select a font',
				lookahead: 2,
				api: 'https://fonts.googleapis.com/css?family='
		};

		var Fontselect = (function(){

			function Fontselect(original, o, f){
				this.$original = $(original);
				this.options = o;
				this.fonts = f;
				this.active = false;
				this.setupHtml();

				var font = this.$original.val();
				var fontType = null;
				//console.log('Fontselect initialize >> this.$original.val() = ' + font);
				if (font) {
					//console.log('yes we have an initial font value...');
					//check if this font is in the websafe_fonts or in the google_fonts and act accordingly
					var idx = -1;
					for(var key=0; key < $.fontselect.websafe_fonts.length; key++){
						//console.log('key = ' + key);
						//console.log('$.fontselect.websafe_fonts[key] = ' + $.fontselect.websafe_fonts[key]);
						
						if($.fontselect.websafe_fonts[key].hasOwnProperty("fontFamily") && $.fontselect.websafe_fonts[key].fontFamily == font){
							idx = key;
							fontType = 'websafe';
							//console.log('CONSTRUCTOR >> we are starting off with a websafe font');
							break;
						}					
					}
					if(idx == -1){ //font was not found among the websafe_fonts so is probably a google font
						for(var ky = 0; ky < $.fontselect.google_fonts.length; ky++){
							if($.fontselect.google_fonts[ky] == font){
								idx = ky;
								//this.addFontLink(font); // this shouldn't be necessary because already taken care of in updateSelected()
								fontType = 'googlefont';
								//console.log('CONSTRUCTOR >> we are starting off with a google font');
								break;
							}
						}
					}					 
				} // END IF FONT
				this.$original.data('fonttype',fontType); 
				//console.log('>>>> setting this.$original.data("fonttype") to:' +fontType);
				this.updateSelected(); //this will download the full font set for google fonts, which is useful so that preview text will be shown in this font
				this.getVisibleFonts();
				this.bindEvents();
			}

			Fontselect.prototype.bindEvents = function(){

				$('li', this.$results)
				.click(__bind(this.selectFont, this))
				.mouseenter(__bind(this.activateFont, this))
				.mouseleave(__bind(this.deactivateFont, this));

				$('span', this.$select).click(__bind(this.toggleDrop, this));
				this.$arrow.click(__bind(this.toggleDrop, this));
			};

			Fontselect.prototype.toggleDrop = function(ev){

				if(this.active){
					this.$element.removeClass('font-select-active');
					this.$drop.hide();
					clearInterval(this.visibleInterval);

				} else {
					this.$element.addClass('font-select-active');
					this.$drop.show();
					this.moveToSelected();
					this.visibleInterval = setInterval(__bind(this.getVisibleFonts, this), 500);
				}

				this.active = !this.active;
			};

			Fontselect.prototype.selectFont = function(){

				var font = $('li.active', this.$results).data('value');
				var fontType = $('li.active', this.$results).data('fonttype');
				this.$original.data('fonttype',fontType);
				//console.log('selectFont >> this.$original.data("fonttype") = ' + this.$original.data('fonttype'));
				this.$original.val(font).change();
				this.updateSelected();
				this.toggleDrop();
			};

			Fontselect.prototype.moveToSelected = function(){

				var $li, font = this.$original.val();

				if (font){
					$li = $("li[data-value='"+ font +"']", this.$results);
				} else {
					$li = $("li", this.$results).first();
				}

				this.$results.scrollTop($li.addClass('active').position().top);
			};

			Fontselect.prototype.activateFont = function(ev){
				$('li.active', this.$results).removeClass('active');
				$(ev.currentTarget).addClass('active');
			};

			Fontselect.prototype.deactivateFont = function(ev){

				$(ev.currentTarget).removeClass('active');
			};

			Fontselect.prototype.updateSelected = function(){

				var font = this.$original.val();
				var fontType = this.$original.data('fonttype');
				//console.log('updateSelected >> this.$original.data("fonttype") = ' + fontType);
				if(fontType == 'googlefont'){
					$('span', this.$element).text(this.toReadable(font)).css(this.toStyle(font));
					var link = this.options.api + font;

					if ($("link[href*='" + font + "']").length > 0){
						$("link[href*='" + font + "']").attr('href',link)
					}
					else{
						$('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
					}					
				}
				else if(fontType == 'websafe'){
					$('span', this.$element).text(font).css({"font-family":font});
				}
			};

			Fontselect.prototype.setupHtml = function(){
				//console.log('setupHtml >> where is the culprit');
				//console.log('this.options.style: '+this.options.style);
				//console.log('this.options.placeholder: '+this.options.placeholder);
				this.$original.empty().hide();
				this.$element = $('<div>', {'class': this.options.style});
				this.$arrow = $('<div><b></b></div>');
				this.$select = $('<a><span>'+ this.options.placeholder +'</span></a>');
				this.$drop = $('<div>', {'class': 'fs-drop'});
				this.$results = $('<ul>', {'class': 'fs-results'});
				this.$original.after(this.$element.append(this.$select.append(this.$arrow)).append(this.$drop));
				this.$drop.append(this.$results.append(this.fontsAsHtml())).hide();
				//console.log('setupHtml END');
			};

			Fontselect.prototype.fontsAsHtml = function(){
				//console.log('fontsAsHtml >> where is the culprit');
				var l = this.fonts.length,
					ll = $.fontselect.websafe_fonts.length;
				//console.log('this.fonts.length = ' +l);
				//console.log('$.fontselect.websafe_fonts.length = '+ll);
				var r, s, h = '';
				for(var idx = 0; idx < ll; idx++){
					if($.fontselect.websafe_fonts[idx].hasOwnProperty("fontFamily") ){
						//console.log('of course I have property fontFamily, silly!');
						var flbk = '';
						if($.fontselect.websafe_fonts[idx].hasOwnProperty("fallback") ){
							flbk = '&apos;' + $.fontselect.websafe_fonts[idx].fallback + '&apos;,';
						}
						var $style = 'font-family:&apos;'+ $.fontselect.websafe_fonts[idx].fontFamily + '&apos;,' + flbk +'&apos;' + ($.fontselect.websafe_fonts[idx].hasOwnProperty("genericFamily") ? $.fontselect.websafe_fonts[idx].genericFamily : '') + '&apos;;';
						h += '<li data-fonttype="websafe" data-value="' + $.fontselect.websafe_fonts[idx].fontFamily + '" style="' + $style + '">' + $.fontselect.websafe_fonts[idx].fontFamily + '</li>'; 						
					}
					//else{
					//	console.log('why on earth do I not have a fontFamily property? '+idx);
					//}
				}
				h += '<div style="border-top:3px groove White;border-bottom:3px groove White;box-shadow:0px -2px 6px Black,0px 2px 3px Black;margin:9px auto 3px auto;padding:3px 0px;text-align:center;background-color:Gray;color:White;width:96%;">Google Web Fonts</div>';
				for(var i=0; i<l; i++){
					r = this.toReadable(this.fonts[i]);
					s = this.toStyle(this.fonts[i]);
					//console.log('r >> ' + r);
					//console.log('s >> ' + s);
					h += '<li data-fonttype="googlefont" data-value="'+ this.fonts[i] +'" style="font-family: '+s['font-family'] +'; font-weight: '+s['font-weight'] +';">'+ r +'</li>';
				}
				//console.log(h);
				//console.log('fontsAsHtml END');
				return h;
			};

			Fontselect.prototype.toReadable = function(font){
				return font.replace(/[\+|:]/g, ' ');
			};

			Fontselect.prototype.toStyle = function(font){
				var t = font.split(':');
				return {'font-family': this.toReadable(t[0]), 'font-weight': (t[1] || 400)};
			};

			Fontselect.prototype.getVisibleFonts = function(){

				//if(this.$results.is(':hidden')) return;

				var fs = this;
				/*
				var top = this.$results.scrollTop();
				var bottom = top + this.$results.height();

				if(this.options.lookahead){
					var li = $('li', this.$results).first().height();
					bottom += li*this.options.lookahead;
				}
				*/
				$('li', this.$results).each(function(){

					//var ft = $(this).position().top+top;
					//var fb = ft + $(this).height();

					//if ((fb >= top) && (ft <= bottom)){						
						if($(this).data('fonttype') == "googlefont"){ 
							fs.addFontLink($(this).data('value'));
						}
					//}

				});
			};

			Fontselect.prototype.addFontLink = function(font){

				var link = this.options.api + font + '&text=' + encodeURIComponent(this.toReadable(font).replace(/\s+/g, ''));

				if ($("link[href*='" + font + "']").length === 0){
					$('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
				}
			};

			return Fontselect;
		})();

		return this.each(function() {
			if (options) {
				$.extend( settings, options );
			}
			return new Fontselect(this, settings, $.fontselect.google_fonts);
		});

	};
})(jQuery);
