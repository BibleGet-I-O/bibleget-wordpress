<?php
if (class_exists ( 'WP_Customize_Control' )) {
	class BibleGet_Customize_StyleBar_Control extends WP_Customize_Control {
		public $type = 'stylebar';
		public function enqueue() {
			wp_enqueue_script ( 'bibleget-stylebar-control', // Give the script a unique ID
				plugins_url ( 'js/stylebar-control.js', __FILE__ ), // Define the path to the JS file
				array ( 'jquery' ), // Define dependencies
				'', // Define a version (optional)
				true ); // Specify whether to put in footer (leave this true)
		}
		public function render_content() {
			$styles = explode ( ",", esc_attr ( $this->value() ) );
?>
<input type="hidden" <?php $this->link(); ?> value="<?php echo esc_attr( $this->value() ); ?>" />
<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
<?php if (! empty ( $this->description )) : ?>
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
<label class="button <?php echo in_array( $value, $styles ) ? "button-primary" : "button-secondary" ;?>">
	<span style="display:block;<?php echo $labelstyles; ?>"><?php echo esc_html( $label ); ?></span>
	<input class="ui-helper-hidden-accessible" type="checkbox" value="<?php echo esc_attr( $value ); ?>" <?php checked( in_array( $value, $styles ) ); ?> style="height: 0px; width: 0px;" />
</label>
<?php endforeach; ?>

</div>
<?php
		} // end public function render_content
	} // end class BibleGet_Customize_StyleBar_Control

	class BibleGet_Customize_FontSelect_Control extends WP_Customize_Control {
		private $safe_fonts = false;		
		public $type = 'fontselect';
		
		public function __construct($manager, $id, $args = array() ){
			$this->safe_fonts = array(
					array("font-family" => "Arial", "fallback" => "Helvetica", "generic-family" => "sans-serif"),
					array("font-family" => "Arial Black", "fallback" => "Gadget", "generic-family" => "sans-serif"),
					array("font-family" => "Book Antiqua", "fallback" => "Palatino", "generic-family" => "serif"),
					array("font-family" => "Courier New", "fallback" => "Courier", "generic-family" => "monospace"),
					array("font-family" => "Georgia", "generic-family" => "serif"),
					array("font-family" => "Impact", "fallback" => "Charcoal", "generic-family" => "sans-serif"),
					array("font-family" => "Lucida Console", "fallback" => "Monaco", "generic-family" => "monospace"),
					array("font-family" => "Lucida Sans Unicode", "fallback" => "Lucida Grande", "generic-family" => "sans-serif"),
					array("font-family" => "Palatino Linotype", "fallback" => "Palatino", "generic-family" => "serif"),
					array("font-family" => "Tahoma", "fallback" => "Geneva", "generic-family" => "sans-serif"),
					array("font-family" => "Times New Roman", "fallback" => "Times", "generic-family" => "serif"),
					array("font-family" => "Trebuchet MS", "fallback" => "Helvetica", "generic-family" => "sans-serif"),
					array("font-family" => "Verdana", "fallback" => "Geneva", "generic-family" => "sans-serif")
			);
			parent::__construct( $manager, $id, $args );
		}
		
		public function get_font_index($fontfamily){
			foreach($this->safe_fonts as $index => $font){
				if($font["font-family"] == $fontfamily){ return $index; }
			}
			return false;
		}
		/*
		public function enqueue() {
			
			wp_enqueue_script ( 'bibleget-fontselect-control', // Give the script a unique ID
					plugins_url ( 'js/fontselect-control.js', __FILE__ ), // Define the path to the JS file
					array ( 'jquery' ), // Define dependencies
					'', // Define a version (optional)
					true ); // Specify whether to put in footer (leave this true)
			
		}
		*/
		public function render_content() {
?>
			<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
<?php if (! empty ( $this->description )) : ?>
			<span class="description customize-control-description"><?php echo esc_html( $this->description ); ?></span>
<?php endif; ?>
<?php 
	if(!empty($this->safe_fonts) ){
		$fidx = $this->get_font_index($this->value()); 
		$style = '';
		$flbk = '';
	
		if($fidx!==false){
			if(isset($this->safe_fonts[$fidx]["fallback"])){
				$flbk = '&apos;'.$this->safe_fonts[$fidx]["fallback"].'&apos;,';
			}
			$style = ' style="font-family:&apos;'.$this->safe_fonts[$fidx]["font-family"].'&apos;,'.$flbk.'&apos;'.$this->safe_fonts[$fidx]["generic-family"].'&apos;;padding:0px;margin:0px;text-align:left;"';
		}

?>
<select <?php $this->link(); echo $style; ?>>
<?php 
		foreach ( $this->safe_fonts as $index => $font ) : 
			$flbk = '';
			if(isset($font["fallback"])){
				$flbk = '&apos;'.$font["fallback"].'&apos;,';
			}
			$style = ' style="font-family:&apos;'.$font["font-family"].'&apos;,'.$flbk.'&apos;'.$font["generic-family"].'&apos;;padding:0px;margin:0px;text-align:left;"';
			$selected = $this->value() == $font["font-family"] ? " SELECTED" : "";
	   		echo '<optgroup'.$style.'><option value="'.$font["font-family"].'" style="padding:0px;margin:0px;text-align:left;"'.$selected.'>'.$font["font-family"].'</option></optgroup>';
		endforeach;
	}// end if not empty this->safe_fonts
?>
</select>
<?php						
		} // end public function render_content
	} // end class BibleGet_Customize_FontSelect_Control
					
} // end if class exists WP_Customize_Control
