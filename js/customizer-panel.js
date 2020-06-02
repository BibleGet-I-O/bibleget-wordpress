
function jq( myid ) {
    return "#" + myid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
}

jQuery(document).ready(function(){
	jQuery('input[type="range"]').each(function(){
		let min = jQuery(this).attr('min');
		let max = jQuery(this).attr('max');
		let val = jQuery(this).val();
		let unit = 'px';
		if(this.id.includes('PARAGRAPHSTYLES_WIDTH') ){
			unit = '%';
		}else if(this.id.includes('FONTSIZE')){
			let FtSizeUnitId = this.id.replace('FONTSIZE','FONTSIZEUNIT');
			unit = jQuery(jq(FtSizeUnitId)).val();
		}
		jQuery(this).before('<span style="margin:0px 5px;vertical-align:top;display:inline-block;width:2em;">'+min+unit+'</span>');
		jQuery(this).after('<span style="margin:0px 5px;vertical-align:top;display:inline-block;width:2em;">'+max+unit+'</span><span style="margin:0px 5px;color:Green;font-weight:bold;position:relative;top:-3px;border:1px solid Black;border-radius:3px;padding: 3px;background-color:White;width:2em;text-align:center;display:inline-block;" class="rangeValue">'+val+'</span>');
		jQuery(this).on('input',function(){
			jQuery(this).siblings('.rangeValue').text(this.value);
		});
	});

	jQuery(jq('_customize-input-BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]_ctl')).on('change',function(){
		let $MargLR = jQuery(jq('_customize-input-BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHT]_ctl'));
		if(this.value == 'auto'){
			$MargLR.prop('disabled',true);
		}
		else{
			$MargLR.prop('disabled',false);
			$MargLR.prev('span').text($MargLR.attr('min') + this.value);
			$MargLR.next('span').text($MargLR.attr('max') + this.value);
		}
	});

	if(jQuery(jq('_customize-input-BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]_ctl')).val()=='auto'){
		jQuery(jq('_customize-input-BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHT]_ctl')).prop('disabled',true);
	}else{

	}

	jQuery(jq('_customize-input-BGET[VERSIONSTYLES_FONTSIZEUNIT]_ctl'))
		.add(jQuery(jq('_customize-input-BGET[BOOKCHAPTERSTYLES_FONTSIZEUNIT]_ctl')))
		.add(jQuery(jq('_customize-input-BGET[VERSENUMBERSTYLES_FONTSIZEUNIT]_ctl')))
		.add(jQuery(jq('_customize-input-BGET[VERSETEXTSTYLES_FONTSIZEUNIT]_ctl')))
		.on('change',function(){
			let thisid = this.id.replace('UNIT','');
			let $FtSize = jQuery(jq(thisid));
			if(this.value == 'inherit'){
				$FtSize.prop('disabled',true);
			}
			else{
				$FtSize.prop('disabled',false);
				$FtSize.prev('span').text($FtSize.attr('min') + this.value);
				$FtSize.next('span').text($FtSize.attr('max') + this.value);
			}
	});

	if(jQuery(jq('_customize-input-BGET[VERSIONSTYLES_FONTSIZEUNIT]_ctl')).val()=='auto'){
		let $FtSize = jQuery(jq('_customize-input-BGET[VERSIONSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
	}

	if(jQuery(jq('_customize-input-BGET[BOOKCHAPTERSTYLES_FONTSIZEUNIT]_ctl')).val()=='auto'){
		let $FtSize = jQuery(jq('_customize-input-BGET[BOOKCHAPTERSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
	}

	if(jQuery(jq('_customize-input-BGET[VERSENUMBERSTYLES_FONTSIZEUNIT]_ctl')).val()=='auto'){
		let $FtSize = jQuery(jq('_customize-input-BGET[VERSENUMBERSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
	}

	if(jQuery(jq('_customize-input-BGET[VERSETEXTSTYLES_FONTSIZEUNIT]_ctl')).val()=='auto'){
		let $FtSize = jQuery(jq('_customize-input-BGET[VERSETEXTSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
	}

});