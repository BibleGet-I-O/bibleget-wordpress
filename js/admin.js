//using localize script to pass in values from options array, access with "bibleGetOptionsFromServer" which has "options"

//console.log("admin.js is successfully loaded");
//console.log(bibleGetOptionsFromServer);

function enableNotificationDismissal() {
	jQuery(".bibleget-settings-notification-dismiss").click(function() {
		jQuery("#bibleget-settings-notification").fadeOut("slow");
	});
}

jQuery(document).ready(function ($) {
	fval = jQuery("#versionselect").val();
	if (fval !== null && fval.length > 0) {
		jQuery("#favorite_version").val(fval.join(","));
	}

	jQuery("#versionselect").change(function () {
		let fval = jQuery(this).val();
		// console.log(fval);
		if (fval === null || fval.length === 0) {
			fval = ["NABRE"];
		}
		jQuery.ajax({
			url: ajaxurl,
			data: {
				action: "updateBGET",
				options: { VERSION: { value: fval, type: "array" } },
			},
			method: "POST",
			beforeSend: function () {
				jQuery("#bibleget_ajax_spinner").show();
			},
			complete: function () {
				jQuery("#bibleget_ajax_spinner").hide();
			},
			success: function () {},
			error: function (jqXHR, textStatus, errorThrown) {
				alert(
					"BGET options not updated, error " + textStatus + ": " + errorThrown
				);
			},
		});
	});

	jQuery("#bibleget-server-data-renew-btn").click(function () {
		// check again how to do wordpress ajax,
		// really no need to do a makeshift ajax
		// post to this page
		postdata = {
			action: "refresh_bibleget_server_data",
			security: bibleGetOptionsFromServer.ajax_nonce,
			isajax: 1,
		};
		jQuery.ajax({
			type: "POST",
			url: bibleGetOptionsFromServer.ajax_url,
			data: postdata,
			beforeSend: function () {
				jQuery("#bibleget_ajax_spinner").show();
			},
			complete: function () {
				jQuery("#bibleget_ajax_spinner").hide();
			},
			success: function (returndata) {
				if (returndata == "datarefreshed") {
					jQuery("#bibleget-settings-notification")
						.append(
							'Data from server retrieved successfully, now refreshing page... <span id="bibleget-countdown">3 secs...</span>'
						)
						.fadeIn("slow", () => {
							let seconds = 3;
							let interval1 = setInterval(function () {
								jQuery("#bibleget-countdown").text(
									--seconds + (seconds == 1 ? " sec..." : " secs...")
								);
							}, 1000);
							setTimeout(() => {
								clearInterval(interval1);
								location.reload();
							}, 3000);
						});
				} else {
					jQuery("#bibleget-settings-notification")
						.append(
							"Communication with the server seems to have been successful, however it does not seem that we have received the refreshed data... Perhaps try again?"
						)
						.fadeIn("slow");
				}
				enableNotificationDismissal();
			},
			error: function (xhr) {
				jQuery("#bibleget-settings-notification")
					.fadeIn("slow")
					.append(
						"Communication with the BibleGet server was not successful... ERROR: " +
							xhr.responseText
					);
				enableNotificationDismissal();
			},
		});
	});

	jQuery("#bibleget-cache-flush-btn").on("click", function () {
		jQuery.ajax({
			type: "POST",
			url: bibleGetOptionsFromServer.ajax_url,
			data: { action: "flush_bible_quotes_cache" },
			beforeSend: function () {
				jQuery("#bibleget_ajax_spinner").show();
			},
			complete: function () {
				jQuery("#bibleget_ajax_spinner").hide();
			},
			success: function (returndata) {
				if (returndata == "cacheflushed") {
					jQuery("#bibleget-settings-notification")
						.append("Bible quotes cache emptied successfully")
						.fadeIn("slow");
				} else {
					jQuery("#bibleget-settings-notification")
						.append(
							"There was an error while attempting to flush the Bible quotes cache... Perhaps try again?"
						)
						.fadeIn("slow");
				}
				enableNotificationDismissal();
			},
			error: function (xhr) {
				jQuery("#bibleget-settings-notification")
					.fadeIn("slow")
					.append(
						"Emptying of Bible quotes cache was not successful... ERROR: " +
							xhr.responseText
					);
				enableNotificationDismissal();
			},
		});
	});

	if (
		typeof gfontsBatch !== "undefined" &&
		typeof gfontsBatch === "object" &&
		gfontsBatch.hasOwnProperty("job") &&
		gfontsBatch.job.hasOwnProperty("gfontsPreviewJob") &&
		gfontsBatch.job.gfontsPreviewJob === true &&
		gfontsBatch.job.hasOwnProperty("gfontsWeblist") &&
		typeof gfontsBatch.job.gfontsWeblist == "object" &&
		gfontsBatch.job.gfontsWeblist.hasOwnProperty("items")
	) {
		//console.log('We have a gfontsPreviewJob to do! gfontsBatch: ');
		//console.log(gfontsBatch);
		//check for errors in writing to the filesystem
		let wpFsErrors = JSON.parse(gfontsBatch.job.gfontsAPI_errors);
		if (Array.isArray(wpFsErrors) && wpFsErrors.length > 0) {
			//console.log(wpFsErrors);
			jQuery("#googlefontsapi_key")
				.closest("td")
				.append(
					$("<div>", {
						html:
							"!!! Impossible to write data to the BibleGet plugin directory, please check permissions!",
						style:
							"color: white; background-color: red; padding: 3px 9px; display: inline-block; font-weight: bold; font-family: sans-serif;",
					})
				);
		} else {
			var gfontsCount = gfontsBatch.job.gfontsWeblist.items.length;
			var batchLimit = 300; //general batch limit for each run, so that we don't block the server but yet we try to do a good number if we can
			var lastBatchLimit = 0; //if we have a remainder from the full batches, this will be the batchLimit for that remainder
			var numRuns = 0; //we'll set this in a minute
			var currentRun = 1; //of course we start from 1, the first run
			var max_execution_time = gfontsBatch.job.max_execution_time;

			//Let's calculate how many times we will have to make the ajax call
			//  in order to complete the local download of all the requested miniaturized font files
			//Perhaps lastBatchLimit variable is superfluous because PHP will check bounds,
			//  but hey let's be precise on each side, why not
			if (gfontsCount % batchLimit === 0) {
				numRuns = gfontsCount / batchLimit;
				//console.log('gfontsCount is divided evenly by the batchLimit, numRuns should be an integer such as 3. numRuns = '+numRuns);
			} else if (gfontsCount % batchLimit > 0) {
				numRuns = Math.floor(gfontsCount / batchLimit) + 1;
				lastBatchLimit = gfontsCount % batchLimit;
				//console.log('gfontsCount is not divided evenly by the batchLimit, we have a remainder. numRuns should be an integer larger by one compared to the value of that division, 4 in this case. numRuns = '+numRuns);
				//console.log('gfontsCount = '+gfontsCount);
				//console.log('batchLimit = '+batchLimit);
			}

			//$gfontsBatchRunProgressbarOverlay, $gfontsBatchRunProgressbarWrapper, and $gfontsBatchRunProgressbar are global variables so don't use "var" here
			$gfontsBatchRunProgressbarOverlay = jQuery("<div>", {
				id: "gfontsBatchRunProgressBarOverlay",
			});
			jQuery("body").append($gfontsBatchRunProgressbarOverlay);
			$gfontsBatchRunProgressbarWrapper = jQuery("<div>", {
				id: "gfontsBatchRunProgressBarWrapper",
			});
			jQuery("body").append($gfontsBatchRunProgressbarWrapper);
			$gfontsBatchRunProgressbar = jQuery(
				'<div id="gfontsBatchRunProgressbar"><div id="gfontsBatchRunProgressbarLabelWrapper"><div id="gfontsBatchRunProgressbarLabel">Installation process of Google Fonts preview 0%</div></div></div>'
			);
			jQuery($gfontsBatchRunProgressbarWrapper).append(
				$gfontsBatchRunProgressbar
			);
			jQuery($gfontsBatchRunProgressbarWrapper).append(`<div class="chart_before">PHP MAX EXECUTION TIME = <span id="php_max_execution_time">${max_execution_time}</span> seconds<br />Please be patient, the process can take up to 7 minutes...</div><div class="chart"></div><div class="chart_after">BATCH RUN <span id="batchRun">x</span> OUT OF ${numRuns}<br />CURRENT EXECUTION TIME = <span id="current_execution_time">0</span> seconds<br />TOTAL EXECUTION TIME = <span id="total_execution_time">0 seconds</span></div>`);
			performance.mark('processStart');
			//var inProgress = false;

			$gfontsBatchRunProgressbar.progressbar({
				value: 0,
				change: function () {
					jQuery("#gfontsBatchRunProgressbarLabel").text(
						"Installation process of Google Fonts preview " +
							jQuery(this).progressbar("value") +
							"%"
					);
				},
				complete: function () {
					jQuery("#gfontsBatchRunProgressbarLabel").text(
						"Installation process of Google Font preview COMPLETE"
					);
					setTimeout(function () {
						$gfontsBatchRunProgressbarWrapper
							.add($gfontsBatchRunProgressbarOverlay)
							.fadeOut(1000);
					}, 1000);
				}
			});

			postdata = {
				action: "store_gfonts_preview",
				security: gfontsBatch.job.gfontsNonce,
				gfontsCount: gfontsCount,
				batchLimit: batchLimit,
				lastBatchLimit: lastBatchLimit,
				numRuns: numRuns,
				currentRun: currentRun,
				startIdx: 0,
				max_execution_time: max_execution_time
			};
			//console.log(postdata);
			gfontsBatchRun(postdata);
		}
	} else {
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

	jQuery("#biblegetGFapiKeyRetest").on("click", function () {
		location.reload();
	});

	jQuery("#biblegetForceRefreshGFapiResults").on(
		"click",
		bibleGetForceRefreshGFapiResults
	);
});

var myProgressInterval = null;
var myMaxExecutionTimer = null;
var $gfontsBatchRunProgressbarOverlay;
var $gfontsBatchRunProgressbar;
var $gfontsBatchRunProgressbarWrapper;

var gfontsBatchRun = function (postdata) {
	jQuery.ajax({
		type: "POST",
		url: gfontsBatch.job.ajax_url,
		data: postdata,
		dataType: "json",
		beforeSend: function () {
			//jQuery("#bibleget_ajax_spinner").show();
			//$gfontsBatchRunProgressbar.progressbar("value");
			performance.mark('batchStart');
			myProgressInterval = setInterval(
				updateGfontsBatchRunProgressbarProgress,
				1500,
				postdata.currentRun,
				postdata.numRuns
			);
			myMaxExecutionTimer = setInterval(
				updateExecutionCountdown,
				500,
				postdata.max_execution_time
			);
			jQuery('#batchRun').text(postdata.currentRun);
		},
		complete: function () {
			jQuery("#bibleget_ajax_spinner").hide();
		},
		success: function (returndata) {
			clearInterval(myProgressInterval);
			clearInterval(myMaxExecutionTimer);
			var returndataJSON =
				typeof returndata !== "object" ? JSON.parse(returndata) : returndata;
			//console.log("gfontsBatchRun success, returndataJSON:");
			//console.log(returndataJSON);
			if (returndataJSON !== null && typeof returndataJSON === "object") {
				var thisRun = returndataJSON.hasOwnProperty("run")
					? returndataJSON.run
					: false;
				if (
					returndataJSON.hasOwnProperty("errorinfo") &&
					returndataJSON.errorinfo !== false &&
					returndataJSON.errorinfo.length > 0
				) {
					//console.log(
					//  "Some errors were returned from ajax process run " + thisRun
					//);
					//console.log(returndataJSON.errorinfo);
					if (
						(returndataJSON.hasOwnProperty("httpStatus2") &&
							returndataJSON.httpStatus2 == 504) ||
						(returndataJSON.hasOwnProperty("httpStatus3") &&
							returndataJSON.httpStatus3 == 504)
					) {
						//there was a timeout at some point during the communication with the Google Fonts server
						//we haven't finished yet, but let's try not to get stuck
						bibleGetForceRefreshGFapiResults();
					}
				}
				if (returndataJSON.hasOwnProperty("state")) {
					switch (returndataJSON.state) {
						case "RUN_PROCESSED":
							var maxUpdatePerRun = 100 / postdata.numRuns;
							var maxedOutUpdateThisRun = maxUpdatePerRun * thisRun;
							$gfontsBatchRunProgressbar.progressbar(
								"value",
								maxedOutUpdateThisRun
							);

							if (thisRun && thisRun < postdata.numRuns) {
								// console.log(
								//   "gfontsBatchRun was asked to do run " +
								//     postdata.currentRun +
								//     ", and has let us know that it has in fact completed run " +
								//     thisRun +
								//     ", now starting the next run"
								// );
								//check if we're doing the last run or not
								if (++postdata.currentRun == postdata.numRuns) {
									postdata.batchLimit == postdata.lastBatchLimit;
								}
								postdata.startIdx += postdata.batchLimit;

								//Let's go for another round!
								gfontsBatchRun(postdata);
							} else {
								// console.log(
								//   "We seem to have finished our job ahead of time? Please double check: numRuns= " +
								//     postdata.numRuns +
								//     ", thisRun = " +
								//     thisRun
								// );
							}
							break;
						case "COMPLETE":
							$gfontsBatchRunProgressbar.progressbar("value", 100);

							// if (thisRun == postdata.numRuns) {
							//   console.log("gfontsBatchRun has finished the job!");
							// } else {
							//   console.log(
							//     "gfontsBatchRun is telling us that we have finished our job, but this might not be the case: numRuns= " +
							//       postdata.numRuns +
							//       ", thisRun = " +
							//       thisRun
							//   );
							// }
							break;
					}
				// } else {
				//   console.log(
				//     "gfontsBatchRun: Now why do we not have any stateful info?"
				//   );
				}
			// } else {
			//   console.log(
			//     "gfontsBatchRun: Now why do we not have any kind of feedback from the server side script?"
			//   );
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			clearInterval(myProgressInterval);
			clearInterval(myMaxExecutionTimer);
			let errArr = [
				"Communication with the Google Fonts server was not successful... ERROR:",
				thrownError,
				xhr.responseText
			];
			jQuery("#bibleget-settings-notification")
				.fadeIn("slow")
				.append(errArr.join(' '));
			jQuery(".bibleget-settings-notification-dismiss").click(() => {
				jQuery("#bibleget-settings-notification").fadeOut("slow");
			});
		},
	});
};

var updateGfontsBatchRunProgressbarProgress = function (currentRun, numRuns) {
	//console.log('half second tick and $gfontsBatchRunProgressbar.progressbar("value") = '+$gfontsBatchRunProgressbar.progressbar("value"));
	//console.log('half second tick and currentRun = '+currentRun+', numRuns = '+numRuns);
	var maxUpdatePerRun = Math.floor(100 / parseInt(numRuns)); //if we do 4 runs, we will update no more than 25% of the progressbar for each run
	//console.log('half second tick and maxUpdatePerRun = '+maxUpdatePerRun+', (maxUpdatePerRun * currentRun) = '+(maxUpdatePerRun * currentRun));
	if (
		$gfontsBatchRunProgressbar.progressbar("value") <
		maxUpdatePerRun * parseInt(currentRun)
	) {
		var currentProgressBarValue = parseInt(
			$gfontsBatchRunProgressbar.progressbar("value")
		);
		$gfontsBatchRunProgressbar.progressbar("value", ++currentProgressBarValue);
	}
};

var updateExecutionCountdown = function(max_execution_time) {
	let measure = performance.measure('currentExecutionTime','batchStart');
	let measureTotal = performance.measure('totalExecutionTime','processStart');
	let executionSeconds = Math.floor(measure.duration / 1000);
	let totalExecutionSeconds = Math.floor(measureTotal.duration / 1000);
	let totalExecutionString = '';
	if(totalExecutionSeconds < 60) {
		if( totalExecutionSeconds === 0 || totalExecutionSeconds > 1 ) {
			totalExecutionString = `${totalExecutionSeconds} seconds`;
		} else {
			totalExecutionString = `${totalExecutionSeconds} second`;
		}
	} else {
		let minutes = Math.floor( totalExecutionSeconds / 60 );
		let seconds = totalExecutionSeconds % 60;
		if( minutes > 1 ) {
			totalExecutionString += `${minutes} minutes and `;
		} else {
			totalExecutionString += '1 minute and ';
		}
		if( seconds === 0 || seconds > 1 ) {
			totalExecutionString += `${seconds} seconds`;
		} else {
			totalExecutionString += `${seconds} second`;
		}
	}
	let executionLimitPercentage = Math.floor((executionSeconds / max_execution_time) * 100);
	jQuery('.chart').css({background: `conic-gradient(red ${executionLimitPercentage}%, white 0)`});
	jQuery('#current_execution_time').text(executionSeconds);
	jQuery('#total_execution_time').text(totalExecutionString)
}

var bibleGetForceRefreshGFapiResults = function () {
	//send ajax request to the server to have the transient deleted
	//console.log('we should have an nonce for this action: '+gfontsBatch.gfontsRefreshNonce);
	if (
		typeof gfontsBatch != "undefined" &&
		typeof gfontsBatch == "object" &&
		gfontsBatch.hasOwnProperty("job") &&
		typeof gfontsBatch.job == "object" &&
		gfontsBatch.job.hasOwnProperty("gfontsRefreshNonce") &&
		gfontsBatch.job.gfontsRefreshNonce != "" &&
		gfontsBatch.job.hasOwnProperty("gfontsApiKey") &&
		gfontsBatch.job.gfontsApiKey != ""
	) {
		var postProps = {
			action: "bibleget_refresh_gfonts",
			security: gfontsBatch.job.gfontsRefreshNonce,
			gfontsApiKey: gfontsBatch.job.gfontsApiKey,
		};
		jQuery.ajax({
			type: "POST",
			url: gfontsBatch.job.ajax_url,
			data: postProps,
			beforeSend: function () {
				jQuery("#bibleget_ajax_spinner").show();
			},
			complete: function () {
				jQuery("#bibleget_ajax_spinner").hide();
			},
			success: function (retval) {
				switch (retval) {
					case "TRANSIENT_DELETED":
						//we can now reload the page triggering a new download from the gfonts API server
						location.reload();
						break;
					case "NOTHING_TO_DO":
						//That's just it, we won't do anything
						//console.log('It sure seems like there is nothing to do here');
						break;
				}
			},
			error: function (xhr) {
				jQuery("#bibleget-settings-notification")
					.fadeIn("slow")
					.append(
						"Could not force refresh the list of fonts from the Google Fonts API... ERROR: " +
							xhr.responseText
					);
				jQuery(".bibleget-settings-notification-dismiss").click(function () {
					jQuery("#bibleget-settings-notification").fadeOut("slow");
				});
			},
		});
	}/* else {
		//console.log('cannot force refresh gfonts list, nonce not found');
	}*/
};
