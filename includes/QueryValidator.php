<?php

namespace BibleGet;

/**
 * Performs a series of validation checks to make sure the query in the request is a valid Bible quote
 *
 * Blessed Carlo Acutis, pray for us
 *
 * MINIMUM PHP REQUIREMENT: PHP 8.1 (allow for type declarations and mixed function return types)
 *
 * AUTHOR:          John Romano D'Orazio
 * AUTHOR EMAIL:    priest@johnromanodorazio.com
 * AUTHOR WEBSITE:  https://www.johnromanodorazio.com
 * PROJECT WEBSITE: https://www.bibleget.io
 * PROJECT EMAIL:   admin@bibleget.io | bibleget.io@gmail.com
 *
 * Copyright John Romano D'Orazio 2014-2024
 * Licensed under Apache License 2.0
 */
class QueryValidator {

	const QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR                  = 0;
	const VALID_CHAPTER_MUST_FOLLOW_BOOK                              = 1;
	const IS_VALID_BOOK_INDICATOR                                     = 2;
	const VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_CHAPTER_VERSE_SEPARATOR = 3;
	const VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS           = 4;
	const CHAPTER_VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS   = 5;
	const VERSE_RANGE_MUST_CONTAIN_VALID_VERSE_NUMBERS                = 6;
	const CORRESPONDING_CHAPTER_VERSE_CONSTRUCTS_IN_VERSE_RANGE_OVER_CHAPTERS = 7;
	const CORRESPONDING_VERSE_SEPARATORS_FOR_MULTIPLE_VERSE_RANGES            = 8;
	const NON_CONSECUTIVE_VERSES_NOT_ASCENDING_ORDER                          = 9;
	const MUST_AT_LEAST_START_WITH_VALID_CHAPTER                              = 10;

	private $book_idx_base      = -1;
	private $non_zero_book_idx  = -1;
	private $current_variant    = '';
	private $current_book       = '';
	private $current_query      = '';
	private $current_full_query = '';
	private $current_page_url   = '';
	private $error_messages     = array();
	private $initial_queries    = array();
	private $versions_requested = array();
	private $indexes            = array();
	private $biblebooks         = array();
	public $validated_queries   = array();
	public $validated_variants  = array();
	public $errs                = array();


	function __construct( $queries, $versions, $current_page_url ) {
		$this->initial_queries    = $queries;
		$this->versions_requested = $versions;
		$this->error_messages     = array(
			/* translators: 1 = single bible quote reference, 2 = full query string with all bible quote references */
			__( 'The first query <%1$s> in the querystring <%2$s> must start with a valid book indicator!', 'bibleget-io' ),
			__( 'You must have a valid chapter following the book indicator!', 'bibleget-io' ),
			__( 'The book indicator is not valid. Please check the documentation for a list of valid book indicators.', 'bibleget-io' ),
			__( 'You cannot request discontinuous verses without first indicating a chapter for the discontinuous verses.', 'bibleget-io' ),
			__( 'A request for discontinuous verses must contain two valid verse numbers on either side of a discontinuous verse indicator.', 'bibleget-io' ),
			__( 'A chapter-verse separator must be preceded by a valid chapter number and followed by a valid verse number.', 'bibleget-io' ),
			__( 'A request for a range of verses must contain two valid verse numbers on either side of a verse range indicator.', 'bibleget-io' ),
			__( 'If there is a chapter-verse construct following a dash, there must also be a chapter-verse construct preceding the same dash.', 'bibleget-io' ),
			__( 'Multiple verse ranges have been requested, but there are not enough non-consecutive verse indicators. Multiple verse ranges assume there are non-consecutive verse indicators that connect them.', 'bibleget-io' ),
			/* translators: 1 = bible verse, 2 = bible verse, 3 = bible quote reference */
			__( 'Non consecutive verses must be in ascending order, instead %1$d >= %2$d in the expression <%3$s>', 'bibleget-io' ),
			__( "A query that doesn't start with a book indicator must however start with a valid chapter indicator!", 'bibleget-io' ),
		);

		foreach ( $versions as $version ) {
			$temp = get_option( 'bibleget_' . $version . 'IDX' );
			if ( is_object( $temp ) ) {
				$this->indexes[ $version ] = json_decode( json_encode( $temp ), true );
			} elseif ( is_array( $temp ) ) {
				$this->indexes[ $version ] = $temp;
			}
		}

		for ( $i = 0; $i < 73; $i++ ) {
			$usrprop                = 'bibleget_biblebooks' . $i;
			$jsbook                 = json_decode( get_option( $usrprop ), true );
			$this->biblebooks[ $i ] = $jsbook;
		}

		$this->current_page_url = $current_page_url;
	}

	private static function string_with_upper_and_lower_case_variants( $str ) {
		return preg_match( '/\p{L&}/u', $str );
	}

	private static function idx_of( $needle, $haystack ) {
		foreach ( $haystack as $index => $value ) {
			if ( is_array( $value ) ) {
				foreach ( $value as $value2 ) {
					if ( in_array( $needle, $value2 ) ) {
						return $index;
					}
				}
			} elseif ( in_array( $needle, $value ) ) {
				return $index;
			}
		}
		return false;
	}


	private static function match_book_in_query( $query ) {
		if ( self::string_with_upper_and_lower_case_variants( $query ) ) {
			if ( preg_match( '/^([1-4]{0,1}((\p{Lu}\p{Ll}*)+))/u', $query, $res ) ) {
				return $res;
			} else {
				return false;
			}
		} elseif ( preg_match( '/^([1-4]{0,1}((\p{L}\p{M}*)+))/u', $query, $res ) ) {
				return $res;
		} else {
			return false;
		}
	}

	private static function validate_rule_against_query( $rule, $query ) {
		$validation = false;
		switch ( $rule ) {
			case self::QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR:
				$validation = ( preg_match( '/^[1-4]{0,1}\p{Lu}\p{Ll}*/u', $query ) || preg_match( '/^[1-4]{0,1}(\p{L}\p{M}*)+/u', $query ) );
				break;
			case self::VALID_CHAPTER_MUST_FOLLOW_BOOK:
				if ( self::string_with_upper_and_lower_case_variants( $query ) ) {
					$validation = ( preg_match( '/^[1-3]{0,1}\p{Lu}\p{Ll}*/u', $query ) == preg_match( '/^[1-3]{0,1}\p{Lu}\p{Ll}*[1-9][0-9]{0,2}/u', $query ) );
				} else {
					$validation = ( preg_match( '/^[1-3]{0,1}( \p{L}\p{M}* )+/u', $query ) == preg_match( '/^[1-3]{0,1}(\p{L}\p{M}*)+[1-9][0-9]{0,2}/u', $query ) );
				}
				break;
			/*
			case self::IS_VALID_BOOK_INDICATOR :
				$validation = (1===1);
				break;*/
			case self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_CHAPTER_VERSE_SEPARATOR:
				$validation = ! ( ! strpos( $query, ',' ) || strpos( $query, ',' ) > strpos( $query, '.' ) );
				break;
			case self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS:
				$validation = ( preg_match_all( '/(?<![0-9])(?=([1-9][0-9]{0,2}\.[1-9][0-9]{0,2}))/', $query ) === substr_count( $query, '.' ) );
				break;
			case self::CHAPTER_VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS:
				$validation = ( preg_match_all( '/[1-9][0-9]{0,2}\,[1-9][0-9]{0,2}/', $query ) === substr_count( $query, ',' ) );
				break;
			case self::VERSE_RANGE_MUST_CONTAIN_VALID_VERSE_NUMBERS:
				$validation = ( preg_match_all( '/[1-9][0-9]{0,2}\-[1-9][0-9]{0,2}/', $query ) === substr_count( $query, '-' ) );
				break;
			case self::CORRESPONDING_CHAPTER_VERSE_CONSTRUCTS_IN_VERSE_RANGE_OVER_CHAPTERS:
				$validation = ! ( preg_match( '/\-[1-9][0-9]{0,2}\,/', $query ) && ( ! preg_match( '/\,[1-9][0-9]{0,2}\-/', $query ) || preg_match_all( '/(?=\,[1-9][0-9]{0,2}\-)/', $query ) > preg_match_all( '/(?=\-[1-9][0-9]{0,2}\,)/', $query ) ) );
				break;
			case self::CORRESPONDING_VERSE_SEPARATORS_FOR_MULTIPLE_VERSE_RANGES:
				$validation = ! ( substr_count( $query, '-' ) > 1 && ( ! strpos( $query, '.' ) || ( substr_count( $query, '-' ) - 1 > substr_count( $query, '.' ) ) ) );
				break;
		}
		return $validation;
	}

	private static function query_contains_non_consecutive_verses( $query ) {
		return strpos( $query, '.' ) !== false;
	}

	private static function force_array( $element ) {
		if ( ! is_array( $element ) ) {
			$element = array( $element );
		}
		return $element;
	}

	private static function get_all_verses_after_discontinuous_verse_indicator( $query ) {
		if ( preg_match_all( '/\.([1-9][0-9]{0,2})$/', $query, $discontinuousVerses ) ) {
			$discontinuousVerses[1] = self::force_array( $discontinuousVerses[1] );
			return $discontinuousVerses;
		} else {
			return array( array(), array() );
		}
	}

	private static function get_verse_after_chapter_verse_separator( $query ) {
		if ( preg_match( '/,([1-9][0-9]{0,2})/', $query, $verse ) ) {
			return $verse;
		} else {
			return array( array(), array() );
		}
	}

	private static function chunk_contains_chapter_verse_construct( $chunk ) {
		return strpos( $chunk, ',' ) !== false;
	}

	private static function get_all_chapter_indicators( $query ) {
		if ( preg_match_all( '/([1-9][0-9]{0,2})\,/', $query, $chapterIndicators ) ) {
			$chapterIndicators[1] = self::force_array( $chapterIndicators[1] );
			return $chapterIndicators;
		} else {
			return array( '', array() );
		}
	}

	private function validate_and_set_book( $matchedBook ) {
		if ( $matchedBook !== false ) {
			$this->current_book = $matchedBook[0];
			if ( $this->validate_bible_book() === false ) {
				return false;
			} else {
				$this->current_query = str_replace( $this->current_book, '', $this->current_query );
				return true;
			}
		} else {
			return true;
		}
	}

	private function validate_chapter_verse_constructs() {
		$chapterVerseConstructCount = substr_count( $this->current_query, ',' );
		if ( $chapterVerseConstructCount > 1 ) {
			return $this->validate_multiple_verse_separators();
		} elseif ( $chapterVerseConstructCount == 1 ) {
			$parts = explode( ',', $this->current_query );
			if ( strpos( $parts[1], '-' ) ) {
				if ( $this->validate_right_hand_side_of_verse_separator( $parts ) === false ) {
					return false;
				}
			} elseif ( $this->validate_verses_after_chapter_verse_separator( $parts ) === false ) {
					return false;
			}

			$discontinuousVerses = self::get_all_verses_after_discontinuous_verse_indicator( $this->current_query );
			$highverse           = array_pop( $discontinuousVerses[1] );
			if ( $this->high_verse_out_of_bounds( $highverse, $parts ) ) {
				return false;
			}
		}
		return true;
	}

	private function query_violates_any_rule_of( $query, $rules ) {
		foreach ( $rules as $rule ) {
			if ( self::validate_rule_against_query( $rule, $query ) === false ) {
				if ( $rule === self::QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR ) {
					$this->errs = 'BIBLEGET PLUGIN ERROR: ' .
						sprintf(
							$this->error_messages[ $rule ],
							$query,
							implode( ';', $this->initial_queries )
						) .
						" ({$this->current_page_url})";
				} else {
					$this->errs[] = 'BIBLEGET PLUGIN ERROR: ' . $this->error_messages[ $rule ];
				}
				return true;
			}
		}
		return false;
	}

	private function is_valid_book_variant( $variant ) {
		return (
			in_array( $this->current_book, $this->indexes[ $variant ]['biblebooks'] )
			||
			in_array( $this->current_book, $this->indexes[ $variant ]['abbreviations'] )
		);
	}

	private function validate_bible_book() {
		$bookIsValid = false;
		foreach ( $this->versions_requested as $variant ) {
			if ( $this->is_valid_book_variant( $variant ) ) {
				$bookIsValid           = true;
				$this->current_variant = $variant;
				$this->book_idx_base   = self::idx_of( $this->current_book, $this->biblebooks );
				break;
			}
		}
		if ( ! $bookIsValid ) {
			$this->book_idx_base = self::idx_of( $this->current_book, $this->biblebooks );
			if ( $this->book_idx_base !== false ) {
				$bookIsValid = true;
			} else {
				$this->errs[] = sprintf( 'The book %s is not a valid Bible book. Please check the documentation for a list of correct Bible book names, whether full or abbreviated.', $this->current_book );
			}
		}
		$this->non_zero_book_idx = $this->book_idx_base + 1;
		return $bookIsValid;
	}

	private function validate_chapter_indicators( $chapterIndicators ) {

		foreach ( $chapterIndicators[1] as $chapterIndicator ) {
			foreach ( $this->indexes as $jkey => $jindex ) {
				$bookidx       = array_search( $this->non_zero_book_idx, $jindex['book_num'] );
				$chapter_limit = $jindex['chapter_limit'][ $bookidx ];
				if ( $chapterIndicator > $chapter_limit ) {
					/* translators: the expressions <%1$d>, <%2$s>, <%3$s>, and <%4$d> must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
					$msg          = 'A chapter in the query is out of bounds: there is no chapter <%1$d> in the book %2$s in the requested version %3$s, the last possible chapter is <%4$d>';
					$this->errs[] = sprintf( $msg, $chapterIndicator, $this->current_book, $jkey, $chapter_limit );
					return false;
				}
			}
		}

		return true;
	}

	private function validate_multiple_verse_separators() {
		if ( ! strpos( $this->current_query, '-' ) ) {
			$this->errs[] = 'You cannot have more than one comma and not have a dash!';
			return false;
		}
		$parts = explode( '-', $this->current_query );
		if ( count( $parts ) != 2 ) {
			$this->errs[] = 'You seem to have a malformed querystring, there should be only one dash.';
			return false;
		}
		foreach ( $parts as $part ) {
			$pp = array_map( 'intval', explode( ',', $part ) );
			foreach ( $this->indexes as $jkey => $jindex ) {
				$bookidx             = array_search( $this->non_zero_book_idx, $jindex['book_num'] );
				$chapters_verselimit = $jindex['verse_limit'][ $bookidx ];
				$verselimit          = intval( $chapters_verselimit[ $pp[0] - 1 ] );
				if ( $pp[1] > $verselimit ) {
					$msg          = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
					$this->errs[] = sprintf( $msg, $pp[1], $this->current_book, $pp[0], $jkey, $verselimit );
					return false;
				}
			}
		}
		return true;
	}

	private function validate_right_hand_side_of_verse_separator( $parts ) {
		if ( preg_match_all( '/[,\.][1-9][0-9]{0,2}\-([1-9][0-9]{0,2})/', $this->current_query, $matches ) ) {
			$matches[1] = self::force_array( $matches[1] );
			$highverse  = intval( array_pop( $matches[1] ) );

			foreach ( $this->indexes as $jkey => $jindex ) {
				$bookidx             = array_search( $this->non_zero_book_idx, $jindex['book_num'] );
				$chapters_verselimit = $jindex['verse_limit'][ $bookidx ];
				$verselimit          = intval( $chapters_verselimit[ intval( $parts[0] ) - 1 ] );

				if ( $highverse > $verselimit ) {
					/* translators: the expressions <%1$d>, <%2$s>, <%3$d>, <%4$s> and %5$d must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
					$msg          = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
					$this->errs[] = sprintf( $msg, $highverse, $this->current_book, $parts[0], $jkey, $verselimit );
					return false;
				}
			}
		}
		return true;
	}

	private function validate_verses_after_chapter_verse_separator( $parts ) {
		$versesAfterChapterVerseSeparators = self::get_verse_after_chapter_verse_separator( $this->current_query );

		$highverse = intval( $versesAfterChapterVerseSeparators[1] );
		foreach ( $this->indexes as $jkey => $jindex ) {
			$bookidx             = array_search( $this->non_zero_book_idx, $jindex['book_num'] );
			$chapters_verselimit = $jindex['verse_limit'][ $bookidx ];
			$verselimit          = intval( $chapters_verselimit[ intval( $parts[0] ) - 1 ] );
			if ( $highverse > $verselimit ) {
				/* translators: the expressions <%1$d>, <%2$s>, <%3$d>, <%4$s> and %5$d must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
				$msg          = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
				$this->errs[] = sprintf( $msg, $highverse, $this->current_book, $parts[0], $jkey, $verselimit );
				return false;
			}
		}
		return true;
	}

	private function high_verse_out_of_bounds( $highverse, $parts ) {
		foreach ( $this->indexes as $jkey => $jindex ) {
			$bookidx             = array_search( $this->non_zero_book_idx, $jindex['book_num'] );
			$chapters_verselimit = $jindex['verse_limit'][ $bookidx ];
			$verselimit          = intval( $chapters_verselimit[ intval( $parts[0] ) - 1 ] );
			if ( $highverse > $verselimit ) {
				/* translators: the expressions <%1$d>, <%2$s>, <%3$d>, <%4$s> and %5$d must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
				$msg          = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
				$this->errs[] = sprintf( $msg, $highverse, $this->current_book, $parts[0], $jkey, $verselimit );
				return true;
			}
		}
		return false;
	}

	private function chapter_out_of_bounds( $chapters ) {
		foreach ( $chapters as $zchapter ) {
			foreach ( $this->indexes as $jkey => $jindex ) {

				$bookidx       = array_search( $this->non_zero_book_idx, $jindex['book_num'] );
				$chapter_limit = $jindex['chapter_limit'][ $bookidx ];
				if ( intval( $zchapter ) > $chapter_limit ) {
					$msg          = 'A chapter in the query is out of bounds: there is no chapter <%1$d> in the book %2$s in the requested version %3$s, the last possible chapter is <%4$d>';
					$this->errs[] = sprintf( $msg, $zchapter, $this->current_book, $jkey, $chapter_limit );
					return true;
				}
			}
		}
		return false;
	}

	public function validate_queries() {
		// at least the first query must start with a book reference, which may have a number from 1 to 3 at the beginning
		// echo "matching against: ".$queries[0]."<br />";
		if ( $this->query_violates_any_rule_of( $this->initial_queries[0], array( self::QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR ) ) ) {
			return false;
		}

		foreach ( $this->initial_queries as $query ) {
			$this->current_full_query = $query;
			$this->current_query     = $query;

			if ( $this->query_violates_any_rule_of( $this->current_query, array( self::VALID_CHAPTER_MUST_FOLLOW_BOOK ) ) ) {
				return false;
			}

			$matchedBook = self::match_book_in_query( $this->current_query );
			if ( $this->validate_and_set_book( $matchedBook ) === false ) {
				continue;
			}

			if ( self::query_contains_non_consecutive_verses( $this->current_query ) ) {
				$rules = array(
					self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_CHAPTER_VERSE_SEPARATOR,
					self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS,
				);
				if ( $this->query_violates_any_rule_of( $this->current_query, $rules ) ) {
					continue;
				}
			}

			if ( self::chunk_contains_chapter_verse_construct( $this->current_query ) ) {
				if ( $this->query_violates_any_rule_of( $this->current_query, array( self::CHAPTER_VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS ) ) ) {
					continue;
				} else {
					$chapterIndicators = self::get_all_chapter_indicators( $this->current_query );
					if ( $this->validate_chapter_indicators( $chapterIndicators ) === false ) {
						continue;
					}

					if ( $this->validate_chapter_verse_constructs() === false ) {
						continue;
					}
				}
			} else {
				$chapters = explode( '-', $this->current_query );
				if ( $this->chapter_out_of_bounds( $chapters ) ) {
					continue;
				}
			}

			if ( strpos( $this->current_query, '-' ) ) {
				$rules = array(
					self::VERSE_RANGE_MUST_CONTAIN_VALID_VERSE_NUMBERS,
					self::CORRESPONDING_CHAPTER_VERSE_CONSTRUCTS_IN_VERSE_RANGE_OVER_CHAPTERS,
					self::CORRESPONDING_VERSE_SEPARATORS_FOR_MULTIPLE_VERSE_RANGES,
				);
				if ( $this->query_violates_any_rule_of( $this->current_query, $rules ) ) {
					continue;
				}
			}
			$this->validated_variants[] = $this->current_variant;
			$this->validated_queries[]  = $this->current_full_query;

		} //END FOREACH
		return true;
	}
}
