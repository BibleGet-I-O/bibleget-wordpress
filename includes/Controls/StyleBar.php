<?php

namespace BibleGet\Controls;

/**
 * BibleGet StyleBar Control
 */
class StyleBar extends \WP_Customize_Control {
	public $type = 'stylebar';

	public function enqueue() {
		wp_enqueue_script(
			'bibleget-stylebar-control', // Give the script a unique ID.
			plugins_url( '../../js/stylebar-control.js', __FILE__ ), // Define the path to the JS file.
			[ 'jquery' ], // Define dependencies
			'', // Define a version (optional)
			true
		); // Specify whether to put in footer (leave this true)
		wp_enqueue_style(
			'stylebar-control-style',
			plugins_url( '../../css/stylebar-control.css', __FILE__ ) // Define the path to the CSS file.
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
