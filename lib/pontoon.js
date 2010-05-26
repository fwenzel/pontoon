var Entity = function(pc) {
  var _client = pc;
  this.string=null;
  this.txtString=null;
  this.txtTranslation=null;
  this.translation=null;
  this.node=null;
  this.ui=null;
  this.id=null;
}

Entity.prototype = {
  '_client': null,
  'string': null,
  'txtString': null,
  'translation': null,
  'txtTranslation':null,
  'node': null,
  'ui': null,
  'id': null,
  
  hover: function() {
    this.node.get()[0].showToolbar();
    this.ui.toggleClass('hovered');
  },
  unhover: function() {
    this.node.get()[0].hideToolbar();
    this.ui.toggleClass('hovered');
  }
}

var PontoonService = function() {
}

PontoonService.prototype = {
  url: 'http://127.0.0.1:8000/push/',
  send: function(pc) {
    var project = ('project' in pc._meta)?pc._meta['project']:pc._doc.location.href;
    var url = ('url' in pc._meta)?pc._meta['url']:'http://127.0.0.1:8000/push/';
    var lang = $(pc._ptn).find('input').val();

    var data = { 'id': Array(), 
                 'value': Array(),
                 'project': project,
                 'locale': lang}
    var entities = Array();

    for(var i in pc._entities) {
      var entity = pc._entities[i];
      var trans = entity.translation?entity.translation:entity.string
      entities.push({'id':entity.string,'value':trans})
    }
    for (i in entities) {
      data['id'].push(entities[i].id)
      if (entities[i].id==entities[i].value)
        data['value'].push("")
      else
        data['value'].push(entities[i].value)
    }
    $.ajaxSettings.traditional = true;
    $.post(url, data, null, "text");
  },
}

var PontoonUI = function() {}

PontoonUI.prototype = {
}

var Pontoon = {
  _clients: [],
  service: new PontoonService(),
  client: function(doc, ptn) {
    if (!doc)
      throw "Document handler required";
    this._doc = doc;
    this._ptn = ptn;
    this._entities = [];
    this._meta = {};
    this._enchanted = null;

	var meta = $(doc).find('head > meta[name=Pontoon]');
	if (meta.attr('content'))
	  this._meta['project'] = meta.attr('content');
	var meta = $(doc).find('head > meta[name=Pontoon]');
	if (meta.attr('ip'))
	  this._meta['url'] = meta.attr('ip');
    Pontoon._clients.push(this);
  },
}

function trim(str) {
  return str.replace(/^\s+|\s+$/g, '')
}

Pontoon.client.prototype = {
  _doc: null,
  _ptn: null,
  _entities: null,
  _meta: {},
  _enchanted: null,

  /**
   * determine if the current page is "pontoon-enchanted"
   */ 
  isEnchanted: function() {
	if (this._enchanted == null) {
      var meta = $(this._doc).find('head > meta[name=Pontoon]');
      this._enchanted = (meta.size() > 0);
    }
    return this._enchanted;
  },

  /**
   * enables document editing
   */ 
  enableEditing: function() {
    var ss = $.create('link', {'attributes': {'rel': 'stylesheet',
                                              'type': 'text/css',
                                              'media': 'screen',
                                              'href': 'http://pontoon.haskwhal/client/www/css/editable.css'},
                              'root': this._doc});
    $('head', this._doc).append(ss);
    this.extractEntities();
    for (var i in this._entities) {
      this._entities[i].node.editableText();
    }
  },

  /**
   * disables document editing
   */ 
  disableEditing: function() {
	$(this._doc).find('link').each(function() {
	  if ($(this).attr('href') == 'http://pontoon.haskwhal/client/www/css/editable.css') {
		$(this).remove();	
	  }
	});
    for (var i in this._entities) {
      this._entities[i].node.disableEditableText();
    }
	$(this._doc).find('.editableToolbar').remove();
  },

  /**
   * extracts entities from the document
   */ 
  extractEntities: function(node) {
	if (this.isEnchanted())
      return this.extractEntitiesWithSpan(node);
    return this.extractEntitiesWithGuessing(node);
  },

  /**
   * extracts entities from the document
   */ 
  extractEntitiesWithSpan: function(node) {
	  // make list of translatable items
      if (!node)
        var node = $(this._doc.body);
	  var translatable = $(node).find('span.l10n');
	  var self=this;
	  translatable.each(function() {
        var entity = new Entity(self);
        entity.node = $(this)
        entity.string = $(this).html().toString()
        entity.txtString = $(this).text().toString()
	    entity.id = /md5_([a-zA-Z0-9]+)/.exec($(this).attr('class'))[1];
        self._entities.push(entity);
	  });
  },

  /**
   * extracts entities from the document
   */ 
  extractEntitiesWithGuessing: function(node) {
    if (!node)
      var node = $(this._doc.body);
    var self=this;
    var nodeNames = ['P','H1','H2','LI','SPAN','A']
    node.children().each(function() {
      if (this.nodeType == 3) { // text
        //if (trim(this.textContent))
        //alert(this.nodeValue);
      } else {
        var isInline = false;
        for (var i in nodeNames)
          if(nodeNames[i]==this.nodeName) {
            isInline = true;
            var entity = new Entity(self);
            entity.node = $(this)
            entity.string = $(this).html().toString()
            entity.txtString = $(this).text().toString()
            if (!trim(entity.txtString))
                break;
            self._entities.push(entity);
          }
        if(!isInline)
          self.extractEntities($(this));
      }
    });
  },

  send: function() {
    Pontoon.service.send(this);
  },
}