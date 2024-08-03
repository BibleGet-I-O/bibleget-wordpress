<?php

namespace BibleGet\Enums;

class BGET {

	const ALIGN  = array(
		'LEFT'    => 1,
		'CENTER'  => 2,
		'RIGHT'   => 3,
		'JUSTIFY' => 4,
	),
	VALIGN       = array(
		'SUPERSCRIPT' => 1,
		'SUBSCRIPT'   => 2,
		'NORMAL'      => 3,
	),
	WRAP         = array(
		'NONE'        => 1,
		'PARENTHESES' => 2,
		'BRACKETS'    => 3,
	),
	POS          = array(
		'TOP'          => 1,
		'BOTTOM'       => 2,
		'BOTTOMINLINE' => 3,
	),
	FORMAT       = array(
		'USERLANG'        => 1, // if Google Docs is used in chinese, the names of the books of the bible will be given in chinese.
		'BIBLELANG'       => 2, // if Google Docs is used in chinese, the abbreviated names of the books of the bible in chinese will be given.
		'USERLANGABBREV'  => 3, // if you are quoting from a Latin Bible, the names of the books of the bible will be given in latin.
		'BIBLELANGABBREV' => 4,  // if you are quoting from a Latin Bible, the abbreviated names of the books of the bible in latin will be given.
	),
	VISIBILITY   = array(
		'SHOW' => true,
		'HIDE' => false,
	),
	TEXTSTYLE    = array(
		'BOLD'          => 1,
		'ITALIC'        => 2,
		'UNDERLINE'     => 3,
		'STRIKETHROUGH' => 4,
	),
	BORDERSTYLE  = array(
		'NONE'   => 0,
		'DOTTED' => 1,
		'DASHED' => 2,
		'SOLID'  => 3,
		'DOUBLE' => 4,
		'GROOVE' => 5,
		'RIDGE'  => 6,
		'INSET'  => 7,
		'OUTSET' => 8,
	),
	PREFERORIGIN = array(
		'GREEK'  => 0,
		'HEBREW' => 1,
	),
	CSSRULE      = array(
		'ALIGN'       => array( '', 'left', 'center', 'right', 'justify' ), // add empty initial value since our enum is 1 based, not 0 based
		'TEXTSTYLE'   => array( '', 'bold', 'italic', 'underline', 'line-through' ), // add empty initial value since our enum is 1 based, not 0 based
		'BORDERSTYLE' => array( 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ), // this enum is 0 based
	);
}
