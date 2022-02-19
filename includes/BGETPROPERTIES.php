<?php

class BGETPROPERTIES {
    public $OPTIONS;
    public $BGETOPTIONS;

    public function __construct() {
        $this->BGETOPTIONS = get_option("BGET", []);
        $this->OPTIONS = [
            "PARAGRAPHSTYLES_FONTFAMILY" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "PARAGRAPHSTYLES_FONTFAMILY") ? $this->BGETOPTIONS["PARAGRAPHSTYLES_FONTFAMILY"] : "Times New Roman",
                "type" => "string"
            ],
            "PARAGRAPHSTYLES_LINEHEIGHT" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_LINEHEIGHT") ? floatval($this->BGETOPTIONS["PARAGRAPHSTYLES_LINEHEIGHT"]) : 1.5,
                "type" => "number"
            ],
            "PARAGRAPHSTYLES_PADDINGTOPBOTTOM" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_PADDINGTOPBOTTOM") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_PADDINGTOPBOTTOM"]) : 12, //unit: px
                "type" => "integer"
            ],
            "PARAGRAPHSTYLES_PADDINGLEFTRIGHT" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_PADDINGLEFTRIGHT") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_PADDINGLEFTRIGHT"]) : 10, //unit: px
                "type" => "integer"
            ],
            "PARAGRAPHSTYLES_MARGINTOPBOTTOM" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_MARGINTOPBOTTOM") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_MARGINTOPBOTTOM"]) : 12, //unit: px
                "type" => "integer"
            ],
            "PARAGRAPHSTYLES_MARGINLEFTRIGHT" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_MARGINLEFTRIGHT") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_MARGINLEFTRIGHT"]) : 12, //unit: user choice of 'px', '%', or 'auto'
                "type" => "integer"
            ],
            "PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT") ? $this->BGETOPTIONS["PARAGRAPHSTYLES_MARGINLEFTRIGHTUNIT"] : 'auto',
                "type" => "string" //possible values 'px', '%', 'auto'
            ],
            "PARAGRAPHSTYLES_PARAGRAPHALIGN" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_PARAGRAPHALIGN") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_PARAGRAPHALIGN"]) : BGET::ALIGN["JUSTIFY"],
                "type" => "integer"   //possible vals 'left','center','right', 'justify' (use ENUM, e.g. BGET::ALIGN->LEFT)
            ],
            "PARAGRAPHSTYLES_WIDTH" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_WIDTH") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_WIDTH"]) : 80,
                "type" => "integer"   //unit: %
            ],
            "PARAGRAPHSTYLES_NOVERSIONFORMATTING" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "PARAGRAPHSTYLES_NOVERSIONFORMATTING") ? $this->BGETOPTIONS["PARAGRAPHSTYLES_NOVERSIONFORMATTING"] : false,
                "type" => "boolean"
            ],
            "PARAGRAPHSTYLES_BORDERWIDTH" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_BORDERWIDTH") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_BORDERWIDTH"]) : 1, //unit: px
                "type" => "integer"
            ],
            "PARAGRAPHSTYLES_BORDERCOLOR" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "PARAGRAPHSTYLES_BORDERCOLOR") ? $this->BGETOPTIONS["PARAGRAPHSTYLES_BORDERCOLOR"] : "#0000FF",
                "type" => "string"
            ],
            "PARAGRAPHSTYLES_BORDERSTYLE" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_BORDERSTYLE") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_BORDERSTYLE"]) : BGET::BORDERSTYLE["SOLID"],
                "type" => "integer"
            ],
            "PARAGRAPHSTYLES_BORDERRADIUS" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PARAGRAPHSTYLES_BORDERRADIUS") ? intval($this->BGETOPTIONS["PARAGRAPHSTYLES_BORDERRADIUS"]) : 12, //unit: px
                "type" => "integer"
            ],
            "PARAGRAPHSTYLES_BACKGROUNDCOLOR" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "PARAGRAPHSTYLES_BACKGROUNDCOLOR") ? $this->BGETOPTIONS["PARAGRAPHSTYLES_BACKGROUNDCOLOR"] : '#efece9',
                "type" => "string"
            ],
            "VERSIONSTYLES_BOLD" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSIONSTYLES_BOLD") ? $this->BGETOPTIONS["VERSIONSTYLES_BOLD"] : true,
                "type" => "boolean"
            ],
            "VERSIONSTYLES_ITALIC" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSIONSTYLES_ITALIC") ? $this->BGETOPTIONS["VERSIONSTYLES_ITALIC"] : false,
                "type" => "boolean"
            ],
            "VERSIONSTYLES_UNDERLINE" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSIONSTYLES_UNDERLINE") ? $this->BGETOPTIONS["VERSIONSTYLES_UNDERLINE"] : false,
                "type" => "boolean"
            ],
            "VERSIONSTYLES_STRIKETHROUGH" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSIONSTYLES_STRIKETHROUGH") ? $this->BGETOPTIONS["VERSIONSTYLES_STRIKETHROUGH"] : false,
                "type" => "boolean"
            ],
            "VERSIONSTYLES_TEXTCOLOR" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "VERSIONSTYLES_TEXTCOLOR") ? $this->BGETOPTIONS["VERSIONSTYLES_TEXTCOLOR"] : "#000044",
                "type" => "string"
            ],
            "VERSIONSTYLES_FONTSIZE" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "VERSIONSTYLES_FONTSIZE") ? intval($this->BGETOPTIONS["VERSIONSTYLES_FONTSIZE"]) : 9,
                "type" => "integer"
            ],
            "VERSIONSTYLES_FONTSIZEUNIT" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "VERSIONSTYLES_FONTSIZEUNIT") ? $this->BGETOPTIONS["VERSIONSTYLES_FONTSIZEUNIT"] : 'em',
                "type" => "string"
            ],
            "VERSIONSTYLES_VALIGN" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "VERSIONSTYLES_VALIGN") ? intval($this->BGETOPTIONS["VERSIONSTYLES_VALIGN"]) : BGET::VALIGN["NORMAL"], //resolves to integer
                "type" => "integer"
            ],
            "BOOKCHAPTERSTYLES_BOLD" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_BOLD") ? $this->BGETOPTIONS["BOOKCHAPTERSTYLES_BOLD"] : true,
                "type" => "boolean"
            ],
            "BOOKCHAPTERSTYLES_ITALIC" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_ITALIC") ? $this->BGETOPTIONS["BOOKCHAPTERSTYLES_ITALIC"] : false,
                "type" => "boolean"
            ],
            "BOOKCHAPTERSTYLES_UNDERLINE" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_UNDERLINE") ? $this->BGETOPTIONS["BOOKCHAPTERSTYLES_UNDERLINE"] : false,
                "type" => "boolean"
            ],
            "BOOKCHAPTERSTYLES_STRIKETHROUGH" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_STRIKETHROUGH") ? $this->BGETOPTIONS["BOOKCHAPTERSTYLES_STRIKETHROUGH"] : false,
                "type" => "boolean"
            ],
            "BOOKCHAPTERSTYLES_TEXTCOLOR" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_TEXTCOLOR") ? $this->BGETOPTIONS["BOOKCHAPTERSTYLES_TEXTCOLOR"] : "#000044",
                "type" => "string"
            ],
            "BOOKCHAPTERSTYLES_FONTSIZE" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_FONTSIZE") ? intval($this->BGETOPTIONS["BOOKCHAPTERSTYLES_FONTSIZE"]) : 10,
                "type" => "integer"
            ],
            "BOOKCHAPTERSTYLES_FONTSIZEUNIT" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_FONTSIZEUNIT") ? $this->BGETOPTIONS["BOOKCHAPTERSTYLES_FONTSIZEUNIT"] : 'em',
                "type" => "string"
            ],
            "BOOKCHAPTERSTYLES_VALIGN" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "BOOKCHAPTERSTYLES_VALIGN") ? intval($this->BGETOPTIONS["BOOKCHAPTERSTYLES_VALIGN"]) : BGET::VALIGN["NORMAL"], //resolves to integer
                "type" => "integer"
            ],
            "VERSENUMBERSTYLES_BOLD" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSENUMBERSTYLES_BOLD") ? $this->BGETOPTIONS["VERSENUMBERSTYLES_BOLD"] : true,
                "type" => "boolean"
            ],
            "VERSENUMBERSTYLES_ITALIC" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSENUMBERSTYLES_ITALIC") ? $this->BGETOPTIONS["VERSENUMBERSTYLES_ITALIC"] : false,
                "type" => "boolean"
            ],
            "VERSENUMBERSTYLES_UNDERLINE" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSENUMBERSTYLES_UNDERLINE") ? $this->BGETOPTIONS["VERSENUMBERSTYLES_UNDERLINE"] : false,
                "type" => "boolean"
            ],
            "VERSENUMBERSTYLES_STRIKETHROUGH" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSENUMBERSTYLES_STRIKETHROUGH") ? $this->BGETOPTIONS["VERSENUMBERSTYLES_STRIKETHROUGH"] : false,
                "type" => "boolean"
            ],
            "VERSENUMBERSTYLES_TEXTCOLOR" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "VERSENUMBERSTYLES_TEXTCOLOR") ? $this->BGETOPTIONS["VERSENUMBERSTYLES_TEXTCOLOR"] : "#AA0000",
                "type" => "string"
            ],
            "VERSENUMBERSTYLES_FONTSIZE" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "VERSENUMBERSTYLES_FONTSIZE") ? intval($this->BGETOPTIONS["VERSENUMBERSTYLES_FONTSIZE"]) : 6,
                "type" => "integer"
            ],
            "VERSENUMBERSTYLES_FONTSIZEUNIT" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "VERSENUMBERSTYLES_FONTSIZEUNIT") ? $this->BGETOPTIONS["VERSENUMBERSTYLES_FONTSIZEUNIT"] : 'em',
                "type" => "string"
            ],
            "VERSENUMBERSTYLES_VALIGN" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "VERSENUMBERSTYLES_VALIGN") ? intval($this->BGETOPTIONS["VERSENUMBERSTYLES_VALIGN"]) : BGET::VALIGN["SUPERSCRIPT"], //resolves to INT
                "type" => "integer"
            ],
            "VERSETEXTSTYLES_BOLD" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSETEXTSTYLES_BOLD") ? $this->BGETOPTIONS["VERSETEXTSTYLES_BOLD"] : false,
                "type" => "boolean"
            ],
            "VERSETEXTSTYLES_ITALIC" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSETEXTSTYLES_ITALIC") ? $this->BGETOPTIONS["VERSETEXTSTYLES_ITALIC"] : false,
                "type" => "boolean"
            ],
            "VERSETEXTSTYLES_UNDERLINE" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSETEXTSTYLES_UNDERLINE") ? $this->BGETOPTIONS["VERSETEXTSTYLES_UNDERLINE"] : false,
                "type" => "boolean"
            ],
            "VERSETEXTSTYLES_STRIKETHROUGH" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "VERSETEXTSTYLES_STRIKETHROUGH") ? $this->BGETOPTIONS["VERSETEXTSTYLES_STRIKETHROUGH"] : false,
                "type" => "boolean"
            ],
            "VERSETEXTSTYLES_TEXTCOLOR" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "VERSETEXTSTYLES_TEXTCOLOR") ? $this->BGETOPTIONS["VERSETEXTSTYLES_TEXTCOLOR"] : "#666666",
                "type" => "string"
            ],
            "VERSETEXTSTYLES_FONTSIZE" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "VERSETEXTSTYLES_FONTSIZE") ? intval($this->BGETOPTIONS["VERSETEXTSTYLES_FONTSIZE"]) : 10,
                "type" => "integer"
            ],
            "VERSETEXTSTYLES_FONTSIZEUNIT" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "VERSETEXTSTYLES_FONTSIZEUNIT") ? $this->BGETOPTIONS["VERSETEXTSTYLES_FONTSIZEUNIT"] : 'em',
                "type" => "string"
            ],
            "VERSETEXTSTYLES_VALIGN" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "VERSETEXTSTYLES_VALIGN") ? intval($this->BGETOPTIONS["VERSETEXTSTYLES_VALIGN"]) : BGET::VALIGN["NORMAL"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_SHOWBIBLEVERSION" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "LAYOUTPREFS_SHOWBIBLEVERSION") ? $this->BGETOPTIONS["LAYOUTPREFS_SHOWBIBLEVERSION"] : BGET::VISIBILITY["SHOW"],
                "type" => "boolean"
            ],
            "LAYOUTPREFS_BIBLEVERSIONALIGNMENT" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "LAYOUTPREFS_BIBLEVERSIONALIGNMENT") ? intval($this->BGETOPTIONS["LAYOUTPREFS_BIBLEVERSIONALIGNMENT"]) : BGET::ALIGN["LEFT"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_BIBLEVERSIONPOSITION" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "LAYOUTPREFS_BIBLEVERSIONPOSITION") ? intval($this->BGETOPTIONS["LAYOUTPREFS_BIBLEVERSIONPOSITION"]) :  BGET::POS["TOP"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_BIBLEVERSIONWRAP" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "LAYOUTPREFS_BIBLEVERSIONWRAP") ? intval($this->BGETOPTIONS["LAYOUTPREFS_BIBLEVERSIONWRAP"]) : BGET::WRAP["NONE"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_BOOKCHAPTERALIGNMENT" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "LAYOUTPREFS_BOOKCHAPTERALIGNMENT") ? intval($this->BGETOPTIONS["LAYOUTPREFS_BOOKCHAPTERALIGNMENT"]) : BGET::ALIGN["LEFT"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_BOOKCHAPTERPOSITION" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "LAYOUTPREFS_BOOKCHAPTERPOSITION") ? intval($this->BGETOPTIONS["LAYOUTPREFS_BOOKCHAPTERPOSITION"]) : BGET::POS["TOP"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_BOOKCHAPTERWRAP" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "LAYOUTPREFS_BOOKCHAPTERWRAP") ? intval($this->BGETOPTIONS["LAYOUTPREFS_BOOKCHAPTERWRAP"]) : BGET::WRAP["NONE"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_BOOKCHAPTERFORMAT" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "LAYOUTPREFS_BOOKCHAPTERFORMAT") ? intval($this->BGETOPTIONS["LAYOUTPREFS_BOOKCHAPTERFORMAT"]) : BGET::FORMAT["BIBLELANG"],
                "type" => "integer"
            ],
            "LAYOUTPREFS_BOOKCHAPTERFULLQUERY" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "LAYOUTPREFS_BOOKCHAPTERFULLQUERY") ? $this->BGETOPTIONS["LAYOUTPREFS_BOOKCHAPTERFULLQUERY"] : false,                    //false: just the name of the book and the chapter will be shown (i.e. 1 John 4)
                "type" => "boolean"                    //true: the full reference including the verses will be shown (i.e. 1 John 4:7-8)
            ],
            "LAYOUTPREFS_SHOWVERSENUMBERS" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "LAYOUTPREFS_SHOWVERSENUMBERS") ? $this->BGETOPTIONS["LAYOUTPREFS_SHOWVERSENUMBERS"] : BGET::VISIBILITY["SHOW"],
                "type" => "boolean"
            ],
            "VERSION" => [
                "default" => self::setAndIsStringArray($this->BGETOPTIONS, "VERSION") ? $this->BGETOPTIONS["VERSION"] : ["NABRE"], //Array of string values
                "type" => "array",
                "items" => ["type" => "string"]
            ],
            "QUERY" => [
                "default" => self::setAndNotNothing($this->BGETOPTIONS, "QUERY") ? $this->BGETOPTIONS["QUERY"] : "Matthew1:1-5",
                "type" => "string"
            ],
            "POPUP" => [
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "POPUP") ? $this->BGETOPTIONS["POPUP"] : false,
                "type" => "boolean"
            ],
            "PREFERORIGIN" => [
                "default" => self::setAndIsNumber($this->BGETOPTIONS, "PREFERORIGIN") ? intval($this->BGETOPTIONS["PREFERORIGIN"]) : BGET::PREFERORIGIN["HEBREW"],
                "type" => "integer"
            ],
            "FORCEVERSION" => [ //not currently used
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "FORCEVERSION") ? $this->BGETOPTIONS["FORCEVERSION"] : false,
                "type" => "boolean"
            ],
            "FORCECOPYRIGHT" => [ //not currently used
                "default" => self::setAndIsBoolean($this->BGETOPTIONS, "FORCECOPYRIGHT") ? $this->BGETOPTIONS["FORCECOPYRIGHT"] : false,
                "type" => "boolean"
            ]
        ]; //end $this->OPTIONS
    }

    public static function setAndNotNothing($arr, $key) {
        return (isset($arr[$key]) && $arr[$key] != "");
    }

    public static function setAndIsBoolean($arr, $key) {
        return (isset($arr[$key]) && is_bool($arr[$key]));
    }

    public static function setAndIsNumber($arr, $key) {
        return (isset($arr[$key]) && is_numeric($arr[$key]));
    }

    public static function setAndIsStringArray($arr, $key) {
        $ret = true;
        if (isset($arr[$key]) && is_array($arr[$key]) && !empty($arr[$key])) {
            foreach ($arr[$key] as $value) {
                if (!is_string($value)) {
                    $ret = false;
                }
            }
        } else {
            $ret = false;
        }
        return $ret;
    }

}
