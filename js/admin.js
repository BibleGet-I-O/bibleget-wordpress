//using localize script to pass in values from options array, access with "bibleGetOptionsFromServer" which has "options"

//console.log("admin.js is successfully loaded");
//console.log(bibleGetOptionsFromServer);

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
			security : bibleGetOptionsFromServer.ajax_nonce,
			isajax : 1
		};
		var interval1 = null;
		jQuery.ajax({
			type : 'POST',
			url : bibleGetOptionsFromServer.ajax_url,
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
					.append('Communication with the BibleGet server was not successful... ERROR: ' + xhr.responseText);
				jQuery(".bibleget-settings-notification-dismiss")
					.click(function() {
						jQuery("#bibleget-settings-notification").fadeOut("slow");
					});

			}
		});
	});
    
	if(typeof gfontsBatch !== 'undefined' && typeof gfontsBatch === 'object' && gfontsBatch.hasOwnProperty('job') && gfontsBatch.job.hasOwnProperty('gfontsPreviewJob') && gfontsBatch.job.gfontsPreviewJob === true && gfontsBatch.job.hasOwnProperty('gfontsWeblist') && typeof gfontsBatch.job.gfontsWeblist == 'object' && gfontsBatch.job.gfontsWeblist.hasOwnProperty('items') ){
        //console.log('We have a gfontsPreviewJob to do! gfontsBatch: ');
        //console.log(gfontsBatch);
        
        var startIdx = 0;       //starting index for this batch run
        var gfontsCount = gfontsBatch.job.gfontsWeblist.items.length;
        var batchLimit = 300;   //general batch limit for each run, so that we don't block the server but yet we try to do a good number if we can
        var lastBatchLimit = 0; //if we have a remainder from the full batches, this will be the batchLimit for that remainder
        var numRuns = 0;        //we'll set this in a minute
        var currentRun = 1;     //of course we start from 1, the first run

        //Let's calculate how many times we will have to make the ajax call
        //  in order to complete the local download of all the requested miniaturized font files
        //Perhaps lastBatchLimit variable is superfluous because PHP will check bounds,
        //  but hey let's be precise on each side, why not
        if(gfontsCount % batchLimit == 0){
            numRuns = (gfontsCount / batchLimit);
            //console.log('gfontsCount is divided evenly by the batchLimit, numRuns should be an integer such as 3. numRuns = '+numRuns);
        }
        else if((gfontsCount % batchLimit) > 0){
            numRuns = Math.floor(gfontsCount / batchLimit) + 1;
            lastBatchLimit = (gfontsCount % batchLimit);
            //console.log('gfontsCount is not divided evenly by the batchLimit, we have a remainder. numRuns should be an integer larger by one compared to the value of that division, 4 in this case. numRuns = '+numRuns);
            //console.log('gfontsCount = '+gfontsCount);
            //console.log('batchLimit = '+batchLimit);
        }

        //$gfontsBatchRunProgressbarOverlay, $gfontsBatchRunProgressbarWrapper, and $gfontsBatchRunProgressbar are global variables so don't use "var" here
        $gfontsBatchRunProgressbarOverlay = jQuery("<div>",{id:"gfontsBatchRunProgressBarOverlay"});
        jQuery('body').append($gfontsBatchRunProgressbarOverlay);
        $gfontsBatchRunProgressbarWrapper = jQuery("<div>",{id:"gfontsBatchRunProgressBarWrapper"});
        jQuery('body').append($gfontsBatchRunProgressbarWrapper);
        $gfontsBatchRunProgressbar = jQuery('<div id="gfontsBatchRunProgressbar"><div id="gfontsBatchRunProgressbarLabelWrapper"><div id="gfontsBatchRunProgressbarLabel">Installation process of Google Fonts preview 0%</div></div></div>');
        jQuery($gfontsBatchRunProgressbarWrapper).append($gfontsBatchRunProgressbar);
        
        //var inProgress = false;
        
        $gfontsBatchRunProgressbar.progressbar({
    		  value: 0,
    		  change: function() {
    			  jQuery('#gfontsBatchRunProgressbarLabel').text( 'Installation process of Google Fonts preview ' + jQuery(this).progressbar("value") + '%' );
    		  },
    		  complete: function() {
    			  jQuery('#gfontsBatchRunProgressbarLabel').text( 'Installation process of Google Font preview COMPLETE' );
                  setTimeout(function(){ $gfontsBatchRunProgressbarWrapper.add($gfontsBatchRunProgressbarOverlay).fadeOut(1000) }, 1000);
    		  }
        });
        
        postdata = {
			action : 'store_gfonts_preview',
			security : gfontsBatch.job.gfontsNonce,
            gfontsCount: gfontsCount,
            batchLimit : batchLimit,
            lastBatchLimit: lastBatchLimit,
            numRuns: numRuns,
            currentRun: currentRun,
            startIdx : 0
        };
        //console.log(postdata);
        gfontsBatchRun(postdata);
        
    }
    else{
//        console.log('We do not seem to have a gfontsPreviewJob');
//        console.log(typeof gfontsBatch);
//        console.log(gfontsBatch);
//        console.log('TEST CONDITION 1: typeof gfontsBatch !== \'undefined\'');
//        console.log(typeof gfontsBatch !== 'undefined');
//        console.log('TEST CONDITION 2: typeof gfontsBatch === \'object\'');
//        console.log(typeof gfontsBatch === 'object');
//        console.log('TEST CONDITION 3: gfontsBatch.hasOwnProperty(\'job\')');
//        console.log(gfontsBatch.hasOwnProperty('job'));
//        console.log('TEST CONDITION 4: gfontsBatch.job.hasOwnProperty(\'gfontsPreviewJob\')');
//        console.log(gfontsBatch.job.hasOwnProperty('job'));
//        console.log('TEST CONDITION 5: gfontsBatch.job.gfontsPreviewJob === true (an actual boolean value)');
//        console.log(gfontsBatch.job.gfontsPreviewJob === true);
    }
        

	jQuery('#biblegetGFapiKeyRetest').click(function(){
		location.reload(true);
	});
	
	jQuery('#biblegetForceRefreshGFapiResults').on('click',bibleGetForceRefreshGFapiResults);
	
});

var myProgressInterval = null;
var myProgressValue= 0;
var $gfontsBatchRunProgressbarOverlay;
var $gfontsBatchRunProgressbar;
var $gfontsBatchRunProgressbarWrapper;

var gfontsBatchRun= function(postdata){
        jQuery.ajax({
			type : 'POST',
			url : gfontsBatch.job.ajax_url,
			data : postdata,
            dataType: 'json',
			beforeSend : function() {
				jQuery('#bibleget_ajax_spinner').show();
                $gfontsBatchRunProgressbar.progressbar("value");
                myProgressInterval = setInterval(updateGfontsBatchRunProgressbarProgress, 1500, postdata.currentRun, postdata.numRuns);
			},
			complete : function() {
				jQuery('#bibleget_ajax_spinner').hide();
			},
			success : function(returndata) {
                clearInterval(myProgressInterval);
                var returndataJSON = (typeof returndata !== 'object') ? JSON.parse(returndata) : returndata;
                //console.log('gfontsBatchRun success, returndataJSON:');
                //console.log(returndataJSON);
                if(returndataJSON !== null && typeof returndataJSON === 'object'){
                    var thisRun = returndataJSON.hasOwnProperty('run') ? returndataJSON.run : false;
                    if(returndataJSON.hasOwnProperty('errorinfo') && returndataJSON.errorinfo !== false && returndataJSON.errorinfo.length > 0){
                        //console.log('Some errors were returned from ajax process run '+thisRun);
                        //console.log(returndataJSON.errorinfo);
                    	if((returndataJSON.hasOwnProperty('httpStatus2') && returndataJSON.httpStatus2 == 504) || (returndataJSON.hasOwnProperty('httpStatus3') && returndataJSON.httpStatus3 == 504) ){
                    		//there was a timeout at some point during the communication with the Google Fonts server
                    		//we haven't finished yet, but let's try not to get stuck
                    		bibleGetForceRefreshGFapiResults();
                    	}
                    }
                    if(returndataJSON.hasOwnProperty('state')){
                        switch(returndataJSON.state){
                            case 'RUN_PROCESSED':
                                var maxUpdatePerRun = 100 / postdata.numRuns;
                                var maxedOutUpdateThisRun = maxUpdatePerRun * thisRun;
                                $gfontsBatchRunProgressbar.progressbar("value",maxedOutUpdateThisRun);
                                
                                if(thisRun && thisRun < postdata.numRuns){
                                    //console.log('gfontsBatchRun was asked to do run '+postdata.currentRun+', and has let us know that it has in fact completed run '+thisRun+', now starting the next run');
                                    //check if we're doing the last run or not
                                    if(++postdata.currentRun == postdata.numRuns){
                                        postdata.batchLimit == postdata.lastBatchLimit;
                                    }
                                    postdata.startIdx = postdata.startIdx + postdata.batchLimit;
                                    
                                    //Let's go for another round!
                                    gfontsBatchRun(postdata);
                                }
                                else{
                                    //console.log('We seem to have finished our job ahead of time? Please double check: numRuns= '+postdata.numRuns+', thisRun = '+thisRun);
                                }
                                break;
                            case 'COMPLETE':
                                $gfontsBatchRunProgressbar.progressbar("value",100);

                                if(thisRun == postdata.numRuns){
                                    //console.log('gfontsBatchRun has finished the job!');                                
                                }
                                else{
                                    //console.log('gfontsBatchRun is telling us that we have finished our job, but this might not be the case: numRuns= '+postdata.numRuns+', thisRun = '+thisRun);
                                }
                                break;
                        }
                    }
                    else{
                        //console.log('gfontsBatchRun: Now why do we not have any stateful info?');
                    }
                 }
                 else{
                    //console.log('gfontsBatchRun: Now why do we not have any kind of feedback from the server side script?')
                 }
            },
			error : function(xhr, ajaxOptions, thrownError) {
                clearInterval(myProgressInterval);
                jQuery("#bibleget-settings-notification")
					.fadeIn("slow")
					.append('Communication with the Google Fonts server was not successful... ERROR: ' + thrownError + ' ' + xhr.responseText);
				jQuery(".bibleget-settings-notification-dismiss")
					.click(function() {
						jQuery("#bibleget-settings-notification").fadeOut("slow");
					});

			}
    	});
};

var updateGfontsBatchRunProgressbarProgress = function(currentRun,numRuns){
    //console.log('half second tick and $gfontsBatchRunProgressbar.progressbar("value") = '+$gfontsBatchRunProgressbar.progressbar("value"));
    //console.log('half second tick and currentRun = '+currentRun+', numRuns = '+numRuns);
    var maxUpdatePerRun = Math.floor(100 / parseInt(numRuns)); //if we do 4 runs, we will update no more than 25% of the progressbar for each run
    //console.log('half second tick and maxUpdatePerRun = '+maxUpdatePerRun+', (maxUpdatePerRun * currentRun) = '+(maxUpdatePerRun * currentRun));
    if($gfontsBatchRunProgressbar.progressbar("value") < (maxUpdatePerRun * parseInt(currentRun))){
        var currentProgressBarValue = parseInt($gfontsBatchRunProgressbar.progressbar("value"));
        $gfontsBatchRunProgressbar.progressbar("value",++currentProgressBarValue);
    }
};

var bibleGetForceRefreshGFapiResults = function(){
	//send ajax request to the server to have the transient deleted
	//console.log('we should have an nonce for this action: '+gfontsBatch.gfontsRefreshNonce);
	if(typeof gfontsBatch != 'undefined' && typeof gfontsBatch == 'object' && gfontsBatch.hasOwnProperty('job') && typeof gfontsBatch.job == 'object' && gfontsBatch.job.hasOwnProperty('gfontsRefreshNonce') && gfontsBatch.job.gfontsRefreshNonce != '' && gfontsBatch.job.hasOwnProperty('gfontsApiKey') && gfontsBatch.job.gfontsApiKey != '' ){
		var postProps = {
				action : 'bibleget_refresh_gfonts',
				security : gfontsBatch.job.gfontsRefreshNonce,
				gfontsApiKey: gfontsBatch.job.gfontsApiKey
			};
		jQuery.ajax({
			type: 'POST',
			url: gfontsBatch.job.ajax_url,
			data: postProps,
			beforeSend : function() {
				jQuery('#bibleget_ajax_spinner').show();
			},
			complete : function() {
				jQuery('#bibleget_ajax_spinner').hide();
			},
			success : function(retval){
				switch(retval){
					case "TRANSIENT_DELETED":
						//we can now reload the page triggering a new download from the gfonts API server
						location.reload(true);
						break;
					case "NOTHING_TO_DO":
						//That's just it, we won't do anything
						//console.log('It sure seems like there is nothing to do here');
						break;
				}
			},
			error : function(xhr, ajaxOptions, thrownError) {
				jQuery("#bibleget-settings-notification")
					.fadeIn("slow")
					.append('Could not force refresh the list of fonts from the Google Fonts API... ERROR: ' + xhr.responseText);
				jQuery(".bibleget-settings-notification-dismiss")
					.click(function() {
						jQuery("#bibleget-settings-notification").fadeOut("slow");
					});

			}
		});
		
	}
	else{
		//console.log('cannot force refresh gfonts list, nonce not found');
	}
	
};
