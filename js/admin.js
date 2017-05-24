//using localize script to pass in values from options array, access with "obj" which has "options"

//console.log("admin.js is successfully loaded");
//console.log(obj);

jQuery(document).ready(function($){
		
	fval = jQuery("#versionselect").val();
	if(fval!==null && fval.length>0){
		jQuery("#favorite_version").val(fval.join(","));
	}
		
	jQuery("#versionselect").change(function(){
		var fval = jQuery(this).val();
		//console.log(fval);
		if(fval!==null && fval.length>0){
			jQuery("#favorite_version").val(fval.join(","));
		}
		else{
			jQuery("#favorite_version").val('');
		}
	});
	
	
	jQuery("#bibleget-server-data-renew-btn").click(function(){
		//check again how to do wordpress ajax, really no need to do a makeshift ajax post to this page
		data = {action:'refresh_bibleget_server_data',security:obj.ajax_nonce,isajax:1};
		$.post(obj.ajax_url,data,function(returndata){ if(returndata=="datarefreshed"){ location.reload(true); } });
	});
	
});