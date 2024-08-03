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
 * @package BibleGet
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'You cannot access this file directly.' );
}

// error_reporting( E_ALL );
// ini_set( 'display_errors', 'on' );

use BibleGet\SettingsPage;

require_once plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';

register_activation_hook( __FILE__, array( 'BibleGet\Plugin', 'on_activation' ) );
register_uninstall_hook( __FILE__, array( 'BibleGet\Plugin', 'on_uninstall' ) );

// should the action be 'init' instead of 'plugins_loaded'? see http://geertdedeckere.be/article/loading-wordpress-language-files-the-right-way.
add_action( 'plugins_loaded', array( 'BibleGet\Plugin', 'bibleget_load_textdomain' ) );

// should the action be 'init' instead of enqueue_block_editor_assets? add_action('init', array( 'BibleGet\Plugin', 'set_script_translations' ) ); .
add_action( 'enqueue_block_editor_assets', array( 'BibleGet\Plugin', 'set_script_translations' ) );

add_action( 'init', array( 'BibleGet\Plugin', 'gutenberg' ) );

add_action( 'admin_enqueue_scripts', array( 'BibleGet\Plugin', 'gutenberg_scripts' ) );

add_action( 'admin_notices', array( 'BibleGet\Plugin', 'admin_notices' ) );

add_action( 'wp_ajax_refresh_bibleget_server_data', array( 'BibleGet\Plugin', 'set_options' ) );

add_action( 'wp_ajax_flush_bible_quotes_cache', array( 'BibleGet\Plugin', 'flush_bible_quotes_cache' ) );

add_action( 'wp_ajax_search_by_keyword', array( 'BibleGet\Plugin', 'search_by_keyword' ) );

add_action( 'wp_ajax_update_bget', array( 'BibleGet\Plugin', 'update_bget' ) );

add_shortcode( 'bibleget', array( 'BibleGet\Plugin', 'shortcode' ) );

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( 'BibleGet\Plugin', 'add_action_links' ) );


if ( is_admin() ) {
	$bibleget_settings_page = new SettingsPage();
	$bibleget_settings_page->init(); // only init will actually register and print out the settings and the options page.
}


/**
 * END OF SETTINGS PAGE
 *
 * START OF CUSTOMIZER OPTIONS
 */

add_action( 'wp_enqueue_scripts', array( 'BibleGet\Customize', 'bibleget_customizer_print_script' ) );
add_action( 'admin_enqueue_scripts', array( 'BibleGet\Customize', 'bibleget_customizer_print_script' ) );

// Setup the Theme Customizer settings and controls...
add_action(
	'customize_register',
	array(
		'BibleGet\Customize',
		'register',
	)
);

// Output custom CSS to live site.
add_action(
	'wp_head',
	array(
		'BibleGet\Customize',
		'header_output',
	)
);

// Output custom CSS to admin area for gutenberg previews.
add_action(
	'admin_head',
	array(
		'BibleGet\Customize',
		'header_output',
	)
);


// Enqueue live preview javascript in Theme Customizer admin screen.
add_action(
	'customize_preview_init',
	array(
		'BibleGet\Customize',
		'live_preview',
	)
);
