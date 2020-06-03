
function jq( myid ) {
    return "#" + myid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
}

jQuery(document).ready(function(){
	jQuery('input[type="range"]').each(function(){
		let unit = 'px';
		if(this.id.includes('PARAGRAPHSTYLES_WIDTH') ){
			unit = '%';
		}else if(this.id.includes('FONTSIZE')){
			let FtSizeUnitId = this.id.replace('FONTSIZE','FONTSIZEUNIT');
			unit = jQuery(jq(FtSizeUnitId)).val();
		}
		let min = (unit == 'em') ? jQuery(this).attr('min')/10 : jQuery(this).attr('min');
		let max = (unit == 'em') ? jQuery(this).attr('max')/10 : jQuery(this).attr('max');
		let val = (unit == 'em') ? jQuery(this).val()/10 : jQuery(this).val();
		jQuery(this).before('<span class="rangeBefore">'+min+unit+'</span>');
		jQuery(this).after('<span class="rangeAfter">'+max+unit+'</span><span class="rangeValue">'+val+'</span>');
		jQuery(this).on('input',function(){
			if(this.id.includes('FONTSIZE')){
				let FtSizeUnitId = this.id.replace('FONTSIZE','FONTSIZEUNIT');
				unit = jQuery(jq(FtSizeUnitId)).val();
			}
			if(unit=='em'){
				jQuery(this).siblings('.rangeValue').text(this.value/10);
			}else{
				jQuery(this).siblings('.rangeValue').text(this.value);
			}
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
		//we don't need to enable it explicitly, it's already enable unless we explicity disable
	}

	if(jQuery(jq('_customize-input-BGET[VERSIONSTYLES_FONTSIZEUNIT]_ctl')).val()=='inherit'){
		let $FtSize = jQuery(jq('_customize-input-BGET[VERSIONSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
	}

	if(jQuery(jq('_customize-input-BGET[BOOKCHAPTERSTYLES_FONTSIZEUNIT]_ctl')).val()=='inherit'){
		let $FtSize = jQuery(jq('_customize-input-BGET[BOOKCHAPTERSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
	}

	if(jQuery(jq('_customize-input-BGET[VERSENUMBERSTYLES_FONTSIZEUNIT]_ctl')).val()=='inherit'){
		let $FtSize = jQuery(jq('_customize-input-BGET[VERSENUMBERSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
	}

	if(jQuery(jq('_customize-input-BGET[VERSETEXTSTYLES_FONTSIZEUNIT]_ctl')).val()=='inherit'){
		let $FtSize = jQuery(jq('_customize-input-BGET[VERSETEXTSTYLES_FONTSIZE]_ctl'));
		$FtSize.prop('disabled',true);
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
			else if(this.value == 'em'){
				$FtSize.prop('disabled',false);
				$FtSize.prev('span').text(($FtSize.attr('min')/10) + this.value);
				$FtSize.next('span').text(($FtSize.attr('max')/10) + this.value);
				$FtSize.siblings('.rangeValue').text($FtSize.val()/10);
			}else{
				$FtSize.prop('disabled',false);
				$FtSize.prev('span').text($FtSize.attr('min') + this.value);
				$FtSize.next('span').text($FtSize.attr('max') + this.value);
				$FtSize.siblings('.rangeValue').text($FtSize.val());
			}
	});

});