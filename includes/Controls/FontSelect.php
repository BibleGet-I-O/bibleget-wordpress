<?php

namespace BibleGet\Controls;

/**
 * BibleGet FontSelect Control
 */
class FontSelect extends \WP_Customize_Control {
	public $type = 'fontselect';
	public function enqueue() {
		wp_enqueue_script(
			'bibleget-fontselect-library', // Give the script a unique ID
			plugins_url( '../../js/jquery.fontselect.js', __FILE__ ), // Define the path to the JS file
			[ 'jquery' ], // Define dependencies
			'', // Define a version (optional)
			true
		); // Specify whether to put in footer (leave this true)
		wp_enqueue_script(
			'bibleget-fontselect-control', // Give the script a unique ID
			plugins_url( '../../js/fontselect-control.js', __FILE__ ), // Define the path to the JS file
			[ 'bibleget-fontselect-library' ], // Define dependencies
			'', // Define a version (optional)
			true
		); // Specify whether to put in footer (leave this true)
		wp_enqueue_style(
			'fontselect-control-style',
			plugins_url( '../../css/fontselect-control.css', __FILE__ ) // Define the path to the CSS file
		);

		$gfonts_dir         = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/';
		$gfonts_preview_css = esc_url( wp_upload_dir()['baseurl'] . '/gfonts_preview/css/gfonts_preview.css' );
		if ( file_exists( $gfonts_dir . 'css/gfonts_preview.css' ) ) {
			wp_enqueue_style( 'bibleget-fontselect-preview', $gfonts_preview_css );
		} else {
			echo '<!-- gfonts_preview.css not found -->';
		}

		// I'm guessing this is where we do our background checks on the Google Fonts API key?
		$bibleget_settings = get_option( 'bibleget_settings' );
		if ( isset( $bibleget_settings['googlefontsapi_key'] ) && $bibleget_settings['googlefontsapi_key'] != '' ) {
			if ( get_transient( md5( $bibleget_settings['googlefontsapi_key'] ) ) == 'SUCCESS' ) {
				// We have a google fonts key that has been tested successfully in the past 3 months
				wp_localize_script(
					'bibleget-fontselect-library',
					'FontSelect_Control',
					[
						'bibleget_settings' => $bibleget_settings,
						'pluginUrl'         => plugins_url( '', __FILE__ ),
					]
				);
			}
		}
	}

	public function render_content() {
		echo '<span class="customize-control-title">' . esc_html( $this->label ) . '</span>';
		if ( ! empty( $this->description ) ) {
			echo '<span class="description customize-control-description">' . esc_html( $this->description ) . '</span>';
		}
		echo '<input id="bibleget-googlefonts" ' . $this->get_link() . ' type="hidden" data-fonttype="websafe" value="' . $this->value() . '" />';
	}
}
