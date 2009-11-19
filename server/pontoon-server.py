#!/usr/bin/env python
# coding=utf-8

import ConfigParser
import getopt
import md5
import os.path
import os
import sys

import web
try:
    import sqlite3
except:
    from pysqlite2 import dbapi2 as sqlite3

try:
    import silme.core
    import silme.format
    import silme.io
    silme.format.Manager.register('gettext')
except:
    raise


__autor__ = 'Frederic Wenzel <fwenzel@mozilla.com>'
__license__ = """
***** BEGIN LICENSE BLOCK *****
Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this file are subject to the Mozilla Public License Version
1.1 (the "License"); you may not use this file except in compliance with
the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is Pontoon.

The Initial Developer of the Original Code is
Frederic Wenzel <fwenzel@mozilla.com>.
Portions created by the Initial Developer are Copyright (C) 2009
the Initial Developer. All Rights Reserved.

Contributor(s):

Alternatively, the contents of this file may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this file only
under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this file under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the GPL or the LGPL. If you do not delete
the provisions above, a recipient may use your version of this file under
the terms of any one of the MPL, the GPL or the LGPL.

***** END LICENSE BLOCK *****

"""

# initialize web.py
urls = (
    '/', 'stats',
    '/push', 'push',
)
app = web.application(urls, globals())
render = web.template.render('templates/')

# read configs
cfg = ConfigParser.SafeConfigParser()
cfg_found = cfg.read(['pontoon.cfg', 'default.cfg'])
if not cfg_found:
    raise IOError('No config files found')

# open db
dbpath = cfg.get('default', 'db')
newdb = not os.path.exists(dbpath)
db = sqlite3.connect(dbpath)
cursor = db.cursor()
if newdb:
    for line in open('sql/pontoon.sql', 'r').readlines():
        cursor.execute(line)

# web.py controllers
class stats:
    """display public stats"""
    def GET(self):
        return render.stats()

class push:
    """receive localization"""
    def POST(self):
        input=web.input(id=[], value=[])
        lang = input.locale
        project_path = cfg.get('default', 'projects').replace('PROJECT',input.project)
        po_path = cfg.get(input.project, 'pofile').replace('LANG',lang)
        path = os.path.join(project_path, po_path)

        elist = silme.core.EntityList()
        elist.id = 'messages.po'
        
        for i,id in enumerate(input.id):
            entity = silme.core.Entity(input.id[i])
            entity.value = input.value[i] 
            elist.add_entity(entity)
        if not os.path.isdir(path):
            os.makedirs(path)
        ioc = silme.io.Manager.get('file')
        ioc.write_entitylist(elist, path=path,encoding='utf8')
        return 'OK'


def parse_options():
    """parse command line options"""
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hadu:p:",
                                   ['help', 'add', 'delete', 'user=', 'pass='])
    except getopt.GetoptError, err:
        print str(err)
        usage()
        sys.exit(2)

    mode = None
    user = None
    passw = None
    for o, a in opts:
        if o in ('-h', '--help'):
            usage()
            sys.exit()
        elif o in ('-a', '--add'):
            mode = 'add'
        elif o in ('-d', '--delete'):
            mode = 'del'
        elif o in ('-u', '--user'):
            user = a
        elif o in ('-p', '--pass'):
            passw = a
        else:
            assert False, ("unknown option: %s" % o)

    # remove options from arguments not to confuse web.py
    sys.argv = args

    # handle user adding / deletion
    if mode == 'add' and user and passw:
        try:
            cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)',
                        (user, md5.new(passw).hexdigest()))
            db.commit()
        except Exception, e:
            print e
            print "Error creating user %s" % user
            sys.exit(1)
        rowid = cursor.lastrowid
        print "Successfully created user %s with id %s" % (user, rowid)
        return
    elif mode == 'del' and user:
        try:
            cursor.execute('DELETE FROM users WHERE username=?', (user,))
            db.commit()
        except Exception, e:
            print e
            print "Error deleting user %s" % user
            sys.exit(1)
        if cursor.rowcount > 0:
            print "Successfully deleted user %s" % (user)
        else:
            print "User %s did not exist" % (user)
        return

def usage():
    print """
    Pontoon server component
    Usage:
        -h, --help:     show this message
        -a, --add:      add user (together with -u and -p)
        -d, --delete:   delete user (together with -u)
        -u, --user:     user name to add/delete
        -p, --pass:     password for new user
        (no options):   start server mode"""

def main():
    parse_options()
    print "Starting to serve files..."
    app.run()

if __name__ == '__main__':
    main()
