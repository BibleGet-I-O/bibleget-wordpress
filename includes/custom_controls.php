<?php
if ( class_exists( 'WP_Customize_Control' ) ) {

	/**
	 * BibleGet StyleBar Control
	 */
	class BibleGet_Customize_StyleBar_Control extends WP_Customize_Control {
		public $type = 'stylebar';
		public function enqueue() {
			wp_enqueue_script(
				'bibleget-stylebar-control', // Give the script a unique ID
				plugins_url( '../js/stylebar-control.js', __FILE__ ), // Define the path to the JS file
				array( 'jquery' ), // Define dependencies
				'', // Define a version (optional)
				true
			); // Specify whether to put in footer (leave this true)
			wp_enqueue_style(
				'stylebar-control-style',
				plugins_url( '../css/stylebar-control.css', __FILE__ ) // Define the path to the CSS file
			);
		}
		public function render_content() {
			// $styles = explode ( ",", esc_attr ( $this->value() ) );
			echo '<input type="hidden" ' . $this->get_link( 'valign_setting' ) . " value=\"{$this->value('valign_setting')}\" />";
			echo '<span class="customize-control-title">' . esc_html( $this->label ) . '</span>';
			if ( ! empty( $this->description ) ) {
				echo '<span class="description customize-control-description">' . esc_html( $this->description ) . '</span>';
			}
			echo '<div class="bibleget-buttonset button-group button-large">';
			foreach ( $this->choices as $value => $label ) {
				$buttonstyle = '';
				$checked     = false;
				$setting     = '';
				switch ( $value ) {
					case 'bold':
						$buttonstyle = $this->value( 'bold_setting' ) === true ? 'button-primary' : 'button-secondary';
						$checked     = $this->value( 'bold_setting' );
						$setting     = 'bold_setting';
						break;
					case 'italic':
						$buttonstyle = $this->value( 'italic_setting' ) === true ? 'button-primary' : 'button-secondary';
						$checked     = $this->value( 'italic_setting' );
						$setting     = 'italic_setting';
						break;
					case 'underline':
						$buttonstyle = $this->value( 'underline_setting' ) === true ? 'button-primary' : 'button-secondary';
						$checked     = $this->value( 'underline_setting' );
						$setting     = 'underline_setting';
						break;
					case 'strikethrough':
						$buttonstyle = $this->value( 'strikethrough_setting' ) === true ? 'button-primary' : 'button-secondary';
						$checked     = $this->value( 'strikethrough_setting' );
						$setting     = 'strikethrough_setting';
						break;
					case 'superscript':
						$buttonstyle = $this->value( 'valign_setting' ) === 1 ? 'button-primary' : 'button-secondary';
						$checked     = $this->value( 'valign_setting' ) === 1;
						break;
					case 'subscript':
						$buttonstyle = $this->value( 'valign_setting' ) === 2 ? 'button-primary' : 'button-secondary';
						$checked     = $this->value( 'valign_setting' ) === 2;
						break;
				}

				echo "<label class=\"button {$buttonstyle} {$value}\">";
				echo '<span>' . esc_html( $label ) . '</span>';
				echo '<input class="ui-helper-hidden-accessible ' . esc_attr( $value ) . '" value="' . esc_attr( $this->value( $setting ) ) . '" type="checkbox" ' . ( $setting !== '' ? $this->get_link( $setting ) : '' ) . ' ' . checked( $checked, true, false ) . ' />';
				echo '</label>';
			}
			echo '</div>';
		}
	}


	/**
	 * BibleGet FontSelect Control
	 */
	class BibleGet_Customize_FontSelect_Control extends WP_Customize_Control {
		public $type = 'fontselect';
		public function enqueue() {
			wp_enqueue_script(
				'bibleget-fontselect-library', // Give the script a unique ID
				plugins_url( '../js/jquery.fontselect.js', __FILE__ ), // Define the path to the JS file
				array( 'jquery' ), // Define dependencies
				'', // Define a version (optional)
				true
			); // Specify whether to put in footer (leave this true)
			wp_enqueue_script(
				'bibleget-fontselect-control', // Give the script a unique ID
				plugins_url( '../js/fontselect-control.js', __FILE__ ), // Define the path to the JS file
				array( 'bibleget-fontselect-library' ), // Define dependencies
				'', // Define a version (optional)
				true
			); // Specify whether to put in footer (leave this true)
			wp_enqueue_style(
				'fontselect-control-style',
				plugins_url( '../css/fontselect-control.css', __FILE__ ) // Define the path to the CSS file
			);

			$gfonts_dir        = str_replace( '\\', '/', wp_upload_dir()['basedir'] ) . '/gfonts_preview/';
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
						array(
							'bibleget_settings' => $bibleget_settings,
							'pluginUrl'         => plugins_url( '', __FILE__ ),
						)
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

	/**
	 * BibleGet TextAlign Control
	 */
	class BibleGet_Customize_TextAlign_Control extends WP_Customize_Control {
		public $type = 'textalign';
		public function enqueue() {

			wp_enqueue_script(
				'bibleget-textalign-control', // Give the script a unique ID
				plugins_url( '../js/textalign-control.js', __FILE__ ), // Define the path to the JS file
				array( 'jquery' ), // Define dependencies
				'', // Define a version (optional)
				true
			); // Specify whether to put in footer (leave this true)
			wp_enqueue_style(
				'textalign-control-style',
				plugins_url( '../css/textalign-control.css', __FILE__ ) // Define the path to the CSS file
			);
		}

		public function render_content() {
			echo '<span class="customize-control-title">' . esc_html( $this->label ) . '</span>';
			if ( ! empty( $this->description ) ) {
				echo '<span class="description customize-control-description">' . esc_html( $this->description ) . '</span>';
			}
			echo '<input type="hidden" value="' . $this->value() . '" ' . $this->get_link() . ' />';
			echo '<div class="bibleget-textalign button-group button-large">';
			echo '<label class="button ' . ( $this->value() === 1 ? 'button-primary' : 'button-secondary' ) . '">';
			echo '<span class="dashicons bget dashicons-editor-alignleft"></span>';
			echo '<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=1 type="radio" ' . checked( $this->value(), 1, false ) . ' />';
			echo '</label>';
			echo '<label class="button ' . ( $this->value() === 2 ? 'button-primary' : 'button-secondary' ) . '">';
			echo '<span class="dashicons bget dashicons-editor-aligncenter"></span>';
			echo '<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=2 type="radio" ' . checked( $this->value(), 2, false ) . ' />';
			echo '</label>';
			echo '<label class="button ' . ( $this->value() === 3 ? 'button-primary' : 'button-secondary' ) . '">';
			echo '<span class="dashicons bget dashicons-editor-alignright"></span>';
			echo '<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=3 type="radio" ' . checked( $this->value(), 3, false ) . ' />';
			echo '</label>';
			echo '<label class="button ' . ( $this->value() === 4 ? 'button-primary' : 'button-secondary' ) . '">';
			echo '<span class="dashicons bget dashicons-editor-justify"></span>';
			echo '<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=4 type="radio" ' . checked( $this->value(), 4, false ) . ' />';
			echo '</label>';
			echo '</div>';
		}
	}

}
