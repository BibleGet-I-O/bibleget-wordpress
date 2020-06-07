=== BibleGet I/O ===
Contributors: Lwangaman
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HDS7XQKGFHJ58
Tags: bible,shortcode,quote,citation,verses,bibbia,citazione,versetti,biblia,cita,versiculos,versets,citation
Requires at least: 5.0
Tested up to: 5.4.1
Requires PHP: 5.6
Stable tag: 6.4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A shortcode [bibleget] and a Gutenberg block for inserting Bible quotes in articles or pages; uses the BibleGet I/O Service endpoint.

== Description ==

Once the plugin is installed, you will find the "Bible quote" Gutenberg block in the "widgets" section of the block editor. 
Also available is a shortcode [bibleget] that you can use to insert Bible quotes in articles or pages from different versions of the Bible in different languages.

The text of the Bible quotes are retrieved from the BibleGet service endpoint *[https://query.bibleget.io](https://query.bibleget.io "BibleGet Service endpoint")*.
**USAGE:** [bibleget query="Exodus 19:5-6,8;20:1-17" version="CEI2008"] 
**USAGE:** [bibleget query="Matthew 1:1-10,12-15" versions="NVBSE,NABRE"] 

It is also possible to place the desired Bible verse quote in the contents of the shortcode, like so:
**USAGE:** [bibleget version="NABRE"]John 3:16;1 John 4:7-8[/bibleget] 

The Plugin also has a settings page “BibleGet I/O” under the “Settings” area in the Dashboard, where you can choose your preferred Bible versions from those available on the BibleGet server so that you don’t have to use the “version” or “versions” option every time. 
After you have made your choices in the settings area, remember to click on “Save”! 
Once the preferred version is set you can simply use:
**USAGE:** [bibleget query=“1 Cor 13”] 

The style settings are customizable using the Wordpress Customizer, so that the injected Bible quotes may fit into the style of your own blog / WordPress website.

The Gutenberg block has a number of customizable options for the layout of the elements that make up the Bible quote.

https://youtu.be/KWd_q6e8A2w

https://youtu.be/zqJqU_5UZ5M

_________

[BibleGet Project Website](https://www.bibleget.io/ "BibleGet Project Website")
[BibleGet Project Facebook Page](https://www.facebook.com/BibleGetIO/ "BibleGet Project Facebook Page")
[BibleGet Project Google+ Page](https://plus.google.com/+BibleGetIO "BibleGet Project Google+ Page")
[BibleGet Twitter Profile](https://twitter.com/biblegetio "@BibleGetIO")

== Installation ==

1. For streamlined installation: go to WP backend -> 'Plugins' -> 'Add new' and search for 'bibleget'. Click on 'Install Now'.
2. For manual installation: download the zip file upload the `bibleget-io` folder to the `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress

== Frequently Asked Questions ==

= How do I formulate a Bible citation? =
The “query” parameter must contain a citation that is formulated following the standard notation for Bible citations (see [Bible citation notation](http://en.wikipedia.org/wiki/Bible_citation "http://en.wikipedia.org/wiki/Bible_citation")):
   * “:”: is the chapter – verse separator. “15:5” means “chapter 15, verse 5”.

   * “-”: is the from – to separator, and it can be used in one of three ways:

      1. from chapter to chapter: “15-16″ means “from chapter 15 to chapter 16”.
      2. from chapter,verse to verse (of the same chapter): “15:1-5” means “chapter 15, from verse 1 to verse 5”.
      3. from chapter,verse to chapter,verse “15:1-16:5” means “from chapter 15,verse 1 to chapter 16,verse 5”.

   * “,”: is the separator between one verse and another. “15:5,7,9” means “chapter 15,verse 5 then verse 7 then verse 9”.

   * “;”: is the separator between one query and another. “15:5-7;16:3-9,11-13” means “chapter 15, verses 5 to 7; then chapter 16, verses 3 to 9 and verses 11 to 13”.

At least the first query (of a series of queries chained by a semi-colon) must indicate the name of the book upon which to make the request;
 the name of the book can be written in full in more than 20 different languages, or written using the abbreviated form.
 See the page [List of Book Abbreviations](https://www.bibleget.io/how-it-works/list-of-book-abbreviations/ "List of Book Abbreviations").
 When a query following a semi-colon does not indicate the book name, it is intended that the request be made upon the same book as the previous query.
 So “Gen1:7-9;4:4-5;Ex3:19” means “Genesis chapter 1, verses 7 to 9; then again Genesis chapter 4, verses 4 to 5; then Exodus chapter 3, verse 19”.

= I am requesting a long Bible quote but I'm only getting 30 verses =
If you are using a version of the Bible that is covered by copyright, you will not be able to quote more than 30 verses at once. So if you request for example “Gen1” using the NABRE version, you might expect to get back Gen1:1-31 but instead you will only get back Gen1:1-30. This is a limit imposed by the legal agreements for usage of these versions, it's not a bug, it's by design. If you need more than 30 verses when requesting a version covered by copyright, formulate the request as multiple quotes split up into no more than 30 verses each, for example “Gen1:1-30;1:31”.

= What happens if I add a Google Fonts API key? =
If you add a Google Fonts API key, the BibleGet plugin will immediately test it's validity. If valid, it will remember that you have a key and that it's valid for 3 months. Every three months starting from this moment the BibleGet plugin will talk with the Google Fonts API to get the latest list of available Google Fonts, and will download to the plugin folders a local compressed copy of each of those fonts for the purpose of previewing them in the customizer interface.  
You will need to be a bit patient the first time as it will take a couple minutes to complete the download process. A progress bar will let you know how the download is progressing. If you have a slow connection, the progress might stall for a few seconds every now an then (around 25%, 50%, and 75%), just be patient and it should continue to progress to the end. In the future, whenever the plugin talks with the Google Fonts API, the process should go a lot faster as it will only need to download new fonts. 
It will also generate a css file that will load the preview of the fonts when you open the customizer interface. This does have a bit of a performance impact, and especially the first time you open the customizer it might take a minute to load. After this it should go a little faster as the fonts previews should be cached by the browser. If you are not happy with the performance impact, I would suggest to delete the Google Fonts API key.

= I have added the Google Fonts API key but the list of available fonts isn't updated =
The BibleGet plugin will remember that your key is valid for 3 months. This means that it will not fetch the list of fonts from the Google Fonts API until the relative transient expires. If a new font has come out that you would like to see and use in the customizer interface for the BibleGet plugin, and you don't want to have to wait until the transient expires in that 3 month time slot, then you can click on the "force refresh" option below your API key. 

= I added the Google Fonts API key but while it was processing the download it stopped with a 504 http status error =
If you receive a 504 http status error it means that the connection with the Google Fonts API timed out for some reason. The BibleGet plugin tries to handle this situation by forcing the process to start again, but if instead the process comes to a halt please let the plugin author know at admin@bibleget.io in order to look further into the handling of this situation. In any case you can reload the page and use the "force refresh" option below your API key and the process will pick up where it left off.

= I updated the plugin to version 5.4 or later, but the new 'Bible quote' block doesn't seem to be cooperating =
In order to allow for new layout options, the BibleGet service endpoint itself was slightly updated, and there is a little more information in the response from the server.
However Bible quotes are cached by the BibleGet plugin for a seven day period, which means that from the time of the update until about a week later the cached Bible quotes will not have the necessary information for them to work with the 'Bible quote' block.
If you do not want to wait seven days or until the cache expires, there is a new option in the BibleGet Settings page since version 5.7 which allows to flush the cache.
A word of caution however: the more recent updates to the BibleGet service endpoint have started imposing hard limits on the number of requests that can be issued from any given domain, IP address or referer. No more than 30 requests for one same Bible quote can be issued in a two day period, and no more than 100 requests for different Bible quotes can be issued in a two day period. If you have many Bible quotes on your website and you risk hitting the limit, it may be best not to flush the cache all at once but rather wait out the seven days until the cache expires.  

= Sometimes the Bible quote block is giving an error 'Error loading block: The response is not a valid JSON response.' =
If you sometimes see this error, one possible situation is that your server configuration needs to allow for a larger buffer for proxy requests. You can check that that is the case if you open your browser's Inspector Tools (for example CTRL-SHIFT-I in Google Chrome) and you see a failed GET request by the api-fetch.min.js script to a wp-json endpoint something like this: **/wp-json/wp/v2/block-renderer/bibleget/bible-quote?...**
You can further inspect the *Network* tab of the browser's Inspector Tools (this may require reloading the page and retrying the request). If you see a similar request in the Network tab with a response of '502 Bad Gateway', this could be an indication that you may need a larger buffer for your server. 
If for example you have an nginx server, you may need to edit your **/etc/nginx/nginx.conf** and set 'proxy_buffer_size' to a larger value (see for example [this thread](https://talk.plesk.com/threads/fpm-buffer-settings-and-proxy-buffer.344813/ "fpm buffer settings and proxy buffer")).

= I'm not able to use some options in the Gutenberg block such as positioning of the Bible version =
There was recently an update to the BibleGet service endpoint which slightly changed the structure of the html that comprises the Bible quotes. It is necessary to update the plugin to v5.9 in order to be compatible with these changes. 

== Screenshots ==

1. Inserting a Bible quote block into an article or page
2. Bible quote block: choose Bible version and insert Bible reference
3. Search results for search verses by keyword
4. Layout options for Bible version, Book and chapter reference...
5. Styling options with the WordPress Customizer
# REMEMBER: screenshots are stored in the project assets folder. The extension doesn't matter, what matters is the file name
# must be lowercase "screenshot-#.ext" where # corresponds to the list number above

== Changelog ==

= 6.4 =
* Ensure "version" attribute is preserved during transform bibleget shortcode to Bible quote block
* Ensure Bible versions set in settings will become default and stay such, even when Bible version is changed in the Bible quote block options

= 6.3 =
* Fix typo in PHP function

= 6.2 =
* Better type checks on saved options when building default options
* Ensure shortcodes will be rendered same as Gutenberg blocks

= 6.1 =
* Fix typo in PHP update_option function

= 6.0 =
* Ensure that default options are defined on activation

= 5.9 =
* Gutenberg block now has all possible options in the sidebar, which are in synchronized to Customizer options
* Customizer has better UI, even though it doesn't have all the layout options that the Gutenberg block has
* An update to the html output from the BibleGet server requests required an update to the plugin handling logic of the html structure
* Better handling both from the BibleGet endpoint and from the plugin for rendering of Bible book names in WP interface language when using non catholic versions with different book numbering

= 5.8 =
* once a traditional shortcode is transformed into a block shortcode, allow transforming the block shortcode into a 'Bible quote' block 

= 5.7 =
* better handling of bible quotes cache by prefixing the transients
* added option to flush bible quotes cache from settings page

= 5.6 =
* turn off PHP error reporting!

= 5.5 =
* Bugfix: fixed a cleanup error on removal of the plugin

= 5.4 =
* created Gutenberg block

= 5.3 =
* Cleaner interface for the Google Fonts API key and better handling of different scenarios with more control in the admin interface

= 5.2 =
* Small bugfix where a stray javascript debugging line was throwing an error
* Small fix to new html elements and their styling on the page

= 5.1 =
* verified compatibility with Wordpress 5.4
* Bugfix: uninstall was not taking into account the newer ajax requests and could have prevented the plugin from being uninstalled
* Updated translations

= 5.0 =
* verified compatibility with Wordpress 5.3.2
* added option for Google Fonts API key

= 4.9 =
* Bugfix: corrected evaluation of shortcode parameters for correct implementation of versions and popup functionality
* verified compatibility with Wordpress 4.9

= 4.8 =
* Enhancement: added "popup" parameter to shortcode, to allow hiding the contents of the bible quote and show it only on click in a popup

= 4.7 =
* Minor bugfix: the jQuery Fontselect dropdown was not always opening in correspondance with the last selected font
* Minor bugfix: the jQuery Fontselect plugin was not processing italic or bold styled fonts
* Bugfix: typo in a PHP variable was causing an error 

= 4.6 =
* Enhancement: freely modified and implemented the jQuery Fontselect plugin by Tom Moor with it's hardcoded list of Google WebFonts to accomodate both regular websafe fonts and google fonts 

= 4.5 =
* Enhancement: further check for incorrect server environments where a recent version of curl does not however have a correct cainfo path set with a certificate bundle
* Enhancement: font-family selection now previews the font itself in the dropdown

= 4.4 =
* Compatibility with Wordpress 4.8
* Minor bugfix: fixed defaults for Bible version indicator styling settings in customizer

= 4.3 =
* Enhancement: add newline before verse number of specific formatted poetic verses in the NABRE version
* Enhancement: add option in the Wordpress Customizer for styling the Version Indicator
* Enhancement: re-organize styling options in the customizer into subsections

= 4.2 =
* Added check for compatibility of curl and openssl version on each website's server with TLS v1.2 protocol for secure communications,
  also in the case of metadata updates when refreshing server data from the BibleGet server

= 4.1 =
* Added check for compatibility of curl and openssl version on each website's server with TLS v1.2 protocol for secure communications;
  if not compatible fall back to http request when fetching bible verses, otherwise https request to the BibleGet server will be made
* Added ajax spinner for better user feedback when renewing metadata from the BibleGet server

= 4.0 =
* Another bugfix, the fix that made the spacing better between verse number and verse text was also removing the specific formatting for the NABRE text 

= 3.9 =
* Remove leftover dependencies on external jquery-ui

= 3.8 =
* Fix Portuguese language translation after 3.6

= 3.7 =
* Fix main language translations after 3.6 overhaul (Italian, French, Spanish, German)

= 3.6 =
* Complete overhaul of the style settings to use the Wordpress customizer
* Fix bug that prevented the favourite versions option from being used when "versions" option not used in shortcode
* Change internal function names to be more specific, avoiding any possible conflicts with other plugins 
* Better rendering of spacing in Bible Book names and between verse numbers and verse text
* Update language files

= 3.5 =
* Fix possible vulnerability in the script that saves the custom css file

= 3.4 =
* Better error handling: server errors from the BibleGet server will only be shown in backend notifications, and will not be saved in any transients. (this update is thanks to user feedback from Mr. D.N., user feedback is very helpful!)

= 3.3 =
* Fix languages array's German translation

= 3.2 =
* Further enhancements on CSS styling, especially for the NABRE text
* Added a few more localized button images
* Small bugfix in url-encoding of parameters

= 3.1 =
* Further enhancements on CSS styling, especially for the NABRE text

= 3.0 =
* Updated for compatibility with Wordpress 4.3
* Added Greek translation thanks to a user contribution on the translation project website
* Added French and German translations using automatic translation tools with a minimum quality check (probably can be made better)
* Enhancement: cache query results locally for 24 hours using the Wordpress Transients API
* Bugfix: some code that was used for debugging in the testing process, and that created a debug file 'debug.txt', had not been commented out, and debug.txt file was ending up in the current theme folder (can be deleted if present!)
* A few enhancements on CSS styling, especially for the now released NABRE text  

= 2.9 =
* Updated for compatibility with latest Wordpress 4.2.2
* Fixed small bug in css file

= 2.8 =
* Added specific functionality for parsing NABRE text and applying NABRE specific styles

= 2.7 =
* Added Polish translation thanks to Ula Gnatowska <ula.gnatowska@gmail.com> [Community of the Beatitudes](http://beatitudini.it/ "community of the beatitudes")

= 2.6 =
* Minor bugfix undeclared variable on options page
* Added Serbian translation thanks to Ogi Djuraskovic <ognjend@firstsiteguide.com> [firstsiteguide](http://firstsiteguide.com "firstsiteguide") 

= 2.5 =
* Bugfix for older versions of PHP that require a third parameter in preg_match_all

= 2.4 =
* Bugfix for older versions of PHP that don't seem to work correctly with mb_substr
* Initialize default values for when options haven't been set yet

= 2.3 =
* Bugfix for versions of PHP < 5.4 that don't support short array syntax

= 2.2 =
* Bugfix for jquery-ui dependencies on certain Wordpress installations

= 2.1 =
* Fix missing images that weren't included correctly in 2.0 release

= 2.0 =
* Major version release
* Use the new engine of the BibleGet I/O service, which supports multiple versions, dynamic indexes, multiple languages both western and eastern
* Store locally the index information for the versions, for local integrity checks on the queries
* Better and more complete local integrity checks on the queries, using the index information for the versions and supporting both western and eastern languages
* Better and more complete interface for the settings page

= 1.5 =
* Compatible with Wordpress 4.0 "Benny"
* Added local checks for the validity and integrity of the queries
* Corrected a bug that created an error on preg_match_all for versions of PHP < 5.4
* Use the new and definitive domain for the BibleGet I/O service https://query.bibleget.io

= 1.4 =
* Corrected a bug that created an error when the server has safe_mode or open_basedir set (such as some servers with shared hosting)

= 1.3 =
* trying to figure out the update process...

= 1.2 =
* trying to figure out the update process...

= 1.1 =
* Corrected a bug that created an error when there is a space in the query

= 1.0 =
* Plugin created


== Upgrade Notice ==

= 6.4 =
Versions prior to 5.9 must be updated to maintain compatibility with the BibleGet endpoint

= 6.3 =
Versions prior to 5.9 must be updated to maintain compatibility with the BibleGet endpoint

= 6.2 =
Versions prior to 5.9 must be updated to maintain compatibility with the BibleGet endpoint

= 6.1 =
Versions prior to 5.9 must be updated to maintain compatibility with the BibleGet endpoint

= 6.0 =
Versions prior to 5.9 must be updated to maintain compatibility with the BibleGet endpoint

= 5.9 =
Must update to maintain compatibility with the BibleGet endpoint

= 5.8 =
Versions prior to 5.1 must be updated. v5.4 adds a Gutenberg block

= 5.7 =
Versions prior to 5.1 must be updated. v5.4 adds a Gutenberg block

= 5.6 =
Versions prior to 5.1 must be updated. v5.4 adds a Gutenberg block

= 5.5 =
Versions prior to 5.1 must be updated. v5.4 adds a Gutenberg block

= 5.4 =
Versions prior to 5.1 must be updated. v5.4 adds a Gutenberg block

= 5.3 =
Versions prior to 5.1 must be updated. v5.3 brings a better interface and admin controls for the Google Fonts API

= 5.2 =
Versions prior to 3.6 must be updated. v5.2 verifies compatibility with Wordpress 5.4 and fixes a bug that was preventing a correct uninstallation of the plugin

= 5.1 =
Versions prior to 3.6 must be updated. v5.1 verifies compatibility with Wordpress 5.4 and fixes a bug that was preventing a correct uninstallation of the plugin

= 5.0 =
Versions prior to 3.6 must be updated. v5.0 verifies compatibility with Wordpress 5.3.2 and adds Google Fonts API option

= 4.9 =
Versions prior to 3.6 must be updated. v4.9 corrects evaluation of shortcode parameters for correct implementation of "popup" parameter functionality

= 4.8 =
Versions prior to 3.6 must be updated. v4.8 adds a parameter "popup" to the [bibleget] shortcode, to allow hiding the contents of the bible quote and show it only on click in a popup

= 4.7 =
Versions prior to 3.6 must be updated. v4.7 has a couple of minor bugfixes on the jQuery Fontselect plugin

= 4.6 =
Versions prior to 3.6 must be updated. v4.6 incorporates hard-coded list of Google WebFonts.

= 4.5 =
Versions prior to 3.6 must be updated, style settings now using Wordpress Customizer. 4.5 presents a couple of small enhancements from 4.4

= 4.4 =
Versions prior to 3.6 must be updated, style settings now using Wordpress Customizer. 4.4 presents compatibility with Wordpress 4.8

= 4.3 =
Versions prior to 3.6 must be updated, style settings now using Wordpress Customizer. 4.3 presents enhancements in text formatting and styling options

= 4.2 =
Versions prior to 3.6 must be updated, style settings now using Wordpress Customizer. 4.2 adds another ssl compatibility check.

= 4.1 =
Versions prior to 3.6 must be updated, style settings now using Wordpress Customizer. 4.1 adds ajax spinner and ssl compatibility check.

= 4.0 =
Complete overhaul porting the style settings from the Settings Page to the Wordpress Customizer since 3.6 plus bugfixes

= 3.9 =
Please update, complete overhaul of style settings now using Wordpress Customizer and other bugfixes

= 3.8 =
While 3.6 was a Major update with complete overhaul of style settings and other bugfixes, this update fixes some language translations

= 3.7 =
While 3.6 was a Major update with complete overhaul of style settings and other bugfixes, this update fixes some language translations

= 3.6 =
Major update with complete overhaul of style settings and other bugfixes, update is mandatory

= 3.5 =
This is a minor update with a bugfix for a possible vulnerability

= 3.4 =
Minor update with better error handling, errors from the bibleget server will only show in backend

= 3.3 =
Minor update with bugfix for incorrect entries in languages array for German language

= 3.2 =
Minor update with further CSS styling enhancements especially for the NABRE text plus small bugfix

= 3.1 =
This is a minor update from v3.0 with CSS styling enhancements especially for the NABRE text

= 3.0 =
Bugfixes (please read changelog), compatibility with Wordpress 4.3, caching enhancements

= 2.9 =
Minor update for compatibility with Wordpres 4.2.2

= 2.8 =
Added Serbian and Polish translations, added specific functionality for parsing NABRE text and applying NABRE specific styles.

= 2.7 =
Added Serbian and Polish translations.

= 2.6 =
Minor bugfix from version 2.5, added Serbian translation.

= 2.5 =
v2.0 is a major release which uses the new and upgraded BibleGet I/O service engine. Must update. (plus Bugfixes)

= 2.4 =
v2.0 is a major release which uses the new and upgraded BibleGet I/O service engine. Must update. (plus Bugfixes)

= 2.3 =
v2.0 is a major release which uses the new and upgraded BibleGet I/O service engine. Must update. (plus Bugfixes)

= 2.2 =
v2.0 is a major release which uses the new and upgraded BibleGet I/O service engine. Must update.

= 2.1 =
v2.0 is a major release which uses the new and upgraded BibleGet I/O service engine. Must update.

= 2.0 =
v2.0 is a major release which uses the new and upgraded BibleGet I/O service engine. Must update.

= 1.5 =
Si prega aggiornare alla versione 1.5, compatibile con Wordpress 4.0.

= 1.4 =
Si prega effettuare l'upgrade alla versione 1.4 che corregge un paio di bug (errori con server che hanno il safe_mode attivato oppure la direttiva open_basedir settata).

= 1.3 =

= 1.2 =

= 1.1 =
Si prega effettuare l'upgrade alla versione 1.1 che corregge un paio di bug (errori con gli spazi bianchi).

= 1.0 =
Versione iniziale, non pienamente testato.