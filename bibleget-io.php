<?php
/*
 * Plugin Name: BibleGet I/O
 * Version: 7.7
 * Plugin URI: https://www.bibleget.io/
 * Description: Easily insert Bible quotes from a choice of Bible versions into your articles or pages with the "Bible quote" block or with the shortcode [bibleget].
 * Author: John Romano D'Orazio
 * Author URI: https://www.johnromanodorazio.com/
 * Text Domain: bibleget-io
 * Domain Path: /languages/
 * License: GPL v3
 *
 * WordPress BibleGet I/O Plugin
 * Copyright(C) 2014-2020, John Romano D'Orazio - priest@johnromanodorazio.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


define("BIBLEGETPLUGINVERSION", "v7_7");

if (!defined('ABSPATH')) {
    die("You cannot access this file directly.");
}

define("TRANSIENT_PREFIX", "bibleget_");

define("BIBLE_API",     "https://query.bibleget.io/v3/index.php");
define("SEARCH_API",    "https://query.bibleget.io/v3/search.php");
define("METADATA_API",  "https://query.bibleget.io/v3/metadata.php");

//error_reporting(E_ALL);
//ini_set('display_errors', 'on');
include_once(plugin_dir_path(__FILE__) . "includes/LangCodes.php" );
include_once(plugin_dir_path(__FILE__) . "includes/BibleGetSettingsPage.php");
include_once(plugin_dir_path(__FILE__) . "includes/BGETPROPERTIES.php");
include_once(plugin_dir_path(__FILE__) . "includes/BibleGet_Customize.php");
include_once(plugin_dir_path(__FILE__) . "includes/QueryValidator.php");


/**
 * BibleGet_on_activation
 * Function that is triggered upon activation of the plugin
 * Will set default options and will try to do a bit of cleanup from older versions
 */
function BibleGet_on_activation() {
    if (!current_user_can('activate_plugins')) {
        return;
    }
    $plugin = isset($_REQUEST['plugin']) ? $_REQUEST['plugin'] : '';
    check_admin_referer("activate-plugin_{$plugin}");

    // Uncomment the following line to see the function in action
    // exit( var_dump( $_GET ) );
    bibleGetSetOptions();

    register_uninstall_hook(__FILE__, 'BibleGet_on_uninstall');
}

/**
 * BibleGet_on_deactivation
 * Function that is triggered on plugin deactivation
 * Does not delete options, in case the user decides to activate again
 */
function BibleGet_on_deactivation() {
    if (!current_user_can('activate_plugins'))
        return;
    $plugin = isset($_REQUEST['plugin']) ? $_REQUEST['plugin'] : '';
    check_admin_referer("deactivate-plugin_{$plugin}");

    // Uncomment the following line to see the function in action
    // exit( var_dump( $_GET ) );
    // bibleGetDeleteOptions();
}

/**
 * BibleGet_on_uninstall
 * Function that is triggered when the plugin is uninstalled
 * Will remove any options that have been set
 */
function BibleGet_on_uninstall() {
    if (!current_user_can('activate_plugins')) {
        return;
    }

    if (!wp_doing_ajax()) {
        check_admin_referer('bulk-plugins');
    }

    // Important: Check if the file is the one
    // that was registered during the uninstall hook.
    if (!wp_doing_ajax() && __FILE__ != WP_UNINSTALL_PLUGIN) {
        return;
    }

    // Uncomment the following line to see the function in action
    // exit( var_dump( $_GET ) );

    //Check if we have a Google Fonts API key transient, if so remove it
    $BibleGetOptions = get_option('bibleget_settings');
    if (isset($BibleGetOptions['googlefontsapi_key']) && $BibleGetOptions['googlefontsapi_key'] != "") {
        if (get_transient(md5($BibleGetOptions['googlefontsapi_key']))) {
            delete_transient(md5($BibleGetOptions['googlefontsapi_key']));
        }
    }

    bibleGetDeleteOptions();

    delete_option("bibleget_settings");
    delete_option("BGET");

    //remove all leftover transients that cache the Bible quotes
    //not really all that necessary because they will clear within 7 days,
    //but just for sake of completeness and neatness
    global $wpdb;
    //The following SELECT should select both the transient and the transient_timeout
    //This will also remove the Google Fonts API key transient if it uses the same prefix...
    //I guess we'll just have to not use our defined prefix on the Google Fonts API key transient
    //in order avoid this
    $sql = "DELETE
            FROM  $wpdb->options
            WHERE `option_name` LIKE '%transient_%" . TRANSIENT_PREFIX . "%'
            ";
    //We shouldn't have to do a $wpdb->prepare here because there is no kind of user input anywhere
    $wpdb->query($sql);
    /*
    if ($wpdb->query($sql) !== false) {
        //echo 'cacheflushed';
    } else {
        //echo 'cacheNotFlushed';
    }
    */
}


register_activation_hook(__FILE__, 'BibleGet_on_activation');
register_deactivation_hook(__FILE__, 'BibleGet_on_deactivation');

/**
 * Load plugin textdomain.
 *
 */
function bibleget_load_textdomain() {
    $domain = 'bibleget-io';
    // The "plugin_locale" filter is also used in load_plugin_textdomain()
    $locale = apply_filters('plugin_locale', get_locale(), $domain);
    // Allow users to add their own custom translations by dropping them in the Wordpress 'languages' directory
    load_textdomain($domain, WP_LANG_DIR . '/plugins/' . $domain . '-' . $locale . '.mo');

    load_plugin_textdomain($domain, false, dirname(plugin_basename(__FILE__)) . '/languages');
}
// should the action be 'init' instead of 'plugins_loaded'? see http://geertdedeckere.be/article/loading-wordpress-language-files-the-right-way
add_action('plugins_loaded', 'bibleget_load_textdomain');

/**
 * Let WordPress know that we have text domain translations
 * inside of our gutenberg block javascript file
 */
function bibleget_set_script_translations() {
    wp_set_script_translations('bibleget-gutenberg-block', 'bibleget-io');
}
add_action('init', 'bibleget_set_script_translations');


function processShortcodeAttributes(&$atts) {
    // retrieve all layout options based on BGETPROPERTIES, and use defaults from there,
    // so that shortcode Bible quotes will be consistent with Gutenberg block Bible quotes
    $BGET = [];
    $BGETOPTIONS = new BGETPROPERTIES();
    foreach ($BGETOPTIONS->OPTIONS as $option => $array) {
        $optionUCase = $option;
        $option = strtolower($option); //shortcode attributes are all lowercased by default, so we need to lowercase for consistency
        $BGET[$option] = $array['default']; //default will be based on current saved option if exists

        //while we are building our default values, we will also enforce type on $atts so we know we are speaking the same language
        if (isset($atts[$option])) {
            $r = new ReflectionClass('BGET');
            if( str_ends_with($optionUCase, "ALIGNMENT") ) {
                $optionUCase = "ALIGN";
            } else if( str_ends_with($optionUCase, "WRAP") ) {
                $optionUCase = "WRAP";
            } else if( str_ends_with($optionUCase, "POSITION") ) {
                $optionUCase = "POS";
            } else if( str_ends_with($optionUCase, "FORMAT") ) {
                $optionUCase = "FORMAT";
            }
            if( $r->getConstant($optionUCase) && is_array($r->getConstant($optionUCase)) && in_array( $atts[$option], array_keys( $r->getConstant($optionUCase) ) ) ) {
                //if user is using a string value instead of our enum values, let's try to get an enum value from the string value
                $atts[$option] = $r->getConstant($optionUCase)[$atts[$option]];
            }
            switch ($array["type"]) {
                case 'number':
                    $atts[$option] = BibleGet_Customize::sanitize_float($atts[$option]);
                    break;
                case 'integer':
                    $atts[$option] = absint($atts[$option]);
                    break;
                case 'boolean':
                    $atts[$option] = BibleGet_Customize::sanitize_boolean($atts[$option]);
                    break;
                case 'string':
                    $atts[$option] = esc_html($atts[$option]);
                    break;
                case 'array':
                    $atts[$option] = BibleGet_Customize::sanitize_array($atts[$option]);
                    break;
            }
        }
    }
    return $BGET;
}

function ensureIndexesSet( $versions ) {
    foreach( $versions as $version ) {
        if (get_option("bibleget_" . $version . "IDX") === false) {
            bibleGetSetOptions();
        }
    }
}

function ensureBibleBooksSet() {
    for ($i = 0; $i < 73; $i++) {
        if (get_option("bibleget_biblebooks" . $i) === false) {
            bibleGetSetOptions();
        }
    }
}

/**
 * BibleGet Shortcode
 * @param array $atts
 * @param string $content
 * Creates the shortcode useful for injecting Bible Verses into a page
 * Example usage:
 * [bibleget query="Matthew1:1-5" version="CEI2008"]
 * [bibleget query="Matthew1:1-5" versions="CEI2008,NVBSE"]
 * [bibleget]Matthew1:1-5[/bibleget]
 */
function bibleget_shortcode($atts = [], $content = null, $tag = '') {
    //add possibility of using "versions" parameter instead of "version"
    if (isset($atts["versions"])) {
        $atts["version"] = explode(",", $atts["versions"]);
    } else if (isset($atts["version"])) {
        $atts["version"] = explode(",", $atts["version"]);
    }

    $vversions = get_option("bibleget_versions", array());
    if (count($vversions) < 1) {
        bibleGetSetOptions();
        $vversions = get_option("bibleget_versions", array());
    }
    $validversions = array_keys($vversions);

    $BGET = processShortcodeAttributes( $atts );
    $a = shortcode_atts($BGET, $atts, $tag);
    //now to maintain consistency with our Gutenberg block code etc., let's retransform the keys to uppercase
    //and use $atts instead of $a
    $atts = [];
    foreach ($a as $key => $value) {
        $atts[strtoupper($key)] = $value;
    }

    if ($atts['FORCEVERSION'] !== true) {
        foreach ($atts['VERSION'] as $version) {
            if (!in_array($version, $validversions)) {
                $optionsurl = admin_url("options-general.php?page=bibleget-settings-admin");
                /* translators: you must not change the placeholders \"%s\" or the html <a href=\"%s\">, </a> */
                $output = '<span style="color:Red;font-weight:bold;">' . sprintf(__('The requested version "%s" is not valid, please check the list of valid versions in the <a href="%s">settings page</a>', "bibleget-io"), $version, $optionsurl) . '</span>';
                return '<div class="bibleget-quote-div">' . $output . '</div>';
            }
        }
    }

    if ($content !== null && $content != "") {
        $queries = bibleGetQueryClean($content);
    } else {
        $queries = bibleGetQueryClean($atts['QUERY']);
    }
    return processQueries( $queries, $atts, true, $content );
}
add_shortcode('bibleget', 'bibleget_shortcode');


function processQueries( $queries, $atts, $isShortcode = false, $content = null ) {
    if (is_array($queries)) {
        ensureIndexesSet( $atts['VERSION'] );
        ensureBibleBooksSet();
        $currentPageUrl = bibleGetCurrentPageUrl();
    
        $queryValidator = new QueryValidator( $queries, $atts['VERSION'], $currentPageUrl );
        if(false === $queryValidator->ValidateQueries()) {
            $output = __("Bible Quote failure... (error processing query, please check syntax)", "bibleget-io");
            return '<div class="bibleget-quote-div"><span style="color:Red;font-weight:bold;">' . $output . '</span></div>';
        }

        $notices = get_option('bibleget_error_admin_notices', array());
        $notices = array_merge( $notices, $queryValidator->errs );
        update_option('bibleget_error_admin_notices', $notices);

        $finalquery = processFinalQuery( $queryValidator->validatedQueries, $atts );
        // bibleGetWriteLog("value of finalquery = ".$finalquery);

        $output = processOutput( $finalquery );

        if( $isShortcode ) {
            wp_enqueue_script('bibleget-script', plugins_url('js/shortcode.js', __FILE__), array('jquery'), '1.0', true);
            wp_enqueue_script('htmlentities-script', plugins_url('js/he.min.js', __FILE__), array('jquery'), '1.0', true);
            //it shouldn't be necessary to call update_option here,
            //because even though it's theoretically possible now to set all options inside the shortcode
            //it would be so impractical that I cannot see anyone actual doing it
            //and it would probably be confusing to be saving the main query parameters such as "version"
            //which is being used here as an override compared to any saved options;
            //same really goes for any parameter used here, it would be used as an ovverride if anything
            //update_option("BGET",$a);
        } else {
            //we should avoid saving some attributes to options, when they are obviously per block settings and not universal settings
            $a = get_option('BGET');
            $optionsNoUpdateFromBlock = ['POPUP', 'PREFERORIGIN', 'QUERY', 'VERSION'];
            foreach ($atts as $key => $value) {
                if (!in_array($key, $optionsNoUpdateFromBlock)) {
                    $a[$key] = $value;
                }
            }
            update_option("BGET", $a);
        }

        $domDocumentProcessed = processDomDocument( $atts, $output, $content );
        return $domDocumentProcessed;
    } else {
        /* translators: do not translate "shortcode" unless the version of WordPress in your language uses a translated term to refer to shortcodes */
        $output = '<span style="color:Red;font-weight:bold;">' . __("There are errors in the shortcode, please check carefully your query syntax:", "bibleget-io") . ' &lt;' . $a['query'] . '&gt;<br />' . $queries . '</span>';
        return '<div class="bibleget-quote-div">' . $output . '</div>';
    }

}

function processDomDocument( $atts, $output, $content = null ) {
    $nonDefaultLayout = false; //set this flag to true as soon as we see that we have a layout pref that isn't default value, so we will know to update the $output accordingly
    $domDocument = new DOMDocument();
    $domDocument->loadHTML('<!DOCTYPE HTML><head></head><body>' . mb_convert_encoding($output, 'HTML-ENTITIES', 'UTF-8') . '</body>');
    if ($domDocument) {
        $xPath = new DOMXPath($domDocument);
        $results    = $xPath->query('//div[contains(@class,"results")]')->item(0);
        $errors     = $xPath->query('//div[contains(@class,"errors")]')->item(0);
        $info       = $xPath->query('//input[contains(@class,"BibleGetInfo")]')->item(0);

        if ($atts['LAYOUTPREFS_SHOWBIBLEVERSION'] === false && $results !== false) {
            $nonDefaultLayout = true;
            $bibleVersionEls = $xPath->query('//p[contains(@class,"bibleVersion")]');
            foreach ($bibleVersionEls as $bibleVersionEl) {
                $bibleVersionEl->setAttribute("style", "display:none;");
            }
        }

        if ($atts['LAYOUTPREFS_BIBLEVERSIONALIGNMENT'] !== BGET::ALIGN["LEFT"] && $results !== false) {
            $nonDefaultLayout = true;
            $bibleVersionEls = $xPath->query('//p[contains(@class,"bibleVersion")]');
            foreach ($bibleVersionEls as $bibleVersionEl) {
                $elClass = $bibleVersionEl->getAttribute("class");
                $bibleVersionEl->setAttribute("class", $elClass . " bbGetAlign" . $atts['LAYOUTPREFS_BIBLEVERSIONALIGNMENT']);
            }
        }

        if ($atts['LAYOUTPREFS_BIBLEVERSIONPOSITION'] !== BGET::POS["TOP"] && $results !== false) {
            $nonDefaultLayout = true;
            $bibleVersionEls = $xPath->query('//p[contains(@class,"bibleVersion")]');
            $bibleVersionCnt = $bibleVersionEls->count();
            $bibleVersionStack = [];
            switch ($bibleVersionCnt) {
                case 0:
                    //don't do anything
                    break;
                case 1:
                    $bibleVersionEl = $bibleVersionEls->item(0);
                    $results->appendChild($bibleVersionEl);
                    break;
                default:
                    foreach ($bibleVersionEls as $bibleVersionEl) {
                        array_push($bibleVersionStack, $bibleVersionEl);
                        if (count($bibleVersionStack) > 1) {
                            $replacementNode = array_shift($bibleVersionStack);
                            $results->replaceChild($replacementNode, $bibleVersionStack[0]);
                        }
                    }
                    $results->appendChild(array_shift($bibleVersionStack));
            }
        }

        if ($atts['LAYOUTPREFS_BIBLEVERSIONWRAP'] !==  BGET::WRAP["NONE"] && $results !== false) {
            $nonDefaultLayout = true;
            $bibleVersionEls = $xPath->query('//p[contains(@class,"bibleVersion")]');
            foreach ($bibleVersionEls as $bibleVersionEl) {
                $text = $bibleVersionEl->textContent;
                switch ($atts['LAYOUTPREFS_BIBLEVERSIONWRAP']) {
                    case  BGET::WRAP["PARENTHESES"]:
                        $text = "(" . $text . ")";
                        break;
                    case  BGET::WRAP["BRACKETS"]:
                        $text = "[" . $text . "]";
                        break;
                }
                $bibleVersionEl->textContent = $text;
            }
        }

        if ($atts['LAYOUTPREFS_BOOKCHAPTERALIGNMENT'] !== BGET::ALIGN["LEFT"] && $results !== false) {
            $nonDefaultLayout = true;
            $bookChapterEls = $xPath->query('//p[contains(@class,"bookChapter")]');
            foreach ($bookChapterEls as $bookChapterEl) {
                $elClass = $bookChapterEl->getAttribute("class");
                $bookChapterEl->setAttribute("class", $elClass . " bbGetAlign" . $atts['LAYOUTPREFS_BOOKCHAPTERALIGNMENT']);
            }
        }


        if (($atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] !== BGET::FORMAT["BIBLELANG"]) && $results !== false) {
            $nonDefaultLayout = true;
            $bookChapterEls = $xPath->query('//p[contains(@class,"bookChapter")]');
            if ($atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT["USERLANG"] || $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT["USERLANGABBREV"]) {
                $locale = substr(get_locale(), 0, 2);
                $languageName = Locale::getDisplayLanguage($locale, 'en');
                foreach ($bookChapterEls as $bookChapterEl) {
                    $bookNum = (int) $xPath->query('following-sibling::input[@class="univBookNum"]', $bookChapterEl)->item(0)->getAttribute("value");
                    $usrprop = "bibleget_biblebooks" . ($bookNum - 1);
                    $jsbook = json_decode(get_option($usrprop), true);
                    //get the index of the current language from the available languages
                    $biblebookslangs = get_option("bibleget_languages");
                    $currentLangIdx = array_search($languageName, $biblebookslangs);
                    if ($currentLangIdx === false) {
                        $currentLangIdx = array_search("English", $biblebookslangs);
                    }
                    $lclbook = trim(explode('|', $jsbook[$currentLangIdx][0])[0]);
                    $lclabbrev = trim(explode('|', $jsbook[$currentLangIdx][1])[0]);
                    $bookChapterText = $bookChapterEl->textContent;
                    //Remove book name from the string (check includes any possible spaces in the book name)
                    if (preg_match('/^([1-3I]{0,3}[\s]{0,1}((\p{L}\p{M}*)+))/u', $bookChapterText, $res)) {
                        $bookChapterText = str_replace($res[0], "", $bookChapterText);
                    }

                    if ($atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT["USERLANGABBREV"]) {
                        //use abbreviated form in wp lang
                        $bookChapterEl->textContent = $lclabbrev  . $bookChapterText;
                    } else {
                        //use full form in wp lang
                        $bookChapterEl->textContent = $lclbook . $bookChapterText;
                    }
                }
            } else if ($atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT["BIBLELANGABBREV"]) {
                //use abbreviated form in bible version lang
                foreach ($bookChapterEls as $bookChapterEl) {
                    $bookAbbrev = $xPath->query('following-sibling::input[@class="bookAbbrev"]', $bookChapterEl)->item(0)->getAttribute("value");
                    $bookChapterText = $bookChapterEl->textContent;
                    if (preg_match('/^([1-3I]{0,3}[\s]{0,1}((\p{L}\p{M}*)+))/u', $bookChapterText, $res)) {
                        $bookChapterText = str_replace($res[0], "", $bookChapterText);
                    }
                    $bookChapterEl->textContent = $bookAbbrev . $bookChapterText;
                }
            }
        }

        /* Make sure to deal with fullreference before you deal with pos or wrap
         => if pos is bottominline it will change the p to a span and then we won't know what to look for
         => if we have already wrapped then the fullreference will be appended to the parentheses or the brackets!
         */
        if ($atts['LAYOUTPREFS_BOOKCHAPTERFULLQUERY'] === true && $results !== false) {
            $nonDefaultLayout = true;
            $bookChapterEls = $xPath->query('//p[contains(@class,"bookChapter")]');
            foreach ($bookChapterEls as $bookChapterEl) {
                $text = $bookChapterEl->textContent;
                $originalQuery = $xPath->query('following-sibling::input[@class="originalQuery"]', $bookChapterEl)->item(0)->getAttribute("value");
                //remove book from the original query
                if (preg_match("/^([1-3]{0,1}((\p{L}\p{M}*)+)[1-9][0-9]{0,2})/u", $originalQuery, $res)) {
                    $originalQuery = str_replace($res[0], "", $originalQuery);
                }
                /*if (preg_match("/^/u", $originalQuery, $res)) {
                 $originalQuery = str_replace($res[0], "", $originalQuery);
                 }*/
                $bookChapterEl->textContent = $text . $originalQuery;
            }
        }

        /* Make sure to deal with wrap before you deal with pos, because if pos is bottominline it will change the p to a span and then we won't know what to look for */
        if ($atts['LAYOUTPREFS_BOOKCHAPTERWRAP'] !== BGET::WRAP["NONE"] && $results !== false) {
            $nonDefaultLayout = true;
            $bookChapterEls = $xPath->query('//p[contains(@class,"bookChapter")]');
            foreach ($bookChapterEls as $bookChapterEl) {
                $text = $bookChapterEl->textContent;
                switch ($atts['LAYOUTPREFS_BOOKCHAPTERWRAP']) {
                    case BGET::WRAP["PARENTHESES"]:
                        $text = "(" . $text . ")";
                        break;
                    case BGET::WRAP["BRACKETS"]:
                        $text = "[" . $text . "]";
                        break;
                }
                $bookChapterEl->textContent = $text;
            }
        }

        if ($atts['LAYOUTPREFS_BOOKCHAPTERPOSITION'] !== BGET::POS["TOP"] && $results !== false) {
            $nonDefaultLayout = true;
            $bookChapterEls = $xPath->query('//p[contains(@class,"bookChapter")]');
            switch ($atts['LAYOUTPREFS_BOOKCHAPTERPOSITION']) {
                case BGET::POS["BOTTOM"]:
                    foreach ($bookChapterEls as $bookChapterEl) {
                        $results->insertBefore($bookChapterEl->nextSibling, $bookChapterEl);
                    }
                    break;
                case BGET::POS["BOTTOMINLINE"]:
                    foreach ($bookChapterEls as $bookChapterEl) {
                        $class = $bookChapterEl->getAttribute("class");
                        $text = $bookChapterEl->textContent;
                        $span = $domDocument->createElement("span", $text);
                        $span->setAttribute("class", $class);
                        $bookChapterEl->nextSibling->appendChild($span);
                        $results->removeChild($bookChapterEl);
                    }
                    break;
            }
        }

        if ($atts['LAYOUTPREFS_SHOWVERSENUMBERS'] === BGET::VISIBILITY["HIDE"] && $results !== false) {
            $nonDefaultLayout = true;
            $verseNumberEls = $xPath->query('//span[contains(@class,"verseNum")]');
            foreach ($verseNumberEls as $verseNumberEl) {
                $verseNumberEl->setAttribute("style", "display:none;");
            }
        }

        //If any of the Layout options were not the default options, then we need to update our $output with the new html layout
        if ($nonDefaultLayout === true) {
            $output = $domDocument->saveHTML($results);
            if ($errors !== null) {
                $output .= $domDocument->saveHTML($errors);
            }
            if ($info !== null) {
                $output .= $domDocument->saveHTML($info);
            }
        }
    }

    if ($atts['POPUP'] === true) {
        wp_enqueue_script('jquery-ui-dialog');
        wp_enqueue_style('wp-jquery-ui-dialog');
        wp_enqueue_style('bibleget-popup', plugins_url('css/popup.css', __FILE__));
        if ($content !== null && $content !== "") {
            return '<a href="#" class="bibleget-popup-trigger" data-popupcontent="' . htmlspecialchars($output) . '">' . $content . '</a>';
        } else {
            return '<a href="#" class="bibleget-popup-trigger" data-popupcontent="' . htmlspecialchars($output) . '">' . $atts['QUERY'] . '</a>';
        }
    } else {
        return '<div class="bibleget-quote-div">' . $output . '</div>';
    }
}

/**
 * BibleGet Gutenberg Block!
 * Transforming the shortcode into a block
 *
 */
function bibleget_gutenberg() {
    // Skip block registration if Gutenberg is not enabled/merged.
    if (!function_exists('register_block_type')) {
        return;
    }
    $dir = dirname(__FILE__);

    $gutenberg_js = 'js/gutenberg.js';
    wp_register_script(
        'bibleget-gutenberg-block',
        plugins_url($gutenberg_js, __FILE__),
        array(
            'wp-blocks',
            'wp-element',
            'wp-i18n',
            'wp-editor',
            'wp-components',
            'jquery-ui-dialog'
        ),
        filemtime("$dir/$gutenberg_js")
    );

    $gutenberg_css = 'css/gutenberg.css';
    wp_register_style(
        'bibleget-gutenberg-editor',
        plugins_url($gutenberg_css, __FILE__),
        array('wp-jquery-ui-dialog'),
        filemtime("$dir/$gutenberg_css")
    );

    //we aren't actually going to create the settings page here,
    //we're just using some of the same information that is used to create the settings page
    $optionsInfo = new BibleGetSettingsPage();
    $versionsByLang = $optionsInfo->getVersionsByLang();
    $bibleGetBooksInLang = $optionsInfo->getBibleBookNamesInLang();
    //These are our default settings, we will use them for the Gutenberg block
    //they could perhaps take the place of the properties defined for the Customizer
    $BGETPROPERTIES = new BGETPROPERTIES();
    //and these are our constants, as close as I can get to ENUMS
    //hey with this operation they transform quite nicely for the client side javascript!
    $BGETreflection = new ReflectionClass('BGET');
    $BGETinstanceprops = $BGETreflection->getConstants();
    $BGETConstants = array();
    foreach ($BGETinstanceprops as $key => $value) {
        $BGETConstants[$key] = $value;
    }

    $haveGFonts = $optionsInfo->gfontsAPIkeyCheck();
    $GFonts = null;
    $gfontsDir = str_replace('\\','/', plugin_dir_path( __FILE__ ) ) . "gfonts_preview/";
    $gfontsFilePath = $gfontsDir . "gfontsWeblist.json";
    if($haveGFonts === "SUCCESS" && file_exists($gfontsFilePath) ){
        $GFonts = json_decode(file_get_contents($gfontsFilePath) );
    }

    $myvars = [
        'ajax_url' => admin_url('admin-ajax.php'),
        'bibleget_admin_url'    => admin_url("options-general.php?page=bibleget-settings-admin"),
        'langCodes'             => LANGCODES,
        'currentLangISO'        => get_bloginfo ( 'language' ),
        'versionsByLang'        => $versionsByLang,
        'biblebooks'            => $bibleGetBooksInLang,
        'BGETProperties'        => $BGETPROPERTIES->OPTIONS,
        'BGETConstants'         => $BGETConstants,
        'haveGFonts'            => $haveGFonts,
        'GFonts'                => $GFonts
    ];
    wp_localize_script('bibleget-gutenberg-block', 'BibleGetGlobal', $myvars);

    register_block_type('bibleget/bible-quote', array(
        'editor_script'         => 'bibleget-gutenberg-block',
        'editor_style'          => 'bibleget-gutenberg-editor',
        'render_callback'       => 'bibleGet_renderGutenbergBlock',
        'attributes'            => $BGETPROPERTIES->OPTIONS
    ));
}
add_action('init', 'bibleget_gutenberg');


function bibleGetGutenbergScripts($hook) {
    if ($hook != "post.php" && $hook != "post-new.php") {
        return;
    }
    wp_enqueue_script('jquery-ui-dialog');
    wp_enqueue_style('wp-jquery-ui-dialog');
    wp_enqueue_style('bibleget-popup', plugins_url('css/popup.css', __FILE__));
    wp_enqueue_script('htmlentities-script', plugins_url('js/he.min.js', __FILE__), array('jquery'), '1.0', true);
    if (!wp_style_is('fontawesome', 'enqueued')) {
        if ( false === isFontAwesomeEnqueued() ) {
            wp_enqueue_style('fontawesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', false, '4.7.0');
        }
    }
    if( file_exists( plugin_dir_path( __FILE__ ) . 'css/gfonts_preview/gfonts_preview.css' ) ){
        wp_enqueue_style( 'bibleget-fontselect-preview',
            plugins_url ('css/gfonts_preview/gfonts_preview.css', __FILE__ )
        );
    }
}

add_action('admin_enqueue_scripts', 'bibleGetGutenbergScripts');


function isFontAwesomeEnqueued() {
    global $wp_styles;
    foreach ($wp_styles->queue as $style) {
        if (strpos($wp_styles->registered[$style]->src, 'fontawesome')) {
            return true;
        } else if (strpos($wp_styles->registered[$style]->src, 'font-awesome')) {
            return true;
        } else if (strpos($wp_styles->registered[$style]->handle, 'fontawesome')) {
            return true;
        } else if (strpos($wp_styles->registered[$style]->handle, 'font-awesome')) {
            return true;
        }
    }
    return false;
}

function processOutput( $finalquery ) {
    $output = get_transient(TRANSIENT_PREFIX . md5($finalquery));
    if (false === $output) {
        $output = bibleGetQueryServer($finalquery);
        if ($output) {
            $output = str_replace(PHP_EOL, '', $output);
            set_transient(TRANSIENT_PREFIX . md5($finalquery), $output, 7 * 24 * HOUR_IN_SECONDS);
        } else {
            $output = '<span style="color:Red;font-weight:bold;">' . __("Bible Quote failure... Temporary error from the BibleGet server. Please try again in a few minutes", "bibleget-io") . '</span>';
        }
    }
    return $output;
}

function processFinalQuery( $goodqueries, $atts ) {
    $finalquery = "query=";
    $finalquery .= implode(";", $goodqueries);
    $finalquery .= "&version=";
    $finalquery .= implode(",", $atts['VERSION']);
    if ($atts['PREFERORIGIN'] === BGET::PREFERORIGIN["GREEK"]){
        $finalquery .= "&preferorigin=GREEK";
    } else if ($atts['PREFERORIGIN'] === BGET::PREFERORIGIN["HEBREW"]) {
        $finalquery .= "&preferorigin=HEBREW";
    }
    if ($atts['FORCEVERSION'] === true) {
        $finalquery .= "&forceversion=true";
    }
    if ($atts['FORCECOPYRIGHT'] === true) {
        $finalquery .= "&forcecopyright=true";
    }
    return $finalquery;
}

/**
 * Gutenberg Render callback
 */
function bibleGet_renderGutenbergBlock($atts) {
    $output = ''; //this will be whatever html we are returning to be rendered
    // Determine bible version(s)
    $atts["VERSION"] = (!empty($atts["VERSION"]) ? $atts["VERSION"] : ["NABRE"]);

    if (count($atts["VERSION"]) < 1) {
        /* translators: do NOT translate the parameter names "version" or "versions" !!! */
        $output = '<span style="color:Red;font-weight:bold;">' . __('You must indicate the desired version with the parameter "version" (or the desired versions as a comma separated list with the parameter "versions")', "bibleget-io") . '</span>';
        return '<div class="bibleget-quote-div">' . $output . '</div>';
    }

    $vversions = get_option("bibleget_versions", array());
    if (count($vversions) < 1) {
        bibleGetSetOptions();
        $vversions = get_option("bibleget_versions", array());
    }
    $validversions = array_keys($vversions);
    // echo "<div style=\"border:10px solid Blue;\">".print_r($validversions)."</div>";
    if ($atts['FORCEVERSION'] !== true) {
        foreach ($atts["VERSION"] as $version) {
            if (!in_array($version, $validversions)) {
                $optionsurl = admin_url("options-general.php?page=bibleget-settings-admin");
                /* translators: you must not change the placeholders \"%s\" or the html <a href=\"%s\">, </a> */
                $output = '<span style="color:Red;font-weight:bold;">' . sprintf(__('The requested version "%s" is not valid, please check the list of valid versions in the <a href="%s">settings page</a>', "bibleget-io"), $version, $optionsurl) . '</span>';
                return '<div class="bibleget-quote-div">' . $output . '</div>';
            }
        }
    }

    $queries = bibleGetQueryClean($atts['QUERY']);
    return processQueries( $queries, $atts );
}

/**
 * BibleGet Query Server Function
 * @param unknown $finalquery
 * After a query has been checked for integrity, this will send the query request to the BibleGet Server
 * Returns the response from the BibleGet Server
 */
function bibleGetQueryServer($finalquery) {
    $currentPageUrl = bibleGetCurrentPageUrl();
    $errs = array();
    //We will make a secure connection to the BibleGet service endpoint,
    //if this server's OpenSSL and CURL versions support TLSv1.2
    $curl_version = curl_version();
    $ssl_version = str_replace('OpenSSL/', '', $curl_version['ssl_version']);
    if (version_compare($curl_version['version'], '7.34.0', '>=') && version_compare($ssl_version, '1.0.1', '>=')) {
        //we should be good to go for secure SSL communication supporting TLSv1_2
        $ch = curl_init(BIBLE_API . "?" . $finalquery . "&return=html&appid=wordpress&domain=" . urlencode(site_url()) . "&pluginversion=" . BIBLEGETPLUGINVERSION);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, TRUE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
    } else {
        $ch = curl_init("http://query.bibleget.io/v3/index.php?" . $finalquery . "&return=html&appid=wordpress&domain=" . urlencode(site_url()) . "&pluginversion=" . BIBLEGETPLUGINVERSION);
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

    if (ini_get('open_basedir') === false) {
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    }
    $output = curl_exec($ch);
    if ($output && !curl_errno($ch)) {
        // remove style and title tags from the output if they are present(should not be present with more recent BibleGet engine
        $output = substr($output, 0, strpos($output, "<style")) . substr($output, strpos($output, "</style"), strlen($output));
        $output = substr($output, 0, strpos($output, "<title")) . substr($output, strpos($output, "</title"), strlen($output));

        $count1 = null;
        $count2 = null;
        $output = preg_replace('/&lt;(sm|pof|po|pol|pos|poif|poi|poil|po3|po3l|speaker)&gt;/', '<span class="$1">', $output, -1, $count1);
        $output = preg_replace('/&lt;\/(sm|pof|po|pol|pos|poif|poi|poil|po3|po3l|speaker)&gt;/', '</span>', $output, -1, $count2);
        // $output .= "<br /><br />Effettuate ".$count1." e ".$count2." sostituzioni.";

        $matches = null;
        if (preg_match_all("/<div class=\"errors bibleQuote\">.*?<\/div>/s", $output, $matches)) {
            // capture table of error messages, and turn it into notices for backend
            $errorshtml = new DOMDocument();
            $errorshtml->loadHTML("<!DOCTYPE HTML><head><title>BibleGet Query Errors</title></head><body>" . $matches[0][0] . "</body>");
            $error_rows = $errorshtml->getElementsByTagName('tr');
            if ($error_rows != null && $error_rows->length > 0) {
                $errs = get_option('bibleget_error_admin_notices', array());
                foreach ($error_rows as $error_row) {
                    $errormessage = bibleGetGetElementsByClass($error_row, 'td', 'errMessageVal');
                    $errs[] = "BIBLEGET SERVER ERROR: <span style=\"color:Red;\">" .
                        $errormessage[0]->nodeValue .
                        "</span><span style=\"color:DarkBlue;\">({$currentPageUrl})</span>.<br /><span style=\"color:Gray;font-style:italic;\">" .
                        __("If this error continues, please notify the BibleGet plugin author at") .
                        ": <a target=\"_blank\" href=\"mailto:bibleget.io@gmail.com?subject=BibleGet+Server+Error&body=" .
                        urlencode(
                            "The Wordpress Plugin is receiving this error message from the BibleGet Server:\n\n" .
                            $errormessage[0]->nodeValue .
                            "\n\nKind regards,\n\n"
                        ) .
                        "\">bibleget.io@gmail.com</a></span>";
                }
            }
            $output = preg_replace("/<div class=\"errors bibleQuote\">.*?<\/div>/s", '', $output);
        }
    } else {
        $errs[] = 'BIBLEGET SERVER ERROR: <span style="color:Red;font-weight:bold;">' .
            __("There was an error communicating with the BibleGet server, please wait a few minutes and try again", "bibleget-io") .
            ': &apos;' . curl_error($ch) . '&apos;: ' .
            $finalquery .
            '</span>';
        $output = false;
    }
    curl_close($ch);
    update_option('bibleget_error_admin_notices', $errs);
    return $output;
}



/* Mighty fine and dandy helper function I created! */
/**
 * BibleGet To ProperCase
 * @param string $txt
 *
 * Helper function that modifies the query so that it is in a correct Proper Case,
 * taking into account numbers at the beginning of the string
 * Can handle any kind of Unicode string in any language
 */
function bibleGetToProperCase($txt) {
    // echo "<div style=\"border:3px solid Yellow;\">txt = $txt</div>";
    preg_match("/\p{L}/u", $txt, $mList, PREG_OFFSET_CAPTURE);
    $idx = intval($mList[0][1]);
    // echo "<div style=\"border:3px solid Purple;\">idx = $idx</div>";
    $chr = mb_substr($txt, $idx, 1, 'UTF-8');
    // echo "<div style=\"border:3px solid Pink;\">chr = $chr</div>";
    if (preg_match("/\p{L&}/u", $chr)) {
        $post = mb_substr($txt, $idx + 1, mb_strlen($txt), 'UTF-8');
        // echo "<div style=\"border:3px solid Black;\">post = $post</div>";
        return mb_substr($txt, 0, $idx, 'UTF-8') . mb_strtoupper($chr, 'UTF-8') . mb_strtolower($post, 'UTF-8');
    } else {
        return $txt;
    }
}

/**
 * BibleGet IndexOf Function
 * @param unknown $needle
 * @param unknown $haystack
 *
 * Helper function that will return the index of a bible book from a two-dimensional index array
 */
function bibleGetIdxOf($needle, $haystack) {
    foreach ($haystack as $index => $value) {
        if (is_array($value)) {
            foreach ($value as $value2) {
                if (in_array($needle, $value2)) {
                    return $index;
                }
            }
        } else if (in_array($needle, $value)) {
            return $index;
        }
    }
    return false;
}



function setCommunicationError( $notices, $err ) {
    $optionsurl = admin_url("options-general.php?page=bibleget-settings-admin");
    $currentPageUrl = bibleGetCurrentPageUrl();
    $errs = [
        "",
        /* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
        __("There was a problem communicating with the BibleGet server. <a href=\"%s\" title=\"update metadata now\">Metadata needs to be manually updated</a>.", "bibleget-io"),
        /* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
        __("There may have been a problem communicating with the BibleGet server. <a href=\"%s\" title=\"update metadata now\">Metadata needs to be manually updated</a>.", "bibleget-io")
    ];
    $notices[] = "BIBLEGET PLUGIN ERROR: " .
        sprintf( $errs[$err], $optionsurl ) . " ({$currentPageUrl})";
    update_option('bibleget_error_admin_notices', $notices);
}

/**
 * FUNCTION bibleGetGetMetaData
 * @var request
 */
function bibleGetGetMetaData($request) {
    // request can be for building the biblebooks variable, or for building version indexes, or for requesting current validversions
    $notices = get_option('bibleget_error_admin_notices', array());
    $currentPageUrl = bibleGetCurrentPageUrl();
    $curl_version = curl_version();
    $ssl_version = str_replace('OpenSSL/', '', $curl_version['ssl_version']);
    if (version_compare($curl_version['version'], '7.34.0', '>=') && version_compare($ssl_version, '1.0.1', '>=')) {
        //we should be good to go for secure SSL communication supporting TLSv1_2
        $url = METADATA_API . "?query=" . $request . "&return=json";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
    } else {
        $url = "http://query.bibleget.io/v3/metadata.php?query=" . $request . "&return=json";
        $ch = curl_init($url);
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

    if (ini_get('open_basedir') === false) {
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    }

    $response = curl_exec($ch);
    if (curl_errno($ch) && (curl_errno($ch) === 77 || curl_errno($ch) === 60) && $url == METADATA_API . "?query=" . $request . "&return=json") {
        //error 60: SSL certificate problem: unable to get local issuer certificate
        //error 77: error setting certificate verify locations CAPath: none
        //curl.cainfo needs to be set in php.ini to point to the curl pem bundle available at https://curl.haxx.se/ca/cacert.pem
        //until that's fixed on the server environment let's resort to a simple http request
        $url = "http://query.bibleget.io/v3/metadata.php?query=" . $request . "&return=json";
        curl_setopt($ch, CURLOPT_URL, $url);
        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            setCommunicationError( $notices, 1 );
            return false;
        } else {
            $info = curl_getinfo($ch);
            // echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];
            if ($info["http_code"] != 200 && $info["http_code"] != 304 ) {
                setCommunicationError( $notices, 2 );
                return false;
            }
        }
    } elseif (curl_errno($ch)) {
        setCommunicationError( $notices, 1 );
        return false;
    } else {
        $info = curl_getinfo($ch);
        // echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];
        if ($info["http_code"] != 200 && $info["http_code"] != 304) {
            setCommunicationError( $notices, 2 );
            return false;
        }
    }
    curl_close($ch);

    $myjson = json_decode($response);
    if (property_exists($myjson, "results")) {
        return $myjson;
        // var verses = myjson.results;
    } else {
        $optionsurl = admin_url("options-general.php?page=bibleget-settings-admin");
        /* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
        $notices[] = "BIBLEGET PLUGIN ERROR: " .
            sprintf(
                __("There may have been a problem communicating with the BibleGet server. <a href=\"%s\" title=\"update metadata now\">Metadata needs to be manually updated</a>.", "bibleget-io"),
                $optionsurl
            ) .
            " ({$currentPageUrl})";
        update_option('bibleget_error_admin_notices', $notices);
        return false;
    }
}


/**
 *
 * @param string $query
 * @return number
 */
function bibleGetQueryClean($query) {
    // enforce query rules
    if ($query === '') {
        return __("You cannot send an empty query.", "bibleget-io");
    }
    $query = trim($query);
    $query = preg_replace('/\s+/', '', $query);
    $query = preg_replace("/[\x{2011}-\x{2015}|\x{2212}|\x{23AF}]/u", chr(45), $query);
    $query = str_replace(' ', '', $query);

    if (strpos($query, ':') && strpos($query, '.')) {
        return __("Mixed notations have been detected. Please use either english notation or european notation.", "bibleget-io") . '<' . $query . '>';
    } else if (strpos($query, ':')) { // if english notation is detected, translate it to european notation
        if (strpos($query, ',') != -1) {
            $query = str_replace(',', '.', $query);
        }
        $query = str_replace(':', ',', $query);
    }
    $queries = array_values(array_filter(explode(';', $query), function ($var) {
        return $var !== "";
    }));

    return array_map("bibleGetToProperCase", $queries);
}


/**
 *
 */
function bibleget_admin_notices() {
    $notices = get_option('bibleget_error_admin_notices');
    if ( $notices !== false ) {
        foreach ($notices as $notice) {
            echo "<div class='notice is-dismissible error'><p>$notice</p></div>";
        }
        delete_option('bibleget_error_admin_notices');
    }
    $notices = get_option('bibleget_admin_notices');
    if ( $notices !== false ) {
        foreach ($notices as $notice) {
            echo "<div class='notice is-dismissible updated'><p>$notice</p></div>";
        }
        delete_option('bibleget_admin_notices');
    }
}
add_action('admin_notices', 'bibleget_admin_notices');


/**
 *
 */
function bibleGetDeleteOptions() {
    // DELETE BIBLEGET_BIBLEBOOKS CACHED INFO
    for ($i = 0; $i < 73; $i++) {
        delete_option("bibleget_biblebooks" . $i);
    }

    // DELETE BIBLEGET_LANGUAGES CACHED INFO
    delete_option("bibleget_languages");


    // DELETE BIBLEGET_VERSIONINDEX CACHED INFO
    $bibleversionsabbrev = array_keys(get_option("bibleget_versions", array()));
    foreach ($bibleversionsabbrev as $abbrev) {
        delete_option("bibleget_" . $abbrev . "IDX");
    }

    // DELETE BIBLEGET_VERSIONS CACHED INFO
    delete_option("bibleget_versions");
}


/**
 *
 */
function bibleGetSetOptions() {
    $BGET = [];
    $BGETOPTIONS = new BGETPROPERTIES();
    foreach ($BGETOPTIONS->OPTIONS as $option => $array) {
        $BGET[$option] = $array['default']; //default will be based on current option if exists
    }
    update_option('BGET', $BGET);

    $metadata = bibleGetGetMetaData("biblebooks");
    if ($metadata !== false) {
        // bibleGetWriteLog("Retrieved biblebooks metadata...");
        // bibleGetWriteLog($metadata);
        if (property_exists($metadata, "results")) {
            $biblebooks = $metadata->results;
            foreach ($biblebooks as $key => $value) {
                $biblebooks_str = json_encode($value);
                $option = "bibleget_biblebooks" . $key;
                update_option($option, $biblebooks_str);
            }
        }
        if (property_exists($metadata, "languages")) {
            // echo "<div style=\"border:3px solid Red;\">languages = ".print_r($metadata->languages,true)."</div>";
            $languages = array_map("bibleGetToProperCase", $metadata->languages);
            // echo "<div style=\"border:3px solid Red;\">languages = ".print_r($languages,true)."</div>";
            // $languages_str = json_encode($languages);
            update_option("bibleget_languages", $languages);
        }
    }

    $metadata = bibleGetGetMetaData("bibleversions");
    $versionsabbrev = array();
    if ($metadata !== false) {
        // bibleGetWriteLog("Retrieved bibleversions metadata");
        // bibleGetWriteLog($metadata);
        if (property_exists($metadata, "validversions_fullname")) {
            $bibleversions = $metadata->validversions_fullname;
            $versionsabbrev = array_keys(get_object_vars($bibleversions));
            $bibleversions_str = json_encode($bibleversions);
            $bbversions = json_decode($bibleversions_str, true);
            update_option("bibleget_versions", $bbversions);
        }
        // bibleGetWriteLog("versionsabbrev should now be populated:");
        // bibleGetWriteLog($versionsabbrev);
    }

    if (count($versionsabbrev) > 0) {
        $versionsstr = implode(',', $versionsabbrev);
        $metadata = bibleGetGetMetaData("versionindex&versions=" . $versionsstr);
        if ($metadata !== false) {
            // bibleGetWriteLog("Retrieved versionindex metadata");
            // bibleGetWriteLog($metadata);
            if (property_exists($metadata, "indexes")) {
                foreach ($metadata->indexes as $versabbr => $value) {
                    $temp = array();
                    $temp["book_num"] = $value->book_num;
                    $temp["chapter_limit"] = $value->chapter_limit;
                    $temp["verse_limit"] = $value->verse_limit;
                    $temp["biblebooks"] = $value->biblebooks;
                    $temp["abbreviations"] = $value->abbreviations;
                    // $versionindex_str = json_encode($temp);
                    // bibleGetWriteLog("creating new option:["."bibleget_".$versabbr."IDX"."] with value:");
                    // bibleGetWriteLog($temp);
                    update_option("bibleget_" . $versabbr . "IDX", $temp);
                }
            }
        }
    }

    // we only want the script to die if it's an ajax request...
    if (isset($_POST["isajax"]) && $_POST["isajax"] == 1) {
        $notices = get_option('bibleget_admin_notices', array());
        $notices[] = "BIBLEGET PLUGIN NOTICE: " . __("BibleGet Server data has been successfully renewed.", "bibleget-io");
        update_option('bibleget_admin_notices', $notices);
        echo "datarefreshed";
        wp_die();
    }
}
add_action('wp_ajax_refresh_bibleget_server_data', 'bibleGetSetOptions');

function flushBibleQuotesCache() {
    global $wpdb;
    //The following SELECT should select both the transient and the transient_timeout
    //This will also remove the Google Fonts API key transient if it uses the same prefix...
    //I guess we'll just have to not use our defined prefix on the Google Fonts API key transient
    //in order avoid this
    $sql = "DELETE
            FROM  $wpdb->options
            WHERE `option_name` LIKE '%transient_%" . TRANSIENT_PREFIX . "%'
            ";
    //We shouldn't have to do a $wpdb->prepare here because there is no kind of user input anywhere
    if ($wpdb->query($sql) !== false) {
        echo 'cacheflushed';
    } else {
        echo 'cacheNotFlushed';
    }
    wp_die();
}

add_action('wp_ajax_flush_bible_quotes_cache', 'flushBibleQuotesCache');

function searchByKeyword() {
    $keyword = $_POST['keyword'];
    $version = $_POST['version'];
    $request = "query=keywordsearch&return=json&appid=wordpress&domain=" . urlencode(site_url()) . "&pluginversion=" . BIBLEGETPLUGINVERSION . "&version=" . $version . "&keyword=" . $keyword;
    $ch = curl_init(SEARCH_API);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
    if (ini_get('open_basedir') === false) {
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    }
    $output = curl_exec($ch);
    $info = curl_getinfo($ch);

    if (curl_errno($ch)) {
        $error = new stdClass();
        $error->errno = curl_errno($ch);
        $error->message = curl_error($ch);
        $error->request = $request;
        echo json_encode($error);
    }
    // echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];
    else if ($info["http_code"] != 200) {
        echo json_encode($info);
    } else if ($output) {
        echo $output;
    }
    curl_close($ch);
    wp_die();
}

add_action("wp_ajax_searchByKeyword", "searchByKeyword");

function updateBGET() {
    $options = $_POST['options'];
    $BGET = get_option('BGET');
    foreach ($options as $option => $array) {
        if (!isset($array["value"]) || !isset($array["type"])) {
            return false;
        }
        switch ($array["type"]) {
            case 'string':
                $BGET[$option] = esc_html($array["value"]);
                break;
            case 'integer':
                $BGET[$option] = intval($array["value"]);
                break;
            case 'number':
                $BGET[$option] = filter_var($array["value"], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                break;
            case 'boolean';
                $BGET[$option] = is_bool($array["value"]) ? $array["value"] : $array["value"] === 'true';
                break;
            case 'array':
                $BGET[$option] = is_array($array["value"]) ? array_map('esc_html', $array["value"]) : (strpos(",", $array["value"]) ? explode(",", $array["value"]) : []);
                if (count($BGET[$option]) === 0 && $option == "VERSION") {
                    $BGET[$option] = ["NABRE"];
                }
                break;
            default:
                //do we need to do some kind of sanitization for this case?
                $BGET[$option] = esc_html($array["value"]);
        }
    }
    return update_option('BGET', $BGET);
}

add_action("wp_ajax_updateBGET", "updateBGET");


if (is_admin()) {
    $bibleget_settings_page = new BibleGetSettingsPage();

    // bibleGetWriteLog("about to initialize creation of admin page...");
    $bibleget_settings_page->Init(); //only init will actually register and print out the settings and the options page
}


/**
 * END OF SETTINGS PAGE
 *
 * START OF CUSTOMIZER OPTIONS
 */



add_action('wp_enqueue_scripts', array('BibleGet_Customize', 'bibleget_customizer_print_script'));
add_action('admin_enqueue_scripts', array('BibleGet_Customize', 'bibleget_customizer_print_script'));

// Setup the Theme Customizer settings and controls...
add_action('customize_register', array(
    'BibleGet_Customize',
    'register'
));

// Output custom CSS to live site
add_action('wp_head', array(
    'BibleGet_Customize',
    'header_output'
));

// Output custom CSS to admin area for gutenberg previews
add_action('admin_head', array(
    'BibleGet_Customize',
    'header_output'
));


// Enqueue live preview javascript in Theme Customizer admin screen
add_action('customize_preview_init', array(
    'BibleGet_Customize',
    'live_preview'
));

/**
 * Function bibleGetWriteLog
 * useful for debugging purposes
 *
 * @param unknown $log
 */
function bibleGetWriteLog($log) {
    $debugfile = plugin_dir_path(__FILE__) . "debug.txt";
    $datetime = date("Y-m-d H:i:s", time());
    $myfile = fopen($debugfile, "a");
    if ($myfile !== false) {
        if (is_array($log) || is_object($log)) {
            if (!fwrite($myfile, "[" . $datetime . "] " . print_r($log, true) . "\n")) {
                echo '<div style="border: 1px solid Red; background-color: LightRed;">impossible to open or write to: ' . $debugfile . '</div>';
            }
        } else {
            if (!fwrite($myfile, "[" . $datetime . "] " . $log . "\n")) {
                echo '<div style="border: 1px solid Red; background-color: LightRed;">impossible to open or write to: ' . $debugfile . '</div>';
            }
        }
        fclose($myfile);
    } else {
        echo '<div style="border: 1px solid Red; background-color: LightRed;">impossible to open or write to: ' . $debugfile . '</div>';
    }
}



add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'bibleGetAddActionLinks');
/**
 *
 * @param unknown $links
 */
function bibleGetAddActionLinks($links) {
    $mylinks = array(
        '<a href="' . admin_url('options-general.php?page=bibleget-settings-admin') . '">' . __('Settings') . '</a>'
    );
    return array_merge($links, $mylinks);
}


/**
 *
 * @param unknown $parentNode
 * @param unknown $tagName
 * @param unknown $className
 */
function bibleGetGetElementsByClass(&$parentNode, $tagName, $className) {
    $nodes = array();

    $childNodeList = $parentNode->getElementsByTagName($tagName);
    for ($i = 0; $i < $childNodeList->length; $i++) {
        $temp = $childNodeList->item($i);
        if (stripos($temp->getAttribute('class'), $className) !== false) {
            $nodes[] = $temp;
        }
    }

    return $nodes;
}


/**
 *
 */
function bibleGetCurrentPageUrl() {
    $pageURL = 'http';
    if (isset($_SERVER["HTTPS"])) {
        if ($_SERVER["HTTPS"] == "on") {
            $pageURL .= "s";
        }
    }
    $pageURL .= "://";
    if ($_SERVER["SERVER_PORT"] != "80") {
        $pageURL .= $_SERVER["SERVER_NAME"] . ":" . $_SERVER["SERVER_PORT"] . $_SERVER["REQUEST_URI"];
    } else {
        $pageURL .= $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"];
    }
    return $pageURL;
}
