<?php
    $lang = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);

    if (preg_match('/_/',$lang)) {
        $lang = explode("_", $lang);
        $lang = $lang[0];
    }

    switch($lang) {
        case "de":
            $path = "de";
            break;
        default:
            $path = "en";
            break;
    }

    header("Location: /" . $path);