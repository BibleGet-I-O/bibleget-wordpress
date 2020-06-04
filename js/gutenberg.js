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

						let version = getAttributeValue('bibleget', 'versions', text) || getAttributeValue('bibleget', 'versions', text) || "NABRE";

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
				setAttributes({ QUERY });
			}

			//Function to update Bible version that will be used to retrieve the Bible quote
			function changeVersion(VERSION) {
				if(VERSION.length < 1){
					alert(__('You must indicate the desired version or versions','bibleget-io'));
					return false;
				}
				setAttributes({ VERSION });
			}

			//Function to update whether the Bible quote will be showed in a popup or not
			function changePopup(POPUP) {
				setAttributes({ POPUP });
			}

			function changeBibleVersionVisibility(LAYOUTPREFS_SHOWBIBLEVERSION){
				setAttributes({ LAYOUTPREFS_SHOWBIBLEVERSION });
			}

			function changeBibleVersionAlign(ev){
				let LAYOUTPREFS_BIBLEVERSIONALIGNMENT = parseInt(ev.currentTarget.value);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let textalign = BGET.CSSRULE.ALIGN[LAYOUTPREFS_BIBLEVERSIONALIGNMENT];
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.bibleVersion \{ text-align: (?:.*?); \}/, '.bibleQuote.results p.bibleVersion { text-align: ' + textalign+'; }'));
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONALIGNMENT });
			}

			function changeBibleVersionPos(ev){
				let LAYOUTPREFS_BIBLEVERSIONPOSITION = parseInt(ev.currentTarget.value);
				//console.log('setting LAYOUTPREFS_BIBLEVERSIONPOSITION to '+ev.currentTarget.value);
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONPOSITION });
				//console.log(attributes);
			}

			function changeBibleVersionWrap(ev){
				let LAYOUTPREFS_BIBLEVERSIONWRAP = parseInt(ev.currentTarget.value);
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONWRAP });
			}

			function changeBookChapterAlign(ev) {
				let LAYOUTPREFS_BOOKCHAPTERALIGNMENT = parseInt(ev.currentTarget.value);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let textalign = BGET.CSSRULE.ALIGN[LAYOUTPREFS_BOOKCHAPTERALIGNMENT];
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \.bookChapter \{ text-align: (?:.*?); \}/, '.bibleQuote.results .bookChapter { text-align: ' + textalign + '; }'));
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERALIGNMENT });
			}

			function changeBookChapterPos(ev) {
				let LAYOUTPREFS_BOOKCHAPTERPOSITION = parseInt(ev.currentTarget.value);
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERPOSITION });
			}

			function changeBookChapterWrap(ev) {
				let LAYOUTPREFS_BOOKCHAPTERWRAP = parseInt(ev.currentTarget.value);
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERWRAP });
			}

			function changeShowFullReference(LAYOUTPREFS_BOOKCHAPTERFULLQUERY){
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
				setAttributes({ LAYOUTPREFS_BOOKCHAPTERFORMAT });
			}

			function changeVerseNumberVisibility(LAYOUTPREFS_SHOWVERSENUMBERS){
				setAttributes({ LAYOUTPREFS_SHOWVERSENUMBERS });
			}

			function changeParagraphStyleBorderWidth(PARAGRAPHSTYLES_BORDERWIDTH){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-width: (?:.*?); \}/, '.bibleQuote.results { border-width: ' + PARAGRAPHSTYLES_BORDERWIDTH + 'px; }'));				
				setAttributes({ PARAGRAPHSTYLES_BORDERWIDTH });
			}

			function changeParagraphStyleBorderRadius(PARAGRAPHSTYLES_BORDERRADIUS){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-radius: (?:.*?); \}/, '.bibleQuote.results { border-radius: ' + PARAGRAPHSTYLES_BORDERRADIUS + 'px; }'));
				setAttributes({ PARAGRAPHSTYLES_BORDERRADIUS });
			}

			function changeParagraphStyleBorderStyle(PARAGRAPHSTYLES_BORDERSTYLE){
				PARAGRAPHSTYLES_BORDERSTYLE = parseInt(PARAGRAPHSTYLES_BORDERSTYLE);
				let borderstyle = BGET.CSSRULE.BORDERSTYLE[PARAGRAPHSTYLES_BORDERSTYLE];
				//console.log('borderstyle = '+borderstyle);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-style: (?:.*?); \}/, '.bibleQuote.results { border-style: ' + borderstyle + '; }'));
				setAttributes({ PARAGRAPHSTYLES_BORDERSTYLE });
			}

			function changeParagraphStyleBorderColor(bordercolor){
				let PARAGRAPHSTYLES_BORDERCOLOR = bordercolor.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ border-color: (?:.*?); \}/, '.bibleQuote.results { border-color: ' + PARAGRAPHSTYLES_BORDERCOLOR + '; }'));
				setAttributes({ PARAGRAPHSTYLES_BORDERCOLOR });
			}

			function changeParagraphStyleBackgroundColor(backgroundcolor){
				let PARAGRAPHSTYLES_BACKGROUNDCOLOR = backgroundcolor.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ background-color: (?:.*?); \}/, '.bibleQuote.results { background-color: ' + PARAGRAPHSTYLES_BACKGROUNDCOLOR + '; }'));
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
				setAttributes({ PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT });
			}

			function changeParagraphStylePaddingTopBottom(PARAGRAPHSTYLES_PADDINGTOPBOTTOM){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let { PARAGRAPHSTYLES_PADDINGLEFTRIGHT}  = attributes;
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ padding: (?:.*?); \}/, '.bibleQuote.results { padding: ' + PARAGRAPHSTYLES_PADDINGTOPBOTTOM + 'px ' + PARAGRAPHSTYLES_PADDINGLEFTRIGHT + 'px; }'));
				setAttributes({ PARAGRAPHSTYLES_PADDINGTOPBOTTOM });
			}

			function changeParagraphStylePaddingLeftRight(PARAGRAPHSTYLES_PADDINGLEFTRIGHT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let { PARAGRAPHSTYLES_PADDINGTOPBOTTOM}  = attributes;
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ padding: (?:.*?); \}/, '.bibleQuote.results { padding: ' + PARAGRAPHSTYLES_PADDINGTOPBOTTOM + 'px ' + PARAGRAPHSTYLES_PADDINGLEFTRIGHT + 'px; }'));
				setAttributes({ PARAGRAPHSTYLES_PADDINGLEFTRIGHT });
			}

			function changeParagraphStyleLineHeight(PARAGRAPHSTYLES_LINEHEIGHT){
				//console.log('('+(typeof PARAGRAPHSTYLES_LINEHEIGHT)+') PARAGRAPHSTYLES_LINEHEIGHT = '+PARAGRAPHSTYLES_LINEHEIGHT);
				PARAGRAPHSTYLES_LINEHEIGHT = parseFloat(PARAGRAPHSTYLES_LINEHEIGHT);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.versesParagraph \{ line-height: (?:.*?); \}/, '.bibleQuote.results p.versesParagraph { line-height: ' + PARAGRAPHSTYLES_LINEHEIGHT + 'em; }'));
				setAttributes({ PARAGRAPHSTYLES_LINEHEIGHT });
			}

			function changeParagraphStyleWidth(PARAGRAPHSTYLES_WIDTH){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \{ width: (?:.*?); \}/, '.bibleQuote.results { width: ' + PARAGRAPHSTYLES_WIDTH + '%; }'));
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
						setAttributes({ VERSIONSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						setAttributes({ VERSIONSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						setAttributes({ VERSIONSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
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
				setAttributes({ VERSIONSTYLES_FONTSIZE });
			}

			function changeBibleVersionFontSizeUnit(VERSIONSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (VERSIONSTYLES_FONTSIZEUNIT == 'em') ? attributes.VERSIONSTYLES_FONTSIZE/10 : attributes.VERSIONSTYLES_FONTSIZE;
				let fontsizerule = (VERSIONSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+VERSIONSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				setAttributes({ VERSIONSTYLES_FONTSIZEUNIT });
			}

			function changeBibleVersionStyleFontColor(color){
				let VERSIONSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.bibleVersion \{ color: (?:.*?); \}/, '.bibleQuote.results p\.bibleVersion { color: ' + VERSIONSTYLES_TEXTCOLOR + '; }'));
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
						setAttributes({ BOOKCHAPTERSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						setAttributes({ BOOKCHAPTERSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						setAttributes({ BOOKCHAPTERSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
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
				setAttributes({ BOOKCHAPTERSTYLES_FONTSIZE });
			}

			function changeBookChapterFontSizeUnit(BOOKCHAPTERSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (BOOKCHAPTERSTYLES_FONTSIZEUNIT == 'em') ? attributes.BOOKCHAPTERSTYLES_FONTSIZE/10 : attributes.BOOKCHAPTERSTYLES_FONTSIZE;
				let fontsizerule = (BOOKCHAPTERSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+BOOKCHAPTERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results \.bookChapter \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				setAttributes({ BOOKCHAPTERSTYLES_FONTSIZEUNIT });
			}

			function changeBookChapterStyleFontColor(color){
				let BOOKCHAPTERSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results \.bookChapter \{ color: (?:.*?); \}/, '.bibleQuote.results \.bookChapter { color: ' + BOOKCHAPTERSTYLES_TEXTCOLOR + '; }'));
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
						setAttributes({ VERSENUMBERSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						setAttributes({ VERSENUMBERSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						setAttributes({ VERSENUMBERSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
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
				setAttributes({ VERSENUMBERSTYLES_FONTSIZE });
			}

			function changeVerseNumberFontSizeUnit(VERSENUMBERSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (VERSENUMBERSTYLES_FONTSIZEUNIT == 'em') ? attributes.VERSENUMBERSTYLES_FONTSIZE/10 : attributes.VERSENUMBERSTYLES_FONTSIZE;
				let fontsizerule = (VERSENUMBERSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+VERSENUMBERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				setAttributes({ VERSENUMBERSTYLES_FONTSIZEUNIT });
			}

			function changeVerseNumberStyleFontColor(color){
				let VERSENUMBERSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{ color: (?:.*?); \}/, '.bibleQuote.results p\.versesParagraph span\.verseNum { color: ' + VERSENUMBERSTYLES_TEXTCOLOR + '; }'));
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
						setAttributes({ VERSETEXTSTYLES_BOLD });
						break;
					case BGET.TEXTSTYLE.ITALIC:
						setAttributes({ VERSETEXTSTYLES_ITALIC });
						break;
					case BGET.TEXTSTYLE.UNDERLINE:
						setAttributes({ VERSETEXTSTYLES_UNDERLINE });
						break;
					case BGET.TEXTSTYLE.STRIKETHROUGH:
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
				setAttributes({ VERSETEXTSTYLES_FONTSIZE });
			}

			function changeVerseTextFontSizeUnit(VERSETEXTSTYLES_FONTSIZEUNIT){
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let fontsize = (VERSETEXTSTYLES_FONTSIZEUNIT == 'em') ? attributes.VERSETEXTSTYLES_FONTSIZE/10 : attributes.VERSETEXTSTYLES_FONTSIZE;
				let fontsizerule = (VERSETEXTSTYLES_FONTSIZEUNIT === 'inherit') ? 'inherit' : fontsize+VERSETEXTSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-size:))(.*?)(;.*)/,`$1${fontsizerule}$4`)				
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS);
				setAttributes({ VERSETEXTSTYLES_FONTSIZEUNIT });
			}

			function changeVerseTextStyleFontColor(color){
				let VERSETEXTSTYLES_TEXTCOLOR = color.hex;
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/\.bibleQuote\.results p\.versesParagraph \{ color: (?:.*?); \}/, '.bibleQuote.results p\.versesParagraph { color: ' + VERSETEXTSTYLES_TEXTCOLOR + '; }'));
				setAttributes({ VERSETEXTSTYLES_TEXTCOLOR });
			}

			function doKeywordSearch(notused){
				
				let keyword = $('.bibleGetSearch input').val().replace(/\W/g, ''); //remove non-word characters from keyword
				
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
									let BOOK = __('BOOK', 'bibleget-io');
									let CHAPTER = __('CHAPTER', 'bibleget-io');
									let VERSE = __('VERSE', 'bibleget-io');
									let VERSETEXT = __('VERSE TEXT', 'bibleget-io');
									let searchResultsHtmlMarkup = `
									<div>${response.results.length > 1 ? __('There are {n} results', 'bibleget-io').formatUnicorn({n: response.results.length}) : __('There is 1 result','bibleget-io') }:</div>
									<div id="bibleGetSearchResultsTableContainer">
										<table border="0" cellpadding="0" cellspacing="0" width="100%" class="scrollTable" id="SearchResultsTable">
											<thead class="fixedHeader">
												<tr class="alternateRow"><th>${BOOK}</th><th>${CHAPTER}</th><th>${VERSE}</th><th>${VERSETEXT}</th></tr>
											</thead>
											<tbody class="scrollContent">
											</tbody>
										</table>
									</div>`;
									let dlg = jQuery('<div>', { html: searchResultsHtmlMarkup }).appendTo('body').dialog({
										open: function(){
												for (let $result of response.results) {
													jQuery("#SearchResultsTable tbody").append('<tr><td>' + BibleGetGlobal.biblebooks.fullname[parseInt($result.book) - 1].split('|')[0] + '</td><td>' + $result.chapter + '</td><td>' + $result.verse + '</td><td>' + addMark($result.text, response.info.keyword) + '</td></tr>');
												}
										},
										close: function () {
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
									/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
									help: __('Type the desired Bible quote using the standard notation for Bible citations. You can chain multiple quotes together with semicolons.', 'bibleget-io'),//  .formatUnicorn({ href:'https://en.wikipedia.org/wiki/Bible_citation'}),    <a href="{href}">
									label: __('Bible Reference', 'bibleget-io'), 
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
									help: __('You can not choose more than one Bible version when searching by keyword.', 'bibleget-io'),//  .formatUnicorn({ href:'https://en.wikipedia.org/wiki/Bible_citation'}),    <a href="{href}">
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
							createElement(PanelBody, { title: __('Border color','bibleget-io'), initialOpen: false, icon: 'color-picker' },
								createElement(ColorPicker, {
									color: attributes.PARAGRAPHSTYLES_BORDERCOLOR,
									disableAlpha: false,
									onChangeComplete: changeParagraphStyleBorderColor
								})
							),
							createElement(PanelBody, { title: __('Background color','bibleget-io'), initialOpen: false, icon: 'color-picker' },
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
									/*translators: context is label for line-height select control */
									{ value: 1.0, label: __('single','bibleget-io') },
									{ value: 1.15, label: '1.15' },
									{ value: 1.5, label: '1.5' },
									/*translators: context is label for line-height select control */
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
								label: __('Top / bottom margin', 'bibleget-io'),
								min: 0,
								max: 30,
								onChange: changeParagraphStyleMarginTopBottom
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHT,
								label: __('Left / right margin', 'bibleget-io'),
								min: 0,
								max: 30,
								disabled: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT === 'auto',
								className: 'PARAGRAPHSTYLES_MARGINLEFTRIGHT',
								onChange: changeParagraphStyleMarginLeftRight
							}),
							createElement(SelectControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT,
								label: __('Left / right margin unit','bibleget-io'),
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
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: 'color-picker' },
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
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: 'color-picker' },
								createElement(ColorPicker, {
									color: attributes.BOOKCHAPTERSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeBookChapterStyleFontColor
								})
							),
						),
						createElement(PanelBody, { title: __('Verse Number styles', 'bibleget-io'), initialOpen: false, icon: 'admin-appearance' },
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
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: 'color-picker' },
								createElement(ColorPicker, {
									color: attributes.VERSENUMBERSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeVerseNumberStyleFontColor
								})
							),
						),
						createElement(PanelBody, { title: __('Verse Text styles', 'bibleget-io'), initialOpen: false, icon: 'admin-appearance' },
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
							createElement(PanelBody, { title: __('Font color','bibleget-io'), initialOpen: false, icon: 'color-picker' },
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
	return text.replace(new RegExp("("+keyword+")", "gi"), '<mark>$1</mark>');
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

