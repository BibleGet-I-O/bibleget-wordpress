/*
 * Gutenberg Block registration script
 * BibleGet I/O plugin
 * Author: John Romano D'Orazio priest@johnromanodorazio.com
 */

(function (blocks, element, i18n, editor, components, ServerSideRender, $) {
	//define the same attributes as the shortcode, but now in JSON format
	const bbGetShCdAttributes = {
		query: 				{ default: 'Matthew1:1-5',	type: 'string' },
		version: 			{ default: ['NABRE'], 		type: 'array', items: { type: 'string' } },
		popup: 				{ default: false, 			type: 'boolean' },
		forceversion: 		{ default: false, 			type: 'boolean' },	//effectively not used for Gutenberg block
		forcecopyright: 	{ default: false, 			type: 'boolean' },	//effectively not used for Gutenberg block
		hidebibleversion: 	{ default: false, 			type: 'boolean' },	//if true, bible version will be hidden
		bibleversionalign: 	{ default: 'left', 			type: 'string' },
		bibleversionpos: 	{ default: 'top', 			type: 'string' },
		bibleversionwrap:	{ default: 'none', 			type: 'string' },	//can be 'none', 'parentheses', 'brackets'
		bookchapteralign: 	{ default: 'left', 			type: 'string' },
		bookchapterpos: 	{ default: 'top', 			type: 'string' }, 	//can be 'top', 'bottom', or 'bottominline'
		bookchapterwrap: 	{ default: 'none',			type: 'string' },	//can be 'none', 'parentheses', 'brackets'
		showfullreference: 	{ default: false, 			type: 'boolean' },
		hideversenumber: 	{ default: false, 			type: 'boolean' }
	};
	const { registerBlockType } = blocks; //Blocks API
	const { createElement, Fragment } = element; //React.createElement
	const { __ } = i18n; //translation functions
	const { InspectorControls } = editor; //Block inspector wrapper
	const { TextControl, SelectControl, RadioControl, CheckboxControl, ToggleControl, Panel, PanelBody, PanelRow, Button, ButtonGroup, /*Radio, RadioGroup,*/ BaseControl } = components; //WordPress form inputs and server-side renderer

	registerBlockType('bibleget/bible-quote', {
		title: __('Bible quote', 'bibleget-io'), // Block title.
		category: 'widgets',
		icon: 'book-alt',
		attributes: bbGetShCdAttributes,
		//display the edit interface + preview
		edit(props) {
			const attributes = props.attributes;
			const setAttributes = props.setAttributes;

			//Function to update the query with Bible reference
			function changeQuery(query) {
				setAttributes({ query });
			}

			//Function to update Bible version that will be used to retrieve the Bible quote
			function changeVersion(version) {
				setAttributes({ version });
			}

			//Function to update whether the Bible quote will be showed in a popup or not
			function changePopup(popup) {
				setAttributes({ popup });
			}

			function changeBibleVersionVisibility(hidebibleversion){
				setAttributes({ hidebibleversion });
			}

			function changeBibleVersionAlign(ev){
				let bibleversionalign = ev.currentTarget.value;
				setAttributes({ bibleversionalign });
			}

			/*function changeBibleVersionAlignRG(bibleversionalign){
				setAttributes({ bibleversionalign });
			}*/

			function changeBibleVersionPos(ev){
				let bibleversionpos = ev.currentTarget.value;
				setAttributes({ bibleversionpos });
			}

			function changeBibleVersionWrap(ev){
				let bibleversionwrap = ev.currentTarget.value;
				setAttributes({ bibleversionwrap });
			}

			function changeBookChapterAlign(ev) {
				let bookchapteralign = ev.currentTarget.value;
				setAttributes({ bookchapteralign });
			}

			function changeBookChapterPos(ev) {
				let bookchapterpos = ev.currentTarget.value;
				setAttributes({ bookchapterpos });
			}

			function changeBookChapterWrap(ev) {
				let bookchapterwrap = ev.currentTarget.value;
				setAttributes({ bookchapterwrap });
			}

			function changeShowFullReference(showfullreference){
				setAttributes({ showfullreference });
			}

			function changeVerseNumberVisibility(hideversenumber){
				setAttributes({ hideversenumber });
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
									value: attributes.version,
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
									value: attributes.query,
									/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
									help: __('Type the desired Bible quote using the standard notation for Bible citations. You can chain multiple quotes together with semicolons.', 'bibleget-io'),//  .formatUnicorn({ href:'https://en.wikipedia.org/wiki/Bible_citation'}),    <a href="{href}">
									label: __('Bible Reference', 'bibleget-io'), 
									onChange: changeQuery,
								})
							),
							createElement(PanelRow, {},
								//Select whether this will be a popup or not
								createElement(ToggleControl, {
									checked: attributes.popup,
									label: __('Display in Popup', 'bibleget-io'),
									help: __('When activated, only the reference to the Bible quote will be shown in the document, and clicking on it will show the text of the Bible quote in a popup window.','bibleget-io'),
									onChange: changePopup,
								})
							)
						),
						createElement(PanelBody, { title: __('Layout Bible version', 'bibleget-io'), initialOpen: false, icon: 'layout' },
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: attributes.hidebibleversion, //default false
									label: __('Hide Bible version','bibleget-io'),
									onChange: changeBibleVersionVisibility,
								})
							),
							createElement(PanelRow, {}, 
								createElement(BaseControl, { label: __('Bible version alignment', 'bibleget-io') },
									createElement(ButtonGroup, { className: 'bibleGetButtonGroup' },
										createElement(Button, {
											icon: 'editor-alignleft',
											value: 'left',
											isPrimary: (attributes.bibleversionalign === 'left'),
											isSecondary: (attributes.bibleversionalign !== 'left'),
											//isSecondary: true,
											//isPressed: (attributes.bibleversionalign === 'left'),
											onClick: changeBibleVersionAlign,
											title: __('Bible Version align left', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-aligncenter',
											value: 'center',
											isPrimary: (attributes.bibleversionalign === 'center'),
											isSecondary: (attributes.bibleversionalign !== 'center'),
											//isSecondary: true,
											//isPressed: (attributes.bibleversionalign === 'center'),
											onClick: changeBibleVersionAlign,
											title: __('Bible Version align center', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-alignright',
											value: 'right',
											isPrimary: (attributes.bibleversionalign === 'right'),
											isSecondary: (attributes.bibleversionalign !== 'right'),
											//isSecondary: true,
											//isPressed: (attributes.bibleversionalign === 'right'),
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
											value: 'top',
											isPrimary: (attributes.bibleversionpos === 'top'),
											isSecondary: (attributes.bibleversionpos !== 'top'),
											onClick: changeBibleVersionPos,
											title: __('Bible Version position top', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'arrow-down-alt',
											value: 'bottom',
											isPrimary: (attributes.bibleversionpos === 'bottom'),
											isSecondary: (attributes.bibleversionpos !== 'bottom'),
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
											value: 'none',
											isPrimary: (attributes.bibleversionwrap === 'none'),
											isSecondary: (attributes.bibleversionwrap !== 'none'),
											onClick: changeBibleVersionWrap,
											title: __('Wrap none', 'bibleget-io')
										}, __('none', 'bibleget-io')),
										createElement(Button, {
											//label: __('parentheses', 'bibleget-io'),
											value: 'parentheses',
											isPrimary: (attributes.bibleversionwrap === 'parentheses'),
											isSecondary: (attributes.bibleversionwrap !== 'parentheses'),
											onClick: changeBibleVersionWrap,
											title: __('Wrap in parentheses', 'bibleget-io')
										}, __('parentheses', 'bibleget-io')),
										createElement(Button, {
											//label: __('brackets', 'bibleget-io'),
											value: 'brackets',
											isPrimary: (attributes.bibleversionwrap === 'brackets'),
											isSecondary: (attributes.bibleversionwrap !== 'brackets'),
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
											value: 'left',
											isPrimary: (attributes.bookchapteralign === 'left'),
											isSecondary: (attributes.bookchapteralign !== 'left'),
											onClick: changeBookChapterAlign,
											title: __('Book / Chapter align left', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-aligncenter',
											value: 'center',
											isPrimary: (attributes.bookchapteralign === 'center'),
											isSecondary: (attributes.bookchapteralign !== 'center'),
											onClick: changeBookChapterAlign,
											title: __('Book / Chapter align center', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'editor-alignright',
											value: 'right',
											isPrimary: (attributes.bookchapteralign === 'right'),
											isSecondary: (attributes.bookchapteralign !== 'right'),
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
											value: 'top',
											isPrimary: (attributes.bookchapterpos === 'top'),
											isSecondary: (attributes.bookchapterpos !== 'top'),
											onClick: changeBookChapterPos,
											title: __('Book / Chapter position top', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'arrow-down-alt',
											value: 'bottom',
											isPrimary: (attributes.bookchapterpos === 'bottom'),
											isSecondary: (attributes.bookchapterpos !== 'bottom'),
											onClick: changeBookChapterPos,
											title: __('Book / Chapter position bottom', 'bibleget-io')
										}),
										createElement(Button, {
											icon: 'arrow-left-alt',
											value: 'bottominline',
											isPrimary: (attributes.bookchapterpos === 'bottominline'),
											isSecondary: (attributes.bookchapterpos !== 'bottominline'),
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
											value: 'none',
											isPrimary: (attributes.bookchapterwrap === 'none'),
											isSecondary: (attributes.bookchapterwrap !== 'none'),
											onClick: changeBookChapterWrap,
											title: __('Book / Chapter wrap none', 'bibleget-io')
										}, __('none', 'bibleget-io')),
										createElement(Button, {
											value: 'parentheses',
											isPrimary: (attributes.bookchapterwrap === 'parentheses'),
											isSecondary: (attributes.bookchapterwrap !== 'parentheses'),
											onClick: changeBookChapterWrap,
											title: __('Book / Chapter wrap parentheses', 'bibleget-io')
										}, __('parentheses', 'bibleget-io')),
										createElement(Button, {
											value: 'brackets',
											isPrimary: (attributes.bookchapterwrap === 'brackets'),
											isSecondary: (attributes.bookchapterwrap !== 'brackets'),
											onClick: changeBookChapterWrap,
											title: __('Book / Chapter wrap brackets', 'bibleget-io')
										}, __('brackets', 'bibleget-io')),
									)
								)
							),
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: attributes.showfullreference, //default false
									label: __('Show full reference', 'bibleget-io'),
									help: __('When activated, the full reference including verses quoted will be shown with the book and chapter','bibleget-io'),
									onChange: changeShowFullReference,
								})
							)							
						),
						createElement(PanelBody, { title: __('Layout Verses', 'bibleget-io'), initialOpen: false, icon: 'layout' },
							createElement(PanelRow, {},
								createElement(ToggleControl, {
									checked: attributes.hideversenumber, //default false
									label: __('Hide verse number', 'bibleget-io'),
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