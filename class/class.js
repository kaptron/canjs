//jQuery.Class 
// This is a modified version of John Resig's class
// http://ejohn.org/blog/simple-javascript-inheritance/
// It provides class level inheritance and callbacks.
//@steal-clean
steal("jquery","jquery/lang/string",function( $ ) {

	// =============== HELPERS =================

	    // if we are initializing a new class
	var initializing = false,
		makeArray = $.makeArray,
		isFunction = $.isFunction,
		isArray = $.isArray,
		extend = $.extend,
		getObject = $.String.getObject,
		concatArgs = function(arr, args){
			return arr.concat(makeArray(args));
		},
		
		// tests if we can get super in .toString()
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/,
		
		// overwrites an object with methods, sets up _super
		//   newProps - new properties
		//   oldProps - where the old properties might be
		//   addTo - what we are adding to
		inheritProps = function( newProps, oldProps, addTo ) {
			addTo = addTo || newProps
			for ( var name in newProps ) {
				// Check if we're overwriting an existing function
				addTo[name] = isFunction(newProps[name]) && 
							  isFunction(oldProps[name]) && 
							  fnTest.test(newProps[name]) ? (function( name, fn ) {
					return function() {
						var tmp = this._super,
							ret;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = oldProps[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, newProps[name]) : newProps[name];
			}
		},
		STR_PROTOTYPE = 'prototype'

	/**
	 * @class jQuery.Class
	 * @plugin jquery/class
	 * @parent jquerymx
	 * @download dist/jquery/jquery.class.js
	 * @test jquery/class/qunit.html
	 * 
	 * Class provides simulated inheritance in JavaScript. Use clss to bridge the gap between
	 * jQuery's functional programming style and Object Oriented Programming. It 
	 * is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Class]
	 * Inheritance library.  Besides prototypal inheritance, it includes a few important features:
	 * 
	 *   - Static inheritance
	 *   - Introspection
	 *   - Namespaces
	 *   - Setup and initialization methods
	 *   - Easy callback function creation
	 * 
	 * 
	 * ## Static v. Prototype
	 * 
	 * Before learning about Class, it's important to
	 * understand the difference between
	 * a class's __static__ and __prototype__ properties.
	 * 
	 *     //STATIC
	 *     MyClass.staticProperty  //shared property
	 *     
	 *     //PROTOTYPE
	 *     myclass = new MyClass()
	 *     myclass.prototypeMethod() //instance method
	 * 
	 * A static (or class) property is on the Class constructor
	 * function itself
	 * and can be thought of being shared by all instances of the 
	 * Class. Prototype propertes are available only on instances of the Class.
	 * 
	 * ## A Basic Class
	 * 
	 * The following creates a Monster class with a
	 * name (for introspection), static, and prototype members.
	 * Every time a monster instance is created, the static
	 * count is incremented.
	 *
	 * @codestart
	 * $.Class('Monster',
	 * /* @static *|
	 * {
	 *   count: 0
	 * },
	 * /* @prototype *|
	 * {
	 *   init: function( name ) {
	 *
	 *     // saves name on the monster instance
	 *     this.name = name;
	 *
	 *     // sets the health
	 *     this.health = 10;
	 *
	 *     // increments count
	 *     this.Class.count++;
	 *   },
	 *   eat: function( smallChildren ){
	 *     this.health += smallChildren;
	 *   },
	 *   fight: function() {
	 *     this.health -= 2;
	 *   }
	 * });
	 *
	 * hydra = new Monster('hydra');
	 *
	 * dragon = new Monster('dragon');
	 *
	 * hydra.name        // -> hydra
	 * Monster.count     // -> 2
	 * Monster.shortName // -> 'Monster'
	 *
	 * hydra.eat(2);     // health = 12
	 *
	 * dragon.fight();   // health = 8
	 *
	 * @codeend
	 *
	 * 
	 * Notice that the prototype <b>init</b> function is called when a new instance of Monster is created.
	 * 
	 * 
	 * ## Inheritance
	 * 
	 * When a class is extended, all static and prototype properties are available on the new class.
	 * If you overwrite a function, you can call the base class's function by calling
	 * <code>this._super</code>.  Lets create a SeaMonster class.  SeaMonsters are less
	 * efficient at eating small children, but more powerful fighters.
	 * 
	 * 
	 *     Monster("SeaMonster",{
	 *       eat: function( smallChildren ) {
	 *         this._super(smallChildren / 2);
	 *       },
	 *       fight: function() {
	 *         this.health -= 1;
	 *       }
	 *     });
	 *     
	 *     lockNess = new SeaMonster('Lock Ness');
	 *     lockNess.eat(4);   //health = 12
	 *     lockNess.fight();  //health = 11
	 * 
	 * ### Static property inheritance
	 * 
	 * You can also inherit static properties in the same way:
	 * 
	 *     $.Class("First",
	 *     {
	 *         staticMethod: function() { return 1;}
	 *     },{})
	 *
	 *     First.extend("Second",{
	 *         staticMethod: function() { return this._super()+1;}
	 *     },{})
	 *
	 *     Second.staticMethod() // -> 2
	 * 
	 * ## Namespaces
	 * 
	 * Namespaces are a good idea! We encourage you to namespace all of your code.
	 * It makes it possible to drop your code into another app without problems.
	 * Making a namespaced class is easy:
	 * 
	 * @codestart
	 * $.Class("MyNamespace.MyClass",{},{});
	 *
	 * new MyNamespace.MyClass()
	 * @codeend
	 * <h2 id='introspection'>Introspection</h2>
	 * Often, it's nice to create classes whose name helps determine functionality.  Ruby on
	 * Rails's [http://api.rubyonrails.org/classes/ActiveRecord/Base.html|ActiveRecord] ORM class
	 * is a great example of this.  Unfortunately, JavaScript doesn't have a way of determining
	 * an object's name, so the developer must provide a name.  Class fixes this by taking a String name for the class.
	 * @codestart
	 * $.Class.extend("MyOrg.MyClass",{},{})
	 * MyOrg.MyClass.shortName //-> 'MyClass'
	 * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
	 * @codeend
	 * The fullName (with namespaces) and the shortName (without namespaces) are added to the Class's
	 * static properties.
	 *
	 *
	 * <h2>Setup and initialization methods</h2>
	 * <p>
	 * Class provides static and prototype initialization functions.
	 * These come in two flavors - setup and init.
	 * Setup is called before init and
	 * can be used to 'normalize' init's arguments.
	 * </p>
	 * <div class='whisper'>PRO TIP: Typically, you don't need setup methods in your classes. Use Init instead.
	 * Reserve setup methods for when you need to do complex pre-processing of your class before init is called.
	 *
	 * </div>
	 * @codestart
	 * $.Class("MyClass",
	 * {
	 *   setup: function() {} //static setup
	 *   init: function() {} //static constructor
	 * },
	 * {
	 *   setup: function() {} //prototype setup
	 *   init: function() {} //prototype constructor
	 * })
	 * @codeend
	 *
	 * ### Setup
	 * 
	 * Setup functions are called before init functions.  Static setup functions are passed
	 * the base class followed by arguments passed to the extend function.
	 * Prototype static functions are passed the Class constructor 
	 * function arguments.
	 * 
	 * If a setup function returns an array, that array will be used as the arguments
	 * for the following init method.  This provides setup functions the ability to normalize
	 * arguments passed to the init constructors.  They are also excellent places
	 * to put setup code you want to almost always run.
	 * 
	 * 
	 * The following is similar to how [jQuery.Controller.prototype.setup]
	 * makes sure init is always called with a jQuery element and merged options
	 * even if it is passed a raw
	 * HTMLElement and no second parameter.
	 * 
	 *     $.Class("jQuery.Controller",{
	 *       ...
	 *     },{
	 *       setup: function( el, options ) {
	 *         ...
	 *         return [$(el),
	 *                 $.extend(true,
	 *                    this.Class.defaults,
	 *                    options || {} ) ]
	 *       }
	 *     })
	 * 
	 * Typically, you won't need to make or overwrite setup functions.
	 * 
	 * ### Init
	 *
	 * Init functions are called after setup functions.
	 * Typically, they receive the same arguments
	 * as their preceding setup function.  The Foo class's <code>init</code> method
	 * gets called in the following example:
	 * 
	 *     $.Class("Foo", {
	 *       init: function( arg1, arg2, arg3 ) {
	 *         this.sum = arg1+arg2+arg3;
	 *       }
	 *     })
	 *     var foo = new Foo(1,2,3);
	 *     foo.sum //-> 6
	 * 
	 * ## Proxies
	 * 
	 * Similar to jQuery's proxy method, Class provides a
	 * [jQuery.Class.static.proxy proxy]
	 * function that returns a callback to a method that will always
	 * have
	 * <code>this</code> set to the class or instance of the class.
	 * 
	 * 
	 * The following example uses this.proxy to make sure
	 * <code>this.name</code> is available in <code>show</code>.
	 * 
	 *     $.Class("Todo",{
	 *       init: function( name ) { 
	 *       	this.name = name 
	 *       },
	 *       get: function() {
	 *         $.get("/stuff",this.proxy('show'))
	 *       },
	 *       show: function( txt ) {
	 *         alert(this.name+txt)
	 *       }
	 *     })
	 *     new Todo("Trash").get()
	 * 
	 * Callback is available as a static and prototype method.
	 * 
	 * ##  Demo
	 * 
	 * @demo jquery/class/class.html
	 * 
	 * 
	 * ## Constructor
	 * 
	 * To create a Class call:
	 * 
	 *     $.Class( [NAME , STATIC,] PROTOTYPE ) -> Class
	 * 
	 * <div class='params'>
	 *   <div class='param'><label>NAME</label><code>{optional:String}</code>
	 *   <p>If provided, this sets the shortName and fullName of the 
	 *      class and adds it and any necessary namespaces to the 
	 *      window object.</p>
	 *   </div>
	 *   <div class='param'><label>STATIC</label><code>{optional:Object}</code>
	 *   <p>If provided, this creates static properties and methods
	 *   on the class.</p>
	 *   </div>
	 *   <div class='param'><label>PROTOTYPE</label><code>{Object}</code>
	 *   <p>Creates prototype methods on the class.</p>
	 *   </div>
	 * </div>
	 * 
	 * When a Class is created, the static setup and init methods are called.
	 * 
	 * To create an instance of a Class, call:
	 * 
	 *     new Class([args ... ]) -> instance
	 * 
	 * The created instance will have all the 
	 * prototype properties and methods defined by the PROTOTYPE object.
	 * 
	 * When an instance is created, the prototype setup and init methods 
	 * are called.
	 */

	clss = $.Class = function() {
		if (arguments.length) {
			clss.extend.apply(clss, arguments);
		}
	};

	/* @Static*/
	extend(clss, {
		/**
		 * @function proxy
		 * Returns a callback function for a function on this Class.
		 * Proxy ensures that 'this' is set appropriately.  
		 * @codestart
		 * $.Class.extend("MyClass",{
		 *     getData: function() {
		 *         this.showing = null;
		 *         $.get("data.json",this.proxy('gotData'),'json')
		 *     },
		 *     gotData: function( data ) {
		 *         this.showing = data;
		 *     }
		 * },{});
		 * MyClass.showData();
		 * @codeend
		 * <h2>Currying Arguments</h2>
		 * Additional arguments to proxy will fill in arguments on the returning function.
		 * @codestart
		 * $.Class.extend("MyClass",{
		 *    getData: function( <b>callback</b> ) {
		 *      $.get("data.json",this.proxy('process',<b>callback</b>),'json');
		 *    },
		 *    process: function( <b>callback</b>, jsonData ) { //callback is added as first argument
		 *        jsonData.processed = true;
		 *        callback(jsonData);
		 *    }
		 * },{});
		 * MyClass.getData(showDataFunc)
		 * @codeend
		 * <h2>Nesting Functions</h2>
		 * Proxy can take an array of functions to call as 
		 * the first argument.  When the returned callback function
		 * is called each function in the array is passed the return value of the prior function.  This is often used
		 * to eliminate currying initial arguments.
		 * @codestart
		 * $.Class.extend("MyClass",{
		 *    getData: function( callback ) {
		 *      //calls process, then callback with value from process
		 *      $.get("data.json",this.proxy(['process2',callback]),'json') 
		 *    },
		 *    process2: function( type,jsonData ) {
		 *        jsonData.processed = true;
		 *        return [jsonData];
		 *    }
		 * },{});
		 * MyClass.getData(showDataFunc);
		 * @codeend
		 * @param {String|Array} fname If a string, it represents the function to be called.  
		 * If it is an array, it will call each function in order and pass the return value of the prior function to the
		 * next function.
		 * @return {Function} the callback function.
		 */
		proxy: function( funcs ) {

			//args that should be curried
			var args = makeArray(arguments),
				self;

			// get the functions to callback
			funcs = args.shift();

			// if there is only one function, make funcs into an array
			if (!isArray(funcs) ) {
				funcs = [funcs];
			}
			
			// keep a reference to us in self
			self = this;
			
			//@steal-remove-start
			for( var i =0; i< funcs.length;i++ ) {
				if(typeof funcs[i] == "string" && !isFunction(this[funcs[i]])){
					throw ("class.js "+( this.fullName || this.Class.fullName)+" does not have a "+funcs[i]+"method!");
				}
			}
			//@steal-remove-end
			return function class_cb() {
				// add the arguments after the curried args
				var cur = concatArgs(args, arguments),
					isString, 
					length = funcs.length,
					f = 0,
					func;
				
				// go through each function to call back
				for (; f < length; f++ ) {
					func = funcs[f];
					if (!func ) {
						continue;
					}
					
					// set called with the name of the function on self (this is how this.view works)
					isString = typeof func == "string";
					if ( isString && self._set_called ) {
						self.called = func;
					}
					
					// call the function
					cur = (isString ? self[func] : func).apply(self, cur || []);
					
					// pass the result to the next function (if there is a next function)
					if ( f < length - 1 ) {
						cur = !isArray(cur) || cur._use_call ? [cur] : cur
					}
				}
				return cur;
			}
		},
		/**
		 * @function newInstance
		 * Creates a new instance of the class.  This method is useful for creating new instances
		 * with arbitrary parameters.
		 * <h3>Example</h3>
		 * @codestart
		 * $.Class.extend("MyClass",{},{})
		 * var mc = MyClass.newInstance.apply(null, new Array(parseInt(Math.random()*10,10))
		 * @codeend
		 * @return {class} instance of the class
		 */
		newInstance: function() {
			// get a raw instance objet (init is not called)
			var inst = this.rawInstance(),
				args;
				
			// call setup if there is a setup
			if ( inst.setup ) {
				args = inst.setup.apply(inst, arguments);
			}
			// call init if there is an init, if setup returned args, use those as the arguments
			if ( inst.init ) {
				inst.init.apply(inst, isArray(args) ? args : arguments);
			}
			return inst;
		},
		/**
		 * Setup gets called on the inherting class with the base class followed by the
		 * inheriting class's raw properties.
		 * 
		 * Setup will deeply extend a static defaults property on the base class with 
		 * properties on the base class.  For example:
		 * 
		 *     $.Class("MyBase",{
		 *       defaults : {
		 *         foo: 'bar'
		 *       }
		 *     },{})
		 * 
		 *     MyBase("Inheriting",{
		 *       defaults : {
		 *         newProp : 'newVal'
		 *       }
		 *     },{}
		 *     
		 *     Inheriting.defaults -> {foo: 'bar', 'newProp': 'newVal'}
		 * 
		 * @param {Object} baseClass the base class that is being inherited from
		 * @param {String} fullName the name of the new class
		 * @param {Object} staticProps the static properties of the new class
		 * @param {Object} protoProps the prototype properties of the new class
		 */
		setup: function( baseClass, fullName ) {
			// set defaults as the merger of the parent defaults and this object's defaults
			this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
			return arguments;
		},
		rawInstance: function() {
			// prevent running init
			initializing = true;
			var inst = new this();
			initializing = false;
			// allow running init
			return inst;
		},
		/**
		 * Extends a class with new static and prototype functions.  There are a variety of ways
		 * to use extend:
		 * @codestart
		 * //with className, static and prototype functions
		 * $.Class.extend('Task',{ STATIC },{ PROTOTYPE })
		 * //with just classname and prototype functions
		 * $.Class.extend('Task',{ PROTOTYPE })
		 * //With just a className
		 * $.Class.extend('Task')
		 * @codeend
		 * @param {String} [fullName]  the classes name (used for classes w/ introspection)
		 * @param {Object} [klass]  the new classes static/class functions
		 * @param {Object} [proto]  the new classes prototype functions
		 * @return {jQuery.Class} returns the new class
		 */
		extend: function( fullName, klass, proto ) {
			// figure out what was passed and normalize it
			if ( typeof fullName != 'string' ) {
				proto = klass;
				klass = fullName;
				fullName = null;
			}
			if (!proto ) {
				proto = klass;
				klass = null;
			}

			proto = proto || {};
			var _super_class = this,
				_super = this[STR_PROTOTYPE],
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			prototype = new this();
			initializing = false;
			
			// Copy the properties over onto the new prototype
			inheritProps(proto, _super, prototype);

			// The dummy class constructor
			function Class() {
				// All construction is actually done in the init method
				if ( initializing ) return;

				// we are being called w/o new, we are extending
				if ( this.constructor !== Class && arguments.length ) { 
					return arguments.callee.extend.apply(arguments.callee, arguments)
				} else { //we are being called w/ new
					return this.Class.newInstance.apply(this.Class, arguments)
				}
			}
			// Copy old stuff onto class
			for ( name in this ) {
				if ( this.hasOwnProperty(name) ) {
					Class[name] = this[name];
				}
			}

			// copy new static props on class
			inheritProps(klass, this, Class);

			// do namespace stuff
			if ( fullName ) {

				var parts = fullName.split(/\./),
					shortName = parts.pop(),
					current = getObject(parts.join('.'), window, true),
					namespace = current;

				//@steal-remove-start
				if (!Class.nameOk ) {
					//steal.dev.isHappyName(fullName)
				}
				if(current[shortName]){
					steal.dev.warn("class.js There's already something called "+fullName)
				}
				//@steal-remove-end
				current[shortName] = Class;
			}

			// set things that can't be overwritten
			extend(Class, {
				prototype: prototype,
				namespace: namespace,
				shortName: shortName,
				constructor: Class,
				fullName: fullName
			});

			//make sure our prototype looks nice
			Class[STR_PROTOTYPE].Class = Class[STR_PROTOTYPE].constructor = Class;

			/**
			 * @attribute fullName 
			 * The full name of the class, including namespace, provided for introspection purposes.
			 * @codestart
			 * $.Class.extend("MyOrg.MyClass",{},{})
			 * MyOrg.MyClass.shortName //-> 'MyClass'
			 * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
			 * @codeend
			 */

			// call the class setup
			var args = Class.setup.apply(Class, concatArgs([_super_class],arguments));
			
			// call the class init
			if ( Class.init ) {
				Class.init.apply(Class, args || []);
			}

			/* @Prototype*/
			return Class;
			/** 
			 * @function setup
			 * If a setup method is provided, it is called when a new 
			 * instances is created.  It gets passed the same arguments that
			 * were given to the Class constructor function (<code> new Class( arguments ... )</code>).
			 * 
			 *     $.Class("MyClass",
			 *     {
			 *        setup: function( val ) {
			 *           this.val = val;
			 *         }
			 *     })
			 *     var mc = new MyClass("Check Check")
			 *     mc.val //-> 'Check Check'
			 * 
			 * Setup is called before [jQuery.Class.prototype.init init].  If setup 
			 * return an array, those arguments will be used for init. 
			 * 
			 *     $.Class("jQuery.Controller",{
			 *       setup : function(htmlElement, rawOptions){
			 *         return [$(htmlElement), 
			 *                   $.extend({}, this.Class.defaults, rawOptions )] 
			 *       }
			 *     })
			 * 
			 * <div class='whisper'>PRO TIP: 
			 * Setup functions are used to normalize constructor arguments and provide a place for
			 * setup code that extending classes don't have to remember to call _super to
			 * run.
			 * </div>
			 * 
			 * Setup is not defined on $.Class itself, so calling super in inherting classes
			 * will break.  Don't do the following:
			 * 
			 *     $.Class("Thing",{
			 *       setup : function(){
			 *         this._super(); // breaks!
			 *       }
			 *     })
			 * 
			 * @return {Array|undefined} If an array is return, [jQuery.Class.prototype.init] is 
			 * called with those arguments; otherwise, the original arguments are used.
			 */
			//break up
			/** 
			 * @function init
			 * If an <code>init</code> method is provided, it gets called when a new instance
			 * is created.  Init gets called after [jQuery.Class.prototype.setup setup], typically with the 
			 * same arguments passed to the Class 
			 * constructor: (<code> new Class( arguments ... )</code>).  
			 * 
			 *     $.Class("MyClass",
			 *     {
			 *        init: function( val ) {
			 *           this.val = val;
			 *        }
			 *     })
			 *     var mc = new MyClass(1)
			 *     mc.val //-> 1
			 * 
			 * [jQuery.Class.prototype.setup Setup] is able to modify the arguments passed to init.  Read
			 * about it there.
			 * 
			 */
			//Breaks up code
			/**
			 * @attribute Class
			 * References the static properties of the instance's class.
			 * <h3>Quick Example</h3>
			 * @codestart
			 * // a class with a static classProperty property
			 * $.Class.extend("MyClass", {classProperty : true}, {});
			 * 
			 * // a new instance of myClass
			 * var mc1 = new MyClass();
			 * 
			 * //
			 * mc1.Class.classProperty = false;
			 * 
			 * // creates a new MyClass
			 * var mc2 = new mc.Class();
			 * @codeend
			 * Getting static properties via the Class property, such as it's 
			 * [jQuery.Class.static.fullName fullName] is very common.
			 */
		}

	})





	clss.callback = clss[STR_PROTOTYPE].callback = clss[STR_PROTOTYPE].
	/**
	 * @function proxy
	 * Returns a method that sets 'this' to the current instance.  This does the same thing as 
	 * and is described better in [jQuery.Class.static.proxy].
	 * The only difference is this proxy works
	 * on a instance instead of a class.
	 * @param {String|Array} fname If a string, it represents the function to be called.  
	 * If it is an array, it will call each function in order and pass the return value of the prior function to the
	 * next function.
	 * @return {Function} the callback function
	 */
	proxy = clss.proxy;


})();