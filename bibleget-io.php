<?php
/**
 * WordPress BibleGet I/O Plugin
 * Copyright(C) 2014-2020, John Romano D'Orazio - priest@johnromanodorazio.com
 *
 * Plugin Name: BibleGet I/O
 * Plugin URI: https://www.bibleget.io/
 * Description: Easily insert Bible quotes from a choice of Bible versions into your articles or pages with the "Bible quote" block or with the shortcode [bibleget].
 * Version: 8.3
 * Requires at least: 5.6
 * Requires PHP: 7.4
 * Author: John Romano D'Orazio
 * Author URI: https://www.johnromanodorazio.com/
 * License: GPLv2 or later
 * Text Domain: bibleget-io
 * Domain Path: /languages/
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
 *
 * @package BibleGet_IO
 */

define( 'BIBLEGETPLUGINVERSION', 'v8_3' );

if ( ! defined( 'ABSPATH' ) ) {
	die( 'You cannot access this file directly.' );
}

define( 'TRANSIENT_PREFIX', 'bibleget_' );

define( 'BIBLE_API', 'https://query.bibleget.io/v3/index.php' );
define( 'SEARCH_API', 'https://query.bibleget.io/v3/search.php' );
define( 'METADATA_API', 'https://query.bibleget.io/v3/metadata.php' );

// error_reporting(E_ALL);
// ini_set('display_errors', 'on');
require_once plugin_dir_path( __FILE__ ) . 'includes/LangCodes.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/BibleGetSettingsPage.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/BGETPROPERTIES.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/BibleGet_Customize.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/QueryValidator.php';


/**
 * Triggered upon activation of the plugin
 * Will set default options and will try to do a bit of cleanup from older versions
 */
function bibleget_on_activation() {
	bibleget_set_options();
	register_uninstall_hook( __FILE__, 'bibleget_on_uninstall' );
}
register_activation_hook( __FILE__, 'bibleget_on_activation' );

/**
 * Triggered when the plugin is uninstalled
 * Will remove any options that have been set
 * and files that have been created
 */
function bibleget_on_uninstall() {
	// Check if we have a Google Fonts API key transient, if so remove it.
	$bibleget_options = get_option( 'bibleget_settings' );
	if ( isset( $bibleget_options['googlefontsapi_key'] ) && $bibleget_options['googlefontsapi_key'] !== '' ) {
		if ( get_transient( md5( $bibleget_options['googlefontsapi_key'] ) ) ) {
			delete_transient( md5( $bibleget_options['googlefontsapi_key'] ) );
		}
	}

	bibleget_delete_options();

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
			WHERE `option_name` LIKE '%transient_%" . TRANSIENT_PREFIX . "%'
			";
	// We shouldn't have to do a $wpdb->prepare here because there is no kind of user input anywhere.
	$wpdb->query( $sql );
	if ( get_filesystem_method() === 'direct' ) {
		$gfonts_dir = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/';
		$creds      = request_filesystem_credentials( site_url() . '/wp-admin/', '', false, false, array() );
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
function bibleget_load_textdomain() {
	$domain = 'bibleget-io';
	// The "plugin_locale" filter is also used in load_plugin_textdomain().
	$locale = apply_filters( 'plugin_locale', get_locale(), $domain );
	// Allow users to add their own custom translations by dropping them in the WordPress 'languages' directory.
	load_textdomain( $domain, WP_LANG_DIR . '/plugins/' . $domain . '-' . $locale . '.mo' );

	load_plugin_textdomain( $domain, false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
// should the action be 'init' instead of 'plugins_loaded'? see http://geertdedeckere.be/article/loading-wordpress-language-files-the-right-way.
add_action( 'plugins_loaded', 'bibleget_load_textdomain' );


/**
 * Let WordPress know that we have text domain translations
 * inside of our gutenberg block javascript file
 */
function bibleget_set_script_translations() {
	$script_handle = generate_block_asset_handle( 'bibleget/bible-quote', 'editorScript' );
	wp_set_script_translations( $script_handle, 'bibleget-io' );
	// wp_set_script_translations( $script_handle, 'bibleget-io', plugin_dir_path( __FILE__ ) . 'languages' );
}
// add_action('init', 'bibleget_set_script_translations');
add_action( 'enqueue_block_editor_assets', 'bibleget_set_script_translations' );


function process_shortcode_attributes( &$atts ) {
	// retrieve all layout options based on BGETPROPERTIES, and use defaults from there,
	// so that shortcode Bible quotes will be consistent with Gutenberg block Bible quotes.
	$bget            = array();
	$bget_properties = new BGETPROPERTIES();
	foreach ( $bget_properties->OPTIONS as $option => $array ) {
		$option_ucase    = $option;
		$option          = strtolower( $option ); // shortcode attributes are all lowercased by default, so we need to lowercase for consistency.
		$bget[ $option ] = $array['default']; // default will be based on current saved option if exists.

		// while we are building our default values, we will also enforce type on $atts so we know we are speaking the same language.
		if ( isset( $atts[ $option ] ) ) {
			$r = new ReflectionClass( 'BGET' );
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
					$atts[ $option ] = BibleGet_Customize::sanitize_float( $atts[ $option ] );
					break;
				case 'integer':
					$atts[ $option ] = absint( $atts[ $option ] );
					break;
				case 'boolean':
					$atts[ $option ] = BibleGet_Customize::sanitize_boolean( $atts[ $option ] );
					break;
				case 'string':
					$atts[ $option ] = esc_html( $atts[ $option ] );
					break;
				case 'array':
					$atts[ $option ] = BibleGet_Customize::sanitize_array( $atts[ $option ] );
					break;
			}
		}
	}
	return $bget;
}

function ensure_indexes_set( $versions ) {
	foreach ( $versions as $version ) {
		if ( get_option( 'bibleget_' . $version . 'IDX' ) === false ) {
			bibleget_set_options();
		}
	}
}

function ensure_biblebooks_set() {
	for ( $i = 0; $i < 73; $i++ ) {
		if ( get_option( 'bibleget_biblebooks' . $i ) === false ) {
			bibleget_set_options();
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
 * @param array  $atts
 * @param string $content
 * @param string $tag
 */
function bibleget_shortcode( $atts = array(), $content = null, $tag = '' ) {
	// add possibility of using "versions" parameter instead of "version".
	if ( isset( $atts['versions'] ) ) {
		$atts['version'] = explode( ',', $atts['versions'] );
	} elseif ( isset( $atts['version'] ) ) {
		$atts['version'] = explode( ',', $atts['version'] );
	}

	$vversions = get_option( 'bibleget_versions', array() );
	if ( count( $vversions ) < 1 ) {
		bibleget_set_options();
		$vversions = get_option( 'bibleget_versions', array() );
	}
	$validversions = array_keys( $vversions );

	$bget = process_shortcode_attributes( $atts );
	$a    = shortcode_atts( $bget, $atts, $tag );
	// now to maintain consistency with our Gutenberg block code etc., let's retransform the keys to uppercase
	// and use $atts instead of $a.
	$atts = array();
	foreach ( $a as $key => $value ) {
		$atts[ strtoupper( $key ) ] = $value;
	}

	if ( $atts['FORCEVERSION'] !== true ) {
		foreach ( $atts['VERSION'] as $version ) {
			if ( ! in_array( $version, $validversions ) ) {
				$optionsurl = admin_url( 'options-general.php?page=bibleget-settings-admin' );
				/* translators: you must not change the placeholders \"%s\" or the html <a href=\"%s\">, </a> */
				$output = '<span style="color:Red;font-weight:bold;">' . sprintf( __( 'The requested version "%1$s" is not valid, please check the list of valid versions in the <a href="%2$s">settings page</a>', 'bibleget-io' ), $version, $optionsurl ) . '</span>';
				return '<div class="bibleget-quote-div">' . $output . '</div>';
			}
		}
	}

	if ( $content !== null && $content !== '' ) {
		$queries = bibleget_query_clean( $content );
	} else {
		$queries = bibleget_query_clean( $atts['QUERY'] );
	}
	return process_queries( $queries, $atts, true, $content );
}
add_shortcode( 'bibleget', 'bibleget_shortcode' );


function process_queries( $queries, $atts, $is_shortcode = false, $content = null ) {
	if ( is_array( $queries ) ) {
		ensure_indexes_set( $atts['VERSION'] );
		ensure_biblebooks_set();
		$current_page_url = bibleget_current_page_url();

		$query_validator = new QueryValidator( $queries, $atts['VERSION'], $current_page_url );
		if ( false === $query_validator->ValidateQueries() ) {
			$output = __( 'Bible Quote failure... (error processing query, please check syntax)', 'bibleget-io' );
			return '<div class="bibleget-quote-div"><span style="color:Red;font-weight:bold;">' . $output . '</span></div>';
		}

		$notices = get_option( 'bibleget_error_admin_notices', array() );
		$notices = array_merge( $notices, $query_validator->errs );
		update_option( 'bibleget_error_admin_notices', $notices );

		$finalquery = process_final_query( $query_validator->validatedQueries, $atts );
		// bibleget_write_log("value of finalquery = ".$finalquery);

		$output = process_output( $finalquery );

		if ( $is_shortcode ) {
			wp_enqueue_script( 'bibleget-script', plugins_url( 'js/shortcode.js', __FILE__ ), array( 'jquery' ), '1.0', true );
			wp_enqueue_script( 'htmlentities-script', '//cdn.jsdelivr.net/gh/mathiasbynens/he@1.2.0/he.min.js', array( 'jquery' ), '1.2.0', true );
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
			$options_no_update_from_block = array( 'POPUP', 'PREFERORIGIN', 'QUERY', 'VERSION' );
			foreach ( $atts as $key => $value ) {
				if ( ! in_array( $key, $options_no_update_from_block ) ) {
					$a[ $key ] = $value;
				}
			}
			update_option( 'BGET', $a );
		}

		$dom_document_processed = process_dom_document( $atts, $output, $content );
		return $dom_document_processed;
	} else {
		/* translators: do not translate "shortcode" unless the version of WordPress in your language uses a translated term to refer to shortcodes */
		$output = '<span style="color:Red;font-weight:bold;">' . __( 'There are errors in the shortcode, please check carefully your query syntax:', 'bibleget-io' ) . ' &lt;' . $a['query'] . '&gt;<br />' . $queries . '</span>';
		return '<div class="bibleget-quote-div">' . $output . '</div>';
	}
}

function process_dom_document( $atts, $output, $content = null ) {
	$non_default_layout = false; // set this flag to true as soon as we see that we have a layout pref that isn't default value, so we will know to update the $output accordingly
	$dom_document      = new DOMDocument();
	$dom_document->loadHTML( '<!DOCTYPE HTML><head></head><body>' . mb_convert_encoding( $output, 'HTML-ENTITIES', 'UTF-8' ) . '</body>' );
	if ( $dom_document ) {
		$xpath   = new DOMXPath( $dom_document );
		$results = $xpath->query( '//div[contains(@class,"results")]' )->item( 0 );
		$errors  = $xpath->query( '//div[contains(@class,"errors")]' )->item( 0 );
		$info    = $xpath->query( '//input[contains(@class,"BibleGetInfo")]' )->item( 0 );

		if ( $atts['LAYOUTPREFS_SHOWBIBLEVERSION'] === false && $results !== false ) {
			$non_default_layout = true;
			$bible_version_els  = $xpath->query( '//p[contains(@class,"bibleVersion")]' );
			foreach ( $bible_version_els as $bible_version_el ) {
				$bible_version_el->setAttribute( 'style', 'display:none;' );
			}
		}

		if ( $atts['LAYOUTPREFS_BIBLEVERSIONALIGNMENT'] !== BGET::ALIGN['LEFT'] && $results !== false ) {
			$non_default_layout = true;
			$bible_version_els  = $xpath->query( '//p[contains(@class,"bibleVersion")]' );
			foreach ( $bible_version_els as $bible_version_el ) {
				$el_class = $bible_version_el->getAttribute( 'class' );
				$bible_version_el->setAttribute( 'class', $el_class . ' bbGetAlign' . $atts['LAYOUTPREFS_BIBLEVERSIONALIGNMENT'] );
			}
		}

		if ( $atts['LAYOUTPREFS_BIBLEVERSIONPOSITION'] !== BGET::POS['TOP'] && $results !== false ) {
			$non_default_layout  = true;
			$bible_version_els   = $xpath->query( '//p[contains(@class,"bibleVersion")]' );
			$bible_version_cnt   = $bible_version_els->count();
			$bible_version_stack = array();
			switch ( $bible_version_cnt ) {
				case 0:
					// don't do anything
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

		if ( $atts['LAYOUTPREFS_BIBLEVERSIONWRAP'] !== BGET::WRAP['NONE'] && $results !== false ) {
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

		if ( $atts['LAYOUTPREFS_BOOKCHAPTERALIGNMENT'] !== BGET::ALIGN['LEFT'] && $results !== false ) {
			$non_default_layout = true;
			$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
			foreach ( $book_chapter_els as $book_chapter_el ) {
				$el_class = $book_chapter_el->getAttribute( 'class' );
				$book_chapter_el->setAttribute( 'class', $el_class . ' bbGetAlign' . $atts['LAYOUTPREFS_BOOKCHAPTERALIGNMENT'] );
			}
		}

		if ( ( $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] !== BGET::FORMAT['BIBLELANG'] ) && $results !== false ) {
			$non_default_layout = true;
			$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
			if ( $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT['USERLANG'] || $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT['USERLANGABBREV'] ) {
				$locale        = substr( get_locale(), 0, 2 );
				$language_name = Locale::getDisplayLanguage( $locale, 'en' );
				foreach ( $book_chapter_els as $book_chapter_el ) {
					$bookNum = (int) $xpath->query( 'following-sibling::input[@class="univBookNum"]', $book_chapter_el )->item( 0 )->getAttribute( 'value' );
					$usrprop = 'bibleget_biblebooks' . ( $bookNum - 1 );
					$jsbook  = json_decode( get_option( $usrprop ), true );
					// get the index of the current language from the available languages
					$biblebookslangs = get_option( 'bibleget_languages' );
					$currentLangIdx  = array_search( $language_name, $biblebookslangs );
					if ( $currentLangIdx === false ) {
						$currentLangIdx = array_search( 'English', $biblebookslangs );
					}
					$lclbook         = trim( explode( '|', $jsbook[ $currentLangIdx ][0] )[0] );
					$lclabbrev       = trim( explode( '|', $jsbook[ $currentLangIdx ][1] )[0] );
					$book_chapter_text = $book_chapter_el->textContent;
					// Remove book name from the string (check includes any possible spaces in the book name).
					if ( preg_match( '/^([1-3I]{0,3}[\s]{0,1}((\p{L}\p{M}*)+))/u', $book_chapter_text, $res ) ) {
						$book_chapter_text = str_replace( $res[0], '', $book_chapter_text );
					}

					if ( $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT['USERLANGABBREV'] ) {
						// use abbreviated form in wp lang
						$book_chapter_el->textContent = $lclabbrev . $book_chapter_text;
					} else {
						// use full form in wp lang
						$book_chapter_el->textContent = $lclbook . $book_chapter_text;
					}
				}
			} elseif ( $atts['LAYOUTPREFS_BOOKCHAPTERFORMAT'] === BGET::FORMAT['BIBLELANGABBREV'] ) {
				// use abbreviated form in bible version lang.
				foreach ( $book_chapter_els as $book_chapter_el ) {
					$bookAbbrev      = $xpath->query( 'following-sibling::input[@class="bookAbbrev"]', $book_chapter_el )->item( 0 )->getAttribute( 'value' );
					$book_chapter_text = $book_chapter_el->textContent;
					if ( preg_match( '/^([1-3I]{0,3}[\s]{0,1}((\p{L}\p{M}*)+))/u', $book_chapter_text, $res ) ) {
						$book_chapter_text = str_replace( $res[0], '', $book_chapter_text );
					}
					$book_chapter_el->textContent = $bookAbbrev . $book_chapter_text;
				}
			}
		}

		/*
		Make sure to deal with fullreference before you deal with pos or wrap
		=> if pos is bottominline it will change the p to a span and then we won't know what to look for
		=> if we have already wrapped then the fullreference will be appended to the parentheses or the brackets!
		 */
		if ( $atts['LAYOUTPREFS_BOOKCHAPTERFULLQUERY'] === true && $results !== false ) {
			$non_default_layout = true;
			$book_chapter_els   = $xpath->query( '//p[contains(@class,"bookChapter")]' );
			foreach ( $book_chapter_els as $book_chapter_el ) {
				$text          = $book_chapter_el->textContent;
				$original_query = $xpath->query( 'following-sibling::input[@class="originalQuery"]', $book_chapter_el )->item( 0 )->getAttribute( 'value' );
				// remove book from the original query
				if ( preg_match( '/^([1-3]{0,1}((\p{L}\p{M}*)+)[1-9][0-9]{0,2})/u', $original_query, $res ) ) {
					$original_query = str_replace( $res[0], '', $original_query );
				}
				/*
				if (preg_match("/^/u", $original_query, $res)) {
				$original_query = str_replace($res[0], "", $original_query);
				}*/
				$book_chapter_el->textContent = $text . $original_query;
			}
		}

		/* Make sure to deal with wrap before you deal with pos, because if pos is bottominline it will change the p to a span and then we won't know what to look for */
		if ( $atts['LAYOUTPREFS_BOOKCHAPTERWRAP'] !== BGET::WRAP['NONE'] && $results !== false ) {
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

		if ( $atts['LAYOUTPREFS_BOOKCHAPTERPOSITION'] !== BGET::POS['TOP'] && $results !== false ) {
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

		if ( $atts['LAYOUTPREFS_SHOWVERSENUMBERS'] === BGET::VISIBILITY['HIDE'] && $results !== false ) {
			$non_default_layout = true;
			$verse_number_els   = $xpath->query( '//span[contains(@class,"verseNum")]' );
			foreach ( $verse_number_els as $verse_number_el ) {
				$verse_number_el->setAttribute( 'style', 'display:none;' );
			}
		}

		// If any of the Layout options were not the default options, then we need to update our $output with the new html layout.
		if ( $non_default_layout === true ) {
			$output = $dom_document->saveHTML( $results );
			if ( $errors !== null ) {
				$output .= $dom_document->saveHTML( $errors );
			}
			if ( $info !== null ) {
				$output .= $dom_document->saveHTML( $info );
			}
		}
	}

	if ( $atts['POPUP'] === true ) {
		wp_enqueue_script( 'jquery-ui-dialog' );
		wp_enqueue_style( 'wp-jquery-ui-dialog' );
		wp_enqueue_style( 'bibleget-popup', plugins_url( 'css/popup.css', __FILE__ ) );
		if ( $content !== null && $content !== '' ) {
			return '<a href="#" class="bibleget-popup-trigger" data-popupcontent="' . htmlspecialchars( $output ) . '">' . $content . '</a>';
		} else {
			return '<a href="#" class="bibleget-popup-trigger" data-popupcontent="' . htmlspecialchars( $output ) . '">' . $atts['QUERY'] . '</a>';
		}
	} else {
		return '<div class="bibleget-quote-div">' . $output . '</div>';
	}
}

/**
 * BibleGet Gutenberg Block!
 * Transforming the shortcode into a block
 */
function bibleget_gutenberg() {
	// Skip block registration if Gutenberg is not enabled/merged.
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	$dir = __DIR__;

	$gutenberg_js = 'js/gutenberg.js';
	wp_register_script(
		'bibleget-gutenberg-block',
		plugins_url( $gutenberg_js, __FILE__ ),
		array(
			'wp-blocks',
			'wp-element',
			'wp-i18n',
			'wp-editor',
			'wp-components',
			'jquery-ui-dialog',
		),
		filemtime( "$dir/$gutenberg_js" )
	);

	$gutenberg_css = 'css/gutenberg.css';
	wp_register_style(
		'bibleget-gutenberg-editor',
		plugins_url( $gutenberg_css, __FILE__ ),
		array( 'wp-jquery-ui-dialog' ),
		filemtime( "$dir/$gutenberg_css" )
	);

	// we aren't actually going to create the settings page here,
	// we're just using some of the same information that is used to create the settings page.
	$options_info           = new BibleGetSettingsPage();
	$versions_by_lang       = $options_info->getVersionsByLang();
	$bibleget_books_in_lang = $options_info->getBibleBookNamesInLang();
	// These are our default settings, we will use them for the Gutenberg block
	// they could perhaps take the place of the properties defined for the Customizer.
	$bget_properties = new BGETPROPERTIES();
	// and these are our constants, as close as I can get to ENUMS
	// hey with this operation they transform quite nicely for the client side javascript!
	$bgetreflection    = new ReflectionClass( 'BGET' );
	$bgetinstanceprops = $bgetreflection->getConstants();
	$bget_constants    = array();
	foreach ( $bgetinstanceprops as $key => $value ) {
		$bget_constants[ $key ] = $value;
	}

	$have_gfonts      = $options_info->gfontsAPIkeyCheck();
	$gfonts           = null;
	$gfonts_dir       = str_replace( '\\', '/', plugin_dir_path( __FILE__ ) ) . 'gfonts_preview/';
	$gfonts_file_path = $gfonts_dir . 'gfontsWeblist.json';
	if ( $have_gfonts === 'SUCCESS' && file_exists( $gfonts_file_path ) ) {
		$gfonts = json_decode( file_get_contents( $gfonts_file_path ) );
	}

	$myvars = array(
		'ajax_url'           => admin_url( 'admin-ajax.php' ),
		'bibleget_admin_url' => admin_url( 'options-general.php?page=bibleget-settings-admin' ),
		'langCodes'          => LANGCODES,
		'currentLangISO'     => get_bloginfo( 'language' ),
		'versionsByLang'     => $versions_by_lang,
		'biblebooks'         => $bibleget_books_in_lang,
		'BGETProperties'     => $bget_properties->OPTIONS,
		'BGETConstants'      => $bget_constants,
		'haveGFonts'         => $have_gfonts,
		'GFonts'             => $gfonts,
	);
	wp_localize_script( 'bibleget-gutenberg-block', 'BibleGetGlobal', $myvars );

	register_block_type(
		'bibleget/bible-quote',
		array(
			'editor_script'   => 'bibleget-gutenberg-block',
			'editor_style'    => 'bibleget-gutenberg-editor',
			'render_callback' => 'bibleGet_renderGutenbergBlock',
			'attributes'      => $bget_properties->OPTIONS,
		)
	);
}
add_action( 'init', 'bibleget_gutenberg' );


function bibleget_gutenberg_scripts( $hook ) {
	if ( $hook !== 'post.php' && $hook !== 'post-new.php' ) {
		return;
	}
	wp_enqueue_script( 'jquery-ui-dialog' );
	wp_enqueue_style( 'wp-jquery-ui-dialog' );
	wp_enqueue_style( 'bibleget-popup', plugins_url( 'css/popup.css', __FILE__ ) );
	wp_enqueue_script( 'htmlentities-script', '//cdn.jsdelivr.net/gh/mathiasbynens/he@1.2.0/he.min.js', array( 'jquery' ), '1.2.0', true );
	if ( ! wp_style_is( 'fontawesome', 'enqueued' ) ) {
		if ( false === is_fontawesome_enqueued() ) {
			wp_enqueue_style( 'fontawesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', false, '4.7.0' );
		}
	}
	$gfonts_preview_css = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/css/gfonts_preview.css';
	$gfonts_preview_url = wp_upload_dir()['baseurl'] . '/gfonts_preview/css/gfonts_preview.css';
	if ( file_exists( $gfonts_preview_css ) ) {
		wp_enqueue_style( 'bibleget-fontselect-preview', $gfonts_preview_url );
	}
}
add_action( 'admin_enqueue_scripts', 'bibleget_gutenberg_scripts' );


function is_fontawesome_enqueued() {
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

function process_output( $finalquery ) {
	$output = get_transient( TRANSIENT_PREFIX . md5( $finalquery ) );
	if ( false === $output ) {
		$output = bibleget_query_server( $finalquery );
		if ( $output ) {
			$output = str_replace( PHP_EOL, '', $output );
			set_transient( TRANSIENT_PREFIX . md5( $finalquery ), $output, 7 * 24 * HOUR_IN_SECONDS );
		} else {
			$output = '<span style="color:Red;font-weight:bold;">' . __( 'Bible Quote failure... Temporary error from the BibleGet server. Please try again in a few minutes', 'bibleget-io' ) . '</span>';
		}
	}
	return $output;
}

function process_final_query( $goodqueries, $atts ) {
	$finalquery  = 'query=';
	$finalquery .= implode( ';', $goodqueries );
	$finalquery .= '&version=';
	$finalquery .= implode( ',', $atts['VERSION'] );
	if ( $atts['PREFERORIGIN'] === BGET::PREFERORIGIN['GREEK'] ) {
		$finalquery .= '&preferorigin=GREEK';
	} elseif ( $atts['PREFERORIGIN'] === BGET::PREFERORIGIN['HEBREW'] ) {
		$finalquery .= '&preferorigin=HEBREW';
	}
	if ( $atts['FORCEVERSION'] === true ) {
		$finalquery .= '&forceversion=true';
	}
	if ( $atts['FORCECOPYRIGHT'] === true ) {
		$finalquery .= '&forcecopyright=true';
	}
	return $finalquery;
}

/**
 * Gutenberg Render callback
 */
function bibleGet_renderGutenbergBlock( $atts ) {
	$output = ''; // this will be whatever html we are returning to be rendered
	// Determine bible version(s).
	$atts['VERSION'] = ( ! empty( $atts['VERSION'] ) ? $atts['VERSION'] : array( 'NABRE' ) );

	if ( count( $atts['VERSION'] ) < 1 ) {
		/* translators: do NOT translate the parameter names "version" or "versions" !!! */
		$output = '<span style="color:Red;font-weight:bold;">' . __( 'You must indicate the desired version with the parameter "version" (or the desired versions as a comma separated list with the parameter "versions")', 'bibleget-io' ) . '</span>';
		return '<div class="bibleget-quote-div">' . $output . '</div>';
	}

	$vversions = get_option( 'bibleget_versions', array() );
	if ( count( $vversions ) < 1 ) {
		bibleget_set_options();
		$vversions = get_option( 'bibleget_versions', array() );
	}
	$validversions = array_keys( $vversions );
	// echo "<div style=\"border:10px solid Blue;\">".print_r($validversions)."</div>";
	if ( $atts['FORCEVERSION'] !== true ) {
		foreach ( $atts['VERSION'] as $version ) {
			if ( ! in_array( $version, $validversions ) ) {
				$optionsurl = admin_url( 'options-general.php?page=bibleget-settings-admin' );
				/* translators: you must not change the placeholders \"%s\" or the html <a href=\"%s\">, </a> */
				$output = '<span style="color:Red;font-weight:bold;">' . sprintf( __( 'The requested version "%1$s" is not valid, please check the list of valid versions in the <a href="%2$s">settings page</a>', 'bibleget-io' ), $version, $optionsurl ) . '</span>';
				return '<div class="bibleget-quote-div">' . $output . '</div>';
			}
		}
	}

	$queries = bibleget_query_clean( $atts['QUERY'] );
	return process_queries( $queries, $atts );
}

/**
 * After a query has been checked for integrity, this will send the query request to the BibleGet Server
 * Returns the response from the BibleGet Server
 *
 * @param string $finalquery
 */
function bibleget_query_server( $finalquery ) {
	$current_page_url = bibleget_current_page_url();
	$errs           = array();
	// We will make a secure connection to the BibleGet service endpoint,
	// if this server's OpenSSL and CURL versions support TLSv1.2
	$curl_version = curl_version();
	$ssl_version  = str_replace( 'OpenSSL/', '', $curl_version['ssl_version'] );
	if ( version_compare( $curl_version['version'], '7.34.0', '>=' ) && version_compare( $ssl_version, '1.0.1', '>=' ) ) {
		// we should be good to go for secure SSL communication supporting TLSv1_2
		$ch = curl_init( BIBLE_API . '?' . $finalquery . '&return=html&appid=wordpress&domain=' . urlencode( site_url() ) . '&pluginversion=' . BIBLEGETPLUGINVERSION );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );
		curl_setopt( $ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2 );
	} else {
		$ch = curl_init( 'http://query.bibleget.io/v3/index.php?' . $finalquery . '&return=html&appid=wordpress&domain=' . urlencode( site_url() ) . '&pluginversion=' . BIBLEGETPLUGINVERSION );
	}

	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );

	if ( ini_get( 'open_basedir' ) === false ) {
		curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $ch, CURLOPT_AUTOREFERER, true );
	}
	$output = curl_exec( $ch );
	if ( $output && ! curl_errno( $ch ) ) {
		// remove style and title tags from the output if they are present(should not be present with more recent BibleGet engine.
		$output = substr( $output, 0, strpos( $output, '<style' ) ) . substr( $output, strpos( $output, '</style' ), strlen( $output ) );
		$output = substr( $output, 0, strpos( $output, '<title' ) ) . substr( $output, strpos( $output, '</title' ), strlen( $output ) );

		$count1 = null;
		$count2 = null;
		$output = preg_replace( '/&lt;(sm|pof|po|pol|pos|poif|poi|poil|po3|po3l|speaker)&gt;/', '<span class="$1">', $output, -1, $count1 );
		$output = preg_replace( '/&lt;\/(sm|pof|po|pol|pos|poif|poi|poil|po3|po3l|speaker)&gt;/', '</span>', $output, -1, $count2 );
		// $output .= "<br /><br />Effettuate ".$count1." e ".$count2." sostituzioni.";

		$matches = null;
		if ( preg_match_all( '/<div class="errors bibleQuote">.*?<\/div>/s', $output, $matches ) ) {
			// capture table of error messages, and turn it into notices for backend.
			$errorshtml = new DOMDocument();
			$errorshtml->loadHTML( '<!DOCTYPE HTML><head><title>BibleGet Query Errors</title></head><body>' . $matches[0][0] . '</body>' );
			$error_rows = $errorshtml->getElementsByTagName( 'tr' );
			if ( $error_rows !== null && $error_rows->length > 0 ) {
				$errs = get_option( 'bibleget_error_admin_notices', array() );
				foreach ( $error_rows as $error_row ) {
					$errormessage = bibleget_get_elements_by_class( $error_row, 'td', 'errMessageVal' );
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
	} else {
		$errs[] = 'BIBLEGET SERVER ERROR: <span style="color:Red;font-weight:bold;">' .
			__( 'There was an error communicating with the BibleGet server, please wait a few minutes and try again', 'bibleget-io' ) .
			': &apos;' . curl_error( $ch ) . '&apos;: ' .
			$finalquery .
			'</span>';
		$output = false;
	}
	curl_close( $ch );
	update_option( 'bibleget_error_admin_notices', $errs );
	return $output;
}



/* Mighty fine and dandy helper function I created! */
/**
 * BibleGet To ProperCase
 *
 * @param string $txt
 *
 * Helper function that modifies the query so that it is in a correct Proper Case,
 * taking into account numbers at the beginning of the string
 * Can handle any kind of Unicode string in any language
 */
function bibleget_to_proper_case( $txt ) {
	// echo "<div style=\"border:3px solid Yellow;\">txt = $txt</div>";
	preg_match( '/\p{L}/u', $txt, $matches, PREG_OFFSET_CAPTURE );
	$idx = intval( $matches[0][1] );
	// echo "<div style=\"border:3px solid Purple;\">idx = $idx</div>";
	$chr = mb_substr( $txt, $idx, 1, 'UTF-8' );
	// echo "<div style=\"border:3px solid Pink;\">chr = $chr</div>";
	if ( preg_match( '/\p{L&}/u', $chr ) ) {
		$post = mb_substr( $txt, $idx + 1, mb_strlen( $txt ), 'UTF-8' );
		// echo "<div style=\"border:3px solid Black;\">post = $post</div>";
		return mb_substr( $txt, 0, $idx, 'UTF-8' ) . mb_strtoupper( $chr, 'UTF-8' ) . mb_strtolower( $post, 'UTF-8' );
	} else {
		return $txt;
	}
}

/**
 * BibleGet IndexOf Function
 *
 * @param unknown $needle
 * @param unknown $haystack
 *
 * Helper function that will return the index of a bible book from a two-dimensional index array
 */
function bibleget_index_of( $needle, $haystack ) {
	foreach ( $haystack as $index => $value ) {
		if ( is_array( $value ) ) {
			foreach ( $value as $value2 ) {
				if ( in_array( $needle, $value2 ) ) {
					return $index;
				}
			}
		} elseif ( in_array( $needle, $value ) ) {
			return $index;
		}
	}
	return false;
}



function set_communication_error( $notices, $err ) {
	$options_url      = admin_url( 'options-general.php?page=bibleget-settings-admin' );
	$current_page_url = bibleget_current_page_url();
	$errs             = array(
		'',
		/* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
		__( 'There was a problem communicating with the BibleGet server. <a href="%s" title="update metadata now">Metadata needs to be manually updated</a>.', 'bibleget-io' ),
		/* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
		__( 'There may have been a problem communicating with the BibleGet server. <a href="%s" title="update metadata now">Metadata needs to be manually updated</a>.', 'bibleget-io' ),
	);
	$notices[]        = 'BIBLEGET PLUGIN ERROR: ' .
		sprintf( $errs[ $err ], $options_url ) . " ({$current_page_url})";
	update_option( 'bibleget_error_admin_notices', $notices );
}

/**
 *
 * @var request
 */
function bibleget_get_metadata( $request ) {
	// request can be for building the biblebooks variable, or for building version indexes, or for requesting current validversions
	$notices          = get_option( 'bibleget_error_admin_notices', array() );
	$current_page_url = bibleget_current_page_url();
	$curl_version     = curl_version();
	$ssl_version      = str_replace( 'OpenSSL/', '', $curl_version['ssl_version'] );
	if ( version_compare( $curl_version['version'], '7.34.0', '>=' ) && version_compare( $ssl_version, '1.0.1', '>=' ) ) {
		// we should be good to go for secure SSL communication supporting TLSv1_2.
		$url = METADATA_API . '?query=' . $request . '&return=json';
		$ch  = curl_init( $url );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );
		curl_setopt( $ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2 );
	} else {
		$url = 'http://query.bibleget.io/v3/metadata.php?query=' . $request . '&return=json';
		$ch  = curl_init( $url );
	}

	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );

	if ( ini_get( 'open_basedir' ) === false ) {
		curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $ch, CURLOPT_AUTOREFERER, true );
	}

	$response = curl_exec( $ch );
	if ( curl_errno( $ch ) && ( curl_errno( $ch ) === 77 || curl_errno( $ch ) === 60 ) && $url === METADATA_API . '?query=' . $request . '&return=json' ) {
		// error 60: SSL certificate problem: unable to get local issuer certificate
		// error 77: error setting certificate verify locations CAPath: none
		// curl.cainfo needs to be set in php.ini to point to the curl pem bundle available at https://curl.haxx.se/ca/cacert.pem
		// until that's fixed on the server environment let's resort to a simple http request.
		$url = 'http://query.bibleget.io/v3/metadata.php?query=' . $request . '&return=json';
		curl_setopt( $ch, CURLOPT_URL, $url );
		$response = curl_exec( $ch );
		if ( curl_errno( $ch ) ) {
			set_communication_error( $notices, 1 );
			return false;
		} else {
			$info = curl_getinfo( $ch );
			// echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];
			if ( $info['http_code'] !== 200 && $info['http_code'] !== 304 ) {
				set_communication_error( $notices, 2 );
				return false;
			}
		}
	} elseif ( curl_errno( $ch ) ) {
		set_communication_error( $notices, 1 );
		return false;
	} else {
		$info = curl_getinfo( $ch );
		// echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];
		if ( $info['http_code'] !== 200 && $info['http_code'] !== 304 ) {
			set_communication_error( $notices, 2 );
			return false;
		}
	}
	curl_close( $ch );

	$myjson = json_decode( $response );
	if ( property_exists( $myjson, 'results' ) ) {
		return $myjson;
		// var verses = myjson.results;
	} else {
		$optionsurl = admin_url( 'options-general.php?page=bibleget-settings-admin' );
		/* translators: do not change the placeholders or the html markup, though you can translate the anchor title */
		$notices[] = 'BIBLEGET PLUGIN ERROR: ' .
			sprintf(
				__( 'There may have been a problem communicating with the BibleGet server. <a href="%s" title="update metadata now">Metadata needs to be manually updated</a>.', 'bibleget-io' ),
				$optionsurl
			) .
			" ({$current_page_url})";
		update_option( 'bibleget_error_admin_notices', $notices );
		return false;
	}
}


/**
 *
 * @param string $query
 * @return number
 */
function bibleget_query_clean( $query ) {
	// enforce query rules.
	if ( $query === '' ) {
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
			function ( $var ) {
				return $var !== '';
			}
		)
	);

	return array_map( 'bibleget_to_proper_case', $queries );
}


/**
 *
 */
function bibleget_admin_notices() {
	$notices = get_option( 'bibleget_error_admin_notices' );
	if ( $notices !== false ) {
		foreach ( $notices as $notice ) {
			echo "<div class='notice is-dismissible error'><p>$notice</p></div>";
		}
		delete_option( 'bibleget_error_admin_notices' );
	}
	$notices = get_option( 'bibleget_admin_notices' );
	if ( $notices !== false ) {
		foreach ( $notices as $notice ) {
			echo "<div class='notice is-dismissible updated'><p>$notice</p></div>";
		}
		delete_option( 'bibleget_admin_notices' );
	}
}
add_action( 'admin_notices', 'bibleget_admin_notices' );


/**
 *
 */
function bibleget_delete_options() {
	// DELETE BIBLEGET_BIBLEBOOKS CACHED INFO
	for ( $i = 0; $i < 73; $i++ ) {
		delete_option( 'bibleget_biblebooks' . $i );
	}

	// DELETE BIBLEGET_LANGUAGES CACHED INFO
	delete_option( 'bibleget_languages' );

	// DELETE BIBLEGET_VERSIONINDEX CACHED INFO
	$bibleversionsabbrev = array_keys( get_option( 'bibleget_versions', array() ) );
	foreach ( $bibleversionsabbrev as $abbrev ) {
		delete_option( 'bibleget_' . $abbrev . 'IDX' );
	}

	// DELETE BIBLEGET_VERSIONS CACHED INFO
	delete_option( 'bibleget_versions' );
}


/**
 *
 */
function bibleget_set_options() {
	$bget            = array();
	$bget_properties = new BGETPROPERTIES();
	foreach ( $bget_properties->OPTIONS as $option => $array ) {
		$bget[ $option ] = $array['default']; // default will be based on current option if exists
	}
	update_option( 'BGET', $bget );

	$metadata = bibleget_get_metadata( 'biblebooks' );
	if ( $metadata !== false ) {
		// bibleget_write_log("Retrieved biblebooks metadata...");
		// bibleget_write_log($metadata);
		if ( property_exists( $metadata, 'results' ) ) {
			$biblebooks = $metadata->results;
			foreach ( $biblebooks as $key => $value ) {
				$biblebooks_str = json_encode( $value );
				$option         = 'bibleget_biblebooks' . $key;
				update_option( $option, $biblebooks_str );
			}
		}
		if ( property_exists( $metadata, 'languages' ) ) {
			// echo "<div style=\"border:3px solid Red;\">languages = ".print_r($metadata->languages,true)."</div>";
			$languages = array_map( 'bibleget_to_proper_case', $metadata->languages );
			// echo "<div style=\"border:3px solid Red;\">languages = ".print_r($languages,true)."</div>";
			// $languages_str = json_encode($languages);
			update_option( 'bibleget_languages', $languages );
		}
	}

	$metadata       = bibleget_get_metadata( 'bibleversions' );
	$versionsabbrev = array();
	if ( $metadata !== false ) {
		// bibleget_write_log("Retrieved bibleversions metadata");
		// bibleget_write_log($metadata);
		if ( property_exists( $metadata, 'validversions_fullname' ) ) {
			$bibleversions     = $metadata->validversions_fullname;
			$versionsabbrev    = array_keys( get_object_vars( $bibleversions ) );
			$bibleversions_str = json_encode( $bibleversions );
			$bbversions        = json_decode( $bibleversions_str, true );
			update_option( 'bibleget_versions', $bbversions );
		}
		// bibleget_write_log("versionsabbrev should now be populated:");
		// bibleget_write_log($versionsabbrev);
	}

	if ( count( $versionsabbrev ) > 0 ) {
		$versionsstr = implode( ',', $versionsabbrev );
		$metadata    = bibleget_get_metadata( 'versionindex&versions=' . $versionsstr );
		if ( $metadata !== false ) {
			// bibleget_write_log("Retrieved versionindex metadata");
			// bibleget_write_log($metadata);
			if ( property_exists( $metadata, 'indexes' ) ) {
				foreach ( $metadata->indexes as $versabbr => $value ) {
					$temp                  = array();
					$temp['book_num']      = $value->book_num;
					$temp['chapter_limit'] = $value->chapter_limit;
					$temp['verse_limit']   = $value->verse_limit;
					$temp['biblebooks']    = $value->biblebooks;
					$temp['abbreviations'] = $value->abbreviations;
					// $versionindex_str = json_encode($temp);
					// bibleget_write_log("creating new option:["."bibleget_".$versabbr."IDX"."] with value:");
					// bibleget_write_log($temp);
					update_option( 'bibleget_' . $versabbr . 'IDX', $temp );
				}
			}
		}
	}

	// we only want the script to die if it's an ajax request...
	if ( isset( $_POST['isajax'] ) && $_POST['isajax'] === 1 ) {
		$notices   = get_option( 'bibleget_admin_notices', array() );
		$notices[] = 'BIBLEGET PLUGIN NOTICE: ' . __( 'BibleGet Server data has been successfully renewed.', 'bibleget-io' );
		update_option( 'bibleget_admin_notices', $notices );
		echo 'datarefreshed';
		wp_die();
	}
}
add_action( 'wp_ajax_refresh_bibleget_server_data', 'bibleget_set_options' );

function flush_bible_quotes_cache() {
	global $wpdb;
	// The following SELECT should select both the transient and the transient_timeout
	// This will also remove the Google Fonts API key transient if it uses the same prefix...
	// I guess we'll just have to not use our defined prefix on the Google Fonts API key transient
	// in order avoid this.
	$sql = "DELETE
			FROM  $wpdb->options
			WHERE `option_name` LIKE '%transient_%" . TRANSIENT_PREFIX . "%'
			";
	// We shouldn't have to do a $wpdb->prepare here because there is no kind of user input anywhere.
	if ( $wpdb->query( $sql ) !== false ) {
		echo 'cacheflushed';
	} else {
		echo 'cacheNotFlushed';
	}
	wp_die();
}

add_action( 'wp_ajax_flush_bible_quotes_cache', 'flush_bible_quotes_cache' );

function search_by_keyword() {
	$keyword = $_POST['keyword'];
	$version = $_POST['version'];
	$request = 'query=keywordsearch&return=json&appid=wordpress&domain=' . rawurlencode( site_url() ) . '&pluginversion=' . BIBLEGETPLUGINVERSION . '&version=' . $version . '&keyword=' . $keyword;
	$ch      = curl_init( SEARCH_API );
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
	curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );
	curl_setopt( $ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2 );
	curl_setopt( $ch, CURLOPT_POST, 1 );
	curl_setopt( $ch, CURLOPT_POSTFIELDS, $request );
	if ( ini_get( 'open_basedir' ) === false ) {
		curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $ch, CURLOPT_AUTOREFERER, true );
	}
	$output = curl_exec( $ch );
	$info   = curl_getinfo( $ch );
	// echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url'];

	if ( curl_errno( $ch ) ) {
		$error          = new stdClass();
		$error->errno   = curl_errno( $ch );
		$error->message = curl_error( $ch );
		$error->request = $request;
		echo json_encode( $error );
	} elseif ( $info['http_code'] !== 200 ) {
		echo json_encode( $info );
	} elseif ( $output ) {
		echo $output;
	}
	curl_close( $ch );
	wp_die();
}

add_action( 'wp_ajax_search_by_keyword', 'search_by_keyword' );

function update_bget() {
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
			case 'boolean';
				$bget[ $option ] = is_bool( $array['value'] ) ? $array['value'] : $array['value'] === 'true';
				break;
			case 'array':
				$bget[ $option ] = is_array( $array['value'] ) ? array_map( 'esc_html', $array['value'] ) : ( strpos( ',', $array['value'] ) ? explode( ',', $array['value'] ) : array() );
				if ( count( $bget[ $option ] ) === 0 && $option === 'VERSION' ) {
					$bget[ $option ] = array( 'NABRE' );
				}
				break;
			default:
				// do we need to do some kind of sanitization for this case?
				$bget[ $option ] = esc_html( $array['value'] );
		}
	}
	return update_option( 'BGET', $bget );
}

add_action( 'wp_ajax_update_bget', 'update_bget' );


if ( is_admin() ) {
	$bibleget_settings_page = new BibleGetSettingsPage();

	// bibleget_write_log("about to initialize creation of admin page...");
	$bibleget_settings_page->Init(); // only init will actually register and print out the settings and the options page
}


/**
 * END OF SETTINGS PAGE
 *
 * START OF CUSTOMIZER OPTIONS
 */



add_action( 'wp_enqueue_scripts', array( 'BibleGet_Customize', 'bibleget_customizer_print_script' ) );
add_action( 'admin_enqueue_scripts', array( 'BibleGet_Customize', 'bibleget_customizer_print_script' ) );

// Setup the Theme Customizer settings and controls...
add_action(
	'customize_register',
	array(
		'BibleGet_Customize',
		'register',
	)
);

// Output custom CSS to live site.
add_action(
	'wp_head',
	array(
		'BibleGet_Customize',
		'header_output',
	)
);

// Output custom CSS to admin area for gutenberg previews.
add_action(
	'admin_head',
	array(
		'BibleGet_Customize',
		'header_output',
	)
);


// Enqueue live preview javascript in Theme Customizer admin screen.
add_action(
	'customize_preview_init',
	array(
		'BibleGet_Customize',
		'live_preview',
	)
);

/**
 * Function bibleget_write_log
 * useful for debugging purposes
 *
 * @param unknown $log
 */
function bibleget_write_log( $log ) {
	$debugfile = plugin_dir_path( __FILE__ ) . 'debug.txt';
	$datetime  = date( 'Y-m-d H:i:s', time() );
	$myfile    = fopen( $debugfile, 'a' );
	if ( $myfile !== false ) {
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
 *
 * @param unknown $links
 */
function bibleget_add_action_links( $links ) {
	$mylinks = array(
		'<a href="' . admin_url( 'options-general.php?page=bibleget-settings-admin' ) . '">' . __( 'Settings' ) . '</a>',
	);
	return array_merge( $links, $mylinks );
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'bibleget_add_action_links' );


/**
 *
 * @param DOMElement $parent_node
 * @param string $tag_name
 * @param string $class_name
 */
function bibleget_get_elements_by_class( &$parent_node, $tag_name, $class_name ) {
	$nodes = array();

	$child_node_list = $parent_node->getElementsByTagName( $tag_name );
	for ( $i = 0; $i < $child_node_list->length; $i++ ) {
		$temp = $child_node_list->item( $i );
		if ( stripos( $temp->getAttribute( 'class' ), $class_name ) !== false ) {
			$nodes[] = $temp;
		}
	}

	return $nodes;
}


/**
 *
 */
function bibleget_current_page_url() {
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
