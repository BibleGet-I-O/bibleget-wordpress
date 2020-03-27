=== BibleGet I/O ===
Contributors: Lwangaman
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HDS7XQKGFHJ58
Tags: bible,shortcode,quote,citation,verses
Requires at least: 3.3
Tested up to: 5.3.2
Stable tag: 5.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Creates a shortcode [bibleget] that you can use to insert Bible quotes in articles or pages; uses the BibleGet I/O Service endpoint https://query.bibleget.io

== Description ==

Creates a shortcode [bibleget] that you can use to insert Bible quotes in articles or pages from different versions of the Bible in different languages.
The text of the Bible quotes are retrieved from the BibleGet service endpoint *[https://query.bibleget.io](https://query.bibleget.io "BibleGet Service endpoint")*.
**USAGE:** [bibleget query="Exodus 19:5-6,8;20:1-17" version="CEI2008"] 
**USAGE:** [bibleget query="Matthew 1:1-10,12-15" versions="NVBSE,NABRE"] 

It is also possible to place the desired Bible verse quote in the contents of the shortcode, like so:
**USAGE:** [bibleget version="NABRE"]John 3:16;1 John 4,7-8[/bibleget] 

The Plugin also has a settings page “BibleGet I/O” under the “Settings” area in the Dashboard, 
where you can choose your preferred Bible versions from those available on the BibleGet server
so that you don’t have to use the “version” or “versions” option every time. 
After you have made your choices in the settings area, remember to click on “Save”!
Once the preferred version is set you can simply use:
**USAGE:** [bibleget query=“1 Cor 13”] 

The style settings are customizable using the Wordpress Customizer, 
so that the injected Bible quotes may fit into the style of your own blog / WordPress website.
_________
THE AUTHOR WOULD LIKE TO THANK THE FOLLOWING USERS FOR CONTRIBUTED TRANSLATIONS:

SERBIAN TRANSLATION: Ogi Djuraskovic <ognjend@firstsiteguide.com> WEBSITE: [firstsiteguide](http://firstsiteguide.com "firstsiteguide")

POLISH TRANSLATION: Ula Gnatowska <ula.gnatowska@gmail.com> WEBSITE: [comunità delle beatitudini](http://beatitudini.it/ "comunità delle beatitudini")

GREEK TRANSLATION: anonymous user contribution

[BibleGet Project Website](https://www.bibleget.io/ "BibleGet Project Website")
[BibleGet Project Facebook Page](https://www.facebook.com/BibleGetIO/ "BibleGet Project Facebook Page")
[BibleGet Project Google+ Page](https://plus.google.com/+BibleGetIO "BibleGet Project Google+ Page")
[BibleGet Twitter Profile](https://twitter.com/biblegetio "@BibleGetIO")

== Installation ==

1. Upload the `bibleget-io` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress

== Frequently Asked Questions ==

= How do I formulate a Bible citation? =
[ENGLISH]
The query parameter must contain a citation that is formulated following the standard notation for Bible citations (see [Bible citation notation](http://en.wikipedia.org/wiki/Bible_citation "http://en.wikipedia.org/wiki/Bible_citation")):
   * “:”: is the chapter – verse separator. “15:5” means “chapter 15, verse 5”.

   * “-”: is the from – to separator, and it can be used in one of three ways:

      1. from chapter to chapter: “15-16″ means “from chapter 15 to chapter 16”.
      2. from chapter,verse to verse (of the same chapter): “15:1-5” means “chapter 15, from verse 1 to verse 5”.
      3. from chapter,verse to chapter,verse “15:1-16:5” means “from chapter 15,verse 1 to chapter 16,verse 5”.

   * “,”: is the separator between one verse and another. “15:5,7,9” means “chapter 15,verse 5 then verse 7 then verse 9”.

   * “;”: is the separator between one query and another. “15:5-7;16:3-9,11-13” means “chapter 15, verses 5 to 7; then chapter 16, verses 3 to 9 and verses 11 to 13”.

At least the first query (of a series of queries chained by a semi-colon) must indicate the name of the book upon which to make the request;
 the name of the book can be written in full in more than 20 different languages, or written using the abbreviated form.
 See the page [Lista di Abbreviazioni di Libri](http://www.bibleget.io/come-funziona/lista-abbreviazioni-libri/ "Lista di Abbreviazioni di Libri").
 When a query following a semi-colon does not indicate the book name, it is intended that the request be made upon the same book as the previous query.
 So “Gen1:7-9;4:4-5;Ex3:19” means “Genesis chapter 1, verses 7 to 9; then again Genesis chapter 4, verses 4 to 5; then Exodus chapter 3, verse 19”.

= What happens if I add a Google Fonts API key? =
[ENGLISH]
If you add a Google Fonts API key, the BibleGet plugin will immediately test it's validity.
If valid, it will remember that you have a key and that it's valid for 3 months.
Every three months starting from this moment the BibleGet plugin will talk with the Google Fonts API
to get the latest list of available Google Fonts, and will download to the plugin folders a local compressed
copy of each of those fonts for the purpose of previewing them in the customizer interface.
You will need to be a bit patient the first time as it will take a couple minutes to complete the download process.
A progress bar will let you know how the download is progressing. If you have a slow connection,
the progress might stall for a few seconds every now an then (around 25%, 50%, and 75%), 
just be patient and it should continue to progress to the end. In the future, whenever the plugin
talks with the Google Fonts API, the process should go a lot faster as it will only need to download new fonts. 
It will also generate a css file that will load the preview of the fonts when you open the customizer interface.
This does have a bit of a performance impact, and especially the first time you open the customizer it might take a minute to load.
After this it should go a little faster as the fonts previews should be cached by the browser.
If you are not happy with the performance impact, I would suggest to delete the Google Fonts API key.

= I have added the Google Fonts API key but the list of available fonts isn't updated =
[ENGLISH]
The BibleGet plugin will remember that your key is valid for 3 months. 
This means that it will not fetch the list of fonts from the Google Fonts API until the relative transient expires.
If a new font has come out that you would like to see and use in the customizer interface for the BibleGet plugin,
and you don't want to have to wait until the transient expires in that 3 month time slot, then you could use a transient manager
to look for a transient which has a value of "SUCCESS" and a long key of seemingly random characters;
this is most probably the one you need to delete. Once the transient is deleted, go back to the admin interface for the BibleGet plugin
and it will automatically start talking with the Google Fonts API again. The newer fonts previews should be downloaded locally
and become available in the customizer interface for the BibleGet plugin.

== Screenshots ==

1. A Bible Quote produced from usage of the shortcode in an article (screenshot-1.png).
2. Options page - font and style settings (screenshot-2.png).
3. Options page - edit the CSS stylesheet directly (screenshot-3.png).
4. Options page - information from the BibleGet server about available versions and supported languages (screenshot-4.png).

== Changelog ==

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