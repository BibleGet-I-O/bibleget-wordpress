<?php
if (class_exists ( 'WP_Customize_Control' )) {
	class BibleGet_Customize_StyleBar_Control extends WP_Customize_Control {
		public $type = 'stylebar';
		public function enqueue() {
			wp_enqueue_script ( 'bibleget-stylebar-control', // Give the script a unique ID
plugins_url ( 'js/stylebar-control.js', __FILE__ ), // Define the path to the JS file
array (
					'jquery' 
			), // Define dependencies
'', // Define a version (optional)
true ) // Specify whether to put in footer (leave this true)
;
		}
		public function render_content() {
			$styles = explode ( ",", esc_attr ( $this->value () ) );
			?>
<input type="hidden" <?php $this->link(); ?>
	value="<?php echo esc_attr( $this->value() ); ?>" />
<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
<?php
			if (! empty ( $this->description )) :
				?>
<span class="description customize-control-description"><?php echo esc_html( $this->description ); ?></span>
<?php endif; ?>
<div class="bibleget-buttonset button-group button-large">
				<?php foreach ( $this->choices as $value => $label ) : ?>
					<?php
				$labelstyles = "";
				switch ($value) {
					case 'bold' :
						$labelstyles .= "font-weight:bold;";
						break;
					case 'italic' :
						$labelstyles .= "font-style:italic;";
						break;
					case 'underline' :
						$labelstyles .= "text-decoration:underline;";
						break;
					case 'strikethrough' :
						$labelstyles .= "text-decoration:line-through;";
						break;
					case 'superscript' :
						$labelstyles .= "font-size:0.7em;vertical-align:baseline;position:relative;top:-0.6em;";
						break;
					case 'subscript' :
						$labelstyles .= "font-size:0.7em;vertical-align:baseline;position:relative;top:0.6em;";
						break;
				}
				?>
          <label
		class="button <?php echo in_array( $value, $styles ) ? "button-primary" : "button-secondary" ;?>">
		<span style="display:block;<?php echo $labelstyles; ?>"><?php echo esc_html( $label ); ?></span>
		<input class="ui-helper-hidden-accessible" type="checkbox"
		value="<?php echo esc_attr( $value ); ?>"
		<?php checked( in_array( $value, $styles ) ); ?>
		style="height: 0px; width: 0px;" />
	</label>
				<?php endforeach; ?>

	    </div>

<?php
		}
	}
}
