webpackJsonp([1],{78:function(e,t,o){"use strict";function n(e){var t=e.type||"popup";return delete e.type,"modal"===t?new i.TVModal(e):new l.TVPopup(e)}var i,l;Object.defineProperty(t,"__esModule",{value:!0}),t.createDialog=n,i=o(368),l=o(959)},959:function(e,t,o){"use strict";var n;Object.defineProperty(t,"__esModule",{value:!0}),n=o(960),o.n(n),o.o(n,"TVPopup")&&o.d(t,"TVPopup",function(){return n.TVPopup})},960:function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e){var t,o;if(e&&e.__esModule)return e;if(t={},null!=e)for(o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t.default=e,t}function l(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a,c,u,p,h,d,f,g,v,b,w,y,_;Object.defineProperty(t,"__esModule",{value:!0}),t.TVPopup=void 0,a=Object.assign||function(e){var t,o,n;for(t=1;t<arguments.length;t++){o=arguments[t];for(n in o)Object.prototype.hasOwnProperty.call(o,n)&&(e[n]=o[n])}return e},c=function(){function e(e,t){var o,n;for(o=0;o<t.length;o++)n=t[o],n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}return function(t,o,n){return o&&e(t.prototype,o),n&&e(t,n),t}}(),u=o(77),p=i(u),h=o(221),d=n(h),f=o(222),g=o(148),v=o(220),b=$("body"),w=$(window),y={closeOnClickAtOtherDialogs:!0,draggable:!0,scrollWrap:'<div class="tv-dialog__scroll-wrap">',scrollWrapInner:'<div class="tv-dialog__scroll-wrap-inner">',withScroll:!0},_="js-dialog__scroll-wrap",t.TVPopup=function(e){function t(){var e,o=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return l(this,t),e=r(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,a({},y,o))),e.$scrollWrap=e.$content.hasClass(_)?e.$content:e.$content.find("."+_),e.$scrollWrap.length?e.$scrollWrapInner=e.$scrollWrap.children().first():(e.$scrollWrap=e.$content.wrap($(e.options.scrollWrap)).parent(),e.$scrollWrapInner=e.$content.wrap($(e.options.scrollWrapInner)).parent()),e.$actions&&e.$scrollWrap.addClass("i-with-actions"),e.options.withScroll&&(e.scroll=new g.SidebarCustomScroll(e.$scrollWrap,e.$scrollWrapInner),e.scroll.scrolled.subscribe(null,function(){return e.trigger("scroll")})),e.$scrollWrap.css("overflow",""),e.$el.addClass("tv-dialog--popup i-closed i-hidden"),e.options.width&&e.$el.css({width:"calc(100% - 20px)","max-width":e.options.width}),e.$el.on("mousedown touchstart",e.toTop.bind(e)),e.options.closeOnOutsideClick&&(e.on("beforeOpen",function(){setTimeout(function(){e.opened&&$(document).on("click.tv-popup-"+e.id,function(t){
var o=$(t.target).closest(".js-dialog");(e.options.closeOnClickAtOtherDialogs||0===o.length)&&e.isEventOut(t)&&e.close()})},0)}),e.on("beforeClose",function(){return $(document).off("click.tv-popup-"+e.id)})),e.on("change:zIndex",function(){e.$el.css("z-index",e.zIndex)}),e.on("destroy",function(){var t=function(){e.$el.remove()};e.opened?(e.close(),setTimeout(t,p.dur/2)):t()}),e}return s(t,e),c(t,[{key:"open",value:function(){var e=this;return this.opened?this:(this.opened=!0,this.trigger("beforeOpen",[this]),this.$el.appendTo(this.options.$wrap).removeClass("i-hidden").css(function(){var t,o,n,i,l;return e.calcHeight(),t=w.height(),o=w.width(),n=e.$el.height(),i=e.$el.width(),l=e.options.position,l||(l={top:t/2-n/2,left:o/2-i/2}),l.top>t-n&&(l.top=t-n),l.left>o-i&&(l.left=o-i),l}()),this.focus(),this.toTop(),this._doOpenAnimation().then(function(){e.opened&&(e.$el.removeClass("i-closed"),e.options.draggable&&((0,v.lazyJqueryUI)(e.$el).draggable({handle:".js-dialog__drag",cancel:"input, textarea, button, select, option, .js-dialog__no-drag, .js-dialog__close",containment:"window",cursor:"-webkit-grabbing"}),e.$el.find(".js-dialog__drag").addClass("tv-dialog__grab")),e.trigger("afterOpen",[e]))}),w.on("resize.tv-popup-"+this.id,function(){e.calcHeight(),e.fixPos()}),this)}},{key:"close",value:function(){var e=this;if(this.opened)return this.trigger("beforeClose",[this]),this.$el.addClass("i-closed"),this.opened=!1,this._doCloseAnimation().then(function(){e.opened||((0,v.lazyJqueryUI)(e.$el).draggable("instance").then(function(e){e&&e.destroy()}),e.$el.addClass("i-hidden").detach(),b.css("cursor","auto"),e.trigger("afterClose",[e]),e.options.destroyOnClose&&e.destroy())}),w.off("resize.tv-popup-"+this.id),this}},{key:"hide",value:function(){this.$el.addClass("i-hidden")}},{key:"show",value:function(){this.$el.removeClass("i-hidden")}},{key:"fixPos",value:function(){var e=this.$el[0].getBoundingClientRect(),t={};e.bottom>d.default.height-10&&(t.top=d.default.height-10-e.height,t.top<10&&(t.top=10)),e.right>d.default.width-10&&(t.left=d.default.width-10-e.width,t.left<10&&(t.left=10)),(t.top||t.left)&&this.$el.css(t)}},{key:"calcHeight",value:function(){var e,t,o=this.$el[0].getBoundingClientRect(),n=this.$scrollWrapInner[0].getBoundingClientRect(),i=this.$scrollWrap[0].getBoundingClientRect(),l=this.options.height&&this.options.height<d.default.height-20?this.options.height:d.default.height-20;this.$scrollWrap.css({height:""}).removeClass("i-scrollable"),e=this.$el[0].getBoundingClientRect(),(this.options.height||e.height>l)&&(l-=o.height-i.height,l<60&&(l=60),this.$scrollWrap.css({height:l})),this.options.withScroll&&this.scroll.resize(),t=l<n.height,t||this.$scrollWrapInner.css("top",0),this.$scrollWrap.toggleClass("i-scrollable",t),this.$actions&&this.$actions.toggleClass("tv-dialog__section--actions_with-border",t)}},{key:"updateScroll",value:function(){this.scroll&&(this.scroll.updateScroll(),this.scroll.updateScrollBar())}},{key:"scrollToStart",value:function(){this.scroll&&this.scroll.scrollToStart()}},{
key:"_doOpenAnimation",value:function(){return Promise.resolve()}},{key:"_doCloseAnimation",value:function(){return Promise.resolve()}}]),t}(f.TVDialogAbstract)}});