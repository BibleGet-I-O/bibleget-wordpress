//using localize script to pass in values from options array, access with "obj" which has "options"

//console.log("admin.js is successfully loaded");
//console.log(obj);

jQuery(document).ready(function($) {

	fval = jQuery("#versionselect").val();
	if (fval !== null && fval.length > 0) {
		jQuery("#favorite_version").val(fval.join(","));
	}

	jQuery("#versionselect").change(function() {
		var fval = jQuery(this).val();
		// console.log(fval);
		if (fval !== null && fval.length > 0) {
			jQuery("#favorite_version").val(fval.join(","));
		} else {
			jQuery("#favorite_version").val('');
		}
	});

	jQuery("#bibleget-server-data-renew-btn").click(function() {
				// check again how to do wordpress ajax,
				// really no need to do a makeshift ajax
				// post to this page
				postdata = {
					action : 'refresh_bibleget_server_data',
					security : obj.ajax_nonce,
					isajax : 1
				};
				var interval1 = null;
				jQuery.ajax({
					type : 'POST',
					url : obj.ajax_url,
					data : postdata,
					beforeSend : function() {
						jQuery('#bibleget_ajax_spinner').show();
					},
					complete : function() {
						jQuery('#bibleget_ajax_spinner').hide();
					},
					success : function(returndata) {
						if (returndata == 'datarefreshed') {
							jQuery(
							"#bibleget-settings-notification")
							.append(
							'Data from server retrieved successfully, now refreshing page... <span id="bibleget-countdown">3 secs...</span>')
							.fadeIn("slow", function() {
								var seconds = 3;
								interval1 = setInterval(function() {
									jQuery("#bibleget-countdown").text(
										--seconds
										+ (seconds==1?" sec...":" secs..."));
									}, 1000);
								var timeout1 = setTimeout(function() {
										clearInterval(interval1);
										location.reload(true);
									}, 3000);
							});
						} else {
							jQuery("#bibleget-settings-notification").append(
									'Communication with the server seems to have been successful, however it does not seem that we have received the refreshed data... Perhaps try again?')
									.fadeIn("slow");
						}
						jQuery(".bibleget-settings-notification-dismiss")
							.click(function() {
								jQuery("#bibleget-settings-notification").fadeOut("slow");
							});
					},
					error : function(xhr, ajaxOptions, thrownError) {
						jQuery("#bibleget-settings-notification")
							.fadeIn("slow")
							.append('Communication with the BibleGet server was not successfull... ERROR: ' + xhr.responseText);
						jQuery(".bibleget-settings-notification-dismiss")
							.click(function() {
								jQuery("#bibleget-settings-notification").fadeOut("slow");
							});

					}
				});
			});

});