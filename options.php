<?php
/** CREATE ADMIN MENU PAGE WITH SETTINGS */
class BibleGetSettingsPage
{
    /**
     * Holds the values to be used in the fields callbacks
     */
    private $options;
    private $options_page_hook;
    private $versionsbylang;
    private $versionlangs;
    private $countversionsbylang;
    private $countversionlangs;
    private $biblebookslangs;
    
    /**
     * Start up
     */
    public function __construct()
    {
        add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
        add_action( 'admin_init', array( $this, 'page_init' ) );
        $this->versionsbylang = array();
        $this->versionlangs = array();
        $this->countversionsbylang = 0;
        $this->countversionlangs = 0;
        $this->biblebookslangs = array();
        
    }

    /**
     * Add options page
     */
    public function add_plugin_page()
    {
        // This page will be under "Settings" 
        $this->options_page_hook = add_options_page(
            __('BibleGet I/O Settings',"bibleget-io"),	// $page_title
            'BibleGet I/O',								// $menu_title
            'manage_options',							// $capability
            'bibleget-settings-admin',					// $menu_slug (Page ID)
            array( $this, 'create_admin_page' )			// Callback Function
        );
        
        add_action('admin_enqueue_scripts', array( $this, 'admin_print_styles') );
        add_action('admin_enqueue_scripts', array( $this, 'admin_print_scripts') );
        add_action('load-'.$this->options_page_hook, array( $this, 'do_on_my_plugin_settings_save') );
        
        //start populating as soon as possible
        $this->getVersionsByLang();
    }

    /**
     * Options page callback
     */
    public function create_admin_page()
    {
        //write_log("creating admin page\n");
        // Set class property
        $this->options = get_option( 'bibleget_settings' );
        
        ?>
        <div id="page-wrap">
            <?php screen_icon(); ?>
            <h2 id="bibleget-h2"><?php _e("BibleGet I/O Settings","bibleget-io") ?></h2>           
            <div id="form-wrapper" class="leftfloat">
            <form method="post" action="options.php">
            <?php
                // This prints out all hidden setting fields
                settings_fields( 'bibleget_settings_options' );   // $option_group -> match group name in register_setting()
                do_settings_sections( 'bibleget-settings-admin' ); // $page_slug
                submit_button(); 
            ?>
            </form>
            </div>
            <div class="page-clear"></div>
        	  
            <hr>
            <div id="bibleget-settings-container">        		
      				<div id="bibleget-settings-contents">
            		<h3><?php _e("Current BibleGet I/O engine information:","bibleget-io") ?></h3>
            		<ol type="A">
            			<li><?php 
                			if($this->countversionsbylang<1 || $this->countversionlangs<1){
            					echo "Seems like the version info was not yet initialized. Now attempting to initialize...";
    							$this->getVersionsByLang();
            				}
            				$b1 = '<b class="bibleget-dynamic-data">';
            				$b2 = '</b>';
            				$string1 = $b1.$this->countversionsbylang.$b2;
            				$string2 = $b1.$this->countversionlangs.$b2;
            				/* translators: please do not change the placeholders %s, they will be substituted dynamically by values in the script. See http://php.net/printf. */
            				printf(__("The BibleGet I/O engine currently supports %s versions of the Bible in %s different languages.","bibleget-io"),$string1,$string2);
            				echo "<br />";
            				_e("Here is the list of currently supported versions, subdivided by language:","bibleget-io");
            				echo "<div class=\"bibleget-dynamic-data-wrapper\"><ol id=\"versionlangs-ol\">";
            				$cc=0;
            				foreach($this->versionlangs as $lang){
            					echo '<li>-'.$lang.'-<ul>';
            					foreach($this->versionsbylang[$lang] as $abbr => $value){
            						echo '<li>'.(++$cc).') '.$abbr.' — '.$value["fullname"].' ('.$value["year"].')</li>';
            					}
            					echo '</ul><div></li>';
            				}
            				echo "</ol>";
            			?></li>
            			<li><?php 
            				$string3 = $b1.count($this->biblebookslangs).$b2;
            				/* translators: please do not change the placeholders %s, they will be substituted dynamically by values in the script. See http://php.net/printf. */
            				printf(__("The BibleGet I/O engine currently recognizes the names of the books of the Bible in %s different languages:","bibleget-io"),$string3); 
            				echo "<br />";
            				echo "<div class=\"bibleget-dynamic-data-wrapper\">".implode(", ",$this->biblebookslangs)."</div>";
            			?></li>
            		</ol>
            		<p><?php _e("This information from the BibleGet server is cached locally to improve performance. If new versions have been added to the BibleGet server or new languages are supported, this information might be outdated. In that case you can click on the button below to renew the information.","bibleget-io"); ?></p>
            		<button id="bibleget-server-data-renew-btn" class="button button-secondary"><?php _e("RENEW INFORMATION FROM BIBLEGET SERVER","bibleget-io") ?></button>
              </div>
              <div id="bibleget_ajax_spinner"><img src="<?php echo admin_url(); ?>images/wpspin_light-2x.gif" /></div>
        	</div>
          	<div class="page-clear"></div>
        	<hr>
        	<?php 
        		$locale = apply_filters('plugin_locale', get_locale(), 'bibleget-io');
        		//let's keep the image files to the general locale, so we don't have to make a different image for every specific country locale...
        		if( strpos($locale,"_") !== false ) { 
        			if (version_compare(phpversion(), '5.4.0', '>=')) {
        				$locale_lang = explode("_",$locale)[0]; //variable dereferencing available only since PHP 5.4
        			}
        			else{
        				list($locale_lang,$locale_country) = explode("_",$locale); //lower than PHP 5.4
        			}
        			 
        		}
        		else { $locale_lang = $locale; }
        		if(file_exists(plugins_url( 'images/btn_donateCC_LG'.($locale_lang ? '-'.$locale_lang : '').'.gif', __FILE__ )) ){
        			$donate_img = plugins_url( 'images/btn_donateCC_LG'.($locale_lang ? '-'.$locale_lang : '').'.gif', __FILE__ );
        		}
        		else $donate_img = plugins_url( 'images/btn_donateCC_LG.gif', __FILE__ );
        	?>
        	<div id="bibleget-donate"><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HDS7XQKGFHJ58"></a><button><img src="<?php echo $donate_img; ?>" /></button></a></div>
        </div>
		<div id="bibleget-settings-notification">
		  <span class="bibleget-settings-notification-dismiss"><a title="dismiss this notification">x</a></span>
		</div>        
        <?php
    }

    
    /**
     * Register and add settings
     */
    public function page_init()
    {        

        register_setting(
            'bibleget_settings_options', // Option group
            'bibleget_settings', // Option name
            array( $this, 'sanitize' ) // Sanitize
        );
        
        add_settings_section(
            'bibleget_settings_section2', // ID
            __('Preferences Settings',"bibleget-io"), // Title
            array( $this, 'print_section_info2' ), // Callback
            'bibleget-settings-admin' // Page
        );
          
        add_settings_field(
            'favorite_version',
            __('Preferred version or versions (when not indicated in shortcode)',"bibleget-io"),
            array( $this, 'favorite_version_callback' ),
            'bibleget-settings-admin',
            'bibleget_settings_section2'
        );

    }

    /**
     * Sanitize each setting field as needed
     *
     * @param array $input Contains all settings fields as array keys
     */
    public function sanitize( $input )
    {   // use absint for number fields instead of sanitize_text_field
        $new_input = array();
        
        if( isset( $input['favorite_version'] ) )
        	$new_input['favorite_version'] = sanitize_text_field($input['favorite_version']);

        return $new_input;
    }

    /** 
     * Print the Section text
     */
    public function print_section_info2()
    {
        print __('Choose your preferences to facilitate the usage of the shortcode:',"bibleget-io");
    }
    
	
    public function getVersionsByLang()
    {
    	global $bibleget_langcodes;
    	global $bibleget_worldlanguages;
    	//$locale = substr(get_locale(),0,2);
    	$domain = 'bibleget-io';
    	$locale = substr(apply_filters('plugin_locale', get_locale(), $domain),0,2);
    	//echo "<div style=\"border:3px solid Red;\">locale = $locale</div>";
    	$biblebookslangs = get_option("bibleget_languages");
    	//$biblebookslangs = false;
    	if($biblebookslangs === false || !is_array($biblebookslangs) || count($biblebookslangs) < 1 ){
    		bibleGetSetOptions();
    		$biblebookslangs = get_option("bibleget_languages");
    	}
    	//echo "<div style=\"border:3px solid Red;\">biblebookslangs = ".print_r($biblebookslangs,true)."</div>";
    	$this->biblebookslangs = array();
    	foreach($biblebookslangs as $key => $lang){
    		if(isset($bibleget_worldlanguages[$lang][$locale])){
    			$lang = $bibleget_worldlanguages[$lang][$locale];
    		}
    		array_push($this->biblebookslangs,$lang);
    	}
    	
    	//write_log($this->biblebookslangs);
    	 
    	if(extension_loaded('intl') === true){
    		collator_asort(collator_create('root'), $this->biblebookslangs);
    	}else{
    		array_multisort(array_map('bibleGetSortify', $this->biblebookslangs), $this->biblebookslangs);
    	}
    	//write_log($this->biblebookslangs); 
    	
    	$versions = get_option("bibleget_versions",array()); //theoretically should be an array
    	$versionsbylang = array();
    	$langs = array();
    	if(count($versions)<1){
    		bibleGetSetOptions(); //global function defined in bibleget-io.php
    		$versions = get_option("bibleget_versions",array());
    	}
    	foreach($versions as $abbr => $versioninfo){
    		$info = explode("|",$versioninfo);
    		$fullname = $info[0];
    		$year = $info[1];
    		$lang = $bibleget_langcodes[$info[2]]; //this gives the english correspondent of the two letter ISO code
    		if(isset($bibleget_worldlanguages[$lang][$locale])){
    			$lang = $bibleget_worldlanguages[$lang][$locale]; //this will translate the English form into the localized form if available
    		}
    		if(isset($versionsbylang[$lang])){
    			if(isset($versionsbylang[$lang][$abbr])){
    				//how can that be?
    			}
    			else{
    				$versionsbylang[$lang][$abbr] = array("fullname"=>$fullname,"year"=>$year);
    			}
    		}
    		else{
    			$versionsbylang[$lang] = array();
    			array_push($langs,$lang);
    			$versionsbylang[$lang][$abbr] = array("fullname"=>$fullname,"year"=>$year);
    		}
    	}
    	$this->versionsbylang = $versionsbylang;
    	 
    	//count total languages and total versions
    	$this->countversionlangs = count($versionsbylang);
    	$counter = 0;
    	foreach($versionsbylang as $lang => $versionbylang){
    		ksort($versionsbylang[$lang]);
    		$counter+=count($versionsbylang[$lang]);
    	}
    	$this->countversionsbylang = $counter;
    	
    	if(extension_loaded('intl') === true){
    		collator_asort(collator_create('root'), $langs);
    	}else{
    		array_multisort(array_map('bibleGetSortify', $langs), $langs);
    	}

    	$this->versionlangs = $langs;
    	
    }
    
    public function favorite_version_callback()
    {
		//double check to see if the values have been set
    	if($this->countversionsbylang<1 || $this->countversionslangs<1){
			$this->getVersionsByLang();
		}
    	
		$counter = ($this->countversionsbylang + $this->countversionlangs);
				
		$selected = array();
		if(isset( $this->options['favorite_version'] ) && $this->options['favorite_version']){
			$selected = explode(",",$this->options['favorite_version']);
		}
    	$size = $counter<10 ? $counter : 10;
		echo '<select id="versionselect" size='.$size.' multiple>';
    	
    	$langs = $this->versionlangs;
    	$versionsbylang = $this->versionsbylang;
    	
    	foreach($langs as $lang){
    		echo '<optgroup label="-'.$lang.'-">';
			foreach($versionsbylang[$lang] as $abbr => $value){
				$selectedstr = '';
				if(in_array($abbr,$selected)){ $selectedstr = " SELECTED"; }
				echo '<option value="'.$abbr.'"'.$selectedstr.'>'.$abbr.' — '.$value["fullname"].' ('.$value["year"].')</option>';
    		}
			echo '</optgroup>';
    	}
    	echo '</select>';
    	echo '<input type="hidden" id="favorite_version" name="bibleget_settings[favorite_version]" value="" />';
    }
    
    public function admin_print_styles($hook)
    {
        if($hook == 'settings_page_bibleget-settings-admin'){
    		wp_enqueue_style( 'admin-css', plugins_url('css/admin.css', __FILE__) );
    	}
    }

    public function admin_print_scripts($hook)
    {
        //echo "<div style=\"border:10px ridge Blue;\">$hook</div>";
    	if($hook != 'settings_page_bibleget-settings-admin'){
    		return;
		}
    	
    	wp_register_script( 'admin-js', plugins_url('js/admin.js', __FILE__), array('jquery') );
    	$thisoptions = get_option( 'bibleget_settings' );
    	$myoptions = array();
    	if($thisoptions){
	    	foreach($thisoptions as $key => $option){
	    		$myoptions[$key] = esc_attr($option);
	    	}
    	}
    	$obj = array("options" => $myoptions,'ajax_url' => admin_url( 'admin-ajax.php' ),'ajax_nonce' => wp_create_nonce( "bibleget-data" ));
    	wp_localize_script( 'admin-js', 'obj', $obj );
    	wp_enqueue_script( 'admin-js' );
    }
    
    public function do_on_my_plugin_settings_save()
    {
      //print("\n Page with hook ".$this->options_page_hook." was loaded and load hook was called.");
      //exit;
      if(isset($_GET['settings-updated']) && $_GET['settings-updated']){
          //plugin settings have been saved. Here goes your code
          $this->options = get_option( 'bibleget_settings' );
          if($this->options === false ){
          	// let's set some default options
          }
                 
       }
    }

}


/**
 * Contains methods for customizing the theme customization screen.
 *
 * @link http://codex.wordpress.org/Theme_Customization_API
 * @since BibleGet I/O 3.6
 */
class BibleGet_Customize {

  public static $bibleget_style_settings;
  
  public static function init(){
    self::$bibleget_style_settings = new stdClass();

	self::$bibleget_style_settings->bibleget_fontfamily = new stdClass();
	self::$bibleget_style_settings->bibleget_fontfamily->dfault = 'Palatino Linotype';
	self::$bibleget_style_settings->bibleget_fontfamily->title = __('Font Family for Biblical Quotes',"bibleget-io");
	self::$bibleget_style_settings->bibleget_fontfamily->type = 'select';
	self::$bibleget_style_settings->bibleget_fontfamily->choices = array(
    	"Arial"					 => "Arial",
    	"Arial Black"			 => "Arial Black",
    	"Book Antiqua"			 => "Book Antiqua",
    	"Courier New"			 => "Courier New",
    	"Georgia"			  	 => "Georgia",
    	"Impact"			   	 => "Impact",
    	"Lucida Console"		 => "Lucida Console",
    	"Lucida Sans Unicode"	 => "Lucida Sans Unicode",
    	"Palatino Linotype"		 => "Palatino Linotype",
    	"Tahoma"			   	 => "Tahoma",
    	"Times New Roman"		 => "Times New Roman",
    	"Trebuchet MS"			 => "Trebuchet MS",
    	"Verdana"			  	 => "Verdana"
    );

	self::$bibleget_style_settings->bibleget_borderwidth = new stdClass();
    self::$bibleget_style_settings->bibleget_borderwidth->dfault = '2';    
    /* translators: "px" refers to pixels as used in CSS rules, do not translate */
    self::$bibleget_style_settings->bibleget_borderwidth->title = __('Border-width for Biblical Quotes (in px)',"bibleget-io");
    self::$bibleget_style_settings->bibleget_borderwidth->type = 'number';
    
	self::$bibleget_style_settings->bibleget_borderstyle = new stdClass();
    self::$bibleget_style_settings->bibleget_borderstyle->dfault = 'solid';
    self::$bibleget_style_settings->bibleget_borderstyle->title = __('Border-style for Biblical Quotes',"bibleget-io");
    self::$bibleget_style_settings->bibleget_borderstyle->type = 'select';
    self::$bibleget_style_settings->bibleget_borderstyle->choices = array(
        "none"		=> "none",
        "hidden"	=> "hidden",
        "dotted"	=> "dotted",
        "dashed"	=> "dashed",
		"solid"		=> "solid",
		"double"	=> "double",
		"groove"	=> "groove",
		"ridge"		=> "ridge",
		"inset"		=> "inset",
		"outset"	=> "outset",
		"initial"	=> "initial",
       	"inherit"	=> "inherit"
    );
    
    self::$bibleget_style_settings->bibleget_bordercolor = new stdClass();
    self::$bibleget_style_settings->bibleget_bordercolor->dfault = '#d3d3d3';
    self::$bibleget_style_settings->bibleget_bordercolor->title = __('Border-color for Biblical Quotes',"bibleget-io");
    self::$bibleget_style_settings->bibleget_bordercolor->type = 'color';
    
    self::$bibleget_style_settings->bibleget_bgcolor = new stdClass();
    self::$bibleget_style_settings->bibleget_bgcolor->dfault = '#ffffff';
    self::$bibleget_style_settings->bibleget_bgcolor->title = __('Background color for Biblical Quotes',"bibleget-io");
    self::$bibleget_style_settings->bibleget_bgcolor->type = 'color';
    
    self::$bibleget_style_settings->bibleget_borderradius = new stdClass();
    self::$bibleget_style_settings->bibleget_borderradius->dfault = 6;
    /* translators: "px" refers to pixels as used in CSS rules, do not translate */
    self::$bibleget_style_settings->bibleget_borderradius->title = __('Border-radius for Biblical Quotes (in px)',"bibleget-io");
    self::$bibleget_style_settings->bibleget_borderradius->type = 'number';
    
    $margin_padding_vals = array(
        "auto"    => "auto",
        0         => "0",
        1         => "1",
        2         => "2",
        3         => "3",
        4         => "4",
        5         => "5",
        6         => "6",
        7         => "7",
        8         => "8",
        9         => "9",
        10         => "10",
        12         => "12",
        14         => "14",
        16         => "16",
        18         => "18",
        20         => "20"        
    );
    
    self::$bibleget_style_settings->bibleget_margintopbottom = new stdClass();
    self::$bibleget_style_settings->bibleget_margintopbottom->dfault = 12;
    /* translators: "px" refers to pixels as used in CSS rules, do not translate */
    self::$bibleget_style_settings->bibleget_margintopbottom->title = __('Margin top/bottom for Biblical Quotes (in px)',"bibleget-io");
    self::$bibleget_style_settings->bibleget_margintopbottom->type = 'select';
    self::$bibleget_style_settings->bibleget_margintopbottom->choices = $margin_padding_vals;
    
    self::$bibleget_style_settings->bibleget_marginleftright = new stdClass();
    self::$bibleget_style_settings->bibleget_marginleftright->dfault = 'auto';
    /* translators: "px" refers to pixels as used in CSS rules, do not translate */
    self::$bibleget_style_settings->bibleget_marginleftright->title = __('Margin left/right for Biblical Quotes (in px)',"bibleget-io");
    self::$bibleget_style_settings->bibleget_marginleftright->type = 'select';
    self::$bibleget_style_settings->bibleget_marginleftright->choices = $margin_padding_vals;
    
    self::$bibleget_style_settings->bibleget_paddingtopbottom = new stdClass();
    self::$bibleget_style_settings->bibleget_paddingtopbottom->dfault = 12;
    /* translators: "px" refers to pixels as used in CSS rules, do not translate */
    self::$bibleget_style_settings->bibleget_paddingtopbottom->title = __('Padding top/bottom for Biblical Quotes (in px)',"bibleget-io");
    self::$bibleget_style_settings->bibleget_paddingtopbottom->type = 'select';
    self::$bibleget_style_settings->bibleget_paddingtopbottom->choices = $margin_padding_vals;

    self::$bibleget_style_settings->bibleget_paddingleftright = new stdClass();
    self::$bibleget_style_settings->bibleget_paddingleftright->dfault = 12;
    /* translators: "px" refers to pixels as used in CSS rules, do not translate */
    self::$bibleget_style_settings->bibleget_paddingleftright->title = __('Padding left/right for Biblical Quotes (in px)',"bibleget-io");
    self::$bibleget_style_settings->bibleget_paddingleftright->type = 'select';
    self::$bibleget_style_settings->bibleget_paddingleftright->choices = $margin_padding_vals;
    
    self::$bibleget_style_settings->bibleget_width = new stdClass();
    self::$bibleget_style_settings->bibleget_width->dfault = 85;
    /* translators: "%" refers to percentage as used in CSS rules (width: 100%), do not translate */
    self::$bibleget_style_settings->bibleget_width->title = __('Width for Biblical Quotes (in %)',"bibleget-io");
    self::$bibleget_style_settings->bibleget_width->type = 'number';
    
    self::$bibleget_style_settings->bibleget_textalign = new stdClass();
    self::$bibleget_style_settings->bibleget_textalign->dfault = 'justify';
    self::$bibleget_style_settings->bibleget_textalign->title = __('Text-align for Biblical Quotes',"bibleget-io");
    self::$bibleget_style_settings->bibleget_textalign->type = 'select';
    self::$bibleget_style_settings->bibleget_textalign->choices = array('left' => 'left','right'=>'right','center'=>'center','justify'=>'justify','inherit'=>'inherit','start'=>'start','end'=>'end');
    
    
    $bibleget_styles_general = new stdClass();
    $bibleget_styles_general->font_size = new stdClass();
    $bibleget_styles_general->font_style = new stdClass();
    $bibleget_styles_general->font_color = new stdClass();
    
    /* translators: "pt" refers to points as used in CSS rules, do not translate */
    $bibleget_styles_general->font_size->title = __("Font Size (in pt)","bibleget-io");
    $bibleget_styles_general->font_style->title = __("Font Style","bibleget-io");
    $bibleget_styles_general->font_color->title = __("Font Color","bibleget-io");
    
    $bibleget_styles_general->font_size->type = 'select';
    $bibleget_styles_general->font_style->type = 'style';
    $bibleget_styles_general->font_color->type = 'color';
    
	$bibleget_style_sizes_arr = array(4=>'4',5=>'5',6=>'6',7=>'7',8=>'8',9=>'9',10=>'10',11=>'11',12=>'12',14=>'14',16=>'16',18=>'18',20=>'20',22=>'22',24=>'24',26=>'26',28=>'28');
	$bibleget_style_choices_arr = array(
      'bold'         => __("B","bibleget-io"),
      'italic'       => __("I", "bibleget-io"),
      'underline'    => __("U", "bibleget-io"),
      'strikethrough'=> __("S","bibleget-io"),
      'superscript'  => __("SUP","bibleget-io"),
      'subscript'    => __("SUB","bibleget-io")
    );
    
    foreach($bibleget_styles_general as $i => $styleobj){
		$o = str_replace("_","",$i);

		self::$bibleget_style_settings->{'bookchapter_'.$o} = new stdClass();
		/* translators: in reference to Font Size, Style and Color */
		self::$bibleget_style_settings->{'bookchapter_'.$o}->title = $styleobj->title . " " . __('for Books and Chapters',"bibleget-io");
		self::$bibleget_style_settings->{'bookchapter_'.$o}->type = $styleobj->type;
		if($styleobj->type == 'select'){
			self::$bibleget_style_settings->{'bookchapter_'.$o}->choices = $bibleget_style_sizes_arr;
		}
      	elseif($styleobj->type == 'style'){
        	self::$bibleget_style_settings->{'bookchapter_'.$o}->choices = $bibleget_style_choices_arr;
      	}
		self::$bibleget_style_settings->{'versenumber_'.$o} = new stdClass();
		/* translators: in reference to Font Size, Style and Color */
		self::$bibleget_style_settings->{'versenumber_'.$o}->title = $styleobj->title . " " . __('for Verse Numbers',"bibleget-io");
		self::$bibleget_style_settings->{'versenumber_'.$o}->type = $styleobj->type;
		if($styleobj->type == 'select'){
			self::$bibleget_style_settings->{'versenumber_'.$o}->choices = $bibleget_style_sizes_arr;
		}
      	elseif($styleobj->type == 'style'){
        	self::$bibleget_style_settings->{'versenumber_'.$o}->choices = $bibleget_style_choices_arr;
      	}
			self::$bibleget_style_settings->{'versetext_'.$o} = new stdClass();
			/* translators: in reference to Font Size, Style and Color */
			self::$bibleget_style_settings->{'versetext_'.$o}->title = $styleobj->title . " " . __('for Text of Verses',"bibleget-io");
			self::$bibleget_style_settings->{'versetext_'.$o}->type = $styleobj->type;
		if($styleobj->type == 'select'){
			self::$bibleget_style_settings->{'versetext_'.$o}->choices = $bibleget_style_sizes_arr;
		}
      	elseif($styleobj->type == 'style'){
        	self::$bibleget_style_settings->{'versetext_'.$o}->choices = $bibleget_style_choices_arr;
      	}
	}
	self::$bibleget_style_settings->bookchapter_fontsize->dfault = 14;
	self::$bibleget_style_settings->bookchapter_fontstyle->dfault = 'bold';
	self::$bibleget_style_settings->bookchapter_fontcolor->dfault = '#284f29';
	self::$bibleget_style_settings->versenumber_fontsize->dfault = 7;
	self::$bibleget_style_settings->versenumber_fontstyle->dfault = 'superscript';
	self::$bibleget_style_settings->versenumber_fontcolor->dfault = '#c10005';
	self::$bibleget_style_settings->versetext_fontsize->dfault = 10;
	self::$bibleget_style_settings->versetext_fontstyle->dfault = '';
	self::$bibleget_style_settings->versetext_fontcolor->dfault = '#646d73';
	
	self::$bibleget_style_settings->linespacing_verses = new stdClass();
	self::$bibleget_style_settings->linespacing_verses->dfault = 150;
	self::$bibleget_style_settings->linespacing_verses->title = __('Line-spacing for Verses Paragraphs',"bibleget-io");
	self::$bibleget_style_settings->linespacing_verses->type = 'select';
	self::$bibleget_style_settings->linespacing_verses->choices = array(100 => 'single',150 => '1½',200 => 'double');

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
	public static function register ( $wp_customize ) {
		
    self::init();
    		
    require_once 'custom_controls.php';
    		
		//1. Define a new section (if desired) to the Theme Customizer
		$wp_customize->add_section( 'bibleget_style_options',
				array(
						'title'       => __( 'BibleGet Plugin Styles', 'bibleget-io' ), //Visible title of section
						'priority'    => 35, //Determines what order this appears in
						'capability'  => 'publish_posts', //Capability needed to tweak
						'description' => __( 'Custom styles that apply to the text formatting of the biblical quotes', 'bibleget-io' ) 
				)
		);
		
		$bibleget_style_settings_cc = 0;
		foreach(self::$bibleget_style_settings as $style_setting => $style_setting_obj){
			
			//2. Register new settings to the WP database...
			$wp_customize->add_setting( $style_setting, //No need to use a SERIALIZED name, as `theme_mod` settings already live under one db record
					array(
							'default'    => $style_setting_obj->dfault, //Default setting/value to save
							'type'       => 'theme_mod', //Is this an 'option' or a 'theme_mod'?
							'capability' => 'publish_posts', //Optional. Special permissions for accessing this setting.
							'transport'  => 'postMessage' //What triggers a refresh of the setting? 'refresh' or 'postMessage' (instant)?
					)
			);				
			
			//3. Finally, we define the control itself (which links a setting to a section and renders the HTML controls)...
			if($style_setting_obj->type == 'color'){
				$wp_customize->add_control( new WP_Customize_Color_Control( //Instantiate the color control class
						$wp_customize, //Pass the $wp_customize object (required)
						$style_setting . '_ctl', //Set a unique ID for the control
						array(
								'label'      => $style_setting_obj->title, //Admin-visible name of the control
								'settings'   => $style_setting, //Which setting to load and manipulate (serialized is okay)
								'priority'   => $bibleget_style_settings_cc++, //Determines the order this control appears in for the specified section
								'section'    => 'bibleget_style_options' //ID of the section this control should render in (can be one of yours, or a WordPress default section)
						)
						)
				);				
			}
			elseif($style_setting_obj->type == 'select'){
				$wp_customize->add_control($style_setting . '_ctl',
						array(
								'label'	  	=> $style_setting_obj->title,
								'settings'	=> $style_setting,
								'priority'	=> $bibleget_style_settings_cc++,
								'section' 	=> 'bibleget_style_options',
								'type'	   	=> 'select',
								'choices' 	=> $style_setting_obj->choices
						)
				);
			}
			elseif($style_setting_obj->type == 'style'){
				$wp_customize->add_control( new BibleGet_Customize_StyleBar_Control(
						$wp_customize,
						$style_setting . '_ctl',
						array(
								'label'	  	=> $style_setting_obj->title,
								'settings'	=> $style_setting,
								'priority'	=> $bibleget_style_settings_cc++,
								'section' 	=> 'bibleget_style_options',
                'choices'   => $style_setting_obj->choices
						)
						)
				);
			}
      elseif($style_setting_obj->type == 'number'){
        $wp_customize->add_control($style_setting . '_ctl',
          array(
              'label'       => $style_setting_obj->title,
              'settings'    => $style_setting,
              'priority'    => $bibleget_style_settings_cc++,
              'section'     => 'bibleget_style_options',
              'type'        => 'number'              
          )
        );
      }
		}

		
		

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
		
      self::init();
    ?>
      <!--Customizer CSS--> 
      <style type="text/css">
           <?php self::generate_css('div.results', 'font-family', 'bibleget_fontfamily'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results', 'border-width', 'bibleget_borderwidth','','px'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results', 'border-style', 'bibleget_borderstyle'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results', 'border-color', 'bibleget_bordercolor'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results', 'background-color', 'bibleget_bgcolor'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results', 'border-radius', 'bibleget_borderradius','','px'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results', 'width', 'bibleget_width','','%'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results p.verses', 'text-align', 'bibleget_textalign'); echo PHP_EOL; ?>
           
           <?php $mod = get_theme_mod('bibleget_margintopbottom',self::$bibleget_style_settings->bibleget_margintopbottom->dfault);
             		$cssrule = '';
             		if ( ! empty( $mod ) ) {
             			$cssrule = sprintf('%s { %s:%s; }',
             					'div.results',
             					'margin-top',
                      ($mod=='auto' ? $mod : $mod.'px')
             					//number_format(($mod / 10),1,'.','').'em'
             			);
         				  echo $cssrule; echo PHP_EOL;
             			$cssrule = sprintf('%s { %s:%s; }',
             					'div.results',
             					'margin-bottom',
                      ($mod=='auto' ? $mod : $mod.'px')
             					//number_format(($mod / 10),1,'.','').'em'
             			);
         				  echo $cssrule; echo PHP_EOL;
             		}
           ?>
           <?php $mod = get_theme_mod('bibleget_marginleftright',self::$bibleget_style_settings->bibleget_marginleftright->dfault);
             		$cssrule = '';
             		if ( ! empty( $mod ) ) {
             			$cssrule = sprintf('%s { %s:%s; }',
             					'div.results',
             					'margin-left',
                      ($mod=='auto' ? $mod : $mod.'px')
             					//number_format(($mod / 10),1,'.','').'em'
             			);
         				  echo $cssrule; echo PHP_EOL;
             			$cssrule = sprintf('%s { %s:%s; }',
             					'div.results',
             					'margin-right',
                      ($mod=='auto' ? $mod : $mod.'px')
             					//number_format(($mod / 10),1,'.','').'em'
             			);
         				  echo $cssrule; echo PHP_EOL;
             		}
           ?>
           <?php $mod = get_theme_mod('bibleget_paddingtopbottom',self::$bibleget_style_settings->bibleget_paddingtopbottom->dfault);
             		$cssrule = '';
             		if ( ! empty( $mod ) ) {
             			$cssrule = sprintf('%s { %s:%s; }%s { %s:%s; }',
             					'div.results',
             					'padding-top',
                      ($mod=='auto' ? $mod : $mod.'px'),
             					PHP_EOL.'div.results',
             					'padding-bottom',
                      ($mod=='auto' ? $mod : $mod.'px')
             			);
         				  echo $cssrule; echo PHP_EOL;
             		}
           ?>
           <?php $mod = get_theme_mod('bibleget_paddingleftright',self::$bibleget_style_settings->bibleget_paddingleftright->dfault);
             		$cssrule = '';
             		if ( ! empty( $mod ) ) {
             			$cssrule = sprintf('%s { %s:%s; }%s { %s:%s; }',
             					'div.results',
             					'padding-left',
                      ($mod=='auto' ? $mod : $mod.'px'),
             					PHP_EOL.'div.results',
             					'padding-right',
                      ($mod=='auto' ? $mod : $mod.'px')
             			);
         				  echo $cssrule; echo PHP_EOL;
             		}
           ?>
           
           <?php self::generate_css('div.results p.book', 'color', 'bookchapter_fontcolor'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results p.verses', 'color', 'versetext_fontcolor'); echo PHP_EOL; ?>
           <?php self::generate_css('div.results p.verses span.sup', 'color', 'versenumber_fontcolor'); echo PHP_EOL; ?>
           <?php echo 'div.results p.verses span.sup { margin: 0px 3px; }'; ?>
           <?php 
           		$fontsizerules = array(
                'bookchapter_fontsize' => 'div.results p.book',
                'versetext_fontsize' => 'div.results p.verses',
                'versenumber_fontsize' => 'div.results p.verses span.sup'
                );
              foreach ($fontsizerules as $fontsizerule => $css_selector){
                $mod = get_theme_mod($fontsizerule,self::$bibleget_style_settings->$fontsizerule->dfault);
             		$cssrule = '';
             		if ( ! empty( $mod ) ) {
             			$cssrule = sprintf('%s { %s:%s; }',
             					$css_selector,
             					'font-size',
                      $mod.'pt'
             					//number_format(($mod / 10),1,'.','').'em'
             			);
         				  echo $cssrule; echo PHP_EOL;
             		}
              }
           ?>
           <?php 
              $fontstylerules = array(
                'bookchapter_fontstyle' => 'div.results p.book',
                'versetext_fontstyle' => 'div.results p.verses',
                'versenumber_fontstyle' => 'div.results p.verses span.sup'
                );
              foreach ($fontstylerules as $fontstylerule => $css_selector){
                $cssrule = '';
                $mod = get_theme_mod($fontstylerule,self::$bibleget_style_settings->$fontstylerule->dfault);                
                $fval = array();
                if ( ! empty ( $mod ) ) {
                  $fval = explode(',',$mod);
                  
                  if( in_array('bold',$fval) ){
                    $cssrule .= 'font-weight:bold;';
                  }
                  else{
                    $cssrule .= 'font-weight:normal;';
                  }
                  
                  if( in_array('italic',$fval) ){
                    $cssrule .= 'font-style:italic;';
                  }
                  else{
                    $cssrule .= 'font-style:normal;';
                  }
                  
                  if( in_array('underline',$fval) ){
                    $cssrule .= 'text-decoration:underline;';
                  }
                  elseif ( in_array('strikethrough',$fval) ){
                    $cssrule .= 'text-decoration:line-through;';
                  }
                  else {
                    $cssrule .= 'text-decoration:none;';
                  }
                  
                  if( in_array('superscript',$fval) ){
                    $cssrule .= 'vertical-align:baseline;position:relative;top:-0.6em;';
                  }
                  elseif( in_array('subscript',$fval) ){
                    $cssrule .= 'vertical-align:baseline;position:relative;top:0.6em;';
                  }
                  else{
                    $cssrule .= 'vertical-align:baseline;position:static;';
                  }
                  
                  echo sprintf('%s { %s }',$css_selector,$cssrule); echo PHP_EOL;
                }
                unset($fval);
              }
           ?>

           <?php self::generate_css('div.results p.verses', 'line-height', 'linespacing_verses', '', '%'); echo PHP_EOL; ?>

           <?php
              $linespacing_verses = get_theme_mod('linespacing_verses',self::$bibleget_style_settings->linespacing_verses->dfault);
              $fontsize_versenumber = get_theme_mod('versenumber_fontsize',self::$bibleget_style_settings->versenumber_fontsize->dfault);
              echo "div.results p.verses span.sm { text-transform: lowercase; font-variant: small-caps; } "; echo PHP_EOL;
              echo '/* Senseline. A line that is broken to be reading aloud/public speaking. Poetry is included in this category. */'; echo PHP_EOL;      		
           	  echo "div.results p.verses span.pof { display: block; text-indent: 0; margin-top:1em; margin-left:5%; line-height: $linespacing_verses"."%; }"; echo PHP_EOL;
              echo "div.results p.verses span.po { display: block; margin-left:5%; margin-top:-1%; line-height: $linespacing_verses"."%; }"; echo PHP_EOL;
 			  echo "div.results p.verses span.pol { display: block; margin-left:5%; margin-top:-1%; margin-bottom:1em; line-height: $linespacing_verses"."%; }"; echo PHP_EOL;
 			  echo "div.results p.verses span.pos { display: block; margin-top:1em; margin-left:5%; line-height: $linespacing_verses"."%; }"; echo PHP_EOL;
 			  echo "div.results p.verses span.poif { display: block; margin-left:7%; margin-top:1%; line-height: $linespacing_verses"."%; }"; echo PHP_EOL;
 			  echo "div.results p.verses span.poi { display: block; margin-left:7%; margin-top:-1%; line-height: $linespacing_verses"."%; }"; echo PHP_EOL;
 			  echo "div.results p.verses span.poil { display: block; margin-left:7%; margin-bottom:1%; line-height: $linespacing_verses"."%; }"; echo PHP_EOL;
              echo "div.results p.verses span.speaker { font-weight: bold; background-color: #eeeeee; padding: 3px; border-radius: 3px; margin-right: 10px; font-size: $fontsize_versenumber"."pt; }"; echo PHP_EOL;
          ?>
      </style> 
      <!--/Customizer CSS-->
      <?php
   }
   
   public static function bibleget_customizer_print_script($hook) {
   		//can load custom scripts here...
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
           'bibleget-pluginstylecustomizer', // Give the script a unique ID
      		plugins_url( 'js/theme-customizer.js', __FILE__ ), // Define the path to the JS file
           array(  'jquery', 'customize-preview' ), // Define dependencies
           '', // Define a version (optional) 
           true // Specify whether to put in footer (leave this true)
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
     * @param bool $echo Optional. Whether to print directly to the page (default: true).
     * @return string Returns a single line of CSS with selectors and a property.
     * @since BibleGet I/O 3.6
     */
    public static function generate_css( $selector, $style, $mod_name, $prefix='', $postfix='', $echoback=true ) {
      $returnval = '';
      $mod = get_theme_mod($mod_name,self::$bibleget_style_settings->$mod_name->dfault);
      if ( ! empty( $mod ) ) {
         $returnval = sprintf('%s { %s:%s; }',
            $selector,
            $style,
            $prefix.$mod.$postfix
         );
         if ( $echoback ) {
            echo $returnval;
         }
      }
      return $returnval;
    }
}
