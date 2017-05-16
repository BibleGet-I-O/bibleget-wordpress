<?php 
	/* AJAX check  */
	if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		$contents = preg_replace('/<\\?.*(\\?>|$)/Us', '',$_POST["contents"]);

		$file = $_POST["file"];		
		if(basename($file)=="styles.css" && file_exists($file)){			
			if(file_put_contents ($file,$contents)){
				echo "UPDATE SUCCESSFUL";
			}
			else{
				echo "UPDATE DID NOT SUCCEED";
			}
		}
	}
	else{
		die("NOT ALLOWED");
	}
?>