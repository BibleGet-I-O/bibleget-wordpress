<?php

namespace BibleGet\Controls;

/**
 * BibleGet TextAlign Control
 */
class TextAlign extends \WP_Customize_Control {
	public $type = 'textalign';
	public function enqueue() {

		wp_enqueue_script(
			'bibleget-textalign-control', // Give the script a unique ID
			plugins_url( '../../js/textalign-control.js', __FILE__ ), // Define the path to the JS file
			[ 'jquery' ], // Define dependencies
			'', // Define a version (optional)
			true
		); // Specify whether to put in footer (leave this true)
		wp_enqueue_style(
			'textalign-control-style',
			plugins_url( '../../css/textalign-control.css', __FILE__ ) // Define the path to the CSS file
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
