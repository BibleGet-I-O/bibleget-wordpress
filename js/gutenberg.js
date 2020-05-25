/*
 * Gutenberg Block registration script
 * BibleGet I/O plugin
 * Author: John Romano D'Orazio priest@johnromanodorazio.com
 */

(function (blocks, element, i18n, editor, components, ServerSideRender, $) {
	//define the same attributes as the shortcode, but now in JSON format
	const { registerBlockType } = blocks; //Blocks API
	const { createElement, Fragment } = element; //React.createElement
	const { __ } = i18n; //translation functions
	const { InspectorControls } = editor; //Block inspector wrapper
	const { TextControl, SelectControl, RangeControl, ToggleControl, PanelBody, PanelRow, Button, ButtonGroup, BaseControl } = components; //WordPress form inputs and server-side renderer

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
				let textalign;
				switch(LAYOUTPREFS_BIBLEVERSIONALIGNMENT){
					case BGET.ALIGN.LEFT:
						textalign = 'left';
						break;
					case BGET.ALIGN.CENTER:
						textalign = 'center';
						break;
					case BGET.ALIGN.RIGHT:
						textalign = 'right';
						break;
					case BGET.ALIGN.JUSTIFY:
						textalign = 'justify';
						break;
				}
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/div\.results p\.bibleVersion \{ text-align: (?:.*?); \}/, 'div.results p.bibleVersion { text-align: ' + textalign+'; }'));
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONALIGNMENT });
			}

			function changeBibleVersionPos(ev){
				let LAYOUTPREFS_BIBLEVERSIONPOSITION = parseInt(ev.currentTarget.value);
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONPOSITION });
			}

			function changeBibleVersionWrap(ev){
				let LAYOUTPREFS_BIBLEVERSIONWRAP = parseInt(ev.currentTarget.value);
				setAttributes({ LAYOUTPREFS_BIBLEVERSIONWRAP });
			}

			function changeBookChapterAlign(ev) {
				let LAYOUTPREFS_BOOKCHAPTERALIGNMENT = parseInt(ev.currentTarget.value);
				let bbGetDynSS = jQuery('#bibleGetDynamicStylesheet').text();
				let textalign;
				switch(LAYOUTPREFS_BOOKCHAPTERALIGNMENT){
					case BGET.ALIGN.LEFT:
						textalign = 'left';
						break;
					case BGET.ALIGN.CENTER:
						textalign = 'center';
						break;
					case BGET.ALIGN.RIGHT:
						textalign = 'right';
						break;
					case BGET.ALIGN.JUSTIFY:
						textalign = 'justify';
						break;
				}
				jQuery('#bibleGetDynamicStylesheet').text(bbGetDynSS.replace(/div\.results \.bookChapter \{ text-align: (?:.*?); \}/, 'div.results .bookChapter { text-align: ' + textalign + '; }'));
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

			function doKeywordSearch(notused){
				
				let keyword = $('.bibleGetSearch input').val().replace(/\W/g, ''); //remove non-word characters from keyword
				
				if(keyword.length < 3){
					alert(__('You cannot perform a search using less than three letters.','bibleget-io') );
					return false;
				}
				//console.log($('.bibleGetSearch input').val());
				//console.log(attributes.version);
				if(attributes.version.length > 1){
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
				else if(attributes.version.length === 0){
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
						data: { action: 'searchByKeyword', keyword: keyword, version: attributes.version[0] },
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

const BGET = {
	ALIGN: {
		LEFT: 1,       //make sure these are text values
		CENTER: 2,      //that correspond to actual CSS properties for the for text-align rule
		RIGHT: 3,     //
		JUSTIFY: 4     //they will be used as is in the stylesheet definitions
	},
	VALIGN: {
		SUPERSCRIPT: 1,
		SUBSCRIPT: 2,
		NORMAL: 3
	},
	WRAP: {
		NONE: 1,
		PARENTHESES: 2,
		BRACKETS: 3
	},
	POS: {
		TOP: 1,
		BOTTOM: 2,
		BOTTOMINLINE: 3
	},
	FORMAT: {
		USERLANG: 1, // if Google Docs is used in chinese, the names of the books of the bible will be given in chinese 
		BIBLELANG: 2, // if Google Docs is used in chinese, the abbreviated names of the books of the bible in chinese will be given
		USERLANGABBREV: 3, // if you are quoting from a Latin Bible, the names of the books of the bible will be given in latin
		BIBLELANGABBREV: 4  // if you are quoting from a Latin Bible, the abbreviated names of the books of the bible in latin will be given
	},
	VISIBILITY: {
		SHOW: 1,
		HIDE: 2
	},
	TEXTSTYLE: {
		BOLD: 1,
		ITALIC: 2,
		UNDERLINE: 3,
		STRIKETHROUGH: 4
	}
};

