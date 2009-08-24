<?php
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
 * The Original Code is PO LiveEdit.
 *
 * The Initial Developer of the Original Code is
 * The Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Frederic Wenzel <fwenzel@mozilla.com> (Original Author)
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

/**
 * Wrapper for gettext(), returns PO-LiveEdit-wrapped, localized strings to
 * be handled by the PO LiveEdit client component
 */
function _w($str) {
    if (!POLiveEdit::has_gettext()) return $str;

    $translated = _($str);
    return POLiveEdit::wrap($translated, $str);
}

/**
 * Wrapper for ngettext()
 * FIXME: This probably does not work yet
 */
function n_w($str1, $str2, $ct) {
    if (!POLiveEdit::has_gettext()) return $str1;

    $translated = ngettext($str1, $str2, $ct);
    return POLiveEdit::wrap($translated, $str1);
}

/**
 * Main target component
 */
class POLiveEdit
{
    /**
     * is gettext installed?
     */
    function has_gettext() {
        return function_exists('gettext');
    }
    
    /**
     * wraps an (already translated) string into PO LiveEdit comments
     */
    function wrap($translated, $msgid) {
        $wrapped = sprintf('<span class="l10n_start">%1$s</span>'
            .'%2$s<span class="l10n_end"> </span>', md5($msgid), $translated);
        return $wrapped;
    }

    /**
     * prints out header tags for the target app's template header, telling
     * the client that this is a PO LiveEdit enhanced page
     */
    function header_tags() {
        // TODO meta tag
        echo '<style type="text/css"><!-- span.l10n_start, span.l10n_end { display:none !important; } --></style>';
    }
}
