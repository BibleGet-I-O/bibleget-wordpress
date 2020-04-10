/*
 * Gutenberg Block registration script
 * BibleGet I/O plugin
 * Author: John Romano D'Orazio priest@johnromanodorazio.com
 */

(function(blocks,element,i18n,editor,components,$){
    //define the same attributes as the shortcode, but now in JSON format
    const bbGetShCdAttributes = {
    	query : { default: 'Matthew1:1-5' },
    	version : { default: 'NABRE' },
    	popup : { default: 'false' }
    };
    const {registerBlockType} = blocks; //Blocks API
    const {createElement} = element; //React.createElement
    const {__} = i18n; //translation functions
    const {InspectorControls} = editor; //Block inspector wrapper
    const {TextControl,SelectControl,RadioControl,ServerSideRender} = components; //WordPress form inputs and server-side renderer

    registerBlockType( 'bibleget/bible-quote', {
    	title: __( 'Bible quote' ), // Block title.
    	category:  'widgets',
        icon: 'book-alt',
    	attributes: bbGetShCdAttributes,
    	//display the edit interface + preview
    	edit(props){
    		const attributes =  props.attributes;
    		const setAttributes =  props.setAttributes;
    
    		//Function to update the query with Bible reference
    		function changeQuery(query){
    			setAttributes({query});
    		}
    
    		//Function to update Bible version that will be used to retrieve the Bible quote
    		function changeVersion(version){
    			setAttributes({version});
    		}
    		
    		//Function to update whether the Bible quote will be showed in a popup or not
    		function changePopup(popup){
    			setAttributes({popup});
    		}
    
    		return createElement('div', {}, [
     			//Preview a block with a PHP render callback
    			createElement( ServerSideRender, {
    				block: 'bibleget/bible-quote',
    				attributes: attributes
    			} ),
    			createElement( InspectorControls, {}, [
                   					//A simple text control for query
                					createElement(TextControl, {
                						value: attributes.query,
                						label: __( 'Bible Reference' ),
                						onChange: changeQuery,
                						type: 'text'
                					}),
                					//Select version to quote from
                					createElement(SelectControl, {
                						value: attributes.version,
                						label: __( 'Bible Version' ),
                						onChange: changeVersion,
                						options: [
                							{value: 'h2', label: 'H2'},
                							{value: 'h3', label: 'H3'},
                							{value: 'h4', label: 'H4'},
                						]
                					}),
                					//Select whether this will be a popup or not
                					createElement(RadioControl, {
                						value: attributes.popup,
                						label: __( 'Display in Popup' ),
                						onChange: changePopup,
                						options: [
                							{value: 'true', label: 'true'},
                							{value: 'false', label: 'false'}
                						]
                					})
    			                                       
    			               ] 
    			)
    		] )
    	},
    	save(){
    		return null;//save has to exist. This all we need
    	}
    });

    $(document).on('click','.bibleget-popup-trigger',function(){
		var popup_content = he.decode($(this).attr("data-popupcontent"));
		var dlg = $('<div class="bibleget-quote-div bibleget-popup">'+popup_content+'</div>').dialog({
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
    wp.editor,
    wp.components,
    jQuery
) );
