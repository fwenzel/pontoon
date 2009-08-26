/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Pontoon.
 *
 * The Initial Developer of the Original Code is
 * Frederic Wenzel <fwenzel@mozilla.com>.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// imports
jetpack.future.import("slideBar");

// central hooks
addPontoonSlidebar();

// backend functions
/**
 * determine if the current page is "pontoon-enhanced"
 */
function detectPontoon(doc) {
  var $doc = $(doc),
      meta = $doc.find('head > meta[name=Pontoon]');
  return (meta.size() > 0);
}

/**
 * add the main Pontoon slidebar
 */
function addPontoonSlidebar(doc) {
  jetpack.slideBar.append({
    width: 300,
    persist: true,
    autoReload: true,
    onReady: function(slide) {
      jetpack.tabs.onReady(function() {
        var doc = jetpack.tabs.focused.contentDocument;
        if (detectPontoon(doc)) slide.notify();
      });
      jetpack.tabs.onFocus(function() {
        var doc = jetpack.tabs.focused.contentDocument;
        if (!detectPontoon(doc)) slide.close();
      });
    },
    onClick: slidebarContent,
    html: <r><![CDATA[
      <body>
        <h1>Welcome to Pontoon!</h1>
        <p>Click the icon on a page that is Pontoon-enhanced.</p>
      </body>
    ]]></r>
  });
}

/**
 * Calculate the sidebar content based on the current document
 */
function slidebarContent(slide) {
  var ptn = slide.contentDocument,
      $ptn = $(ptn),
      doc = jetpack.tabs.focused.contentDocument,
      $doc = $(doc);
  if (!detectPontoon(doc)) {
    $ptn.find('p').replaceWith('<p>This page cannot be translated with Pontoon.</p>');
    return false;
  }

  $ptn.find('p').replaceWith((<r><![CDATA[
    <p>This is a list of elements that can be translated on this page. Hover any of them 
      to see them highlighted.</p>
    ]]></r>).toString());

  // make list of translatable items
  translatable = $doc.find('span.l10n_start');
  var thelist = $('<ul></ul>');
  $ptn.find('ul').remove();
  translatable.each(function() {
    var that = $(this); // the translatable span
    var li = $('<li></li>');
    var hash = $(this).text();
    li.text(hash);
    thelist.append(li);
  });
  $ptn.find('p').after(thelist);

  thelist.children('li').hover(function() {
    var hash = $(this).text(),
        span = $("span.l10n_start:contains('"+hash+"')", doc),
        spancontent = getSpanContent(hash);

    //jetpack.notifications.show(hash+' matched '+spancontent.size()+' elements');

    spancontent.remove();
    span.after('omg');
  }, function() {});
  
  return true;
}

/**
 * get the content of a l10n_start/end group, no matter if they are text nodes
 * or not
 */
function getSpanContent(hash) {
  var span = $("span.l10n_start:contains('"+hash+"')", jetpack.tabs.focused.contentDocument);
  var filteron = false;
  var spancontent = span.parent().contents().filter(function() {
    if ($(this).is("span.l10n_start:contains('"+hash+"')")) {
      filteron = true;
      return false;
    } else if ($(this).is('span.l10n_end')) {
      filteron = false;
      return false;
    }
    return filteron;
  });
  return spancontent;
}
