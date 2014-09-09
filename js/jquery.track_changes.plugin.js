/*!
 * jQuery TrackChanges - A Track Changes like MS Word Plugin
 *
 * The MIT License
 *
 * @author  : Angel Baev
 * @version : 0.9.1
 *
 */

(function($) {

	$.fn.TrackChanges = function( options ) {
    
		var settings = $.extend({
			ins_color     : '#E6FFE6',
			del_color     : '#FFE6E6',
			fontStyle     : null,
			complete	    : null
		}, options);

    var self = this;
    
    this.escape = function (s) {
      var n = s;
       /*
      n = n.replace(/&/g, "&amp;");
      n = n.replace(/</g, "&lt;");
      n = n.replace(/>/g, "&gt;");
      n = n.replace(/"/g, "&quot;");
       */
      return n;
    };
    
    this.diffString = function ( o , n ) {
      o = o.replace(/\s+$/, '');
      n = n.replace(/\s+$/, '');
      
    
      var out = this.diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );
      var str = "";
    
      var oSpace = o.match(/\s+/g);
      if (oSpace == null) {
        oSpace = ["\n"];
      } else {
        oSpace.push("\n");
      }
      var nSpace = n.match(/\s+/g);
      if (nSpace == null) {
        nSpace = ["\n"];
      } else {
        nSpace.push("\n");
      }
      
      if (out.n.length == 0) {
          
          for (var i = 0; i < out.o.length; i++) {
            str += '<del><span style="background-color: '+settings.del_color+';">' + this.escape(out.o[i]) + oSpace[i] + "</span></del>";
          }
      } else {
        if (out.n[0].text == null) {
          for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
            str += '<del><span style="background-color: '+settings.del_color+';">' + this.escape(out.o[n]) + oSpace[n] + "</span></del>";
          }
        }
    
        for ( var i = 0; i < out.n.length; i++ ) {
          if (out.n[i].text == null) {
            str += '<ins><span style="background-color: '+settings.ins_color+';">' + this.escape(out.n[i]) + nSpace[i] + "</span></ins>";
          } else {
            var pre = "";
    
            for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++ ) {
              pre += '<del><span style="background-color: '+settings.del_color+';">' + this.escape(out.o[n]) + oSpace[n] + "</span></del>";
            }
            str += " " + out.n[i].text + nSpace[i] + pre;
          }
        }
      }
      
      return str;   
    };

    this.diff = function ( o, n ) {
        var ns = new Object();
        var os = new Object();
        
        for ( var i = 0; i < n.length; i++ ) {
          if ( ns[ n[i] ] == null )
            ns[ n[i] ] = { rows: new Array(), o: null };
          ns[ n[i] ].rows.push( i );
        }
        
        for ( var i = 0; i < o.length; i++ ) {
          if ( os[ o[i] ] == null )
            os[ o[i] ] = { rows: new Array(), n: null };
          os[ o[i] ].rows.push( i );
        }
        
        for ( var i in ns ) {
          if ( ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1 ) {
            n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
            o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
          }
        }
        
        for ( var i = 0; i < n.length - 1; i++ ) {
          if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && 
               n[i+1] == o[ n[i].row + 1 ] ) {
            n[i+1] = { text: n[i+1], row: n[i].row + 1 };
            o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
          }
        }
        
        for ( var i = n.length - 1; i > 0; i-- ) {
          if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && 
               n[i-1] == o[ n[i].row - 1 ] ) {
            n[i-1] = { text: n[i-1], row: n[i].row - 1 };
            o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
          }
        }
        
        return { o: o, n: n };
    };
    
    this.random_color = function() {
      return "rgb(" + (Math.random() * 100) + "%, " + 
                      (Math.random() * 100) + "%, " + 
                      (Math.random() * 100) + "%)";
    }
    
		return this.each( function() {
      if($(this).is('input[type=\'text\']') || $(this).is('textarea')) {
        var input_field =   $(this);

  			if ( $.isFunction( settings.complete ) ) {
  				settings.complete.call(this);
  			}

        $(this).after('<div id="txt_mode_'+this.name+'" style="'+$(this).attr('style')+'" contenteditable="true">'+this.value+'</div>');
        $(this).css({'opacity':0, 'display':'none'});
        
        
        var html_edit_mode_field = $('div[id=\'txt_mode_'+this.name+'\']');
        html_edit_mode_field.css({'border':'1px #333 solid', width: ($(this).width()+4)+'px', height: ($(this).height()+4)+'px'});


         html_edit_mode_field.bind('keypress', function(e){
            var keycode =  e.keyCode ? e.keyCode : e.which;
            if ($(input_field).is('input[type=\'text\']')) {
              if(keycode == 13) return false;
            }
         });
         
        html_edit_mode_field.bind('blur', function(e){
          var keycode =  e.keyCode ? e.keyCode : e.which;
          var org_text = input_field.val();
          if (org_text.length > 0 ) {
            $(this).find('del').remove();
            var editor_text = $(this).text();
            var diff_text = self.diffString(org_text, editor_text);
            $(this).html(diff_text);
          }
        });
        
        
        
      } else {
        return false;
      }
     
		});

	};

}(jQuery));
