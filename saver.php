<?php
	error_reporting(0); // Turn off all reporting (Error / Notice /...)
	if ($_POST["filename"] !== "" && strlen($_POST["filename"]) >= 1 && $_POST["id"] !== "" && strlen($_POST["id"]) >= 1 && $_POST["flags"] !== "" && strlen($_POST["flags"]) >= 1) {
		$save = fopen($_POST["filename"].".txt", $_POST["flags"]);
		fwrite($save, $_POST["id"]."\n");
		fclose($save);
	}
?>