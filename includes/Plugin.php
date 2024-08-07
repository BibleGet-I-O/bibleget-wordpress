<?php
/**
 * Main class of the BibleGet Plugin for WordPress
 *
 * @package BibleGet
 */

namespace BibleGet;

use BibleGet\Customize;
use BibleGet\Properties;
use BibleGet\QueryValidator;
use BibleGet\SettingsPage;
use BibleGet\Enums\BGET;
use BibleGet\Enums\LangCodes;

/**
 * Main class of the BibleGet Plugin for WordPress
 */
class Plugin {
	public const VERSION          = 'v8_3';
	public const TRANSIENT_PREFIX = 'bibleget_';
	public const BIBLE_API        = 'https://query.bibleget.io/v3/index.php';
	public const SEARCH_API       = 'https://query.bibleget.io/v3/search.php';
	public const METADATA_API     = 'https://query.bibleget.io/v3/metadata.php';


	/**
	 * Triggered upon activation of the plugin
	 * Will set default options and will try to do a bit of cleanup from older versions
	 */
	public static function on_activation() {
		self::set_options();
	}

	/**
	 * Triggered when the plugin is uninstalled
	 * Will remove any options that have been set
	 * and files that have been created
	 */
	public static function on_uninstall() {
		// Check if we have a Google Fonts API key transient, if so remove it.
		$bibleget_options = get_option( 'bibleget_settings' );
		if ( isset( $bibleget_options['googlefontsapi_key'] ) && '' !== $bibleget_options['googlefontsapi_key'] ) {
			if ( get_transient( md5( $bibleget_options['googlefontsapi_key'] ) ) ) {
				delete_transient( md5( $bibleget_options['googlefontsapi_key'] ) );
			}
		}

		self::delete_options();

		delete_option( 'bibleget_settings' );
		delete_option( 'BGET' );

		// remove all leftover transients that cache the Bible quotes
		// not really all that necessary because they will clear within 7 days,
		// but just for sake of completeness and neatness.
		global $wpdb;
		// The following SELECT should select both the transient and the transient_timeout
		// This will also remove the Google Fonts API key transient if it uses the same prefix...
		// I guess we'll just have to not use our defined prefix on the Google Fonts API key transient
		// in order avoid this.
		$sql = "DELETE
				FROM  $wpdb->options
				WHERE `option_name` LIKE '%transient_%" . self::TRANSIENT_PREFIX . "%'
				";
		// We shouldn't have to do a $wpdb->prepare here because there is no kind of user input anywhere.
		$wpdb->query( $sql );
		if ( get_filesystem_method() === 'direct' ) {
			$gfonts_dir = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/';
			$creds      = request_filesystem_credentials( site_url() . '/wp-admin/', '', false, false, [] );
			/* initialize the API */
			if ( WP_Filesystem( $creds ) ) {
				global $wp_filesystem;
				if ( $wp_filesystem->is_dir( $gfonts_dir ) ) {
					$wp_filesystem->rmdir( $gfonts_dir, true );
				}
			}
		}
	}


	/**
	 * Load plugin textdomain.
	 */
	public static function bibleget_load_textdomain() {
		$domain = 'bibleget-io';
		// The "plugin_locale" filter is also used in load_plugin_textdomain().
		$locale = apply_filters( 'plugin_locale', get_locale(), $domain );
		// Allow users to add their own custom translations by dropping them in the WordPress 'languages' directory.
		load_textdomain( $domain, WP_LANG_DIR . '/plugins/' . $domain . '-' . $locale . '.mo' );

		load_plugin_textdomain( $domain, false, "/$domain/languages" );
	}


	/**
	 * Let WordPress know that we have text domain translations
	 * inside of our gutenberg block javascript file
	 */
	public static function set_script_translations() {
		$script_handle = generate_block_asset_handle( 'bibleget/bible-quote', 'editorScript' );
		wp_set_script_translations( $script_handle, 'bibleget-io' );
		// wp_set_script_translations( $script_handle, 'bibleget-io', "bibleget-io/languages" );
	}

	/**
	 * Process shortcode attributes
	 *
	 * @param array $atts Attributes defined on the shortcode.
	 */
	private static function process_shortcode_attributes( &$atts ) {
		// retrieve all layout options based on BibleGet_Properties, and use defaults from there,
		// so that shortcode Bible quotes will be consistent with Gutenberg block Bible quotes.
		$bget            = [];
		$bget_properties = new Properties();
		foreach ( $bget_properties->options as $option => $array ) {
			$option_ucase    = $option;
			$option          = strtolower( $option ); // shortcode attributes are all lowercased by default, so we need to lowercase for consistency.
			$bget[ $option ] = $array['default']; // default will be based on current saved option if exists.

			// while we are building our default values, we will also enforce type on $atts so we know we are speaking the same language.
			if ( isset( $atts[ $option ] ) ) {
				$r = new \ReflectionClass( 'BibleGet\Enums\BGET' );
				if ( str_ends_with( $option_ucase, 'ALIGNMENT' ) ) {
					$option_ucase = 'ALIGN';
				} elseif ( str_ends_with( $option_ucase, 'WRAP' ) ) {
					$option_ucase = 'WRAP';
				} elseif ( str_ends_with( $option_ucase, 'POSITION' ) ) {
					$option_ucase = 'POS';
				} elseif ( str_ends_with( $option_ucase, 'FORMAT' ) ) {
					$option_ucase = 'FORMAT';
				}
				if ( $r->getConstant( $option_ucase ) && is_array( $r->getConstant( $option_ucase ) ) && in_array( $atts[ $option ], array_keys( $r->getConstant( $option_ucase ) ) ) ) {
					// if user is using a string value instead of our enum values, let's try to get an enum value from the string value.
					$atts[ $option ] = $r->getConstant( $option_ucase )[ $atts[ $option ] ];
				}
				switch ( $array['type'] ) {
					case 'number':
						$atts[ $option ] = Customize::sanitize_float( $atts[ $option ] );
						break;
					case 'integer':
						$atts[ $option ] = absint( $atts[ $option ] );
						break;
					case 'boolean':
						$atts[ $option ] = Customize::sanitize_boolean( $atts[ $option ] );
						break;
					case 'string':
						$atts[ $option ] = esc_html( $atts[ $option ] );
						break;
					case 'array':
						$atts[ $option ] = Customize::sanitize_array( $atts[ $option ] );
						break;
				}
			}
		}
		return $bget;
	}

	/**
	 * Ensure that indexes have been set for each of the given Bible versions
	 *
	 * @param array $versions Current supported Bible versions.
	 */
	private static function ensure_indexes_set( $versions ) {
		foreach ( $versions as $version ) {
			if ( false === get_option( 'bibleget_' . $version . 'IDX' ) ) {
				self::set_options();
			}
		}
	}

	/**
	 * Ensure that we have set indexes for Bible books
	 */
	private static function ensure_biblebooks_set() {
		for ( $i = 0; $i < 73; $i++ ) {
			if ( false === get_option( 'bibleget_biblebooks' . $i ) ) {
				self::set_options();
			}
		}
	}

	/**
	 * Creates the shortcode useful for injecting Bible Verses into a page
	 * Example usage:
	 * [bibleget query="Matthew1:1-5" version="CEI2008"]
	 * [bibleget query="Matthew1:1-5" versions="CEI2008,NVBSE"]
	 * [bibleget]Matthew1:1-5[/bibleget]
	 *
	 * @param array  $atts Shortcode attributes.
	 * @param string $content Shortcode content between opening and closing tag.
	 * @param string $tag Shortcode tag.
	 */
	public static function shortcode( $atts = [], $content = null, $tag = '' ) {
		// add possibility of using "versions" parameter instead of "version".
		if ( isset( $atts['versions'] ) ) {
			$atts['version'] = explode( ',', $atts['versions'] );
		} elseif ( isset( $atts['version'] ) ) {
			$atts['version'] = explode( ',', $atts['version'] );
		}

		$vversions = get_option( 'bibleget_versions', [] );
		if ( count( $vversions ) < 1 ) {
			self::set_options();
			$vversions = get_option( 'bibleget_versions', [] );
		}
		$validversions = array_keys( $vversions );

		$bget = self::process_shortcode_attributes( $atts );
		$a    = shortcode_atts( $bget, $atts, $tag );
		// now to maintain consistency with our Gutenberg block code etc., let's retransform the keys to uppercase
		// and use $atts instead of $a.
		$atts = [];
		foreach ( $a as $key => $value ) {
			$atts[ strtoupper( $key ) ] = $value;
		}

		if ( true !== $atts['FORCEVERSION'] ) {
			foreach ( $atts['VERSION'] as $version ) {
				if ( ! in_array( $version, $validversions, true ) ) {
					$optionsurl = admin_url( 'options-general.php?page=bibleget-settings-admin' );
					/* translators: you must not change the placeholders \"%s\" or the html <a href=\"%s\">, </a> */
					$output = '<span style="color:Red;font-weight:bold;">' . sprintf( __( 'The requested version "%1$s" is not valid, please check the list of valid versions in the <a href="%2$s">settings page</a>', 'bibleget-io' ), $version, $optionsurl ) . '</span>';
					return '<div class="bibleget-quote-div">' . $output . '</div>';
				}
			}
		}

		if ( null !== $content && '' !== $content ) {
			$queries = self::sanitize_query( $content );
		} else {
			$queries = self::sanitize_query( $atts['QUERY'] );
		}
		return self::process_queries( $queries, $atts, true, $content );
	}

	/**
	 * Process queries
	 *
	 * @param array       $queries Array of Bible quote references to process.
	 * @param array       $atts Shortcode or block attributes.
	 * @param bool        $is_shortcode Whether we are dealing with a shortcode.
	 * @param string|null $content Shortcode or block contents.
	 */
	private static function process_queries( $queries, $atts, $is_shortcode = false, $content = null ) {
		if ( is_array( $queries ) ) {
			self::ensure_indexes_set( $atts['VERSION'] );
			self::ensure_biblebooks_set();
			$current_page_url = self::current_page_url();

			$query_validator = new QueryValidator( $queries, $atts['VERSION'], $current_page_url );
			if ( false === $query_validator->validate_queries() ) {
				$output = __( 'Bible Quote failure... (error processing query, please check syntax)', 'bibleget-io' );
				return '<div class="bibleget-quote-div"><span style="color:Red;font-weight:bold;">' . $output . '</span></div>';
			}

			$notices = get_option( 'bibleget_error_admin_notices', [] );
			$notices = array_merge( $notices, $query_validator->errs );
			update_option( 'bibleget_error_admin_notices', $notices );

			$finalquery = self::process_final_query( $query_validator->validated_queries, $atts );
			if ( WP_DEBUG ) {
				self::write_log( "value of finalquery = $finalquery" );
			}

			$output = self::process_output( $finalquery );

			if ( $is_shortcode ) {
				wp_enqueue_script( 'bibleget-script', plugins_url( '../js/shortcode.js', __FILE__ ), [ 'jquery' ], '1.0', true );
				wp_enqueue_script( 'htmlentities-script', '//cdn.jsdelivr.net/gh/mathiasbynens/he@1.2.0/he.min.js', [ 'jquery' ], '1.2.0', true );
				// it shouldn't be necessary to call update_option here,
				// because even though it's theoretically possible now to set all options inside the shortcode
				// it would be so impractical that I cannot see anyone actual doing it
				// and it would probably be confusing to be saving the main query parameters such as "version"
				// which is being used here as an override compared to any saved options;
				// same really goes for any parameter used here, it would be used as an ovverride if anything
				// update_option("BGET",$a); .
			} else {
				// we should avoid saving some attributes to options, when they are obviously per block settings and not universal settings.
				$a                            = get_option( 'BGET' );
				$options_no_update_from_block = [ 'POPUP', 'PREFERORIGIN', 'QUERY', 'VERSION' ];
				foreach ( $atts as $key => $value ) {
					if ( ! in_array( $key, $options_no_update_from_block, true ) ) {
						$a[ $key ] = $value;
					}
				}
				update_option( 'BGET', $a );
			}

			$dom_document_processed = self::process_dom_document( $atts, $output, $content );
			return $dom_document_processed;
		} else {
			/* translators: do not translate "shortcode" unless the version of WordPress in your language uses a translated term to refer to shortcodes */
			$output = '<span style="color:Red;font-weight:bold;">'
				. __( 'There are errors in the shortcode, please check carefully your query syntax:', 'bibleget-io' )
				. " $queries"
				. '</span>';
			return '<div class="bibleget-quote-div">' . $output . '</div>';
		}
	}

	/**
	 * Process DomDocument
	 *
	 * @param array       $atts Shortcode attributes.
	 * @param string      $output Bible quote html to be processed.
	 * @param string|null $content Shortcode content between opening and closing tag.
	 * @return string
	 */
	private static function process_dom_document( $atts, $output, $content = null ) {
		// set this flag to true as soon as we see that we have a layout pref that isn't default value,
		// so we will know to update the $output accordingly.
		$non_default_layout = false;
		$dom_document       = new \DOMDocument();
		$dom_document->loadHTML(
			'<!DOCTYPE HTML><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>'
			. $output
			. '</body>'
		);
		if ( $dom_document ) {
			$xpath   = new \DOMXPath( $dom_document );
			$results = $xpath->query( '//div[contains(@class,"results")]' )->item( 0 );
			$errors  = $xpath->query( '//div[contains(@class,"errors")]' )->item( 0 );
			$info    = $xpath->query( '//input[contains(@class,"BibleGetInfo")]' )->item( 0 );

			if ( false === $atts['LAYOUTPREFS_SHOWBIBLEVERSION'] && false !== $results ) {
				$non_default_layout = true;
				$bible_version_els  = $xpath->query( '//p[contains(@class,"bibleVersion")]' );
				foreach ( $bible_version_els as $bible_version_el ) {
					$bible_version_el->setAttribute( 'style', 'display:none;' );
				}
			}

			if ( BGET::ALIGN['LEFT'] !== $atts['LAYOUTPREFS_BIBLEVERSIONALIGNMENT'] && false !== $results ) {
				$non_default_layout = true;
				$bible_version_els  = $xpath->query( '//p[contains(@class,"bibleVersion")]' );
				foreach ( $bible_version_els as $bible_version_el ) {
					$el_class = $bible_version_el->getAttribute( 'class' );
					$bible_version_el->setAttribute( 'class', $el_class . ' bbGetAlign' . $atts['LAYOUTPREFS_BIBLEVERSIONALIGNMENT'] );
				}
			}

			if ( BGET::POS['TOP'] !== $atts['LAYOUTPREFS_BIBLEVERSIONPOSITION'] && false !== $results ) {
				$non_default_layout  = true;
				$bible_version_els   = $xpath->query( '//p[contains(@class,"bibleVersion")]' );
				$bible_version_cnt   = $bible_version_els->count();
				$bible_version_stack = [];
				switch ( $bible_version_cnt ) {
					case 0:
						// don't do anything.
						break;
					case 1:
						$bible_version_el = $bible_version_els->item( 0 );
						$results->appendChild( $bible_version_el );
						break;
					default:
						foreach ( $bible_version_els as $bible_version_el ) {
							array_push( $bible_version_stack, $bible_version_el );
							if ( count( $bible_version_stack ) > 1 ) {
								$replacement_node = array_shift( $bible_version_stack );
								$results->replaceChild( $replacement_node, $bible_version_stack[0] );
							}
						}
						$results->appendChild( array_shift( $bible_version_stack ) );
				}
			}

			if ( BGET::WRAP['NONE'] !== $atts['LAYOUTPREFS_BIBLEVERSIONWRAP'] && false !== $results ) {
				$non_default_layout = true;
				$bible_version_els  = $xpath->query( '//p[contains(@class,"bibleVersion")]' );
				foreach ( $bible_version_els as $bible_version_el ) {
					$text = $bible_version_el->textContent;
					switch ( $atts['LAYOUTPREFS_BIBLEVERSIONWRAP'] ) {
						case BGET::WRAP['PARENTHESES']:
							$text = '(' . $text . ')';
							break;
						case BGET::WRAP['BRACKETS']:
							$text = '[' . $text . ']';
							break;
					}
					$bible_version_el->textContent = $text;
				}
			}

			if ( BGET::ALIGN['LEFT'] !== $atts['LAYOUTPREFS_BOOKCHAPTERALIGNMENT'] && false !== $results ) {
				$non_default_layout = true;
				$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
				foreach ( $book_chapter_els as $book_chapter_el ) {
					$el_class = $book_chapter_el->getAttribute( 'class' );
					$book_chapter_el->setAttribute( 'class', $el_class . ' bbGetAlign' . $atts['LAYOUTPREFS_BOOKCHAPTERALIGNMENT'] );
				}
			}

			if ( BGET::FORMAT['BIBLELANG'] !== $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] && false !== $results ) {
				$non_default_layout = true;
				$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
				if (
					BGET::FORMAT['USERLANG'] === $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT']
					|| BGET::FORMAT['USERLANGABBREV'] === $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT']
				) {
					$locale        = substr( get_locale(), 0, 2 );
					$language_name = \Locale::getDisplayLanguage( $locale, 'en' );
					foreach ( $book_chapter_els as $book_chapter_el ) {
						$book_num = (int) $xpath->query( 'following-sibling::input[@class="univBookNum"]', $book_chapter_el )->item( 0 )->getAttribute( 'value' );
						$usrprop  = 'bibleget_biblebooks' . ( $book_num - 1 );
						$jsbook   = json_decode( get_option( $usrprop ), true );
						// get the index of the current language from the available languages.
						$biblebookslangs  = get_option( 'bibleget_languages' );
						$current_lang_idx = array_search( $language_name, $biblebookslangs, true );
						if ( false === $current_lang_idx ) {
							$current_lang_idx = array_search( 'English', $biblebookslangs, true );
						}
						$lclbook           = trim( explode( '|', $jsbook[ $current_lang_idx ][0] )[0] );
						$lclabbrev         = trim( explode( '|', $jsbook[ $current_lang_idx ][1] )[0] );
						$book_chapter_text = $book_chapter_el->textContent;
						// Remove book name from the string (check includes any possible spaces in the book name).
						if ( preg_match( '/^([1-3I]{0,3}[\s]{0,1}((\p{L}\p{M}*)+))/u', $book_chapter_text, $res ) ) {
							$book_chapter_text = str_replace( $res[0], '', $book_chapter_text );
						}

						if ( BGET::FORMAT['USERLANGABBREV'] === $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] ) {
							// use abbreviated form in wp lang.
							$book_chapter_el->textContent = $lclabbrev . $book_chapter_text;
						} else {
							// use full form in wp lang.
							$book_chapter_el->textContent = $lclbook . $book_chapter_text;
						}
					}
				} elseif ( BGET::FORMAT['BIBLELANGABBREV'] === $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] ) {
					// use abbreviated form in bible version lang.
					foreach ( $book_chapter_els as $book_chapter_el ) {
						$book_abbrev       = $xpath->query( 'following-sibling::input[@class="bookAbbrev"]', $book_chapter_el )->item( 0 )->getAttribute( 'value' );
						$book_chapter_text = $book_chapter_el->textContent;
						if ( preg_match( '/^([1-3I]{0,3}[\s]{0,1}((\p{L}\p{M}*)+))/u', $book_chapter_text, $res ) ) {
							$book_chapter_text = str_replace( $res[0], '', $book_chapter_text );
						}
						$book_chapter_el->textContent = $book_abbrev . $book_chapter_text;
					}
				}
			}

			/*
			Make sure to deal with fullreference before you deal with pos or wrap
			=> if pos is bottominline it will change the p to a span and then we won't know what to look for
			=> if we have already wrapped then the fullreference will be appended to the parentheses or the brackets!
			*/
			if ( true === $atts['LAYOUTPREFS_BOOKCHAPTERFULLQUERY'] && false !== $results ) {
				$non_default_layout = true;
				$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
				foreach ( $book_chapter_els as $book_chapter_el ) {
					$text           = $book_chapter_el->textContent;
					$original_query = $xpath->query( 'following-sibling::input[@class="originalQuery"]', $book_chapter_el )->item( 0 )->getAttribute( 'value' );
					// remove book from the original query.
					if ( preg_match( '/^([1-3]{0,1}((\p{L}\p{M}*)+)[1-9][0-9]{0,2})/u', $original_query, $res ) ) {
						$original_query = str_replace( $res[0], '', $original_query );
					}
					$book_chapter_el->textContent = $text . $original_query;
				}
			}

			/* Make sure to deal with wrap before you deal with pos, because if pos is bottominline it will change the p to a span and then we won't know what to look for */
			if ( BGET::WRAP['NONE'] !== $atts['LAYOUTPREFS_BOOKCHAPTERWRAP'] && false !== $results ) {
				$non_default_layout = true;
				$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
				foreach ( $book_chapter_els as $book_chapter_el ) {
					$text = $book_chapter_el->textContent;
					switch ( $atts['LAYOUTPREFS_BOOKCHAPTERWRAP'] ) {
						case BGET::WRAP['PARENTHESES']:
							$text = '(' . $text . ')';
							break;
						case BGET::WRAP['BRACKETS']:
							$text = '[' . $text . ']';
							break;
					}
					$book_chapter_el->textContent = $text;
				}
			}

			if ( BGET::POS['TOP'] !== $atts['LAYOUTPREFS_BOOKCHAPTERPOSITION'] && false !== $results ) {
				$non_default_layout = true;
				$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
				switch ( $atts['LAYOUTPREFS_BOOKCHAPTERPOSITION'] ) {
					case BGET::POS['BOTTOM']:
						foreach ( $book_chapter_els as $book_chapter_el ) {
							$results->insertBefore( $book_chapter_el->nextSibling, $book_chapter_el );
						}
						break;
					case BGET::POS['BOTTOMINLINE']:
						foreach ( $book_chapter_els as $book_chapter_el ) {
							$class = $book_chapter_el->getAttribute( 'class' );
							$text  = $book_chapter_el->textContent;
							$span  = $dom_document->createElement( 'span', $text );
							$span->setAttribute( 'class', $class );
							$book_chapter_el->nextSibling->appendChild( $span );
							$results->removeChild( $book_chapter_el );
						}
						break;
				}
			}

			if ( BGET::VISIBILITY['HIDE'] === $atts['LAYOUTPREFS_SHOWVERSENUMBERS'] && false !== $results ) {
				$non_default_layout = true;
				$verse_number_els   = $xpath->query( '//span[contains(@class,"verseNum")]' );
				foreach ( $verse_number_els as $verse_number_el ) {
					$verse_number_el->setAttribute( 'style', 'display:none;' );
				}
			}

			// If any of the Layout options were not the default options, then we need to update our $output with the new html layout.
			if ( true === $non_default_layout ) {
				$output = $dom_document->saveHTML( $results );
				if ( null !== $errors ) {
					$output .= $dom_document->saveHTML( $errors );
				}
				if ( null !== $info ) {
					$output .= $dom_document->saveHTML( $info );
				}
			}
		}

		if ( true === $atts['POPUP'] ) {
			wp_enqueue_script( 'jquery-ui-dialog' );
			wp_enqueue_style( 'wp-jquery-ui-dialog' );
			$dir       = __DIR__;
			$popup_css = '../js/popup.css';
			wp_enqueue_style(
				'bibleget-popup',
				plugins_url( '../css/popup.css', __FILE__ ),
				[],
				filemtime( "$dir/$popup_css" )
			);
			if ( null !== $content && '' !== $content ) {
				return '<a href="#" class="bibleget-popup-trigger" data-popupcontent="'
						. htmlspecialchars( $output ) . '">' . $content . '</a>';
			} else {
				return '<a href="#" class="bibleget-popup-trigger" data-popupcontent="'
						. htmlspecialchars( $output ) . '">' . $atts['QUERY'] . '</a>';
			}
		} else {
			return '<div class="bibleget-quote-div">' . $output . '</div>';
		}
	}

	/**
	 * BibleGet Gutenberg Block!
	 * Transforming the shortcode into a block
	 */
	public static function gutenberg() {
		// Skip block registration if Gutenberg is not enabled/merged.
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		$dir          = __DIR__;
		$gutenberg_js = '../js/gutenberg.js';
		wp_register_script(
			'bibleget-gutenberg-block',
			plugins_url( $gutenberg_js, __FILE__ ),
			[
				'wp-blocks',
				'wp-element',
				'wp-i18n',
				'wp-editor',
				'wp-components',
				'jquery-ui-dialog',
			],
			filemtime( "$dir/$gutenberg_js" ),
			true
		);

		$gutenberg_css = '../css/gutenberg.css';
		wp_register_style(
			'bibleget-gutenberg-editor',
			plugins_url( $gutenberg_css, __FILE__ ),
			[ 'wp-jquery-ui-dialog' ],
			filemtime( "$dir/$gutenberg_css" )
		);

		// we aren't actually going to create the settings page here,
		// we're just using some of the same information that is used to create the settings page.
		$options_info           = new SettingsPage();
		$versions_by_lang       = $options_info->get_versions_by_lang();
		$bibleget_books_in_lang = $options_info->get_bible_book_names_in_lang();
		// These are our default settings, we will use them for the Gutenberg block
		// they could perhaps take the place of the properties defined for the Customizer.
		$bget_properties = new Properties();
		// and these are our constants, as close as I can get to ENUMS
		// hey with this operation they transform quite nicely for the client side javascript!
		$bgetreflection    = new \ReflectionClass( 'BibleGet\Enums\BGET' );
		$bgetinstanceprops = $bgetreflection->getConstants();
		$bget_constants    = [];
		foreach ( $bgetinstanceprops as $key => $value ) {
			$bget_constants[ $key ] = $value;
		}

		$have_gfonts      = $options_info->gfonts_api_key_check();
		$gfonts           = null;
		$gfonts_dir       = str_replace( '\\', '/', plugin_dir_path( __FILE__ ) ) . '../gfonts_preview/';
		$gfonts_file_path = $gfonts_dir . 'gfontsWeblist.json';
		if ( 'SUCCESS' === $have_gfonts && file_exists( $gfonts_file_path ) ) {
			$gfonts = json_decode( file_get_contents( $gfonts_file_path ) );
		}

		$myvars = [
			'ajax_url'            => admin_url( 'admin-ajax.php' ),
			'bibleget_admin_url'  => admin_url( 'options-general.php?page=bibleget-settings-admin' ),
			'langCodes'           => LangCodes::ISO_639_1,
			'currentLangISO'      => get_bloginfo( 'language' ),
			'versionsByLang'      => $versions_by_lang,
			'biblebooks'          => $bibleget_books_in_lang,
			'BibleGet_Properties' => $bget_properties->options,
			'BGETConstants'       => $bget_constants,
			'haveGFonts'          => $have_gfonts,
			'GFonts'              => $gfonts,
		];
		wp_localize_script( 'bibleget-gutenberg-block', 'BibleGetGlobal', $myvars );

		register_block_type(
			'bibleget/bible-quote',
			[
				'editor_script'   => 'bibleget-gutenberg-block',
				'editor_style'    => 'bibleget-gutenberg-editor',
				'render_callback' => [ 'BibleGet\Plugin', 'render_gutenberg_block' ],
				'attributes'      => $bget_properties->options,
			]
		);
	}

	/**
	 * Enqueue scripts for the Bible quote block
	 *
	 * @param string $hook
	 */
	public static function gutenberg_scripts( $hook ) {
		if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
			return;
		}

		$dir       = __DIR__;
		$popup_css = '../js/popup.css';
		wp_enqueue_script( 'jquery-ui-dialog' );
		wp_enqueue_style( 'wp-jquery-ui-dialog' );
		wp_enqueue_style(
			'bibleget-popup',
			plugins_url( '../css/popup.css', __FILE__ ),
			[],
			filemtime( "$dir/$popup_css" )
		);
		wp_enqueue_script(
			'htmlentities-script',
			'//cdn.jsdelivr.net/gh/mathiasbynens/he@1.2.0/he.min.js',
			[ 'jquery' ],
			'1.2.0',
			true
		);
		if ( ! wp_style_is( 'fontawesome', 'enqueued' ) ) {
			if ( false === self::is_fontawesome_enqueued() ) {
				wp_enqueue_style(
					'fontawesome',
					'//cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/css/fontawesome.min.css',
					false,
					'6.4.2'
				);
			}
		}
		$gfonts_preview_css = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/css/gfonts_preview.css';
		$gfonts_preview_url = wp_upload_dir()['baseurl'] . '/gfonts_preview/css/gfonts_preview.css';
		if ( file_exists( $gfonts_preview_css ) ) {
			wp_enqueue_style(
				'bibleget-fontselect-preview',
				$gfonts_preview_url,
				false,
				filemtime( $gfonts_preview_css )
			);
		}
	}

	/**
	 * Check whether Fontawesome has already been enqueued
	 * to avoid enqueuing more than once
	 *
	 * @return bool
	 */
	private static function is_fontawesome_enqueued() {
		global $wp_styles;
		foreach ( $wp_styles->queue as $style ) {
			if ( strpos( $wp_styles->registered[ $style ]->src, 'fontawesome' ) ) {
				return true;
			} elseif ( strpos( $wp_styles->registered[ $style ]->src, 'font-awesome' ) ) {
				return true;
			} elseif ( strpos( $wp_styles->registered[ $style ]->handle, 'fontawesome' ) ) {
				return true;
			} elseif ( strpos( $wp_styles->registered[ $style ]->handle, 'font-awesome' ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Produce final html output of the Bible quote
	 * first checking if we already have a cached result,
	 * and if not, by sending a request to the API
	 *
	 * @param string $finalquery Query string to send to the API if we don't have an already cached result.
	 * @return string
	 */
	private static function process_output( $finalquery ) {
		$output = get_transient( self::TRANSIENT_PREFIX . md5( $finalquery ) );
		if ( false === $output ) {
			$output = self::query_server( $finalquery );
			if ( $output ) {
				$output = str_replace( PHP_EOL, '', $output );
				set_transient( self::TRANSIENT_PREFIX . md5( $finalquery ), $output, 7 * 24 * HOUR_IN_SECONDS );
			} else {
				$output = '<span style="color:Red;font-weight:bold;">' . __( 'Bible Quote failure... Temporary error from the BibleGet server. Please try again in a few minutes', 'bibleget-io' ) . '</span>';
			}
		}
		return $output;
	}

	/**
	 * Process final query: prepare the query string for the API call
	 *
	 * @param array $goodqueries Validated and sanitized Bible quotes to send in the query string to the API.
	 * @param array $atts Query parameters to send in the query string to the API.
	 * @return string
	 */
	private static function process_final_query( $goodqueries, $atts ) {
		$finalquery  = 'query=';
		$finalquery .= implode( ';', $goodqueries );
		$finalquery .= '&version=';
		$finalquery .= implode( ',', $atts['VERSION'] );
		if ( BGET::PREFERORIGIN['GREEK'] === $atts['PREFERORIGIN'] ) {
			$finalquery .= '&preferorigin=GREEK';
		} elseif ( BGET::PREFERORIGIN['HEBREW'] === $atts['PREFERORIGIN'] ) {
			$finalquery .= '&preferorigin=HEBREW';
		}
		if ( true === $atts['FORCEVERSION'] ) {
			$finalquery .= '&forceversion=true';
		}
		if ( true === $atts['FORCECOPYRIGHT'] ) {
			$finalquery .= '&forcecopyright=true';
		}
		return $finalquery;
	}

	/**
	 * Gutenberg Render callback
	 *
	 * @param array $atts Block attributes.
	 * @return string
	 */
	public static function render_gutenberg_block( $atts ) {
		$output = ''; // this will be whatever html we are returning to be rendered
		// Determine bible version(s).
		$atts['VERSION'] = ( ! empty( $atts['VERSION'] ) ? $atts['VERSION'] : [ 'NABRE' ] );

		if ( count( $atts['VERSION'] ) < 1 ) {
			/* translators: do NOT translate the parameter names "version" or "versions" !!! */
			$output = '<span style="color:Red;font-weight:bold;">' . __( 'You must indicate the desired version with the parameter "version" (or the desired versions as a comma separated list with the parameter "versions")', 'bibleget-io' ) . '</span>';
			return '<div class="bibleget-quote-div">' . $output . '</div>';
		}

		$vversions = get_option( 'bibleget_versions', [] );
		if ( count( $vversions ) < 1 ) {
			self::set_options();
			$vversions = get_option( 'bibleget_versions', [] );
		}
		$validversions = array_keys( $vversions );
		if ( true !== $atts['FORCEVERSION'] ) {
			foreach ( $atts['VERSION'] as $version ) {
				if ( ! in_array( $version, $validversions, true ) ) {
					$optionsurl = admin_url( 'options-general.php?page=bibleget-settings-admin' );
					$output     = '<span style="color:Red;font-weight:bold;">'
						. sprintf(
							/* translators: you must not change the placeholders \"%s\" or the html <a href=\"%s\">, </a> */
							__( 'The requested version "%1$s" is not valid, please check the list of valid versions in the <a href="%2$s">settings page</a>', 'bibleget-io' ),
							$version,
							$optionsurl
						)
						. '</span>';
					return '<div class="bibleget-quote-div">' . $output . '</div>';
				}
			}
		}

		$queries = self::sanitize_query( $atts['QUERY'] );
		return self::process_queries( $queries, $atts );
	}

	/**
	 * After a query has been checked for integrity, this will send the query request to the BibleGet API
	 * and returns the response from the BibleGet API
	 *
	 * @param string $finalquery Sanitized and processed query to send to the API.
	 * @return string
	 */
	private static function query_server( $finalquery ) {
		$current_page_url = self::current_page_url();
		$errs             = [];
		$request          = self::BIBLE_API . '?' . $finalquery
							. '&return=html&appid=wordpress&domain='
							. rawurlencode( site_url() )
							. '&pluginversion=' . self::VERSION;
		$response         = wp_remote_get( $request );
		if ( is_wp_error( $response ) ) {
			$errs[] = 'BIBLEGET SERVER ERROR: <span style="color:Red;font-weight:bold;">' .
				__( 'There was an error communicating with the BibleGet server, please wait a few minutes and try again', 'bibleget-io' ) .
				': &apos;' . $response->get_error_message() . '&apos;: ' .
				$finalquery .
				'</span>';
			update_option( 'bibleget_error_admin_notices', $errs );
			return false;
		}

		$output = wp_remote_retrieve_body( $response );
		// remove style and title tags from the output if they are present(should not be present with more recent BibleGet engine.
		$output = substr( $output, 0, strpos( $output, '<style' ) ) . substr( $output, strpos( $output, '</style' ), strlen( $output ) );
		$output = substr( $output, 0, strpos( $output, '<title' ) ) . substr( $output, strpos( $output, '</title' ), strlen( $output ) );

		$count1 = null;
		$count2 = null;
		$output = preg_replace( '/&lt;(sm|pof|po|pol|pos|poif|poi|poil|po3|po3l|speaker)&gt;/', '<span class="$1">', $output, -1, $count1 );
		$output = preg_replace( '/&lt;\/(sm|pof|po|pol|pos|poif|poi|poil|po3|po3l|speaker)&gt;/', '</span>', $output, -1, $count2 );

		$matches = null;
		if ( preg_match_all( '/<div class="errors bibleQuote">.*?<\/div>/s', $output, $matches ) ) {
			// capture table of error messages, and turn it into notices for backend.
			$errorshtml = new \DOMDocument();
			$errorshtml->loadHTML( '<!DOCTYPE HTML><head><title>BibleGet Query Errors</title></head><body>' . $matches[0][0] . '</body>' );
			$error_rows = $errorshtml->getElementsByTagName( 'tr' );
			if ( null !== $error_rows && $error_rows->length > 0 ) {
				$errs = get_option( 'bibleget_error_admin_notices', [] );
				foreach ( $error_rows as $error_row ) {
					$errormessage = self::get_elements_by_class( $error_row, 'td', 'errMessageVal' );
					$errs[]       = 'BIBLEGET SERVER ERROR: <span style="color:Red;">' .
						$errormessage[0]->nodeValue .
						"</span><span style=\"color:DarkBlue;\">({$current_page_url})</span>.<br /><span style=\"color:Gray;font-style:italic;\">" .
						__( 'If this error continues, please notify the BibleGet plugin author at' ) .
						': <a target="_blank" href="mailto:bibleget.io@gmail.com?subject=BibleGet+Server+Error&body=' .
						rawurlencode(
							"The WordPress Plugin is receiving this error message from the BibleGet Server:\n\n" .
							$errormessage[0]->nodeValue .
							"\n\nKind regards,\n\n"
						) .
						'">bibleget.io@gmail.com</a></span>';
				}
			}
			$output = preg_replace( '/<div class="errors bibleQuote">.*?<\/div>/s', '', $output );
		}
		return $output;
	}


	/**
	 * Helper function that modifies the query so that it is in a correct Proper Case,
	 * taking into account numbers at the beginning of the string
	 * Can handle any kind of Unicode string in any language
	 *
	 * @param string $txt Original query string.
	 * @return string
	 */
	public static function to_proper_case( $txt ) {
		// echo "<div style=\"border:3px solid Yellow;\">txt = $txt</div>";.
		preg_match( '/\p{L}/u', $txt, $matches, PREG_OFFSET_CAPTURE );
		$idx = intval( $matches[0][1] );
		// echo "<div style=\"border:3px solid Purple;\">idx = $idx</div>";.
		$chr = mb_substr( $txt, $idx, 1, 'UTF-8' );
		// echo "<div style=\"border:3px solid Pink;\">chr = $chr</div>";.
		if ( preg_match( '/\p{L&}/u', $chr ) ) {
			$post = mb_substr( $txt, $idx + 1, mb_strlen( $txt ), 'UTF-8' );
			// echo "<div style=\"border:3px solid Black;\">post = $post</div>";.
			return mb_substr( $txt, 0, $idx, 'UTF-8' ) . mb_strtoupper( $chr, 'UTF-8' ) . mb_strtolower( $post, 'UTF-8' );
		} else {
			return $txt;
		}
	}

	/**
	 * Helper function that will return the index of a bible book from a two-dimensional index array
	 *
	 * @param string $needle Needle.
	 * @param array  $haystack Haystack.
	 * @return string|int
	 */
	private static function bibleget_index_of( $needle, $haystack ) {
		foreach ( $haystack as $index => $value ) {
			if ( is_array( $value ) ) {
				foreach ( $value as $value2 ) {
					if ( in_array( $needle, $value2, true ) ) {
						return $index;
					}
				}
			} elseif ( in_array( $needle, $value, true ) ) {
				return $index;
			}
		}
		return false;
	}


	/**
	 * Set communication error
	 *
	 * @param array  $notices Current admin notifications.
	 * @param string $err Error message to add to admin notifications.
	 */
	private static function set_communication_error( $notices, $err ) {
		$options_url      = admin_url( 'options-general.php?page=bibleget-settings-admin' );
		$current_page_url = self::current_page_url();
		$errs             = [
			'',
			/* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
			__( 'There was a problem communicating with the BibleGet server. <a href="%s" title="update metadata now">Metadata needs to be manually updated</a>.', 'bibleget-io' ),
			/* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
			__( 'There may have been a problem communicating with the BibleGet server. <a href="%s" title="update metadata now">Metadata needs to be manually updated</a>.', 'bibleget-io' ),
		];
		$notices[]        = 'BIBLEGET PLUGIN ERROR: ' .
			sprintf( $errs[ $err ], $options_url ) . " ({$current_page_url})";
		update_option( 'bibleget_error_admin_notices', $notices );
	}

	/**
	 * Retrieve metadata about Bible books and versions and indexes from the BibleGet API metadata endpoint
	 *
	 * @param string $request Which kind of metadata to request.
	 * @return object|false
	 */
	private static function get_metadata( $request ) {
		// request can be for building the biblebooks variable, or for building version indexes, or for requesting current validversions.
		$notices          = get_option( 'bibleget_error_admin_notices', [] );
		$current_page_url = self::current_page_url();
		$curl_version     = curl_version();
		$ssl_version      = str_replace( 'OpenSSL/', '', $curl_version['ssl_version'] );
		if ( version_compare( $curl_version['version'], '7.34.0', '>=' ) && version_compare( $ssl_version, '1.0.1', '>=' ) ) {
			// we should be good to go for secure SSL communication supporting TLSv1_2.
			$url = self::METADATA_API . '?query=' . $request . '&return=json';
			$ch  = curl_init( $url );
			curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
			curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );
			curl_setopt( $ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2 );
		} else {
			$url = 'http://query.bibleget.io/v3/metadata.php?query=' . $request . '&return=json';
			$ch  = curl_init( $url );
		}

		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );

		if ( false === ini_get( 'open_basedir' ) ) {
			curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
			curl_setopt( $ch, CURLOPT_AUTOREFERER, true );
		}

		$response = curl_exec( $ch );
		if ( curl_errno( $ch ) && ( 77 === curl_errno( $ch ) || 60 === curl_errno( $ch ) ) && self::METADATA_API . '?query=' . $request . '&return=json' === $url ) {
			// error 60: SSL certificate problem: unable to get local issuer certificate.
			// error 77: error setting certificate verify locations CAPath: none.
			// curl.cainfo needs to be set in php.ini to point to the curl pem bundle available at https://curl.haxx.se/ca/cacert.pem
			// until that's fixed on the server environment let's resort to a simple http request.
			$url = 'http://query.bibleget.io/v3/metadata.php?query=' . $request . '&return=json';
			curl_setopt( $ch, CURLOPT_URL, $url );
			$response = curl_exec( $ch );
			if ( curl_errno( $ch ) ) {
				self::set_communication_error( $notices, 1 );
				return false;
			} else {
				$info = curl_getinfo( $ch );
				// echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];
				if ( 200 !== $info['http_code'] && 304 !== $info['http_code'] ) {
					self::set_communication_error( $notices, 2 );
					return false;
				}
			}
		} elseif ( curl_errno( $ch ) ) {
			self::set_communication_error( $notices, 1 );
			return false;
		} else {
			$info = curl_getinfo( $ch );
			// echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];
			if ( 200 !== $info['http_code'] && 304 !== $info['http_code'] ) {
				self::set_communication_error( $notices, 2 );
				return false;
			}
		}
		curl_close( $ch );

		$myjson = json_decode( $response );
		if ( property_exists( $myjson, 'results' ) ) {
			return $myjson;
			// var verses = myjson.results;.
		} else {
			$optionsurl = admin_url( 'options-general.php?page=bibleget-settings-admin' );
			$notices[]  = 'BIBLEGET PLUGIN ERROR: ' .
				sprintf(
					/* translators: do not change the placeholders or the html markup, though you may translate the anchor title */
					__( 'There may have been a problem communicating with the BibleGet server. <a href="%s" title="update metadata now">Metadata needs to be manually updated</a>.', 'bibleget-io' ),
					$optionsurl
				) .
				" ({$current_page_url})";
			update_option( 'bibleget_error_admin_notices', $notices );
			return false;
		}
	}


	/**
	 * Sanitize the query string
	 *
	 * @param string $query The query string to be sanitized before sending to the BibleGet API.
	 * @return array|string
	 */
	private static function sanitize_query( $query ) {
		// enforce query rules.
		if ( '' === $query ) {
			return __( 'You cannot send an empty query.', 'bibleget-io' );
		}
		$query = trim( $query );
		$query = preg_replace( '/\s+/', '', $query );
		$query = preg_replace( "/[\x{2011}-\x{2015}|\x{2212}|\x{23AF}]/u", chr( 45 ), $query );
		$query = str_replace( ' ', '', $query );

		if ( strpos( $query, ':' ) && strpos( $query, '.' ) ) {
			return __( 'Mixed notations have been detected. Please use either english notation or european notation.', 'bibleget-io' ) . '<' . $query . '>';
		} elseif ( strpos( $query, ':' ) ) { // if english notation is detected, translate it to european notation.
			if ( strpos( $query, ',' ) !== -1 ) {
				$query = str_replace( ',', '.', $query );
			}
			$query = str_replace( ':', ',', $query );
		}
		$queries = array_values(
			array_filter(
				explode( ';', $query ),
				function ( $item ) {
					return '' !== $item;
				}
			)
		);

		return array_map( [ 'BibleGet\Plugin', 'to_proper_case' ], $queries );
	}


	/**
	 *
	 */
	public static function admin_notices() {
		$notices = get_option( 'bibleget_error_admin_notices' );
		if ( false !== $notices ) {
			foreach ( $notices as $notice ) {
				echo "<div class='notice is-dismissible error'><p>$notice</p></div>";
			}
			delete_option( 'bibleget_error_admin_notices' );
		}
		$notices = get_option( 'bibleget_admin_notices' );
		if ( false !== $notices ) {
			foreach ( $notices as $notice ) {
				echo "<div class='notice is-dismissible updated'><p>$notice</p></div>";
			}
			delete_option( 'bibleget_admin_notices' );
		}
	}


	/**
	 *
	 */
	private static function delete_options() {
		// DELETE BIBLEGET_BIBLEBOOKS CACHED INFO.
		for ( $i = 0; $i < 73; $i++ ) {
			delete_option( 'bibleget_biblebooks' . $i );
		}

		// DELETE BIBLEGET_LANGUAGES CACHED INFO.
		delete_option( 'bibleget_languages' );

		// DELETE BIBLEGET_VERSIONINDEX CACHED INFO.
		$bibleversionsabbrev = array_keys( get_option( 'bibleget_versions', [] ) );
		foreach ( $bibleversionsabbrev as $abbrev ) {
			delete_option( 'bibleget_' . $abbrev . 'IDX' );
		}

		// DELETE BIBLEGET_VERSIONS CACHED INFO.
		delete_option( 'bibleget_versions' );
	}


	/**
	 * Cache information about Bible books and Bible versions
	 */
	public static function set_options() {
		$bget            = [];
		$bget_properties = new Properties();
		foreach ( $bget_properties->options as $option => $array ) {
			$bget[ $option ] = $array['default']; // default will be based on current option if exists.
		}
		update_option( 'BGET', $bget );

		$metadata = self::get_metadata( 'biblebooks' );
		if ( false !== $metadata ) {
			if ( WP_DEBUG ) {
				self::write_log( 'Retrieved biblebooks metadata...' );
				self::write_log( $metadata );
			}

			if ( property_exists( $metadata, 'results' ) ) {
				$biblebooks = $metadata->results;
				foreach ( $biblebooks as $key => $value ) {
					$biblebooks_str = wp_json_encode( $value );
					$option         = 'bibleget_biblebooks' . $key;
					update_option( $option, $biblebooks_str );
				}
			}
			if ( property_exists( $metadata, 'languages' ) ) {
				$languages = array_map( [ 'BibleGet\Plugin', 'to_proper_case' ], $metadata->languages );
				update_option( 'bibleget_languages', $languages );
			}
		}

		$metadata       = self::get_metadata( 'bibleversions' );
		$versionsabbrev = [];
		if ( false !== $metadata ) {
			if ( WP_DEBUG ) {
				self::write_log( 'Retrieved bibleversions metadata' );
				self::write_log( $metadata );
			}

			if ( property_exists( $metadata, 'validversions_fullname' ) ) {
				$bibleversions     = $metadata->validversions_fullname;
				$versionsabbrev    = array_keys( get_object_vars( $bibleversions ) );
				$bibleversions_str = json_encode( $bibleversions );
				$bbversions        = json_decode( $bibleversions_str, true );
				update_option( 'bibleget_versions', $bbversions );
			}

			if ( WP_DEBUG ) {
				self::write_log( 'versionsabbrev should now be populated:' );
				self::write_log( $versionsabbrev );
			}
		}

		if ( count( $versionsabbrev ) > 0 ) {
			$versionsstr = implode( ',', $versionsabbrev );
			$metadata    = self::get_metadata( 'versionindex&versions=' . $versionsstr );
			if ( false !== $metadata ) {
				if ( WP_DEBUG ) {
					self::write_log( 'Retrieved versionindex metadata' );
					self::write_log( $metadata );
				}

				if ( property_exists( $metadata, 'indexes' ) ) {
					foreach ( $metadata->indexes as $versabbr => $value ) {
						$temp                  = [];
						$temp['book_num']      = $value->book_num;
						$temp['chapter_limit'] = $value->chapter_limit;
						$temp['verse_limit']   = $value->verse_limit;
						$temp['biblebooks']    = $value->biblebooks;
						$temp['abbreviations'] = $value->abbreviations;
						if ( WP_DEBUG ) {
							self::write_log( "creating new option <bibleget_{$versabbr}IDX> with value:" );
							self::write_log( $temp );
						}

						update_option( 'bibleget_' . $versabbr . 'IDX', $temp );
					}
				}
			}
		}

		// we only want the script to die if it's an ajax request...
		if ( isset( $_POST['isajax'] ) && 1 === $_POST['isajax'] ) {
			$notices   = get_option( 'bibleget_admin_notices', [] );
			$notices[] = 'BIBLEGET PLUGIN NOTICE: ' . __( 'BibleGet Server data has been successfully renewed.', 'bibleget-io' );
			update_option( 'bibleget_admin_notices', $notices );
			echo 'datarefreshed';
			wp_die();
		}
	}

	/**
	 * Force refresh cached Bible quotes
	 */
	public static function flush_bible_quotes_cache() {
		global $wpdb;
		// The following SELECT should select both the transient and the transient_timeout
		// This will also remove the Google Fonts API key transient if it uses the same prefix...
		// I guess we'll just have to not use our defined prefix on the Google Fonts API key transient
		// in order avoid this.
		$sql = "DELETE
				FROM  $wpdb->options
				WHERE `option_name` LIKE '%transient_%" . self::TRANSIENT_PREFIX . "%'
				";
		// We shouldn't have to do a $wpdb->prepare here because there is no kind of user input anywhere.
		if ( false !== $wpdb->query( $sql ) ) {
			echo 'cacheflushed';
		} else {
			echo 'cacheNotFlushed';
		}
		wp_die();
	}

	/**
	 * Search for Bible quotes from the BibleGet API by keyword
	 */
	public static function search_by_keyword() {
		$keyword = $_POST['keyword'];
		$version = $_POST['version'];
		$request = 'query=keywordsearch&return=json&appid=wordpress&domain=' . rawurlencode( site_url() ) . '&pluginversion=' . self::VERSION . '&version=' . $version . '&keyword=' . $keyword;
		$ch      = curl_init( self::SEARCH_API );
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );
		curl_setopt( $ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2 );
		curl_setopt( $ch, CURLOPT_POST, 1 );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $request );
		if ( false === ini_get( 'open_basedir' ) ) {
			curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
			curl_setopt( $ch, CURLOPT_AUTOREFERER, true );
		}
		$output = curl_exec( $ch );
		$info   = curl_getinfo( $ch );
		// echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];

		if ( curl_errno( $ch ) ) {
			$error          = new \stdClass();
			$error->errno   = curl_errno( $ch );
			$error->message = curl_error( $ch );
			$error->request = $request;
			echo json_encode( $error );
		} elseif ( 200 !== $info['http_code'] ) {
			echo json_encode( $info );
		} elseif ( $output ) {
			echo $output;
		}
		curl_close( $ch );
		wp_die();
	}

	/**
	 * Update user preferences
	 */
	public static function update_bget() {
		$options = $_POST['options'];
		$bget    = get_option( 'BGET' );
		foreach ( $options as $option => $array ) {
			if ( ! isset( $array['value'] ) || ! isset( $array['type'] ) ) {
				return false;
			}
			switch ( $array['type'] ) {
				case 'string':
					$bget[ $option ] = esc_html( $array['value'] );
					break;
				case 'integer':
					$bget[ $option ] = intval( $array['value'] );
					break;
				case 'number':
					$bget[ $option ] = filter_var( $array['value'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION );
					break;
				case 'boolean':
					$bget[ $option ] = is_bool( $array['value'] )
						? $array['value']
						: filter_var( $array['value'], FILTER_VALIDATE_BOOLEAN );
					break;
				case 'array':
					$bget[ $option ] = is_array( $array['value'] )
						? array_map( 'esc_html', $array['value'] )
						: (
							strpos( ',', $array['value'] )
								? explode( ',', $array['value'] )
								: []
						);
					if ( 0 === count( $bget[ $option ] ) && 'VERSION' === $option ) {
						$bget[ $option ] = [ 'NABRE' ];
					}
					break;
				default:
					// do we need to do some kind of sanitization for this case?
					$bget[ $option ] = esc_html( $array['value'] );
			}
		}
		return update_option( 'BGET', $bget );
	}


	/**
	 * Write info to a debug log
	 *
	 * @param string $log
	 */
	public static function write_log( $log ) {
		$debugfile = plugin_dir_path( __FILE__ ) . '../debug.txt';
		$datetime  = date( 'Y-m-d H:i:s', time() );
		$myfile    = fopen( $debugfile, 'a' );
		if ( false !== $myfile ) {
			if ( is_array( $log ) || is_object( $log ) ) {
				if ( ! fwrite( $myfile, '[' . $datetime . '] ' . print_r( $log, true ) . "\n" ) ) {
					echo '<div style="border: 1px solid Red; background-color: LightRed;">impossible to open or write to: ' . $debugfile . '</div>';
				}
			} elseif ( ! fwrite( $myfile, '[' . $datetime . '] ' . $log . "\n" ) ) {
					echo '<div style="border: 1px solid Red; background-color: LightRed;">impossible to open or write to: ' . $debugfile . '</div>';
			}
			fclose( $myfile );
		} else {
			echo '<div style="border: 1px solid Red; background-color: LightRed;">impossible to open or write to: ' . $debugfile . '</div>';
		}
	}


	/**
	 * Add action links
	 *
	 * @param array $links Action links that are already defined.
	 * @return array
	 */
	public static function add_action_links( $links ) {
		$mylinks = [
			'<a href="' . admin_url( 'options-general.php?page=bibleget-settings-admin' ) . '">' . __( 'Settings' ) . '</a>',
		];
		return array_merge( $links, $mylinks );
	}


	/**
	 * Get Elements By Class name
	 *
	 * @param DOMElement $parent_node Parent node.
	 * @param string     $tag_name Tag name.
	 * @param string     $class_name Class name.
	 * @return array
	 */
	private static function get_elements_by_class( &$parent_node, $tag_name, $class_name ) {
		$nodes = [];

		$child_node_list = $parent_node->getElementsByTagName( $tag_name );
		for ( $i = 0; $i < $child_node_list->length; $i++ ) {
			$temp = $child_node_list->item( $i );
			if ( false !== stripos( $temp->getAttribute( 'class' ), $class_name ) ) {
				$nodes[] = $temp;
			}
		}

		return $nodes;
	}


	/**
	 * Get the url of the current page
	 *
	 * @return string
	 */
	private static function current_page_url() {
		$page_url = 'http';
		if ( isset( $_SERVER['HTTPS'] ) ) {
			if ( $_SERVER['HTTPS'] === 'on' ) {
				$page_url .= 's';
			}
		}
		$page_url .= '://';
		if ( $_SERVER['SERVER_PORT'] !== '80' ) {
			$page_url .= $_SERVER['SERVER_NAME'] . ':' . $_SERVER['SERVER_PORT'] . $_SERVER['REQUEST_URI'];
		} else {
			$page_url .= $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
		}
		return $page_url;
	}
}
