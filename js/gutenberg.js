/*
 * Gutenberg Block registration script
 * BibleGet I/O plugin
 * Author: John Romano D'Orazio priest@johnromanodorazio.com
 */

const BGET = BibleGetGlobal.BGETConstants;

(function (blocks, element, i18n, editor, components, ServerSideRender, $) {
	//define the same attributes as the shortcode, but now in JSON format
	const { registerBlockType } = blocks; //Blocks API
	const { createElement, Fragment } = element; //React.createElement
	const { __ } = i18n; //translation functions
	const { InspectorControls } = editor; //Block inspector wrapper
	const { TextControl, SelectControl, RangeControl, ToggleControl, PanelBody, PanelRow, Button, ButtonGroup, BaseControl, ColorPicker } = components; //WordPress form inputs and server-side renderer


	const colorizeIco = createElement('svg', { 
		'aria-hidden': 'true',
		focusable: 'false',
		width: '20', 
		height: '20',
		role: 'img',
		'viewBox': '0 0 22 22',
		xmlns: "http://www.w3.org/2000/svg"
	}, createElement('path', {
		d: "M0 0h24v24H0V0z",
		fill: "none"
	} ), createElement('path', {
		d: "M17.66 5.41l.92.92-2.69 2.69-.92-.92 2.69-2.69M17.67 3c-.26 0-.51.1-.71.29l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42l-2.34-2.34c-.2-.19-.45-.29-.7-.29zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z"
	}) );

	registerBlockType('bibleget/bible-quote', {
		title: __('Bible quote', 'bibleget-io'), // Block title.
		category: 'widgets',
		icon: 'book-alt',
		attributes: BibleGetGlobal.BGETProperties,
		transforms: {
			from: [
				{
					type: 'block',
					blocks: ['core/shortcode'],
					isMatch: function ({ text }) {
						return /^\[bibleget/.test(text);
					},
					transform: ({ text }) => {

						let query = getInnerContent('bibleget', text);
						if(query==''){
							query = getAttributeValue('bibleget', 'query', text);
						}

						let version = getAttributeValue('bibleget', 'versions', text) || getAttributeValue('bibleget', 'version', text) || "NABRE";

						let popup = getAttributeValue('bibleget', 'popup', text);

						return wp.blocks.createBlock('bibleget/bible-quote', {
							QUERY: query,
							VERSION: version.split(','),
							POPUP: JSON.parse(popup)
						});
					},
				},
				
			]
		},		
		//display the edit interface + preview
		edit(props) {
			const {attributes, setAttributes} = props;

			//Function to update the query with Bible reference
			function changeQuery(QUERY) {
				//BibleGetGlobal.BGETProperties['QUERY'].default = QUERY;
				setAttributes({ QUERY });
			}

			//Function to update Bible version that will be used to retrieve the Bible quote
			function changeVersion(VERSION) {
				if(VERSION.length < 1){
					alert(__('You must indicate the desired version or versions','bibleget-io'));
					return false;
				}
				//BibleGetGlobal.BGETProperties['VERSION'].default = VERSION;
				setAttributes({ VERSION });
			}

			//Function to update whether the Bible quote will be showed in a popup or not
			function changePopup(POPUP) {
				//BibleGetGlobal.BGETProperties['POPUP'].default = POPUP;
				setAttributes({ POPUP });
			}

			function changeBibleVersionVisibility(LAYOUTPREFS_SHOWBIBLEVERSION){
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_SHOWBIBLEVERSION'].default = LAYOUTPREFS_SHOWBIBLEVERSION;
				setAttributes({ LAYOUTPREFS_SHOWBIBLEVERSION });
			}

			function changeBibleVersionAlign(ev){
				let LAYOUTPREFS_BIBLEVERSIONALIGNMENT = parseInt(ev.currentTarget.value);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let textalign = BGET.CSSRULE.ALIGN[LAYOUTPREFS_BIBLEVERSIONALIGNMENT];
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.bibleVersion \{ text-align: (?:.*?); \}/, '.bibleQuote.results p.bibleVersion { text-align: ' + textalign+'; }'));
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BIBLEVERSIONALIGNMENT'].default = LAYOUTPREFS_BIBLEVERSIONALIGNMENT;
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONALIGNMENT });
			}

			function changeBibleVersionPos(ev){
				let LAYOUTPREFS_BIBLEVERSIONPOSITION = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BIBLEVERSIONPOSITION'].default = LAYOUTPREFS_BIBLEVERSIONPOSITION;
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONPOSITION });
			}

			function changeBibleVersionWrap(ev){
				let LAYOUTPREFS_BIBLEVERSIONWRAP = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BIBLEVERSIONWRAP'].default = LAYOUTPREFS_BIBLEVERSIONWRAP;
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONWRAP });
			}

			function changeBookChapterAlign(ev) {
				let LAYOUTPREFS_BOOKCHAPTERALIGNMENT = parseInt(ev.currentTarget.value);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let textalign = BGET.CSSRULE.ALIGN[LAYOUTPREFS_BOOKCHAPTERALIGNMENT];
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \.bookChapter \{ text-align: (?:.*?); \}/, '.bibleQuote.results .bookChapter { text-align: ' + textalign + '; }'));
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BOOKCHAPTERALIGNMENT'].default = LAYOUTPREFS_BOOKCHAPTERALIGNMENT;
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERALIGNMENT });
			}

			function changeBookChapterPos(ev) {
				let LAYOUTPREFS_BOOKCHAPTERPOSITION = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BOOKCHAPTERPOSITION'].default = LAYOUTPREFS_BOOKCHAPTERPOSITION;
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERPOSITION });
			}

			function changeBookChapterWrap(ev) {
				let LAYOUTPREFS_BOOKCHAPTERWRAP = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BOOKCHAPTERWRAP'].default = LAYOUTPREFS_BOOKCHAPTERWRAP;
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERWRAP });
			}

			function changeShowFullReference(LAYOUTPREFS_BOOKCHAPTERFULLQUERY){
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BOOKCHAPTERFULLQUERY'].default = LAYOUTPREFS_BOOKCHAPTERFULLQUERY;
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERFULLQUERY });
			}

			function changeUseBookAbbreviation(usebookabbreviation){
				let LAYOUTPREFS_BOOKCHAPTERFORMAT;
				if(attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANG || attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANGABBREV ){
					LAYOUTPREFS_BOOKCHAPTERFORMAT = (usebookabbreviation ? BGET.FORMAT.USERLANGABBREV : BGET.FORMAT.USERLANG);
				}
				else if(attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.BIBLELANG || attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.BIBLELANGABBREV){
					LAYOUTPREFS_BOOKCHAPTERFORMAT = (usebookabbreviation ? BGET.FORMAT.BIBLELANGABBREV : BGET.FORMAT.BIBLELANG);
				}
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BOOKCHAPTERFORMAT'].default = LAYOUTPREFS_BOOKCHAPTERFORMAT;
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERFORMAT });
			}

			function changeBookNameUseWpLang(booknameusewplang){
				let LAYOUTPREFS_BOOKCHAPTERFORMAT;
				if(attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANG || attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.BIBLELANG){
					LAYOUTPREFS_BOOKCHAPTERFORMAT = (booknameusewplang ? BGET.FORMAT.USERLANG : BGET.FORMAT.BIBLELANG);
				}
				else if(attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANGABBREV || attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.BIBLELANGABBREV){
					LAYOUTPREFS_BOOKCHAPTERFORMAT = (booknameusewplang ? BGET.FORMAT.USERLANGABBREV : BGET.FORMAT.BIBLELANGABBREV);
				}
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_BOOKCHAPTERFORMAT'].default = LAYOUTPREFS_BOOKCHAPTERFORMAT;
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERFORMAT });
			}

			function changeVerseNumberVisibility(LAYOUTPREFS_SHOWVERSENUMBERS){
				BibleGetGlobal.BGETProperties['LAYOUTPREFS_SHOWVERSENUMBERS'].default = LAYOUTPREFS_SHOWVERSENUMBERS;
				setAttributes({ LAYOUTPREFS_SHOWVERSENUMBERS });
			}

			function changeParagraphStyleBorderWidth(PARAGRAPHSTYLES_BORDERWIDTH){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-width: (?:.*?); \}/, '.bibleQuote.results { border-width: ' + PARAGRAPHSTYLES_BORDERWIDTH + 'px; }'));				
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_BORDERWIDTH'].default = PARAGRAPHSTYLES_BORDERWIDTH;
				setAttributes({ PARAGRAPHSTYLES_BORDERWIDTH });
			}

			function changeParagraphStyleBorderRadius(PARAGRAPHSTYLES_BORDERRADIUS){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-radius: (?:.*?); \}/, '.bibleQuote.results { border-radius: ' + PARAGRAPHSTYLES_BORDERRADIUS + 'px; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_BORDERRADIUS'].default = PARAGRAPHSTYLES_BORDERRADIUS;
				setAttributes({ PARAGRAPHSTYLES_BORDERRADIUS });
			}

			function changeParagraphStyleBorderStyle(PARAGRAPHSTYLES_BORDERSTYLE){
				PARAGRAPHSTYLES_BORDERSTYLE = parseInt(PARAGRAPHSTYLES_BORDERSTYLE);
				let borderstyle = BGET.CSSRULE.BORDERSTYLE[PARAGRAPHSTYLES_BORDERSTYLE];
				//console.log('borderstyle = '+borderstyle);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-style: (?:.*?); \}/, '.bibleQuote.results { border-style: ' + borderstyle + '; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_BORDERSTYLE'].default = PARAGRAPHSTYLES_BORDERSTYLE;
				setAttributes({ PARAGRAPHSTYLES_BORDERSTYLE });
			}

			function changeParagraphStyleBorderColor(bordercolor){
				let PARAGRAPHSTYLES_BORDERCOLOR = bordercolor.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-color: (?:.*?); \}/, '.bibleQuote.results { border-color: ' + PARAGRAPHSTYLES_BORDERCOLOR + '; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_BORDERCOLOR'].default = PARAGRAPHSTYLES_BORDERCOLOR;
				setAttributes({ PARAGRAPHSTYLES_BORDERCOLOR });
			}

			function changeParagraphStyleBackgroundColor(backgroundcolor){
				let PARAGRAPHSTYLES_BACKGROUNDCOLOR = backgroundcolor.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ background-color: (?:.*?); \}/, '.bibleQuote.results { background-color: ' + PARAGRAPHSTYLES_BACKGROUNDCOLOR + '; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_BACKGROUNDCOLOR'].default = PARAGRAPHSTYLES_BACKGROUNDCOLOR;
				setAttributes({ PARAGRAPHSTYLES_BACKGROUNDCOLOR });
			}

			function changeParagraphStyleMarginTopBottom(PARAGRAPHSTYLES_MARGINTOPBOTTOM){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let { PARAGRAPHSTYLES_MARGINLEFTRIGHT,PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT}  = attributes;
				let margLR = '';
				switch(PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT){
					case 'px':
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + 'px';
						break;
					case '%':
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + '%';
						break;
					case 'auto':
						margLR = 'auto';
				}
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ margin: (?:.*?); \}/, '.bibleQuote.results { margin: ' + PARAGRAPHSTYLES_MARGINTOPBOTTOM + 'px ' + margLR + '; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_MARGINTOPBOTTOM'].default = PARAGRAPHSTYLES_MARGINTOPBOTTOM;
				setAttributes({ PARAGRAPHSTYLES_MARGINTOPBOTTOM });
			}

			function changeParagraphStyleMarginLeftRight(PARAGRAPHSTYLES_MARGINLEFTRIGHT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let { PARAGRAPHSTYLES_MARGINTOPBOTTOM, PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT }  = attributes;
				let margLR = '';
				switch(PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT){
					case 'px':
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + 'px';
						break;
					case '%':
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + '%';
						break;
					case 'auto':
						margLR = 'auto';
				}
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ margin: (?:.*?); \}/, '.bibleQuote.results { margin: ' + PARAGRAPHSTYLES_MARGINTOPBOTTOM + 'px ' + margLR + '; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_MARGINLEFTRIGHT'].default = PARAGRAPHSTYLES_MARGINLEFTRIGHT;
				setAttributes({ PARAGRAPHSTYLES_MARGINLEFTRIGHT });
			}

			function changeParagraphStyleMarginLeftRightUnit(PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let { PARAGRAPHSTYLES_MARGINTOPBOTTOM, PARAGRAPHSTYLES_MARGINLEFTRIGHT }  = attributes;
				let margLR = '';
				switch(PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT){
					case 'px':
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + 'px';
						break;
					case '%':
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + '%';
						break;
					case 'auto':
						margLR = 'auto';
				}
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ margin: (?:.*?); \}/, '.bibleQuote.results { margin: ' + PARAGRAPHSTYLES_MARGINTOPBOTTOM + 'px ' + margLR + '; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT'].default = PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT;
				setAttributes({ PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT });
			}

			function changeParagraphStylePaddingTopBottom(PARAGRAPHSTYLES_PADDINGTOPBOTTOM){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let { PARAGRAPHSTYLES_PADDINGLEFTRIGHT}  = attributes;
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ padding: (?:.*?); \}/, '.bibleQuote.results { padding: ' + PARAGRAPHSTYLES_PADDINGTOPBOTTOM + 'px ' + PARAGRAPHSTYLES_PADDINGLEFTRIGHT + 'px; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_PADDINGTOPBOTTOM'].default = PARAGRAPHSTYLES_PADDINGTOPBOTTOM;
				setAttributes({ PARAGRAPHSTYLES_PADDINGTOPBOTTOM });
			}

			function changeParagraphStylePaddingLeftRight(PARAGRAPHSTYLES_PADDINGLEFTRIGHT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let { PARAGRAPHSTYLES_PADDINGTOPBOTTOM}  = attributes;
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ padding: (?:.*?); \}/, '.bibleQuote.results { padding: ' + PARAGRAPHSTYLES_PADDINGTOPBOTTOM + 'px ' + PARAGRAPHSTYLES_PADDINGLEFTRIGHT + 'px; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_PADDINGLEFTRIGHT'].default = PARAGRAPHSTYLES_PADDINGLEFTRIGHT;
				setAttributes({ PARAGRAPHSTYLES_PADDINGLEFTRIGHT });
			}

			function changeParagraphStyleLineHeight(PARAGRAPHSTYLES_LINEHEIGHT){
				//console.log('('+(typeof PARAGRAPHSTYLES_LINEHEIGHT)+') PARAGRAPHSTYLES_LINEHEIGHT = '+PARAGRAPHSTYLES_LINEHEIGHT);
				PARAGRAPHSTYLES_LINEHEIGHT = parseFloat(PARAGRAPHSTYLES_LINEHEIGHT);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.versesParagraph \{ line-height: (?:.*?); \}/, '.bibleQuote.results p.versesParagraph { line-height: ' + PARAGRAPHSTYLES_LINEHEIGHT + 'em; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_LINEHEIGHT'].default = PARAGRAPHSTYLES_LINEHEIGHT;
				setAttributes({ PARAGRAPHSTYLES_LINEHEIGHT });
			}

			function changeParagraphStyleWidth(PARAGRAPHSTYLES_WIDTH){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ width: (?:.*?); \}/, '.bibleQuote.results { width: ' + PARAGRAPHSTYLES_WIDTH + '%; }'));
				BibleGetGlobal.BGETProperties['PARAGRAPHSTYLES_WIDTH'].default = PARAGRAPHSTYLES_WIDTH;
				setAttributes({ PARAGRAPHSTYLES_WIDTH });
			}

			function changeBibleVersionTextStyle(ev){
				let target = parseInt(ev.currentTarget.value);
				let {VERSIONSTYLES_BOLD,VERSIONSTYLES_ITALIC,VERSIONSTYLES_UNDERLINE,VERSIONSTYLES_STRIKETHROUGH} = attributes;
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						VERSIONSTYLES_BOLD = !VERSIONSTYLES_BOLD;
						break;
					case BGET.TEXTSTYLE.ITALIC:
						VERSIONSTYLES_ITALIC = !VERSIONSTYLES_ITALIC;
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						VERSIONSTYLES_UNDERLINE = !VERSIONSTYLES_UNDERLINE;
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						VERSIONSTYLES_STRIKETHROUGH = !VERSIONSTYLES_STRIKETHROUGH;
						break;
				}
				
				let boldrule = VERSIONSTYLES_BOLD ? 'bold' : 'normal';
				let italicrule = VERSIONSTYLES_ITALIC ? 'italic' : 'normal';
				let decorationrule = '';
				let decorations = [];
				if(VERSIONSTYLES_UNDERLINE){ decorations.push('underline'); }
				if(VERSIONSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
				if(decorations.length === 0){
					decorationrule = 'none';
				}
				else{
					decorationrule = decorations.join(' ');
				}
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-weight:))(.*?)(;.*)/,`$1${boldrule}$4`)				
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-style:))(.*?)(;.*)/,`$1${italicrule}$4`);
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.bibleVersion \{(.*?text\-decoration:))(.*?)(;.*)/,`$1${decorationrule}$4`);
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties['VERSIONSTYLES_BOLD'].default = VERSIONSTYLES_BOLD;
						setAttributes({ VERSIONSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties['VERSIONSTYLES_ITALIC'].default = VERSIONSTYLES_ITALIC;
						setAttributes({ VERSIONSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties['VERSIONSTYLES_UNDERLINE'].default = VERSIONSTYLES_UNDERLINE;
						setAttributes({ VERSIONSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties['VERSIONSTYLES_STRIKETHROUGH'].default = VERSIONSTYLES_STRIKETHROUGH;
						setAttributes({ VERSIONSTYLES_STRIKETHROUGH });
						break;
				}
			}

			function changeBibleVersionFontSize(VERSIONSTYLES_FONTSIZE){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (attributes.VERSIONSTYLES_FONTSIZEUNIT == 'em') ? VERSIONSTYLES_FONTSIZE/10 : VERSIONSTYLES_FONTSIZE;
				let fontsizerule = (attributes.VERSIONSTYLES_FONTSIZEUNIT == 'inherit') ? 'inherit' : fontsize+attributes.VERSIONSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['VERSIONSTYLES_FONTSIZE'].default = VERSIONSTYLES_FONTSIZE;
				setAttributes({ VERSIONSTYLES_FONTSIZE });
			}

			function changeBibleVersionFontSizeUnit(VERSIONSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (VERSIONSTYLES_FONTSIZEUNIT == 'em') ? attributes.VERSIONSTYLES_FONTSIZE/10 : attributes.VERSIONSTYLES_FONTSIZE;
				let fontsizerule = (VERSIONSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+VERSIONSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['VERSIONSTYLES_FONTSIZEUNIT'].default = VERSIONSTYLES_FONTSIZEUNIT;
				setAttributes({ VERSIONSTYLES_FONTSIZEUNIT });
			}

			function changeBibleVersionStyleFontColor(color){
				let VERSIONSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.bibleVersion \{ color: (?:.*?); \}/, '.bibleQuote.results p\.bibleVersion { color: ' + VERSIONSTYLES_TEXTCOLOR + '; }'));
				BibleGetGlobal.BGETProperties['VERSIONSTYLES_TEXTCOLOR'].default = VERSIONSTYLES_TEXTCOLOR;
				setAttributes({ VERSIONSTYLES_TEXTCOLOR });
			}

			function changeBookChapterTextStyle(ev){
				let target = parseInt(ev.currentTarget.value);
				let {BOOKCHAPTERSTYLES_BOLD,BOOKCHAPTERSTYLES_ITALIC,BOOKCHAPTERSTYLES_UNDERLINE,BOOKCHAPTERSTYLES_STRIKETHROUGH} = attributes;
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						BOOKCHAPTERSTYLES_BOLD = !BOOKCHAPTERSTYLES_BOLD;
						break;
					case BGET.TEXTSTYLE.ITALIC:
						BOOKCHAPTERSTYLES_ITALIC = !BOOKCHAPTERSTYLES_ITALIC;
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						BOOKCHAPTERSTYLES_UNDERLINE = !BOOKCHAPTERSTYLES_UNDERLINE;
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BOOKCHAPTERSTYLES_STRIKETHROUGH = !BOOKCHAPTERSTYLES_STRIKETHROUGH;
						break;
				}
				
				let boldrule = BOOKCHAPTERSTYLES_BOLD ? 'bold' : 'normal';
				let italicrule = BOOKCHAPTERSTYLES_ITALIC ? 'italic' : 'normal';
				let decorationrule = '';
				let decorations = [];
				if(BOOKCHAPTERSTYLES_UNDERLINE){ decorations.push('underline'); }
				if(BOOKCHAPTERSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
				if(decorations.length === 0){
					decorationrule = 'none';
				}
				else{
					decorationrule = decorations.join(' ');
				}
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results \.bookChapter \{(.*?font\-weight:))(.*?)(;.*)/,`$1${boldrule}$4`)				
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results \.bookChapter \{(.*?font\-style:))(.*?)(;.*)/,`$1${italicrule}$4`);
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results \.bookChapter \{(.*?text\-decoration:))(.*?)(;.*)/,`$1${decorationrule}$4`);
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties['BOOKCHAPTERSTYLES_BOLD'].default = BOOKCHAPTERSTYLES_BOLD;
						setAttributes({ BOOKCHAPTERSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties['BOOKCHAPTERSTYLES_ITALIC'].default = BOOKCHAPTERSTYLES_ITALIC;
						setAttributes({ BOOKCHAPTERSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties['BOOKCHAPTERSTYLES_UNDERLINE'].default = BOOKCHAPTERSTYLES_UNDERLINE;
						setAttributes({ BOOKCHAPTERSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties['BOOKCHAPTERSTYLES_STRIKETHROUGH'].default = BOOKCHAPTERSTYLES_STRIKETHROUGH;
						setAttributes({ BOOKCHAPTERSTYLES_STRIKETHROUGH });
						break;
				}
			}

			function changeBookChapterFontSize(BOOKCHAPTERSTYLES_FONTSIZE){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT == 'em') ? BOOKCHAPTERSTYLES_FONTSIZE/10 : BOOKCHAPTERSTYLES_FONTSIZE;
				let fontsizerule = (attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT == 'inherit') ? 'inherit' : fontsize+attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results \.bookChapter \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['BOOKCHAPTERSTYLES_FONTSIZE'].default = BOOKCHAPTERSTYLES_FONTSIZE;
				setAttributes({ BOOKCHAPTERSTYLES_FONTSIZE });
			}

			function changeBookChapterFontSizeUnit(BOOKCHAPTERSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (BOOKCHAPTERSTYLES_FONTSIZEUNIT == 'em') ? attributes.BOOKCHAPTERSTYLES_FONTSIZE/10 : attributes.BOOKCHAPTERSTYLES_FONTSIZE;
				let fontsizerule = (BOOKCHAPTERSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+BOOKCHAPTERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results \.bookChapter \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['BOOKCHAPTERSTYLES_FONTSIZEUNIT'].default = BOOKCHAPTERSTYLES_FONTSIZEUNIT;
				setAttributes({ BOOKCHAPTERSTYLES_FONTSIZEUNIT });
			}

			function changeBookChapterStyleFontColor(color){
				let BOOKCHAPTERSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \.bookChapter \{ color: (?:.*?); \}/, '.bibleQuote.results \.bookChapter { color: ' + BOOKCHAPTERSTYLES_TEXTCOLOR + '; }'));
				BibleGetGlobal.BGETProperties['BOOKCHAPTERSTYLES_TEXTCOLOR'].default = BOOKCHAPTERSTYLES_TEXTCOLOR;
				setAttributes({ BOOKCHAPTERSTYLES_TEXTCOLOR });
			}

			function changeVerseNumberTextStyle(ev){
				let target = parseInt(ev.currentTarget.value);
				let {VERSENUMBERSTYLES_BOLD,VERSENUMBERSTYLES_ITALIC,VERSENUMBERSTYLES_UNDERLINE,VERSENUMBERSTYLES_STRIKETHROUGH} = attributes;
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						VERSENUMBERSTYLES_BOLD = !VERSENUMBERSTYLES_BOLD;
						break;
					case BGET.TEXTSTYLE.ITALIC:
						VERSENUMBERSTYLES_ITALIC = !VERSENUMBERSTYLES_ITALIC;
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						VERSENUMBERSTYLES_UNDERLINE = !VERSENUMBERSTYLES_UNDERLINE;
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						VERSENUMBERSTYLES_STRIKETHROUGH = !VERSENUMBERSTYLES_STRIKETHROUGH;
						break;
				}
				
				let boldrule = VERSENUMBERSTYLES_BOLD ? 'bold' : 'normal';
				let italicrule = VERSENUMBERSTYLES_ITALIC ? 'italic' : 'normal';
				let decorationrule = '';
				let decorations = [];
				if(VERSENUMBERSTYLES_UNDERLINE){ decorations.push('underline'); }
				if(VERSENUMBERSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
				if(decorations.length === 0){
					decorationrule = 'none';
				}
				else{
					decorationrule = decorations.join(' ');
				}
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-weight:))(.*?)(;.*)/,`$1${boldrule}$4`)				
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-style:))(.*?)(;.*)/,`$1${italicrule}$4`);
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?text\-decoration:))(.*?)(;.*)/,`$1${decorationrule}$4`);
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_BOLD'].default = VERSENUMBERSTYLES_BOLD;
						setAttributes({ VERSENUMBERSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_ITALIC'].default = VERSENUMBERSTYLES_ITALIC;
						setAttributes({ VERSENUMBERSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_UNDERLINE'].default = VERSENUMBERSTYLES_UNDERLINE;
						setAttributes({ VERSENUMBERSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_STRIKETHROUGH'].default = VERSENUMBERSTYLES_STRIKETHROUGH;
						setAttributes({ VERSENUMBERSTYLES_STRIKETHROUGH });
						break;
				}
			}

			function changeVerseNumberFontSize(VERSENUMBERSTYLES_FONTSIZE){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (attributes.VERSENUMBERSTYLES_FONTSIZEUNIT == 'em') ? VERSENUMBERSTYLES_FONTSIZE/10 : VERSENUMBERSTYLES_FONTSIZE;
				let fontsizerule = (attributes.VERSENUMBERSTYLES_FONTSIZEUNIT == 'inherit') ? 'inherit' : fontsize+attributes.VERSENUMBERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_FONTSIZE'].default = VERSENUMBERSTYLES_FONTSIZE;
				setAttributes({ VERSENUMBERSTYLES_FONTSIZE });
			}

			function changeVerseNumberFontSizeUnit(VERSENUMBERSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (VERSENUMBERSTYLES_FONTSIZEUNIT == 'em') ? attributes.VERSENUMBERSTYLES_FONTSIZE/10 : attributes.VERSENUMBERSTYLES_FONTSIZE;
				let fontsizerule = (VERSENUMBERSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+VERSENUMBERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_FONTSIZEUNIT'].default = VERSENUMBERSTYLES_FONTSIZEUNIT;
				setAttributes({ VERSENUMBERSTYLES_FONTSIZEUNIT });
			}

			function changeVerseNumberStyleFontColor(color){
				let VERSENUMBERSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{ color: (?:.*?); \}/, '.bibleQuote.results p\.versesParagraph span\.verseNum { color: ' + VERSENUMBERSTYLES_TEXTCOLOR + '; }'));
				BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_TEXTCOLOR'].default = VERSENUMBERSTYLES_TEXTCOLOR;
				setAttributes({ VERSENUMBERSTYLES_TEXTCOLOR });
			}

			function changeVerseNumberValign(ev){
				//console.log('('+(typeof ev.currentTarget.value)+') ev.currentTarget.value = ' + ev.currentTarget.value );
				let VERSENUMBERSTYLES_VALIGN = parseInt(ev.currentTarget.value);
				//console.log('('+(typeof VERSENUMBERSTYLES_VALIGN)+') VERSENUMBERSTYLES_VALIGN = '+VERSENUMBERSTYLES_VALIGN);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let valignrule = { 'vertical-align' : 'baseline' };
				switch(VERSENUMBERSTYLES_VALIGN){
					case BGET.VALIGN.NORMAL:
						valignrule.position = 'static';
						break;
					case BGET.VALIGN.SUPERSCRIPT:
						valignrule.position = 'relative';
						valignrule.top = '-0.6em';
						break;
					case BGET.VALIGN.SUBSCRIPT:
						valignrule.position = 'relative'; 
						valignrule.top = '0.6em;'
						break;
				}
				
				//console.log('valignrule =');
				//console.log(valignrule);
				//if we find the selector and the corresponding rule then we change it
				if( (/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?position:))(.*?)(;.*)/).test(bbGetDynSS) ){
					//console.log('we have found a position rule to change');
					bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?position:))(.*?)(;.*)/,`$1${valignrule.position}$4`);
				}
				else{ //if we can't find the rule to edit, then we create it
					//console.log('we have not found a position rule to change, we must create it');
					//if we can at least find the corresponding selector, add rule to selector
					if( (/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{/).test(bbGetDynSS) ){
						//console.log('we have not found at least the correct selector, we will add the rule to this selector');
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{)(.*?\})/,`$1position:${valignrule.position};$2`);
					}
					//otherwise create the rule ex-novo
					else{
						//console.log('we have not found the correct selector, we will add the selector and the rule');
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph span.verseNum { position: ${valignrule.position}; }
						`;
					} 
				}
				//if we find the selector and the corresponding rule then we change it
				if( (/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?vertical\-align:))(.*?)(;.*)/).test(bbGetDynSS) ){
					bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?vertical\-align:))(.*?)(;.*)/,`$1${valignrule['vertical-align']}$4`);
				}
				else{ //if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if( (/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{/).test(bbGetDynSS) ){
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{)(.*?\})/,`$1vertical-align:${valignrule['vertical-align']};$2`);
					}
					//otherwise create the rule ex-novo
					else{
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph span.verseNum { vertical-align: ${valignrule['vertical-align']}; }
						`;
					} 
				}
				//if we find the selector and the corresponding rule then we change it (if BGET.VALIGN.NORMAL we remove it)
				if( (/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?top:))(.*?)(;.*)/).test(bbGetDynSS) ){
					//console.log('we have found a top rule to change');
					if(VERSENUMBERSTYLES_VALIGN === BGET.VALIGN.NORMAL){
						//console.log('VALIGN.NORMAL requires us to remove the top rule, now removing rule from selector');
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{.*?)top:.*?;(.*)/,`$1$2`);
					}
					else{
						//console.log('now changing the rule we found in the selector');
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?top:))(.*?)(;.*)/,`$1${valignrule.top}$4`);
					}
				}
				else if(VERSENUMBERSTYLES_VALIGN !== BGET.VALIGN.NORMAL){ //if we can't find the rule to edit, then we create it (except if BGET.VALIGN.NORMAL)
					//console.log('we did not find a top rule to change and VALIGN!=NORMAL so we must add a top rule');
					//if we can at least find the corresponding selector, add rule to selector
					if( (/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{/).test(bbGetDynSS) ){
						//console.log('we did find the selector in any case, now adding a top rule to the selector');
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{)(.*?\})/,`$1top:${valignrule.top};$2`);
					}
					//otherwise create the rule ex-novo
					else{
						//console.log('we did not even find the selector so we will now add both the selector and the top rule');
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph span.verseNum { top: ${valignrule.top}; }
						`;
					} 
				}
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['VERSENUMBERSTYLES_VALIGN'].default = VERSENUMBERSTYLES_VALIGN;
				setAttributes({ VERSENUMBERSTYLES_VALIGN });
			}

			function changeVerseTextTextStyle(ev){
				let target = parseInt(ev.currentTarget.value);
				let {VERSETEXTSTYLES_BOLD,VERSETEXTSTYLES_ITALIC,VERSETEXTSTYLES_UNDERLINE,VERSETEXTSTYLES_STRIKETHROUGH} = attributes;
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						VERSETEXTSTYLES_BOLD = !VERSETEXTSTYLES_BOLD;
						break;
					case BGET.TEXTSTYLE.ITALIC:
						VERSETEXTSTYLES_ITALIC = !VERSETEXTSTYLES_ITALIC;
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						VERSETEXTSTYLES_UNDERLINE = !VERSETEXTSTYLES_UNDERLINE;
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						VERSETEXTSTYLES_STRIKETHROUGH = !VERSETEXTSTYLES_STRIKETHROUGH;
						break;
				}
				
				let boldrule = VERSETEXTSTYLES_BOLD ? 'bold' : 'normal';
				let italicrule = VERSETEXTSTYLES_ITALIC ? 'italic' : 'normal';
				let decorationrule = '';
				let decorations = [];
				if(VERSETEXTSTYLES_UNDERLINE){ decorations.push('underline'); }
				if(VERSETEXTSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
				if(decorations.length === 0){
					decorationrule = 'none';
				}
				else{
					decorationrule = decorations.join(' ');
				}
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				//if we find the selector and the corresponding rule then we change it
				if( (/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-weight:))(.*?)(;.*)/).test(bbGetDynSS) ){
					bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-weight:))(.*?)(;.*)/,`$1${boldrule}$4`);
				}
				else{ //if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if( (/\.bibleQuote\.results p\.versesParagraph \{/).test(bbGetDynSS) ){
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{)(.*?\})/,`$1font-weight:${boldrule};$2`);
					}
					//otherwise create the rule ex-novo
					else{
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph { font-weight: ${boldrule}; }
						`;
					} 
				}
				//if we find the selector and the corresponding rule then we change it
				if( (/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-style:))(.*?)(;.*)/).test(bbGetDynSS) ){
					bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-style:))(.*?)(;.*)/,`$1${italicrule}$4`);
				}
				else{ //if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if( (/\.bibleQuote\.results p\.versesParagraph \{/).test(bbGetDynSS) ){
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{)(.*?\})/,`$1font-style:${italicrule};$2`);
					}
					//otherwise create the rule ex-novo
					else{
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph { font-style: ${italicrule}; }
						`;
					} 
				}
				//if we find the selector and the corresponding rule then we change it
				if( (/(\.bibleQuote\.results p\.versesParagraph \{(.*?text\-decoration:))(.*?)(;.*)/).test(bbGetDynSS) ){
					bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{(.*?text\-decoration:))(.*?)(;.*)/,`$1${decorationrule}$4`);
				}
				else{ //if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if( (/\.bibleQuote\.results p\.versesParagraph \{/).test(bbGetDynSS) ){
						bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{)(.*?\})/,`$1text-decoration:${decorationrule};$2`);
					}
					//otherwise create the rule ex-novo
					else{
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph { text-decoration: ${decorationrule}; }
						`;
					} 
				}
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				switch(target){
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties['VERSETEXTSTYLES_BOLD'].default = VERSETEXTSTYLES_BOLD;
						setAttributes({ VERSETEXTSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties['VERSETEXTSTYLES_ITALIC'].default = VERSETEXTSTYLES_ITALIC;
						setAttributes({ VERSETEXTSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties['VERSETEXTSTYLES_UNDERLINE'].default = VERSETEXTSTYLES_UNDERLINE;
						setAttributes({ VERSETEXTSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties['VERSETEXTSTYLES_STRIKETHROUGH'].default = VERSETEXTSTYLES_STRIKETHROUGH;
						setAttributes({ VERSETEXTSTYLES_STRIKETHROUGH });
						break;
				}
			}

			function changeVerseTextFontSize(VERSETEXTSTYLES_FONTSIZE){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (attributes.VERSETEXTSTYLES_FONTSIZEUNIT == 'em') ? VERSETEXTSTYLES_FONTSIZE/10 : VERSETEXTSTYLES_FONTSIZE;
				let fontsizerule = (attributes.VERSETEXTSTYLES_FONTSIZEUNIT == 'inherit') ? 'inherit' : fontsize+attributes.VERSETEXTSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['VERSETEXTSTYLES_FONTSIZE'].default = VERSETEXTSTYLES_FONTSIZE;
				setAttributes({ VERSETEXTSTYLES_FONTSIZE });
			}

			function changeVerseTextFontSizeUnit(VERSETEXTSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (VERSETEXTSTYLES_FONTSIZEUNIT == 'em') ? attributes.VERSETEXTSTYLES_FONTSIZE/10 : attributes.VERSETEXTSTYLES_FONTSIZE;
				let fontsizerule = (VERSETEXTSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+VERSETEXTSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				BibleGetGlobal.BGETProperties['VERSETEXTSTYLES_FONTSIZEUNIT'].default = VERSETEXTSTYLES_FONTSIZEUNIT;
				setAttributes({ VERSETEXTSTYLES_FONTSIZEUNIT });
			}

			function changeVerseTextStyleFontColor(color){
				let VERSETEXTSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.versesParagraph \{ color: (?:.*?); \}/, '.bibleQuote.results p\.versesParagraph { color: ' + VERSETEXTSTYLES_TEXTCOLOR + '; }'));
				BibleGetGlobal.BGETProperties['VERSETEXTSTYLES_TEXTCOLOR'].default = VERSETEXTSTYLES_TEXTCOLOR;
				setAttributes({ VERSETEXTSTYLES_TEXTCOLOR });
			}

			function doKeywordSearch(notused){
				
				let keyword = $('.bibleGetSearch input').val().replace(/\W/g, ''), //remove non-word characters from keyword
					$searchresults,
					$searchresultsOrderedByReference;
				if(keyword.length < 3){
					alert(__('You cannot perform a search using less than three letters.','bibleget-io') );
					return false;
				}
				//console.log($('.bibleGetSearch input').val());
				//console.log(attributes.VERSION);
				if(attributes.VERSION.length > 1){
					let dlg = jQuery('<div>', { html: __('You cannot select more than one Bible version when doing a keyword search', 'bibleget-io') }).appendTo('body').dialog({
						close: function(){
							$(this).dialog('destroy').remove();
						},
						dialogClass: 'bibleGetSearchDlg'
					});
					dlg.data("uiDialog")._title = function (title) {
						title.html(this.options.title);
					};
					dlg.dialog('option', 'title', '<span class="dashicons dashicons-warning"></span>' + __('Notice', 'bibleget-io'));
				}
				else if(attributes.VERSION.length === 0){
					let dlg = jQuery('<div>', { html: __('You must select at least one Bible version in order to do a keyword search', 'bibleget-io') }).appendTo('body').dialog({
						close: function () {
							$(this).dialog('destroy').remove();
						},
						dialogClass: 'bibleGetSearchDlg'
					});
					dlg.data("uiDialog")._title = function (title) {
						title.html(this.options.title);
					};
					dlg.dialog('option', 'title', '<span class="dashicons dashicons-warning"></span>' + __('Notice', 'bibleget-io'));
				}
				else{
					//console.log('making ajax call');
					$.ajax({
						type: 'post',
						url: BibleGetGlobal.ajax_url,
						data: { action: 'searchByKeyword', keyword: keyword, version: attributes.VERSION[0] },
						dataType: 'json',
						success: function(response){
							//console.log('successful ajax call, search results:');
							//console.log(results);
							if (response.hasOwnProperty("results") && typeof response.results === 'object') {							
								if(response.results.length === 0){
									/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
									let dlgNoResults = jQuery('<div>', { html: '<h3>'+__('There are no search results for {k} in the version {v}','bibleget-io').formatUnicorn({k:('&lt;'+response.info.keyword+'&gt;'),v:response.info.version}) +'</h3>' }).appendTo('body').dialog({
										close: function () {
											$(this).dialog('destroy').remove();
										},
										dialogClass: 'bibleGetSearchDlg',
										//position: { my: 'center', at: 'center' },
									});
									dlgNoResults.data("uiDialog")._title = function (title) {
										title.html(this.options.title);
									};
									dlgNoResults.dialog('option', 'title', '<span class="dashicons dashicons-warning"></span>' + __('Search results', 'bibleget-io'));
									
								}
								else{
									let BOOK = __('BOOK', 'bibleget-io'),
										CHAPTER = __('CHAPTER', 'bibleget-io'),
										VERSE = __('VERSE', 'bibleget-io'),
										VERSETEXT = __('VERSE TEXT', 'bibleget-io'),
										ACTION = __('ACTION','bibleget-io'),
										FILTER_BY_KEYWORD = __('Filter by keyword','bibleget-io'),
										$searchresults = response,
										$searchresultsOrderedByReference = JSON.parse(JSON.stringify(response)),
										/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
										numResultsStr = response.results.length === 1 ? __('There is {n} result for the keyword {k} in the version {v}','bibleget-io').formatUnicorn({n: '<b>'+response.results.length+'</b>',k: '<b>'+response.info.keyword+'</b>',v: '<b>'+response.info.version+'</b>'}) : __('There are {n} results for the keyword {k} in the version {v}.', 'bibleget-io').formatUnicorn({n: '<b>'+response.results.length+'</b>',k: '<b>'+response.info.keyword+'</b>',v: '<b>'+response.info.version+'</b>'});
										$searchresultsOrderedByReference.results.sort(function(a,b){ return a.booknum - b.booknum; });
									let searchResultsHtmlMarkup = `
								    <div id="searchResultsContainer"> <!-- this is our flex container -->
								      <div id="searchResultsControlPanel" class="searchResultsFlexChild">
								        <div class="controlComponent">
								          <label>${FILTER_BY_KEYWORD}<input type="text" id="keywordFilter" /></label>
								          <button id="APPLY_FILTER"><i class="fa fa-filter" aria-hidden="true"></i><span class="label">${__('Apply filter','bibleget-io')}</span></button>
								        </div>
								        <div class="controlComponent">
								          <button id="ORDER_RESULTS_BY"><i class="fa fa-sort" aria-hidden="true"></i><span class="label">${__('Order results by reference','bibleget-io')}</span></button>
								        </div>
								      </div>
								      <div id="searchResultsContents" class="searchResultsFlexChild">
										<div id="searchResultsInfo" style="font-weight:normal;">${numResultsStr}</div>
										<div id="bibleGetSearchResultsTableContainer">
											<table border="0" cellpadding="0" cellspacing="0" width="100%" class="scrollTable" id="SearchResultsTable">
												<thead class="fixedHeader">
													<tr class="alternateRow"><th>${ACTION}</th><th>${BOOK} ${CHAPTER} ${VERSE}</th><th>${VERSETEXT}</th></tr>
												</thead>
												<tbody class="scrollContent">
												</tbody>
											</table>
										</div> <!-- End tableContainer -->
								      </div> <!-- END searchResultsContents  -->
								    </div> <!-- END searchResultsContainer  -->`;
									let $quotesArr,
										dlg = jQuery('<div>', { html: searchResultsHtmlMarkup }).appendTo('body').dialog({
											open: function(){
												$quotesArr = $('.block-editor-block-inspector .bibleGetQuery').find('input').val().split(';');
												let bookChapterVerse,
													enabledState;
												for (let $result of response.results) {
													bookChapterVerse = BibleGetGlobal.biblebooks.fullname[parseInt($result.univbooknum) - 1].split('|')[0] + ' ' + $result.chapter + ':' + $result.verse;
													enabledState = $quotesArr.includes(bookChapterVerse) ? ' disabled' : '';
													jQuery("#SearchResultsTable tbody").append('<tr><td><button'+enabledState+'><i class="fa fa-plus" aria-hidden="true"></i>'+__('Insert','bibleget-io')+'</button><input type="hidden" class="searchResultJSON" value="'+encodeURIComponent(JSON.stringify($result))+'" /></td><td>' + bookChapterVerse + '</td><td>' + addMark($result.text, response.info.keyword) + '</td></tr>');
												}
												$('#searchResultsContainer').on('click','button',function(){
									              //First check the context of the button that was clicked: control panel or searchResultsContents
									              let $filterLabel,
									                  $orderbyLabel,
									                  $keywordFilter,
									                  $ORDER_BY,
									                  $FILTER_BY,
									                  REFRESH = false;
									              switch($(this).parents('.searchResultsFlexChild').attr('id')){
									                case 'searchResultsControlPanel':
									                  $orderbyLabel = $('#ORDER_RESULTS_BY').find('span.label');
									                  if($orderbyLabel.text() == __('Order results by reference','bibleget-io') ){
									                    $ORDER_BY = 'importance';
									                  }
									                  else if($orderbyLabel.text() == __('Order results by importance','bibleget-io') ){
									                    $ORDER_BY = 'reference';
									                  }
									                  
									                  $filterLabel = $('#APPLY_FILTER').find('span.label');
									                  $keywordFilter = $('#keywordFilter').val() !== '' && $('#keywordFilter').val().length > 2 ? $('#keywordFilter').val() : '';
									                  
									                  switch( $(this).attr('id') ){
									                    case 'ORDER_RESULTS_BY':
									                      REFRESH = true;
									                      if( $orderbyLabel.text() == __('Order results by reference','bibleget-io') ){
									                        $ORDER_BY = 'reference';
									                        $orderbyLabel.text(__('Order results by importance','bibleget-io'));
									                      }
									                      else{
									                        $ORDER_BY = 'importance';
									                        $orderbyLabel.text(__('Order results by reference','bibleget-io'));
									                      }
									                    break;
									                    case 'APPLY_FILTER':
									                      
									                      if($filterLabel.text() == __('Apply filter','bibleget-io') ){
									                        if($keywordFilter != '' && $keywordFilter.length > 2){
									                          REFRESH = true;
									                          $filterLabel.text(__('Remove filter','bibleget-io'));
									                          $('#keywordFilter').prop('readonly',true);
									                        }
									                        else{
									                          if($keywordFilter == ''){ alert('Cannot filter by an empty string!'); }
									                          else if($keywordFilter.length < 3){ alert('Keyword must be at least three characters long'); }
									                        }
									                      }
									                      else{
									                        $('#keywordFilter').val('');
									                        $keywordFilter = '';
									                        REFRESH = true;
									                        $filterLabel.text(__('Apply filter','bibleget-io'));
									                        $('#keywordFilter').prop('readonly',false);
									                      }
									                    break;
									                  }
									                  
									                  if(REFRESH){ refreshTable({ORDER_BY: $ORDER_BY,FILTER_BY: $keywordFilter},$searchresults,$searchresultsOrderedByReference); }
									                  
									                break;
									                case 'searchResultsContents':
									                  //alert('button was clicked! it is in the context of the searchResultsContents');
									                  //alert($(this).next().prop('tagName') );
									                  if($(this).next('input[type=hidden]').length != 0){
									                    //showSpinner();
														let currentRef = $(this).parent('td').next('td').text();
														if($quotesArr.includes(bookChapterVerse) === false){ 
															$(this).addClass('disabled').prop('disabled',true);
															let $inputval = $(this).next('input[type=hidden]').val();
															let $resultsStr = decodeURIComponent($inputval);
															//alert($resultsStr);
															let $result = JSON.parse($resultsStr);
															let $resultsObj = {};
															$resultsObj.results = [$result];
															$resultsObj.errors = $searchresults.errors;
															$resultsObj.info = $searchresults.info;
															$quotesArr.push(currentRef); 
															$('.block-editor-block-inspector .bibleGetQuery').find('input').val($quotesArr.join(';'));
															changeQuery($quotesArr.join(';'));
														}
									                  }
									                  else{
									                    alert('could not select next hidden input');
									                  }
									                break;
									              }
													
												});
											},
											close: function () {
												$('#searchResultsContainer').off('click');
												$(this).dialog('destroy').remove();
											},
											dialogClass: 'bibleGetSearchDlg',
											position: {my:'center top',at:'center top'},
											width: '80%'//,
										});
										dlg.data("uiDialog")._title = function (title) {
											title.html(this.options.title);
										};
										dlg.dialog('option', 'title', '<span class="dashicons dashicons-code-standards"></span>' + __('Search results', 'bibleget-io'));
								}
							}
						},
						error: function (jqXHR, textStatus, errorThrown ){
							console.log('there has been an error: '+textStatus+' :: '+errorThrown);
						}
					});
				}
			}

          function refreshTable(options,$searchresults,$searchresultsOrderedByReference){
            let counter = 0,
				enabledState,
				bookChapterVerse,
				$quotesArr = $('.block-editor-block-inspector .bibleGetQuery').find('input').val().split(';');
            jQuery("#SearchResultsTable tbody").empty();
            switch(options.ORDER_BY){
              case 'importance':
                for(let $result of $searchresults.results){
                  bookChapterVerse = BibleGetGlobal.biblebooks.fullname[parseInt($result.univbooknum) - 1].split('|')[0]+' '+$result.chapter+':'+$result.verse;
				  enabledState = $quotesArr.includes(bookChapterVerse) ? ' disabled' : '';
				  if(options.FILTER_BY == ''){
                    jQuery("#SearchResultsTable tbody").append('<tr><td><button'+enabledState+'><i class="fa fa-plus" aria-hidden="true"></i>'+__('Insert','bibleget-io')+'</button><input type="hidden" class="searchResultJSON" value="'+encodeURIComponent(JSON.stringify($result))+'" /></td><td>'+bookChapterVerse+'</td><td>'+addMark($result.text,$searchresults.info.keyword)+'</td></tr>');
                  }
                  else{
                    let $filter = new RegExp(options.FILTER_BY,"i");
                    if( $filter.test($result.text) ){
                      jQuery("#SearchResultsTable tbody").append('<tr><td><button'+enabledState+'><i class="fa fa-plus" aria-hidden="true"></i>'+__('Insert','bibleget-io')+'</button><input type="hidden" class="searchResultJSON" value="'+encodeURIComponent(JSON.stringify($result))+'" /></td><td>'+bookChapterVerse+'</td><td>'+addMark($result.text,[$searchresults.info.keyword,options.FILTER_BY])+'</td></tr>');
                      ++counter;
                    }
                  }
                }
                break;
              case 'reference':
                for(let $result of $searchresultsOrderedByReference.results){
                  bookChapterVerse = BibleGetGlobal.biblebooks.fullname[parseInt($result.univbooknum) - 1].split('|')[0]+' '+$result.chapter+':'+$result.verse;
				  enabledState = $quotesArr.includes(bookChapterVerse) ? ' disabled' : '';
                  if(options.FILTER_BY == ''){
                    jQuery("#SearchResultsTable tbody").append('<tr><td><button'+enabledState+'><i class="fa fa-plus" aria-hidden="true"></i>'+__('Insert','bibleget-io')+'</button><input type="hidden" class="searchResultJSON" value="'+encodeURIComponent(JSON.stringify($result))+'" /></td><td>'+bookChapterVerse+'</td><td>'+addMark($result.text,$searchresults.info.keyword)+'</td></tr>');
                  }
                  else{
                    let $filter = new RegExp(options.FILTER_BY,"i");
                    if( $filter.test($result.text) ){
                      jQuery("#SearchResultsTable tbody").append('<tr><td><button'+enabledState+'><i class="fa fa-plus" aria-hidden="true"></i>'+__('Insert','bibleget-io')+'</button><input type="hidden" class="searchResultJSON" value="'+encodeURIComponent(JSON.stringify($result))+'" /></td><td>'+bookChapterVerse+'</td><td>'+addMark($result.text,[$searchresults.info.keyword,options.FILTER_BY])+'</td></tr>');
                      ++counter;
                    }
                  }
                }
                break;
            }
            if(options.FILTER_BY == ''){
              if($searchresults.results.length === 1){
                /* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
				numResultsStr = __('There is {n} result for the keyword {k} in the version {v}.','bibleget-io');
              }
              else{
                /* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
				numResultsStr = __('There are {n} results for the keyword {k} in the version {v}.','bibleget-io');
              }
              jQuery('#searchResultsInfo').html(numResultsStr.formatUnicorn({n:'<b>'+$searchresults.results.length+'</b>',k:'<b>'+$searchresults.info.keyword+'</b>',v:'<b>'+$searchresults.info.version+'</b>'}));
            }
            else{
              if(counter == 1){
                /* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
				numResultsStr = __('There is {n} result for the keyword {k} filtered by {f} in the version {v}.','bibleget-io');
              }
              else if(counter > 1){
                /* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
				numResultsStr = __('There are {n} results for the keyword {k} filtered by {f} in the version {v}.','bibleget-io');
              }
              jQuery('#searchResultsInfo').html(numResultsStr.formatUnicorn({n:'<b>'+counter+'</b>',k:'<b>'+$searchresults.info.keyword+'</b>',f:'<b>'+options.FILTER_BY+'</b>',v:'<b>'+$searchresults.info.version+'</b>'}));
            }
          }


			function doNothing(value){
				//do nothing
			}

			var bibleVersionsSelectOptions = [];
			for (let [prop, val] of Object.entries(BibleGetGlobal.versionsByLang.versions)) {
				for (let [prop1, val1] of Object.entries(val)) {
					let newOption = { value: prop1, label: prop1 + ' - ' + val1.fullname + ' (' + val1.year + ')' };
					bibleVersionsSelectOptions.push(newOption);
				}
			}
			return createElement('div', {}, [
				//Preview a block with a PHP render callback
				createElement(ServerSideRender, {
					block: 'bibleget/bible-quote',
					attributes: attributes
				}),
				createElement(Fragment, {},
					createElement(InspectorControls, {},
						createElement(PanelBody, { title: __('Get Bible quote', 'bibleget-io'), initialOpen: true, icon: 'download' },
							createElement(PanelRow, {},
								//Select version to quote from
								createElement(SelectControl, {
									value: attributes.VERSION,
									label: __('Bible Version', 'bibleget-io'),
									onChange: changeVersion,
									multiple: true,
									options: bibleVersionsSelectOptions,
									help: __('You can select more than one Bible version by holding down CTRL while clicking. Likewise you can remove a single Bible version from a multiple selection by holding down CTRL while clicking.', 'bibleget-io')
								})
							),
							createElement(PanelRow, {},
								//A simple text control for bible quote query
								createElement(TextControl, {
									value: attributes.QUERY,
									
									help: __('Type the desired Bible quote using the standard notation for Bible citations. You can chain multiple quotes together with semicolons.', 'bibleget-io'),//  .formatUnicorn({ href:'https://en.wikipedia.org/wiki/Bible_citation'}),    <a href="{href}">
									label: __('Bible Reference', 'bibleget-io'), 
									className: 'bibleGetQuery',
									onChange: changeQuery,
								})
							),
							createElement(PanelRow, {},
								//Select whether this will be a popup or not
								createElement(ToggleControl, {
									checked: attributes.POPUP,
									label: __('Display in Popup', 'bibleget-io'),
									help: __('When activated, only the reference to the Bible quote will be shown in the document, and clicking on it will show the text of the Bible quote in a popup window.','bibleget-io'),
									onChange: changePopup,
								})
							),
							createElement(PanelRow, {},
								//A simple text control for bible quote search
								createElement(TextControl, {
									type: 'text',
									//value: '',
									placeholder: __('e.g. Creation', 'bibleget-io'),
									help: __('You cannot choose more than one Bible version when searching by keyword.', 'bibleget-io'),//  .formatUnicorn({ href:'https://en.wikipedia.org/wiki/Bible_citation'}),    <a href="{href}">
									label: __('Search for Bible quotes by keyword', 'bibleget-io'),
									className: 'bibleGetSearch',
									onChange: doNothing
								}),
								createElement(Button, {
									icon: 'search',
									isPrimary: true,
									onClick: doKeywordSearch,
									className: 'bibleGetSearchBtn'
								})
							)
						),
						createElement(PanelBody, { title: __('Layout Bible version', 'bibleget-io'), initialOpen: false, icon: 'layout' },
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: attributes.LAYOUTPREFS_SHOWBIBLEVERSION, //default BGET.VISIBILITY.SHOW
									label: __('Show Bible version','bibleget-io'),
									onChange: changeBibleVersionVisibility,
								})
							),
							createElement(PanelRow, {}, 
								createElement(BaseControl, { label: __('Bible version alignment', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetButtonGroup' },
										createElement(Button, {
											icon: 'editor-alignleft',
											value: BGET.ALIGN.LEFT,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT === BGET.ALIGN.LEFT),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT !== BGET.ALIGN.LEFT),
											onClick: changeBibleVersionAlign,
											title: __('Bible Version align left', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-aligncenter',
											value: BGET.ALIGN.CENTER,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT === BGET.ALIGN.CENTER),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT !== BGET.ALIGN.CENTER),
											onClick: changeBibleVersionAlign,
											title: __('Bible Version align center', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-alignright',
											value: BGET.ALIGN.RIGHT,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT === BGET.ALIGN.RIGHT),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT !== BGET.ALIGN.RIGHT),
											onClick: changeBibleVersionAlign,
											title: __('Bible Version align right', 'bibleget-io')
										})
									)								
								)
							),
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Bible version position', 'bibleget-io'), help: __('Position the Bible version above or below the quotes from that version', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetButtonGroup' },
										createElement(Button, {
											icon: 'arrow-up-alt',
											value: BGET.POS.TOP,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION === BGET.POS.TOP),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION !== BGET.POS.TOP),
											onClick: changeBibleVersionPos,
											title: __('Bible Version position top', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'arrow-down-alt',
											value: BGET.POS.BOTTOM,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION === BGET.POS.BOTTOM),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION !== BGET.POS.BOTTOM),
											onClick: changeBibleVersionPos,
											title: __('Bible Version position bottom', 'bibleget-io')
										})
									)
								)
							),
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Bible version wrap', 'bibleget-io'), help: __('Wrap the Bible version in parentheses or brackets', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetButtonGroup' },
										createElement(Button, {
											//label: __('none','bibleget-io'),
											value: BGET.WRAP.NONE,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONWRAP === BGET.WRAP.NONE),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONWRAP !== BGET.WRAP.NONE),
											onClick: changeBibleVersionWrap,
											title: __('Wrap none', 'bibleget-io')
										}, __('none', 'bibleget-io')),
										createElement(Button, {
											//label: __('parentheses', 'bibleget-io'),
											value: BGET.WRAP.PARENTHESES,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONWRAP === BGET.WRAP.PARENTHESES),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONWRAP !== BGET.WRAP.PARENTHESES),
											onClick: changeBibleVersionWrap,
											title: __('Wrap in parentheses', 'bibleget-io')
										}, __('parentheses', 'bibleget-io')),
										createElement(Button, {
											//label: __('brackets', 'bibleget-io'),
											value: BGET.WRAP.BRACKETS,
											isPrimary: (attributes.LAYOUTPREFS_BIBLEVERSIONWRAP === BGET.WRAP.BRACKETS),
											isSecondary: (attributes.LAYOUTPREFS_BIBLEVERSIONWRAP !== BGET.WRAP.BRACKETS),
											onClick: changeBibleVersionWrap,
											title: __('Wrap in brackets', 'bibleget-io')
										}, __('brackets', 'bibleget-io')),
									)
								)
							)
						),
						createElement(PanelBody, { title: __('Layout Book / Chapter', 'bibleget-io'), initialOpen: false, icon: 'layout' },
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Book / Chapter alignment', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetButtonGroup' },
										createElement(Button, {
											icon: 'editor-alignleft',
											value: BGET.ALIGN.LEFT,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT === BGET.ALIGN.LEFT),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT !== BGET.ALIGN.LEFT),
											onClick: changeBookChapterAlign,
											title: __('Book / Chapter align left', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-aligncenter',
											value: BGET.ALIGN.CENTER,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT === BGET.ALIGN.CENTER),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT !== BGET.ALIGN.CENTER),
											onClick: changeBookChapterAlign,
											title: __('Book / Chapter align center', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-alignright',
											value: BGET.ALIGN.RIGHT,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT === BGET.ALIGN.RIGHT),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT !== BGET.ALIGN.RIGHT),
											onClick: changeBookChapterAlign,
											title: __('Book / Chapter align right', 'bibleget-io')
										})
									)
								)
							),
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Book / Chapter position', 'bibleget-io'), help: __('Position the book and chapter above or below each quote, or inline with the quote', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetButtonGroup' },
										createElement(Button, {
											icon: 'arrow-up-alt',
											value: BGET.POS.TOP,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION === BGET.POS.TOP),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION !== BGET.POS.TOP),
											onClick: changeBookChapterPos,
											title: __('Book / Chapter position top', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'arrow-down-alt',
											value: BGET.POS.BOTTOM,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION === BGET.POS.BOTTOM),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION !== BGET.POS.BOTTOM),
											onClick: changeBookChapterPos,
											title: __('Book / Chapter position bottom', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'arrow-left-alt',
											value: BGET.POS.BOTTOMINLINE,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION === BGET.POS.BOTTOMINLINE),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION !== BGET.POS.BOTTOMINLINE),
											onClick: changeBookChapterPos,
											title: __('Book / Chapter position bottom inline', 'bibleget-io')
										})
									)
								)
							),
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Book / Chapter wrap', 'bibleget-io'), help: __('Wrap the book and chapter with parentheses or brackets', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetButtonGroup' },
										createElement(Button, {
											value: BGET.WRAP.NONE,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERWRAP === BGET.WRAP.NONE),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERWRAP !== BGET.WRAP.NONE),
											onClick: changeBookChapterWrap,
											title: __('Book / Chapter wrap none', 'bibleget-io')
										}, __('none', 'bibleget-io')),
										createElement(Button, {
											value: BGET.WRAP.PARENTHESES,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERWRAP === BGET.WRAP.PARENTHESES),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERWRAP !== BGET.WRAP.PARENTHESES),
											onClick: changeBookChapterWrap,
											title: __('Book / Chapter wrap parentheses', 'bibleget-io')
										}, __('parentheses', 'bibleget-io')),
										createElement(Button, {
											value: BGET.WRAP.BRACKETS,
											isPrimary: (attributes.LAYOUTPREFS_BOOKCHAPTERWRAP === BGET.WRAP.BRACKETS),
											isSecondary: (attributes.LAYOUTPREFS_BOOKCHAPTERWRAP !== BGET.WRAP.BRACKETS),
											onClick: changeBookChapterWrap,
											title: __('Book / Chapter wrap brackets', 'bibleget-io')
										}, __('brackets', 'bibleget-io')),
									)
								)
							),
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: attributes.LAYOUTPREFS_BOOKCHAPTERFULLQUERY, //default false
									label: __('Show full reference', 'bibleget-io'),
									help: __('When activated, the full reference including verses quoted will be shown with the book and chapter','bibleget-io'),
									onChange: changeShowFullReference,
								})
							),
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: (attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANGABBREV || attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.BIBLELANGABBREV), //default false
									label: __('Use book abbreviation', 'bibleget-io'),
									help: __('When activated, the book names will be shown in the abbreviated form', 'bibleget-io'),
									onChange: changeUseBookAbbreviation,
								})
							),
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: (attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANG || attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===  BGET.FORMAT.USERLANGABBREV), //default false
									label: __('Use WP language','bibleget-io'),
									help: __('By default the book names are in the language of the Bible version being quoted. If activated, book names will be shown in the language of the WordPress interface','bibleget-io'),
									onChange: changeBookNameUseWpLang
								})
							)
						),
						createElement(PanelBody, { title: __('Layout Verses', 'bibleget-io'), initialOpen: false, icon: 'layout' },
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: attributes.LAYOUTPREFS_SHOWVERSENUMBERS, //default true
									label: __('Show verse number', 'bibleget-io'),
									onChange: changeVerseNumberVisibility,
								})
							)							
						),
						createElement(PanelBody, { title: __('General styles', 'bibleget-io'), initialOpen: false, icon: 'admin-appearance' },
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_BORDERWIDTH,
								label: __('Border width', 'bibleget-io'),
								min: 0,
								max: 10,
								onChange: changeParagraphStyleBorderWidth
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_BORDERRADIUS,
								label: __('Border radius', 'bibleget-io'),
								min: 0,
								max: 20,
								onChange: changeParagraphStyleBorderRadius
							}),
							createElement(SelectControl, {
								value: attributes.PARAGRAPHSTYLES_BORDERSTYLE,
								label: __('Border style', 'bibleget-io'),
								onChange: changeParagraphStyleBorderStyle,
								options: Object.keys(BGET.BORDERSTYLE).sort(function(a,b){return BGET.BORDERSTYLE[a]-BGET.BORDERSTYLE[b]}).map(
									function(el){
										return { value: BGET.BORDERSTYLE[el], label: BGET.CSSRULE.BORDERSTYLE[BGET.BORDERSTYLE[el]] }
									}
								)
								/** the above is an automated way of producing the following result:
								[
									{value: BGET.BORDERSTYLE.NONE, 		label: 'none' },
									{value: BGET.BORDERSTYLE.SOLID, 	label: 'solid' },
									{value: BGET.BORDERSTYLE.DOTTED, 	label: 'dotted' },
									{value: BGET.BORDERSTYLE.DASHED, 	label: 'dashed' },
									{value: BGET.BORDERSTYLE.DOUBLE, 	label: 'double' },
									{value: BGET.BORDERSTYLE.GROOVE, 	label: 'groove' },
									{value: BGET.BORDERSTYLE.RIDGE, 	label: 'ridge' },
									{value: BGET.BORDERSTYLE.INSET,		label: 'inset' },
									{value: BGET.BORDERSTYLE.OUTSET, 	label: 'outset' }
								] 
								* Being automated means being able to control consistency. 
								* Any change to the source ENUMS in PHP will be reflected here automatically, no manual intervention required
								*/ 
							}),
							createElement(PanelBody, { title: __('Border color','bibleget-io'), initialOpen: false, icon: colorizeIco },
								createElement(ColorPicker, {
									color: attributes.PARAGRAPHSTYLES_BORDERCOLOR,
									disableAlpha: false,
									onChangeComplete: changeParagraphStyleBorderColor
								})
							),
							createElement(PanelBody, { title: __('Background color','bibleget-io'), initialOpen: false, icon: colorizeIco },
								createElement(ColorPicker, {
									color: attributes.PARAGRAPHSTYLES_BACKGROUNDCOLOR,
									disableAlpha: false,
									onChangeComplete: changeParagraphStyleBackgroundColor
								})
							),
							createElement(SelectControl, {
								value: attributes.PARAGRAPHSTYLES_LINEHEIGHT,
								label: __('Line height', 'bibleget-io'),
								options: [
									/* translators: context is label for line-height select option */
									{ value: 1.0, label: __('single','bibleget-io') },
									{ value: 1.15, label: '1.15' },
									{ value: 1.5, label: '1.5' },
									/* translators: context is label for line-height select option */
									{ value: 2.0, label: __('double','bibleget-io') },
								],
								onChange: changeParagraphStyleLineHeight
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_WIDTH,
								label: __('Width on the page', 'bibleget-io') + ' (%)',
								min: 0,
								max: 100,
								onChange: changeParagraphStyleWidth
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINTOPBOTTOM,
								label: __('Margin top / bottom', 'bibleget-io'),
								min: 0,
								max: 30,
								onChange: changeParagraphStyleMarginTopBottom
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHT,
								label: __('Margin left / right', 'bibleget-io'),
								min: 0,
								max: 30,
								disabled: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT === 'auto',
								className: 'PARAGRAPHSTYLES_MARGINLEFTRIGHT',
								onChange: changeParagraphStyleMarginLeftRight
							}),
							createElement(SelectControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT,
								label: __('Margin left / right unit','bibleget-io'),
								options: [
									{ value: 'px', label: 'px' },
									{ value: '%', label: '%' },
									{ value: 'auto', label: 'auto' }
								],
								onChange: changeParagraphStyleMarginLeftRightUnit,
								help: __('When set to "auto" the Bible quote will be centered on the page and the numerical value will be ignored','bibleget-io')
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_PADDINGTOPBOTTOM,
								label: __('Top / bottom padding', 'bibleget-io'),
								min: 0,
								max: 20,
								onChange: changeParagraphStylePaddingTopBottom
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_PADDINGLEFTRIGHT,
								label: __('Left / right padding', 'bibleget-io'),
								min: 0,
								max: 20,
								onChange: changeParagraphStylePaddingLeftRight
							}),
						),
						createElement(PanelBody, { title: __('Bible version styles', 'bibleget-io'), initialOpen: false, icon: 'admin-appearance', className: 'bibleGetInspectorControls' },
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Text style', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetTextStyleButtonGroup' },
										createElement(Button, {
											value: BGET.TEXTSTYLE.BOLD,
											isPrimary: attributes.VERSIONSTYLES_BOLD,
											isSecondary: !attributes.VERSIONSTYLES_BOLD,
											onClick: changeBibleVersionTextStyle,
											title: __('Font style bold', 'bibleget-io'),
											className: 'bold'
										}, __('B','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.ITALIC,
											isPrimary: (attributes.VERSIONSTYLES_ITALIC === true),
											isSecondary: (attributes.VERSIONSTYLES_ITALIC !== true),
											onClick: changeBibleVersionTextStyle,
											title: __('Font style italic', 'bibleget-io'),
											className: 'italic'
										}, __('I','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.UNDERLINE,
											isPrimary: (attributes.VERSIONSTYLES_UNDERLINE === true),
											isSecondary: (attributes.VERSIONSTYLES_UNDERLINE !== true),
											onClick: changeBibleVersionTextStyle,
											title: __('Font style underline', 'bibleget-io'),
											className: 'underline'
										}, __('U','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.STRIKETHROUGH,
											isPrimary: (attributes.VERSIONSTYLES_STRIKETHROUGH === true),
											isSecondary: (attributes.VERSIONSTYLES_STRIKETHROUGH !== true),
											onClick: changeBibleVersionTextStyle,
											title: __('Font style strikethrough', 'bibleget-io'),
											className: 'strikethrough'
										}, __('S','bibleget-io') )
									)								
								)
							),
							createElement(RangeControl, {
								value: attributes.VERSIONSTYLES_FONTSIZE,
								label: __('Font size', 'bibleget-io'),
								min: 0,
								max: 30,
								disabled: attributes.VERSIONSTYLES_FONTSIZEUNIT === 'inherit',
								//className: 'VERSIONSTYLES_FONTSIZEUNIT',
								onChange: changeBibleVersionFontSize
							}),
							createElement(SelectControl, {
								value: attributes.VERSIONSTYLES_FONTSIZEUNIT,
								label: __('Font size unit','bibleget-io'),
								options: [
									{ value: 'px', label: 'px' },
									{ value: 'em', label: 'em' },
									{ value: 'pt', label: 'pt' },
									{ value: 'inherit', label: 'inherit' }
								],
								onChange: changeBibleVersionFontSizeUnit,
								help: __('When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)','bibleget-io')
							}),
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: colorizeIco },
								createElement(ColorPicker, {
									color: attributes.VERSIONSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeBibleVersionStyleFontColor
								})
							),
						),
						createElement(PanelBody, { title: __('Book / Chapter styles', 'bibleget-io'), initialOpen: false, icon: 'admin-appearance' },
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Text style', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetTextStyleButtonGroup' },
										createElement(Button, {
											value: BGET.TEXTSTYLE.BOLD,
											isPrimary: attributes.BOOKCHAPTERSTYLES_BOLD,
											isSecondary: !attributes.BOOKCHAPTERSTYLES_BOLD,
											onClick: changeBookChapterTextStyle,
											title: __('Font style bold', 'bibleget-io'),
											className: 'bold'
										}, __('B','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.ITALIC,
											isPrimary: (attributes.BOOKCHAPTERSTYLES_ITALIC === true),
											isSecondary: (attributes.BOOKCHAPTERSTYLES_ITALIC !== true),
											onClick: changeBookChapterTextStyle,
											title: __('Font style italic', 'bibleget-io'),
											className: 'italic'
										}, __('I','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.UNDERLINE,
											isPrimary: (attributes.BOOKCHAPTERSTYLES_UNDERLINE === true),
											isSecondary: (attributes.BOOKCHAPTERSTYLES_UNDERLINE !== true),
											onClick: changeBookChapterTextStyle,
											title: __('Font style underline', 'bibleget-io'),
											className: 'underline'
										}, __('U','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.STRIKETHROUGH,
											isPrimary: (attributes.BOOKCHAPTERSTYLES_STRIKETHROUGH === true),
											isSecondary: (attributes.BOOKCHAPTERSTYLES_STRIKETHROUGH !== true),
											onClick: changeBookChapterTextStyle,
											title: __('Font style strikethrough', 'bibleget-io'),
											className: 'strikethrough'
										}, __('S','bibleget-io') )
									)								
								)
							),
							createElement(RangeControl, {
								value: attributes.BOOKCHAPTERSTYLES_FONTSIZE,
								label: __('Font size', 'bibleget-io'),
								min: 0,
								max: 30,
								disabled: attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT === 'inherit',
								//className: 'BOOKCHAPTERSTYLES_FONTSIZEUNIT',
								onChange: changeBookChapterFontSize
							}),
							createElement(SelectControl, {
								value: attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT,
								label: __('Font size unit','bibleget-io'),
								options: [
									{ value: 'px', label: 'px' },
									{ value: 'em', label: 'em' },
									{ value: 'pt', label: 'pt' },
									{ value: 'inherit', label: 'inherit' }
								],
								onChange: changeBookChapterFontSizeUnit,
								help: __('When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)','bibleget-io')
							}),
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: colorizeIco },
								createElement(ColorPicker, {
									color: attributes.BOOKCHAPTERSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeBookChapterStyleFontColor
								})
							),
						),
						createElement(PanelBody, { title: __('Verse number styles', 'bibleget-io'), initialOpen: false, icon: 'admin-appearance' },
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Text style', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetTextStyleButtonGroup verseNumberStyles' },
										createElement(Button, {
											value: BGET.TEXTSTYLE.BOLD,
											isPrimary: attributes.VERSENUMBERSTYLES_BOLD,
											isSecondary: !attributes.VERSENUMBERSTYLES_BOLD,
											onClick: changeVerseNumberTextStyle,
											title: __('Font style bold', 'bibleget-io'),
											className: 'bold'
										}, __('B','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.ITALIC,
											isPrimary: (attributes.VERSENUMBERSTYLES_ITALIC === true),
											isSecondary: (attributes.VERSENUMBERSTYLES_ITALIC !== true),
											onClick: changeVerseNumberTextStyle,
											title: __('Font style italic', 'bibleget-io'),
											className: 'italic'
										}, __('I','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.UNDERLINE,
											isPrimary: (attributes.VERSENUMBERSTYLES_UNDERLINE === true),
											isSecondary: (attributes.VERSENUMBERSTYLES_UNDERLINE !== true),
											onClick: changeVerseNumberTextStyle,
											title: __('Font style underline', 'bibleget-io'),
											className: 'underline'
										}, __('U','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.STRIKETHROUGH,
											isPrimary: (attributes.VERSENUMBERSTYLES_STRIKETHROUGH === true),
											isSecondary: (attributes.VERSENUMBERSTYLES_STRIKETHROUGH !== true),
											onClick: changeVerseNumberTextStyle,
											title: __('Font style strikethrough', 'bibleget-io'),
											className: 'strikethrough'
										}, __('S','bibleget-io') )
									),
									createElement(ButtonGroup, { className: 'bibleGetTextStyleButtonGroup verseNumberStyles' },
										createElement(Button, {
											value: BGET.VALIGN.NORMAL,
											isPrimary: (attributes.VERSENUMBERSTYLES_VALIGN === BGET.VALIGN.NORMAL),
											isSecondary: (attributes.VERSENUMBERSTYLES_VALIGN !== BGET.VALIGN.NORMAL),
											onClick: changeVerseNumberValign,
											title: __('Normal','bibleget-io'),
											className: 'valign-normal'
										}, 'A' ),
										createElement(Button, {
											value: BGET.VALIGN.SUPERSCRIPT,
											isPrimary: (attributes.VERSENUMBERSTYLES_VALIGN === BGET.VALIGN.SUPERSCRIPT),
											isSecondary: (attributes.VERSENUMBERSTYLES_VALIGN !== BGET.VALIGN.SUPERSCRIPT),
											onClick: changeVerseNumberValign,
											title: __('Superscript','bibleget-io'),
											className: 'valign-superscript'
										}, 'A²' ),
										createElement(Button, {
											value: BGET.VALIGN.SUBSCRIPT,
											isPrimary: (attributes.VERSENUMBERSTYLES_VALIGN === BGET.VALIGN.SUBSCRIPT),
											isSecondary: (attributes.VERSENUMBERSTYLES_VALIGN !== BGET.VALIGN.SUBSCRIPT),
											onClick: changeVerseNumberValign,
											title: __('Subscript','bibleget-io'),
											className: 'valign-subscript'
										}, 'A₂' )
									),
							)
							),
							createElement(RangeControl, {
								value: attributes.VERSENUMBERSTYLES_FONTSIZE,
								label: __('Font size', 'bibleget-io'),
								min: 0,
								max: 30,
								disabled: attributes.VERSENUMBERSTYLES_FONTSIZEUNIT === 'inherit',
								//className: 'VERSENUMBERSTYLES_FONTSIZEUNIT',
								onChange: changeVerseNumberFontSize
							}),
							createElement(SelectControl, {
								value: attributes.VERSENUMBERSTYLES_FONTSIZEUNIT,
								label: __('Font size unit','bibleget-io'),
								options: [
									{ value: 'px', label: 'px' },
									{ value: 'em', label: 'em' },
									{ value: 'pt', label: 'pt' },
									{ value: 'inherit', label: 'inherit' }
								],
								onChange: changeVerseNumberFontSizeUnit,
								help: __('When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)','bibleget-io')
							}),
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: colorizeIco },
								createElement(ColorPicker, {
									color: attributes.VERSENUMBERSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeVerseNumberStyleFontColor
								})
							),
						),
						createElement(PanelBody, { title: __('Verse text styles', 'bibleget-io'), initialOpen: false, icon: 'admin-appearance' },
							createElement(PanelRow, {},
								createElement(BaseControl, { label: __('Text style', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetTextStyleButtonGroup' },
										createElement(Button, {
											value: BGET.TEXTSTYLE.BOLD,
											isPrimary: attributes.VERSETEXTSTYLES_BOLD,
											isSecondary: !attributes.VERSETEXTSTYLES_BOLD,
											onClick: changeVerseTextTextStyle,
											title: __('Font style bold', 'bibleget-io'),
											className: 'bold'
										}, __('B','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.ITALIC,
											isPrimary: (attributes.VERSETEXTSTYLES_ITALIC === true),
											isSecondary: (attributes.VERSETEXTSTYLES_ITALIC !== true),
											onClick: changeVerseTextTextStyle,
											title: __('Font style italic', 'bibleget-io'),
											className: 'italic'
										}, __('I','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.UNDERLINE,
											isPrimary: (attributes.VERSETEXTSTYLES_UNDERLINE === true),
											isSecondary: (attributes.VERSETEXTSTYLES_UNDERLINE !== true),
											onClick: changeVerseTextTextStyle,
											title: __('Font style underline', 'bibleget-io'),
											className: 'underline'
										}, __('U','bibleget-io') ),
										createElement(Button, {
											value: BGET.TEXTSTYLE.STRIKETHROUGH,
											isPrimary: (attributes.VERSETEXTSTYLES_STRIKETHROUGH === true),
											isSecondary: (attributes.VERSETEXTSTYLES_STRIKETHROUGH !== true),
											onClick: changeVerseTextTextStyle,
											title: __('Font style strikethrough', 'bibleget-io'),
											className: 'strikethrough'
										}, __('S','bibleget-io') )
									)								
								)
							),
							createElement(RangeControl, {
								value: attributes.VERSETEXTSTYLES_FONTSIZE,
								label: __('Font size', 'bibleget-io'),
								min: 0,
								max: 30,
								disabled: attributes.VERSETEXTSTYLES_FONTSIZEUNIT === 'inherit',
								//className: 'VERSETEXTSTYLES_FONTSIZEUNIT',
								onChange: changeVerseTextFontSize
							}),
							createElement(SelectControl, {
								value: attributes.VERSETEXTSTYLES_FONTSIZEUNIT,
								label: __('Font size unit','bibleget-io'),
								options: [
									{ value: 'px', label: 'px' },
									{ value: 'em', label: 'em' },
									{ value: 'pt', label: 'pt' },
									{ value: 'inherit', label: 'inherit' }
								],
								onChange: changeVerseTextFontSizeUnit,
								help: __('When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)','bibleget-io')
							}),
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: colorizeIco },
								createElement(ColorPicker, {
									color: attributes.VERSETEXTSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeVerseTextStyleFontColor
								})
							),
						)
					)
				)

			])
		},
		save() {
			return null;//save has to exist. This all we need
		}
	});

	$(document).on('click', '.bibleget-popup-trigger', function () {
		var popup_content = he.decode($(this).attr("data-popupcontent"));
		var dlg = $('<div class="bibleget-quote-div bibleget-popup">' + popup_content + '</div>').dialog({
			autoOpen: true,
			width: ($(window).width() * 0.8),
			maxHeight: ($(window).height() * 0.8),
			title: $(this).text(),
			create: function () {
				// style fix for WordPress admin
				$('.ui-dialog-titlebar-close').addClass('ui-button');
			},
			close: function () {
				//autodestruct so we don't clutter with multiple dialog instances
				dlg.dialog('destroy');
				$('.bibleget-quote-div.bibleget-popup').remove();
			}
		});
		return false;
	});

	/* Someone might say this is the wrong way to do this, but hey I don't care, as long as it works */
	$(document).on('click', '[data-type="bibleget/bible-quote"]',function(){
		//if we find a bibleGetSearchBtn element 
		//and it's still an immediate sibling of a ".bibleGetSearch" element
		//rather than it's input child, then we move it
		if ($('.bibleGetSearchBtn').length > 0 && $('.bibleGetSearchBtn').prev().hasClass('bibleGetSearch') ){
			$('.bibleGetSearchBtn').insertAfter('.bibleGetSearch input');
			$('.bibleGetSearch input').outerHeight(jQuery('.bibleGetSearchBtn').outerHeight());
			//console.log('we moved the bibleGetSearchBtn');
		}
		$('.bibleGetSearch input').on('focus',function(){
			$('.bibleGetSearchBtn').css({ "border-color": "#007cba", "box-shadow": "0 0 0 1px #007cba", "outline": "2px solid transparent" });
		});
		$('.bibleGetSearch input').on('blur', function () {
			$('.bibleGetSearchBtn').css({ "outline": 0, "box-shadow": "none", "border-color":"#006395" });
		});
	});

}(
	wp.blocks,
	wp.element,
	wp.i18n,
	wp.blockEditor,
	wp.components,
	wp.serverSideRender,
	jQuery
));

String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
	function () {
		"use strict";
		var str = this.toString();
		if (arguments.length) {
			var t = typeof arguments[0];
			var key;
			var args = ("string" === t || "number" === t) ?
				Array.prototype.slice.call(arguments)
				: arguments[0];

			for (key in args) {
				str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
			}
		}

		return str;
	};

let addMark = function (text, keyword) {
    if(typeof keyword === 'string'){
      keyword = [keyword];
    }
    return text.replace(new RegExp("("+keyword.join('|')+")", "gi"),'<mark>$1</mark>');
};

const getAttributeValue = function (tag, att, content) {
	// In string literals, slashes need to be double escaped
	// 
	//    Match  attribute="value"
	//    \[tag[^\]]*      matches opening of shortcode tag 
	//    att="([^"]*)"    captures value inside " and "
	var re = new RegExp(`\\[${tag}[^\\]]* ${att}="([^"]*)"`, 'im');
	var result = content.match(re);
	if (result != null && result.length > 0)
		return result[1];

	//    Match  attribute='value'
	//    \[tag[^\]]*      matches opening of shortcode tag 
	//    att="([^"]*)"    captures value inside ' and ''
	re = new RegExp(`\\[${tag}[^\\]]* ${att}='([^']*)'`, 'im');
	result = content.match(re);
	if (result != null && result.length > 0)
		return result[1];

	//    Match  attribute=value
	//    \[tag[^\]]*      matches opening of shortcode tag 
	//    att="([^"]*)"    captures a shortcode value provided without 
	//                     quotes, as in [me color=green]
	re = new RegExp(`\\[${tag}[^\\]]* ${att}=([^\\s]*)\\s`, 'im');
	result = content.match(re);
	if (result != null && result.length > 0)
		return result[1];
	return false;
};

const getInnerContent = function (tag, content) {
	//   \[tag[^\]]*?]    matches opening shortcode tag with or without attributes, (not greedy)
	//   ([\S\s]*?)       matches anything in between shortcodes tags, including line breaks and other shortcodes
	//   \[\/tag]         matches end shortcode tag
	// remember, double escaping for string literals inside RegExp
	const re = new RegExp(`\\[${tag}[^\\]]*?]([\\S\\s]*?)\\[\\/${tag}]`, 'i');
	let result = content.match(re);
	if (result == null || result.length < 1)
		return '';
	return result[1];
};

let searchBoxRendered = setInterval(
	function(){
		if( jQuery('.bibleGetSearchBtn').length > 0 ){
			clearInterval(searchBoxRendered);
			//if we find a bibleGetSearchBtn element 
			//and it's still an immediate sibling of a ".bibleGetSearch" element
			//rather than it's input child, then we move it
			if (jQuery('.bibleGetSearchBtn').length > 0 && jQuery('.bibleGetSearchBtn').prev().hasClass('bibleGetSearch') ){
				jQuery('.bibleGetSearchBtn').insertAfter('.bibleGetSearch input');
				jQuery('.bibleGetSearch input').outerHeight(jQuery('.bibleGetSearchBtn').outerHeight());
				//console.log('we moved the bibleGetSearchBtn');
			}
			jQuery('.bibleGetSearch input').on('focus',function(){
				jQuery('.bibleGetSearchBtn').css({ "border-color": "#007cba", "box-shadow": "0 0 0 1px #007cba", "outline": "2px solid transparent" });
			});
			jQuery('.bibleGetSearch input').on('blur', function () {
				jQuery('.bibleGetSearchBtn').css({ "outline": 0, "box-shadow": "none", "border-color":"#006395" });
			});
		}
	},
	10
);
