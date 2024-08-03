<?php
require_once plugin_dir_path( __FILE__ ) . 'enums/BGET.php';
require_once plugin_dir_path( __FILE__ ) . 'BGETPROPERTIES.php';

/**
 * Contains methods for customizing the theme customization screen.
 *
 * @link http://codex.wordpress.org/Theme_Customization_API
 * @since BibleGet I/O 3.6
 */
class BibleGet_Customize {

	private static $websafe_fonts;
	private static $bget_properties;
	private static $bibleget_style_settings;
	public static $bget_properties;

	private static function initializeOptions() {
		self::$bget_properties    = get_option( 'BGET', array() );
		self::$bget_properties = new BGETPROPERTIES();
		// load default values for settings if user hasn't already defined a value
		foreach ( self::$bget_properties->OPTIONS as $option => $array ) {
			if ( ! isset( self::$bget_properties[ $option ] ) ) {
				self::$bget_properties[ $option ] = $array['default'];
			}
		}
	}

	public static function init() {

		/* Define object that will contain all the information for all settings and controls */
		self::$bibleget_style_settings = new stdClass();

		/* Define bibleget_fontfamily setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_FONTFAMILY]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_FONTFAMILY]'}->title       = __( 'Font', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_FONTFAMILY]'}->controltype = 'fontselect';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_FONTFAMILY]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_textalign setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PARAGRAPHALIGN]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PARAGRAPHALIGN]'}->title       = __( 'Text align', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PARAGRAPHALIGN]'}->controltype = 'textalign';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PARAGRAPHALIGN]'}->section     = 'bibleget_paragraph_style_options';

		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_LINEHEIGHT]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_LINEHEIGHT]'}->title       = __( 'Line height', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_LINEHEIGHT]'}->controltype = 'select';
		/* translators: context is label for line-height select option */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_LINEHEIGHT]'}->choices = array(
			'1.0'  => __( 'single', 'bibleget-io' ),
			'1.15' => '1.15',
			'1.5'  => '1½',
			'2.0'  => __( 'double', 'bibleget-io' ),
		);
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_LINEHEIGHT]'}->section = 'bibleget_paragraph_style_options';

		/* Define bibleget_width setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_WIDTH]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_WIDTH]'}->title       = __( 'Width on the page', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_WIDTH]'}->controltype = 'range';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_WIDTH]'}->choices     = array(
			'min'  => 10,
			'max'  => 100,
			'step' => 1,
		);
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_WIDTH]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_bgcolor setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BACKGROUNDCOLOR]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BACKGROUNDCOLOR]'}->title       = __( 'Background color', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BACKGROUNDCOLOR]'}->controltype = 'color';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BACKGROUNDCOLOR]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_bordercolor setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERCOLOR]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERCOLOR]'}->title       = __( 'Border color', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERCOLOR]'}->controltype = 'color';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERCOLOR]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_borderstyle setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERSTYLE]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERSTYLE]'}->title       = __( 'Border style', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERSTYLE]'}->controltype = 'select';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERSTYLE]'}->choices     = array();
		foreach ( BGET::BORDERSTYLE as $value ) {
			self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERSTYLE]'}->choices[ $value ] = BGET::CSSRULE['BORDERSTYLE'][ $value ];
		}
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERSTYLE]'}->section = 'bibleget_paragraph_style_options';

		/* Define bibleget_borderwidth setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERWIDTH]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERWIDTH]'}->title       = __( 'Border width', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERWIDTH]'}->controltype = 'range';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERWIDTH]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_borderradius setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERRADIUS]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERRADIUS]'}->title       = __( 'Border radius', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERRADIUS]'}->controltype = 'range';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_BORDERRADIUS]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_paddingtopbottom setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGTOPBOTTOM]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGTOPBOTTOM]'}->title       = __( 'Padding top / bottom', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGTOPBOTTOM]'}->controltype = 'range';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGTOPBOTTOM]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_paddingleftright setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGLEFTRIGHT]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGLEFTRIGHT]'}->title       = __( 'Padding left / right', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGLEFTRIGHT]'}->controltype = 'range';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_PADDINGLEFTRIGHT]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_margintopbottom setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINTOPBOTTOM]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINTOPBOTTOM]'}->title       = __( 'Margin top / bottom', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINTOPBOTTOM]'}->controltype = 'range';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINTOPBOTTOM]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_marginleftright setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHT]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHT]'}->title       = __( 'Margin left / right', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHT]'}->controltype = 'range';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHT]'}->section     = 'bibleget_paragraph_style_options';

		/* Define bibleget_marginleftright setting and control */
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]'}              = new stdClass();
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]'}->title       = __( 'Margin left / right unit', 'bibleget-io' );
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]'}->controltype = 'select';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]'}->choices     = array(
			'px'   => 'px',
			'%'    => '%',
			'auto' => 'auto',
		);
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]'}->section     = 'bibleget_paragraph_style_options';
		self::$bibleget_style_settings->{'BGET[PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT]'}->description = __( 'When set to "auto" the Bible quote will be centered on the page and the numerical value will be ignored', 'bibleget-io' );

		$bibleget_styles_general = new stdClass();

		$bibleget_styles_general->FONT_SIZE              = new stdClass();
		$bibleget_styles_general->FONT_SIZE->title       = __( 'Font size', 'bibleget-io' );
		$bibleget_styles_general->FONT_SIZE->controltype = 'range';

		$bibleget_styles_general->FONT_SIZE_UNIT              = new stdClass();
		$bibleget_styles_general->FONT_SIZE_UNIT->title       = __( 'Font size unit', 'bibleget-io' );
		$bibleget_styles_general->FONT_SIZE_UNIT->controltype = 'select';
		$bibleget_styles_general->FONT_SIZE_UNIT->choices     = array(
			'px'      => 'px',
			'em'      => 'em',
			'pt'      => 'pt',
			'inherit' => 'inherit',
		);
		$bibleget_styles_general->FONT_SIZE_UNIT->description = __( 'When set to "inherit" the font size will be according to the theme settings.', 'bibleget-io' );

		$bibleget_styles_general->TEXT_COLOR              = new stdClass();
		$bibleget_styles_general->TEXT_COLOR->title       = __( 'Font color', 'bibleget-io' );
		$bibleget_styles_general->TEXT_COLOR->controltype = 'color';

		$bibleget_styles_general->FONT_STYLE              = new stdClass();
		$bibleget_styles_general->FONT_STYLE->title       = __( 'Font style', 'bibleget-io' );
		$bibleget_styles_general->FONT_STYLE->controltype = 'style';

		// $bibleget_style_sizes_arr = array(4 => '4', 5 => '5', 6 => '6', 7 => '7', 8 => '8', 9 => '9', 10 => '10', 11 => '11', 12 => '12', 14 => '14', 16 => '16', 18 => '18', 20 => '20', 22 => '22', 24 => '24', 26 => '26', 28 => '28');
		$bibleget_style_sizes_arr   = array(
			'min'  => 4,
			'max'  => 28,
			'step' => 1,
		);
		$bibleget_style_choices_arr = array(
			/* translators: "B" refers to "bold style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'bold'          => __( 'B', 'bibleget-io' ),
			/* translators: "I" refers to "italic style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'italic'        => __( 'I', 'bibleget-io' ),
			/* translators: "U" refers to "underline style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'underline'     => __( 'U', 'bibleget-io' ),
			/* translators: "S" refers to "strikethrough style text", use the corresponding single letter to refer to this text formatting in your language for use on a button in a button group */
			'strikethrough' => __( 'S', 'bibleget-io' ),
			'superscript'   => 'A²',
			'subscript'     => 'A₂',
		);
		// $bibleget_styles_general->FONT_STYLE->settings = array('')

		foreach ( $bibleget_styles_general as $i => $styleobj ) {
			$o = str_replace( '_', '', $i );

			self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}          = new stdClass();
			self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->section = 'bibleget_bibleversion_style_options';
			/* translators: in reference to font Size, style and color (e.g. 'font color for version indicator'). "Version" refers to the version of the Bible used for the Biblical quote. */
			self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->title       = $styleobj->title;
			self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->controltype = $styleobj->controltype;
			if ( $styleobj->controltype == 'range' ) {
				self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->choices = $bibleget_style_sizes_arr;
			} elseif ( $styleobj->controltype == 'style' ) {
				self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->choices  = $bibleget_style_choices_arr;
				self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->settings = array(
					'bold_setting'          => 'BGET[VERSIONSTYLES_BOLD]',
					'italic_setting'        => 'BGET[VERSIONSTYLES_ITALIC]',
					'underline_setting'     => 'BGET[VERSIONSTYLES_UNDERLINE]',
					'strikethrough_setting' => 'BGET[VERSIONSTYLES_STRIKETHROUGH]',
					'valign_setting'        => 'BGET[VERSIONSTYLES_VALIGN]',
				);
			} elseif ( $styleobj->controltype == 'select' ) {
				self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->choices     = $styleobj->choices;
				self::$bibleget_style_settings->{'BGET[VERSIONSTYLES_' . $o . ']'}->description = $styleobj->description;
			}

			self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}          = new stdClass();
			self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->section = 'bibleget_bookchapter_style_options';
			/* translators: in reference to font size, style and color (e.g. 'color for books and chapters') */
			self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->title       = $styleobj->title;
			self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->controltype = $styleobj->controltype;
			if ( $styleobj->controltype == 'range' ) {
				self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->choices = $bibleget_style_sizes_arr;
			} elseif ( $styleobj->controltype == 'style' ) {
				self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->choices  = $bibleget_style_choices_arr;
				self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->settings = array(
					'bold_setting'          => 'BGET[BOOKCHAPTERSTYLES_BOLD]',
					'italic_setting'        => 'BGET[BOOKCHAPTERSTYLES_ITALIC]',
					'underline_setting'     => 'BGET[BOOKCHAPTERSTYLES_UNDERLINE]',
					'strikethrough_setting' => 'BGET[BOOKCHAPTERSTYLES_STRIKETHROUGH]',
					'valign_setting'        => 'BGET[BOOKCHAPTERSTYLES_VALIGN]',
				);
			} elseif ( $styleobj->controltype == 'select' ) {
				self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->choices     = $styleobj->choices;
				self::$bibleget_style_settings->{'BGET[BOOKCHAPTERSTYLES_' . $o . ']'}->description = $styleobj->description;
			}

			self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}          = new stdClass();
			self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->section = 'bibleget_versenumber_style_options';
			/* translators: in reference to font Size, style and color (e.g. 'style for verse numbers') */
			self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->title       = $styleobj->title;
			self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->controltype = $styleobj->controltype;
			if ( $styleobj->controltype == 'range' ) {
				self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->choices = $bibleget_style_sizes_arr;
			} elseif ( $styleobj->controltype == 'style' ) {
				self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->choices  = $bibleget_style_choices_arr;
				self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->settings = array(
					'bold_setting'          => 'BGET[VERSENUMBERSTYLES_BOLD]',
					'italic_setting'        => 'BGET[VERSENUMBERSTYLES_ITALIC]',
					'underline_setting'     => 'BGET[VERSENUMBERSTYLES_UNDERLINE]',
					'strikethrough_setting' => 'BGET[VERSENUMBERSTYLES_STRIKETHROUGH]',
					'valign_setting'        => 'BGET[VERSENUMBERSTYLES_VALIGN]',
				);
			} elseif ( $styleobj->controltype == 'select' ) {
				self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->choices     = $styleobj->choices;
				self::$bibleget_style_settings->{'BGET[VERSENUMBERSTYLES_' . $o . ']'}->description = $styleobj->description;
			}

			self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}          = new stdClass();
			self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->section = 'bibleget_versetext_style_options';
			/* translators: in reference to font Size, style and color (e.g. 'style for text of verses') */
			self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->title       = $styleobj->title;
			self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->controltype = $styleobj->controltype;
			if ( $styleobj->controltype == 'range' ) {
				self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->choices = $bibleget_style_sizes_arr;
			} elseif ( $styleobj->controltype == 'style' ) {
				self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->choices  = $bibleget_style_choices_arr;
				self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->settings = array(
					'bold_setting'          => 'BGET[VERSETEXTSTYLES_BOLD]',
					'italic_setting'        => 'BGET[VERSETEXTSTYLES_ITALIC]',
					'underline_setting'     => 'BGET[VERSETEXTSTYLES_UNDERLINE]',
					'strikethrough_setting' => 'BGET[VERSETEXTSTYLES_STRIKETHROUGH]',
					'valign_setting'        => 'BGET[VERSETEXTSTYLES_VALIGN]',
				);
			} elseif ( $styleobj->controltype == 'select' ) {
				self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->choices     = $styleobj->choices;
				self::$bibleget_style_settings->{'BGET[VERSETEXTSTYLES_' . $o . ']'}->description = $styleobj->description;
			}
		}

		self::$websafe_fonts = array(
			array(
				'font-family'    => 'Arial',
				'fallback'       => 'Helvetica',
				'generic-family' => 'sans-serif',
			),
			array(
				'font-family'    => 'Arial Black',
				'fallback'       => 'Gadget',
				'generic-family' => 'sans-serif',
			),
			array(
				'font-family'    => 'Book Antiqua',
				'fallback'       => 'Palatino',
				'generic-family' => 'serif',
			),
			array(
				'font-family'    => 'Courier New',
				'fallback'       => 'Courier',
				'generic-family' => 'monospace',
			),
			array(
				'font-family'    => 'Georgia',
				'generic-family' => 'serif',
			),
			array(
				'font-family'    => 'Impact',
				'fallback'       => 'Charcoal',
				'generic-family' => 'sans-serif',
			),
			array(
				'font-family'    => 'Lucida Console',
				'fallback'       => 'Monaco',
				'generic-family' => 'monospace',
			),
			array(
				'font-family'    => 'Lucida Sans Unicode',
				'fallback'       => 'Lucida Grande',
				'generic-family' => 'sans-serif',
			),
			array(
				'font-family'    => 'Palatino Linotype',
				'fallback'       => 'Palatino',
				'generic-family' => 'serif',
			),
			array(
				'font-family'    => 'Tahoma',
				'fallback'       => 'Geneva',
				'generic-family' => 'sans-serif',
			),
			array(
				'font-family'    => 'Times New Roman',
				'fallback'       => 'Times',
				'generic-family' => 'serif',
			),
			array(
				'font-family'    => 'Trebuchet MS',
				'fallback'       => 'Helvetica',
				'generic-family' => 'sans-serif',
			),
			array(
				'font-family'    => 'Verdana',
				'fallback'       => 'Geneva',
				'generic-family' => 'sans-serif',
			),
		);
	}

	public static function get_font_index( $fontfamily ) {
		foreach ( self::$websafe_fonts as $index => $font ) {
			if ( $font['font-family'] == $fontfamily ) {
				return $index;
			}
		}
		return false;
	}

	public static function addPanelsAndSections( $wp_customize ) {
		$wp_customize->add_panel(
			'bibleget_style_options',
			array(
				'priority'    => 35,
				'capability'  => 'manage_options',
				// 'theme_supports'    => '',
				'title'       => __( 'BibleGet plugin styles', 'bibleget-io' ), // Visible title of section
				'description' => __( 'Custom styles that apply to the text formatting of the biblical quotes', 'bibleget-io' ),
			)
		);

		$wp_customize->add_section(
			'bibleget_paragraph_style_options',
			array(
				'priority'    => 10, // Determines what order this appears in
				'capability'  => 'manage_options', // Capability needed to tweak
				// 'theme_supports'    => '',
				'title'       => __( 'General styles', 'bibleget-io' ), // Visible title of section
				'description' => __( 'Styles that apply to the Bible quote block as a whole', 'bibleget-io' ),
				'panel'       => 'bibleget_style_options',
			)
		);

		$wp_customize->add_section(
			'bibleget_bibleversion_style_options',
			array(
				'priority'    => 20, // Determines what order this appears in
				'capability'  => 'manage_options', // Capability needed to tweak
				// 'theme_supports'    => '',
				'title'       => __( 'Bible version styles', 'bibleget-io' ), // Visible title of section
				'description' => __( 'Styles that apply to the Bible version reference (e.g. NABRE)', 'bibleget-io' ),
				'panel'       => 'bibleget_style_options',
			)
		);

		$wp_customize->add_section(
			'bibleget_bookchapter_style_options',
			array(
				'priority'    => 30, // Determines what order this appears in
				'capability'  => 'manage_options', // Capability needed to tweak
				// 'theme_supports'    => '',
				'title'       => __( 'Book / Chapter styles', 'bibleget-io' ), // Visible title of section
				'description' => __( 'Styles that apply to the books and chapter reference', 'bibleget-io' ),
				'panel'       => 'bibleget_style_options',
			)
		);

		$wp_customize->add_section(
			'bibleget_versenumber_style_options',
			array(
				'priority'    => 40, // Determines what order this appears in
				'capability'  => 'manage_options', // Capability needed to tweak
				// 'theme_supports'    => '',
				'title'       => __( 'Verse number styles', 'bibleget-io' ), // Visible title of section
				'description' => __( 'Styles that apply to verse numbers', 'bibleget-io' ),
				'panel'       => 'bibleget_style_options',
			)
		);

		$wp_customize->add_section(
			'bibleget_versetext_style_options',
			array(
				'priority'    => 50, // Determines what order this appears in
				'capability'  => 'manage_options', // Capability needed to tweak
				// 'theme_supports'    => '',
				'title'       => __( 'Verse text styles', 'bibleget-io' ), // Visible title of section
				'description' => __( 'Styles that apply to the text of the verses', 'bibleget-io' ),
				'panel'       => 'bibleget_style_options',
			)
		);
	}

	/**
	 * This hooks into 'customize_register' (available as of WP 3.4) and allows
	 * you to add new sections and controls to the Theme Customize screen.
	 *
	 * Note: To enable instant preview, we have to actually write a bit of custom
	 * javascript. See live_preview() for more.
	 *
	 * @see add_action('customize_register',$func)
	 * @param \WP_Customize_Manager $wp_customize
	 * @link http://ottopress.com/2012/how-to-leverage-the-theme-customizer-in-your-own-themes/
	 * @since BibleGet I/O 3.6
	 */
	public static function register( $wp_customize ) {
		if ( false === self::$bibleget_style_settings instanceof stdClass || false === property_exists( self::$bibleget_style_settings, 'BGET[PARAGRAPHSTYLES_FONTFAMILY]' ) ) {
			self::init();
		}
		if ( false === self::$bget_properties instanceof BGETPROPERTIES || false === property_exists( self::$bget_properties, 'OPTIONS' ) ) {
			self::initializeOptions();
		}
		include_once plugin_dir_path( __FILE__ ) . 'custom_controls.php';
		self::addPanelsAndSections( $wp_customize );
		$bibleget_style_settings_cc = 0;
		foreach ( self::$bibleget_style_settings as $style_setting => $style_setting_obj ) {
			// separate case for FONT_STYLE !
			if ( strpos( $style_setting, 'FONTSTYLE' ) ) {
				foreach ( $style_setting_obj->settings as $setting ) {
					$settingID         = str_replace( 'BGET[', '', $setting );
					$settingID         = str_replace( ']', '', $settingID );
					$casttype          = self::$bget_properties->OPTIONS[ $settingID ]['type'];
					$sanitize_callback = '';
					switch ( $casttype ) {
						case 'boolean':
							$sanitize_callback = 'BibleGet_Customize::sanitize_boolean';
							break;
						case 'integer':
							$sanitize_callback = 'absint';
							break;
					}
					$wp_customize->add_setting(
						$setting,
						array(
							'default'           => self::$bget_properties->OPTIONS[ $settingID ]['default'],
							'type'              => 'option',
							'capability'        => 'manage_options',
							'transport'         => 'postMessage',
							'sanitize_callback' => $sanitize_callback,
						)
					);
				}

				$wp_customize->add_control(
					new BibleGet_Customize_StyleBar_Control(
						$wp_customize,
						$style_setting . '_ctl',
						array(
							'label'    => $style_setting_obj->title,
							'settings' => $style_setting_obj->settings,
							'priority' => $bibleget_style_settings_cc++,
							'section'  => $style_setting_obj->section,
							'choices'  => $style_setting_obj->choices,
						)
					)
				);
			} else {
				$settingID         = str_replace( 'BGET[', '', $style_setting );
				$settingID         = str_replace( ']', '', $settingID );
				$casttype          = self::$bget_properties->OPTIONS[ $settingID ]['type'];
				$sanitize_callback = '';
				switch ( $casttype ) {
					case 'integer':
						$sanitize_callback = 'absint';
						break;
					case 'number':
						$sanitize_callback = 'BibleGet_Customize::sanitize_float'; // 'floatval'; floatval returns null?
						break;
					case 'boolean':
						$sanitize_callback = 'BibleGet_Customize::sanitize_boolean';
						break;
					case 'string':
						$sanitize_callback = 'esc_html'; // 'BibleGet_Customize::sanitize_string';
						break;
					case 'array':
						$sanitize_callback = 'BibleGet_Customize::sanitize_array';
						break;
				}
				// 2. Register new settings to the WP database...
				$wp_customize->add_setting(
					$style_setting, // No need to use a SERIALIZED name, as `theme_mod` settings already live under one db record
					array(
						'default'           => self::$bget_properties->OPTIONS[ $settingID ]['default'], // Default setting/value to save
						'type'              => 'option', // Is this an 'option' or a 'theme_mod'?
						'capability'        => 'manage_options', // Optional. Special permissions for accessing this setting.
						'transport'         => 'postMessage', // What triggers a refresh of the setting? 'refresh' or 'postMessage' (instant)?
						'sanitize_callback' => $sanitize_callback,
					)
				);

				// 3. Finally, we define the control itself (which links a setting to a section and renders the HTML controls)...
				switch ( $style_setting_obj->controltype ) {
					case 'color':            // purposefully no break here
					case 'textalign':        // purposefully no break here
					case 'fontselect':
						self::addCustomControl( $wp_customize, $style_setting, $style_setting_obj, $bibleget_style_settings_cc, $style_setting_obj->controltype );
						break;
					case 'select':
						$ctl_atts = array(
							'label'    => $style_setting_obj->title,
							'settings' => $style_setting,
							'priority' => $bibleget_style_settings_cc++,
							'section'  => $style_setting_obj->section,
							'type'     => 'select',
							'choices'  => $style_setting_obj->choices,
						);
						if ( property_exists( $style_setting_obj, 'description' ) ) {
							$ctl_atts['description'] = $style_setting_obj->description;
						}
						$wp_customize->add_control(
							$style_setting . '_ctl',
							$ctl_atts
						);
						break;
					case 'number':
						$wp_customize->add_control(
							$style_setting . '_ctl',
							array(
								'label'    => $style_setting_obj->title,
								'settings' => $style_setting,
								'priority' => $bibleget_style_settings_cc++,
								'section'  => $style_setting_obj->section,
								'type'     => 'number',
							)
						);
						break;
					case 'range':
						$wp_customize->add_control(
							$style_setting . '_ctl',
							array(
								'label'       => $style_setting_obj->title,
								'settings'    => $style_setting,
								'priority'    => $bibleget_style_settings_cc++,
								'section'     => $style_setting_obj->section,
								'type'        => 'range',
								'input_attrs' => array(
									'min'  => property_exists( $style_setting_obj, 'choices' ) ? $style_setting_obj->choices['min'] : 0,
									'max'  => property_exists( $style_setting_obj, 'choices' ) ? $style_setting_obj->choices['max'] : 30,
									'step' => property_exists( $style_setting_obj, 'choices' ) ? $style_setting_obj->choices['step'] : 1,
								),
							)
						);
						break;
				}
			}
		}
	}

	private static function addCustomControl( $wp_customize, $style_setting, $style_setting_obj, &$bibleget_style_settings_cc, $type ) {
		$options = array(
			'label'    => $style_setting_obj->title,
			'settings' => $style_setting,
			'priority' => $bibleget_style_settings_cc++,
			'section'  => $style_setting_obj->section,
		);

		switch ( $type ) {
			case 'textalign':
				$control = new BibleGet_Customize_TextAlign_Control(
					$wp_customize,
					$style_setting . '_ctl',
					$options
				);
				break;
			case 'fontselect':
				$control = new BibleGet_Customize_FontSelect_Control(
					$wp_customize,
					$style_setting . '_ctl',
					$options
				);
				break;
			case 'color':
				$control = new WP_Customize_Color_Control(
					$wp_customize,
					$style_setting . '_ctl',
					$options
				);
		}
		$wp_customize->add_control( $control );
	}

	public static function sanitize_boolean( $input ) {
		if ( ! isset( $input ) ) {
			return false;
		}
		$retval = false;
		if ( is_string( $input ) ) {
			if ( $input == 'true' || $input == '1' || $input == 'on' || $input == 'yes' ) {
				$retval = true;
			}
		} elseif ( is_numeric( $input ) ) {
			if ( $input === 1 ) {
				$retval = true;
			}
		} elseif ( is_bool( $input ) && $input === true ) {
			$retval = true;
		}
		return $retval;
	}

	public static function sanitize_array( $input ) {
		if ( ! is_array( $input ) ) {
			if ( strpos( ',', $input ) ) {
				$input = explode( ',', $input );
			} else {
				$input = array( $input );
			}
		}
		$newArr = array();
		foreach ( $input as $key => $value ) {
			$value          = wp_filter_nohtml_kses( $value );
			$newArr[ $key ] = $value;
		}
		return $newArr;
	}

	public static function sanitize_float( $input ) {
		return filter_var( $input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION );
	}

	public static function buildCustomizerStylesheet() {
		$is_googlefont = false;
		$fontfamily    = self::$bget_properties['PARAGRAPHSTYLES_FONTFAMILY'];
		if ( ! empty( $fontfamily ) ) {
			// let's check if it's a websafe font or a google font
			if ( self::get_font_index( $fontfamily ) === false ) {
				// not a websafe font, so most probably a google font...
				// should we add a double check against current google fonts here before proceeding?
				$is_googlefont = true;
				echo '<link href="https://fonts.googleapis.com/css?family=' . $fontfamily . '" rel="stylesheet" type="text/css" />';
			}
		}
		echo '<style type="text/css" id="bibleGetDynamicStylesheet">' . PHP_EOL;
		if ( $is_googlefont && ! empty( $fontfamily ) ) {
			$t       = explode( ':', $fontfamily );
			$ff      = preg_replace( '/[\+|:]/', ' ', $t[0] );
			$cssrule = sprintf(
				'%s { %s: %s; }',
				'.bibleQuote.results',
				'font-family',
				"'" . $ff . "'"
			);
			echo $cssrule;
		} else {
			self::generate_options_css( '.bibleQuote.results', 'font-family', self::$bget_properties['PARAGRAPHSTYLES_FONTFAMILY'] );
		}
		echo PHP_EOL;
		echo '.bibleQuote.results p { margin: 0; }';
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results', 'border-width', self::$bget_properties['PARAGRAPHSTYLES_BORDERWIDTH'], '', 'px' );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results', 'border-radius', self::$bget_properties['PARAGRAPHSTYLES_BORDERRADIUS'], '', 'px' );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results', 'border-color', self::$bget_properties['PARAGRAPHSTYLES_BORDERCOLOR'], '', '' );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results', 'border-style', BGET::CSSRULE['BORDERSTYLE'][ self::$bget_properties['PARAGRAPHSTYLES_BORDERSTYLE'] ], '', '' );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results', 'background-color', self::$bget_properties['PARAGRAPHSTYLES_BACKGROUNDCOLOR'], '', '' );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results', 'width', self::$bget_properties['PARAGRAPHSTYLES_WIDTH'], '', '%' );
		echo PHP_EOL;

		$parStylesMarginTopBottom     = self::$bget_properties['PARAGRAPHSTYLES_MARGINTOPBOTTOM'];
		$parStylesMarginLeftRight     = self::$bget_properties['PARAGRAPHSTYLES_MARGINLEFTRIGHT'];
		$parStylesMarginLeftRightUnit = self::$bget_properties['PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT'];
		$cssrule                      = sprintf(
			'%s { %s: %s %s; }',
			'.bibleQuote.results',
			'margin',
			$parStylesMarginTopBottom . 'px',
			( $parStylesMarginLeftRightUnit == 'auto' ? $parStylesMarginLeftRightUnit : $parStylesMarginLeftRight . $parStylesMarginLeftRightUnit )
		);
		echo $cssrule;
		echo PHP_EOL;

		$parStylesPaddingTopBottom = self::$bget_properties['PARAGRAPHSTYLES_PADDINGTOPBOTTOM'];
		$parStylesPaddingLeftRight = self::$bget_properties['PARAGRAPHSTYLES_PADDINGLEFTRIGHT'];
		$cssrule                   = sprintf(
			'%s { %s: %s %s; }',
			'.bibleQuote.results',
			'padding',
			$parStylesPaddingTopBottom . 'px',
			$parStylesPaddingLeftRight . 'px'
		);
		echo $cssrule;
		echo PHP_EOL;

		self::generate_options_css( '.bibleQuote.results p.versesParagraph', 'text-align', BGET::CSSRULE['ALIGN'][ self::$bget_properties['PARAGRAPHSTYLES_PARAGRAPHALIGN'] ] );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results p.bibleVersion', 'color', self::$bget_properties['VERSIONSTYLES_TEXTCOLOR'] );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results .bookChapter', 'color', self::$bget_properties['BOOKCHAPTERSTYLES_TEXTCOLOR'] );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results p.versesParagraph', 'color', self::$bget_properties['VERSETEXTSTYLES_TEXTCOLOR'] );
		echo PHP_EOL;
		self::generate_options_css( '.bibleQuote.results p.versesParagraph span.verseNum', 'color', self::$bget_properties['VERSENUMBERSTYLES_TEXTCOLOR'] );
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.verseNum { margin: 0px 3px; }';
		echo PHP_EOL;
		$fontsizerules = array(
			'VERSIONSTYLES_FONTSIZE'     => '.bibleQuote.results p.bibleVersion',
			'BOOKCHAPTERSTYLES_FONTSIZE' => '.bibleQuote.results .bookChapter',
			'VERSETEXTSTYLES_FONTSIZE'   => '.bibleQuote.results p.versesParagraph',
			'VERSENUMBERSTYLES_FONTSIZE' => '.bibleQuote.results p.versesParagraph span.verseNum',
		);
		$fontsizeunits = array(
			'VERSIONSTYLES_FONTSIZEUNIT',
			'BOOKCHAPTERSTYLES_FONTSIZEUNIT',
			'VERSETEXTSTYLES_FONTSIZEUNIT',
			'VERSENUMBERSTYLES_FONTSIZEUNIT',
		);
		$i             = 0;
		foreach ( $fontsizerules as $fontsizerule => $css_selector ) {
			$fontSize     = self::$bget_properties[ $fontsizerule ];
			$fontSizeUnit = self::$bget_properties[ $fontsizeunits[ $i++ ] ];
			if ( $fontSizeUnit == 'em' ) {
				$fontSize /= 10;
			}
			$cssrule = '';
			// if (!empty($fontSize)) {
			$cssrule = sprintf(
				'%s { %s:%s; }',
				$css_selector,
				'font-size',
				$fontSize . $fontSizeUnit
				// number_format(($fontSize / 10),1,'.','').'em'
			);
			echo $cssrule;
			echo PHP_EOL;
			// }
		}

		$fontstylerules = array(
			'VERSIONSTYLES_'     => '.bibleQuote.results p.bibleVersion',
			'BOOKCHAPTERSTYLES_' => '.bibleQuote.results .bookChapter',
			'VERSETEXTSTYLES_'   => '.bibleQuote.results p.versesParagraph',
			'VERSENUMBERSTYLES_' => '.bibleQuote.results p.versesParagraph span.verseNum',
		);
		foreach ( $fontstylerules as $fontstylerule => $css_selector ) {
			$cssrule = '';
			// $mod = get_theme_mod($fontstylerule, self::$bibleget_style_settings->$fontstylerule->dfault);
			$bold          = self::$bget_properties[ $fontstylerule . 'BOLD' ];
			$italic        = self::$bget_properties[ $fontstylerule . 'ITALIC' ];
			$underline     = self::$bget_properties[ $fontstylerule . 'UNDERLINE' ];
			$strikethrough = self::$bget_properties[ $fontstylerule . 'STRIKETHROUGH' ];
			// $fval = array();
			// if (!empty($mod)) {
			// $fval = explode(',', $mod);

			if ( $bold ) { // (in_array('bold', $fval)) {
				$cssrule .= 'font-weight: bold;';
			} else {
				$cssrule .= 'font-weight: normal;';
			}

			if ( $italic ) { // (in_array('italic', $fval)) {
				$cssrule .= 'font-style: italic;';
			} else {
				$cssrule .= 'font-style: normal;';
			}

			if ( $underline || $strikethrough ) { // (in_array('underline', $fval)) {
				$rule = array();
				if ( $underline ) {
					array_push( $rule, 'underline' );
				}
				if ( $strikethrough ) {
					array_push( $rule, 'line-through' );
				}
				$cssrule .= 'text-decoration: ' . explode( ' ', $rule ) . ';';
				/*
				} elseif ($strikethrough) { //(in_array('strikethrough', $fval)) {
					$cssrule .= 'text-decoration: line-through;';*/
			} else {
				$cssrule .= 'text-decoration: none;';
			}

			if ( $fontstylerule == 'VERSENUMBERSTYLES_' ) {
				switch ( self::$bget_properties['VERSENUMBERSTYLES_VALIGN'] ) {
					case BGET::VALIGN['SUPERSCRIPT'];
						$cssrule .= 'vertical-align: baseline; position: relative; top: -0.6em;';
						break;
					case BGET::VALIGN['SUBSCRIPT'];
						$cssrule .= 'vertical-align: baseline; position: relative; top: 0.6em;';
						break;
					case BGET::VALIGN['NORMAL'];
						$cssrule .= 'vertical-align: baseline; position: static;';
						break;
				}
			}
			/*
				if (in_array('superscript', $fval)) {
					$cssrule .= 'vertical-align: baseline; position: relative; top: -0.6em;';
				} elseif (in_array('subscript', $fval)) {
					$cssrule .= 'vertical-align: baseline; position: relative; top:0.6em;';
				} else {
					$cssrule .= 'vertical-align: baseline; position: static;';
				}
				*/
			printf( '%s { %s }', $css_selector, $cssrule );
			echo PHP_EOL;
			// }
			// unset($fval);
		}

		// self::generate_css('.bibleQuote.results p.versesParagraph', 'line-height', 'linespacing_verses', '', '%');
		echo PHP_EOL;

		// $linespacing_verses = get_theme_mod('linespacing_verses', self::$bibleget_style_settings->linespacing_verses->dfault);
		self::generate_options_css( '.bibleQuote.results p.versesParagraph', 'line-height', self::$bget_properties['PARAGRAPHSTYLES_LINEHEIGHT'] . 'em' );
		// $linespacing_verses = self::$bget_properties['PARAGRAPHSTYLES_LINEHEIGHT'].'em';
		// $poetic_linespacing = (self::$bget_properties['PARAGRAPHSTYLES_LINEHEIGHT'] + 1.0).'em';
		$fontsize_versenumber = self::$bget_properties['VERSENUMBERSTYLES_FONTSIZE'];
		if ( self::$bget_properties['VERSENUMBERSTYLES_FONTSIZEUNIT'] == 'em' ) {
			$fontsize_versenumber /= 10;
		}
		$fontsize_versenumber .= self::$bget_properties['VERSENUMBERSTYLES_FONTSIZEUNIT'];
		// $fontsize_versenumber = get_theme_mod('versenumber_fontsize', self::$bibleget_style_settings->versenumber_fontsize->dfault);
		echo '.bibleQuote.results p.versesParagraph span.sm { text-transform: lowercase; font-variant: small-caps; } ';
		echo PHP_EOL;
		echo '/* Senseline. A line that is broken to be reading aloud/public speaking. Poetry is included in this category. */';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.pof { display: block; text-indent: 0; margin-top:1em; margin-left:5%; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.po { display: block; margin-left:5%; margin-top:.5em; margin-bottom:.5em; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.pol { display: block; margin-left:5%; margin-top:-1%; margin-bottom:1em; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.pos { display: block; margin-top:0.3em; margin-left:5%; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.poif { display: block; margin-left:7%; margin-top:1%; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.poi { display: block; margin-left:7%; margin-top:.5em; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.poil { display: block; margin-left:7%; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.po3 { display: block; margin-left:7%; margin-top:-1%; line-height: 100%; }';
		echo PHP_EOL;
		echo '.bibleQuote.results p.versesParagraph span.po3l { display: block; margin-left:7%; margin-top:-1%; line-height: 100%; }';
		echo PHP_EOL;
		echo ".bibleQuote.results p.versesParagraph span.speaker { font-weight: bold; background-color: #eeeeee; padding: 3px; border-radius: 3px; font-size: $fontsize_versenumber; }";
		echo PHP_EOL;
		echo '.bibleQuote.errors { display: none; }';
		echo PHP_EOL;
		echo '.bibleQuote.info { display: none; }';
		echo PHP_EOL;

		// $bibleversionalign = get_theme_mod('bibleversionalign', 'left');
		$bibleversionalign = 'left';
		switch ( intval( self::$bget_properties['LAYOUTPREFS_BIBLEVERSIONALIGNMENT'] ) ) {
			case BGET::ALIGN['CENTER']:
				$bibleversionalign = 'center';
				break;
			case BGET::ALIGN['RIGHT']:
				$bibleversionalign = 'right';
				break;
		}
		echo ".bibleQuote.results p.bibleVersion { text-align: $bibleversionalign; }";
		echo PHP_EOL;

		// $bookchapteralign = get_theme_mod('bookchapteralign', 'left');
		$bookchapteralign = 'left';
		switch ( intval( self::$bget_properties['LAYOUTPREFS_BOOKCHAPTERALIGNMENT'] ) ) {
			case BGET::ALIGN['CENTER']:
				$bookchapteralign = 'center';
				break;
			case BGET::ALIGN['RIGHT']:
				$bookchapteralign = 'right';
				break;
		}
		echo ".bibleQuote.results .bookChapter { text-align: $bookchapteralign; }";
		echo PHP_EOL;

		echo '.bibleQuote.results span.bookChapter { margin-left: 12px; }'; // will only apply when bottom-inline
		echo PHP_EOL;
		echo '</style>';
	}

	/**
	 * This will output the custom WordPress settings to the live theme's WP head.
	 *
	 * Used by hook: 'wp_head'
	 *
	 * @see add_action('wp_head',$func)
	 * @since BibleGet I/O 3.6
	 */
	public static function header_output() {
		if ( false === self::$bibleget_style_settings instanceof stdClass || false === property_exists( self::$bibleget_style_settings, 'BGET[PARAGRAPHSTYLES_FONTFAMILY]' ) ) {
			self::init();
		}
		if ( false === self::$bget_properties instanceof BGETPROPERTIES || false === property_exists( self::$bget_properties, 'OPTIONS' ) ) {
			self::initializeOptions();
		}
		self::buildCustomizerStylesheet();
	}

	public static function bibleget_customizer_print_script( $hook ) {
		// can load custom scripts here...
		wp_enqueue_script(
			'bibleget-customizerpanel',
			plugins_url( '../js/customizer-panel.js', __FILE__ ),
			array( 'jquery' ),
			'',
			true
		);

		wp_enqueue_style(
			'bibleget-customizerpanel-style',
			plugins_url( '../css/customizer-panel.css', __FILE__ )
		);
	}

	/**
	 * This outputs the javascript needed to automate the live settings preview.
	 * Also keep in mind that this function isn't necessary unless your settings
	 * are using 'transport'=>'postMessage' instead of the default 'transport'
	 * => 'refresh'
	 *
	 * Used by hook: 'customize_preview_init'
	 *
	 * @see add_action('customize_preview_init',$func)
	 * @since BibleGet I/O 3.6
	 */
	public static function live_preview() {
		wp_enqueue_script(
			'bibleget-customizerpreview', // Give the script a unique ID
			plugins_url( '../js/customizer-preview.js', __FILE__ ), // Define the path to the JS file
			array( 'jquery', 'customize-preview' ), // Define dependencies
			'', // Define a version (optional)
			true // Specify whether to put in footer (leave this true)
		);

		// and these are our constants, as close as I can get to ENUMS
		// hey with this operation they transform quite nicely for the client side javascript!
		$bgetreflection    = new ReflectionClass( 'BGET' );
		$bgetinstanceprops = $bgetreflection->getConstants();
		$bget_constants     = array();
		foreach ( $bgetinstanceprops as $key => $value ) {
			$bget_constants[ $key ] = $value;
		}
		wp_localize_script(
			'bibleget-customizerpreview',
			'BibleGetGlobal',
			array(
				'ajax_url'       => admin_url( 'admin-ajax.php' ),
				'BGETProperties' => self::$bget_properties->OPTIONS,
				'BGETConstants'  => $bget_constants,
				'BGET'           => self::$bget_properties->BGETOPTIONS,
			)
		);
	}

	/**
	 * This will generate a line of CSS for use in header output. If the setting
	 * ($mod_name) has no defined value, the CSS will not be output.
	 *
	 * @uses get_theme_mod()
	 * @param string $selector CSS selector
	 * @param string $style The name of the CSS *property* to modify
	 * @param string $mod_name The name of the 'theme_mod' option to fetch
	 * @param string $prefix Optional. Anything that needs to be output before the CSS property
	 * @param string $postfix Optional. Anything that needs to be output after the CSS property
	 * @param bool   $echo Optional. Whether to print directly to the page (default: true).
	 * @return string Returns a single line of CSS with selectors and a property.
	 * @since BibleGet I/O 3.6
	 */
	public static function generate_css( $selector, $style, $mod_name, $prefix = '', $postfix = '', $echoback = true ) {
		$returnval = '';
		$mod       = get_theme_mod( $mod_name, self::$bibleget_style_settings->$mod_name->dfault );
		if ( ! empty( $mod ) ) {
			$returnval = sprintf(
				'%s { %s: %s; }',
				$selector,
				$style,
				$prefix . $mod . $postfix
			);
			if ( $echoback ) {
				echo $returnval;
			}
		}
		return $returnval;
	}

	public static function generate_options_css( $selector, $style, $rulevalue, $prefix = '', $postfix = '', $echoback = true ) {
		$returnval = '';
		$returnval = sprintf(
			'%s { %s: %s; }',
			$selector,
			$style,
			$prefix . $rulevalue . $postfix
		);
		if ( $echoback ) {
			echo $returnval;
		}
		return $returnval;
	}
}
