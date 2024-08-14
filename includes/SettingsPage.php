<?php
/**
 * Admin menu page with relative settings
 *
 * @package BibleGet
 */

namespace BibleGet;

use BibleGet\Enums\LangCodes;
use BibleGet\Plugin;
use MatthiasMullie\Minify\CSS;

/**
 * Admin menu page with relative settings
 *
 * @var array $options
 * @var $options_page_hook
 */
class SettingsPage {

	/**
	 * Holds the plugin options, which contain metadata about the supported Bible versions and relative indexes as well as user preferences for layout and formatting of Bible quotes.
	 *
	 * @var array $options
	 */
	private $options;

	/**
	 * Stores the options page hook.
	 *
	 * @var string $options_page_hook
	 */
	private $options_page_hook;

	/**
	 * The locale of the current site (two letter ISO code).
	 *
	 * @var string $locale
	 */
	private $locale;

	/**
	 * Stores the supported Bible versions by language.
	 *
	 * @var array $bible_versions_by_lang
	 */
	private $bible_versions_by_lang;

	/**
	 * Count of Bible versions by language.
	 *
	 * @var int $bible_versions_by_langcount
	 */
	private $bible_versions_by_langcount;

	/**
	 * Count of languages of supported Bible versions.
	 *
	 * @var int $bible_version_langs_count
	 */
	private $bible_version_langs_count;

	/**
	 * Holds the list of languages in which the BibleGet API can understand the names of the books of the Bible.
	 *
	 * @var array $bible_books_langs
	 */
	private $bible_books_langs;

	/**
	 * A list of Google Fonts that are available.
	 *
	 * @var array $gfonts_weblist
	 */
	private $gfonts_weblist;

	/**
	 * The API key for accessing Google Fonts.
	 *
	 * @var string $gfonts_api_key
	 */
	private $gfonts_api_key;

	/**
	 * The timeout duration for the Google Fonts API key.
	 *
	 * @var int $gfonts_api_key_timeout
	 */
	private $gfonts_api_key_timeout;

	/**
	 * Errors related to the Google Fonts API.
	 *
	 * @var array $gfonts_api_errors
	 */
	private $gfonts_api_errors;

	/**
	 * The result of the Google Fonts API key validation check.
	 *
	 * @var string|false $gfonts_api_key_check_result
	 */
	private $gfonts_api_key_check_result;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->locale                      = substr( apply_filters( 'plugin_locale', get_locale(), 'bibleget-io' ), 0, 2 );
		$this->gfonts_weblist              = new \stdClass();
		$this->options                     = get_option( 'bibleget_settings' );
		$this->gfonts_api_key              = '';
		$this->gfonts_api_key_timeout      = 0;
		$this->gfonts_api_key_check_result = false;
		$this->gfonts_api_errors           = [];
		$this->bible_versions_by_lang      = $this->prepare_versions_by_lang(); // will now be an array with both versions and langs properties.
		$this->bible_version_langs_count   = count( $this->bible_versions_by_lang['versions'] );
		$this->bible_versions_by_langcount = $this->count_versions_by_lang();
		$this->bible_books_langs           = $this->prepare_bible_books_langs();
	}

	/**
	 * Initialize admin menu and settings and check gfonts api key
	 */
	public function init() {
		Plugin::write_log( __METHOD__ );
		add_action( 'admin_menu', [ $this, 'add_plugin_page' ] );
		add_action( 'admin_init', [ $this, 'register_settings' ] );

		/**
		 * If I understand correctly, ajax function callbacks need to be registered even before enqueue_scripts
		 *  so let's pull it out of admin_print_scripts and place it here even before enqueue_scripts is called.
		 * This will change the transient set, it cannot happen in gfonts_api_key_check which is called on any admin interface.
		 * We will have to leave the transient set to admin_print_scripts.
		 * We can either check directly the return value of the script as we are doing here,
		 *  or check the value as stored in the class private variable $this->gfonts_api_key_check_result.
		*/
		switch ( $this->gfonts_api_key_check() ) {
			case 'SUCCESS':
				// the gfonts_api_key is set, and transient has been set and successful call made to the google fonts API.
				set_time_limit( 180 );
				add_action( 'wp_ajax_store_gfonts_preview', [ $this, 'store_gfonts_preview' ] );
				add_action( 'wp_ajax_bibleget_refresh_gfonts', [ $this, 'force_refresh_gfonts_results' ] );
				// enqueue and localize will be done in enqueue_scripts.
				break;
			/*
			case "CURL_ERROR":
				break;
			case "JSON_ERROR":
				break;
			case "REQUEST_NOT_SENT":
				break;
			case "REQUEST_NOT_SUCCESSFUL":
				break;
			case false:
				//the gfonts_api_key is not set, so let's just not do anything, ok
				break;
			*/
		}

		add_action( 'admin_enqueue_scripts', [ $this, 'admin_print_styles' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'admin_print_scripts' ] );
		add_action( 'load-' . $this->options_page_hook, [ $this, 'bibleget_plugin_settings_save' ] );
	}

	/**
	 * Get an array of supported Bible versions sorted by language.
	 *
	 * @return array
	 */
	public function get_versions_by_lang() {
		Plugin::write_log( __METHOD__ );
		return $this->bible_versions_by_lang;
	}

	/**
	 * Get the list of languages in which the BibleGet endpoint can understand the names of the books of the Bible.
	 * The language names are translated into the current locale.
	 * (For just the English names, use get_option("bibleget_languages") rather than this function ).
	 *
	 * @return array
	 */
	public function prepare_bible_books_langs() {
		Plugin::write_log( __METHOD__ );
		$bible_books_langs_arr = [];
		$bible_books_langs     = get_option( 'bibleget_languages' );
		if (
			false === $bible_books_langs
			|| false === is_array( $bible_books_langs )
			|| count( $bible_books_langs ) < 1
		) {
			// these if conditions shouldn't ever verify, but if they were to be true, can we call global function from here?
			Plugin::write_log( __METHOD__ . ' It would seem that we do not have metadata about the languages in which the BibleGet API can understand the names of the books of the Bible. Now trying to set options...' );
			Plugin::set_options();
			$bible_books_langs = get_option( 'bibleget_languages' );
		}

		// We will try to translate each of the language names if possible.
		foreach ( $bible_books_langs as $biblebookslang ) {
			if ( extension_loaded( 'intl' ) === true ) {
				// Get the two letter ISO code based on the language name in English.
				$bible_books_locale = array_search( $biblebookslang, LangCodes::ISO_639_1, true );
				// Get the translated display name that corresponds to the two letter ISO code.
				$lang = \Locale::getDisplayLanguage( $bible_books_locale, $this->locale );
				array_push( $bible_books_langs_arr, $lang );
			} else {
				// If we can't get the two letter ISO code for this language, we will just use the English version we have.
				array_push( $bible_books_langs_arr, $biblebookslang );
			}
		}

		if ( extension_loaded( 'intl' ) === true ) {
			collator_asort( collator_create( 'root' ), $bible_books_langs_arr );
		} else {
			array_multisort( array_map( 'self::sortify', $bible_books_langs_arr ), $bible_books_langs_arr );
		}
		return $bible_books_langs_arr;
	}

	/**
	 * Prepare an array of Bible versions sorted by language.
	 *
	 * @return array
	 */
	public function prepare_versions_by_lang() {
		Plugin::write_log( __METHOD__ );
		$versions               = get_option( 'bibleget_versions', [] );
		$bible_versions_by_lang = [];
		$langs                  = [];
		if ( count( $versions ) < 1 ) {
			Plugin::set_options();
			$versions = get_option( 'bibleget_versions', [] );
		}
		foreach ( $versions as $abbr => $versioninfo ) {
			$info     = explode( '|', $versioninfo );
			$fullname = $info[0];
			$year     = $info[1];
			// do our best to translate the language name.
			if ( extension_loaded( 'intl' ) === true ) {
				$lang = \Locale::getDisplayLanguage( $info[2], $this->locale );
			} else {
				// but if we can't, just use the english version that we have.
				$lang = LangCodes::ISO_639_1[ $info[2] ]; // this gives the english correspondent of the two letter ISO code.
			}

			if ( isset( $bible_versions_by_lang[ $lang ] ) ) {
				if ( ! isset( $bible_versions_by_lang[ $lang ][ $abbr ] ) ) {
					$bible_versions_by_lang[ $lang ][ $abbr ] = [
						'fullname' => $fullname,
						'year'     => $year,
					];
				}
			} else {
				$bible_versions_by_lang[ $lang ] = [];
				array_push( $langs, $lang );
				$bible_versions_by_lang[ $lang ][ $abbr ] = [
					'fullname' => $fullname,
					'year'     => $year,
				];
			}
		}

		if ( extension_loaded( 'intl' ) === true ) {
			collator_asort( collator_create( 'root' ), $langs );
		} else {
			array_multisort( array_map( 'self::sortify', $langs ), $langs );
		}

		return [
			'versions' => $bible_versions_by_lang,
			'langs'    => $langs
		];
	}

	/**
	 * Count total languages of all supported Bible versions.
	 *
	 * @return int
	 */
	public function count_versions_by_lang() {
		Plugin::write_log( __METHOD__ );
		$counter = 0;
		foreach ( $this->bible_versions_by_lang['versions'] as $lang => $versionbylang ) {
			ksort( $this->bible_versions_by_lang['versions'][ $lang ] );
			$counter += count( $this->bible_versions_by_lang['versions'][ $lang ] );
		}
		return $counter;
	}

	/**
	 * Get translated names of Bible books
	 *
	 * @param string $lang Will typically be the language of the WordPress interface, can be two letter ISO code or full language name.
	 * @return \stdClass
	 */
	public function get_bible_book_names_in_lang( $lang = null ) {
		Plugin::write_log( __METHOD__ );
		if ( null === $lang ) {
			$lang = $this->locale;
		}
		if ( strlen( $lang ) === 2 ) {
			// We have a two-letter ISO code, we need to get the full language name in English.
			if ( extension_loaded( 'intl' ) === true ) {
				$lang = \Locale::getDisplayLanguage( $lang, 'en' );
			} else {
				// this gives the English correspondent of the two letter ISO code.
				$lang = LangCodes::ISO_639_1[ $lang ];
			}
		}

		// We probably have a full language name now if we didn't before
		// Let's get the index from the supported languages.
		if ( strlen( $lang ) > 2 ) {
			$bible_books_langs = get_option( 'bibleget_languages' );
			$idx               = array_search( $lang, $bible_books_langs, true );
			if ( false === $idx ) {
				$idx = array_search( 'English', $bible_books_langs, true );
			}
			// we can start getting our return info ready.
			$bible_books           = new \stdClass();
			$bible_books->fullname = [];
			$bible_books->abbrev   = [];
			for ( $i = 0; $i < 73; $i++ ) {
				$jsbook = json_decode( get_option( 'bibleget_biblebooks' . $i ), true );
				array_push( $bible_books->fullname, $jsbook[ $idx ][0] );
				array_push( $bible_books->abbrev, $jsbook[ $idx ][1] );
			}
			return $bible_books;
		}
		return false;
	}

	/**
	 * Add options page
	 */
	public function add_plugin_page() {
		Plugin::write_log( __METHOD__ );
		// This page will be under "Settings".
		$this->options_page_hook = add_options_page(
			__( 'BibleGet I/O Settings', 'bibleget-io' ),  // $page_title.
			'BibleGet I/O',                                // $menu_title.
			'manage_options',                              // $capability.
			'bibleget-settings-admin',                     // $menu_slug (Page ID).
			[ $this, 'create_admin_page' ]                 // Callback Function.
		);
	}

	/**
	 * Register and add settings
	 */
	public function register_settings() {
		Plugin::write_log( __METHOD__ );

		register_setting(
			'bibleget_settings_options', // Option group.
			'bibleget_settings',         // Option name.
			[ $this, 'sanitize' ]   // Sanitize.
		);

		add_settings_section(
			'bibleget_settings_section2',                // Section ID.
			__( 'Preferences Settings', 'bibleget-io' ), // Title.
			[ $this, 'print_section_info2' ],       // Callback.
			'bibleget-settings-admin'                    // Page.
		);

		add_settings_field(
			'favorite_version',
			__( 'Preferred version or versions (when not indicated in shortcode)', 'bibleget-io' ),
			[ $this, 'favorite_version_callback' ],
			'bibleget-settings-admin',
			'bibleget_settings_section2'
		);

		add_settings_field(
			'googlefontsapi_key',
			__( 'Google Fonts API key (for updated font list)', 'bibleget-io' ),
			[ $this, 'googlefontsapikey_callback' ],
			'bibleget-settings-admin',
			'bibleget_settings_section2'
		);
	}

	/**
	 * Enqueue admin page styles
	 *
	 * @param string $hook Admin settings page hook.
	 */
	public function admin_print_styles( $hook ) {
		if ( 'settings_page_bibleget-settings-admin' !== $hook ) {
			return;
		}

		Plugin::write_log( __METHOD__ );
		$dir       = __DIR__;
		$admin_css = '../css/admin.css';
		wp_enqueue_style(
			'bibleget-admin-css',
			plugins_url( $admin_css, __FILE__ ),
			false,
			filemtime( "$dir/$admin_css" )
		);
	}

	/**
	 * Enqueue admin page scripts
	 *
	 * @param string $hook Admin settings page hook.
	 */
	public function admin_print_scripts( $hook ) {
		if ( 'settings_page_bibleget-settings-admin' !== $hook ) {
			return;
		}

		Plugin::write_log( __METHOD__ );
		$dir      = __DIR__;
		$admin_js = '../js/admin.js';
		wp_register_script(
			'bibleget-admin-js',
			plugins_url( $admin_js, __FILE__ ),
			[ 'jquery' ],
			filemtime( "$dir/$admin_js" ),
			true
		);
		$thisoptions = get_option( 'bibleget_settings' );
		$myoptions   = [];
		if ( $thisoptions ) {
			foreach ( $thisoptions as $key => $option ) {
				$myoptions[ $key ] = esc_attr( $option );
			}
		}
		$obj = [
			'options'    => $myoptions,
			'ajax_url'   => admin_url( 'admin-ajax.php' ),
			'ajax_nonce' => wp_create_nonce( 'bibleget-data' )
		];
		wp_localize_script( 'bibleget-admin-js', 'bibleGetOptionsFromServer', $obj );
		wp_enqueue_script( 'bibleget-admin-js' );

		if ( 'SUCCESS' === $this->gfonts_api_key_check_result ) {
			// We only want the transient to be set from the bibleget settings page, so we wait until now
			// instead of doing it in the gfonts_api_key_check (which is called on any admin interface).
			set_transient(
				md5( $this->options['googlefontsapi_key'] ),
				$this->gfonts_api_key_check_result,
				90 * 24 * HOUR_IN_SECONDS
			); // 90 giorni

			if ( get_filesystem_method() === 'direct' ) {
				$gfonts_dir = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/';
				$creds      = request_filesystem_credentials( site_url() . '/wp-admin/', '', false, false, [] );
				if ( WP_Filesystem( $creds ) ) {
					global $wp_filesystem;
					if ( ! $wp_filesystem->is_dir( $gfonts_dir ) ) {
						// directory didn't exist, so let's create it.
						if ( $wp_filesystem->mkdir( $gfonts_dir ) === false ) {
							$this->gfonts_api_errors[] = 'Could not create directory gfonts_preview';
						} else {
							// let's make sure the necessary subfolders are also created.
							if ( ! $wp_filesystem->is_dir( $gfonts_dir . 'ttf/' ) ) {
								if ( $wp_filesystem->mkdir( $gfonts_dir . 'ttf/' ) === false ) {
									$this->gfonts_api_errors[] = 'Could not create directory gfonts_preview/ttf';
								}
							}
							if ( ! $wp_filesystem->is_dir( $gfonts_dir . 'css/' ) ) {
								if ( $wp_filesystem->mkdir( $gfonts_dir . 'css/' ) === false ) {
									$this->gfonts_api_errors[] = 'Could not create directory gfonts_preview/css';
								}
							}
						}
					}

					// let's also cache the results from the Google Fonts API in a local file so we don't have to keep calling.
					if ( $wp_filesystem->put_contents(
						$gfonts_dir . 'gfontsWeblist.json',
						wp_json_encode( $this->gfonts_weblist ),
						FS_CHMOD_FILE // predefined mode settings for WP files.
					) === false ) {
						Plugin::write_log( __METHOD__ . ' Could not write file gfonts_preview/gfontsWeblist.json' );
						$this->gfonts_api_errors[] = 'Could not write file gfonts_preview/gfontsWeblist.json';
					}
				} else {
					Plugin::write_log( __METHOD__ . ' Could not initialize WordPress filesystem with these credentials' );
					$this->gfonts_api_errors[] = 'Could not initialize WordPress filesystem with these credentials';
				}
			} else {
				Plugin::write_log( __METHOD__ . ' You do not have direct access permissions to the WordPress filesystem' );
				$this->gfonts_api_errors[] = 'You do not have direct access permissions to the WordPress filesystem';
			}
			if ( count( $this->gfonts_api_errors ) > 0 ) {
				add_action(
					'admin_notices',
					function () {
						printf(
							'<div class="%1$s"><p>%2$s</p></div>',
							esc_attr( 'notice notice-error' ),
							esc_html(
								__( 'Impossible to write data to the BibleGet plugin directory, please check permissions!', 'bibleget-io' )
								. "\n" . implode( "\n", $this->gfonts_api_errors )
							)
						);
					}
				);
			}
			wp_enqueue_script( 'jquery-ui-progressbar' );
			wp_enqueue_script( 'jquery-ui-dialog' );
			wp_enqueue_style( 'wp-jquery-ui-progressbar' );
			wp_enqueue_style( 'wp-jquery-ui-dialog' );
			$store_gfonts_arr = [
				'job' => [
					'gfontsPreviewJob'   => (bool) true,
					'gfontsNonce'        => wp_create_nonce( 'store_gfonts_preview_nonce' ),
					'gfontsRefreshNonce' => wp_create_nonce( 'refresh_gfonts_results_nonce' ),
					'ajax_url'           => admin_url( 'admin-ajax.php' ),
					'gfontsWeblist'      => $this->gfonts_weblist,
					'gfontsApiKey'       => $this->options['googlefontsapi_key'],
					'gfonts_api_errors'  => wp_json_encode( $this->gfonts_api_errors ),
					'max_execution_time' => ini_get( 'max_execution_time' ),
				],
			];
			wp_localize_script( 'bibleget-admin-js', 'gfontsBatch', $store_gfonts_arr );
		}
	}

	/**
	 * Admin settings page callback
	 */
	public function create_admin_page() {
		Plugin::write_log( __METHOD__ );

		// populate $this->bible_books_langs and $this->bible_versions_by_lang and $this->bible_versions_by_langcount
		// based on current WordPress locale
		// $this->bible_versions_by_lang = $this->get_versions_by_lang(); //already done in constructor?

		// HTML of the main section of the options page.
		?>
		<div id="page-wrap">
			<h2 id="bibleget-h2"><?php esc_html_e( 'BibleGet I/O Settings', 'bibleget-io' ); ?></h2>
			<div id="form-wrapper">
				<form method="post" action="options.php">
					<?php
					// This prints out all hidden settings fields.
					settings_fields( 'bibleget_settings_options' );   // $option_group -> match group name in register_setting()
					// This prints out all visible settings fields
					do_settings_sections( 'bibleget-settings-admin' ); // $page_slug
					// Since this is all one form, any other button within this area
					// will be treated as a submit button,
					// so try to avoid using buttons in any html markup
					submit_button();
					?>
				</form>
			</div>
			<div class="page-clear"></div>

			<hr>
			<!-- Here is a section outside of the defined options,
					which let's us know what Bible versions and languages are currently supported
					by the BibleGet service endpoint -->
			<div id="bibleget-settings-container">
				<div id="bibleget-settings-contents">
					<h3><?php esc_html_e( 'Current BibleGet I/O engine information:', 'bibleget-io' ); ?></h3>
					<ol type="A">
						<li>
						<?php
							// This if condition should be superfluous, but just to be sure nothing goes awry...
						if ( $this->bible_versions_by_langcount < 1 || $this->bible_version_langs_count < 1 ) {
							echo 'Seems like the version info was not yet initialized. Now attempting to initialize...';
							$this->bible_versions_by_lang = $this->get_versions_by_lang();
						}
							$b1      = '<b class="bibleget-dynamic-data">';
							$b2      = '</b>';
							$string1 = $b1 . $this->bible_versions_by_langcount . $b2;
							$string2 = $b1 . $this->bible_version_langs_count . $b2;
							$msg     = sprintf(
								/* translators: please do not change the placeholders %s, they will be substituted dynamically by values in the script. See http://php.net/printf. */
								__( 'The BibleGet I/O engine currently supports %1$s versions of the Bible in %2$s different languages.', 'bibleget-io' ),
								$string1,
								$string2
							);
							echo esc_html( $msg ) . '<br />';
							esc_html_e( 'List of currently supported Bible versions, subdivided by language:', 'bibleget-io' );
							echo '<div class="bibleget-dynamic-data-wrapper"><ol id="versionlangs-ol">';
							$cc = 0;
						foreach ( $this->bible_versions_by_lang['langs'] as $lang ) {
							echo '<li>-' . esc_html( $lang ) . '-<ul>';
							foreach ( $this->bible_versions_by_lang['versions'][ $lang ] as $abbr => $value ) {
								echo '<li>'
									. esc_html(
										( ++$cc ) . ') ' . $abbr . ' — ' . $value['fullname']
										. ' (' . $value['year'] . ')'
									)
									. '</li>';
							}
							echo '</ul></li>';
						}
							echo '</ol></div>';
						?>
							</li>
						<li>
						<?php
							$string3 = $b1 . count( $this->bible_books_langs ) . $b2;
							$msg     = sprintf(
								/* translators: please do not change the placeholders %s, it will be substituted dynamically by values in the script. See http://php.net/printf. */
								__( 'The BibleGet I/O engine currently understands the names of the books of the Bible in %s different languages:', 'bibleget-io' ),
								$string3
							);
							echo esc_html( $msg ) . '<br />';
							echo '<div class="bibleget-dynamic-data-wrapper">' . esc_html( implode( ', ', $this->bible_books_langs ) ) . '</div>';
						?>
							</li>
					</ol>
					<div class="flexcontainer">
						<div class="flexitem">
							<p><?php esc_html_e( 'This information from the BibleGet server is cached locally to improve performance. If new versions have been added to the BibleGet server or new languages are supported, this information might be outdated. In that case you can click on the button below to renew the information.', 'bibleget-io' ); ?></p>
							<button id="bibleget-server-data-renew-btn" class="button button-secondary"><?php
								esc_html_e( 'RENEW INFORMATION FROM BIBLEGET SERVER', 'bibleget-io' );
							?></button>
						</div>
						<div class="flexitem">
							<p><?php
								esc_html_e( 'If there has been a recent update to the plugin with new functionality, or a recent update to the BibleGet endpoint engine, you may have to flush the cached Bible quotes in order for any new functionalities to work correctly. The cached Bible quotes will be emptied on their own within a week; click here in order to flush them immediately. However use with caution: the BibleGet endpoint imposes a hard limit of 30 requests in a two day period day for the same Bible quote, and 100 requests in a two day period for different Bible quotes. If you have a large number of Bible quotes in your articles and pages, make sure you are not over the limit, otherwise you may start seeing empty Bible quotes appear on your website.', 'bibleget-io' );
							?></p>
							<button id="bibleget-cache-flush-btn" class="button button-secondary"><?php
								esc_html_e( 'FLUSH CACHED BIBLE QUOTES', 'bibleget-io' );
							?></button>
						</div>
					</div>
				</div>
				<div id="bibleget_ajax_spinner"><img src="<?php echo esc_url( admin_url( 'images/wpspin_light-2x.gif' ) ); ?>" /></div>
			</div>
			<div class="page-clear"></div>
			<hr>
			<?php
			$locale = apply_filters( 'plugin_locale', get_locale(), 'bibleget-io' );
			// let's keep the image files to the general locale, so we don't have to make a different image for every specific country locale...
			if ( strpos( $locale, '_' ) !== false ) {
				$locale_lang = explode( '_', $locale )[0];
			} else {
				$locale_lang = $locale;
			}
			if ( file_exists( plugins_url( '../images/btn_donateCC_LG' . ( $locale_lang ? '-' . $locale_lang : '' ) . '.gif', __FILE__ ) ) ) {
				$donate_img = plugins_url( '../images/btn_donateCC_LG' . ( $locale_lang ? '-' . $locale_lang : '' ) . '.gif', __FILE__ );
			} else {
				$donate_img = plugins_url( '../images/btn_donateCC_LG.gif', __FILE__ );
			}
			?>
			<div id="bibleget-donate">
				<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HDS7XQKGFHJ58">
					<button><img src="<?php echo esc_html( $donate_img ); ?>" /></button>
				</a>
			</div>
		</div>
		<div id="bibleget-settings-notification">
			<span class="bibleget-settings-notification-dismiss"><a title="dismiss this notification">x</a></span>
		</div>
		<?php
	}


	/**
	 * Sanitize each setting field as needed
	 *
	 * @param array $input Contains all settings fields as array keys.
	 */
	public function sanitize( $input ) {
		Plugin::write_log( __METHOD__ );
		$new_input = [];
		if ( isset( $input['favorite_version'] ) ) {
			$new_input['favorite_version'] = sanitize_text_field( $input['favorite_version'] );
		}
		if ( isset( $input['googlefontsapi_key'] ) ) {
			$new_input['googlefontsapi_key'] = sanitize_text_field( $input['googlefontsapi_key'] );
		}

		return $new_input;
	}

	/**
	 * Print the Section text
	 */
	public function print_section_info2() {
		Plugin::write_log( __METHOD__ );
		esc_html_e( 'Choose your preferences to facilitate the usage of the shortcode:', 'bibleget-io' );
	}

	/**
	 * Save option for preferred Bible version.
	 */
	public function favorite_version_callback() {
		Plugin::write_log( __METHOD__ );
		// double check to see if the values have been set.
		if ( $this->bible_versions_by_langcount < 1 || $this->bible_version_langs_count < 1 ) {
			$this->bible_versions_by_lang = $this->get_versions_by_lang();
		}

		$counter = ( $this->bible_versions_by_langcount + $this->bible_version_langs_count );
		// $size    = $counter < 10 ? $counter : 10;
		echo '<select id="versionselect" size=' . intval( $counter ) . ' multiple>';

		$langs                  = $this->bible_versions_by_lang['langs'];
		$bible_versions_by_lang = $this->bible_versions_by_lang['versions'];
		$bget                   = get_option( 'BGET', [] );
		if ( false === isset( $bget['VERSION'] ) ) {
			$bget['VERSION'] = [ 'NABRE' ];
		}
		foreach ( $langs as $lang ) {
			echo '<optgroup label="-' . esc_html( $lang ) . '-">';
			foreach ( $bible_versions_by_lang[ $lang ] as $abbr => $value ) {
				$selectedstr = '';
				if ( in_array( $abbr, $bget['VERSION'], true ) ) {
					$selectedstr = ' SELECTED';
				}
				echo '<option value="' . esc_html( $abbr ) . '"' . esc_html( $selectedstr ) . '>'
					. esc_html( $abbr . ' — ' . $value['fullname'] . ' (' . $value['year'] . ')' )
					. '</option>';
			}
			echo '</optgroup>';
		}
		echo '</select>';
		echo '<br /><i>'
			. esc_html( __( 'In order to select multiple items, hold down CTRL key (Command key on Mac) while clicking items.', 'bibleget-io' ) )
			. '</i>';
	}

	/**
	 * Save option for Google Fonts API key
	 */
	public function googlefontsapikey_callback() {
		Plugin::write_log( __METHOD__ );

		echo '<label for="googlefontsapi_key">' . esc_html( __( 'Google Fonts API Key', 'bibleget-io' ) )
			. ' <input type="text" id="googlefontsapi_key" name="bibleget_settings[googlefontsapi_key]" value="' . esc_html( $this->gfonts_api_key ) . '" size="50" />'
			. '</label>';
		if ( $this->gfonts_api_key_check_result ) {
			switch ( $this->gfonts_api_key_check_result ) {
				case 'CURL_ERROR':
					/* translators: refers to the outcome of the validity check of the Google Fonts API key */
					echo '<span style="color:DarkViolet;font-weight:bold;margin-left:12px;">'
						. esc_html( __( 'CURL ERROR WHEN SENDING REQUEST', 'bibleget-io' ) )
						. '</span><br />';
					foreach ( $this->gfonts_api_errors as $er ) {
						if ( 403 === $er ) {
							echo '<br /><i style="color:DarkViolet;margin-left:12px;">';
							echo esc_html( __( "This server's IP address has not been given access to the Google Fonts API using this key.", 'bibleget-io' ) );
							echo ' ';
							echo esc_html( __( 'Please verify that access has been given to the correct IP addresses.', 'bibleget-io' ) );
							echo ' ';
							printf(
								/* translators: 1. <span id="biblegetGFapiKeyRetest">, 2. </span> */
								esc_html( __( 'Once you are sure that this has been fixed you may %1$s click here %2$s to retest the key (you may need to wait a few minutes for the settings to take effect in the Google Cloud Console).', 'bibleget-io' ) ),
								'<span id="biblegetGFapiKeyRetest">',
								'</span>'
							);
							echo '</i>';
						}
						echo '<br /><i style="color:DarkViolet;margin-left:12px;">' . intval( $er ) . '</i>';
					}
					break;
				case 'JSON_ERROR':
					echo '<span style="color:Orange;font-weight:bold;margin-left:12px;">'
						/* translators: refers to the outcome of the validity check of the Google Fonts API key */
						. esc_html( __( 'NO VALID JSON RESPONSE', 'bibleget-io' ) )
						. '</span><br />';
					break;
				case 'REQUEST_NOT_SENT':
					echo '<span style="color:Red;font-weight:bold;margin-left:12px;">'
						/* translators: refers to the outcome of the validity check of the Google Fonts API key */
						. esc_html( __( 'SERVER UNABLE TO MAKE REQUESTS', 'bibleget-io' ) )
						. '</span><br />';
					break;
				case 'SUCCESS':
				default:
					// Let's transform the transient timeout into a human readable format.

					$d1 = new \DateTime(); // timestamp set to current time.
					$d2 = new \DateTime();
					$d2->setTimestamp( $this->gfonts_api_key_timeout );
					$diff                     = $d2->diff( $d1 );
					$gfonts_api_key_time_left = $diff->m . ' months, ' . $diff->d . ' days';
					$time_left                = [];
					if ( $diff->m > 0 ) {
						$time_left[] = ( $diff->m . ' ' . _n( 'month', 'months', $diff->m, 'bibleget-io' ) );
					}
					if ( $diff->d > 0 ) {
						$time_left[] = ( $diff->d . ' ' . _n( 'day', 'days', $diff->d, 'bibleget-io' ) );
					}

					$gfonts_api_key_time_left = ( count( $time_left ) > 0 )
						? '[' . implode( ', ', $time_left ) . ']'
						: '[0 ' . _n( 'day', 'days', 2, 'bibleget-io' ) . ']';

					/* translators: refers to the outcome of the validity check of the Google Fonts API key */
					echo '<span style="color:Green;font-weight:bold;margin-left:12px;">'
						. esc_html( __( 'VALID', 'bibleget-io' ) )
						. '</span><br />';
					echo ' <i>' . esc_html(
						sprintf(
							/* translators: period of time (month, days, hours, minutes) until next sync with the Google Fonts API */
							__( 'Google Fonts API refresh scheduled in: %s', 'bibleget-io' ),
							$gfonts_api_key_time_left
						)
					);
					echo ' ' . sprintf(
						/* translators: 1. html span open, 2. html span close */
						esc_html( __( 'OR %1$s Click here %2$s to force refresh the list of fonts from the Google Fonts API', 'bibleget-io' ) ),
						'<span id="biblegetForceRefreshGFapiResults">',
						'</span>'
					);
					echo '</i>';
					break;
			}
		} else {
			echo '<br /><i>' .
				esc_html( __( 'If you would like to use a Google Font that is not already included in the list of available fonts, you should use a Google Fonts API key.', 'bibleget-io' ) ) .
				' ' . esc_html( __( 'If you do not yet have a Google Fonts API Key, you can get one here', 'bibleget-io' ) ) .
				': <a href="https://developers.google.com/fonts/docs/developer_api">https://developers.google.com/fonts/docs/developer_api</a>' .
				' ' . esc_html( __( "If you choose to apply restrictions to your api key, choose 'IP Addresses (web servers, cron jobs etc)'", 'bibleget-io' ) ) .
				' ' . esc_html( __( 'and if you restrict to specific IP addresses be sure to include any and all IP addresses that this server may use', 'bibleget-io' ) ) .
				', ' . sprintf(
					/* translators: %s = $_SERVER['SERVER_ADDR'] */
					esc_html( __( 'specifically the ip address found in the %s variable (it may take a few minutes to be effective).', 'bibleget-io' ) ),
					'&#x24;&#x5F;SERVER&#x5B;&#x27;SERVER&#x5F;ADDR&#x27;&#x5D;'
				) .
				' ' . esc_html( __( 'A successful key will be cached and retested every 3 months.', 'bibleget-io' ) ) .
				' ' . esc_html( __( 'Please note that this may have a little bit of an impact on the loading performance of your WordPress Customizer.', 'bibleget-io' ) ) .
				' ' . esc_html( __( 'If you notice that it becomes too sluggish, you had best leave this field empty.', 'bibleget-io' ) ) .
				'<br /> (' . sprintf(
					/* translators: 1. $_SERVER['SERVER_ADDR'], 2. <span>, 3. </span> */
					esc_html( __( 'To see the value of the %1$s variable on your server %2$s Press here %3$s', 'bibleget-io' ) ),
					'&#x24;&#x5F;SERVER&#x5B;&#x27;SERVER&#x5F;ADDR&#x27;&#x5D;',
					'<span id="biblegetio_reveal_server_variable" tabindex="0">',
					'</span>'
				) .
				'<span id="biblegetio_hidden_server_variable"> [' .
				( isset( $_SERVER['SERVER_ADDR'] ) ? esc_html( sanitize_text_field( wp_unslash( $_SERVER['SERVER_ADDR'] ) ) ) : 'N/A' ) .
				'] )</span>' .
				'</i>';
		}
	}

	/**
	 * Check whether the server IP address is a localhost address.
	 *
	 * @param string $ip Current IP address of the server.
	 * @return bool
	 */
	private static function is_local_ip( $ip ) {
		Plugin::write_log( __METHOD__ );
		$is_local = false;
		if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
			$ip_num = ip2long( $ip );
			if (
				( $ip_num >= 167772160 && $ip_num <= 184549375 )   // 10.0.0.0 – 10.255.255.255
				||
				( $ip_num >= 2886729728 && $ip_num <= 2887778303 ) // 172.16.0.0 – 172.31.255.255
				||
				( $ip_num >= 3232235520 && $ip_num <= 3232301055 ) // 192.168.0.0 – 192.168.255.255
			) {
				$is_local = true;
			}
		} elseif ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6 ) ) {
			if ( '::1' === $ip ) {
				$is_local = true;
			}
		}
		return $is_local;
	}

	/**
	 * Set CURLOPT_INTERFACE to use the current server IP address.
	 * Needed when the Google Fonts API key is restricted to specific IP addresses.
	 *
	 * @param \CurlHandle $handle The cURL handle.
	 */
	public static function set_curl_interface( $handle ) {
		Plugin::write_log( __METHOD__ );
		if ( isset( $_SERVER['SERVER_ADDR'] ) ) {
			$addr = sanitize_text_field( wp_unslash( $_SERVER['SERVER_ADDR'] ) );
			if ( false === self::is_local_ip( $addr ) ) {
				//phpcs:ignore WordPress.WP.AlternativeFunctions.curl_curl_setopt
				curl_setopt( $handle, CURLOPT_INTERFACE, $addr );
				Plugin::write_log( __METHOD__ . " cURL option CURLOPT_INTERFACE set to IP {$addr}" );
			}
		}
	}

	/**
	 * Check if a Google Fonts API key has been set and is validated
	 *
	 * @return string|false
	 */
	public function gfonts_api_key_check() {
		Plugin::write_log( __METHOD__ );
		$result                  = false;
		$this->gfonts_api_errors = []; // we want to start with a clean slate.
		if ( isset( $this->options['googlefontsapi_key'] ) && '' !== $this->options['googlefontsapi_key'] ) {
			$this->gfonts_api_key = $this->options['googlefontsapi_key'];
			Plugin::write_log( __METHOD__ . " We have a Google Fonts API key: {$this->gfonts_api_key}" );

			// has this key been tested in the past 3 months at least?
			$transient = get_transient( md5( $this->options['googlefontsapi_key'] ) );
			if ( false === $transient ) {
				Plugin::write_log( __METHOD__ . ' The Google Fonts API key has not been tested in the past 3 months' );
				$notices = get_option( 'bibleget_error_admin_notices', [] );

				// We will make a secure connection to the Google Fonts API endpoint.
				$request = 'https://www.googleapis.com/webfonts/v1/webfonts?key=' . $this->options['googlefontsapi_key'];
				add_action( 'http_api_curl', [ 'BibleGet\SettingsPage', 'set_curl_interface' ] );
				$response = wp_remote_get( $request );
				remove_action( 'http_api_curl', [ 'BibleGet\SettingsPage', 'set_curl_interface' ] );
				if ( is_wp_error( $response ) ) {
					$notices[] = 'BIBLEGET ERROR: <span style="color:Red;font-weight:bold;">'
						. sprintf(
							/* translators: %s = error message placeholder, do not translate */
							__( 'There was an error communicating with the Google Webfonts API: %s.', 'bibleget-io' ),
							$response->get_error_message()
						)
						. '</span>';
					update_option( 'bibleget_error_admin_notices', $notices );
					Plugin::write_log( __METHOD__ . ' Request to Google Fonts API ended in failure' );
					// Plugin::write_log( $response );.
					$result = 'CURL_ERROR';
				} else {
					Plugin::write_log( __METHOD__ . ' Request to Google Fonts API did not end in failure' );
					// Plugin::write_log( $response );.
				}
				$status = wp_remote_retrieve_response_code( $response );
				$body   = wp_remote_retrieve_body( $response );
				if ( 200 === $status ) {
					$json_response = json_decode( $body );
					if ( null !== $json_response && JSON_ERROR_NONE === json_last_error() ) {
						// So far so good, let's keep these results for other functions to access.
						if (
							property_exists( $json_response, 'kind' )
							&& 'webfonts#webfontList' === $json_response->kind
							&& property_exists( $json_response, 'items' )
						) {
							$this->gfonts_weblist = $json_response;
							$result               = 'SUCCESS';
						}
					} else {
						$msg       = JSON_ERROR_NONE !== json_last_error()
							? json_last_error_msg()
							: 'Response was null';
						$notices[] = 'BIBLEGET ERROR: <span style="color:Red;font-weight:bold;">'
							. sprintf(
								/* translators: %s = error message placeholder, do not translate */
								__( 'There was an error decoding the JSON response from the Google Webfonts API: %s.', 'bibleget-io' ),
								$msg
							)
							. '</span>';
						update_option( 'bibleget_error_admin_notices', $notices );
						return 'JSON_ERROR';
					}
				} else {
					Plugin::write_log( __METHOD__ . " HTTP status code of the request to the Google Fonts API key: $status" );
					if ( 429 === $status ) {
						$json_response = json_decode( $body );
						$notices[]     = 'BIBLEGET ERROR: <span style="color:Red;font-weight:bold;">'
							. sprintf(
								/* translators: */
								__( 'Could not retrieve Webfonts from the Google Fonts API, too many requests: %s.' ),
								$json_response->error->message
							)
							. '</span>';
						update_option( 'bibleget_error_admin_notices', $notices );
						$result = 'REQUEST_NOT_SUCCESSFUL';
					}
				}
			} else {
				// We have a previously saved api key which has been tested.
				global $wpdb;
				// The transient is set to a value of 'SUCCESS', just as if we had made a successful API call.
				// So setting $result to $transient means we will have a $result === 'SUCCESS'.
				$result                       = $transient;
				$transient_key                = md5( $this->options['googlefontsapi_key'] );
				$transient_timeout            = $wpdb->get_col(
					"
				  SELECT option_value
				  FROM $wpdb->options
				  WHERE option_name
				  LIKE '%_transient_timeout_$transient_key%'
				"
				);
				$this->gfonts_api_key_timeout = $transient_timeout[0];
				Plugin::write_log( __METHOD__ . " We have a Google Fonts API key that has been tested within the past 3 months, current timeout is {$this->gfonts_api_key_timeout}" );
			}
		} else {
			Plugin::write_log( __METHOD__ . ' We do not have a Google Fonts API key' );
		}

		$this->gfonts_api_key_check_result = $result;
		if ( $result ) {
			Plugin::write_log( __METHOD__ . " Result of the Google Fonts API key check: $result" );
		}
		return $result;
	}

	/**
	 * Download a preview of Google Fonts locally.
	 */
	public function store_gfonts_preview() {
		Plugin::write_log( __METHOD__ );
		check_ajax_referer( 'store_gfonts_preview_nonce', 'security', true );
		$thisfamily          = '';
		$familyurlname       = '';
		$familyfilename      = '';
		$errorinfo           = [];
		$gfonts_dir          = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/';
		$gfonts_weblist_file = $gfonts_dir . 'gfontsWeblist.json';
		$gfonts_weblist      = new \stdClass();
		$return_info         = new \stdClass();

		if ( false === file_exists( $gfonts_weblist_file ) ) {
			Plugin::write_log( __METHOD__ . " File $gfonts_weblist_file not found." );
			$errorinfo[] = "File $gfonts_weblist_file not found.";
			echo wp_json_encode( $errorinfo );
			wp_die();
		}
		try {
			$gfonts_weblist_file_contents = file_get_contents( $gfonts_weblist_file );
		} catch ( \Exception $ex ) {
			Plugin::write_log( __METHOD__ . " There was an exception while trying to get contents of file $gfonts_weblist_file: {$ex->getMessage()}" );
		}
		if ( false === $gfonts_weblist_file_contents ) {
			Plugin::write_log( __METHOD__ . " Could not read file $gfonts_weblist_file" );
			$errorinfo[] = "Could not read file $gfonts_weblist_file.";
			echo wp_json_encode( $errorinfo );
			wp_die();
		}
		$gfonts_weblist = json_decode( $gfonts_weblist_file_contents );
		if ( JSON_ERROR_NONE !== json_last_error() ) {
			Plugin::write_log( __METHOD__ . " There was an error decoding $gfonts_weblist_file." );
			$errorinfo[] = "There was an error decoding $gfonts_weblist_file.";
			echo wp_json_encode( $errorinfo );
			wp_die();
		}
		if (
			isset(
				$_POST['gfontsCount'],
				$_POST['batchLimit'],
				$_POST['startIdx'],
				$_POST['lastBatchLimit'],
				$_POST['numRuns'],
				$_POST['currentRun']
			) && property_exists( $gfonts_weblist, 'items' ) ) {
			// We don't actually use $_POST["gfontsCount"] here, it's taken care of on the javascript side.
			$batch_limit = intval( $_POST['batchLimit'] );
			$start_idx   = intval( $_POST['startIdx'] );
			// We don't actually use $_POST["lastBatchLimit"] here, it's taken care of on the javascript side.
			// We don't actually use $_POST["numRuns"] here, it's taken care of on the javascript side.
			$current_run = intval( $_POST['currentRun'] );
			$total_fonts = ( count( $gfonts_weblist->items ) > 0 ) ? count( $gfonts_weblist->items ) : false;
			$errorinfo[] = 'totalFonts according to the server script = ' . $total_fonts;
			Plugin::write_log( __METHOD__ . " Decoded $total_fonts font items from file $gfonts_weblist_file" );
		} else {
			Plugin::write_log( __METHOD__ . ' We do not seem to have received all the necessary data... Request received:' );
			Plugin::write_log( $_POST );
			Plugin::write_log( __METHOD__ . ' Request expected to have properties: gfontsCount, batchLimit, startIdx, lastBatchLimit, numRuns, currentRun; and gfonts_weblist expected to have property `items`.' );
			$errorinfo[] = 'We do not seem to have received all the necessary data... Request received: ' . wp_json_encode( $_POST );
			echo wp_json_encode( $errorinfo );
			wp_die();
		}

		if ( get_filesystem_method() === 'direct' ) {
			$creds = request_filesystem_credentials( site_url() . '/wp-admin/', '', false, false, [] );
			/* initialize the API */
			if ( WP_Filesystem( $creds ) ) {
				global $wp_filesystem;

				foreach ( $gfonts_weblist->items as $idx => $googlefont ) {
					if ( $idx >= $start_idx && $idx < ( $start_idx + $batch_limit ) ) {
						$thisfamily     = $googlefont->family;
						$familyurlname  = preg_replace( '/\s+/', '+', $thisfamily );
						$familyfilename = preg_replace( '/\s+/', '', $thisfamily );
						$errorinfo[]    = 'Now dealing with font-family ' . $thisfamily;
						$fnttype        = 'woff2'; // possible types are 'woff', 'woff2', and 'ttf'.
						if ( ! file_exists( $gfonts_dir . "ttf/{$familyfilename}.{$fnttype}" ) ) {
							Plugin::write_log( __METHOD__ . " Font file ttf/{$familyfilename}.{$fnttype} not found, now attempting to download stylesheet..." );
							$request2                   = "https://fonts.googleapis.com/css2?family={$familyurlname}&text={$familyfilename}";
							$args2                      = [
								'headers' => [
									'Accept'     => '*/*',
									'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
								]
							];
							$response2                  = wp_remote_get( $request2, $args2 );
							$status2                    = wp_remote_retrieve_response_code( $response2 );
							$return_info->http_status_2 = $status2;
							if ( is_wp_error( $response2 ) ) {
								$errorinfo[] = "Response from request for font-family {$thisfamily} resulted in error: " . $response2->get_error_message();
								Plugin::write_log( __METHOD__ . " Response from request for font-family {$thisfamily} resulted in error: " . $response2->get_error_message() );
							} elseif ( 200 === $status2 ) {
								$body2 = wp_remote_retrieve_body( $response2 );
								Plugin::write_log( __METHOD__ . " Response from request for font-family {$thisfamily} was successful: " );
								Plugin::write_log( $body2 );
								if ( 1 === preg_match( '/url\((.*?)\)/', $body2, $match ) ) {
									$thisfonturl = $match[1];
									$errorinfo[] = "font retrieval url for {$thisfamily} = {$thisfonturl}";

									$request3                   = $thisfonturl;
									$args3                      = [
										'headers' => [
											'Accept'     => '*/*',
											'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
										]
									];
									$response3                  = wp_remote_get( $request3, $args3 );
									$status3                    = wp_remote_retrieve_response_code( $response3 );
									$return_info->http_status_3 = $status3;
									if ( is_wp_error( $response3 ) ) {
										Plugin::write_log( __METHOD__ . " Attempt to retrieve file for font {$thisfamily} from url {$thisfonturl} was not successful: " . $response3->get_error_message() );
										$errorinfo[] = "Attempt to retrieve file for font {$thisfamily} from url {$thisfonturl} was not successful: " . $response3->get_error_message();
									} elseif ( 200 === $status3 ) {
										$body3 = wp_remote_retrieve_body( $response3 );
										if ( $wp_filesystem ) {
											if ( ! $wp_filesystem->put_contents(
												$gfonts_dir . "ttf/{$familyfilename}.{$fnttype}",
												$body3,
												FS_CHMOD_FILE
											) ) {
												$errorinfo[] = 'Cannot write file ' . $gfonts_dir . "ttf/{$familyfilename}.{$fnttype} with WordPress filesystem api";
												Plugin::write_log( __METHOD__ . " Cannot write file {$gfonts_dir}ttf/{$familyfilename}.{$fnttype} with WordPress filesystem api" );
											} else {
												$upload_url       = wp_upload_dir()['baseurl'];
												$gfont_stylesheet = preg_replace( '/url\((.*?)\)/', 'url(' . esc_url( "{$upload_url}/gfonts_preview/ttf/{$familyfilename}.{$fnttype}" ) . ')', $body2 );
												if ( ! file_exists( $gfonts_dir . "css/{$familyfilename}.css" ) ) {
													if ( ! $wp_filesystem->put_contents(
														$gfonts_dir . "css/{$familyfilename}.css",
														$gfont_stylesheet,
														FS_CHMOD_FILE
													) ) {
														$errorinfo[] = 'Cannot write file ' . $gfonts_dir . "css/{$familyfilename}.css with WordPress filesystem api";
														Plugin::write_log( __METHOD__ . " Cannot write file {$gfonts_dir}css/{$familyfilename}.css with WordPress filesystem api" );
													}
												}
											}
										}
									} else {
										$errorinfo[] = "Status on woff2 request for font-family {$thisfamily}: $status3";
										Plugin::write_log( __METHOD__ . " Status on woff2 request for font-family {$thisfamily}: $status3" );
									}
								}
							} else {
								$errorinfo[] = "Status on stylesheet request for font-family {$thisfamily}: $status2";
								Plugin::write_log( __METHOD__ . " Status on stylesheet request for font-family {$thisfamily}: $status2" );
							}
						} else {
							$errorinfo[] = "File {$familyfilename}.{$fnttype} already exists";
							Plugin::write_log( __METHOD__ . " Font file ttf/{$familyfilename}.{$fnttype} already exists, no further action taken" );
						}
					}
				}
			} else {
				$errorinfo[] = 'Could not initialize WordPress filesystem with these credentials';
				Plugin::write_log( 'Could not initialize WordPress filesystem with these credentials' );
			}
		} else {
			$errorinfo[] = 'You do not have direct access permissions to the WordPress filesystem';
			Plugin::write_log( 'You do not have direct access permissions to the WordPress filesystem' );
		}

		if ( ( $start_idx + ( $batch_limit - 1 ) ) < ( $total_fonts - 1 ) ) {
			$return_info->state = 'RUN_PROCESSED';
			$return_info->run   = $current_run;
		} else {
			$return_info->state = 'COMPLETE';

			// LAST STEP IS TO MINIFY ALL OF THE CSS FILES INTO ONE SINGLE FILE.
			$cssdirectory = $gfonts_dir . 'css';
			$cssfiles     = array_diff( scandir( $cssdirectory ), [ '..', '.', 'gfonts_preview.css' ] );
			$minifier     = new CSS( $cssdirectory . '/' . ( array_shift( $cssfiles ) ) );
			//phpcs:ignore Squiz.PHP.DisallowSizeFunctionsInLoops.Found
			while ( count( $cssfiles ) > 0 ) {
				// We can use count in the for loop because we are array shifting.
				$minifier->add( $cssdirectory . '/' . ( array_shift( $cssfiles ) ) );
			}
			$minifier->minify( $cssdirectory . '/gfonts_preview.css' );
		}

		if ( count( $errorinfo ) > 0 ) {
			$return_info->errorinfo = [];
			$return_info->errorinfo = $errorinfo;
		} else {
			$return_info->errorinfo = false;
		}

		echo wp_json_encode( $return_info );
		wp_die();
	}

	/**
	 * Refresh Google Fonts without waiting for the three month period to expire.
	 */
	public function force_refresh_gfonts_results() {
		Plugin::write_log( __METHOD__ );
		check_ajax_referer( 'refresh_gfonts_results_nonce', 'security', true );
		if ( isset( $_POST['gfontsApiKey'] ) && '' !== $_POST['gfontsApiKey'] ) {
			$gfonts_api_key = sanitize_text_field( wp_unslash( $_POST['gfontsApiKey'] ) );
			if ( get_transient( md5( $gfonts_api_key ) ) ) {
				delete_transient( md5( $gfonts_api_key ) );
				echo 'TRANSIENT_DELETED';
				wp_die();
			}
		}
		echo 'NOTHING_TO_DO';
		wp_die();
	}

	/**
	 * Detect if options save was successful.
	 */
	public function bibleget_plugin_settings_save() {
		Plugin::write_log( __METHOD__ );
		if ( isset( $_GET['settings-updated'] ) && $_GET['settings-updated'] ) {
			$this->options = get_option( 'bibleget_settings' );
		}
	}

	/**
	 * Allows to sort strings with accented characters when Intl is not loaded
	 *
	 * @param string $str The string that might possible contain accented characters.
	 * @return string
	 */
	public static function sortify( $str ) {
		Plugin::write_log( __METHOD__ );
		return preg_replace(
			'~&([a-z]{1,2})(acute|cedil|circ|grave|lig|orn|ring|slash|tilde|uml);~i',
			'$1' . chr( 255 ) . '$2',
			htmlentities( $str, ENT_QUOTES, 'UTF-8' )
		);
	}

	/**
	 * Get the result from the latest validation of the Google Fonts API key
	 *
	 * @return string|false
	 */
	public function get_gfonts_api_key_check_result() {
		Plugin::write_log( __METHOD__ );
		return $this->gfonts_api_key_check_result;
	}
}
