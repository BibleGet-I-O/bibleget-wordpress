/*
 * Gutenberg Block registration script
 * BibleGet I/O plugin
 * Author: John Romano D'Orazio priest@johnromanodorazio.com
 */

const BGET = BibleGetGlobal.BGETConstants;
//console.log(BibleGetGlobal);

const getKeyByValue = (object, value) => Object.keys(object).find((key) => object[key] === value);

((blocks, element, i18n, editor, components, ServerSideRender, $) => {
	//define the same attributes as the shortcode, but now in JSON format
	const { registerBlockType } = blocks; //Blocks API
	const { createElement, Fragment, useState } = element; //React.createElement
	const { __ } = i18n; //translation functions
	const { InspectorControls } = editor; //Block inspector wrapper
	const {
		TextControl,
		SelectControl,
		RangeControl,
		ToggleControl,
		PanelBody,
		PanelRow,
		Button,
		ButtonGroup,
		BaseControl,
		ColorPicker,
		Dashicon,
		ComboboxControl,
	} = components; //WordPress form inputs and server-side renderer

	const colorizeIco = createElement(Dashicon, { icon: "color-picker" });

	const SearchBoxControl = (props) => {
		return createElement(
			"div",
			{ className: "bibleGetSearch" },
			createElement("input", {
				type: "search",
				placeholder: __("e.g. Creation", "bibleget-io"),
				className: "bibleGetSearchInput",
			}),
			createElement(Button, {
				icon: "search",
				isPrimary: true,
				onClick: props.onButtonClick,
				className: "bibleGetSearchBtn",
			})
		);
	};

	const Option = (props) => {
		const { label, value, title } = props;
		return createElement("option", { value: value, title: title }, label);
	};

	const OptionGroup = (props) => {
		let label = props.label;
		let options = props.options;
		return createElement(
			"optgroup",
			{ label: label },
			options.map(function (item, index) {
				return createElement(
					Option,
					Object.assign(
						{},
						{ key: `${item.label.replace(/\s/g, "")}-${index}` },
						item
					)
				);
			})
		);
	};

	const OptGroupControl = (props) => {
		const { options, className, multiple, value } = props;
		const handleOnChange = (event) => {
			if (multiple) {
				const selectedOptions = [...event.target.options].filter(
					({ selected }) => selected
				);
				const newValues = selectedOptions.map(({ value }) => value);
				props.onChange(newValues);
				return;
			}
			props.onChange(event.target.value, { event });
		};

		return createElement(
			"select",
			{
				className: className,
				multiple: multiple,
				onChange: handleOnChange,
				value: value,
			},
			options.map(function (item, index) {
				if ("options" in item) {
					return createElement(
						OptionGroup,
						Object.assign(
							{},
							{ key: `${item.label.replace(/\s/g, "")}-${index}` },
							item
						)
					);
				}
				return createElement(
					Option,
					Object.assign(
						{},
						{ key: `${item.label.replace(/\s/g, "")}-${index}` },
						item
					)
				);
			})
		);
	};

	const websafe_fonts = [
		{ fontFamily: "Arial", fallback: "Helvetica", genericFamily: "sans-serif" },
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
		{ fontFamily: "Impact", fallback: "Charcoal", genericFamily: "sans-serif" },
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
		{ fontFamily: "Verdana", fallback: "Geneva", genericFamily: "sans-serif" },
	];

	const fontOptions = [];
	websafe_fonts.forEach((fontObj, idx) =>
		fontOptions.push({
			label: fontObj.fontFamily + " [websafe]",
			value: fontObj.fontFamily,
		})
	);

	if (
		BibleGetGlobal.haveGFonts === "SUCCESS"
		&& typeof BibleGetGlobal.GFonts === 'object'
		&& BibleGetGlobal.GFonts !== null
		&& BibleGetGlobal.GFonts.hasOwnProperty('items')
		&& BibleGetGlobal.GFonts.items.length > 0
	) {
		BibleGetGlobal.GFonts.items.forEach(value => fontOptions.push({ label: value.family, value: value.family.replace(/ /g,"+") }) );
	}

	const FontSelectCtl = (props) => {
		const [filteredOptions, setFilteredOptions] = useState(fontOptions);
		return createElement(ComboboxControl, {
			label: "Font",
			className: 'BGET_FONTPICKER',
			value: props.value,
			onChange: props.onChange,
			options: filteredOptions,
			onFilterValueChange: inputValue => {
				//console.log('onFilterValueChange: inputValue = ' + inputValue);
				setTimeout(() => {
					//console.log('we found ' + jQuery('.BGET_FONTPICKER ul').length + ' BGET_FONTPICKER dropdown lists');
					if(jQuery('.BGET_FONTPICKER ul').length){
						//console.log('there are ' + jQuery('.BGET_FONTPICKER li').length + ' li elements in this list');
						jQuery('.BGET_FONTPICKER li').each((idx) => {
							let $elem = jQuery('.BGET_FONTPICKER li:nth-child(' + (idx + 1) + ')');
							let label = $elem.text();
							if(/websafe/.test(label)){
								label = label.replace(/\[websafe\]/,'').trim();
							}
							//console.log('updating css for label ' + label);
							$elem.css({fontFamily:label});
						});
					}
				});
				setFilteredOptions(
					fontOptions.filter((option) =>
						option.label.toLowerCase().startsWith(inputValue.toLowerCase())
					)
				);
			},
		});
	}

	registerBlockType("bibleget/bible-quote", {
		title: __("Bible quote", "bibleget-io"), // Block title.
		category: "widgets",
		icon: "book-alt",
		attributes: BibleGetGlobal.BGETProperties,
		transforms: {
			from: [
				{
					type: "block",
					blocks: ["core/shortcode"],
					isMatch: ({ text }) => /^\[bibleget/.test(text),
					transform: ({ text }) => {
						let query = getInnerContent("bibleget", text);
						if (query === "") {
							query = getAttributeValue("bibleget", "query", text);
						}

						const version =
							getAttributeValue("bibleget", "versions", text) ||
							getAttributeValue("bibleget", "version", text) ||
							"NABRE";

						const popup = getAttributeValue("bibleget", "popup", text);

						return wp.blocks.createBlock("bibleget/bible-quote", {
							QUERY: query,
							VERSION: version.split(","),
							POPUP: JSON.parse(popup),
						});
					},
				},
			],
		},
		//display the edit interface + preview
		edit(props) {
			const { attributes, setAttributes } = props;
			//console.log("props = ");
			//console.log(props);

			//Function to update the query with Bible reference
			const changeQuery = (QUERY) => {
				//BibleGetGlobal.BGETProperties['QUERY'].default = QUERY;
				return setAttributes({ QUERY });
			}

			//Function to update Bible version that will be used to retrieve the Bible quote
			const changeVersion = (VERSION) => {
				if (VERSION.length < 1) {
					alert(
						__(
							"You must indicate the desired version or versions",
							"bibleget-io"
						)
					);
					return false;
				}
				//BibleGetGlobal.BGETProperties['VERSION'].default = VERSION;
				return setAttributes({ VERSION });
			}

			const changePreferOrigin = (preferHebrewOrigin) => {
				//console.log('Prefer origin toggle was clicked');
				//console.log(preferHebrewOrigin);
				let PREFERORIGIN = preferHebrewOrigin
					? BGET.PREFERORIGIN.HEBREW
					: BGET.PREFERORIGIN.GREEK;
				return setAttributes({ PREFERORIGIN });
			}

			//Function to update whether the Bible quote will be showed in a popup or not
			const changePopup = (POPUP) => {
				//BibleGetGlobal.BGETProperties['POPUP'].default = POPUP;
				return setAttributes({ POPUP });
			}

			const changeBibleVersionVisibility = (LAYOUTPREFS_SHOWBIBLEVERSION) => {
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_SHOWBIBLEVERSION"
				].default = LAYOUTPREFS_SHOWBIBLEVERSION;
				return setAttributes({ LAYOUTPREFS_SHOWBIBLEVERSION });
			}

			const changeBibleVersionAlign = (ev) => {
				const LAYOUTPREFS_BIBLEVERSIONALIGNMENT = parseInt(
					ev.currentTarget.value
				);
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const textalign = BGET.CSSRULE.ALIGN[LAYOUTPREFS_BIBLEVERSIONALIGNMENT];
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results p\.bibleVersion \{ text-align: (?:.*?); \}/,
						".bibleQuote.results p.bibleVersion { text-align: " +
							textalign +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BIBLEVERSIONALIGNMENT"
				].default = LAYOUTPREFS_BIBLEVERSIONALIGNMENT;
				return setAttributes({ LAYOUTPREFS_BIBLEVERSIONALIGNMENT });
			}

			const changeBibleVersionPos = (ev) => {
				const LAYOUTPREFS_BIBLEVERSIONPOSITION = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BIBLEVERSIONPOSITION"
				].default = LAYOUTPREFS_BIBLEVERSIONPOSITION;
				return setAttributes({ LAYOUTPREFS_BIBLEVERSIONPOSITION });
			}

			const changeBibleVersionWrap = (ev) => {
				const LAYOUTPREFS_BIBLEVERSIONWRAP = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BIBLEVERSIONWRAP"
				].default = LAYOUTPREFS_BIBLEVERSIONWRAP;
				return setAttributes({ LAYOUTPREFS_BIBLEVERSIONWRAP });
			}

			const changeBookChapterAlign = (ev) => {
				const LAYOUTPREFS_BOOKCHAPTERALIGNMENT = parseInt(ev.currentTarget.value);
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const textalign = BGET.CSSRULE.ALIGN[LAYOUTPREFS_BOOKCHAPTERALIGNMENT];
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \.bookChapter \{ text-align: (?:.*?); \}/,
						".bibleQuote.results .bookChapter { text-align: " +
							textalign +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BOOKCHAPTERALIGNMENT"
				].default = LAYOUTPREFS_BOOKCHAPTERALIGNMENT;
				return setAttributes({ LAYOUTPREFS_BOOKCHAPTERALIGNMENT });
			}

			const changeBookChapterPos = (ev) => {
				let LAYOUTPREFS_BOOKCHAPTERPOSITION = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BOOKCHAPTERPOSITION"
				].default = LAYOUTPREFS_BOOKCHAPTERPOSITION;
				return setAttributes({ LAYOUTPREFS_BOOKCHAPTERPOSITION });
			}

			const changeBookChapterWrap = (ev) => {
				let LAYOUTPREFS_BOOKCHAPTERWRAP = parseInt(ev.currentTarget.value);
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BOOKCHAPTERWRAP"
				].default = LAYOUTPREFS_BOOKCHAPTERWRAP;
				return setAttributes({ LAYOUTPREFS_BOOKCHAPTERWRAP });
			}

			const changeShowFullReference = (LAYOUTPREFS_BOOKCHAPTERFULLQUERY) => {
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BOOKCHAPTERFULLQUERY"
				].default = LAYOUTPREFS_BOOKCHAPTERFULLQUERY;
				return setAttributes({ LAYOUTPREFS_BOOKCHAPTERFULLQUERY });
			}

			const changeUseBookAbbreviation = (usebookabbreviation) => {
				let LAYOUTPREFS_BOOKCHAPTERFORMAT;
				if (
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANG ||
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
						BGET.FORMAT.USERLANGABBREV
				) {
					LAYOUTPREFS_BOOKCHAPTERFORMAT = usebookabbreviation
						? BGET.FORMAT.USERLANGABBREV
						: BGET.FORMAT.USERLANG;
				} else if (
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.BIBLELANG ||
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
						BGET.FORMAT.BIBLELANGABBREV
				) {
					LAYOUTPREFS_BOOKCHAPTERFORMAT = usebookabbreviation
						? BGET.FORMAT.BIBLELANGABBREV
						: BGET.FORMAT.BIBLELANG;
				}
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BOOKCHAPTERFORMAT"
				].default = LAYOUTPREFS_BOOKCHAPTERFORMAT;
				return setAttributes({ LAYOUTPREFS_BOOKCHAPTERFORMAT });
			}

			const changeBookNameUseWpLang = (booknameusewplang) => {
				let LAYOUTPREFS_BOOKCHAPTERFORMAT;
				if (
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.USERLANG ||
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT === BGET.FORMAT.BIBLELANG
				) {
					LAYOUTPREFS_BOOKCHAPTERFORMAT = booknameusewplang
						? BGET.FORMAT.USERLANG
						: BGET.FORMAT.BIBLELANG;
				} else if (
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
						BGET.FORMAT.USERLANGABBREV ||
					attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
						BGET.FORMAT.BIBLELANGABBREV
				) {
					LAYOUTPREFS_BOOKCHAPTERFORMAT = booknameusewplang
						? BGET.FORMAT.USERLANGABBREV
						: BGET.FORMAT.BIBLELANGABBREV;
				}
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_BOOKCHAPTERFORMAT"
				].default = LAYOUTPREFS_BOOKCHAPTERFORMAT;
				return setAttributes({ LAYOUTPREFS_BOOKCHAPTERFORMAT });
			}

			const changeVerseNumberVisibility = (LAYOUTPREFS_SHOWVERSENUMBERS) => {
				BibleGetGlobal.BGETProperties[
					"LAYOUTPREFS_SHOWVERSENUMBERS"
				].default = LAYOUTPREFS_SHOWVERSENUMBERS;
				return setAttributes({ LAYOUTPREFS_SHOWVERSENUMBERS });
			}

			const changeParagraphStyleBorderWidth = (PARAGRAPHSTYLES_BORDERWIDTH) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ border-width: (?:.*?); \}/,
						".bibleQuote.results { border-width: " +
							PARAGRAPHSTYLES_BORDERWIDTH +
							"px; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_BORDERWIDTH"
				].default = PARAGRAPHSTYLES_BORDERWIDTH;
				return setAttributes({ PARAGRAPHSTYLES_BORDERWIDTH });
			}

			const changeParagraphStyleBorderRadius = (PARAGRAPHSTYLES_BORDERRADIUS) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ border-radius: (?:.*?); \}/,
						".bibleQuote.results { border-radius: " +
							PARAGRAPHSTYLES_BORDERRADIUS +
							"px; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_BORDERRADIUS"
				].default = PARAGRAPHSTYLES_BORDERRADIUS;
				return setAttributes({ PARAGRAPHSTYLES_BORDERRADIUS });
			}

			const changeParagraphStyleBorderStyle = (PARAGRAPHSTYLES_BORDERSTYLE) => {
				PARAGRAPHSTYLES_BORDERSTYLE = parseInt(PARAGRAPHSTYLES_BORDERSTYLE);
				let borderstyle = BGET.CSSRULE.BORDERSTYLE[PARAGRAPHSTYLES_BORDERSTYLE];
				//console.log('borderstyle = '+borderstyle);
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ border-style: (?:.*?); \}/,
						".bibleQuote.results { border-style: " + borderstyle + "; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_BORDERSTYLE"
				].default = PARAGRAPHSTYLES_BORDERSTYLE;
				return setAttributes({ PARAGRAPHSTYLES_BORDERSTYLE });
			}

			const changeParagraphStyleBorderColor = (bordercolor) => {
				const PARAGRAPHSTYLES_BORDERCOLOR = bordercolor.hex;
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ border-color: (?:.*?); \}/,
						".bibleQuote.results { border-color: " +
							PARAGRAPHSTYLES_BORDERCOLOR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_BORDERCOLOR"
				].default = PARAGRAPHSTYLES_BORDERCOLOR;
				return setAttributes({ PARAGRAPHSTYLES_BORDERCOLOR });
			}

			const changeParagraphStyleBackgroundColor = (backgroundcolor) => {
				const PARAGRAPHSTYLES_BACKGROUNDCOLOR = backgroundcolor.hex;
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ background-color: (?:.*?); \}/,
						".bibleQuote.results { background-color: " +
							PARAGRAPHSTYLES_BACKGROUNDCOLOR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_BACKGROUNDCOLOR"
				].default = PARAGRAPHSTYLES_BACKGROUNDCOLOR;
				return setAttributes({ PARAGRAPHSTYLES_BACKGROUNDCOLOR });
			}

			const changeParagraphStyleMarginTopBottom = (PARAGRAPHSTYLES_MARGINTOPBOTTOM) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const {
					PARAGRAPHSTYLES_MARGINLEFTRIGHT,
					PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT,
				} = attributes;
				let margLR = "";
				switch (PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT) {
					case "px":
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + "px";
						break;
					case "%":
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + "%";
						break;
					case "auto":
						margLR = "auto";
				}
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ margin: (?:.*?); \}/,
						".bibleQuote.results { margin: " +
							PARAGRAPHSTYLES_MARGINTOPBOTTOM +
							"px " +
							margLR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_MARGINTOPBOTTOM"
				].default = PARAGRAPHSTYLES_MARGINTOPBOTTOM;
				return setAttributes({ PARAGRAPHSTYLES_MARGINTOPBOTTOM });
			}

			const changeParagraphStyleMarginLeftRight = (PARAGRAPHSTYLES_MARGINLEFTRIGHT) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const {
					PARAGRAPHSTYLES_MARGINTOPBOTTOM,
					PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT,
				} = attributes;
				let margLR = "";
				switch (PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT) {
					case "px":
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + "px";
						break;
					case "%":
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + "%";
						break;
					case "auto":
						margLR = "auto";
				}
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ margin: (?:.*?); \}/,
						".bibleQuote.results { margin: " +
							PARAGRAPHSTYLES_MARGINTOPBOTTOM +
							"px " +
							margLR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_MARGINLEFTRIGHT"
				].default = PARAGRAPHSTYLES_MARGINLEFTRIGHT;
				return setAttributes({ PARAGRAPHSTYLES_MARGINLEFTRIGHT });
			}

			const changeParagraphStyleMarginLeftRightUnit = (PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const { PARAGRAPHSTYLES_MARGINTOPBOTTOM, PARAGRAPHSTYLES_MARGINLEFTRIGHT } = attributes;
				let margLR = "";
				switch (PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT) {
					case "px":
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + "px";
						break;
					case "%":
						margLR = PARAGRAPHSTYLES_MARGINLEFTRIGHT + "%";
						break;
					case "auto":
						margLR = "auto";
				}
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ margin: (?:.*?); \}/,
						".bibleQuote.results { margin: " +
							PARAGRAPHSTYLES_MARGINTOPBOTTOM +
							"px " +
							margLR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT"
				].default = PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT;
				return setAttributes({ PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT });
			}

			const changeParagraphStylePaddingTopBottom = (PARAGRAPHSTYLES_PADDINGTOPBOTTOM) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const { PARAGRAPHSTYLES_PADDINGLEFTRIGHT } = attributes;
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ padding: (?:.*?); \}/,
						".bibleQuote.results { padding: " +
							PARAGRAPHSTYLES_PADDINGTOPBOTTOM +
							"px " +
							PARAGRAPHSTYLES_PADDINGLEFTRIGHT +
							"px; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_PADDINGTOPBOTTOM"
				].default = PARAGRAPHSTYLES_PADDINGTOPBOTTOM;
				return setAttributes({ PARAGRAPHSTYLES_PADDINGTOPBOTTOM });
			}

			const changeParagraphStylePaddingLeftRight = (PARAGRAPHSTYLES_PADDINGLEFTRIGHT) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const { PARAGRAPHSTYLES_PADDINGTOPBOTTOM } = attributes;
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ padding: (?:.*?); \}/,
						".bibleQuote.results { padding: " +
							PARAGRAPHSTYLES_PADDINGTOPBOTTOM +
							"px " +
							PARAGRAPHSTYLES_PADDINGLEFTRIGHT +
							"px; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_PADDINGLEFTRIGHT"
				].default = PARAGRAPHSTYLES_PADDINGLEFTRIGHT;
				return setAttributes({ PARAGRAPHSTYLES_PADDINGLEFTRIGHT });
			}

			const changeParagraphStyleLineHeight = (PARAGRAPHSTYLES_LINEHEIGHT) => {
				//console.log('('+(typeof PARAGRAPHSTYLES_LINEHEIGHT)+') PARAGRAPHSTYLES_LINEHEIGHT = '+PARAGRAPHSTYLES_LINEHEIGHT);
				PARAGRAPHSTYLES_LINEHEIGHT = parseFloat(PARAGRAPHSTYLES_LINEHEIGHT);
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results p\.versesParagraph \{ line-height: (?:.*?); \}/,
						".bibleQuote.results p.versesParagraph { line-height: " +
							PARAGRAPHSTYLES_LINEHEIGHT +
							"em; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_LINEHEIGHT"
				].default = PARAGRAPHSTYLES_LINEHEIGHT;
				return setAttributes({ PARAGRAPHSTYLES_LINEHEIGHT });
			}

			const changeParagraphStyleWidth = (PARAGRAPHSTYLES_WIDTH) => {
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ width: (?:.*?); \}/,
						".bibleQuote.results { width: " + PARAGRAPHSTYLES_WIDTH + "%; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"PARAGRAPHSTYLES_WIDTH"
				].default = PARAGRAPHSTYLES_WIDTH;
				return setAttributes({ PARAGRAPHSTYLES_WIDTH });
			}

			const changeBibleVersionTextStyle = (ev) => {
				const target = parseInt(ev.currentTarget.value);
				let {
					VERSIONSTYLES_BOLD,
					VERSIONSTYLES_ITALIC,
					VERSIONSTYLES_UNDERLINE,
					VERSIONSTYLES_STRIKETHROUGH,
				} = attributes;
				switch (target) {
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

				let boldrule = VERSIONSTYLES_BOLD ? "bold" : "normal";
				let italicrule = VERSIONSTYLES_ITALIC ? "italic" : "normal";
				let decorationrule = "";
				let decorations = [];
				if (VERSIONSTYLES_UNDERLINE) {
					decorations.push("underline");
				}
				if (VERSIONSTYLES_STRIKETHROUGH) {
					decorations.push("line-through");
				}
				if (decorations.length === 0) {
					decorationrule = "none";
				} else {
					decorationrule = decorations.join(" ");
				}
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-weight:))(.*?)(;.*)/,
					`$1${boldrule}$4`
				);
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-style:))(.*?)(;.*)/,
					`$1${italicrule}$4`
				);
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.bibleVersion \{(.*?text\-decoration:))(.*?)(;.*)/,
					`$1${decorationrule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				switch (target) {
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties[
							"VERSIONSTYLES_BOLD"
						].default = VERSIONSTYLES_BOLD;
						return setAttributes({ VERSIONSTYLES_BOLD });
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties[
							"VERSIONSTYLES_ITALIC"
						].default = VERSIONSTYLES_ITALIC;
						return setAttributes({ VERSIONSTYLES_ITALIC });
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties[
							"VERSIONSTYLES_UNDERLINE"
						].default = VERSIONSTYLES_UNDERLINE;
						return setAttributes({ VERSIONSTYLES_UNDERLINE });
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties[
							"VERSIONSTYLES_STRIKETHROUGH"
						].default = VERSIONSTYLES_STRIKETHROUGH;
						return setAttributes({ VERSIONSTYLES_STRIKETHROUGH });
				}
			}

			const changeBibleVersionFontSize = (VERSIONSTYLES_FONTSIZE) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				let fontsize =
					attributes.VERSIONSTYLES_FONTSIZEUNIT === "em"
						? VERSIONSTYLES_FONTSIZE / 10
						: VERSIONSTYLES_FONTSIZE;
				let fontsizerule =
					attributes.VERSIONSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + attributes.VERSIONSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"VERSIONSTYLES_FONTSIZE"
				].default = VERSIONSTYLES_FONTSIZE;
				return setAttributes({ VERSIONSTYLES_FONTSIZE });
			}

			const changeBibleVersionFontSizeUnit = (VERSIONSTYLES_FONTSIZEUNIT) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				let fontsize =
					VERSIONSTYLES_FONTSIZEUNIT === "em"
						? attributes.VERSIONSTYLES_FONTSIZE / 10
						: attributes.VERSIONSTYLES_FONTSIZE;
				let fontsizerule =
					VERSIONSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + VERSIONSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.bibleVersion \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"VERSIONSTYLES_FONTSIZEUNIT"
				].default = VERSIONSTYLES_FONTSIZEUNIT;
				return setAttributes({ VERSIONSTYLES_FONTSIZEUNIT });
			}

			const changeBibleVersionStyleFontColor = (color) => {
				const VERSIONSTYLES_TEXTCOLOR = color.hex;
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results p\.bibleVersion \{ color: (?:.*?); \}/,
						".bibleQuote.results p.bibleVersion { color: " +
							VERSIONSTYLES_TEXTCOLOR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"VERSIONSTYLES_TEXTCOLOR"
				].default = VERSIONSTYLES_TEXTCOLOR;
				return setAttributes({ VERSIONSTYLES_TEXTCOLOR });
			}

			const changeBookChapterTextStyle = (ev) => {
				const target = parseInt(ev.currentTarget.value);
				let {
					BOOKCHAPTERSTYLES_BOLD,
					BOOKCHAPTERSTYLES_ITALIC,
					BOOKCHAPTERSTYLES_UNDERLINE,
					BOOKCHAPTERSTYLES_STRIKETHROUGH,
				} = attributes;
				switch (target) {
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

				let boldrule = BOOKCHAPTERSTYLES_BOLD ? "bold" : "normal";
				let italicrule = BOOKCHAPTERSTYLES_ITALIC ? "italic" : "normal";
				let decorationrule = "";
				let decorations = [];
				if (BOOKCHAPTERSTYLES_UNDERLINE) {
					decorations.push("underline");
				}
				if (BOOKCHAPTERSTYLES_STRIKETHROUGH) {
					decorations.push("line-through");
				}
				if (decorations.length === 0) {
					decorationrule = "none";
				} else {
					decorationrule = decorations.join(" ");
				}
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results \.bookChapter \{(.*?font\-weight:))(.*?)(;.*)/,
					`$1${boldrule}$4`
				);
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results \.bookChapter \{(.*?font\-style:))(.*?)(;.*)/,
					`$1${italicrule}$4`
				);
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results \.bookChapter \{(.*?text\-decoration:))(.*?)(;.*)/,
					`$1${decorationrule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				switch (target) {
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties[
							"BOOKCHAPTERSTYLES_BOLD"
						].default = BOOKCHAPTERSTYLES_BOLD;
						return setAttributes({ BOOKCHAPTERSTYLES_BOLD });
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties[
							"BOOKCHAPTERSTYLES_ITALIC"
						].default = BOOKCHAPTERSTYLES_ITALIC;
						return setAttributes({ BOOKCHAPTERSTYLES_ITALIC });
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties[
							"BOOKCHAPTERSTYLES_UNDERLINE"
						].default = BOOKCHAPTERSTYLES_UNDERLINE;
						return setAttributes({ BOOKCHAPTERSTYLES_UNDERLINE });
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties[
							"BOOKCHAPTERSTYLES_STRIKETHROUGH"
						].default = BOOKCHAPTERSTYLES_STRIKETHROUGH;
						return setAttributes({ BOOKCHAPTERSTYLES_STRIKETHROUGH });
				}
			}

			const changeBookChapterFontSize = (BOOKCHAPTERSTYLES_FONTSIZE) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const fontsize =
					attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT === "em"
						? BOOKCHAPTERSTYLES_FONTSIZE / 10
						: BOOKCHAPTERSTYLES_FONTSIZE;
				const fontsizerule =
					attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results \.bookChapter \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"BOOKCHAPTERSTYLES_FONTSIZE"
				].default = BOOKCHAPTERSTYLES_FONTSIZE;
				return setAttributes({ BOOKCHAPTERSTYLES_FONTSIZE });
			}

			const changeBookChapterFontSizeUnit = (BOOKCHAPTERSTYLES_FONTSIZEUNIT) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const fontsize =
					BOOKCHAPTERSTYLES_FONTSIZEUNIT == "em"
						? attributes.BOOKCHAPTERSTYLES_FONTSIZE / 10
						: attributes.BOOKCHAPTERSTYLES_FONTSIZE;
				const fontsizerule =
					BOOKCHAPTERSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + BOOKCHAPTERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results \.bookChapter \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"BOOKCHAPTERSTYLES_FONTSIZEUNIT"
				].default = BOOKCHAPTERSTYLES_FONTSIZEUNIT;
				return setAttributes({ BOOKCHAPTERSTYLES_FONTSIZEUNIT });
			}

			const changeBookChapterStyleFontColor = (color) => {
				const BOOKCHAPTERSTYLES_TEXTCOLOR = color.hex;
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \.bookChapter \{ color: (?:.*?); \}/,
						".bibleQuote.results .bookChapter { color: " +
							BOOKCHAPTERSTYLES_TEXTCOLOR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"BOOKCHAPTERSTYLES_TEXTCOLOR"
				].default = BOOKCHAPTERSTYLES_TEXTCOLOR;
				return setAttributes({ BOOKCHAPTERSTYLES_TEXTCOLOR });
			}

			const changeVerseNumberTextStyle = (ev) => {
				const target = parseInt(ev.currentTarget.value);
				let {
					VERSENUMBERSTYLES_BOLD,
					VERSENUMBERSTYLES_ITALIC,
					VERSENUMBERSTYLES_UNDERLINE,
					VERSENUMBERSTYLES_STRIKETHROUGH,
				} = attributes;
				switch (target) {
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

				let boldrule = VERSENUMBERSTYLES_BOLD ? "bold" : "normal";
				let italicrule = VERSENUMBERSTYLES_ITALIC ? "italic" : "normal";
				let decorationrule = "";
				let decorations = [];
				if (VERSENUMBERSTYLES_UNDERLINE) {
					decorations.push("underline");
				}
				if (VERSENUMBERSTYLES_STRIKETHROUGH) {
					decorations.push("line-through");
				}
				if (decorations.length === 0) {
					decorationrule = "none";
				} else {
					decorationrule = decorations.join(" ");
				}
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-weight:))(.*?)(;.*)/,
					`$1${boldrule}$4`
				);
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-style:))(.*?)(;.*)/,
					`$1${italicrule}$4`
				);
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?text\-decoration:))(.*?)(;.*)/,
					`$1${decorationrule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				switch (target) {
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties[
							"VERSENUMBERSTYLES_BOLD"
						].default = VERSENUMBERSTYLES_BOLD;
						return setAttributes({ VERSENUMBERSTYLES_BOLD });
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties[
							"VERSENUMBERSTYLES_ITALIC"
						].default = VERSENUMBERSTYLES_ITALIC;
						return setAttributes({ VERSENUMBERSTYLES_ITALIC });
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties[
							"VERSENUMBERSTYLES_UNDERLINE"
						].default = VERSENUMBERSTYLES_UNDERLINE;
						return setAttributes({ VERSENUMBERSTYLES_UNDERLINE });
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties[
							"VERSENUMBERSTYLES_STRIKETHROUGH"
						].default = VERSENUMBERSTYLES_STRIKETHROUGH;
						return setAttributes({ VERSENUMBERSTYLES_STRIKETHROUGH });
				}
			}

			const changeVerseNumberFontSize = (VERSENUMBERSTYLES_FONTSIZE) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const fontsize =
					attributes.VERSENUMBERSTYLES_FONTSIZEUNIT === "em"
						? VERSENUMBERSTYLES_FONTSIZE / 10
						: VERSENUMBERSTYLES_FONTSIZE;
				const fontsizerule =
					attributes.VERSENUMBERSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + attributes.VERSENUMBERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"VERSENUMBERSTYLES_FONTSIZE"
				].default = VERSENUMBERSTYLES_FONTSIZE;
				return setAttributes({ VERSENUMBERSTYLES_FONTSIZE });
			}

			const changeVerseNumberFontSizeUnit = (VERSENUMBERSTYLES_FONTSIZEUNIT) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const fontsize =
					VERSENUMBERSTYLES_FONTSIZEUNIT === "em"
						? attributes.VERSENUMBERSTYLES_FONTSIZE / 10
						: attributes.VERSENUMBERSTYLES_FONTSIZE;
				const fontsizerule =
					VERSENUMBERSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + VERSENUMBERSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"VERSENUMBERSTYLES_FONTSIZEUNIT"
				].default = VERSENUMBERSTYLES_FONTSIZEUNIT;
				return setAttributes({ VERSENUMBERSTYLES_FONTSIZEUNIT });
			}

			const changeVerseNumberStyleFontColor = (color) => {
				const VERSENUMBERSTYLES_TEXTCOLOR = color.hex;
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{ color: (?:.*?); \}/,
						".bibleQuote.results p.versesParagraph span.verseNum { color: " +
							VERSENUMBERSTYLES_TEXTCOLOR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties[
					"VERSENUMBERSTYLES_TEXTCOLOR"
				].default = VERSENUMBERSTYLES_TEXTCOLOR;
				return setAttributes({ VERSENUMBERSTYLES_TEXTCOLOR });
			}

			const changeVerseNumberValign = (ev) => {
				//console.log('('+(typeof ev.currentTarget.value)+') ev.currentTarget.value = ' + ev.currentTarget.value );
				const VERSENUMBERSTYLES_VALIGN = parseInt(ev.currentTarget.value);
				//console.log('('+(typeof VERSENUMBERSTYLES_VALIGN)+') VERSENUMBERSTYLES_VALIGN = '+VERSENUMBERSTYLES_VALIGN);
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				let valignrule = { "vertical-align": "baseline" };
				switch (VERSENUMBERSTYLES_VALIGN) {
					case BGET.VALIGN.NORMAL:
						valignrule.position = "static";
						break;
					case BGET.VALIGN.SUPERSCRIPT:
						valignrule.position = "relative";
						valignrule.top = "-0.6em";
						break;
					case BGET.VALIGN.SUBSCRIPT:
						valignrule.position = "relative";
						valignrule.top = "0.6em;";
						break;
				}

				//console.log('valignrule =');
				//console.log(valignrule);
				//if we find the selector and the corresponding rule then we change it
				if (
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?position:))(.*?)(;.*)/.test(
						bbGetDynSS
					)
				) {
					//console.log('we have found a position rule to change');
					bbGetDynSS = bbGetDynSS.replace(
						/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?position:))(.*?)(;.*)/,
						`$1${valignrule.position}$4`
					);
				} else {
					//if we can't find the rule to edit, then we create it
					//console.log('we have not found a position rule to change, we must create it');
					//if we can at least find the corresponding selector, add rule to selector
					if (
						/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{/.test(
							bbGetDynSS
						)
					) {
						//console.log('we have not found at least the correct selector, we will add the rule to this selector');
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{)(.*?\})/,
							`$1position:${valignrule.position};$2`
						);
					}
					//otherwise create the rule ex-novo
					else {
						//console.log('we have not found the correct selector, we will add the selector and the rule');
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph span.verseNum { position: ${valignrule.position}; }
						`;
					}
				}
				//if we find the selector and the corresponding rule then we change it
				if (
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?vertical\-align:))(.*?)(;.*)/.test(
						bbGetDynSS
					)
				) {
					bbGetDynSS = bbGetDynSS.replace(
						/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?vertical\-align:))(.*?)(;.*)/,
						`$1${valignrule["vertical-align"]}$4`
					);
				} else {
					//if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if (
						/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{/.test(
							bbGetDynSS
						)
					) {
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{)(.*?\})/,
							`$1vertical-align:${valignrule["vertical-align"]};$2`
						);
					}
					//otherwise create the rule ex-novo
					else {
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph span.verseNum { vertical-align: ${valignrule["vertical-align"]}; }
						`;
					}
				}
				//if we find the selector and the corresponding rule then we change it (if BGET.VALIGN.NORMAL we remove it)
				if (
					/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?top:))(.*?)(;.*)/.test(
						bbGetDynSS
					)
				) {
					//console.log('we have found a top rule to change');
					if (VERSENUMBERSTYLES_VALIGN === BGET.VALIGN.NORMAL) {
						//console.log('VALIGN.NORMAL requires us to remove the top rule, now removing rule from selector');
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{.*?)top:.*?;(.*)/,
							`$1$2`
						);
					} else {
						//console.log('now changing the rule we found in the selector');
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{(.*?top:))(.*?)(;.*)/,
							`$1${valignrule.top}$4`
						);
					}
				} else if (VERSENUMBERSTYLES_VALIGN !== BGET.VALIGN.NORMAL) {
					//if we can't find the rule to edit, then we create it (except if BGET.VALIGN.NORMAL)
					//console.log('we did not find a top rule to change and VALIGN!=NORMAL so we must add a top rule');
					//if we can at least find the corresponding selector, add rule to selector
					if (
						/\.bibleQuote\.results p\.versesParagraph span\.verseNum \{/.test(
							bbGetDynSS
						)
					) {
						//console.log('we did find the selector in any case, now adding a top rule to the selector');
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph span\.verseNum \{)(.*?\})/,
							`$1top:${valignrule.top};$2`
						);
					}
					//otherwise create the rule ex-novo
					else {
						//console.log('we did not even find the selector so we will now add both the selector and the top rule');
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph span.verseNum { top: ${valignrule.top}; }
						`;
					}
				}
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"VERSENUMBERSTYLES_VALIGN"
				].default = VERSENUMBERSTYLES_VALIGN;
				return setAttributes({ VERSENUMBERSTYLES_VALIGN });
			}

			const changeVerseTextTextStyle = (ev) => {
				const target = parseInt(ev.currentTarget.value);
				let {
					VERSETEXTSTYLES_BOLD,
					VERSETEXTSTYLES_ITALIC,
					VERSETEXTSTYLES_UNDERLINE,
					VERSETEXTSTYLES_STRIKETHROUGH,
				} = attributes;
				switch (target) {
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

				let boldrule = VERSETEXTSTYLES_BOLD ? "bold" : "normal";
				let italicrule = VERSETEXTSTYLES_ITALIC ? "italic" : "normal";
				let decorationrule = "";
				let decorations = [];
				if (VERSETEXTSTYLES_UNDERLINE) {
					decorations.push("underline");
				}
				if (VERSETEXTSTYLES_STRIKETHROUGH) {
					decorations.push("line-through");
				}
				if (decorations.length === 0) {
					decorationrule = "none";
				} else {
					decorationrule = decorations.join(" ");
				}
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				//if we find the selector and the corresponding rule then we change it
				if (
					/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-weight:))(.*?)(;.*)/.test(
						bbGetDynSS
					)
				) {
					bbGetDynSS = bbGetDynSS.replace(
						/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-weight:))(.*?)(;.*)/,
						`$1${boldrule}$4`
					);
				} else {
					//if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if (/\.bibleQuote\.results p\.versesParagraph \{/.test(bbGetDynSS)) {
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph \{)(.*?\})/,
							`$1font-weight:${boldrule};$2`
						);
					}
					//otherwise create the rule ex-novo
					else {
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph { font-weight: ${boldrule}; }
						`;
					}
				}
				//if we find the selector and the corresponding rule then we change it
				if (
					/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-style:))(.*?)(;.*)/.test(
						bbGetDynSS
					)
				) {
					bbGetDynSS = bbGetDynSS.replace(
						/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-style:))(.*?)(;.*)/,
						`$1${italicrule}$4`
					);
				} else {
					//if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if (/\.bibleQuote\.results p\.versesParagraph \{/.test(bbGetDynSS)) {
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph \{)(.*?\})/,
							`$1font-style:${italicrule};$2`
						);
					}
					//otherwise create the rule ex-novo
					else {
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph { font-style: ${italicrule}; }
						`;
					}
				}
				//if we find the selector and the corresponding rule then we change it
				if (
					/(\.bibleQuote\.results p\.versesParagraph \{(.*?text\-decoration:))(.*?)(;.*)/.test(
						bbGetDynSS
					)
				) {
					bbGetDynSS = bbGetDynSS.replace(
						/(\.bibleQuote\.results p\.versesParagraph \{(.*?text\-decoration:))(.*?)(;.*)/,
						`$1${decorationrule}$4`
					);
				} else {
					//if we can't find the rule to edit, then we create it
					//if we can at least find the corresponding selector, add rule to selector
					if (/\.bibleQuote\.results p\.versesParagraph \{/.test(bbGetDynSS)) {
						bbGetDynSS = bbGetDynSS.replace(
							/(\.bibleQuote\.results p\.versesParagraph \{)(.*?\})/,
							`$1text-decoration:${decorationrule};$2`
						);
					}
					//otherwise create the rule ex-novo
					else {
						bbGetDynSS = `${bbGetDynSS}
						.bibleQuote.results p.versesParagraph { text-decoration: ${decorationrule}; }
						`;
					}
				}
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				switch (target) {
					case BGET.TEXTSTYLE.BOLD:
						BibleGetGlobal.BGETProperties[
							"VERSETEXTSTYLES_BOLD"
						].default = VERSETEXTSTYLES_BOLD;
						return setAttributes({ VERSETEXTSTYLES_BOLD });
					case BGET.TEXTSTYLE.ITALIC:
						BibleGetGlobal.BGETProperties[
							"VERSETEXTSTYLES_ITALIC"
						].default = VERSETEXTSTYLES_ITALIC;
						return setAttributes({ VERSETEXTSTYLES_ITALIC });
					case BGET.TEXTSTYLE.UNDERLINE:
						BibleGetGlobal.BGETProperties[
							"VERSETEXTSTYLES_UNDERLINE"
						].default = VERSETEXTSTYLES_UNDERLINE;
						return setAttributes({ VERSETEXTSTYLES_UNDERLINE });
					case BGET.TEXTSTYLE.STRIKETHROUGH:
						BibleGetGlobal.BGETProperties[
							"VERSETEXTSTYLES_STRIKETHROUGH"
						].default = VERSETEXTSTYLES_STRIKETHROUGH;
						return setAttributes({ VERSETEXTSTYLES_STRIKETHROUGH });
				}
			}

			const changeVerseTextFontSize = (VERSETEXTSTYLES_FONTSIZE) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const fontsize =
					attributes.VERSETEXTSTYLES_FONTSIZEUNIT === "em"
						? VERSETEXTSTYLES_FONTSIZE / 10
						: VERSETEXTSTYLES_FONTSIZE;
				const fontsizerule =
					attributes.VERSETEXTSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + attributes.VERSETEXTSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"VERSETEXTSTYLES_FONTSIZE"
				].default = VERSETEXTSTYLES_FONTSIZE;
				return setAttributes({ VERSETEXTSTYLES_FONTSIZE });
			}

			const changeVerseTextFontSizeUnit = (VERSETEXTSTYLES_FONTSIZEUNIT) => {
				let bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				const fontsize =
					VERSETEXTSTYLES_FONTSIZEUNIT === "em"
						? attributes.VERSETEXTSTYLES_FONTSIZE / 10
						: attributes.VERSETEXTSTYLES_FONTSIZE;
				const fontsizerule =
					VERSETEXTSTYLES_FONTSIZEUNIT === "inherit"
						? "inherit"
						: fontsize + VERSETEXTSTYLES_FONTSIZEUNIT;
				bbGetDynSS = bbGetDynSS.replace(
					/(\.bibleQuote\.results p\.versesParagraph \{(.*?font\-size:))(.*?)(;.*)/,
					`$1${fontsizerule}$4`
				);
				jQuery("#bibleGetDynamicStylesheet").text(bbGetDynSS);
				BibleGetGlobal.BGETProperties[
					"VERSETEXTSTYLES_FONTSIZEUNIT"
				].default = VERSETEXTSTYLES_FONTSIZEUNIT;
				return setAttributes({ VERSETEXTSTYLES_FONTSIZEUNIT });
			}

			const changeVerseTextStyleFontColor = (color) => {
				const VERSETEXTSTYLES_TEXTCOLOR = color.hex;
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results p\.versesParagraph \{ color: (?:.*?); \}/,
						".bibleQuote.results p.versesParagraph { color: " +
							VERSETEXTSTYLES_TEXTCOLOR +
							"; }"
					)
				);
				BibleGetGlobal.BGETProperties["VERSETEXTSTYLES_TEXTCOLOR"].default = VERSETEXTSTYLES_TEXTCOLOR;
				return setAttributes({ VERSETEXTSTYLES_TEXTCOLOR });
			}

			const setFontFamily = PARAGRAPHSTYLES_FONTFAMILY => {
				//console.log('setFontFamily was called');
				let fontType = 'websafe';
				if ( BibleGetGlobal.haveGFonts === "SUCCESS"
						&& typeof BibleGetGlobal.GFonts === 'object'
						&& BibleGetGlobal.GFonts !== null
						&& BibleGetGlobal.GFonts.hasOwnProperty('items')
						&& BibleGetGlobal.GFonts.items.length > 0
						&& BibleGetGlobal.GFonts.items.filter(value => value.family.replace(/ /g,"+") === PARAGRAPHSTYLES_FONTFAMILY ).length
					) {
					//console.log('gfont was detected');
					fontType = 'gfont';
				}
				if (fontType === 'gfont' && $("link[href*='" + PARAGRAPHSTYLES_FONTFAMILY + "']").length === 0){
					//console.log('we do not seem to have a stylesheet for gfont family "' + PARAGRAPHSTYLES_FONTFAMILY + '" yet');
					$("link:last").after(
						'<link href="https://fonts.googleapis.com/css?family=' + PARAGRAPHSTYLES_FONTFAMILY + '" rel="stylesheet" type="text/css">'
					);
				}
				const fontFamilyRdbl = PARAGRAPHSTYLES_FONTFAMILY.replace(/[\+]/g, " ");
				const bbGetDynSS = jQuery("#bibleGetDynamicStylesheet").text();
				jQuery("#bibleGetDynamicStylesheet").text(
					bbGetDynSS.replace(
						/\.bibleQuote\.results \{ font\-family: (?:.*?); \}/,
						".bibleQuote.results { font-family: '" + fontFamilyRdbl + "'; }"
					)
				);
				BibleGetGlobal.BGETProperties["PARAGRAPHSTYLES_FONTFAMILY"].default = PARAGRAPHSTYLES_FONTFAMILY;
				return setAttributes({ PARAGRAPHSTYLES_FONTFAMILY });
			}

			const doKeywordSearch = () => {
				const keyword = $(".bibleGetSearch input")
						.val()
						.replace(
							/(?:(?![A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])[\s\S])/g,
							""
						);//, //remove non-word characters from keyword
					//$searchresults = null,
					//$searchresultsOrderedByReference = null;
				if (keyword.length < 3) {
					alert(
						__(
							"You cannot perform a search using less than three letters.",
							"bibleget-io"
						)
					);
					return false;
				}
				//console.log($('.bibleGetSearch input').val());
				//console.log(attributes.VERSION);
				if (attributes.VERSION.length > 1) {
					const dlg = jQuery("<div>", {
						html: __(
							"You cannot select more than one Bible version when doing a keyword search",
							"bibleget-io"
						),
					})
						.appendTo("body")
						.dialog({
							close: function () {
								$(this).dialog("destroy").remove();
							},
							dialogClass: "bibleGetSearchDlg",
						});
					dlg.data("uiDialog")._title = function (title) {
						title.html(this.options.title);
					};
					dlg.dialog(
						"option",
						"title",
						'<span class="dashicons dashicons-warning"></span>' +
							__("Notice", "bibleget-io")
					);
				} else if (attributes.VERSION.length === 0) {
					const dlg = jQuery("<div>", {
						html: __(
							"You must select at least one Bible version in order to do a keyword search",
							"bibleget-io"
						),
					})
						.appendTo("body")
						.dialog({
							close: function () {
								$(this).dialog("destroy").remove();
							},
							dialogClass: "bibleGetSearchDlg",
						});
					dlg.data("uiDialog")._title = function (title) {
						title.html(this.options.title);
					};
					dlg.dialog(
						"option",
						"title",
						'<span class="dashicons dashicons-warning"></span>' +
							__("Notice", "bibleget-io")
					);
				} else {
					//console.log('making ajax call');
					$.ajax({
						type: "post",
						url: BibleGetGlobal.ajax_url,
						data: {
							action: "searchByKeyword",
							keyword: keyword,
							version: attributes.VERSION[0],
						},
						dataType: "json",
						success: (response) => {
							//console.log('successful ajax call, search results:');
							//console.log(results);
							if (
								response.hasOwnProperty("results") &&
								typeof response.results === "object"
							) {
								if (response.results.length === 0) {
									/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
									const dlgNoResults = jQuery("<div>", {
										html:
											"<h3>" +
											__(
												"There are no search results for {k} in the version {v}",
												"bibleget-io"
											).formatUnicorn({
												k: "&lt;" + response.info.keyword + "&gt;",
												v: response.info.version,
											}) +
											"</h3>",
									})
										.appendTo("body")
										.dialog({
											close: function () {
												$(this).dialog("destroy").remove();
											},
											dialogClass: "bibleGetSearchDlg",
											//position: { my: 'center', at: 'center' },
										});
									dlgNoResults.data("uiDialog")._title = function (title) {
										title.html(this.options.title);
									};
									dlgNoResults.dialog(
										"option",
										"title",
										'<span class="dashicons dashicons-warning"></span>' +
											__("Search results", "bibleget-io")
									);
								} else {
									/* translators: this string is capitalized because it is the head of a column in a table */
									const BOOK = __("BOOK", "bibleget-io"),
										/* translators: this string is capitalized because it is the head of a column in a table */
										CHAPTER = __("CHAPTER", "bibleget-io"),
										/* translators: this string is capitalized because it is the head of a column in a table */
										VERSE = __("VERSE", "bibleget-io"),
										/* translators: this string is capitalized because it is the head of a column in a table */
										VERSETEXT = __("VERSE TEXT", "bibleget-io"),
										/* translators: this string is capitalized because it is the head of a column in a table */
										ACTION = __("ACTION", "bibleget-io"),
										/* translators: this string is capitalized because it is the head of a column in a table */
										FILTER_BY_KEYWORD = __("Filter by keyword", "bibleget-io"),
										$searchresults = response,
										$searchresultsOrderedByReference = JSON.parse(
											JSON.stringify(response)
										),
										numResultsStr =
											response.results.length === 1
												/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
												? __(
														"There is {n} result for the keyword {k} in the version {v}",
														"bibleget-io"
													).formatUnicorn({
														n: "<b>" + response.results.length + "</b>",
														k: "<b>" + response.info.keyword + "</b>",
														v: "<b>" + response.info.version + "</b>",
													})
												/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
												: __(
														"There are {n} results for the keyword {k} in the version {v}.",
														"bibleget-io"
													).formatUnicorn({
														n: "<b>" + response.results.length + "</b>",
														k: "<b>" + response.info.keyword + "</b>",
														v: "<b>" + response.info.version + "</b>",
													});
									$searchresultsOrderedByReference.results.sort((a, b) => a.booknum - b.booknum);
									const searchResultsHtmlMarkup = `
										<div id="searchResultsContainer"> <!-- this is our flex container -->
											<div id="searchResultsControlPanel" class="searchResultsFlexChild">
												<div class="controlComponent">
													<label>${FILTER_BY_KEYWORD}<input type="text" id="keywordFilter" /></label>
													<button id="APPLY_FILTER"><i class="fa fa-filter" aria-hidden="true"></i><span class="label">${__(
														"Apply filter",
														"bibleget-io"
													)}</span></button>
												</div>
												<div class="controlComponent">
													<button id="ORDER_RESULTS_BY"><i class="fa fa-sort" aria-hidden="true"></i><span class="label">${__(
														"Order results by reference",
														"bibleget-io"
													)}</span></button>
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
									let $quotesArr;
									const dlg = jQuery("<div>", { html: searchResultsHtmlMarkup })
											.appendTo("body")
											.dialog({
												open: () => {
													$quotesArr = $(
														".block-editor-block-inspector .bibleGetQuery"
													)
														.find("input")
														.val()
														.split(";");
													let bookChapterVerse, enabledState;
													for (const $result of response.results) {
														bookChapterVerse =
															BibleGetGlobal.biblebooks.fullname[
																parseInt($result.univbooknum) - 1
															].split("|")[0] +
															" " +
															$result.chapter +
															":" +
															$result.verse;
														enabledState = $quotesArr.includes(bookChapterVerse)
															? " disabled"
															: "";
														jQuery("#SearchResultsTable tbody").append(
															"<tr><td><button" +
																enabledState +
																'><i class="fa fa-plus" aria-hidden="true"></i>' +
																__("Insert", "bibleget-io") +
																'</button><input type="hidden" class="searchResultJSON" value="' +
																encodeURIComponent(JSON.stringify($result)) +
																'" /></td><td>' +
																bookChapterVerse +
																"</td><td>" +
																addMark($result.text, [
																	response.info.keyword,
																	stripDiacritics(response.info.keyword),
																]) +
																"</td></tr>"
														);
													}
													$("#searchResultsContainer").on(
														"click",
														"button",
														function () {
															//First check the context of the button that was clicked: control panel or searchResultsContents
															let $filterLabel,
																$orderbyLabel,
																$ORDER_BY,
																$FILTER_BY,
																REFRESH = false;
															switch (
																$(this)
																	.parents(".searchResultsFlexChild")
																	.attr("id")
															) {
																case "searchResultsControlPanel":
																	$orderbyLabel = $("#ORDER_RESULTS_BY").find(
																		"span.label"
																	);
																	if (
																		$orderbyLabel.text() ==
																		__(
																			"Order results by reference",
																			"bibleget-io"
																		)
																	) {
																		$ORDER_BY = "importance";
																	} else if (
																		$orderbyLabel.text() ==
																		__(
																			"Order results by importance",
																			"bibleget-io"
																		)
																	) {
																		$ORDER_BY = "reference";
																	}

																	$filterLabel = $("#APPLY_FILTER").find(
																		"span.label"
																	);
																	$FILTER_BY =
																		$("#keywordFilter").val() !== "" &&
																		$("#keywordFilter").val().length > 2
																			? $("#keywordFilter").val()
																			: "";

																	switch ($(this).attr("id")) {
																		case "ORDER_RESULTS_BY":
																			REFRESH = true;
																			if (
																				$orderbyLabel.text() ==
																				__(
																					"Order results by reference",
																					"bibleget-io"
																				)
																			) {
																				$ORDER_BY = "reference";
																				$orderbyLabel.text(
																					__(
																						"Order results by importance",
																						"bibleget-io"
																					)
																				);
																			} else {
																				$ORDER_BY = "importance";
																				$orderbyLabel.text(
																					__(
																						"Order results by reference",
																						"bibleget-io"
																					)
																				);
																			}
																			break;
																		case "APPLY_FILTER":
																			if (
																				$filterLabel.text() ==
																				__("Apply filter", "bibleget-io")
																			) {
																				if (
																					$FILTER_BY != "" &&
																					$FILTER_BY.length > 2
																				) {
																					REFRESH = true;
																					$filterLabel.text(
																						__("Remove filter", "bibleget-io")
																					);
																					$("#keywordFilter").prop(
																						"readonly",
																						true
																					);
																				} else {
																					if ($FILTER_BY == "") {
																						alert(
																							"Cannot filter by an empty string!"
																						);
																					} else if ($FILTER_BY.length < 3) {
																						alert(
																							"Keyword must be at least three characters long"
																						);
																					}
																				}
																			} else {
																				$("#keywordFilter").val("");
																				$FILTER_BY = "";
																				REFRESH = true;
																				$filterLabel.text(
																					__("Apply filter", "bibleget-io")
																				);
																				$("#keywordFilter").prop(
																					"readonly",
																					false
																				);
																			}
																			break;
																	}

																	if (REFRESH) {
																		refreshTable(
																			{
																				ORDER_BY: $ORDER_BY,
																				FILTER_BY: $FILTER_BY,
																			},
																			$searchresults,
																			$searchresultsOrderedByReference
																		);
																	}

																	break;
																case "searchResultsContents":
																	//alert('button was clicked! it is in the context of the searchResultsContents');
																	//alert($(this).next().prop('tagName') );
																	if (
																		$(this).next("input[type=hidden]").length !=
																		0
																	) {
																		//showSpinner();
																		let currentRef = $(this)
																			.parent("td")
																			.next("td")
																			.text();
																		if (
																			$quotesArr.includes(bookChapterVerse) ===
																			false
																		) {
																			$(this)
																				.addClass("disabled")
																				.prop("disabled", true);
																			let $inputval = $(this)
																				.next("input[type=hidden]")
																				.val();
																			let $resultsStr = decodeURIComponent(
																				$inputval
																			);
																			//alert($resultsStr);
																			let $result = JSON.parse($resultsStr);
																			let $resultsObj = {};
																			$resultsObj.results = [$result];
																			$resultsObj.errors =
																				$searchresults.errors;
																			$resultsObj.info = $searchresults.info;
																			$quotesArr.push(currentRef);
																			$(
																				".block-editor-block-inspector .bibleGetQuery"
																			)
																				.find("input")
																				.val($quotesArr.join(";"));
																			changeQuery($quotesArr.join(";"));
																		}
																	} else {
																		alert("could not select next hidden input");
																	}
																	break;
															}
														}
													);
												},
												close: function () {
													$("#searchResultsContainer").off("click");
													$(this).dialog("destroy").remove();
												},
												dialogClass: "bibleGetSearchDlg",
												position: { my: "center top", at: "center top" },
												width: "80%", //,
											});
									dlg.data("uiDialog")._title = function (title) {
										title.html(this.options.title);
									};
									dlg.dialog(
										"option",
										"title",
										'<span class="dashicons dashicons-code-standards"></span>' +
											__("Search results", "bibleget-io")
									);
								}
							}
						},
						error: () => {
							// console.log(
							//   "there has been an error: " + textStatus + " :: " + errorThrown
							// );
						},
					});
				}
			}

			const refreshTable = (
				options,
				$searchresults,
				$searchresultsOrderedByReference
			) => {
				let counter = 0,
					enabledState,
					bookChapterVerse,
					$quotesArr = $(".block-editor-block-inspector .bibleGetQuery")
						.find("input")
						.val()
						.split(";"),
					numResultsStr = "";
				jQuery("#SearchResultsTable tbody").empty();
				switch (options.ORDER_BY) {
					case "importance":
						for (const $result of $searchresults.results) {
							bookChapterVerse =
								BibleGetGlobal.biblebooks.fullname[
									parseInt($result.univbooknum) - 1
								].split("|")[0] +
								" " +
								$result.chapter +
								":" +
								$result.verse;
							enabledState = $quotesArr.includes(bookChapterVerse)
								? " disabled"
								: "";
							if (options.FILTER_BY == "") {
								jQuery("#SearchResultsTable tbody").append(
									"<tr><td><button" +
										enabledState +
										'><i class="fa fa-plus" aria-hidden="true"></i>' +
										__("Insert", "bibleget-io") +
										'</button><input type="hidden" class="searchResultJSON" value="' +
										encodeURIComponent(JSON.stringify($result)) +
										'" /></td><td>' +
										bookChapterVerse +
										"</td><td>" +
										addMark($result.text, [
											$searchresults.info.keyword,
											stripDiacritics($searchresults.info.keyword),
										]) +
										"</td></tr>"
								);
							} else {
								let $filter = new RegExp(
									`(${options.FILTER_BY}|${stripDiacritics(
										options.FILTER_BY
									)}|${addDiacritics(options.FILTER_BY)})`,
									"i"
								);
								if ($filter.test($result.text)) {
									jQuery("#SearchResultsTable tbody").append(
										"<tr><td><button" +
											enabledState +
											'><i class="fa fa-plus" aria-hidden="true"></i>' +
											__("Insert", "bibleget-io") +
											'</button><input type="hidden" class="searchResultJSON" value="' +
											encodeURIComponent(JSON.stringify($result)) +
											'" /></td><td>' +
											bookChapterVerse +
											"</td><td>" +
											addMark($result.text, [
												$searchresults.info.keyword,
												stripDiacritics($searchresults.info.keyword),
												options.FILTER_BY,
												stripDiacritics(options.FILTER_BY),
											]) +
											"</td></tr>"
									);
									++counter;
								}
							}
						}
						break;
					case "reference":
						for (const $result of $searchresultsOrderedByReference.results) {
							bookChapterVerse =
								BibleGetGlobal.biblebooks.fullname[
									parseInt($result.univbooknum) - 1
								].split("|")[0] +
								" " +
								$result.chapter +
								":" +
								$result.verse;
							enabledState = $quotesArr.includes(bookChapterVerse)
								? " disabled"
								: "";
							if (options.FILTER_BY == "") {
								jQuery("#SearchResultsTable tbody").append(
									"<tr><td><button" +
										enabledState +
										'><i class="fa fa-plus" aria-hidden="true"></i>' +
										__("Insert", "bibleget-io") +
										'</button><input type="hidden" class="searchResultJSON" value="' +
										encodeURIComponent(JSON.stringify($result)) +
										'" /></td><td>' +
										bookChapterVerse +
										"</td><td>" +
										addMark($result.text, [
											$searchresults.info.keyword,
											stripDiacritics($searchresults.info.keyword),
										]) +
										"</td></tr>"
								);
							} else {
								let $filter = new RegExp(
									`(${options.FILTER_BY}|${stripDiacritics(
										options.FILTER_BY
									)}|${addDiacritics(options.FILTER_BY)})`,
									"i"
								);
								if ($filter.test($result.text)) {
									jQuery("#SearchResultsTable tbody").append(
										"<tr><td><button" +
											enabledState +
											'><i class="fa fa-plus" aria-hidden="true"></i>' +
											__("Insert", "bibleget-io") +
											'</button><input type="hidden" class="searchResultJSON" value="' +
											encodeURIComponent(JSON.stringify($result)) +
											'" /></td><td>' +
											bookChapterVerse +
											"</td><td>" +
											addMark($result.text, [
												$searchresults.info.keyword,
												stripDiacritics($searchresults.info.keyword),
												options.FILTER_BY,
												stripDiacritics(options.FILTER_BY),
											]) +
											"</td></tr>"
									);
									++counter;
								}
							}
						}
						break;
				}
				if (options.FILTER_BY == "") {
					if ($searchresults.results.length === 1) {
						/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
						numResultsStr = __(
							"There is {n} result for the keyword {k} in the version {v}.",
							"bibleget-io"
						);
					} else {
						/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
						numResultsStr = __(
							"There are {n} results for the keyword {k} in the version {v}.",
							"bibleget-io"
						);
					}
					jQuery("#searchResultsInfo").html(
						numResultsStr.formatUnicorn({
							n: "<b>" + $searchresults.results.length + "</b>",
							k: "<b>" + $searchresults.info.keyword + "</b>",
							v: "<b>" + $searchresults.info.version + "</b>",
						})
					);
				} else {
					if (counter == 1) {
						/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
						numResultsStr = __(
							"There is {n} result for the keyword {k} filtered by {f} in the version {v}.",
							"bibleget-io"
						);
					} else if (counter > 1) {
						/* translators: do not remove or translate anything within the curly brackets. They are used for string formatting in javascript */
						numResultsStr = __(
							"There are {n} results for the keyword {k} filtered by {f} in the version {v}.",
							"bibleget-io"
						);
					}
					jQuery("#searchResultsInfo").html(
						numResultsStr.formatUnicorn({
							n: "<b>" + counter + "</b>",
							k: "<b>" + $searchresults.info.keyword + "</b>",
							f: "<b>" + options.FILTER_BY + "</b>",
							v: "<b>" + $searchresults.info.version + "</b>",
						})
					);
				}
			}

			const langCompare = (a, b) => {
				if (a.label < b.label) {
					return -1;
				}
				if (a.label > b.label) {
					return 1;
				}
				return 0;
			};

			const languageNames = new Intl.DisplayNames(
				[BibleGetGlobal.currentLangISO],
				{ type: "language" }
			);

			let bibleVersionsOptGroupOptions = [];
			//BibleGetGlobal.versionsByLang.langs.sort();
			for (const [prop, val] of Object.entries(
				BibleGetGlobal.versionsByLang.versions
			)) {
				//let isoFromLang = getKeyByValue(BibleGetGlobal.langCodes,prop);
				const isoFromLang = ISOcodeFromLang[prop];
				const langInCurrentLocale = languageNames.of(isoFromLang);
				//console.log('isoFromLang = ' + isoFromLang + ', langInCurrentLocale =' + langInCurrentLocale);
				const newOptGroup = { options: [], label: langInCurrentLocale };
				for (const [prop1, val1] of Object.entries(val)) {
					const newOption = {
						value: prop1,
						label: prop1 + " - " + val1.fullname + " (" + val1.year + ")",
						title: prop1 + " - " + val1.fullname + " (" + val1.year + ")",
					};
					newOptGroup.options.push(newOption);
				}
				bibleVersionsOptGroupOptions.push(newOptGroup);
			}
			bibleVersionsOptGroupOptions.sort(langCompare);

			return createElement(
				"div",
				{},
				//Preview a block with a PHP render callback
				createElement(ServerSideRender, {
					block: "bibleget/bible-quote",
					attributes: attributes,
					httpMethod: "POST",
				}),
				createElement(
					Fragment,
					{},
					createElement(
						InspectorControls,
						{},
						createElement(
							PanelBody,
							{
								title: __("Get Bible quote", "bibleget-io"),
								initialOpen: true,
								icon: "download",
								className: "getBibleQuotePanel",
							},
							createElement(
								PanelRow,
								{},
								//Select version to quote from
								createElement(
									BaseControl,
									{
										label: __("Bible Version", "bibleget-io"),
										help: createElement("span", {
											dangerouslySetInnerHTML: {
												/*translators: do not change the html tags or their attributes */
												__html: __(
													'You can select more than one Bible version by holding down CTRL while clicking. Likewise you can remove a single Bible version from a multiple selection by holding down CTRL while clicking. Note that selections made here will not change the default preferred version, which should be set in <a href="{href}">the plugin settings area</a> instead.',
													"bibleget-io"
												).formatUnicorn({
													href: BibleGetGlobal.bibleget_admin_url,
												}),
											},
										}),
									},
									createElement(OptGroupControl, {
										className:
											"bibleVersionSelect components-select-control__input",
										value: attributes.VERSION,
										onChange: changeVersion,
										multiple: true,
										options: bibleVersionsOptGroupOptions,
									})
								)
							),
							createElement(
								PanelRow,
								{},
								//A simple text control for bible quote query
								createElement(TextControl, {
									value: attributes.QUERY,
									help: createElement("span", {
										dangerouslySetInnerHTML: {
											/*translators: do not change the html tags or their attributes */
											__html: __(
												'Type the desired Bible quote using the <a href="{href}" target="_blank">standard notation for Bible citations</a>. You can chain multiple quotes together with semicolons.',
												"bibleget-io"
											).formatUnicorn({
												href: "https://en.wikipedia.org/wiki/Bible_citation",
											}),
										},
									}),
									label: __("Bible Reference", "bibleget-io"),
									className: "bibleGetQuery",
									onChange: changeQuery,
								})
							),
							createElement(
								PanelRow,
								{},
								//Select whether the text based on the Hebrew should be preferred to the text based on the Greek
								createElement(ToggleControl, {
									checked: attributes.PREFERORIGIN === BGET.PREFERORIGIN.HEBREW,
									label: __("Prefer GREEK <|> HEBREW origin", "bibleget-io"),
									help: __(
										"Some Bible passages offer two versions of the text, based on the Greek and the Hebrew texts. This option will determine which of the two versions should be returned.",
										"bibleget-io"
									),
									onChange: changePreferOrigin,
								})
							),
							createElement(
								PanelRow,
								{},
								//Select whether this will be a popup or not
								createElement(ToggleControl, {
									checked: attributes.POPUP,
									label: __("Display in Popup", "bibleget-io"),
									help: __(
										"When activated, only the reference to the Bible quote will be shown in the document, and clicking on it will show the text of the Bible quote in a popup window.",
										"bibleget-io"
									),
									onChange: changePopup,
								})
							),
							createElement(
								PanelRow,
								{},
								//A simple text control for bible quote search
								createElement(
									BaseControl,
									{
										label: __(
											"Search for Bible quotes by keyword",
											"bibleget-io"
										),
										help: __(
											"You cannot choose more than one Bible version when searching by keyword.",
											"bibleget-io"
										),
									},
									createElement(SearchBoxControl, {
										onButtonClick: doKeywordSearch,
									})
								)
							)
						),
						createElement(
							PanelBody,
							{
								title: __("Layout Bible version", "bibleget-io"),
								initialOpen: false,
								icon: "layout",
							},
							createElement(
								PanelRow,
								{},
								createElement(ToggleControl, {
									checked: attributes.LAYOUTPREFS_SHOWBIBLEVERSION, //default BGET.VISIBILITY.SHOW
									label: __("Show Bible version", "bibleget-io"),
									onChange: changeBibleVersionVisibility,
								})
							),
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{ label: __("Bible version alignment", "bibleget-io") },
									createElement(
										ButtonGroup,
										{ className: "bibleGetButtonGroup" },
										createElement(Button, {
											icon: "editor-alignleft",
											value: BGET.ALIGN.LEFT,
											isPrimary:
												attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT ===
												BGET.ALIGN.LEFT,
											isSecondary:
												attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT !==
												BGET.ALIGN.LEFT,
											onClick: changeBibleVersionAlign,
											title: __("Bible Version align left", "bibleget-io"),
										}),
										createElement(Button, {
											icon: "editor-aligncenter",
											value: BGET.ALIGN.CENTER,
											isPrimary:
												attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT ===
												BGET.ALIGN.CENTER,
											isSecondary:
												attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT !==
												BGET.ALIGN.CENTER,
											onClick: changeBibleVersionAlign,
											title: __("Bible Version align center", "bibleget-io"),
										}),
										createElement(Button, {
											icon: "editor-alignright",
											value: BGET.ALIGN.RIGHT,
											isPrimary:
												attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT ===
												BGET.ALIGN.RIGHT,
											isSecondary:
												attributes.LAYOUTPREFS_BIBLEVERSIONALIGNMENT !==
												BGET.ALIGN.RIGHT,
											onClick: changeBibleVersionAlign,
											title: __("Bible Version align right", "bibleget-io"),
										})
									)
								)
							),
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{
										label: __("Bible version position", "bibleget-io"),
										help: __(
											"Position the Bible version above or below the quotes from that version",
											"bibleget-io"
										),
									},
									createElement(
										ButtonGroup,
										{ className: "bibleGetButtonGroup" },
										createElement(Button, {
											icon: "arrow-up-alt",
											value: BGET.POS.TOP,
											isPrimary:
												attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION ===
												BGET.POS.TOP,
											isSecondary:
												attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION !==
												BGET.POS.TOP,
											onClick: changeBibleVersionPos,
											title: __("Bible Version position top", "bibleget-io"),
										}),
										createElement(Button, {
											icon: "arrow-down-alt",
											value: BGET.POS.BOTTOM,
											isPrimary:
												attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION ===
												BGET.POS.BOTTOM,
											isSecondary:
												attributes.LAYOUTPREFS_BIBLEVERSIONPOSITION !==
												BGET.POS.BOTTOM,
											onClick: changeBibleVersionPos,
											title: __("Bible Version position bottom", "bibleget-io"),
										})
									)
								)
							),
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{
										label: __("Bible version wrap", "bibleget-io"),
										help: __(
											"Wrap the Bible version in parentheses or brackets",
											"bibleget-io"
										),
									},
									createElement(
										ButtonGroup,
										{ className: "bibleGetButtonGroup" },
										createElement(
											Button,
											{
												//label: __('none','bibleget-io'),
												value: BGET.WRAP.NONE,
												isPrimary:
													attributes.LAYOUTPREFS_BIBLEVERSIONWRAP ===
													BGET.WRAP.NONE,
												isSecondary:
													attributes.LAYOUTPREFS_BIBLEVERSIONWRAP !==
													BGET.WRAP.NONE,
												onClick: changeBibleVersionWrap,
												title: __("Wrap none", "bibleget-io"),
											},
											__("none", "bibleget-io")
										),
										createElement(
											Button,
											{
												//label: __('parentheses', 'bibleget-io'),
												value: BGET.WRAP.PARENTHESES,
												isPrimary:
													attributes.LAYOUTPREFS_BIBLEVERSIONWRAP ===
													BGET.WRAP.PARENTHESES,
												isSecondary:
													attributes.LAYOUTPREFS_BIBLEVERSIONWRAP !==
													BGET.WRAP.PARENTHESES,
												onClick: changeBibleVersionWrap,
												title: __("Wrap in parentheses", "bibleget-io"),
											},
											__("parentheses", "bibleget-io")
										),
										createElement(
											Button,
											{
												//label: __('brackets', 'bibleget-io'),
												value: BGET.WRAP.BRACKETS,
												isPrimary:
													attributes.LAYOUTPREFS_BIBLEVERSIONWRAP ===
													BGET.WRAP.BRACKETS,
												isSecondary:
													attributes.LAYOUTPREFS_BIBLEVERSIONWRAP !==
													BGET.WRAP.BRACKETS,
												onClick: changeBibleVersionWrap,
												title: __("Wrap in brackets", "bibleget-io"),
											},
											__("brackets", "bibleget-io")
										)
									)
								)
							)
						),
						createElement(
							PanelBody,
							{
								title: __("Layout Book / Chapter", "bibleget-io"),
								initialOpen: false,
								icon: "layout",
							},
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{ label: __("Book / Chapter alignment", "bibleget-io") },
									createElement(
										ButtonGroup,
										{ className: "bibleGetButtonGroup" },
										createElement(Button, {
											icon: "editor-alignleft",
											value: BGET.ALIGN.LEFT,
											isPrimary:
												attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT ===
												BGET.ALIGN.LEFT,
											isSecondary:
												attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT !==
												BGET.ALIGN.LEFT,
											onClick: changeBookChapterAlign,
											title: __("Book / Chapter align left", "bibleget-io"),
										}),
										createElement(Button, {
											icon: "editor-aligncenter",
											value: BGET.ALIGN.CENTER,
											isPrimary:
												attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT ===
												BGET.ALIGN.CENTER,
											isSecondary:
												attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT !==
												BGET.ALIGN.CENTER,
											onClick: changeBookChapterAlign,
											title: __("Book / Chapter align center", "bibleget-io"),
										}),
										createElement(Button, {
											icon: "editor-alignright",
											value: BGET.ALIGN.RIGHT,
											isPrimary:
												attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT ===
												BGET.ALIGN.RIGHT,
											isSecondary:
												attributes.LAYOUTPREFS_BOOKCHAPTERALIGNMENT !==
												BGET.ALIGN.RIGHT,
											onClick: changeBookChapterAlign,
											title: __("Book / Chapter align right", "bibleget-io"),
										})
									)
								)
							),
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{
										label: __("Book / Chapter position", "bibleget-io"),
										help: __(
											"Position the book and chapter above or below each quote, or inline with the quote",
											"bibleget-io"
										),
									},
									createElement(
										ButtonGroup,
										{ className: "bibleGetButtonGroup" },
										createElement(Button, {
											icon: "arrow-up-alt",
											value: BGET.POS.TOP,
											isPrimary:
												attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION ===
												BGET.POS.TOP,
											isSecondary:
												attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION !==
												BGET.POS.TOP,
											onClick: changeBookChapterPos,
											title: __("Book / Chapter position top", "bibleget-io"),
										}),
										createElement(Button, {
											icon: "arrow-down-alt",
											value: BGET.POS.BOTTOM,
											isPrimary:
												attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION ===
												BGET.POS.BOTTOM,
											isSecondary:
												attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION !==
												BGET.POS.BOTTOM,
											onClick: changeBookChapterPos,
											title: __(
												"Book / Chapter position bottom",
												"bibleget-io"
											),
										}),
										createElement(Button, {
											icon: "arrow-left-alt",
											value: BGET.POS.BOTTOMINLINE,
											isPrimary:
												attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION ===
												BGET.POS.BOTTOMINLINE,
											isSecondary:
												attributes.LAYOUTPREFS_BOOKCHAPTERPOSITION !==
												BGET.POS.BOTTOMINLINE,
											onClick: changeBookChapterPos,
											title: __(
												"Book / Chapter position bottom inline",
												"bibleget-io"
											),
										})
									)
								)
							),
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{
										label: __("Book / Chapter wrap", "bibleget-io"),
										help: __(
											"Wrap the book and chapter with parentheses or brackets",
											"bibleget-io"
										),
									},
									createElement(
										ButtonGroup,
										{ className: "bibleGetButtonGroup" },
										createElement(
											Button,
											{
												value: BGET.WRAP.NONE,
												isPrimary:
													attributes.LAYOUTPREFS_BOOKCHAPTERWRAP ===
													BGET.WRAP.NONE,
												isSecondary:
													attributes.LAYOUTPREFS_BOOKCHAPTERWRAP !==
													BGET.WRAP.NONE,
												onClick: changeBookChapterWrap,
												title: __("Book / Chapter wrap none", "bibleget-io"),
											},
											__("none", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.WRAP.PARENTHESES,
												isPrimary:
													attributes.LAYOUTPREFS_BOOKCHAPTERWRAP ===
													BGET.WRAP.PARENTHESES,
												isSecondary:
													attributes.LAYOUTPREFS_BOOKCHAPTERWRAP !==
													BGET.WRAP.PARENTHESES,
												onClick: changeBookChapterWrap,
												title: __(
													"Book / Chapter wrap parentheses",
													"bibleget-io"
												),
											},
											__("parentheses", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.WRAP.BRACKETS,
												isPrimary:
													attributes.LAYOUTPREFS_BOOKCHAPTERWRAP ===
													BGET.WRAP.BRACKETS,
												isSecondary:
													attributes.LAYOUTPREFS_BOOKCHAPTERWRAP !==
													BGET.WRAP.BRACKETS,
												onClick: changeBookChapterWrap,
												title: __(
													"Book / Chapter wrap brackets",
													"bibleget-io"
												),
											},
											__("brackets", "bibleget-io")
										)
									)
								)
							),
							createElement(
								PanelRow,
								{},
								createElement(ToggleControl, {
									checked: attributes.LAYOUTPREFS_BOOKCHAPTERFULLQUERY, //default false
									label: __("Show full reference", "bibleget-io"),
									help: __(
										"When activated, the full reference including verses quoted will be shown with the book and chapter",
										"bibleget-io"
									),
									onChange: changeShowFullReference,
								})
							),
							createElement(
								PanelRow,
								{},
								createElement(ToggleControl, {
									checked:
										attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
											BGET.FORMAT.USERLANGABBREV ||
										attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
											BGET.FORMAT.BIBLELANGABBREV, //default false
									label: __("Use book abbreviation", "bibleget-io"),
									help: __(
										"When activated, the book names will be shown in the abbreviated form",
										"bibleget-io"
									),
									onChange: changeUseBookAbbreviation,
								})
							),
							createElement(
								PanelRow,
								{},
								createElement(ToggleControl, {
									checked:
										attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
											BGET.FORMAT.USERLANG ||
										attributes.LAYOUTPREFS_BOOKCHAPTERFORMAT ===
											BGET.FORMAT.USERLANGABBREV, //default false
									label: __("Use WP language", "bibleget-io"),
									help: __(
										"By default the book names are in the language of the Bible version being quoted. If activated, book names will be shown in the language of the WordPress interface",
										"bibleget-io"
									),
									onChange: changeBookNameUseWpLang,
								})
							)
						),
						createElement(
							PanelBody,
							{
								title: __("Layout Verses", "bibleget-io"),
								initialOpen: false,
								icon: "layout",
							},
							createElement(
								PanelRow,
								{},
								createElement(ToggleControl, {
									checked: attributes.LAYOUTPREFS_SHOWVERSENUMBERS, //default true
									label: __("Show verse number", "bibleget-io"),
									onChange: changeVerseNumberVisibility,
								})
							)
						),
						createElement(
							PanelBody,
							{
								title: __("General styles", "bibleget-io"),
								initialOpen: false,
								icon: "admin-appearance",
							},
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_BORDERWIDTH,
								label: __("Border width", "bibleget-io"),
								min: 0,
								max: 10,
								onChange: changeParagraphStyleBorderWidth,
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_BORDERRADIUS,
								label: __("Border radius", "bibleget-io"),
								min: 0,
								max: 20,
								onChange: changeParagraphStyleBorderRadius,
							}),
							createElement(SelectControl, {
								value: attributes.PARAGRAPHSTYLES_BORDERSTYLE,
								label: __("Border style", "bibleget-io"),
								onChange: changeParagraphStyleBorderStyle,
								options: Object.keys(BGET.BORDERSTYLE)
									.sort((a, b) => BGET.BORDERSTYLE[a] - BGET.BORDERSTYLE[b])
									.map((el) => ({
											value: BGET.BORDERSTYLE[el],
											label: BGET.CSSRULE.BORDERSTYLE[BGET.BORDERSTYLE[el]],
										})),
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
							createElement(
								PanelBody,
								{
									title: __("Border color", "bibleget-io"),
									initialOpen: false,
									icon: colorizeIco,
								},
								createElement(ColorPicker, {
									color: attributes.PARAGRAPHSTYLES_BORDERCOLOR,
									disableAlpha: false,
									onChangeComplete: changeParagraphStyleBorderColor,
								})
							),
							createElement(
								PanelBody,
								{
									title: __("Background color", "bibleget-io"),
									initialOpen: false,
									icon: colorizeIco,
								},
								createElement(ColorPicker, {
									color: attributes.PARAGRAPHSTYLES_BACKGROUNDCOLOR,
									disableAlpha: false,
									onChangeComplete: changeParagraphStyleBackgroundColor,
								})
							),
							createElement(SelectControl, {
								value: attributes.PARAGRAPHSTYLES_LINEHEIGHT,
								label: __("Line height", "bibleget-io"),
								options: [
									/* translators: context is label for line-height select option */
									{ value: 1.0, label: __("single", "bibleget-io") },
									{ value: 1.15, label: "1.15" },
									{ value: 1.5, label: "1.5" },
									/* translators: context is label for line-height select option */
									{ value: 2.0, label: __("double", "bibleget-io") },
								],
								onChange: changeParagraphStyleLineHeight,
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_WIDTH,
								label: __("Width on the page", "bibleget-io") + " (%)",
								min: 0,
								max: 100,
								onChange: changeParagraphStyleWidth,
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINTOPBOTTOM,
								label: __("Margin top / bottom", "bibleget-io"),
								min: 0,
								max: 30,
								onChange: changeParagraphStyleMarginTopBottom,
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHT,
								label: __("Margin left / right", "bibleget-io"),
								min: 0,
								max: 30,
								disabled:
									attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT === "auto",
								className: "PARAGRAPHSTYLES_MARGINLEFTRIGHT",
								onChange: changeParagraphStyleMarginLeftRight,
							}),
							createElement(SelectControl, {
								value: attributes.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT,
								label: __("Margin left / right unit", "bibleget-io"),
								options: [
									{ value: "px", label: "px" },
									{ value: "%", label: "%" },
									{ value: "auto", label: "auto" },
								],
								onChange: changeParagraphStyleMarginLeftRightUnit,
								help: __(
									'When set to "auto" the Bible quote will be centered on the page and the numerical value will be ignored',
									"bibleget-io"
								),
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_PADDINGTOPBOTTOM,
								label: __("Top / bottom padding", "bibleget-io"),
								min: 0,
								max: 20,
								onChange: changeParagraphStylePaddingTopBottom,
							}),
							createElement(RangeControl, {
								value: attributes.PARAGRAPHSTYLES_PADDINGLEFTRIGHT,
								label: __("Left / right padding", "bibleget-io"),
								min: 0,
								max: 20,
								onChange: changeParagraphStylePaddingLeftRight,
							}),
							createElement(PanelRow,{},
								createElement(FontSelectCtl, {
									value: attributes.PARAGRAPHSTYLES_FONTFAMILY,
									onChange: setFontFamily,
								})
							)
						),
						createElement(
							PanelBody,
							{
								title: __("Bible version styles", "bibleget-io"),
								initialOpen: false,
								icon: "admin-appearance",
								className: "bibleGetInspectorControls",
							},
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{ label: __("Text style", "bibleget-io") },
									createElement(
										ButtonGroup,
										{ className: "bibleGetTextStyleButtonGroup" },
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.BOLD,
												isPrimary: attributes.VERSIONSTYLES_BOLD,
												isSecondary: !attributes.VERSIONSTYLES_BOLD,
												onClick: changeBibleVersionTextStyle,
												title: __("Font style bold", "bibleget-io"),
												className: "bold",
											},
											__("B", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.ITALIC,
												isPrimary: attributes.VERSIONSTYLES_ITALIC === true,
												isSecondary: attributes.VERSIONSTYLES_ITALIC !== true,
												onClick: changeBibleVersionTextStyle,
												title: __("Font style italic", "bibleget-io"),
												className: "italic",
											},
											__("I", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.UNDERLINE,
												isPrimary: attributes.VERSIONSTYLES_UNDERLINE === true,
												isSecondary:
													attributes.VERSIONSTYLES_UNDERLINE !== true,
												onClick: changeBibleVersionTextStyle,
												title: __("Font style underline", "bibleget-io"),
												className: "underline",
											},
											__("U", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.STRIKETHROUGH,
												isPrimary:
													attributes.VERSIONSTYLES_STRIKETHROUGH === true,
												isSecondary:
													attributes.VERSIONSTYLES_STRIKETHROUGH !== true,
												onClick: changeBibleVersionTextStyle,
												title: __("Font style strikethrough", "bibleget-io"),
												className: "strikethrough",
											},
											__("S", "bibleget-io")
										)
									)
								)
							),
							createElement(RangeControl, {
								value: attributes.VERSIONSTYLES_FONTSIZE,
								label: __("Font size", "bibleget-io"),
								min: 0,
								max: 30,
								disabled: attributes.VERSIONSTYLES_FONTSIZEUNIT === "inherit",
								//className: 'VERSIONSTYLES_FONTSIZEUNIT',
								onChange: changeBibleVersionFontSize,
							}),
							createElement(SelectControl, {
								value: attributes.VERSIONSTYLES_FONTSIZEUNIT,
								label: __("Font size unit", "bibleget-io"),
								options: [
									{ value: "px", label: "px" },
									{ value: "em", label: "em" },
									{ value: "pt", label: "pt" },
									{ value: "inherit", label: "inherit" },
								],
								onChange: changeBibleVersionFontSizeUnit,
								help: __(
									'When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)',
									"bibleget-io"
								),
							}),
							createElement(
								PanelBody,
								{
									title: __("Font color", "bibleget-io"),
									initialOpen: false,
									icon: colorizeIco,
								},
								createElement(ColorPicker, {
									color: attributes.VERSIONSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeBibleVersionStyleFontColor,
								})
							)
						),
						createElement(
							PanelBody,
							{
								title: __("Book / Chapter styles", "bibleget-io"),
								initialOpen: false,
								icon: "admin-appearance",
							},
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{ label: __("Text style", "bibleget-io") },
									createElement(
										ButtonGroup,
										{ className: "bibleGetTextStyleButtonGroup" },
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.BOLD,
												isPrimary: attributes.BOOKCHAPTERSTYLES_BOLD,
												isSecondary: !attributes.BOOKCHAPTERSTYLES_BOLD,
												onClick: changeBookChapterTextStyle,
												title: __("Font style bold", "bibleget-io"),
												className: "bold",
											},
											__("B", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.ITALIC,
												isPrimary: attributes.BOOKCHAPTERSTYLES_ITALIC === true,
												isSecondary:
													attributes.BOOKCHAPTERSTYLES_ITALIC !== true,
												onClick: changeBookChapterTextStyle,
												title: __("Font style italic", "bibleget-io"),
												className: "italic",
											},
											__("I", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.UNDERLINE,
												isPrimary:
													attributes.BOOKCHAPTERSTYLES_UNDERLINE === true,
												isSecondary:
													attributes.BOOKCHAPTERSTYLES_UNDERLINE !== true,
												onClick: changeBookChapterTextStyle,
												title: __("Font style underline", "bibleget-io"),
												className: "underline",
											},
											__("U", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.STRIKETHROUGH,
												isPrimary:
													attributes.BOOKCHAPTERSTYLES_STRIKETHROUGH === true,
												isSecondary:
													attributes.BOOKCHAPTERSTYLES_STRIKETHROUGH !== true,
												onClick: changeBookChapterTextStyle,
												title: __("Font style strikethrough", "bibleget-io"),
												className: "strikethrough",
											},
											__("S", "bibleget-io")
										)
									)
								)
							),
							createElement(RangeControl, {
								value: attributes.BOOKCHAPTERSTYLES_FONTSIZE,
								label: __("Font size", "bibleget-io"),
								min: 0,
								max: 30,
								disabled:
									attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT === "inherit",
								//className: 'BOOKCHAPTERSTYLES_FONTSIZEUNIT',
								onChange: changeBookChapterFontSize,
							}),
							createElement(SelectControl, {
								value: attributes.BOOKCHAPTERSTYLES_FONTSIZEUNIT,
								label: __("Font size unit", "bibleget-io"),
								options: [
									{ value: "px", label: "px" },
									{ value: "em", label: "em" },
									{ value: "pt", label: "pt" },
									{ value: "inherit", label: "inherit" },
								],
								onChange: changeBookChapterFontSizeUnit,
								help: __(
									'When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)',
									"bibleget-io"
								),
							}),
							createElement(
								PanelBody,
								{
									title: __("Font color", "bibleget-io"),
									initialOpen: false,
									icon: colorizeIco,
								},
								createElement(ColorPicker, {
									color: attributes.BOOKCHAPTERSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeBookChapterStyleFontColor,
								})
							)
						),
						createElement(
							PanelBody,
							{
								title: __("Verse number styles", "bibleget-io"),
								initialOpen: false,
								icon: "admin-appearance",
							},
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{ label: __("Text style", "bibleget-io") },
									createElement(
										ButtonGroup,
										{
											className:
												"bibleGetTextStyleButtonGroup verseNumberStyles",
										},
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.BOLD,
												isPrimary: attributes.VERSENUMBERSTYLES_BOLD,
												isSecondary: !attributes.VERSENUMBERSTYLES_BOLD,
												onClick: changeVerseNumberTextStyle,
												title: __("Font style bold", "bibleget-io"),
												className: "bold",
											},
											__("B", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.ITALIC,
												isPrimary: attributes.VERSENUMBERSTYLES_ITALIC === true,
												isSecondary:
													attributes.VERSENUMBERSTYLES_ITALIC !== true,
												onClick: changeVerseNumberTextStyle,
												title: __("Font style italic", "bibleget-io"),
												className: "italic",
											},
											__("I", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.UNDERLINE,
												isPrimary:
													attributes.VERSENUMBERSTYLES_UNDERLINE === true,
												isSecondary:
													attributes.VERSENUMBERSTYLES_UNDERLINE !== true,
												onClick: changeVerseNumberTextStyle,
												title: __("Font style underline", "bibleget-io"),
												className: "underline",
											},
											__("U", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.STRIKETHROUGH,
												isPrimary:
													attributes.VERSENUMBERSTYLES_STRIKETHROUGH === true,
												isSecondary:
													attributes.VERSENUMBERSTYLES_STRIKETHROUGH !== true,
												onClick: changeVerseNumberTextStyle,
												title: __("Font style strikethrough", "bibleget-io"),
												className: "strikethrough",
											},
											__("S", "bibleget-io")
										)
									),
									createElement(
										ButtonGroup,
										{
											className:
												"bibleGetTextStyleButtonGroup verseNumberStyles",
										},
										createElement(
											Button,
											{
												value: BGET.VALIGN.NORMAL,
												isPrimary:
													attributes.VERSENUMBERSTYLES_VALIGN ===
													BGET.VALIGN.NORMAL,
												isSecondary:
													attributes.VERSENUMBERSTYLES_VALIGN !==
													BGET.VALIGN.NORMAL,
												onClick: changeVerseNumberValign,
												title: __("Normal", "bibleget-io"),
												className: "valign-normal",
											},
											"A"
										),
										createElement(
											Button,
											{
												value: BGET.VALIGN.SUPERSCRIPT,
												isPrimary:
													attributes.VERSENUMBERSTYLES_VALIGN ===
													BGET.VALIGN.SUPERSCRIPT,
												isSecondary:
													attributes.VERSENUMBERSTYLES_VALIGN !==
													BGET.VALIGN.SUPERSCRIPT,
												onClick: changeVerseNumberValign,
												title: __("Superscript", "bibleget-io"),
												className: "valign-superscript",
											},
											"A²"
										),
										createElement(
											Button,
											{
												value: BGET.VALIGN.SUBSCRIPT,
												isPrimary:
													attributes.VERSENUMBERSTYLES_VALIGN ===
													BGET.VALIGN.SUBSCRIPT,
												isSecondary:
													attributes.VERSENUMBERSTYLES_VALIGN !==
													BGET.VALIGN.SUBSCRIPT,
												onClick: changeVerseNumberValign,
												title: __("Subscript", "bibleget-io"),
												className: "valign-subscript",
											},
											"A₂"
										)
									)
								)
							),
							createElement(RangeControl, {
								value: attributes.VERSENUMBERSTYLES_FONTSIZE,
								label: __("Font size", "bibleget-io"),
								min: 0,
								max: 30,
								disabled:
									attributes.VERSENUMBERSTYLES_FONTSIZEUNIT === "inherit",
								//className: 'VERSENUMBERSTYLES_FONTSIZEUNIT',
								onChange: changeVerseNumberFontSize,
							}),
							createElement(SelectControl, {
								value: attributes.VERSENUMBERSTYLES_FONTSIZEUNIT,
								label: __("Font size unit", "bibleget-io"),
								options: [
									{ value: "px", label: "px" },
									{ value: "em", label: "em" },
									{ value: "pt", label: "pt" },
									{ value: "inherit", label: "inherit" },
								],
								onChange: changeVerseNumberFontSizeUnit,
								help: __(
									'When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)',
									"bibleget-io"
								),
							}),
							createElement(
								PanelBody,
								{
									title: __("Font color", "bibleget-io"),
									initialOpen: false,
									icon: colorizeIco,
								},
								createElement(ColorPicker, {
									color: attributes.VERSENUMBERSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeVerseNumberStyleFontColor,
								})
							)
						),
						createElement(
							PanelBody,
							{
								title: __("Verse text styles", "bibleget-io"),
								initialOpen: false,
								icon: "admin-appearance",
							},
							createElement(
								PanelRow,
								{},
								createElement(
									BaseControl,
									{ label: __("Text style", "bibleget-io") },
									createElement(
										ButtonGroup,
										{ className: "bibleGetTextStyleButtonGroup" },
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.BOLD,
												isPrimary: attributes.VERSETEXTSTYLES_BOLD,
												isSecondary: !attributes.VERSETEXTSTYLES_BOLD,
												onClick: changeVerseTextTextStyle,
												title: __("Font style bold", "bibleget-io"),
												className: "bold",
											},
											__("B", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.ITALIC,
												isPrimary: attributes.VERSETEXTSTYLES_ITALIC === true,
												isSecondary: attributes.VERSETEXTSTYLES_ITALIC !== true,
												onClick: changeVerseTextTextStyle,
												title: __("Font style italic", "bibleget-io"),
												className: "italic",
											},
											__("I", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.UNDERLINE,
												isPrimary:
													attributes.VERSETEXTSTYLES_UNDERLINE === true,
												isSecondary:
													attributes.VERSETEXTSTYLES_UNDERLINE !== true,
												onClick: changeVerseTextTextStyle,
												title: __("Font style underline", "bibleget-io"),
												className: "underline",
											},
											__("U", "bibleget-io")
										),
										createElement(
											Button,
											{
												value: BGET.TEXTSTYLE.STRIKETHROUGH,
												isPrimary:
													attributes.VERSETEXTSTYLES_STRIKETHROUGH === true,
												isSecondary:
													attributes.VERSETEXTSTYLES_STRIKETHROUGH !== true,
												onClick: changeVerseTextTextStyle,
												title: __("Font style strikethrough", "bibleget-io"),
												className: "strikethrough",
											},
											__("S", "bibleget-io")
										)
									)
								)
							),
							createElement(RangeControl, {
								value: attributes.VERSETEXTSTYLES_FONTSIZE,
								label: __("Font size", "bibleget-io"),
								min: 0,
								max: 30,
								disabled: attributes.VERSETEXTSTYLES_FONTSIZEUNIT === "inherit",
								//className: 'VERSETEXTSTYLES_FONTSIZEUNIT',
								onChange: changeVerseTextFontSize,
							}),
							createElement(SelectControl, {
								value: attributes.VERSETEXTSTYLES_FONTSIZEUNIT,
								label: __("Font size unit", "bibleget-io"),
								options: [
									{ value: "px", label: "px" },
									{ value: "em", label: "em" },
									{ value: "pt", label: "pt" },
									{ value: "inherit", label: "inherit" },
								],
								onChange: changeVerseTextFontSizeUnit,
								help: __(
									'When set to "inherit" the font size will be according to the theme settings. When set to "em" the font size will be the above value / 10 (i.e. 12 will be 1.2em)',
									"bibleget-io"
								),
							}),
							createElement(
								PanelBody,
								{
									title: __("Font color", "bibleget-io"),
									initialOpen: false,
									icon: colorizeIco,
								},
								createElement(ColorPicker, {
									color: attributes.VERSETEXTSTYLES_TEXTCOLOR,
									disableAlpha: false,
									onChangeComplete: changeVerseTextStyleFontColor,
								})
							)
						)
					)
				)
			);
		},
		save() {
			return null; //save has to exist. This all we need
		},
	});

	$(document).on("click", ".bibleget-popup-trigger", function () {
		const popup_content = he.decode($(this).attr("data-popupcontent"));
		const dlg = $(
			'<div class="bibleget-quote-div bibleget-popup">' +
				popup_content +
				"</div>"
		).dialog({
			autoOpen: true,
			width: $(window).width() * 0.8,
			maxHeight: $(window).height() * 0.8,
			title: $(this).text(),
			create: () => {
				// style fix for WordPress admin
				$(".ui-dialog-titlebar-close").addClass("ui-button");
			},
			close: () => {
				//autodestruct so we don't clutter with multiple dialog instances
				dlg.dialog("destroy");
				$(".bibleget-quote-div.bibleget-popup").remove();
			},
		});
		return false;
	});

	/* Someone might say this is the wrong way to do this, but hey I don't care, as long as it works */
	/*$(document).on("click", '[data-type="bibleget/bible-quote"]', () => {
		//anything you put here will be triggered every time a Bible quote block is selected
	});
	*/
})(
	wp.blocks,
	wp.element,
	wp.i18n,
	wp.blockEditor,
	wp.components,
	wp.serverSideRender,
	jQuery
);

String.prototype.formatUnicorn =
	String.prototype.formatUnicorn ||
	function () {
		"use strict";
		let str = this.toString();
		if (arguments.length) {
			const t = typeof arguments[0];
			const args =
				"string" === t || "number" === t
					? Array.prototype.slice.call(arguments)
					: arguments[0];

			for (const key in args) {
				str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
			}
		}

		return str;
	};

const wordCharacters =
		"[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]",
	addMark = (text, keyword) => {
		if (typeof keyword === "string") {
			keyword = [keyword];
		}
		//return text.replace(new RegExp("(" + keyword.join('|') + ")", "gi"), '<mark>$1</mark>');
		return addBMark(
			text.replace(
				new RegExp(
					"((?:" +
						wordCharacters +
						"*)*?)(" +
						keyword.join("|") +
						")((?:" +
						wordCharacters +
						"*)*)",
					"gi"
				),
				'<a class="submark">$1</a><mark>$2</mark><a class="submark">$3</a>'
			),
			keyword
		);
	},
	addBMark = (text, keyword) => {
		let keywordArr;
		if (typeof keyword === "string") {
			keyword = [keyword];
			keywordArr = [addDiacritics(keyword)];
		} else if (Array.isArray(keyword)) {
			keywordArr = keyword.map((el) => addDiacritics(el));
		}
		//console.log(keyword);
		return text.replace(
			new RegExp(
				"((?:" +
					wordCharacters +
					"*)*?)(?:(?!" +
					keyword.join("|") +
					"))(" +
					keywordArr.join("|") +
					")((?:" +
					wordCharacters +
					"*)*)",
				"gi"
			),
			'<a class="bsubmark">$1</a><a class="bmark">$2</a><a class="bsubmark">$3</a>'
		);
	},
	stripDiacritics = (term) => term.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
	addDiacritics = (term) => term.replace(/./g, (c) => {
			switch (c) {
				case "a":
				case "A":
					return "[aA\xC0-\xC5\xE0-\xE5\u0100-\u0105\u01CD\u01CE\u01DE-\u01E1\u01FA\u01FB\u0200-\u0203\u0226\u0227\u023A\u0250-\u0252]";
				case "e":
				case "E":
					return "[eE\xC8-\xCB\xE8-\xEB\x12-\x1B\u0204-\u0207\u0228\u0229\u0400\u0401]";
				case "i":
				case "I":
					return "[iI\xcc-\xCF\xEC-\xEF\u0128-\u0131\u0196\u0197\u0208-\u020B\u0406\u0407]";
				case "o":
				case "O":
					return "[oO\xD2-\xD6\xD8\xF0\xF2-\xF6\xF8\u014C-\u0151\u01A0\u01A1\u01D1\u01D2\u01EA-\u01ED\u01FE\u01FF\u01EA-\u01ED\u01FE\u01FF\u020C-\u020F\u022A-\u0231]";
				case "u":
				case "U":
					return "[uU\xD9-\xDC\xF9-\xFC\u0168-\u0173\u01AF-\u01B0\u01D3-\u01DC\u0214-\u0217]";
				case "y":
				case "Y":
					return "[yY\xDD\xFD\xFF\u0176-\u0178\u01B3\u01B4\u0232\u0233]";
				case "c":
				case "C":
					return "[cC\xC7\xE7\u0106-\u010D\u0187\u0188\u023B\u023C]";
				case "n":
				case "N":
					return "[nN\xD1\xF1\u0143-\u014B\u019D\u019E\u01F8\u01F9\u0235]";
				case "d":
				case "D":
					return "[dD\xD0\u010E-\u0111\u0189\u0190\u0221]";
				case "g":
				case "G":
					return "[gG\u011C-\u0123\u0193-\u0194\u01E4-\u01E7\u01F4\u01F5]";
				case "h":
				case "H":
					return "[hH\u0124-\u0127\u021E\u021F]";
				case "j":
				case "J":
					return "[jJ\u0134\u0135]";
				case "k":
				case "K":
					return "[kk\u0136-\u0138\u0198\u0199\u01E8\u01E9]";
				case "l":
				case "L":
					return "[lL\u0139-\u0142\u019A\u019B\u0234\u023D]";
				case "r":
				case "R":
					return "[rR\u0154-\u0159\u0210-\u0213]";
				case "s":
				case "S":
					return "[sS\u015A-\u0161\u017F\u0218\u0219\u023F]";
				case "t":
				case "T":
					return "[tT\u0162-\u0167\u01AB-\u01AE\u021A\u021B\u0236\u023E]";
				case "w":
				case "W":
					return "[wW\u0174-\u0175]";
				case "z":
				case "Z":
					return "[zZ\u0179-\u017E\u01B5\u01B6\u0224\u0225]";
				case "b":
				case "B":
					return "[bB\u0180-\u0183]";
				case "f":
				case "F":
					return "[fF\u0191-\u0192]";
				case "m":
				case "M":
					return "[mM\u019C]";
				case "p":
				case "P":
					return "[\u01A4-\u01A5]";
				default:
					return c;
			}
		});

const getAttributeValue = (tag, att, content) => {
	// In string literals, slashes need to be double escaped
	//
	//    Match  attribute="value"
	//    \[tag[^\]]*      matches opening of shortcode tag
	//    att="([^"]*)"    captures value inside " and "
	var re = new RegExp(`\\[${tag}[^\\]]* ${att}="([^"]*)"`, "im");
	var result = content.match(re);
	if (result != null && result.length > 0) return result[1];

	//    Match  attribute='value'
	//    \[tag[^\]]*      matches opening of shortcode tag
	//    att="([^"]*)"    captures value inside ' and ''
	re = new RegExp(`\\[${tag}[^\\]]* ${att}='([^']*)'`, "im");
	result = content.match(re);
	if (result != null && result.length > 0) return result[1];

	//    Match  attribute=value
	//    \[tag[^\]]*      matches opening of shortcode tag
	//    att="([^"]*)"    captures a shortcode value provided without
	//                     quotes, as in [me color=green]
	re = new RegExp(`\\[${tag}[^\\]]* ${att}=([^\\s]*)\\s`, "im");
	result = content.match(re);
	if (result != null && result.length > 0) return result[1];
	return false;
};

const getInnerContent = (tag, content) => {
	//   \[tag[^\]]*?]    matches opening shortcode tag with or without attributes, (not greedy)
	//   ([\S\s]*?)       matches anything in between shortcodes tags, including line breaks and other shortcodes
	//   \[\/tag]         matches end shortcode tag
	// remember, double escaping for string literals inside RegExp
	const re = new RegExp(`\\[${tag}[^\\]]*?]([\\S\\s]*?)\\[\\/${tag}]`, "i");
	const result = content.match(re);
	if (result === null || result.length < 1) return "";
	return result[1];
};

const ISOcodeFromLang = {
	Afrikaans: "af",
	Akan: "ak",
	Albanian: "sq",
	Amharic: "am",
	Arabic: "ar",
	Armenian: "hy",
	Azerbaijani: "az",
	Basque: "eu",
	Belarusian: "be",
	Bengali: "bn",
	Bihari: "bh",
	Bosnian: "bs",
	Breton: "br",
	Bulgarian: "bg",
	Cambodian: "km",
	Catalan: "ca",
	Chichewa: "ny",
	Chinese: "zh",
	Corsican: "co",
	Croatian: "hr",
	Czech: "cs",
	Danish: "da",
	Dutch: "nl",
	English: "en",
	Esperanto: "eo",
	Estonian: "et",
	Faroese: "fo",
	Filipino: "tl",
	Finnish: "fi",
	French: "fr",
	Frisian: "fy",
	Galician: "gl",
	Georgian: "ka",
	German: "de",
	Greek: "el",
	Guarani: "gn",
	Gujarati: "gu",
	"Haitian Creole": "ht",
	Hausa: "ha",
	Hebrew: "iw",
	Hindi: "hi",
	Hungarian: "hu",
	Icelandic: "is",
	Igbo: "ig",
	Indonesian: "id",
	Interlingua: "ia",
	Irish: "ga",
	Italian: "it",
	Japanese: "ja",
	Javanese: "jw",
	Kannada: "kn",
	Kazakh: "kk",
	Kinyarwanda: "rw",
	Kirundi: "rn",
	Kongo: "kg",
	Korean: "ko",
	Kurdish: "ku",
	Kyrgyz: "ky",
	Laothian: "lo",
	Latin: "la",
	Latvian: "lv",
	Lingala: "ln",
	Lithuanian: "lt",
	Luganda: "lg",
	Macedonian: "mk",
	Malagasy: "mg",
	Malay: "ms",
	Malayalam: "ml",
	Maltese: "mt",
	Maori: "mi",
	Marathi: "mr",
	Moldavian: "mo",
	Mongolian: "mn",
	Nepali: "ne",
	Norwegian: "no",
	Occitan: "oc",
	Oriya: "or",
	Oromo: "om",
	Pashto: "ps",
	Persian: "fa",
	Polish: "pl",
	Portuguese: "pt",
	Punjabi: "pa",
	Quechua: "qu",
	Romanian: "ro",
	Romansh: "rm",
	Russian: "ru",
	"Scots Gaelic": "gd",
	Serbian: "sr",
	"Serbo-Croatian": "sh",
	Sesotho: "st",
	Setswana: "tn",
	Shona: "sn",
	Sindhi: "sd",
	Sinhalese: "si",
	Slovak: "sk",
	Slovenian: "sl",
	Somali: "so",
	Spanish: "es",
	Sundanese: "su",
	Swahili: "sw",
	Swedish: "sv",
	Tajik: "tg",
	Tamil: "ta",
	Tatar: "tt",
	Telugu: "te",
	Thai: "th",
	Tigrinya: "ti",
	Tonga: "to",
	Turkish: "tr",
	Turkmen: "tk",
	Twi: "tw",
	Uighur: "ug",
	Ukrainian: "uk",
	Urdu: "ur",
	Uzbek: "uz",
	Vietnamese: "vi",
	Welsh: "cy",
	Wolof: "wo",
	Xhosa: "xh",
	Yiddish: "yi",
	Yoruba: "yo",
	Zulu: "zu",
};
