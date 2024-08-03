<?php

namespace BibleGet;

use BibleGet\Enums\BGET;

/**
 * Options for formatting and layout of Bible quotes
 */
class Properties {
	/**
	 * Combination of saved user options and defaults if user option not set
	 *
	 * @var array
	 */
	public $options;

	/**
	 * Saved user options
	 *
	 * @var array
	 */
	public $bget_options;

	const OPTIONSDEFAULTS = array(
		'PARAGRAPHSTYLES_FONTFAMILY'          => 'Times New Roman',
		'PARAGRAPHSTYLES_LINEHEIGHT'          => 1.5,
		'PARAGRAPHSTYLES_PADDINGTOPBOTTOM'    => 12,
		'PARAGRAPHSTYLES_PADDINGLEFTRIGHT'    => 10,
		'PARAGRAPHSTYLES_MARGINTOPBOTTOM'     => 12,
		'PARAGRAPHSTYLES_MARGINLEFTRIGHT'     => 12,
		'PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT' => 'auto', // px, em, auto.
		'PARAGRAPHSTYLES_PARAGRAPHALIGN'      => BGET::ALIGN['JUSTIFY'],
		'PARAGRAPHSTYLES_WIDTH'               => 80, // in percent.
		'PARAGRAPHSTYLES_NOVERSIONFORMATTING' => false,
		'PARAGRAPHSTYLES_BORDERWIDTH'         => 1, // unit: px.
		'PARAGRAPHSTYLES_BORDERCOLOR'         => '#0000ff',
		'PARAGRAPHSTYLES_BORDERSTYLE'         => BGET::BORDERSTYLE['SOLID'],
		'PARAGRAPHSTYLES_BORDERRADIUS'        => 12, // unit: px.
		'PARAGRAPHSTYLES_BACKGROUNDCOLOR'     => '#efece9',
		'VERSIONSTYLES_BOLD'                  => true,
		'VERSIONSTYLES_ITALIC'                => false,
		'VERSIONSTYLES_UNDERLINE'             => false,
		'VERSIONSTYLES_STRIKETHROUGH'         => false,
		'VERSIONSTYLES_TEXTCOLOR'             => '#000044',
		'VERSIONSTYLES_FONTSIZE'              => 9,
		'VERSIONSTYLES_FONTSIZEUNIT'          => 'em', // can be px, em.
		'VERSIONSTYLES_VALIGN'                => BGET::VALIGN['NORMAL'],
		'BOOKCHAPTERSTYLES_BOLD'              => true,
		'BOOKCHAPTERSTYLES_ITALIC'            => false,
		'BOOKCHAPTERSTYLES_UNDERLINE'         => false,
		'BOOKCHAPTERSTYLES_STRIKETHROUGH'     => false,
		'BOOKCHAPTERSTYLES_TEXTCOLOR'         => '#000044',
		'BOOKCHAPTERSTYLES_FONTSIZE'          => 10,
		'BOOKCHAPTERSTYLES_FONTSIZEUNIT'      => 'em',
		'BOOKCHAPTERSTYLES_VALIGN'            => BGET::VALIGN['NORMAL'],
		'VERSENUMBERSTYLES_BOLD'              => true,
		'VERSENUMBERSTYLES_ITALIC'            => false,
		'VERSENUMBERSTYLES_UNDERLINE'         => false,
		'VERSENUMBERSTYLES_STRIKETHROUGH'     => false,
		'VERSENUMBERSTYLES_TEXTCOLOR'         => '#aa0000',
		'VERSENUMBERSTYLES_FONTSIZE'          => 6,
		'VERSENUMBERSTYLES_FONTSIZEUNIT'      => 'em',
		'VERSENUMBERSTYLES_VALIGN'            => BGET::VALIGN['SUPERSCRIPT'],
		'VERSETEXTSTYLES_BOLD'                => false,
		'VERSETEXTSTYLES_ITALIC'              => false,
		'VERSETEXTSTYLES_UNDERLINE'           => false,
		'VERSETEXTSTYLES_STRIKETHROUGH'       => false,
		'VERSETEXTSTYLES_TEXTCOLOR'           => '#666666',
		'VERSETEXTSTYLES_FONTSIZE'            => 10,
		'VERSETEXTSTYLES_FONTSIZEUNIT'        => 'em',
		'VERSETEXTSTYLES_VALIGN'              => BGET::VALIGN['NORMAL'],
		'LAYOUTPREFS_SHOWBIBLEVERSION'        => BGET::VISIBILITY['SHOW'],
		'LAYOUTPREFS_BIBLEVERSIONALIGNMENT'   => BGET::ALIGN['LEFT'],
		'LAYOUTPREFS_BIBLEVERSIONPOSITION'    => BGET::POS['TOP'],
		'LAYOUTPREFS_BIBLEVERSIONWRAP'        => BGET::WRAP['NONE'],
		'LAYOUTPREFS_BOOKCHAPTERALIGNMENT'    => BGET::ALIGN['LEFT'],
		'LAYOUTPREFS_BOOKCHAPTERPOSITION'     => BGET::POS['TOP'],
		'LAYOUTPREFS_BOOKCHAPTERWRAP'         => BGET::WRAP['NONE'],
		'LAYOUTPREFS_BOOKCHAPTERFORMAT'       => BGET::FORMAT['BIBLELANG'],
		'LAYOUTPREFS_BOOKCHAPTERFULLQUERY'    => false, // false = just the name of the book and the chapter will be shown (i.e. 1 John 4), true = the full reference including the verses will be shown (i.e. 1 John 4:7-8).
		'LAYOUTPREFS_SHOWVERSENUMBERS'        => BGET::VISIBILITY['SHOW'],
		'VERSION'                             => array( 'NABRE' ),
		'QUERY'                               => 'Matthew1:1-5',
		'POPUP'                               => false,
		'PREFERORIGIN'                        => BGET::PREFERORIGIN['HEBREW'],
		'FORCEVERSION'                        => false,
		'FORCECOPYRIGHT'                      => false,
	);

	/**
	 * Checks if an option has already been set, while ensuring the correct type
	 * If not, uses the default value
	 *
	 * @param string $key Option key.
	 * @param mixed  $value Value to set.
	 */
	private function produce_option_by_type( $key, $value ) {
		switch ( gettype( $value ) ) {
			case 'string':
				return array(
					'default' => self::set_and_not_nothing( $this->bget_options, $key ) ? $this->bget_options[ $key ] : $value,
					'type'    => 'string',
				);
			case 'double':
				return array(
					'default' => self::set_and_is_number( $this->bget_options, $key ) ? floatval( $this->bget_options[ $key ] ) : $value,
					'type'    => 'number',
				);
			case 'integer':
				return array(
					'default' => self::set_and_is_number( $this->bget_options, $key ) ? intval( $this->bget_options[ $key ] ) : $value,
					'type'    => 'integer',
				);
			case 'boolean':
				return array(
					'default' => self::set_and_is_boolean( $this->bget_options, $key ) ? $this->bget_options[ $key ] : $value,
					'type'    => 'boolean',
				);
			case 'array':
				return array(
					'default' => self::set_and_is_string_array( $this->bget_options, $key ) ? $this->bget_options[ $key ] : $value,
					'type'    => 'array',
					'items'   => array( 'type' => 'string' ),
				);
		}
	}

	/**
	 * BibleGet_Properties constructor
	 */
	public function __construct() {
		$this->bget_options = get_option( 'BGET', array() );
		foreach ( self::OPTIONSDEFAULTS as $key => $value ) {
			$this->options[ $key ] = $this->produce_option_by_type( $key, $value );
		}
	}

	/**
	 * Check if a string value has been set and is not empty
	 *
	 * @param array  $arr User options array.
	 * @param string $key Option key.
	 * @return bool
	 */
	public static function set_and_not_nothing( $arr, $key ) {
		return ( isset( $arr[ $key ] ) && $arr[ $key ] !== '' );
	}

	/**
	 * Check if a boolean value has been set and is boolean
	 *
	 * @param array  $arr User options array.
	 * @param string $key Option key.
	 * @return bool
	 */
	public static function set_and_is_boolean( $arr, $key ) {
		return ( isset( $arr[ $key ] ) && is_bool( $arr[ $key ] ) );
	}

	/**
	 * Check if a number value has been set and is numeric
	 *
	 * @param array  $arr User options array.
	 * @param string $key Option key.
	 * @return bool
	 */
	public static function set_and_is_number( $arr, $key ) {
		return ( isset( $arr[ $key ] ) && is_numeric( $arr[ $key ] ) );
	}

	/**
	 * Check if a string array value has been set and is a string array with no empty values
	 *
	 * @param array  $arr User options array.
	 * @param string $key Option key.
	 * @return bool
	 */
	public static function set_and_is_string_array( $arr, $key ) {
		$ret = true;
		if ( isset( $arr[ $key ] ) && is_array( $arr[ $key ] ) && ! empty( $arr[ $key ] ) ) {
			foreach ( $arr[ $key ] as $value ) {
				if ( ! is_string( $value ) ) {
					$ret = false;
				}
			}
		} else {
			$ret = false;
		}
		return $ret;
	}
}
