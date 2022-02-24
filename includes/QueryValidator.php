<?php
/**
 * QUERY_VALIDATOR class
 * 
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
 * Copyright John Romano D'Orazio 2014-2021
 * Licensed under Apache License 2.0
 */

class QueryValidator {

    const QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR                            = 0;
    const VALID_CHAPTER_MUST_FOLLOW_BOOK                                        = 1;
    const IS_VALID_BOOK_INDICATOR                                               = 2;
    const VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_CHAPTER_VERSE_SEPARATOR           = 3;
    const VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS                     = 4;
    const CHAPTER_VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS             = 5;
    const VERSE_RANGE_MUST_CONTAIN_VALID_VERSE_NUMBERS                          = 6;
    const CORRESPONDING_CHAPTER_VERSE_CONSTRUCTS_IN_VERSE_RANGE_OVER_CHAPTERS   = 7;
    const CORRESPONDING_VERSE_SEPARATORS_FOR_MULTIPLE_VERSE_RANGES              = 8;
    const NON_CONSECUTIVE_VERSES_NOT_ASCENDING_ORDER                            = 9;
    const MUST_AT_LEAST_START_WITH_VALID_CHAPTER                                = 10;

    private $bookIdxBase                = -1;
    private $nonZeroBookIdx             = -1;
    private $currentVariant             = "";
    private $currentBook                = "";
    private $currentQuery               = "";
    private $currentFullQuery           = "";
    private $currentPageUrl             = "";
    private $errorMessages              = [];
    private $initialQueries             = [];
    private $versionsRequested          = [];
    private $indexes                    = [];
    private $biblebooks                 = [];
    public $validatedQueries            = [];
    public $validatedVariants           = [];
    public $errs                        = [];


    function __construct( $queries, $versions, $currentPageUrl ) {
        $this->initialQueries = $queries;
        $this->versionsRequested = $versions;
        $this->errorMessages = [
            __('The first query <%1$s> in the querystring <%2$s> must start with a valid book indicator!', "bibleget-io"),
            __("You must have a valid chapter following the book indicator!", "bibleget-io"),
            __("The book indicator is not valid. Please check the documentation for a list of valid book indicators.", "bibleget-io"),
            __("You cannot request discontinuous verses without first indicating a chapter for the discontinuous verses.", "bibleget-io"),
            __("A request for discontinuous verses must contain two valid verse numbers on either side of a discontinuous verse indicator.", "bibleget-io"),
            __("A chapter-verse separator must be preceded by a valid chapter number and followed by a valid verse number.", "bibleget-io"),
            __("A request for a range of verses must contain two valid verse numbers on either side of a verse range indicator.", "bibleget-io"),
            __("If there is a chapter-verse construct following a dash, there must also be a chapter-verse construct preceding the same dash.", "bibleget-io"),
            __("Multiple verse ranges have been requested, but there are not enough non-consecutive verse indicators. Multiple verse ranges assume there are non-consecutive verse indicators that connect them.", "bibleget-io"),
            /* translators: the expressions %1$d, %2$d, and %3$s must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
            __('Non consecutive verses must be in ascending order, instead %1$d >= %2$d in the expression <%3$s>', "bibleget-io"),
            __("A query that doesn't start with a book indicator must however start with a valid chapter indicator!", "bibleget-io")
        ];

        foreach ($versions as $version) {
            $temp = get_option("bibleget_" . $version . "IDX");
            if (is_object($temp)) {
                $this->indexes[$version] = json_decode(json_encode($temp), true);
            }
            else if (is_array($temp)) {
                $this->indexes[$version] = $temp;
            }
        }

        for ($i = 0; $i < 73; $i++) {
            $usrprop = "bibleget_biblebooks" . $i;
            $jsbook = json_decode(get_option($usrprop), true);
            $this->biblebooks[$i] = $jsbook;
        }

        $this->currentPageUrl = $currentPageUrl;
    }

    private static function stringWithUpperAndLowerCaseVariants( $str ) {
        return preg_match( "/\p{L&}/u", $str );
    }

    private static function idxOf($needle, $haystack) {
        foreach ($haystack as $index => $value) {
            if (is_array($value)) {
                foreach ($value as $value2) {
                    if (in_array($needle, $value2)) {
                        return $index;
                    }
                }
            } else if (in_array($needle, $value)) {
                return $index;
            }
        }
        return false;
    }
    

    private static function matchBookInQuery( $query ) {
        if( self::stringWithUpperAndLowerCaseVariants( $query ) ){
            if( preg_match( "/^([1-4]{0,1}((\p{Lu}\p{Ll}*)+))/u", $query, $res ) ){
                return $res;
            } else {
                return false;
            }
        } else {
            if( preg_match( "/^([1-4]{0,1}((\p{L}\p{M}*)+))/u", $query, $res ) ){
                return $res;
            } else {
                return false;
            }
        }
    }

    private static function validateRuleAgainstQuery( $rule, $query ) {
        $validation = false;
        switch( $rule ){
            case self::QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR :
                $validation = (preg_match( "/^[1-4]{0,1}\p{Lu}\p{Ll}*/u", $query ) || preg_match( "/^[1-4]{0,1}(\p{L}\p{M}*)+/u", $query ));
                break;
            case self::VALID_CHAPTER_MUST_FOLLOW_BOOK :
                if(self::stringWithUpperAndLowerCaseVariants( $query ) ){
                    $validation = ( preg_match( "/^[1-3]{0,1}\p{Lu}\p{Ll}*/u", $query ) == preg_match( "/^[1-3]{0,1}\p{Lu}\p{Ll}*[1-9][0-9]{0,2}/u", $query ) );
                } else {
                    $validation = ( preg_match( "/^[1-3]{0,1}( \p{L}\p{M}* )+/u", $query ) == preg_match( "/^[1-3]{0,1}(\p{L}\p{M}*)+[1-9][0-9]{0,2}/u", $query ) );
                }
                break;
            /*case self::IS_VALID_BOOK_INDICATOR :
                $validation = (1===1);
                break;*/
            case self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_CHAPTER_VERSE_SEPARATOR :
                $validation = !( !strpos( $query, "," ) || strpos( $query, "," ) > strpos( $query, "." ) );
                break;
            case self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS :
                $validation = ( preg_match_all( "/(?<![0-9])(?=([1-9][0-9]{0,2}\.[1-9][0-9]{0,2}))/", $query ) === substr_count( $query, "." ) );
                break;
            case self::CHAPTER_VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS :
                $validation = ( preg_match_all( "/[1-9][0-9]{0,2}\,[1-9][0-9]{0,2}/", $query ) === substr_count( $query, "," ) );
                break;
            case self::VERSE_RANGE_MUST_CONTAIN_VALID_VERSE_NUMBERS :
                $validation = ( preg_match_all( "/[1-9][0-9]{0,2}\-[1-9][0-9]{0,2}/", $query ) === substr_count( $query, "-" ) );
                break;
            case self::CORRESPONDING_CHAPTER_VERSE_CONSTRUCTS_IN_VERSE_RANGE_OVER_CHAPTERS :
                $validation = !( preg_match( "/\-[1-9][0-9]{0,2}\,/", $query ) && ( !preg_match( "/\,[1-9][0-9]{0,2}\-/", $query ) || preg_match_all( "/(?=\,[1-9][0-9]{0,2}\-)/", $query ) > preg_match_all( "/(?=\-[1-9][0-9]{0,2}\,)/", $query ) ) );
                break;
            case self::CORRESPONDING_VERSE_SEPARATORS_FOR_MULTIPLE_VERSE_RANGES :
                $validation = !( substr_count( $query, "-" ) > 1 && ( !strpos( $query, "." ) || ( substr_count( $query, "-" ) - 1 > substr_count( $query, "." ) ) ) );
                break;
        }
        return $validation;
    }

    private static function queryContainsNonConsecutiveVerses( $query ) {
        return strpos( $query, "." ) !== false;
    }

    private static function forceArray( $element ) {
        if ( !is_array( $element ) ) {
            $element = [ $element ];
        }
        return $element;
    }

    private static function getAllVersesAfterDiscontinuousVerseIndicator( $query ) {
        if( preg_match_all( "/\.([1-9][0-9]{0,2})$/", $query, $discontinuousVerses ) ){
            $discontinuousVerses[1] = self::forceArray( $discontinuousVerses[1] );
            return $discontinuousVerses;
        } else {
            return [[],[]];
        }
    }

    private static function getVerseAfterChapterVerseSeparator( $query ) {
        if( preg_match( "/,([1-9][0-9]{0,2})/", $query, $verse ) ){
            return $verse;
        } else {
            return [[],[]];
        }
    }

    private static function chunkContainsChapterVerseConstruct( $chunk ) {
        return strpos( $chunk, "," ) !== false;
    }

    private static function getAllChapterIndicators( $query ) {
        if( preg_match_all( "/([1-9][0-9]{0,2})\,/", $query, $chapterIndicators ) ){
            $chapterIndicators[1] = self::forceArray( $chapterIndicators[1] );
            return $chapterIndicators;
        } else {
            return ["",[]];
        }
    }

    private function validateAndSetBook( $matchedBook ) {
        if ( $matchedBook !== false ) {
            $this->currentBook = $matchedBook[0];
            if ( $this->validateBibleBook() === false ) {
                return false;
            } else {
                $this->currentQuery = str_replace( $this->currentBook, "", $this->currentQuery );
                return true;
            }
        } else {
            return true;
        }
    }

    private function validateChapterVerseConstructs() {
        $chapterVerseConstructCount = substr_count( $this->currentQuery, "," );
        if ( $chapterVerseConstructCount > 1 ) {
            return $this->validateMultipleVerseSeparators();
        } elseif ( $chapterVerseConstructCount == 1 ) {
            $parts = explode( ",", $this->currentQuery );
            if ( strpos( $parts[1], '-' ) ) {
                if( $this->validateRightHandSideOfVerseSeparator( $parts ) === false ) {
                    return false;
                }
            } else {
                if( $this->validateVersesAfterChapterVerseSeparators( $parts ) === false ){
                    return false;
                }
            }

            $discontinuousVerses = self::getAllVersesAfterDiscontinuousVerseIndicator( $this->currentQuery );
            $highverse = array_pop( $discontinuousVerses[1] );
            if( $this->highVerseOutOfBounds( $highverse, $parts ) ) {
                return false;
            }
        }
        return true;
    }

    private function queryViolatesAnyRuleOf( $query, $rules ) {
        foreach( $rules as $rule ) {
            if( self::validateRuleAgainstQuery( $rule, $query ) === false ) {
                if( $rule === self::QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR ) {
                    $this->errs = "BIBLEGET PLUGIN ERROR: " .
                        sprintf(
                            $this->errorMessages[ $rule ],
                            $query,
                            implode(";", $this->initialQueries)
                        ) .
                        " ({$this->currentPageUrl})";
                } else {
                    $this->errs[] =  "BIBLEGET PLUGIN ERROR: " . $this->errorMessages[ $rule ];
                }
                return true;
            }
        }
        return false;
    }

    private function isValidBookForVariant( $variant ) {
        return ( in_array( $this->currentBook, $this->indexes[$variant]["biblebooks"] ) || in_array( $this->currentBook, $this->indexes[$variant]["abbreviations"] ) );
    }

    private function validateBibleBook() {
        $bookIsValid = false;
        foreach ( $this->versionsRequested as $variant ) {
            if ( $this->isValidBookForVariant( $variant ) ) {
                $bookIsValid = true;
                $this->currentVariant = $variant;
                $this->bookIdxBase = self::idxOf( $this->currentBook, $this->biblebooks );
                break;
            }
        }
        if( !$bookIsValid ) {
            $this->bookIdxBase = self::idxOf( $this->currentBook, $this->biblebooks );
            if( $this->bookIdxBase !== false){
                $bookIsValid = true;
            } else {
                $this->errs[] = sprintf( 'The book %s is not a valid Bible book. Please check the documentation for a list of correct Bible book names, whether full or abbreviated.', $this->currentBook );
            }
        }
        $this->nonZeroBookIdx = $this->bookIdxBase + 1;
        return $bookIsValid;
    }

    private function validateChapterIndicators( $chapterIndicators ) {

        foreach ( $chapterIndicators[1] as $chapterIndicator ) {
            foreach ( $this->indexes as $jkey => $jindex ) {
                $bookidx = array_search( $this->nonZeroBookIdx, $jindex["book_num"] );
                $chapter_limit = $jindex["chapter_limit"][$bookidx];
                if ( $chapterIndicator > $chapter_limit ) {
                    /* translators: the expressions <%1$d>, <%2$s>, <%3$s>, and <%4$d> must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
                    $msg = 'A chapter in the query is out of bounds: there is no chapter <%1$d> in the book %2$s in the requested version %3$s, the last possible chapter is <%4$d>';
                    $this->errs[] = sprintf( $msg, $chapterIndicator, $this->currentBook, $jkey, $chapter_limit );
                    return false;
                }
            }
        }

        return true;

    }

    private function validateMultipleVerseSeparators() {
        if ( !strpos( $this->currentQuery, '-' ) ) {
            $this->errs[] = "You cannot have more than one comma and not have a dash!";
            return false;
        }
        $parts = explode( "-", $this->currentQuery );
        if ( count( $parts ) != 2 ) {
            $this->errs[] = "You seem to have a malformed querystring, there should be only one dash.";
            return false;
        }
        foreach ( $parts as $part ) {
            $pp = array_map( "intval", explode( ",", $part ) );
            foreach ( $this->indexes as $jkey => $jindex ) {
                $bookidx = array_search( $this->nonZeroBookIdx, $jindex["book_num"] );
                $chapters_verselimit = $jindex["verse_limit"][$bookidx];
                $verselimit = intval( $chapters_verselimit[$pp[0] - 1] );
                if ( $pp[1] > $verselimit ) {
                    $msg = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
                    $this->errs[] = sprintf( $msg, $pp[1], $this->currentBook, $pp[0], $jkey, $verselimit );
                    return false;
                }
            }
        }
        return true;
    }

    private function validateRightHandSideOfVerseSeparator( $parts ) {
        if ( preg_match_all( "/[,\.][1-9][0-9]{0,2}\-([1-9][0-9]{0,2})/", $this->currentQuery, $matches ) ) {
            $matches[1] = self::forceArray( $matches[1] );
            $highverse = intval( array_pop( $matches[1] ) );

            foreach ( $this->indexes as $jkey => $jindex ) {
                $bookidx = array_search( $this->nonZeroBookIdx, $jindex["book_num"] );
                $chapters_verselimit = $jindex["verse_limit"][$bookidx];
                $verselimit = intval( $chapters_verselimit[intval( $parts[0] ) - 1] );

                if ( $highverse > $verselimit ) {
                    /* translators: the expressions <%1$d>, <%2$s>, <%3$d>, <%4$s> and %5$d must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
                    $msg = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
                    $this->errs[] = sprintf( $msg, $highverse, $this->currentBook, $parts[0], $jkey, $verselimit );
                    return false;
                }
            }
        }
        return true;
    }

    private function validateVersesAfterChapterVerseSeparators( $parts ) {
        $versesAfterChapterVerseSeparators = self::getVerseAfterChapterVerseSeparator( $this->currentQuery );

        $highverse = intval( $versesAfterChapterVerseSeparators[1] );
        foreach ( $this->indexes as $jkey => $jindex ) {
            $bookidx = array_search( $this->nonZeroBookIdx, $jindex["book_num"] );
            $chapters_verselimit = $jindex["verse_limit"][$bookidx];
            $verselimit = intval( $chapters_verselimit[intval( $parts[0] ) - 1] );
            if ( $highverse > $verselimit ) {
                /* translators: the expressions <%1$d>, <%2$s>, <%3$d>, <%4$s> and %5$d must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
                $msg = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
                $this->errs[] = sprintf( $msg, $highverse, $this->currentBook, $parts[0], $jkey, $verselimit );
                return false;
            }
        }
        return true;
    }

    private function highVerseOutOfBounds( $highverse, $parts ) {
        foreach ( $this->indexes as $jkey => $jindex ) {
            $bookidx = array_search( $this->nonZeroBookIdx, $jindex["book_num"] );
            $chapters_verselimit = $jindex["verse_limit"][$bookidx];
            $verselimit = intval( $chapters_verselimit[intval( $parts[0] ) - 1] );
            if ( $highverse > $verselimit ) {
                /* translators: the expressions <%1$d>, <%2$s>, <%3$d>, <%4$s> and %5$d must be left as is, they will be substituted dynamically by values in the script. See http://php.net/sprintf. */
                $msg = 'A verse in the query is out of bounds: there is no verse <%1$d> in the book %2$s at chapter <%3$d> in the requested version %4$s, the last possible verse is <%5$d>';
                $this->errs[] = sprintf( $msg, $highverse, $this->currentBook, $parts[0], $jkey, $verselimit );
                return true;
            }
        }
        return false;
    }

    private function chapterOutOfBounds( $chapters ) {
        foreach ( $chapters as $zchapter ) {
            foreach ( $this->indexes as $jkey => $jindex ) {
                
                $bookidx = array_search( $this->nonZeroBookIdx, $jindex["book_num"] );
                $chapter_limit = $jindex["chapter_limit"][$bookidx];
                if ( intval( $zchapter ) > $chapter_limit ) {
                    $msg = 'A chapter in the query is out of bounds: there is no chapter <%1$d> in the book %2$s in the requested version %3$s, the last possible chapter is <%4$d>';
                    $this->errs[] = sprintf( $msg, $zchapter, $this->currentBook, $jkey, $chapter_limit );
                    return true;
                }
            }
        }
        return false;
    }

    public function ValidateQueries() {
        //at least the first query must start with a book reference, which may have a number from 1 to 3 at the beginning
        //echo "matching against: ".$queries[0]."<br />";
        if ( $this->queryViolatesAnyRuleOf( $this->initialQueries[0], [ self::QUERY_MUST_START_WITH_VALID_BOOK_INDICATOR ] ) ) {
            return false;
        }

        foreach ( $this->initialQueries as $query ) {
            $this->currentFullQuery = $query;
            $this->currentQuery = $query;

            if( $this->queryViolatesAnyRuleOf( $this->currentQuery, [ self::VALID_CHAPTER_MUST_FOLLOW_BOOK ] ) ){
                return false;
            }

            $matchedBook = self::matchBookInQuery( $this->currentQuery );
            if ( $this->validateAndSetBook( $matchedBook ) === false ) {
                continue;
            }

            if ( self::queryContainsNonConsecutiveVerses( $this->currentQuery ) ) {
                $rules = [ 
                    self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_CHAPTER_VERSE_SEPARATOR,
                    self::VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS
                ];
                if ( $this->queryViolatesAnyRuleOf( $this->currentQuery, $rules ) ) {
                    continue;
                }
            }

            if ( self::chunkContainsChapterVerseConstruct( $this->currentQuery ) ) {
                if ( $this->queryViolatesAnyRuleOf( $this->currentQuery, [ self::CHAPTER_VERSE_SEPARATOR_MUST_BE_PRECEDED_BY_1_TO_3_DIGITS ] ) ) {
                    continue;
                } else {
                    $chapterIndicators = self::getAllChapterIndicators( $this->currentQuery );
                    if( $this->validateChapterIndicators( $chapterIndicators ) === false ){
                        continue;
                    }

                    if( $this->validateChapterVerseConstructs() === false ){
                        continue;
                    }

                }
            } else {
                $chapters = explode( "-", $this->currentQuery );
                if( $this->chapterOutOfBounds( $chapters ) ){
                    continue;
                }
            }

            if ( strpos( $this->currentQuery, "-" ) ) {
                $rules = [
                    self::VERSE_RANGE_MUST_CONTAIN_VALID_VERSE_NUMBERS,
                    self::CORRESPONDING_CHAPTER_VERSE_CONSTRUCTS_IN_VERSE_RANGE_OVER_CHAPTERS,
                    self::CORRESPONDING_VERSE_SEPARATORS_FOR_MULTIPLE_VERSE_RANGES
                ];
                if ( $this->queryViolatesAnyRuleOf( $this->currentQuery, $rules ) ) {
                    continue;
                }
            }
            $this->validatedVariants[] = $this->currentVariant;
            $this->validatedQueries[]  = $this->currentFullQuery;

        } //END FOREACH
        return true;
    }
}
