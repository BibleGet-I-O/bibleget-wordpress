<?php

/** CREATE ADMIN MENU PAGE WITH SETTINGS */
class BibleGetSettingsPage
{
	/**
	 * Holds the values to be used in the fields callbacks
	 */
	private $options;
	private $options_page_hook;
	private $locale;
	private $versionsbylang;
	private $versionsbylangcount;
	private $versionlangscount;
	private $biblebookslangs;
	private $gfonts_weblist;
	private $gfontsAPIkey;
	private $gfontsAPIkeyTimeOut;
	private $gfontsAPI_errors;
	private $gfontsAPIkeyCheckResult;
	private $bibleget_langcodes;

	/**
	 * Start up
	 */
	public function __construct()
	{
		$this->locale = substr(apply_filters('plugin_locale', get_locale(), 'bibleget-io'), 0, 2);
		$this->gfonts_weblist = new stdClass();
		$this->options = get_option('bibleget_settings');
		$this->gfontsAPIkey = "";
		$this->gfontsAPIkeyTimeOut = 0;
		$this->gfontsAPIkeyCheckResult = false;
		$this->gfontsAPI_errors = array();
		$this->bibleget_langcodes = array(
			"af" => "Afrikaans",
			"ak" => "Akan",
			"sq" => "Albanian",
			"am" => "Amharic",
			"ar" => "Arabic",
			"hy" => "Armenian",
			"az" => "Azerbaijani",
			"eu" => "Basque",
			"be" => "Belarusian",
			"bn" => "Bengali",
			"bh" => "Bihari",
			"bs" => "Bosnian",
			"br" => "Breton",
			"bg" => "Bulgarian",
			"km" => "Cambodian",
			"ca" => "Catalan",
			"ny" => "Chichewa",
			"zh" => "Chinese",
			"co" => "Corsican",
			"hr" => "Croatian",
			"cs" => "Czech",
			"da" => "Danish",
			"nl" => "Dutch",
			"en" => "English",
			"eo" => "Esperanto",
			"et" => "Estonian",
			"fo" => "Faroese",
			"tl" => "Filipino",
			"fi" => "Finnish",
			"fr" => "French",
			"fy" => "Frisian",
			"gl" => "Galician",
			"ka" => "Georgian",
			"de" => "German",
			"el" => "Greek",
			"gn" => "Guarani",
			"gu" => "Gujarati",
			"ht" => "Haitian Creole",
			"ha" => "Hausa",
			"iw" => "Hebrew",
			"hi" => "Hindi",
			"hu" => "Hungarian",
			"is" => "Icelandic",
			"ig" => "Igbo",
			"id" => "Indonesian",
			"ia" => "Interlingua",
			"ga" => "Irish",
			"it" => "Italian",
			"ja" => "Japanese",
			"jw" => "Javanese",
			"kn" => "Kannada",
			"kk" => "Kazakh",
			"rw" => "Kinyarwanda",
			"rn" => "Kirundi",
			"kg" => "Kongo",
			"ko" => "Korean",
			"ku" => "Kurdish",
			"ky" => "Kyrgyz",
			"lo" => "Laothian",
			"la" => "Latin",
			"lv" => "Latvian",
			"ln" => "Lingala",
			"lt" => "Lithuanian",
			"lg" => "Luganda",
			"mk" => "Macedonian",
			"mg" => "Malagasy",
			"ms" => "Malay",
			"ml" => "Malayalam",
			"mt" => "Maltese",
			"mi" => "Maori",
			"mr" => "Marathi",
			"mo" => "Moldavian",
			"mn" => "Mongolian",
			"ne" => "Nepali",
			"no" => "Norwegian",
			"oc" => "Occitan",
			"or" => "Oriya",
			"om" => "Oromo",
			"ps" => "Pashto",
			"fa" => "Persian",
			"pl" => "Polish",
			"pt" => "Portuguese",
			"pa" => "Punjabi",
			"qu" => "Quechua",
			"ro" => "Romanian",
			"rm" => "Romansh",
			"ru" => "Russian",
			"gd" => "Scots Gaelic",
			"sr" => "Serbian",
			"sh" => "Serbo-Croatian",
			"st" => "Sesotho",
			"tn" => "Setswana",
			"sn" => "Shona",
			"sd" => "Sindhi",
			"si" => "Sinhalese",
			"sk" => "Slovak",
			"sl" => "Slovenian",
			"so" => "Somali",
			"es" => "Spanish",
			"su" => "Sundanese",
			"sw" => "Swahili",
			"sv" => "Swedish",
			"tg" => "Tajik",
			"ta" => "Tamil",
			"tt" => "Tatar",
			"te" => "Telugu",
			"th" => "Thai",
			"ti" => "Tigrinya",
			"to" => "Tonga",
			"tr" => "Turkish",
			"tk" => "Turkmen",
			"tw" => "Twi",
			"ug" => "Uighur",
			"uk" => "Ukrainian",
			"ur" => "Urdu",
			"uz" => "Uzbek",
			"vi" => "Vietnamese",
			"cy" => "Welsh",
			"wo" => "Wolof",
			"xh" => "Xhosa",
			"yi" => "Yiddish",
			"yo" => "Yoruba",
			"zu" => "Zulu"
		);
		$this->versionsbylang = $this->prepareVersionsByLang(); //will now be an array with both versions and langs properties
		$this->versionlangscount = count($this->versionsbylang["versions"]);
		$this->versionsbylangcount = $this->countVersionsByLang();
		$this->biblebookslangs = $this->prepareBibleBooksLangs();
	}

	public function Init()
	{
		add_action('admin_menu', array($this, 'add_plugin_page'));
		add_action('admin_init', array($this, 'register_settings'));

		//if I understand correctly, ajax function callbacks need to be registered even before enqueue_scripts
		//so let's pull it out of admin_print_scripts and place it here even before enqueue_scripts is called
		//this will change the transient set, it cannot happen in gfontsAPIkeyCheck which is called on any admin interface
		//we will have to leave the transient set to admin_print_scripts
		switch ($this->gfontsAPIkeyCheck()) { //can either check directly the return value of the script as we are doing here, or check the value as stored in the class private variable $this->gfontsAPIkeyCheckResult
			case false:
				//the gfontsAPIkey is not set, so let's just not do anything, ok
				break;
			case "SUCCESS":
				//the gfontsAPIkey is set, and transient has been set and successful curl call made to the google fonts API
				//error_log('AJAX ACTION NOW BEING ADDED WITH THESE VALUES');
				add_action("wp_ajax_store_gfonts_preview", array($this, 'store_gfonts_preview'));
				add_action("wp_ajax_bibleget_refresh_gfonts", array($this, 'bibleGetForceRefreshGFontsResults'));
				//enqueue and localize will be done in enqueue_scripts

				// Include CSS minifier by matthiasmullie
				$minifierpath = WP_PLUGIN_DIR . "/bibleget-io/minifier";
				require_once $minifierpath . '/minify/src/Minify.php';
				require_once $minifierpath . '/minify/src/CSS.php';
				require_once $minifierpath . '/minify/src/JS.php';
				require_once $minifierpath . '/minify/src/Exception.php';
				require_once $minifierpath . '/minify/src/Exceptions/BasicException.php';
				require_once $minifierpath . '/minify/src/Exceptions/FileImportException.php';
				require_once $minifierpath . '/minify/src/Exceptions/IOException.php';
				require_once $minifierpath . '/path-converter/src/ConverterInterface.php';
				require_once $minifierpath . '/path-converter/src/Converter.php';
				break;
			case "CURL_ERROR":
				break;
			case "JSON_ERROR":
				break;
			case "REQUEST_NOT_SENT":
				break;
		}

		add_action('admin_enqueue_scripts', array($this, 'admin_print_styles'));
		add_action('admin_enqueue_scripts', array($this, 'admin_print_scripts'));
		add_action('load-' . $this->options_page_hook, array($this, 'bibleget_plugin_settings_save'));
	}

	public function getBibleGetLangCodes()
	{
		return $this->bibleget_langcodes;
	}

	public function getVersionsByLang()
	{
		return $this->versionsbylang;
	}

	/**
	 * Function prepareBibleBooksLangs
	 *
	 * returns the list of languages in which the BibleGet endpoint can understand the names of the books of the Bible
	 * the language names are translated into the current locale
	 * (For just the English names, use get_option("bibleget_languages") rather than this function )
	 */
	public function prepareBibleBooksLangs()
	{
		$biblebookslangsArr = array();

		$biblebookslangs = get_option("bibleget_languages");
		if ($biblebookslangs === false || !is_array($biblebookslangs) || count($biblebookslangs) < 1) {
			bibleGetSetOptions(); //TODO: these if conditions shouldn't ever verify, but if they were to be true, can we call global function from here?
			$biblebookslangs = get_option("bibleget_languages");
		}

		//we will try to translate each of the language names if possible
		foreach ($biblebookslangs as $key => $biblebookslang) {
			if (extension_loaded('intl') === true) {
				//get two letter ISO code from the english language name
				$biblebooksLocale = array_search($biblebookslang, $this->bibleget_langcodes);
				//get the translated display name that corresponds to the two letter ISO code
				$lang = Locale::getDisplayLanguage($biblebooksLocale, $this->locale);
				array_push($biblebookslangsArr, $lang);
			} else { //and if we can't get the two letter ISO code for this language, we will just use the english version we have
				array_push($biblebookslangsArr, $biblebookslang);
			}
		}


		if (extension_loaded('intl') === true) {
			collator_asort(collator_create('root'), $biblebookslangsArr);
		} else {
			array_multisort(array_map('self::Sortify', $biblebookslangsArr), $biblebookslangsArr);
		}
		return $biblebookslangsArr;
	}

	public function prepareVersionsByLang()
	{
		$versions = get_option("bibleget_versions", array()); //theoretically should be an array
		$versionsbylang = array();
		$langs = array();
		if (count($versions) < 1) {
			bibleGetSetOptions(); //global function defined in bibleget-io.php
			$versions = get_option("bibleget_versions", array());
		}
		foreach ($versions as $abbr => $versioninfo) {
			$info = explode("|", $versioninfo);
			$fullname = $info[0];
			$year = $info[1];
			if (extension_loaded('intl') === true) { //do our best to translate the language name
				$lang = Locale::getDisplayLanguage($info[2], $this->locale);
			} else { //but if we can't, just use the english version that we have
				$lang = $this->bibleget_langcodes[$info[2]]; //this gives the english correspondent of the two letter ISO code
			}

			if (isset($versionsbylang[$lang])) {
				if (isset($versionsbylang[$lang][$abbr])) {
					//how can that be?
				} else {
					$versionsbylang[$lang][$abbr] = array("fullname" => $fullname, "year" => $year);
				}
			} else {
				$versionsbylang[$lang] = array();
				array_push($langs, $lang);
				$versionsbylang[$lang][$abbr] = array("fullname" => $fullname, "year" => $year);
			}
		}

		if (extension_loaded('intl') === true) {
			collator_asort(collator_create('root'), $langs);
		} else {
			array_multisort(array_map('self::Sortify', $langs), $langs);
		}

		return array("versions" => $versionsbylang, "langs" => $langs);
	}

	public function countVersionsByLang()
	{
		//count total languages and total versions

		$counter = 0;
		foreach ($this->versionsbylang["versions"] as $lang => $versionbylang) {
			ksort($this->versionsbylang["versions"][$lang]);
			$counter += count($this->versionsbylang["versions"][$lang]);
		}
		return $counter;
	}

	/**
	 * Function getBibleBookNamesInLang
	 * @string $lang will typically be the language of the WordPress interface,
	 * can be two letter ISO code or full language name
	 * Returns stdClass object
	 */
	public function getBibleBookNamesInLang($lang = null){
		if($lang === null){ $lang = $this->locale; }
		if(strlen($lang) == 2){
			//we have a two-letter ISO code, we need to get the full language name in English
			if (extension_loaded('intl') === true) {
				$lang = Locale::getDisplayLanguage($lang, "en");
			} else {
				$lang = $this->bibleget_langcodes[$lang]; //this gives the english correspondent of the two letter ISO code
			}
		}

		//we probably have a full language name now if we didn't before, let's get the index from the supported languages
		if(strlen($lang) > 2){
			$biblebookslangs = get_option("bibleget_languages");
			$idx = array_search($lang,$biblebookslangs);
			if($idx === false){
				$idx = array_search("English",$biblebookslangs);
			}
			//we can start getting our return info ready
			$bibleBooks = new stdClass();
			$bibleBooks->fullname = array();
			$bibleBooks->abbrev = array();
			for($i=0;$i<73;$i++){
				$jsbook = json_decode(get_option("bibleget_biblebooks" . $i), true);
				array_push($bibleBooks->fullname, $jsbook[$idx][0]);
				array_push($bibleBooks->abbrev, $jsbook[$idx][1]);
			}
			return $bibleBooks;
		}
		return false;
	}

	/**
	 * Add options page
	 */
	public function add_plugin_page()
	{
		// This page will be under "Settings"
		$this->options_page_hook = add_options_page(
			__('BibleGet I/O Settings', "bibleget-io"),	// $page_title
			'BibleGet I/O',								// $menu_title
			'manage_options',							// $capability
			'bibleget-settings-admin',					// $menu_slug (Page ID)
			array($this, 'create_admin_page')			// Callback Function
		);
	}

	/**
	 * Register and add settings
	 */
	public function register_settings()
	{

		register_setting(
			'bibleget_settings_options', // Option group
			'bibleget_settings', // Option name
			array($this, 'sanitize') // Sanitize
		);

		add_settings_section(
			'bibleget_settings_section2', // ID
			__('Preferences Settings', "bibleget-io"), // Title
			array($this, 'print_section_info2'), // Callback
			'bibleget-settings-admin' // Page
		);

		add_settings_field(
			'favorite_version',
			__('Preferred version or versions (when not indicated in shortcode)', "bibleget-io"),
			array($this, 'favorite_version_callback'),
			'bibleget-settings-admin',
			'bibleget_settings_section2'
		);

		add_settings_field(
			'googlefontsapi_key',
			__('Google Fonts API key (for updated font list)', "bibleget-io"),
			array($this, 'googlefontsapikey_callback'),
			'bibleget-settings-admin',
			'bibleget_settings_section2'
		);
	}

	public function admin_print_styles($hook)
	{
		if ($hook == 'settings_page_bibleget-settings-admin') {
			wp_enqueue_style('admin-css', plugins_url('css/admin.css', __FILE__));
		}
	}

	public function admin_print_scripts($hook)
	{
		//echo "<div style=\"border:10px ridge Blue;\">$hook</div>";
		if ($hook != 'settings_page_bibleget-settings-admin') {
			return;
		}

		wp_register_script('admin-js', plugins_url('js/admin.js', __FILE__), array('jquery'));
		$thisoptions = get_option('bibleget_settings');
		$myoptions = array();
		if ($thisoptions) {
			foreach ($thisoptions as $key => $option) {
				$myoptions[$key] = esc_attr($option);
			}
		}
		$obj = array("options" => $myoptions, 'ajax_url' => admin_url('admin-ajax.php'), 'ajax_nonce' => wp_create_nonce("bibleget-data"));
		wp_localize_script('admin-js', 'bibleGetOptionsFromServer', $obj);
		wp_enqueue_script('admin-js');

		if ($this->gfontsAPIkeyCheckResult == "SUCCESS") {
			//We only want the transient to be set from the bibleget settings page, so we wait until now
			// instead of doing it in the gfontsAPIkeyCheck (which is called on any admin interface)
			set_transient(md5($this->options['googlefontsapi_key']), $this->gfontsAPIkeyCheckResult, 90 * 24 * HOUR_IN_SECONDS); // 90 giorni

			$plugin_path = "";
			// bibleGetWriteLog("about to initialize creation of admin page...");
			if (get_filesystem_method() === 'direct') {
				$creds = request_filesystem_credentials(site_url() . '/wp-admin/', '', false, false, array());
				/* initialize the API */
				if (WP_Filesystem($creds)) {
					global $wp_filesystem;
					$plugin_path = str_replace(ABSPATH, $wp_filesystem->abspath(), plugin_dir_path(__FILE__));
					if (!$wp_filesystem->is_dir($plugin_path . 'gfonts_preview/')) {
						/* directory didn't exist, so let's create it */
						$wp_filesystem->mkdir($plugin_path . 'gfonts_preview/');
					}
					if (!$wp_filesystem->is_dir($plugin_path . 'css/gfonts_preview/')) {
						/* directory didn't exist, so let's create it */
						$wp_filesystem->mkdir($plugin_path . 'css/gfonts_preview/');
					}

					//let's also cache the results from the Google Fonts API in a local file so we don't have to keep calling
					$wp_filesystem->put_contents(
						$plugin_path . 'gfonts_preview/gfontsWeblist.json',
						json_encode($this->gfonts_weblist),
						FS_CHMOD_FILE // predefined mode settings for WP files
					);
				} else {
					$this->gfontsAPI_errors[] = "Could not initialize wordpress filesystem with these credentials";
				}
			} else {
				$this->gfontsAPI_errors[] = "You do not have direct access permissions to the wordpress filesystem";
			}

			wp_enqueue_script('jquery-ui-progressbar');
			if (!wp_style_is('jquery-ui-css', 'registered') || !wp_style_is('jquery-ui-css', 'enqueued')) {
				wp_enqueue_style(
					'jquery-ui-css',
					'//ajax.googleapis.com/ajax/libs/jqueryui/' . wp_scripts()->registered['jquery-ui-core']->ver . '/themes/smoothness/jquery-ui.css'
				);
			}
			$storeGfontsArr = array("job" => array("gfontsPreviewJob" => (bool) true, "gfontsNonce" => wp_create_nonce("store_gfonts_preview_nonce"), "gfontsRefreshNonce" => wp_create_nonce("refresh_gfonts_results_nonce"), 'ajax_url' => admin_url('admin-ajax.php'), 'gfontsWeblist' => $this->gfonts_weblist, 'gfontsApiKey' => $this->options['googlefontsapi_key']));
			wp_localize_script('admin-js', 'gfontsBatch', $storeGfontsArr);
		}
	}

	/**
	 * Options page callback
	 */
	public function create_admin_page()
	{

		//populate $this->biblebookslangs and $this->versionsbylang and $this->versionsbylangcount
		//based on current WordPress locale
		//$this->versionsbylang = $this->getVersionsByLang(); //already done in constructor?

		//HTML of the main section of the options page
?>
		<div id="page-wrap">
			<h2 id="bibleget-h2"><?php _e("BibleGet I/O Settings", "bibleget-io") ?></h2>
			<div id="form-wrapper">
				<form method="post" action="options.php">
					<?php
					// This prints out all hidden settings fields
					settings_fields('bibleget_settings_options');   // $option_group -> match group name in register_setting()
					// This prints out all visible settings fields
					do_settings_sections('bibleget-settings-admin'); // $page_slug
					// Since this is all one form, any other button within this area
					// will be treated as a submit button, try to avoid using buttons
					// in any html markup
					submit_button();
					?>
				</form>
			</div>
			<div class="page-clear"></div>

			<hr>
			<!-- Here is a section outside of the defined options,
            		which let's us now what Bible versions and languages are currently supported
            		by the BibleGet service endpoint -->
			<div id="bibleget-settings-container">
				<div id="bibleget-settings-contents">
					<h3><?php _e("Current BibleGet I/O engine information:", "bibleget-io") ?></h3>
					<ol type="A">
						<li><?php
							// This if condition should be superfluous, but just to be sure nothing goes awry...
							if ($this->versionsbylangcount < 1 || $this->versionlangscount < 1) {
								echo "Seems like the version info was not yet initialized. Now attempting to initialize...";
								$this->versionsbylang = $this->getVersionsByLang();
							}
							$b1 = '<b class="bibleget-dynamic-data">';
							$b2 = '</b>';
							$string1 = $b1 . $this->versionsbylangcount . $b2;
							$string2 = $b1 . $this->versionlangscount . $b2;
							/* translators: please do not change the placeholders %s, they will be substituted dynamically by values in the script. See http://php.net/printf. */
							printf(__("The BibleGet I/O engine currently supports %s versions of the Bible in %s different languages.", "bibleget-io"), $string1, $string2);
							echo "<br />";
							_e("List of currently supported Bible versions, subdivided by language:", "bibleget-io");
							echo "<div class=\"bibleget-dynamic-data-wrapper\"><ol id=\"versionlangs-ol\">";
							$cc = 0;
							foreach ($this->versionsbylang["langs"] as $lang) {
								echo '<li>-' . $lang . '-<ul>';
								foreach ($this->versionsbylang["versions"][$lang] as $abbr => $value) {
									echo '<li>' . (++$cc) . ') ' . $abbr . ' — ' . $value["fullname"] . ' (' . $value["year"] . ')</li>';
								}
								echo '</ul></li>';
							}
							echo "</ol></div>";
							?></li>
						<li><?php
							$string3 = $b1 . count($this->biblebookslangs) . $b2;
							/* translators: please do not change the placeholders %s, they will be substituted dynamically by values in the script. See http://php.net/printf. */
							printf(__("The BibleGet I/O engine currently understands the names of the books of the Bible in %s different languages:", "bibleget-io"), $string3);
							echo "<br />";
							echo "<div class=\"bibleget-dynamic-data-wrapper\">" . implode(", ", $this->biblebookslangs) . "</div>";
							?></li>
					</ol>
					<div class="flexcontainer">
						<div class="flexitem">
							<p><?php _e("This information from the BibleGet server is cached locally to improve performance. If new versions have been added to the BibleGet server or new languages are supported, this information might be outdated. In that case you can click on the button below to renew the information.", "bibleget-io"); ?></p>
							<button id="bibleget-server-data-renew-btn" class="button button-secondary"><?php _e("RENEW INFORMATION FROM BIBLEGET SERVER", "bibleget-io") ?></button>
						</div>
						<div class="flexitem">
							<p>
								<?php _e("If there has been a recent update to the plugin with new functionality, or a recent update to the BibleGet endpoint engine, you may have to flush the cached Bible quotes in order for any new functionalities to work correctly. The cached Bible quotes will be emptied on their own within a week; click here in order to flush them immediately. However use with caution: the BibleGet endpoint imposes a hard limit of 30 requests in a two day period day for the same Bible quote, and 100 requests in a two day period for different Bible quotes. If you have a large number of Bible quotes in your articles and pages, make sure you are not over the limit, otherwise you may start seeing empty Bible quotes appear on your website.", "bibleget-io"); ?>
							</p>
							<button id="bibleget-cache-flush-btn" class="button button-secondary"><?php _e("FLUSH CACHED BIBLE QUOTES", "bibleget-io") ?></button>
						</div>
					</div>
				</div>
				<div id="bibleget_ajax_spinner"><img src="<?php echo admin_url(); ?>images/wpspin_light-2x.gif" /></div>
			</div>
			<div class="page-clear"></div>
			<hr>
			<?php
			$locale = apply_filters('plugin_locale', get_locale(), 'bibleget-io');
			//let's keep the image files to the general locale, so we don't have to make a different image for every specific country locale...
			if (strpos($locale, "_") !== false) {
				if (version_compare(phpversion(), '5.4.0', '>=')) {
					$locale_lang = explode("_", $locale)[0]; //variable dereferencing available only since PHP 5.4
				} else {
					list($locale_lang, $locale_country) = explode("_", $locale); //lower than PHP 5.4
				}
			} else {
				$locale_lang = $locale;
			}
			if (file_exists(plugins_url('images/btn_donateCC_LG' . ($locale_lang ? '-' . $locale_lang : '') . '.gif', __FILE__))) {
				$donate_img = plugins_url('images/btn_donateCC_LG' . ($locale_lang ? '-' . $locale_lang : '') . '.gif', __FILE__);
			} else $donate_img = plugins_url('images/btn_donateCC_LG.gif', __FILE__);
			?>
			<div id="bibleget-donate"><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HDS7XQKGFHJ58"><button><img src="<?php echo $donate_img; ?>" /></button></a></div>
		</div>
		<div id="bibleget-settings-notification">
			<span class="bibleget-settings-notification-dismiss"><a title="dismiss this notification">x</a></span>
		</div>
	<?php
	}


	/**
	 * Sanitize each setting field as needed
	 *
	 * @param array $input Contains all settings fields as array keys
	 */
	public function sanitize($input)
	{   // use absint for number fields instead of sanitize_text_field
		$new_input = array();

		if (isset($input['favorite_version']))
			$new_input['favorite_version'] = sanitize_text_field($input['favorite_version']);
		if (isset($input['googlefontsapi_key']))
			$new_input['googlefontsapi_key'] = sanitize_text_field($input['googlefontsapi_key']);

		return $new_input;
	}

	/**
	 * Print the Section text
	 */
	public function print_section_info2()
	{
		print __('Choose your preferences to facilitate the usage of the shortcode:', "bibleget-io");
	}


	public function favorite_version_callback()
	{
		//double check to see if the values have been set
		if ($this->versionsbylangcount < 1 || $this->versionlangscount < 1) {
			$this->versionsbylang = $this->getVersionsByLang();
		}

		$counter = ($this->versionsbylangcount + $this->versionlangscount);

		$selected = array();
		if (isset($this->options['favorite_version']) && $this->options['favorite_version']) {
			$selected = explode(",", $this->options['favorite_version']);
		}
		$size = $counter < 10 ? $counter : 10;
		echo '<select id="versionselect" size=' . $size . ' multiple>';

		$langs = $this->versionsbylang["langs"];
		$versionsbylang = $this->versionsbylang["versions"];

		foreach ($langs as $lang) {
			echo '<optgroup label="-' . $lang . '-">';
			foreach ($versionsbylang[$lang] as $abbr => $value) {
				$selectedstr = '';
				if (in_array($abbr, $selected)) {
					$selectedstr = " SELECTED";
				}
				echo '<option value="' . $abbr . '"' . $selectedstr . '>' . $abbr . ' — ' . $value["fullname"] . ' (' . $value["year"] . ')</option>';
			}
			echo '</optgroup>';
		}
		echo '</select>';
		echo '<br /><i>'.__("In order to select multiple items, hold down CTRL key (Command key on Mac) while clicking items.","bibleget-io").'</i>';
		echo '<input type="hidden" id="favorite_version" name="bibleget_settings[favorite_version]" value="" />';
	}

	public function googlefontsapikey_callback()
	{

		echo '<label for="googlefontsapi_key">' . __("Google Fonts API Key", "bibleget-io") . ' <input type="text" id="googlefontsapi_key" name="bibleget_settings[googlefontsapi_key]" value="' . $this->gfontsAPIkey . '" size="50" /></label>';
		if ($this->gfontsAPIkeyCheckResult) {
			switch ($this->gfontsAPIkeyCheckResult) {
				case "SUCCESS":
					//Let's transform the transient timeout into a human readable format

					$d1 = new DateTime(); //timestamp set to current time
					$d2 = new DateTime();
					$d2->setTimestamp($this->gfontsAPIkeyTimeOut);
					$diff = $d2->diff($d1);
					$gfontsAPIkeyTimeLeft = $diff->m . "months, " . $diff->d . " days";

					$timeLeft = array();

					if ($diff->m > 0) {
						$timeLeft[] = ($diff->m . " month" . (($diff->m > 1) ? "s" : ""));
					}
					if ($diff->d > 0) {
						$timeLeft[] = ($diff->d . " day" . (($diff->d > 1) ? "s" : ""));
					}

					$gfontsAPIkeyTimeLeft = (count($timeLeft) > 0) ? "[" . implode(", ", $timeLeft) . "]" : "";

					/* translators: refers to the outcome of the validity check of the Google Fonts API key */
					echo '<span style="color:Green;font-weight:bold;margin-left:12px;">' . __("VALID", "bibleget-io") . '</span><br />';
					echo ' <i>' . sprintf(__("Google Fonts API refresh scheduled in: %s", "bibleget-io"), $gfontsAPIkeyTimeLeft);
					echo ' ' . sprintf(__("OR %s Click here %s to force refresh the list of fonts from the Google Fonts API", "bibleget-io"), '<span id="biblegetForceRefreshGFapiResults">', '</span>');
					echo '</i>';
					break;
				case "CURL_ERROR":
					/* translators: refers to the outcome of the validity check of the Google Fonts API key */
					echo '<span style="color:DarkViolet;font-weight:bold;margin-left:12px;">' . __("CURL ERROR WHEN SENDING REQUEST", "bibleget-io") . '</span><br />';
					foreach ($this->gfontsAPI_errors as $er) {
						if ($er == 403) {
							echo '<br /><i style="color:DarkViolet;margin-left:12px;">';
							echo __("This server's IP address has not been given access to the Google Fonts API using this key.", "bibleget-io");
							echo " " . __("Please verify that access has been given to the correct IP addresses.", "bibleget-io");
							echo " " . sprintf(__("Once you are sure that this has been fixed you may %s click here %s to retest the key (you may need to wait a few minutes for the settings to take effect in the Google Cloud Console).", "bibleget-io"), '<span id="biblegetGFapiKeyRetest">', '</span>');
							echo '</i>';
						}
						echo '<br /><i style="color:DarkViolet;margin-left:12px;">' . $er . '</i>';
					}
					break;
				case "JSON_ERROR":
					/* translators: refers to the outcome of the validity check of the Google Fonts API key */
					echo '<span style="color:Orange;font-weight:bold;margin-left:12px;">' . __("NO VALID JSON RESPONSE", "bibleget-io") . '</span><br />';
					break;
				case "REQUEST_NOT_SENT":
					/* translators: refers to the outcome of the validity check of the Google Fonts API key */
					echo '<span style="color:Red;font-weight:bold;margin-left:12px;">' . __("SERVER UNABLE TO MAKE REQUESTS", "bibleget-io") . '</span><br />';
					break;
			}
		} else {
			echo "<br /><i>" . __("If you would like to use a Google Font that is not already included in the list of available fonts, you should use a Google Fonts API key.", "bibleget-io") .
				" " . __("If you do not yet have a Google Fonts API Key, you can get one here", "bibleget-io") .
				': <a href="https://developers.google.com/fonts/docs/developer_api">https://developers.google.com/fonts/docs/developer_api</a>' .
				" " . __("If you choose to apply restrictions to your api key, choose 'IP Addresses (web servers, cron jobs etc)'", "bibleget-io") .
				" " . __("and if you restrict to specific IP addresses be sure to include any and all IP addresses that this server may use", "bibleget-io") .
				/* translators: please do not change the placeholders %s, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
				", " . sprintf(__("specifically the ip address found in the %s variable (it may take a few minutes to be effective).", "bibleget-io"), "&#x24;&#x5F;SERVER&#x5B;&#x27;SERVER&#x5F;ADDR&#x27;&#x5D;") .
				" " . __("A successful key will be cached and retested every 3 months.", "bibleget-io") .
				" " . __("Please note that this may have a little bit of an impact on the loading performance of your Wordpress Customizer.", "bibleget-io") .
				" " . __("If you notice that it becomes too sluggish, you had best leave this field empty.", "bibleget-io") .
				/* translators: please do not change the placeholders %s, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
				"<br /> (" . sprintf(__("To see the value of the %s variable on your server %s Press here %s", "bibleget-io"), "&#x24;&#x5F;SERVER&#x5B;&#x27;SERVER&#x5F;ADDR&#x27;&#x5D;", "<span id=\"biblegetio_reveal_server_variable\" tabindex=\"0\">", "</span>") .
				"<span id=\"biblegetio_hidden_server_variable\"> [" . $_SERVER['SERVER_ADDR'] . "] )</span>" .
				"</i>";
		}
	}

	public function gfontsAPIkeyCheck()
	{
		$result = false;
		$this->gfontsAPI_errors = array(); //we want to start with a clean slate

		if (isset($this->options['googlefontsapi_key']) && $this->options['googlefontsapi_key'] != "") {
			$this->gfontsAPIkey = $this->options['googlefontsapi_key'];

			//has this key been tested in the past 3 months at least?
			if (false === ($result = get_transient(md5($this->options['googlefontsapi_key'])))) {

				//We will make a secure connection to the Google Fonts API endpoint
				$curl_version = curl_version();
				$ssl_version = str_replace('OpenSSL/', '', $curl_version['ssl_version']);
				if (version_compare($curl_version['version'], '7.34.0', '>=') && version_compare($ssl_version, '1.0.1', '>=')) {
					//we should be good to go for secure SSL communication supporting TLSv1_2
					$ch = curl_init("https://www.googleapis.com/webfonts/v1/webfonts?key=" . $this->options['googlefontsapi_key']);
					curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, TRUE);
					curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
					curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
					curl_setopt($ch, CURLOPT_INTERFACE, $_SERVER['SERVER_ADDR']);
					if (ini_get('safe_mode') || ini_get('open_basedir')) {
						// safe mode is on, we can't use some settings
					} else {
						curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
						curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
					}
					$response = curl_exec($ch);
					$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
					if ($response && !curl_errno($ch) && $status == 200) {
						//let's see what was returned, and if it's what we're looking for
						$json_response = json_decode($response);
						if ($json_response !== null && json_last_error() === JSON_ERROR_NONE) {
							//So far so good, let's keep these results for other functions to access

							if (property_exists($json_response, "kind") && $json_response->kind == "webfonts#webfontList" && property_exists($json_response, "items")) {
								$this->gfonts_weblist = $json_response;
								$result = "SUCCESS";
							}
						} else {
							$result = "JSON_ERROR";
						}
					} else {
						if (!$response) {
							/* translators: refers to the outcome of the communication with the Google Fonts API as a boolean value */
							$this->gfontsAPI_errors[] = __("Response from curl request is false", "bibleget-io");
						}
						if (curl_errno($ch)) {
							$this->gfontsAPI_errors[] = curl_error($ch);
						}
						if ($status != 200) {
							if ($status == 403) {
								$this->gfontsAPI_errors[] = $status;
							} else {
								/* translators: refers to the status of the http response during communication with the Google Fonts API */
								$this->gfontsAPI_errors[] = __("Status", "bibleget-io") . " = " . $status;
							}
						}
						$result = "CURL_ERROR";
					}
					curl_close($ch);
				} else {
					//we're not going anywhere here, can't make a secure connection to the google fonts api
					$result = "REQUEST_NOT_SENT";
				}
			} else {
				//we have a previously saved api key which has been tested
				//$result is not false
				global $wpdb;
				$transientKey = md5($this->options['googlefontsapi_key']);
				$transient_timeout = $wpdb->get_col("
                  SELECT option_value
                  FROM $wpdb->options
                  WHERE option_name
                  LIKE '%_transient_timeout_$transientKey%'
                ");
				$this->gfontsAPIkeyTimeOut = $transient_timeout[0];
			}
		} else {
			//we don't have a previously saved api key, but really who cares
		}

		$this->gfontsAPIkeyCheckResult = $result;
		return $result;
	}

	public function store_gfonts_preview()
	{
		check_ajax_referer('store_gfonts_preview_nonce', 'security', TRUE); //no need for an "if", it will die if not valid
		//$this->gfonts_weblist contains $json_response, no need to retrieve from the javascript ajax data!
		$returnInfo = new stdClass();
		$thisfamily = "";
		$familyurlname = "";
		$familyfilename = "";
		$errorinfo = array();
		$gfontsDir = WP_PLUGIN_DIR . "/bibleget-io/gfonts_preview/";
		$gfontsWeblist = new stdClass();

		if (file_exists($gfontsDir . "gfontsWeblist.json")) {
			$gfontsWeblistFile = file_get_contents($gfontsDir . "gfontsWeblist.json");
			$gfontsWeblist = json_decode($gfontsWeblistFile);
		}
		if (isset($_POST["gfontsCount"], $_POST["batchLimit"], $_POST["startIdx"], $_POST["lastBatchLimit"], $_POST["numRuns"], $_POST["currentRun"]) && property_exists($gfontsWeblist, "items")) {
			$gfontsCount = intval($_POST["gfontsCount"]);
			$batchLimit = intval($_POST["batchLimit"]);
			$startIdx = intval($_POST["startIdx"]);
			$lastBatchLimit = intval($_POST["lastBatchLimit"]);
			$numRuns = intval($_POST["numRuns"]);
			$currentRun = intval($_POST["currentRun"]);
			$totalFonts = (count($gfontsWeblist->items) > 0) ? count($gfontsWeblist->items) : false;
			$errorinfo[] = "totalFonts according to the server script = " . $totalFonts;
		} else {
			$errorinfo[] = "We do not seem to have received all the necessary data... Request received: " . print_r($_POST, true);
			echo json_encode($errorinfo);
			wp_die();
		}

		$plugin_path = "";
		if (get_filesystem_method() === 'direct') {
			$creds = request_filesystem_credentials(site_url() . '/wp-admin/', '', false, false, array());
			/* initialize the API */
			if (WP_Filesystem($creds)) {
				global $wp_filesystem;
				$plugin_path = str_replace(ABSPATH, $wp_filesystem->abspath(), plugin_dir_path(__FILE__));

				foreach ($gfontsWeblist->items as $idx => $googlefont) {
					if ($idx >= $startIdx && $idx < ($startIdx + $batchLimit)) {
						$thisfamily = $googlefont->family;
						$familyurlname = preg_replace('/\s+/', '+', $thisfamily);
						$familyfilename = preg_replace('/\s+/', '', $thisfamily);
						$errorinfo[] = "Now dealing with font-family " . $thisfamily;
						$fnttype = 'ttf'; //'woff', 'woff2', 'ttf'

						if (!file_exists($gfontsDir . "{$familyfilename}.{$fnttype}")) { //$idx < $idxlimit &&
							$ch2 = curl_init("https://fonts.googleapis.com/css2?family={$familyurlname}&text={$familyfilename}");
							curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, TRUE);
							curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, 2);
							curl_setopt($ch2, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
							curl_setopt($ch2, CURLOPT_RETURNTRANSFER, TRUE);
							curl_setopt($ch2, CURLOPT_INTERFACE, $_SERVER['SERVER_ADDR']);
							if (ini_get('safe_mode') || ini_get('open_basedir')) {
								// safe mode is on, we can't use some settings
							} else {
								curl_setopt($ch2, CURLOPT_FOLLOWLOCATION, TRUE);
								curl_setopt($ch2, CURLOPT_AUTOREFERER, TRUE);
							}
							$response2 = curl_exec($ch2);
							$status2 = (int) curl_getinfo($ch2, CURLINFO_HTTP_CODE);
							$returnInfo->httpStatus2 = $status2;
							if ($response2 && !curl_errno($ch2) && $status2 == 200) {
								if (preg_match('/url\((.*?)\)/', $response2, $match) == 1) {
									$thisfonturl = $match[1];
									$errorinfo[] = "font retrieval url for {$thisfamily} = {$thisfonturl}";

									//                         $ch3_headers = [];
									$ch3 = curl_init($thisfonturl);
									curl_setopt($ch3, CURLOPT_SSL_VERIFYPEER, TRUE);
									curl_setopt($ch3, CURLOPT_SSL_VERIFYHOST, 2);
									curl_setopt($ch3, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
									curl_setopt($ch3, CURLOPT_RETURNTRANSFER, TRUE);
									curl_setopt($ch3, CURLOPT_INTERFACE, $_SERVER['SERVER_ADDR']);
									//declaring acceptance of woff2 will make it possible to download the compressed version of the font with only the requested characters
									//however it seems that the actual returned font will still be in ttf format, even though it is reduced to the requested characters
									curl_setopt($ch3, CURLOPT_HTTPHEADER, array("Accept: font/woff2", "Content-type: font/ttf"));
									if (ini_get('safe_mode') || ini_get('open_basedir')) {
										// safe mode is on, we can't use some settings
									} else {
										curl_setopt($ch3, CURLOPT_FOLLOWLOCATION, TRUE);
										curl_setopt($ch3, CURLOPT_AUTOREFERER, TRUE);
									}
									$response3 = curl_exec($ch3);
									//                $errorinfo[] = print_r($ch3_headers,TRUE);
									$status3 = (int) curl_getinfo($ch3, CURLINFO_HTTP_CODE);
									$returnInfo->httpStatus3 = $status3;
									if ($response3 && !curl_errno($ch3) && $status3 == 200) {
										if ($wp_filesystem) {
											//                                 if(!file_exists($plugin_path . "gfonts_preview/{$familyfilename}.{$fnttype}") ){
											if (!$wp_filesystem->put_contents(
												$gfontsDir . "{$familyfilename}.{$fnttype}",
												$response3,
												FS_CHMOD_FILE
											)) {
												$errorinfo[] = "Cannot write file " . $plugin_path . "gfonts_preview/{$familyfilename}.{$fnttype} with wordpress filesystem api, sorry";
											} else {
												$gfont_stylesheet = preg_replace('/url\((.*?)\)/', 'url(' . esc_url(plugins_url("gfonts_preview/{$familyfilename}.{$fnttype}", __FILE__)) . ')', $response2);
												if (!file_exists($plugin_path . "css/gfonts_preview/{$familyfilename}.css")) {
													if (!$wp_filesystem->put_contents(
														$plugin_path . "css/gfonts_preview/{$familyfilename}.css",
														$gfont_stylesheet,
														FS_CHMOD_FILE
													)) {
														$errorinfo[] = "Cannot write file " . $plugin_path . "css/gfonts_preview/{$familyfilename}.css with wordpress filesystem api, sorry";
													}
												}
											}
										}
									} else {
										if (!$response3) {
											$errorinfo[] = "Response from curl request 3 is false for font-family {$thisfamily}";
										}
										if (curl_errno($ch3)) {
											$errorinfo[] = "Error on curl request 3 for font-family {$thisfamily}: " . curl_error($ch);
										}
										if ($status3 != 200) {
											$errorinfo[] = "Status on curl request 3 for font-family {$thisfamily}: " . $status3;
										}
									}
								}
							} else {
								if (!$response2) {
									$errorinfo[] = "Response from curl request 2 is false for font-family {$thisfamily}";
								}
								if (curl_errno($ch2)) {
									$errorinfo[] = "Error on curl request 2 for font-family {$thisfamily}: " . curl_error($ch);
								}
								if ($status2 != 200) {
									$errorinfo[] = "Status on curl request 2 for font-family {$thisfamily}: " . $status2;
								}
							}
						} else {
							$errorinfo[] = "File " . $familyfilename . ".{$fnttype} already exists";
						}
					}
				}
			} else {
				$errorinfo[] = "Could not initialize wordpress filesystem with these credentials";
			}
		} else {
			$errorinfo[] = "You do not have direct access permissions to the wordpress filesystem";
		}


		//         echo print_r($errorinfo);
		if (($startIdx + ($batchLimit - 1)) < ($totalFonts - 1)) {
			$returnInfo->state = "RUN_PROCESSED";
			$returnInfo->run = $currentRun;
		} else {
			$returnInfo->state = "COMPLETE";

			//LAST STEP IS TO MINIFY ALL OF THE CSS FILES INTO ONE SINGLE FILE
			$cssdirectory = WP_PLUGIN_DIR . "/bibleget-io/css/gfonts_preview";
			if (!file_exists($cssdirectory . "/gfonts_preview.css")) {
				$cssfiles = array_diff(scandir($cssdirectory), array('..', '.'));

				$minifier = new MatthiasMullie\Minify\CSS($cssdirectory . "/" . (array_shift($cssfiles)));
				while (count($cssfiles) > 0) {
					$minifier->add($cssdirectory . "/" . (array_shift($cssfiles)));
				}
				$minifier->minify($cssdirectory . "/gfonts_preview.css");
			}
		}

		if (count($errorinfo) > 0) {
			$returnInfo->errorinfo = array();
			$returnInfo->errorinfo = $errorinfo;
		} else {
			$returnInfo->errorinfo = false;
		}

		echo json_encode($returnInfo);
		wp_die();
	}

	/**
	 *
	 */
	public function bibleGetForceRefreshGFontsResults()
	{
		check_ajax_referer('refresh_gfonts_results_nonce', 'security', TRUE); //no need for an "if", it will die if not valid
		if (isset($_POST["gfontsApiKey"]) && $_POST["gfontsApiKey"] != "") {
			if (get_transient(md5($_POST["gfontsApiKey"]))) {
				delete_transient(md5($_POST["gfontsApiKey"]));
				echo 'TRANSIENT_DELETED';
				wp_die();
			}
		}
		echo 'NOTHING_TO_DO';
		wp_die();
	}

	public function bibleget_plugin_settings_save()
	{
		//print("\n Page with hook ".$this->options_page_hook." was loaded and load hook was called.");
		//exit;
		if (isset($_GET['settings-updated']) && $_GET['settings-updated']) {
			//plugin settings have been saved. Here goes your code
			$this->options = get_option('bibleget_settings');
			if ($this->options === false) {
				// let's set some default options
			}
		}
	}

	public static function Sortify($string)
	{
		return preg_replace('~&([a-z]{1,2})(acute|cedil|circ|grave|lig|orn|ring|slash|tilde|uml);~i', '$1' . chr(255) . '$2', htmlentities($string, ENT_QUOTES, 'UTF-8'));
	}
}


/**
 * Contains methods for customizing the theme customization screen.
 *
 * @link http://codex.wordpress.org/Theme_Customization_API
 * @since BibleGet I/O 3.6
 */
class BibleGet_Customize
{

	public static $bibleget_style_settings;
	private static $websafe_fonts;

	public static function init()
	{

		/* Define object that will contain all the information for all settings and controls */
		self::$bibleget_style_settings = new stdClass();

		/* Define bibleget_fontfamily setting and control */
		self::$bibleget_style_settings->bibleget_fontfamily = new stdClass();
		self::$bibleget_style_settings->bibleget_fontfamily->dfault = 'Palatino Linotype';
		self::$bibleget_style_settings->bibleget_fontfamily->title = __('Font', "bibleget-io");
		self::$bibleget_style_settings->bibleget_fontfamily->type = 'fontselect';
		self::$bibleget_style_settings->bibleget_fontfamily->section = 'bibleget_paragraph_style_options';

		/* Define bibleget_borderwidth setting and control */
		self::$bibleget_style_settings->bibleget_borderwidth = new stdClass();
		self::$bibleget_style_settings->bibleget_borderwidth->dfault = '2';
		/* translators: "px" refers to the unit "pixels" as used in CSS rules, do not translate */
		self::$bibleget_style_settings->bibleget_borderwidth->title = __('Border-width (in px)', "bibleget-io");
		self::$bibleget_style_settings->bibleget_borderwidth->type = 'number';
		self::$bibleget_style_settings->bibleget_borderwidth->section = 'bibleget_paragraph_style_options';

		/* Define bibleget_borderstyle setting and control */
		self::$bibleget_style_settings->bibleget_borderstyle = new stdClass();
		self::$bibleget_style_settings->bibleget_borderstyle->dfault = 'solid';
		self::$bibleget_style_settings->bibleget_borderstyle->title = __('Border-style', "bibleget-io");
		self::$bibleget_style_settings->bibleget_borderstyle->type = 'select';
		self::$bibleget_style_settings->bibleget_borderstyle->choices = array(
			"none"		=> "none",
			"hidden"	=> "hidden",
			"dotted"	=> "dotted",
			"dashed"	=> "dashed",
			"solid"		=> "solid",
			"double"	=> "double",
			"groove"	=> "groove",
			"ridge"		=> "ridge",
			"inset"		=> "inset",
			"outset"	=> "outset",
			"initial"	=> "initial",
			"inherit"	=> "inherit"
		);
		self::$bibleget_style_settings->bibleget_borderstyle->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_bordercolor setting and control */
		self::$bibleget_style_settings->bibleget_bordercolor = new stdClass();
		self::$bibleget_style_settings->bibleget_bordercolor->dfault = '#d3d3d3';
		self::$bibleget_style_settings->bibleget_bordercolor->title = __('Border-color', "bibleget-io");
		self::$bibleget_style_settings->bibleget_bordercolor->type = 'color';
		self::$bibleget_style_settings->bibleget_bordercolor->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_bgcolor setting and control */
		self::$bibleget_style_settings->bibleget_bgcolor = new stdClass();
		self::$bibleget_style_settings->bibleget_bgcolor->dfault = '#ffffff';
		self::$bibleget_style_settings->bibleget_bgcolor->title = __('Background color', "bibleget-io");
		self::$bibleget_style_settings->bibleget_bgcolor->type = 'color';
		self::$bibleget_style_settings->bibleget_bgcolor->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_borderradius setting and control */
		self::$bibleget_style_settings->bibleget_borderradius = new stdClass();
		self::$bibleget_style_settings->bibleget_borderradius->dfault = 6;
		/* translators: "px" refers to the unit "pixels" as used in CSS rules, do not translate */
		self::$bibleget_style_settings->bibleget_borderradius->title = __('Border-radius (in px)', "bibleget-io");
		self::$bibleget_style_settings->bibleget_borderradius->type = 'number';
		self::$bibleget_style_settings->bibleget_borderradius->section = 'bibleget_paragraph_style_options';


		$margin_padding_vals = array(
			"auto"    => "auto",
			0         => "0",
			1         => "1",
			2         => "2",
			3         => "3",
			4         => "4",
			5         => "5",
			6         => "6",
			7         => "7",
			8         => "8",
			9         => "9",
			10         => "10",
			12         => "12",
			14         => "14",
			16         => "16",
			18         => "18",
			20         => "20"
		);


		/* Define bibleget_margintopbottom setting and control */
		self::$bibleget_style_settings->bibleget_margintopbottom = new stdClass();
		self::$bibleget_style_settings->bibleget_margintopbottom->dfault = 12;
		/* translators: "px" refers to the unit "pixels" as used in CSS rules, do not translate */
		self::$bibleget_style_settings->bibleget_margintopbottom->title = __('Margin top/bottom (in px)', "bibleget-io");
		self::$bibleget_style_settings->bibleget_margintopbottom->type = 'select';
		self::$bibleget_style_settings->bibleget_margintopbottom->choices = $margin_padding_vals;
		self::$bibleget_style_settings->bibleget_margintopbottom->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_marginleftright setting and control */
		self::$bibleget_style_settings->bibleget_marginleftright = new stdClass();
		self::$bibleget_style_settings->bibleget_marginleftright->dfault = 'auto';
		/* translators: "px" refers to pixels as used in CSS rules, do not translate */
		self::$bibleget_style_settings->bibleget_marginleftright->title = __('Margin left/right (in px)', "bibleget-io");
		self::$bibleget_style_settings->bibleget_marginleftright->type = 'select';
		self::$bibleget_style_settings->bibleget_marginleftright->choices = $margin_padding_vals;
		self::$bibleget_style_settings->bibleget_marginleftright->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_paddingtopbottom setting and control */
		self::$bibleget_style_settings->bibleget_paddingtopbottom = new stdClass();
		self::$bibleget_style_settings->bibleget_paddingtopbottom->dfault = 12;
		/* translators: "px" refers to pixels as used in CSS rules, do not translate */
		self::$bibleget_style_settings->bibleget_paddingtopbottom->title = __('Padding top/bottom (in px)', "bibleget-io");
		self::$bibleget_style_settings->bibleget_paddingtopbottom->type = 'select';
		self::$bibleget_style_settings->bibleget_paddingtopbottom->choices = $margin_padding_vals;
		self::$bibleget_style_settings->bibleget_paddingtopbottom->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_paddingleftright setting and control */
		self::$bibleget_style_settings->bibleget_paddingleftright = new stdClass();
		self::$bibleget_style_settings->bibleget_paddingleftright->dfault = 12;
		/* translators: "px" refers to pixels as used in CSS rules, do not translate */
		self::$bibleget_style_settings->bibleget_paddingleftright->title = __('Padding left/right (in px)', "bibleget-io");
		self::$bibleget_style_settings->bibleget_paddingleftright->type = 'select';
		self::$bibleget_style_settings->bibleget_paddingleftright->choices = $margin_padding_vals;
		self::$bibleget_style_settings->bibleget_paddingleftright->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_width setting and control */
		self::$bibleget_style_settings->bibleget_width = new stdClass();
		self::$bibleget_style_settings->bibleget_width->dfault = 85;
		/* translators: "%" refers to "percentage" as used in CSS rules (e.g. "width: 100%"), do not change */
		self::$bibleget_style_settings->bibleget_width->title = __('Width (in %)', "bibleget-io");
		self::$bibleget_style_settings->bibleget_width->type = 'number';
		self::$bibleget_style_settings->bibleget_width->section = 'bibleget_paragraph_style_options';


		/* Define bibleget_textalign setting and control */
		self::$bibleget_style_settings->bibleget_textalign = new stdClass();
		self::$bibleget_style_settings->bibleget_textalign->dfault = 'justify';
		self::$bibleget_style_settings->bibleget_textalign->title = __('Text-align', "bibleget-io");
		self::$bibleget_style_settings->bibleget_textalign->type = 'select';
		self::$bibleget_style_settings->bibleget_textalign->choices = array('left' => 'left', 'right' => 'right', 'center' => 'center', 'justify' => 'justify', 'inherit' => 'inherit', 'start' => 'start', 'end' => 'end');
		self::$bibleget_style_settings->bibleget_textalign->section = 'bibleget_paragraph_style_options';



		$bibleget_styles_general = new stdClass();
		$bibleget_styles_general->font_size = new stdClass();
		$bibleget_styles_general->font_style = new stdClass();
		$bibleget_styles_general->font_color = new stdClass();

		/* translators: "pt" refers to points as used in CSS rules, do not translate */
		$bibleget_styles_general->font_size->title = __("Font Size (in pt)", "bibleget-io");
		$bibleget_styles_general->font_style->title = __("Font Style", "bibleget-io");
		$bibleget_styles_general->font_color->title = __("Font Color", "bibleget-io");

		$bibleget_styles_general->font_size->type = 'select';
		$bibleget_styles_general->font_style->type = 'style';
		$bibleget_styles_general->font_color->type = 'color';

		$bibleget_style_sizes_arr = array(4 => '4', 5 => '5', 6 => '6', 7 => '7', 8 => '8', 9 => '9', 10 => '10', 11 => '11', 12 => '12', 14 => '14', 16 => '16', 18 => '18', 20 => '20', 22 => '22', 24 => '24', 26 => '26', 28 => '28');
		$bibleget_style_choices_arr = array(
			/* translators: "B" refers to "bold style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'bold'         => __("B", "bibleget-io"),
			/* translators: "I" refers to "italic style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'italic'       => __("I", "bibleget-io"),
			/* translators: "U" refers to "underline style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'underline'    => __("U", "bibleget-io"),
			/* translators: "S" refers to "strikethrough style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'strikethrough' => __("S", "bibleget-io"),
			/* translators: "SUP" refers to "superscript style text", use the corresponding abbreviation to refer to this text formatting in your language for use on a button in a button group */
			'superscript'  => __("SUP", "bibleget-io"),
			/* translators: "SUB" refers to "subscript style text", use the corresponding abbreviation to refer to this text formatting in your language for use on a button in a button group */
			'subscript'    => __("SUB", "bibleget-io")
		);

		foreach ($bibleget_styles_general as $i => $styleobj) {
			$o = str_replace("_", "", $i);

			self::$bibleget_style_settings->{'version_' . $o} = new stdClass();
			self::$bibleget_style_settings->{'version_' . $o}->section = 'bibleget_bibleversion_style_options';
			/* translators: in reference to font Size, style and color (e.g. 'font color for version indicator'). "Version" refers to the version of the Bible used for the Biblical quote. */
			self::$bibleget_style_settings->{'version_' . $o}->title = $styleobj->title . " " . __('for version indicator', "bibleget-io");
			self::$bibleget_style_settings->{'version_' . $o}->type = $styleobj->type;
			if ($styleobj->type == 'select') {
				self::$bibleget_style_settings->{'version_' . $o}->choices = $bibleget_style_sizes_arr;
			} elseif ($styleobj->type == 'style') {
				self::$bibleget_style_settings->{'version_' . $o}->choices = $bibleget_style_choices_arr;
			}

			self::$bibleget_style_settings->{'bookchapter_' . $o} = new stdClass();
			self::$bibleget_style_settings->{'bookchapter_' . $o}->section = 'bibleget_bookchapter_style_options';
			/* translators: in reference to font size, style and color (e.g. 'color for books and chapters') */
			self::$bibleget_style_settings->{'bookchapter_' . $o}->title = $styleobj->title . " " . __('for books and chapters', "bibleget-io");
			self::$bibleget_style_settings->{'bookchapter_' . $o}->type = $styleobj->type;
			if ($styleobj->type == 'select') {
				self::$bibleget_style_settings->{'bookchapter_' . $o}->choices = $bibleget_style_sizes_arr;
			} elseif ($styleobj->type == 'style') {
				self::$bibleget_style_settings->{'bookchapter_' . $o}->choices = $bibleget_style_choices_arr;
			}

			self::$bibleget_style_settings->{'versenumber_' . $o} = new stdClass();
			self::$bibleget_style_settings->{'versenumber_' . $o}->section = 'bibleget_versenumber_style_options';
			/* translators: in reference to font Size, style and color (e.g. 'style for verse numbers') */
			self::$bibleget_style_settings->{'versenumber_' . $o}->title = $styleobj->title . " " . __('for verse numbers', "bibleget-io");
			self::$bibleget_style_settings->{'versenumber_' . $o}->type = $styleobj->type;
			if ($styleobj->type == 'select') {
				self::$bibleget_style_settings->{'versenumber_' . $o}->choices = $bibleget_style_sizes_arr;
			} elseif ($styleobj->type == 'style') {
				self::$bibleget_style_settings->{'versenumber_' . $o}->choices = $bibleget_style_choices_arr;
			}

			self::$bibleget_style_settings->{'versetext_' . $o} = new stdClass();
			self::$bibleget_style_settings->{'versetext_' . $o}->section = 'bibleget_versetext_style_options';
			/* translators: in reference to font Size, style and color (e.g. 'style for text of verses') */
			self::$bibleget_style_settings->{'versetext_' . $o}->title = $styleobj->title . " " . __('for text of verses', "bibleget-io");
			self::$bibleget_style_settings->{'versetext_' . $o}->type = $styleobj->type;
			if ($styleobj->type == 'select') {
				self::$bibleget_style_settings->{'versetext_' . $o}->choices = $bibleget_style_sizes_arr;
			} elseif ($styleobj->type == 'style') {
				self::$bibleget_style_settings->{'versetext_' . $o}->choices = $bibleget_style_choices_arr;
			}
		}

		self::$bibleget_style_settings->version_fontsize->dfault = 12;
		self::$bibleget_style_settings->version_fontstyle->dfault = 'italic';
		self::$bibleget_style_settings->version_fontcolor->dfault = '#000';

		self::$bibleget_style_settings->bookchapter_fontsize->dfault = 14;
		self::$bibleget_style_settings->bookchapter_fontstyle->dfault = 'bold';
		self::$bibleget_style_settings->bookchapter_fontcolor->dfault = '#284f29';

		self::$bibleget_style_settings->versenumber_fontsize->dfault = 7;
		self::$bibleget_style_settings->versenumber_fontstyle->dfault = 'superscript';
		self::$bibleget_style_settings->versenumber_fontcolor->dfault = '#c10005';

		self::$bibleget_style_settings->versetext_fontsize->dfault = 10;
		self::$bibleget_style_settings->versetext_fontstyle->dfault = '';
		self::$bibleget_style_settings->versetext_fontcolor->dfault = '#646d73';

		self::$bibleget_style_settings->linespacing_verses = new stdClass();
		self::$bibleget_style_settings->linespacing_verses->dfault = 150;
		self::$bibleget_style_settings->linespacing_verses->title = __('Line-spacing', "bibleget-io");
		self::$bibleget_style_settings->linespacing_verses->type = 'select';
		self::$bibleget_style_settings->linespacing_verses->choices = array(100 => 'single', 150 => '1½', 200 => 'double');
		self::$bibleget_style_settings->linespacing_verses->section = 'bibleget_paragraph_style_options';

		self::$websafe_fonts = array(
			array("font-family" => "Arial", "fallback" => "Helvetica", "generic-family" => "sans-serif"),
			array("font-family" => "Arial Black", "fallback" => "Gadget", "generic-family" => "sans-serif"),
			array("font-family" => "Book Antiqua", "fallback" => "Palatino", "generic-family" => "serif"),
			array("font-family" => "Courier New", "fallback" => "Courier", "generic-family" => "monospace"),
			array("font-family" => "Georgia", "generic-family" => "serif"),
			array("font-family" => "Impact", "fallback" => "Charcoal", "generic-family" => "sans-serif"),
			array("font-family" => "Lucida Console", "fallback" => "Monaco", "generic-family" => "monospace"),
			array("font-family" => "Lucida Sans Unicode", "fallback" => "Lucida Grande", "generic-family" => "sans-serif"),
			array("font-family" => "Palatino Linotype", "fallback" => "Palatino", "generic-family" => "serif"),
			array("font-family" => "Tahoma", "fallback" => "Geneva", "generic-family" => "sans-serif"),
			array("font-family" => "Times New Roman", "fallback" => "Times", "generic-family" => "serif"),
			array("font-family" => "Trebuchet MS", "fallback" => "Helvetica", "generic-family" => "sans-serif"),
			array("font-family" => "Verdana", "fallback" => "Geneva", "generic-family" => "sans-serif")
		);
	}

	public static function get_font_index($fontfamily)
	{
		foreach (self::$websafe_fonts as $index => $font) {
			if ($font["font-family"] == $fontfamily) {
				return $index;
			}
		}
		return false;
	}

	/**
	 * This hooks into 'customize_register' (available as of WP 3.4) and allows
	 * you to add new sections and controls to the Theme Customize screen.
	 *
	 * Note: To enable instant preview, we have to actually write a bit of custom
	 * javascript. See live_preview() for more.
	 *
	 * @see add_action('customize_register',$func)
	 * @param \WP_Customize_Manager $wp_customize
	 * @link http://ottopress.com/2012/how-to-leverage-the-theme-customizer-in-your-own-themes/
	 * @since BibleGet I/O 3.6
	 */
	public static function register($wp_customize)
	{

		self::init();

		require_once 'custom_controls.php';

		$wp_customize->add_panel(
			'bibleget_style_options',
			array(
				'priority'			=> 35,
				'capability'		=> 'edit_theme_options',
				//'theme_supports'	=> '',
				'title'				=> __('BibleGet plugin styles', 'bibleget-io'), //Visible title of section
				'description'		=> __('Custom styles that apply to the text formatting of the biblical quotes', 'bibleget-io')
			)
		);

		$wp_customize->add_section(
			'bibleget_paragraph_style_options',
			array(
				'priority'			=> 10, //Determines what order this appears in
				'capability'		=> 'edit_theme_options', //Capability needed to tweak
				//'theme_supports'	=> '',
				'title'				=> __('General styles', 'bibleget-io'), //Visible title of section
				'description'		=> __('Custom styles that apply to the whole paragraphs of the biblical quotes', 'bibleget-io'),
				'panel'				=> 'bibleget_style_options'
			)
		);

		$wp_customize->add_section(
			'bibleget_bibleversion_style_options',
			array(
				'priority'			=> 20, //Determines what order this appears in
				'capability'		=> 'edit_theme_options', //Capability needed to tweak
				//'theme_supports'	=> '',
				'title'				=> __('Bible Version Styles', 'bibleget-io'), //Visible title of section
				'description'		=> __('Custom styles that apply to the reference to the version of the Bible used for the biblical quotes (e.g. NABRE)', 'bibleget-io'),
				'panel'				=> 'bibleget_style_options'
			)
		);

		$wp_customize->add_section(
			'bibleget_bookchapter_style_options',
			array(
				'priority'			=> 30, //Determines what order this appears in
				'capability'		=> 'edit_theme_options', //Capability needed to tweak
				//'theme_supports'	=> '',
				'title'				=> __('Book / Chapter styles', 'bibleget-io'), //Visible title of section
				'description'		=> __('Custom styles that apply to books and chapters in the biblical quotes', 'bibleget-io'),
				'panel'				=> 'bibleget_style_options'
			)
		);

		$wp_customize->add_section(
			'bibleget_versenumber_style_options',
			array(
				'priority'			=> 40, //Determines what order this appears in
				'capability'		=> 'edit_theme_options', //Capability needed to tweak
				//'theme_supports'	=> '',
				'title'				=> __('Verse number styles', 'bibleget-io'), //Visible title of section
				'description'		=> __('Custom styles that apply to the numbers of the verses in the biblical quotes', 'bibleget-io'),
				'panel'				=> 'bibleget_style_options'
			)
		);

		$wp_customize->add_section(
			'bibleget_versetext_style_options',
			array(
				'priority'			=> 50, //Determines what order this appears in
				'capability'		=> 'edit_theme_options', //Capability needed to tweak
				//'theme_supports'	=> '',
				'title'				=> __('Verse Text Styles', 'bibleget-io'), //Visible title of section
				'description'		=> __('Custom styles that apply to the text of the verses in the biblical quotes', 'bibleget-io'),
				'panel'				=> 'bibleget_style_options'
			)
		);

		$bibleget_style_settings_cc = 0;
		foreach (self::$bibleget_style_settings as $style_setting => $style_setting_obj) {

			//2. Register new settings to the WP database...
			$wp_customize->add_setting(
				$style_setting, //No need to use a SERIALIZED name, as `theme_mod` settings already live under one db record
				array(
					'default'    => $style_setting_obj->dfault, //Default setting/value to save
					'type'       => 'theme_mod', //Is this an 'option' or a 'theme_mod'?
					'capability' => 'edit_theme_options', //Optional. Special permissions for accessing this setting.
					'transport'  => 'postMessage' //What triggers a refresh of the setting? 'refresh' or 'postMessage' (instant)?
				)
			);

			//3. Finally, we define the control itself (which links a setting to a section and renders the HTML controls)...
			if ($style_setting_obj->type == 'color') {
				$wp_customize->add_control(
					new WP_Customize_Color_Control( //Instantiate the color control class
						$wp_customize, //Pass the $wp_customize object (required)
						$style_setting . '_ctl', //Set a unique ID for the control
						array(
							'label'      => $style_setting_obj->title, //Admin-visible name of the control
							'settings'   => $style_setting, //Which setting to load and manipulate (serialized is okay)
							'priority'   => $bibleget_style_settings_cc++, //Determines the order this control appears in for the specified section
							'section'    => $style_setting_obj->section //ID of the section this control should render in (can be one of yours, or a WordPress default section)
						)
					)
				);
			} elseif ($style_setting_obj->type == 'select') {
				$wp_customize->add_control(
					$style_setting . '_ctl',
					array(
						'label'	  	=> $style_setting_obj->title,
						'settings'	=> $style_setting,
						'priority'	=> $bibleget_style_settings_cc++,
						'section' 	=> $style_setting_obj->section,
						'type'	   	=> 'select',
						'choices' 	=> $style_setting_obj->choices
					)
				);
			} elseif ($style_setting_obj->type == 'fontselect') {
				$wp_customize->add_control(
					new BibleGet_Customize_FontSelect_Control(
						$wp_customize,
						$style_setting . '_ctl',
						array(
							'label'	  	=> $style_setting_obj->title,
							'settings'	=> $style_setting,
							'priority'	=> $bibleget_style_settings_cc++,
							'section' 	=> $style_setting_obj->section
							//'choices' 	=> $style_setting_obj->choices
						)
					)
				);
			} elseif ($style_setting_obj->type == 'style') {
				$wp_customize->add_control(
					new BibleGet_Customize_StyleBar_Control(
						$wp_customize,
						$style_setting . '_ctl',
						array(
							'label'	  	=> $style_setting_obj->title,
							'settings'	=> $style_setting,
							'priority'	=> $bibleget_style_settings_cc++,
							'section' 	=> $style_setting_obj->section,
							'choices'   => $style_setting_obj->choices
						)
					)
				);
			} elseif ($style_setting_obj->type == 'number') {
				$wp_customize->add_control(
					$style_setting . '_ctl',
					array(
						'label'       => $style_setting_obj->title,
						'settings'    => $style_setting,
						'priority'    => $bibleget_style_settings_cc++,
						'section'     => $style_setting_obj->section,
						'type'        => 'number'
					)
				);
			}
		}
	}

	/**
	 * This will output the custom WordPress settings to the live theme's WP head.
	 *
	 * Used by hook: 'wp_head'
	 *
	 * @see add_action('wp_head',$func)
	 * @since BibleGet I/O 3.6
	 */
	public static function header_output()
	{
		self::init();
	?>
		<!--Customizer CSS-->
		<?php $is_googlefont = false;
		$mod = get_theme_mod('bibleget_fontfamily', self::$bibleget_style_settings->bibleget_fontfamily->dfault);
		//echo '<!-- mod variable = '.$mod.' -->';
		if (!empty($mod)) {
			//let's check if it's a websafe font or a google font
			if (self::get_font_index($mod) === false) {
				//not a websafe font, so most probably a google font...
				//TODO: add a double check against current google fonts here before proceeding?
				$is_googlefont = true;
				echo '<link href="https://fonts.googleapis.com/css?family=' . $mod . '" rel="stylesheet" type="text/css" />';
			}
		}
		?>
		<style type="text/css" id="bibleGetDynamicStylesheet"><?php
			echo PHP_EOL;
			if ($is_googlefont && !empty($mod)) {
				$t = explode(":", $mod);
				$ff = preg_replace("/[\+|:]/", " ", $t[0]);
				$cssrule = sprintf('%s { %s:%s; }', 'div.results', 'font-family', "'" . $ff . "'");
				echo $cssrule;
			} else {
				self::generate_css('div.results', 'font-family',	'bibleget_fontfamily');
			}
			echo PHP_EOL;

			self::generate_css('div.results', 'border-width',		'bibleget_borderwidth', '', 'px');
			echo PHP_EOL;
			self::generate_css('div.results', 'border-style',		'bibleget_borderstyle');
			echo PHP_EOL;
			self::generate_css('div.results', 'border-color', 	'bibleget_bordercolor');
			echo PHP_EOL;
			self::generate_css('div.results', 'background-color',	'bibleget_bgcolor');
			echo PHP_EOL;
			self::generate_css('div.results', 'border-radius',	'bibleget_borderradius', '', 'px');
			echo PHP_EOL;
			self::generate_css('div.results', 'width',			'bibleget_width', '', '%');
			echo PHP_EOL;
			$mod = get_theme_mod('bibleget_margintopbottom', self::$bibleget_style_settings->bibleget_margintopbottom->dfault);
			$cssrule = '';
			if (!empty($mod)) {
				$cssrule = sprintf(
					'%s { %s:%s; }',
					'div.results',
					'margin-top',
					($mod == 'auto' ? $mod : $mod . 'px')
					//number_format(($mod / 10),1,'.','').'em'
				);
				echo $cssrule;
				echo PHP_EOL;
				$cssrule = sprintf(
					'%s { %s:%s; }',
					'div.results',
					'margin-bottom',
					($mod == 'auto' ? $mod : $mod . 'px')
					//number_format(($mod / 10),1,'.','').'em'
				);
				echo $cssrule;
				echo PHP_EOL;
			}

			$mod = get_theme_mod('bibleget_marginleftright', self::$bibleget_style_settings->bibleget_marginleftright->dfault);
			$cssrule = '';
			if (!empty($mod)) {
				$cssrule = sprintf(
					'%s { %s:%s; }',
					'div.results',
					'margin-left',
					($mod == 'auto' ? $mod : $mod . 'px')
					//number_format(($mod / 10),1,'.','').'em'
				);
				echo $cssrule;
				echo PHP_EOL;
				$cssrule = sprintf(
					'%s { %s:%s; }',
					'div.results',
					'margin-right',
					($mod == 'auto' ? $mod : $mod . 'px')
					//number_format(($mod / 10),1,'.','').'em'
				);
				echo $cssrule;
				echo PHP_EOL;
			}

			$mod = get_theme_mod('bibleget_paddingtopbottom', self::$bibleget_style_settings->bibleget_paddingtopbottom->dfault);
			$cssrule = '';
			if (!empty($mod)) {
				$cssrule = sprintf(
					'%s { %s:%s; }%s { %s:%s; }',
					'div.results',
					'padding-top',
					($mod == 'auto' ? $mod : $mod . 'px'),
					PHP_EOL . 'div.results',
					'padding-bottom',
					($mod == 'auto' ? $mod : $mod . 'px')
				);
				echo $cssrule;
				echo PHP_EOL;
			}

			$mod = get_theme_mod('bibleget_paddingleftright', self::$bibleget_style_settings->bibleget_paddingleftright->dfault);
			$cssrule = '';
			if (!empty($mod)) {
				$cssrule = sprintf(
					'%s { %s:%s; }%s { %s:%s; }',
					'div.results',
					'padding-left',
					($mod == 'auto' ? $mod : $mod . 'px'),
					PHP_EOL . 'div.results',
					'padding-right',
					($mod == 'auto' ? $mod : $mod . 'px')
				);
				echo $cssrule;
				echo PHP_EOL;
			}
			self::generate_css('div.results p.versesParagraph', 'text-align', 'bibleget_textalign');
			echo PHP_EOL;
			self::generate_css('div.results p.bibleVersion', 'color', 'version_fontcolor');
			echo PHP_EOL;
			self::generate_css('div.results .bookChapter', 'color', 'bookchapter_fontcolor');
			echo PHP_EOL;
			self::generate_css('div.results p.versesParagraph', 'color', 'versetext_fontcolor');
			echo PHP_EOL;
			self::generate_css('div.results p.versesParagraph span.verseNum', 'color', 'versenumber_fontcolor');
			echo PHP_EOL;
			echo 'div.results p.versesParagraph span.verseNum { margin: 0px 3px; }';
			echo PHP_EOL;
			$fontsizerules = array(
				'version_fontsize'		=> 'div.results p.bibleVersion',
				'bookchapter_fontsize'	=> 'div.results .bookChapter',
				'versetext_fontsize'	=> 'div.results p.versesParagraph',
				'versenumber_fontsize'	=> 'div.results p.versesParagraph span.verseNum'
			);
			foreach ($fontsizerules as $fontsizerule => $css_selector) {
				$mod = get_theme_mod($fontsizerule, self::$bibleget_style_settings->$fontsizerule->dfault);
				$cssrule = '';
				if (!empty($mod)) {
					$cssrule = sprintf(
						'%s { %s:%s; }',
						$css_selector,
						'font-size',
						$mod . 'pt'
						//number_format(($mod / 10),1,'.','').'em'
					);
					echo $cssrule;
					echo PHP_EOL;
				}
			}


			$fontstylerules = array(
				'version_fontstyle'		=> 'div.results p.bibleVersion',
				'bookchapter_fontstyle' => 'div.results .bookChapter',
				'versetext_fontstyle'	=> 'div.results p.versesParagraph',
				'versenumber_fontstyle' => 'div.results p.versesParagraph span.verseNum'
			);
			foreach ($fontstylerules as $fontstylerule => $css_selector) {
				$cssrule = '';
				$mod = get_theme_mod($fontstylerule, self::$bibleget_style_settings->$fontstylerule->dfault);
				$fval = array();
				if (!empty($mod)) {
					$fval = explode(',', $mod);

					if (in_array('bold', $fval)) {
						$cssrule .= 'font-weight:bold;';
					} else {
						$cssrule .= 'font-weight:normal;';
					}

					if (in_array('italic', $fval)) {
						$cssrule .= 'font-style:italic;';
					} else {
						$cssrule .= 'font-style:normal;';
					}

					if (in_array('underline', $fval)) {
						$cssrule .= 'text-decoration:underline;';
					} elseif (in_array('strikethrough', $fval)) {
						$cssrule .= 'text-decoration:line-through;';
					} else {
						$cssrule .= 'text-decoration:none;';
					}

					if (in_array('superscript', $fval)) {
						$cssrule .= 'vertical-align:baseline;position:relative;top:-0.6em;';
					} elseif (in_array('subscript', $fval)) {
						$cssrule .= 'vertical-align:baseline;position:relative;top:0.6em;';
					} else {
						$cssrule .= 'vertical-align:baseline;position:static;';
					}

					echo sprintf('%s { %s }', $css_selector, $cssrule);
					echo PHP_EOL;
				}
				unset($fval);
			}

			self::generate_css('div.results p.versesParagraph', 'line-height', 'linespacing_verses', '', '%');
			echo PHP_EOL;

			$linespacing_verses = get_theme_mod('linespacing_verses', self::$bibleget_style_settings->linespacing_verses->dfault);
			$fontsize_versenumber = get_theme_mod('versenumber_fontsize', self::$bibleget_style_settings->versenumber_fontsize->dfault);
			echo "div.results p.versesParagraph span.sm { text-transform: lowercase; font-variant: small-caps; } ";
			echo PHP_EOL;
			echo '/* Senseline. A line that is broken to be reading aloud/public speaking. Poetry is included in this category. */';
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.pof { display: block; text-indent: 0; margin-top:1em; margin-left:5%; line-height: $linespacing_verses" . "%; }";
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.po { display: block; margin-left:5%; margin-top:-1%; line-height: $linespacing_verses" . "%; }";
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.pol { display: block; margin-left:5%; margin-top:-1%; margin-bottom:1em; line-height: $linespacing_verses" . "%; }";
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.pos { display: block; margin-top:1em; margin-left:5%; line-height: $linespacing_verses" . "%; }";
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.poif { display: block; margin-left:7%; margin-top:1%; line-height: $linespacing_verses" . "%; }";
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.poi { display: block; margin-left:7%; margin-top:-1%; line-height: $linespacing_verses" . "%; }";
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.poil { display: block; margin-left:7%; margin-bottom:1%; line-height: $linespacing_verses" . "%; }";
			echo PHP_EOL;
			echo "div.results p.versesParagraph span.speaker { font-weight: bold; background-color: #eeeeee; padding: 3px; border-radius: 3px; font-size: $fontsize_versenumber" . "pt; }";
			echo PHP_EOL;

			$bibleversionalign = get_theme_mod('bibleversionalign', 'left');
			echo "div.results p.bibleVersion { text-align: $bibleversionalign; }";
			echo PHP_EOL;

			$bookchapteralign = get_theme_mod('bookchapteralign', 'left');
			echo "div.results .bookChapter { text-align: $bookchapteralign; }";
			echo PHP_EOL;

			echo "div.results span.bookChapter { margin-left: 12px; }"; //will only apply when bottom-inline
			echo PHP_EOL;
			?>
		</style>
		<!--/Customizer CSS-->
<?php
	}

	public static function bibleget_customizer_print_script($hook)
	{
		//can load custom scripts here...
	}

	/**
	 * This outputs the javascript needed to automate the live settings preview.
	 * Also keep in mind that this function isn't necessary unless your settings
	 * are using 'transport'=>'postMessage' instead of the default 'transport'
	 * => 'refresh'
	 *
	 * Used by hook: 'customize_preview_init'
	 *
	 * @see add_action('customize_preview_init',$func)
	 * @since BibleGet I/O 3.6
	 */
	public static function live_preview()
	{
		wp_enqueue_script(
			'bibleget-pluginstylecustomizer', // Give the script a unique ID
			plugins_url('js/theme-customizer.js', __FILE__), // Define the path to the JS file
			array('jquery', 'customize-preview'), // Define dependencies
			'', // Define a version (optional)
			true // Specify whether to put in footer (leave this true)
		);
	}

	/**
	 * This will generate a line of CSS for use in header output. If the setting
	 * ($mod_name) has no defined value, the CSS will not be output.
	 *
	 * @uses get_theme_mod()
	 * @param string $selector CSS selector
	 * @param string $style The name of the CSS *property* to modify
	 * @param string $mod_name The name of the 'theme_mod' option to fetch
	 * @param string $prefix Optional. Anything that needs to be output before the CSS property
	 * @param string $postfix Optional. Anything that needs to be output after the CSS property
	 * @param bool $echo Optional. Whether to print directly to the page (default: true).
	 * @return string Returns a single line of CSS with selectors and a property.
	 * @since BibleGet I/O 3.6
	 */
	public static function generate_css($selector, $style, $mod_name, $prefix = '', $postfix = '', $echoback = true)
	{
		$returnval = '';
		$mod = get_theme_mod($mod_name, self::$bibleget_style_settings->$mod_name->dfault);
		if (!empty($mod)) {
			$returnval = sprintf(
				'%s { %s:%s; }',
				$selector,
				$style,
				$prefix . $mod . $postfix
			);
			if ($echoback) {
				echo $returnval;
			}
		}
		return $returnval;
	}
}
