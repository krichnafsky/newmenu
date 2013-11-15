/*
 * Audero Unified Placeholders is a very lightweight cross-browser jQuery plugin
 * to emulate the HTML5 placeholder attribute on browsers that don't support it.
 * This placeholder polyfill emulates perfectly the native behavior hiding the
 * placeholders' text on the first input of the user and not on focus.
 * In addition, it allows you to style the placeholders' texts using CSS
 * and to override the browsers' native support (in those who had).
 *
 * Eric added some fixes so that if the form elements all ready have values
 * when the placeholders plugin is initialized that they do not get removed.
 *
 * @author  Aurelio De Rosa <aurelioderosa@gmail.com>
 * @author  Eric R. Glass <ericrglass@gmail.com>
 * @version 1.0.3
 * @link    https://github.com/AurelioDeRosa/Audero-Unified-Placeholders
 * @license Dual licensed under MIT (http://www.opensource.org/licenses/MIT)
 * and GPL-3.0 (http://opensource.org/licenses/GPL-3.0)
 */
(function($) {
   var defaultValues = {
      overrideNative: false,    // boolean. If override browsers native placeholder support.
      className: "",            // string. A class to apply to the selected elements.
      style: {color: "#A9A9A9"} // object. A object containing a set of rules to apply to the selected elements.
                                // The rules in this object will have higher priority among those used
                                // in the class specified using the className property.
   };

   var methods = {
      init: function(options) {
         if (options == null)
            options = {};
         options = $.extend(true, {}, defaultValues, options);

         // If the browser supports the placeholder attribute and the user chooses
         // to not override the native support
         if (("placeholder" in document.createElement("input")) && options.overrideNative === false)
            return;

         return this
            .filter(function() {
               // Filter the elements that haven't a placeholder
               return (typeof $(this).attr("placeholder") !== "undefined");
            })
            .each(function(index, element) {
               var $element = $(element);
               var placeholder = $element.attr("placeholder");
               $element.attr({
                  "data-audero-unp-text": placeholder,
                  "data-audero-unp-typed": "false"
               });

               var initialVal = $element.val();

               // Delete the value so the style will be applied on refresh in Firefox #3
               $element.val("");

               // Remove the real placeholder attribute
               $element.removeAttr("placeholder");

               $element
               .on("focus.auderoUnifiedPlaceholders", function () {
                  var $this = $(this);
                  $this.attr("data-audero-unp-typed", "false");
                  if ($this.val() === placeholder) {
                     $this.addClass(options.className)
                          .css(options.style);
                     if (this.createTextRange) {
                        var part = this.createTextRange();
                        part.move("character", 0);
                        part.select();
                     } else if (this.setSelectionRange)
                        this.setSelectionRange(0, 0);
                  }
               })
               .on("keydown.auderoUnifiedPlaceholders paste.auderoUnifiedPlaceholders", function() {
                  var $this = $(this);
                  if ($this.val() === placeholder && $this.attr("data-audero-unp-typed") === "false") {
                     $this.val("");
                  } else {
                     $this.attr("data-audero-unp-typed", "true");
                  }
                  if ($this.val() !== placeholder) {
                     $this.removeClass(options.className);
                     for(var rule in options.style) {
                        $this.css(rule, "");
                     }
                  }
               })
               .on("keyup.auderoUnifiedPlaceholders", function() {
                  var $this = $(this);
                  if ($this.val() === "") {
                     $this
                     .trigger("blur.auderoUnifiedPlaceholders")
                     .trigger("focus.auderoUnifiedPlaceholders");
                  }
               })
               .on("blur.auderoUnifiedPlaceholders", function () {
                  var $this = $(this);
                  if ($this.val() === "") {
                     $this
                     .attr("data-audero-unp-typed", "false")
                     .val(placeholder)
                     .addClass(options.className)
                     .css(options.style);
                  } else {
                     $this.removeClass(options.className);
                     for(var rule in options.style) {
                        $this.css(rule, "");
                     }
                  }
               });

               $element.blur();

               if ((initialVal.length !== null) && (initialVal.length > 0)) {
                   $element.val(initialVal);
                   $element.blur();
               }
         });
      },
      enable: function() {
          var nativePlaceholderTest = document.createElement("input");
    	  return this.each(function() {
                   var $this = $(this);
                   if (("placeholder" in nativePlaceholderTest)
                		  && ((typeof $this.attr("data-audero-unp-text") === "undefined")
                				  || ($this.attr("data-audero-unp-text") === null)))
                	   return;

                   var placeholder = "";
                   if (typeof $this.attr("placeholder") !== "undefined")
                      placeholder = $this.attr("placeholder");
                   else if (typeof $this.attr("data-audero-unp-text") !== "undefined")
                      placeholder = $this.attr("data-audero-unp-text");
                   else
                      return;

                   if ($this.val() === "")
                      $this.val(placeholder);
               });
      },
      disable: function() {
          var nativePlaceholderTest = document.createElement("input");
    	  return this.each(function() {
                   var $this = $(this);
                   if (("placeholder" in nativePlaceholderTest)
                 		  && ((typeof $this.attr("data-audero-unp-text") === "undefined")
                 				  || ($this.attr("data-audero-unp-text") === null)))
                 	   return;

                   var placeholder = "";
                   if (typeof $this.attr("placeholder") !== "undefined")
                      placeholder = $this.attr("placeholder");
                   else if (typeof $this.attr("data-audero-unp-text") !== "undefined")
                      placeholder = $this.attr("data-audero-unp-text");
                   else
                      return;

                   if ($this.val() === placeholder && $this.attr("data-audero-unp-typed") === "false")
                      $this.val("");
               });
      },
      reset: function() {
          var nativePlaceholderTest = document.createElement("input");
    	  return this.each(function() {
              var $this = $(this);
              if (("placeholder" in nativePlaceholderTest)
            		  && ((typeof $this.attr("data-audero-unp-text") === "undefined")
            				  || ($this.attr("data-audero-unp-text") === null)))
            	   return;

              if ((typeof $this.attr("placeholder") !== "undefined")
            	  || (typeof $this.attr("data-audero-unp-text") !== "undefined"))
           	       return;

        	  $this.val("").trigger("blur.auderoUnifiedPlaceholders");
          });
      },
      destroy: function() {
         var nativePlaceholderTest = document.createElement("input");
         return this.each(function() {
             var $this = $(this);
             if (("placeholder" in nativePlaceholderTest)
           		  && ((typeof $this.attr("data-audero-unp-text") === "undefined")
           				  || ($this.attr("data-audero-unp-text") === null)))
           	   return;

             $this.trigger("keydown.auderoUnifiedPlaceholders");

             if ((typeof $this.attr("data-audero-unp-text") !== "undefined")
	              && (typeof $this.attr("placeholder") === "undefined"))
            	 $this.attr("placeholder", $this.attr("data-audero-unp-text"));

             $this.off("focus.auderoUnifiedPlaceholders keydown.auderoUnifiedPlaceholders blur.auderoUnifiedPlaceholders")
	           .removeAttr("data-audero-unp-text data-audero-unp-typed");
         });
      }
   };

   $.fn.auderoUnifiedPlaceholders = function (method) {
      if (methods[method])
         return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      else if (typeof method === "object" || !method)
         return methods.init.apply(this, arguments);
      else
         $.error("Method " + method + " does not exist on jQuery.auderoUnifiedPlaceholders");
   };
})(jQuery);