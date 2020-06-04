<?php
if (class_exists ( 'WP_Customize_Control' )) {


    /**
     * BibleGet StyleBar Control
     */
    class BibleGet_Customize_StyleBar_Control extends WP_Customize_Control {
        public $type = 'stylebar';
        public function enqueue() {
            wp_enqueue_script ( 'bibleget-stylebar-control', // Give the script a unique ID
                plugins_url ( 'js/stylebar-control.js', __FILE__ ), // Define the path to the JS file
                array ( 'jquery' ), // Define dependencies
                '', // Define a version (optional)
                true ); // Specify whether to put in footer (leave this true)
            wp_enqueue_style ( 'stylebar-control-style',
                plugins_url ( 'css/stylebar-control.css', __FILE__ ) // Define the path to the CSS file
                );
        }
        public function render_content() {
            //$styles = explode ( ",", esc_attr ( $this->value() ) );
            ?>
<input type="hidden" <?php $this->link('valign_setting'); ?> value="<?php echo $this->value('valign_setting'); ?>" />
<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
<?php if (! empty ( $this->description )) : ?>
<span class="description customize-control-description"><?php echo esc_html( $this->description ); ?></span>
<?php endif; ?>
<div class="bibleget-buttonset button-group button-large">
<?php foreach ( $this->choices as $value => $label ) : ?>
<?php
		$buttonstyle = "";
		$checked = false;
		$setting = '';
		switch ($value) {
			case 'bold' :
				$buttonstyle = $this->value('bold_setting') === true ? "button-primary" : "button-secondary";
				$checked = $this->value('bold_setting');
				$setting = 'bold_setting';
				break;
			case 'italic' :
				$buttonstyle = $this->value('italic_setting') === true ? "button-primary" : "button-secondary";
				$checked = $this->value('italic_setting');
				$setting = 'italic_setting';
				break;
			case 'underline' :
				$buttonstyle = $this->value('underline_setting') === true ? "button-primary" : "button-secondary";
				$checked = $this->value('underline_setting');
				$setting = 'underline_setting';
				break;
			case 'strikethrough' :
				$buttonstyle = $this->value('strikethrough_setting') === true ? "button-primary" : "button-secondary";
				$checked = $this->value('strikethrough_setting');
				$setting = 'strikethrough_setting';
				break;
			case 'superscript' :
				$buttonstyle = $this->value('valign_setting') === 1 ? "button-primary" : "button-secondary";
				$checked = $this->value('valign_setting') === 1;
				break;
			case 'subscript' :
				$buttonstyle = $this->value('valign_setting') === 2 ? "button-primary" : "button-secondary";
				$checked = $this->value('valign_setting') === 2;
				break;
		}
?>
<label class="button <?php echo $buttonstyle." ".$value?>">
	<span><?php echo esc_html( $label ); ?></span>
	<input class="ui-helper-hidden-accessible <?php echo esc_attr($value); ?>" value="<?php echo esc_attr( $this->value($setting) ); ?>" type="checkbox" <?php if($setting != ''){ $this->link($setting); }?> <?php checked($checked); ?> />
</label>
<?php endforeach; ?>

</div>
<?php
		} // end public function render_content
	} // end class BibleGet_Customize_StyleBar_Control




	/**
	 * BibleGet FontSelect Control
	 */
	class BibleGet_Customize_FontSelect_Control extends WP_Customize_Control {
		public $type = 'fontselect';
		/*
		public function __construct($manager, $id, $args = array() ){
			parent::__construct( $manager, $id, $args );
		}

		*/
		public function enqueue() {

			wp_enqueue_script ( 'bibleget-fontselect-library', // Give the script a unique ID
					plugins_url ( 'js/jquery.fontselect.js', __FILE__ ), // Define the path to the JS file
					array ( 'jquery' ), // Define dependencies
					'', // Define a version (optional)
					true ); // Specify whether to put in footer (leave this true)
			wp_enqueue_script ( 'bibleget-fontselect-control', // Give the script a unique ID
					plugins_url ( 'js/fontselect-control.js', __FILE__ ), // Define the path to the JS file
					array ( 'bibleget-fontselect-library' ), // Define dependencies
					'', // Define a version (optional)
					true ); // Specify whether to put in footer (leave this true)
			wp_enqueue_style ( 'fontselect-control-style',
					plugins_url ( 'css/fontselect-control.css', __FILE__ ) // Define the path to the CSS file
					);

		    if( file_exists( plugin_dir_path( __FILE__ ) . 'css/gfonts_preview/gfonts_preview.css'  ) ){
                wp_enqueue_style( 'bibleget-fontselect-preview',
                    plugins_url ('css/gfonts_preview/gfonts_preview.css', __FILE__ )
                );
            }
            else{
                echo '<!-- gfonts_preview.css not found -->';
            }

			//I'm guessing this is where we do our background checks on the Google Fonts API key?
			$bibleget_settings = get_option( 'bibleget_settings' );
			if(isset( $bibleget_settings['googlefontsapi_key'] ) && $bibleget_settings['googlefontsapi_key'] != ""){
				if(get_transient ( md5 ( $bibleget_settings['googlefontsapi_key'] ) ) == "SUCCESS"){
					//We have a google fonts key that has been tested successfully in the past 3 months
                    wp_localize_script('bibleget-fontselect-library','FontSelect_Control',array('bibleget_settings' => $bibleget_settings,'pluginUrl' => plugins_url("", __FILE__ )));
				}
			}

		}

		public function render_content() {
?>
			<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
<?php if (! empty ( $this->description )) : ?>
			<span class="description customize-control-description"><?php echo esc_html( $this->description ); ?></span>
<?php endif; ?>
			<input id="bibleget-googlefonts"  <?php $this->link(); ?> type="hidden" data-fonttype="websafe" value="<?php $this->value(); ?>" />

<?php
		} // end public function render_content
	} // end class BibleGet_Customize_FontSelect_Control

	/**
	 * BibleGet TextAlign Control
	 */
	class BibleGet_Customize_TextAlign_Control extends WP_Customize_Control {
		public $type = 'textalign';
		/*
		public function __construct($manager, $id, $args = array() ){
			parent::__construct( $manager, $id, $args );
		}

		*/
		public function enqueue() {

			wp_enqueue_script ( 'bibleget-textalign-control', // Give the script a unique ID
					plugins_url ( 'js/textalign-control.js', __FILE__ ), // Define the path to the JS file
					array ( 'jquery' ), // Define dependencies
					'', // Define a version (optional)
					true ); // Specify whether to put in footer (leave this true)
			wp_enqueue_style ( 'textalign-control-style',
					plugins_url ( 'css/textalign-control.css', __FILE__ ) // Define the path to the CSS file
					);

		}

		public function render_content() {
?>
			<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
<?php if (! empty ( $this->description )) : ?>
			<span class="description customize-control-description"><?php echo esc_html( $this->description ); ?></span>
<?php endif; ?>
<input type="hidden" value="<?php echo $this->value()?>" <?php $this->link() ?> />
<div class="bibleget-textalign button-group button-large">
<label class="button <?php echo $this->value() === 1 ? 'button-primary' : 'button-secondary' ?>">
	<span class="dashicons bget dashicons-editor-alignleft"></span>
	<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=1 type="radio" <?php checked($this->value() === 1); ?> />
</label>
<label class="button <?php echo $this->value() === 2 ? 'button-primary' : 'button-secondary' ?>">
	<span class="dashicons bget dashicons-editor-aligncenter"></span>
	<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=2 type="radio" <?php checked($this->value() === 2); ?> />
</label>
<label class="button <?php echo $this->value() === 3 ? 'button-primary' : 'button-secondary' ?>">
	<span class="dashicons bget dashicons-editor-alignright"></span>
	<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=3 type="radio" <?php checked($this->value() === 3); ?> />
</label>
<label class="button <?php echo $this->value() === 4 ? 'button-primary' : 'button-secondary' ?>">
	<span class="dashicons bget dashicons-editor-justify"></span>
	<input class="ui-helper-hidden-accessible" name="TEXTALIGN" value=4 type="radio" <?php checked($this->value() === 4); ?> />
</label>
</div>
<?php
		} // end public function render_content
	} // end class BibleGet_Customize_FontSelect_Control

} // end if class exists WP_Customize_Control
