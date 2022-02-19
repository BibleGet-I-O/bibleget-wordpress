/**
 * This file adds some LIVE to the Theme Customizer live preview. To leverage
 * this, set your custom settings to 'postMessage' and then add your handling
 * here. Your javascript should grab settings from customizer controls, and 
 * then make any necessary changes to the page using jQuery.
 */
let vsdecorations = [],
    bcdecorations = [],
    vndecorations = [],
    vtdecorations = [];

const handleParagraphStyles = (BibleGetGlobal,key) => {
    const { BGET, BGETConstants } = BibleGetGlobal;
    switch(key){
        case 'PARAGRAPHSTYLES_FONTFAMILY':
            let fontType = parent.jQuery('#bibleget-googlefonts').attr('data-fonttype');
            let font = BGET[key].replace(/\+/g, ' ');
            font = font.split(':');
            if(fontType == 'googlefont'){
                let link = 'https://fonts.googleapis.com/css?family=' + BGET[key];
                if (jQuery("link[href*='" + font + "']").length > 0){
                    jQuery("link[href*='" + font + "']").attr('href', link)
                }
                else{
                    jQuery('link:last').after('<link href="' + link + '" rel="stylesheet" type="text/css">');
                }
            }
            jQuery('.bibleQuote.results').css('font-family', font[0] );
        break;
        case 'PARAGRAPHSTYLES_LINEHEIGHT':
            jQuery('.bibleQuote.results .versesParagraph').css('line-height', BGET.PARAGRAPHSTYLES_LINEHEIGHT+'em' );
        break;
        case 'PARAGRAPHSTYLES_PADDINGTOPBOTTOM':
        //nobreak;
        case 'PARAGRAPHSTYLES_PADDINGLEFTRIGHT':
            jQuery('.bibleQuote.results').css('padding', BGET.PARAGRAPHSTYLES_PADDINGTOPBOTTOM+'px '+BGET.PARAGRAPHSTYLES_PADDINGLEFTRIGHT+'px');
        break;
        case 'PARAGRAPHSTYLES_MARGINTOPBOTTOM':
        //nobreak;
        case 'PARAGRAPHSTYLES_MARGINLEFTRIGHT':
        //nobreak;
        case 'PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT':
            if(BGET.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT === 'auto'){
                jQuery('.bibleQuote.results').css('margin', BGET.PARAGRAPHSTYLES_MARGINTOPBOTTOM+'px auto');
            }
            else{
                jQuery('.bibleQuote.results').css('margin', BGET.PARAGRAPHSTYLES_MARGINTOPBOTTOM+'px '+BGET.PARAGRAPHSTYLES_MARGINLEFTRIGHT+BGET.PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT );            
            }
        break;
        case 'PARAGRAPHSTYLES_PARAGRAPHALIGN':
            jQuery('.bibleQuote.results .versesParagraph').css('text-align', BGETConstants.CSSRULE.ALIGN[BGET[key]] );
        break;
        case 'PARAGRAPHSTYLES_WIDTH':
            jQuery('.bibleQuote.results').css('width', BGET[key]+'%' );
        break;
        case 'PARAGRAPHSTYLES_NOVERSIONFORMATTING':
            //should anything happen here?
        break;
        case 'PARAGRAPHSTYLES_BORDERWIDTH':
            jQuery('.bibleQuote.results').css('border-width', BGET[key]+'px' );
        break;
        case 'PARAGRAPHSTYLES_BORDERCOLOR':
            jQuery('.bibleQuote.results').css('border-color', BGET[key] );
        break;
        case 'PARAGRAPHSTYLES_BORDERSTYLE':
            jQuery('.bibleQuote.results').css('border-style', BGETConstants.CSSRULE.BORDERSTYLE[BGET[key]] );
        break;
        case 'PARAGRAPHSTYLES_BORDERRADIUS':
            jQuery('.bibleQuote.results').css('border-radius', BGET[key]+'px' );
        break;
        case 'PARAGRAPHSTYLES_BACKGROUNDCOLOR':
            jQuery('.bibleQuote.results').css('background-color', BGET[key] );
        break;
    }
}

const handleVersionStyles = (BibleGetGlobal, key) => {
    const { BGET } = BibleGetGlobal;
    switch( key ) {
        case 'VERSIONSTYLES_BOLD':
            let fontweight = BGET.VERSIONSTYLES_BOLD ? 'bold' : 'normal';
            jQuery('.bibleQuote.results .bibleVersion').css('font-weight',fontweight);
        break;
        case 'VERSIONSTYLES_ITALIC':
            let fontstyle = BGET.VERSIONSTYLES_ITALIC ? 'italic' : 'normal';
            jQuery('.bibleQuote.results .bibleVersion').css('font-style',fontstyle);
        break;
        case 'VERSIONSTYLES_UNDERLINE':
            if(BGET.VERSIONSTYLES_UNDERLINE) {
                vsdecorations.push('underline');
            } else {
                let idx = vsdecorations.indexOf('underline');
                if( idx !== -1 ) {
                    vsdecorations.splice(idx,1);
                }
            }
        //nobreak;
        case 'VERSIONSTYLES_STRIKETHROUGH':
            if(BGET.VERSIONSTYLES_STRIKETHROUGH){
                vsdecorations.push('line-through');
            } else {
                let idx1 = vsdecorations.indexOf('line-through');
                if( idx1 !== -1 ) {
                    vsdecorations.splice(idx1,1);
                }
            }
            let textdecoration = vsdecorations.length === 0 ? 'none' : vsdecorations.join(' ');
            jQuery('.bibleQuote.results .bibleVersion').css('text-decoration',textdecoration);
        break;
        case 'VERSIONSTYLES_TEXTCOLOR':
            jQuery('.bibleQuote.results .bibleVersion').css('color', BGET[key] );
        break;
        case 'VERSIONSTYLES_FONTSIZE':
        //nobreak;
        case 'VERSIONSTYLES_FONTSIZEUNIT':
            let fontsize = BGET.VERSIONSTYLES_FONTSIZE;
            if(BGET.VERSIONSTYLES_FONTSIZEUNIT == 'em'){
                fontsize /= 10;
            }
            jQuery('.bibleQuote.results .bibleVersion').css('font-size', fontsize+BGET.VERSIONSTYLES_FONTSIZEUNIT );
        break;
        /*
        case 'VERSIONSTYLES_VALIGN':
            //this really only makes sense for verse numbers
        break;
        */
    }
}

const handleBookChapterStyles = (BibleGetGlobal,key) => {
    const { BGET } = BibleGetGlobal;
    switch( key ) {
        case 'BOOKCHAPTERSTYLES_BOLD':
            let fontweight = BGET.BOOKCHAPTERSTYLES_BOLD ? 'bold' : 'normal';
            jQuery('.bibleQuote.results .bookChapter').css('font-weight',fontweight);
        break;
        case 'BOOKCHAPTERSTYLES_ITALIC':
            let fontstyle = BGET.BOOKCHAPTERSTYLES_ITALIC ? 'italic' : 'normal';
            jQuery('.bibleQuote.results .bookChapter').css('font-style',fontstyle);
        break;
        case 'BOOKCHAPTERSTYLES_UNDERLINE':
            if(BGET.BOOKCHAPTERSTYLES_UNDERLINE) {
                bcdecorations.push('underline');
            } else {
                let idx = bcdecorations.indexOf('underline');
                if( idx !== -1 ) {
                    bcdecorations.splice(idx,1);
                }
            }
        //nobreak;
        case 'BOOKCHAPTERSTYLES_STRIKETHROUGH':
            if(BGET.BOOKCHAPTERSTYLES_STRIKETHROUGH) {
                bcdecorations.push('line-through');
            } else {
                let idx1 = bcdecorations.indexOf('line-through');
                if( idx1 !== -1 ) {
                    bcdecorations.splice(idx1,1);
                }
            }
            let textdecoration = bcdecorations.length === 0 ? 'none' : bcdecorations.join(' ');
            jQuery('.bibleQuote.results .bookChapter').css('text-decoration',textdecoration);
        break;
        case 'BOOKCHAPTERSTYLES_TEXTCOLOR':
            jQuery('.bibleQuote.results .bookChapter').css('color', BGET[key] );
        break;
        case 'BOOKCHAPTERSTYLES_FONTSIZE':
        //nobreak;
        case 'BOOKCHAPTERSTYLES_FONTSIZEUNIT':
            let fontsize = BGET.BOOKCHAPTERSTYLES_FONTSIZE;
            if(BGET.BOOKCHAPTERSTYLES_FONTSIZEUNIT == 'em'){
                fontsize /= 10;
            }
            jQuery('.bibleQuote.results .bookChapter').css('font-size', fontsize+BGET.BOOKCHAPTERSTYLES_FONTSIZEUNIT ); 
        break;
        /*
        case 'BOOKCHAPTERSTYLES_VALIGN':
            //this really only makes sense for verse numbers
        break;
        */
    }
}

const handleVerseNumberStyles = (BibleGetGlobal,key) => {
    const { BGET, BGETConstants } = BibleGetGlobal;
    switch(key) {
        case 'VERSENUMBERSTYLES_BOLD':
            let fontweight = BGET.VERSENUMBERSTYLES_BOLD ? 'bold' : 'normal';
            jQuery('.bibleQuote.results .versesParagraph .verseNum').css('font-weight',fontweight);
        break;
        case 'VERSENUMBERSTYLES_ITALIC':
            let fontstyle = BGET.VERSENUMBERSTYLES_ITALIC ? 'italic' : 'normal';
            jQuery('.bibleQuote.results .versesParagraph .verseNum').css('font-style',fontstyle);
        break;
        case 'VERSENUMBERSTYLES_UNDERLINE':
            if(BGET.VERSENUMBERSTYLES_UNDERLINE){
                vndecorations.push('underline');
            } else {
                let idx = vndecorations.indexOf('underline');
                if( idx !== -1 ) {
                    vndecorations.splice(idx,1);
                }
            }
        //nobreak;
        case 'VERSENUMBERSTYLES_STRIKETHROUGH':
            if(BGET.VERSENUMBERSTYLES_STRIKETHROUGH){
                vndecorations.push('line-through');
            } else {
                let idx1 = vndecorations.indexOf('line-through');
                if( idx1 !== -1 ) {
                    vndecorations.splice(idx1,1);
                }
            }
            let textdecoration = vndecorations.length === 0 ? 'none' : vndecorations.join(' ');
            jQuery('.bibleQuote.results .versesParagraph .verseNum').css('text-decoration',textdecoration);
        break;
        case 'VERSENUMBERSTYLES_TEXTCOLOR':
            jQuery('.bibleQuote.results .versesParagraph .verseNum').css('color', BGET[key] );
        break;
        case 'VERSENUMBERSTYLES_FONTSIZE':
        //nobreak;
        case 'VERSENUMBERSTYLES_FONTSIZEUNIT':
            let fontsize = BGET.VERSENUMBERSTYLES_FONTSIZE;
            if(BGET.VERSENUMBERSTYLES_FONTSIZEUNIT == 'em'){
                fontsize /= 10;
            }
            jQuery('.bibleQuote.results .versesParagraph .verseNum').css('font-size', fontsize+BGET.VERSENUMBERSTYLES_FONTSIZEUNIT ); 
        break;
        case 'VERSENUMBERSTYLES_VALIGN':
            let styles = {};
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
            jQuery('.bibleQuote.results .versesParagraph .verseNum').css(styles);
        break;
    }
}

const handleVerseTextStyles = (BibleGetGlobal,key) => {
    const { BGET } = BibleGetGlobal;
    switch( key ) {
        case 'VERSETEXTSTYLES_BOLD':
            let fontweight = BGET.VERSETEXTSTYLES_BOLD ? 'bold' : 'normal';
            jQuery('.bibleQuote.results .versesParagraph').css('font-weight',fontweight);
        break;
        case 'VERSETEXTSTYLES_ITALIC':
            let fontstyle = BGET.VERSETEXTSTYLES_ITALIC ? 'italic' : 'normal';
            jQuery('.bibleQuote.results .versesParagraph').css('font-style',fontstyle);
        break;
        case 'VERSETEXTSTYLES_UNDERLINE':
            if(BGET.VERSETEXTSTYLES_UNDERLINE) { 
                vtdecorations.push('underline');
            } else {
                let idx = vtdecorations.indexOf('underline');
                if( idx !== -1 ) {
                    vtdecorations.splice(idx,1);
                }
            }
        //nobreak;
        case 'VERSETEXTSTYLES_STRIKETHROUGH':
            if(BGET.VERSETEXTSTYLES_STRIKETHROUGH) {
                vtdecorations.push('line-through');
            } else {
                let idx1 = vtdecorations.indexOf('line-through');
                if( idx1 !== -1 ) {
                    vtdecorations.splice(idx1,1);
                }
            }
            let textdecoration = vtdecorations.length === 0 ? 'none' : vtdecorations.join(' ');
            jQuery('.bibleQuote.results .versesParagraph').css('text-decoration',textdecoration);
        break;
        case 'VERSETEXTSTYLES_TEXTCOLOR':
            jQuery('.bibleQuote.results .versesParagraph').css('color', BGET[key] );
        break;
        case 'VERSETEXTSTYLES_FONTSIZE':
        //nobreak;
        case 'VERSETEXTSTYLES_FONTSIZEUNIT':
            let fontsize = BGET.VERSETEXTSTYLES_FONTSIZE;
            if(BGET.VERSETEXTSTYLES_FONTSIZEUNIT == 'em'){
                fontsize /= 10;
            }
            jQuery('.bibleQuote.results .versesParagraph').css('font-size', fontsize+BGET.VERSETEXTSTYLES_FONTSIZEUNIT );
        break;
        /*
        case 'VERSETEXTSTYLES_VALIGN':
            //this really only makes sense for verse numbers
        break;
        */
    }
}

( function( $ ) {
    /* Wouldn't it be great to be able to just iterate over the defined properties / attributes / options?
     * Maybe we could, if we defined the function to bind such that it's the same as the Gutenberg block live preview functions?
     * Making these functions another property of the defined properties / attributes? Would that be possible?
     * Would probably require like an eval or something like that? I don't like the idea of eval though...
     * In the meantime, we can still iterate over them and use a switch case to treat them one by one...
    */
    if(BibleGetGlobal !== null && typeof BibleGetGlobal === 'object' && BibleGetGlobal.hasOwnProperty('BGETProperties') && BibleGetGlobal.hasOwnProperty('BGETConstants') && BibleGetGlobal.hasOwnProperty('BGET') ){
        if(typeof BibleGetGlobal.BGETProperties === 'object' && typeof BibleGetGlobal.BGETConstants === 'object' && typeof BibleGetGlobal.BGET === 'object'){
            const { BGETProperties, BGET } = BibleGetGlobal; //extract our properties
            for(const key in BGETProperties ){
                wp.customize( 'BGET['+key+']', function(value) {
                    value.bind(function( newval ) {
                        //keep our local store of properties/attributes/preferences updated
                        BGET[key] = newval; 
                        if( key.startsWith('PARAGRAPHSTYLES') ) {
                            handleParagraphStyles(BibleGetGlobal,key);
                        }
                        else if( key.startsWith('VERSIONSTYLES') ) {
                            handleVersionStyles(BibleGetGlobal,key);
                        }
                        else if( key.startsWith('BOOKCHAPTERSTYLES') ) {
                            handleBookChapterStyles(BibleGetGlobal,key);
                        }
                        else if( key.startsWith('VERSENUMBERSTYLES') ) {
                            handleVerseNumberStyles(BibleGetGlobal,key);
                        }
                        else if( key.startsWith('VERSETEXTSTYLES') ) {
                            handleVerseTextStyles(BibleGetGlobal,key);
                        }
                        /* We don't use any of the Layout Prefs in the Customizer at least for now
                            * considering that they change the structure of the Bible quote, not just the styling
                            * Theoretically it would be possible even without a ServerSideRender (as in the case of the Gutenberg block)
                            * if we were using a json response from the BibleGet server instead of an html response
                            * or, even with the current html response, using DOM manipulation similarly to how the ServerSideRender
                            * is manipulating the DOM. We'll see, one thing at a time
                        switch(key){
                            case 'LAYOUTPREFS_SHOWBIBLEVERSION':
                            case 'LAYOUTPREFS_BIBLEVERSIONALIGNMENT':
                            case 'LAYOUTPREFS_BIBLEVERSIONPOSITION':
                            case 'LAYOUTPREFS_BIBLEVERSIONWRAP':
                            case 'LAYOUTPREFS_BOOKCHAPTERALIGNMENT':
                            case 'LAYOUTPREFS_BOOKCHAPTERPOSITION':
                            case 'LAYOUTPREFS_BOOKCHAPTERWRAP':
                            case 'LAYOUTPREFS_BOOKCHAPTERFORMAT':
                            case 'LAYOUTPREFS_BOOKCHAPTERFULLQUERY':
                            case 'LAYOUTPREFS_SHOWVERSENUMBERS':
                            case 'VERSION':
                            case 'QUERY':
                            case 'POPUP':
                            case 'FORCEVERSION':
                            case 'FORCECOPYRIGHT':
                        }
                        */
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
