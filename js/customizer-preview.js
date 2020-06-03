/**
 * This file adds some LIVE to the Theme Customizer live preview. To leverage
 * this, set your custom settings to 'postMessage' and then add your handling
 * here. Your javascript should grab settings from customizer controls, and 
 * then make any necessary changes to the page using jQuery.
 */
( function( $ ) {
	/* Wouldn't it be great to be able to just iterate over the defined properties / attributes / options?
	 * Maybe we could, if we defined the function to bind such that it's the same as the Gutenberg block live preview functions?
	 * Making these functions another property of the defined properties / attributes? Would that be possible?
	 * Would probably require like an eval or something like that? I don't like the idea of eval though...
	 * In the meantime, we can still iterate over them and use a switch case to treat them one by one...
	*/
	if(BibleGetGlobal !== null && typeof BibleGetGlobal === 'object' && BibleGetGlobal.hasOwnProperty('BGETProperties') && BibleGetGlobal.hasOwnProperty('BGETConstants') && BibleGetGlobal.hasOwnProperty('BGET') ){
		if(typeof BibleGetGlobal.BGETProperties === 'object' && typeof BibleGetGlobal.BGETConstants === 'object' && typeof BibleGetGlobal.BGET === 'object'){
			let { BGETProperties,BGETConstants,BGET } = BibleGetGlobal; //extract our properties
			for(const key in BGETProperties ){
				wp.customize( 'BGET['+key+']',function(value){
					value.bind(function( newval ) {
						//keep our local store of properties/attributes/preferences updated
						BGET[key] = newval; 
						//and now we can use either newval within the related case below, or simply use the key from our BGET store
						//this is very useful when dealing with cases that are closely related, and reuse the same logic
						//if we avoid using 'newval' and use the BGET[key], 
						//we can use the exact same code for multiple cascading cases with a break only for the last case involved
						let textalign,borderstyle,fontweight,fontstyle,fontsize,styles,fontType,font,link,decorations,textdecoration;
						switch(key){
							case 'PARAGRAPHSTYLES_FONTFAMILY':
								fontType = parent.jQuery('#bibleget-googlefonts').attr('data-fonttype');
								font = newval.replace(/\+/g, ' ');
								font = font.split(':');
								if(fontType == 'googlefont'){
									link = 'https://fonts.googleapis.com/css?family=' + newval;
									if ($("link[href*='" + font + "']").length > 0){
										$("link[href*='" + font + "']").attr('href',link)
									}
									else{
										$('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
									}
								}
								$('div.results').css('font-family', font[0] );				
							break;
							case 'PARAGRAPHSTYLES_LINEHEIGHT':
								$('div.results .versesParagraph').css('line-height', BGET.PARAGRAPHSTYLES_LINEHEIGHT+'em' );
							break;
							case 'PARAGRAPHSTYLES_PADDINGTOPBOTTOM':
							//nobreak;
							case 'PARAGRAPHSTYLES_PADDINGLEFTRIGHT':
								$('div.results').css('padding', BGET.PARAGRAPHSTYLES_PADDINGTOPBOTTOM+'px '+BGET.PARAGRAPHSTYLES_PADDINGLEFTRIGHT+'px');
							break;
							case 'PARAGRAPHSTYLES_MARGINTOPBOTTOM':
							//nobreak;
							case 'PARAGRAPHSTYLES_MARGINLEFTRIGHT':
							//nobreak;
							case 'PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT':
								if(BGET.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT === 'auto'){
									$('div.results').css('margin', BGET.PARAGRAPHSTYLES_MARGINTOPBOTTOM+'px '+ BGET.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT);
								}
								else{
									$('div.results').css('margin', BGET.PARAGRAPHSTYLES_MARGINTOPBOTTOM+'px '+BGET.PARAGRAPHSTYLES_MARGINLEFTRIGHT+BGET.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT );            
								}
							break;
							case 'PARAGRAPHSTYLES_PARAGRAPHALIGN':
								textalign = BGETConstants.CSSRULE.ALIGN[newval];
								$('div.results .versesParagraph').css('text-align', textalign );
							break;
							case 'PARAGRAPHSTYLES_WIDTH':
								$('div.results').css('width', newval+'%' );
							break;
							case 'PARAGRAPHSTYLES_NOVERSIONFORMATTING':

							break;
							case 'PARAGRAPHSTYLES_BORDERWIDTH':
								$('div.results').css('border-width', newval+'px' );
							break;
							case 'PARAGRAPHSTYLES_BORDERCOLOR':
								$('div.results').css('border-color', newval );
							break;
							case 'PARAGRAPHSTYLES_BORDERSTYLE':
								borderstyle = BGETConstants.CSSRULE.BORDERSTYLE[newval];
								$('div.results').css('border-style', borderstyle );
							break;
							case 'PARAGRAPHSTYLES_BORDERRADIUS':
								$('div.results').css('border-radius', newval+'px' );
							break;
							case 'PARAGRAPHSTYLES_BACKGROUNDCOLOR':
								$('div.results').css('background-color', newval );
							break;
							case 'VERSIONSTYLES_BOLD':
								fontweight = BGET.VERSIONSTYLES_BOLD ? 'bold' : 'normal';
								$('div.results .bibleVersion').css('font-weight',fontweight);
							break;
							case 'VERSIONSTYLES_ITALIC':
								fontstyle = BGET.VERSIONSTYLES_ITALIC ? 'italic' : 'normal';
								$('div.results .bibleVersion').css('font-style',fontstyle);
							break;
							case 'VERSIONSTYLES_UNDERLINE':
							//nobreak;
							case 'VERSIONSTYLES_STRIKETHROUGH':
								decorations = [];
								if(BGET.VERSIONSTYLES_UNDERLINE){ decorations.push('underline'); }
								if(BGET.VERSIONSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
								textdecoration = decorations.length === 0 ? 'none' : decorations.join(' ');
								$('div.results .bibleVersion').css('text-decoration',textdecoration);
							break;
							case 'VERSIONSTYLES_TEXTCOLOR':
								$('div.results .bibleVersion').css('color', newval );
							break;
							case 'VERSIONSTYLES_FONTSIZE':
							//nobreak;
							case 'VERSIONSTYLES_FONTSIZEUNIT':
								fontsize = BGET.VERSIONSTYLES_FONTSIZE;
								if(BGET.VERSIONSTYLES_FONTSIZEUNIT == 'em'){
									fontsize /= 10;
								}
								$('div.results .bibleVersion').css('font-size', fontsize+BGET.VERSIONSTYLES_FONTSIZEUNIT );
							break;
							case 'VERSIONSTYLES_VALIGN':

							break;
							case 'BOOKCHAPTERSTYLES_BOLD':
								fontweight = BGET.BOOKCHAPTERSTYLES_BOLD ? 'bold' : 'normal';
								$('div.results .bookChapter').css('font-weight',fontweight);
							break;
							case 'BOOKCHAPTERSTYLES_ITALIC':
								fontstyle = BGET.BOOKCHAPTERSTYLES_ITALIC ? 'italic' : 'normal';
								$('div.results .bookChapter').css('font-style',fontstyle);
							break;
							case 'BOOKCHAPTERSTYLES_UNDERLINE':
							//nobreak;
							case 'BOOKCHAPTERSTYLES_STRIKETHROUGH':
								decorations = [];
								if(BGET.BOOKCHAPTERSTYLES_UNDERLINE){ decorations.push('underline'); }
								if(BGET.BOOKCHAPTERSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
								textdecoration = decorations.length === 0 ? 'none' : decorations.join(' ');
								$('div.results .bookChapter').css('text-decoration',textdecoration);
							break;
							case 'BOOKCHAPTERSTYLES_TEXTCOLOR':
								$('div.results .bookChapter').css('color', newval );
							break;
							case 'BOOKCHAPTERSTYLES_FONTSIZE':
							//nobreak;
							case 'BOOKCHAPTERSTYLES_FONTSIZEUNIT':
								fontsize = BGET.BOOKCHAPTERSTYLES_FONTSIZE;
								if(BGET.BOOKCHAPTERSTYLES_FONTSIZEUNIT == 'em'){
									fontsize /= 10;
								}
								$('div.results .bookChapter').css('font-size', fontsize+BGET.BOOKCHAPTERSTYLES_FONTSIZEUNIT ); 
							break;
							case 'BOOKCHAPTERSTYLES_VALIGN':

							break;
							case 'VERSENUMBERSTYLES_BOLD':
								fontweight = BGET.VERSENUMBERSTYLES_BOLD ? 'bold' : 'normal';
								$('div.results .versesParagraph .verseNum').css('font-weight',fontweight);
							break;
							case 'VERSENUMBERSTYLES_ITALIC':
								fontstyle = BGET.VERSENUMBERSTYLES_ITALIC ? 'italic' : 'normal';
								$('div.results .versesParagraph .verseNum').css('font-style',fontstyle);
							break;
							case 'VERSENUMBERSTYLES_UNDERLINE':
							//nobreak;
							case 'VERSENUMBERSTYLES_STRIKETHROUGH':
								decorations = [];
								if(BGET.VERSENUMBERSTYLES_UNDERLINE){ decorations.push('underline'); }
								if(BGET.VERSENUMBERSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
								textdecoration = decorations.length === 0 ? 'none' : decorations.join(' ');
								$('div.results .versesParagraph .verseNum').css('text-decoration',textdecoration);
							break;
							case 'VERSENUMBERSTYLES_TEXTCOLOR':
								$('div.results .versesParagraph .verseNum').css('color', newval );
							break;
							case 'VERSENUMBERSTYLES_FONTSIZE':
							//nobreak;
							case 'VERSENUMBERSTYLES_FONTSIZEUNIT':
								fontsize = BGET.VERSENUMBERSTYLES_FONTSIZE;
								if(BGET.VERSENUMBERSTYLES_FONTSIZEUNIT == 'em'){
									fontsize /= 10;
								}
								$('div.results .versesParagraph .verseNum').css('font-size', fontsize+BGET.VERSENUMBERSTYLES_FONTSIZEUNIT ); 
							break;
							case 'VERSENUMBERSTYLES_VALIGN':
								styles = {};
								switch(BGET.VERSENUMBERSTYLES_VALIGN){
									case BGETConstants.VALIGN.SUPERSCRIPT:
										styles['vertical-align'] = 'baseline';
										styles['position'] = 'relative';
										styles['top'] = '-0.6em';
									break;
									case BGETConstants.VALIGN.SUBSCRIPT:
										styles['vertical-align'] = 'baseline';
										styles['position'] = 'relative';
										styles['top'] = '0.6em';
									break;
									case BGETConstants.VALIGN.NORMAL: 
									styles['vertical-align'] = 'baseline';
									styles['position'] = 'static';
								break;
								}
								$('div.results .versesParagraph .verseNum').css(styles);
							break;
							case 'VERSETEXTSTYLES_BOLD':
								fontweight = BGET.VERSETEXTSTYLES_BOLD ? 'bold' : 'normal';
								$('div.results .versesParagraph').css('font-weight',fontweight);
							break;
							case 'VERSETEXTSTYLES_ITALIC':
								fontstyle = BGET.VERSETEXTSTYLES_ITALIC ? 'italic' : 'normal';
								$('div.results .versesParagraph').css('font-style',fontstyle);
							break;
							case 'VERSETEXTSTYLES_UNDERLINE':
							//nobreak;
							case 'VERSETEXTSTYLES_STRIKETHROUGH':
								decorations = [];
								if(BGET.VERSETEXTSTYLES_UNDERLINE){ decorations.push('underline'); }
								if(BGET.VERSETEXTSTYLES_STRIKETHROUGH){ decorations.push('line-through'); }
								textdecoration = decorations.length === 0 ? 'none' : decorations.join(' ');
								$('div.results .versesParagraph').css('text-decoration',textdecoration);
							break;
							case 'VERSETEXTSTYLES_TEXTCOLOR':
								$('div.results .versesParagraph').css('color', newval );
							break;
							case 'VERSETEXTSTYLES_FONTSIZE':
							//nobreak;
							case 'VERSETEXTSTYLES_FONTSIZEUNIT':
								fontsize = BGET.VERSETEXTSTYLES_FONTSIZE;
								if(BGET.VERSETEXTSTYLES_FONTSIZEUNIT == 'em'){
									fontsize /= 10;
								}
								$('div.results .versesParagraph').css('font-size', fontsize+BGET.VERSETEXTSTYLES_FONTSIZEUNIT );
							break;
							case 'VERSETEXTSTYLES_VALIGN':
								//this wouldn't make sense, not using
							break;
							/* We don't use any of the Layout Prefs in the Customizer at least for now
							 * considering that the change the structure of the Bible quote, not just the styling
							 * Theoretically it would be possible even without a ServerSideRender (as in the case of the Gutenberg block)
							 * if we were using a json response from the BibleGet server instead of an html response
							 * or, even with the current html response, using DOM manipulation similarly to how the ServerSideRender
							 * is manipulating the DOM. We'll see, one thing at a time
							case 'LAYOUTPREFS_SHOWBIBLEVERSION':

							break;
							case 'LAYOUTPREFS_BIBLEVERSIONALIGNMENT':

							break;
							case 'LAYOUTPREFS_BIBLEVERSIONPOSITION':

							break;
							case 'LAYOUTPREFS_BIBLEVERSIONWRAP':

							break;
							case 'LAYOUTPREFS_BOOKCHAPTERALIGNMENT':

							break;
							case 'LAYOUTPREFS_BOOKCHAPTERPOSITION':

							break;
							case 'LAYOUTPREFS_BOOKCHAPTERWRAP':

							break;
							case 'LAYOUTPREFS_BOOKCHAPTERFORMAT':

							break;
							case 'LAYOUTPREFS_BOOKCHAPTERFULLQUERY':

							break;
							case 'LAYOUTPREFS_SHOWVERSENUMBERS':

							break;
							case 'VERSION':

							break;
							case 'QUERY':

							break;
							case 'POPUP':

							break;
							case 'FORCEVERSION':

							break;
							case 'FORCECOPYRIGHT':

							break;
							*/
						}
					});
				});
			}		
		}
		else{
			alert('Live preview script seems to have been "localized" with BibleGetGlobal object, however the BGETProperties property of the BibleGetGlobal object is not available');
		}
	}
	else{
		alert('Live preview script does not seem to have been "localized" correctly with BibleGetGlobal object');
	}

} )( jQuery );
