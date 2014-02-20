/**
 * Multi-Screen.js v1.0.1
 * @author Ian de Vries <ian@ian-devries.com>
 * @license MIT License <http://opensource.org/licenses/MIT>
 */

var MultiScreen = (function() {

	/**
	 * screens
	 * Holds references to all the screens
	 */
	var screens;

	/**
	 * lock_navigation
	 * The navigation lock for during animations
	 */
	var lock_navigation;

	/**
	 * current_screen
	 * Reference to the currently active screen
	 */
	var current_screen;

	/**
	 * default_enter_animation
	 * Command for the default enter animation
	 */
	var default_enter_animation; 

	/**
	 * default_exit_animation
	 * Command for the default exit animation
	 */
	var default_exit_animation;

	/**
	 * default_enter_time
	 * Command for the default enter animation time
	 */
	var default_enter_time; 

	/**
	 * default_exit_time
	 * Command for the default exit animation time
	 */
	var default_exit_time;

	/**
	 * default_delay
	 * Default for the delay between enter and exit animations
	 */
	var default_delay;

	/**
	 * init()
	 * Initializes the plugin
	 */
	var init = function() {

		// all multi-screen.js screens
		var ms_screens = $('div.ms-container');

		// run plugin only if at least two screens
		if (ms_screens.length > 1) {

			// check for default screen
			var default_screen = $('div.ms-container.ms-default');
			
			// if no default screen specified
			if (default_screen.length == 0) {
				
				// use top container, give it the ms-default class
				default_screen = $(ms_screens[0]);
				default_screen.toggleClass('ms-default');
			
			// if more than one default	
			} else if (default_screen.length > 1) {

				// use top default, remove the ms-default class from the others
				default_screen = $(default_screen[0]);
				$('div.ms-container.ms-default').not('div.ms-container.ms-default:first').toggleClass('ms-default');

			}

			// save the default screen as the current one
			current_screen = default_screen;

			// store the screens for navigation between them
			store_screens(ms_screens);

			// open the navigation, activate the links
			lock_navigation = false;
			activate_links();
			
		}

	};

	/**
	 * activate_links() 
	 * Attaches on-click event to all .ms-nav-links which takes the target screen and transition attributes and performs the switch
	 */
	var activate_links = function() {

		// attach to all ms-nav-link elements
		$('.ms-nav-link').click(function(node) {
			
			// only do something if not already busy
			if (lock_navigation === false) {
			
				// lock screen switching until current switch is finished
				lock_navigation = true;
		
				// get references to the target and the current screens
				var link = $(node.target),
					target = get_target_screen(link.attr('data-ms-target')),
					current = current_screen;
					
				// only do something if the target exists and is not equal to the current screen	
				if (target !== false && target[0] !== current[0]) {
				
					// store the switched in target as the current screen
					current_screen = target;

					// gather the animation commands if set
					var exit_str = link.attr('data-ms-exit'),
						enter_str = link.attr('data-ms-enter'),
						exit_time_str = link.attr('data-ms-exit-time'),
						enter_time_str = link.attr('data-ms-enter-time'),
						delay = link.attr('data-ms-delay');

					// run the animation
					run_animation(current, target, enter_str, enter_time_str, exit_str, exit_time_str, delay);
				
				// undefined target or equal to current screen
				} else {
				
					lock_navigation = false;
					
				}
				
			}
		
		});

	};

	/**
	 * get_switch_time(time_str, type)
	 * Determines the event time of the animated screenswitching in ms
	 * @param {String} time_str
	 * @param {String} type 'enter' or 'exit'
	 * @return {Integer} switch time
	 */
	var get_switch_time = function (time_str, type) {

		// if the input is valid
		if ($.isNumeric(time_str) && Math.floor(time_str) == time_str) {
			
			// return int value of input
			return parseInt(time_str);
		
		// invalid input, use default
		} else {
		
			// return default by type if valid
			if (type === 'enter' || type === 'exit') {

				return get_default_time(type);

			} else {

				return false;

			}
		
		}

	};

	/**
	 * store_screens(screens) 
	 * Takes in a jquery selection of the active screens and stores them associatively, indexed by id
	 * @param {Object} screens
	 */
	var store_screens = function (screens_to_store) {

		screens = new Object();

		// for each screen, store if it has a valid id 
		$(screens_to_store).each(function() {

			if (typeof $(this).attr('id') !== 'undefined') {
		
				screens[$(this).attr('id')] = this;

			}
		
		});

	};

	/**
	 * get_target_screen(id) 
	 * Returns a reference to the target screen by the given id
	 * @param {String} id
	 * @return {Object} target screen
	 */
	var get_target_screen = function (id) {

		// return the screen if the id is not empty and the by that id screen exists, false otherwise
		if (typeof id !== 'undefined' && id in screens) {
			
			return $(screens[id]);
			
		} else {
		
			return false;
		
		}

	};

	/**
	 * run_animation(current, target, enter_str, enter_time_str, exit_str, exit_time_str, delay)
	 * Takes in a reference to the current and target screens plus a list of specified commands and runs the animation
	 * @param {Object} current current screen
	 * @param {Object} target target screen
	 * @param {String} enter_str command for enter animation
	 * @param {String} enter_time_str command for enter animation speed
	 * @param {String} exit_str command for exit animation
	 * @param {String} exit_time_str command for exit animation speed
	 * @param {String} delay command for the delay
	 */
	var run_animation = function (current, target, enter_str, enter_time_str, exit_str, exit_time_str, delay) {

		// determine height and width to use based on the max of the entering screen, exiting screen, or the window
		var	max_height = Math.max.apply(Math, [current.outerHeight(), target.outerHeight(), $(window).height()]),
			max_width = Math.max.apply(Math, [current.outerWidth(), target.outerWidth(), $(window).width()]),

		// gather the css to use on the target and current screens in the animation
			target_css = get_target_css(enter_str, max_height, max_width),
			current_css = get_current_css(exit_str, max_height, max_width);

		// if no delay or an invalid delay was specified, use the default
		if (typeof delay === 'undefined' || (delay.toLowerCase() !== 'true' && delay.toLowerCase() !== 'false')) {

			delay = get_default_delay();

		} else {

			// change type to boolean
			delay = delay.toLowerCase() === 'true';

		}

		// if a delay is specified, run the target animation inside the complete function of the current animation, outside otherwise
		if (delay) {

			animate_current(current, current_css, exit_time_str, true, target, target_css, enter_time_str);
			
		} else {

			animate_current(current, current_css, exit_time_str, false);
			animate_target(target, target_css, enter_time_str);

		}

	};

	/**
	 * animate_current(current, current_css, exit_time_str, delay, target, target_css, enter_time_str)
	 * Runs the animation for the current screen, calls the animation for the target on completion if a delay was specified
	 * @param {Object} current current screen
	 * @param {Object} current_css contains css for the current screen
	 * @param {String} exit_time_str command for exit animation speed
	 * @param {Boolean} delay command for the delay
	 * @param {Object} target target screen
	 * @param {Object} target_css contains css for the target screen
	 * @param {String} enter_time_str command for enter animation speed
	 */
	var animate_current = function (current, current_css, exit_time_str, delay, target, target_css, enter_time_str) {

		// apply pre_css, animate with animate_css and the input time
		current.css(current_css.pre_css).animate(current_css.animate_css, get_switch_time(exit_time_str, 'exit'), function() {
			
			// apply post_css on completion
			current.css(current_css.post_css);

			// animate the target if delay was specified
			if (delay === true) {

				animate_target(target, target_css, enter_time_str);

			}
		
		});

	};

	/**
	 * animate_target(target, target_css, enter_time_str) 
	 * Runs the animation for the target screen
	 * @param {Object} target target screen
	 * @param {Object} target_css contains css for the target screen
	 * @param {String} enter_time_str command for enter animation speed
	 */
	var animate_target = function (target, target_css, enter_time_str) {

		// apply pre_css, animate with animate_css and the input time
		target.css(target_css.pre_css).animate(target_css.animate_css, get_switch_time(enter_time_str, 'enter'), function() {
			
			// apply post_css on completion and open up the navigation
			target.css(target_css.post_css);
			lock_navigation = false;
			
		});

	};

	/**
	 * get_coordinate(input_str, dimension, movement) 
	 * Returns the x and y coordinates for the target/current css (starting/ending points)
	 * @param {String} input_str command
	 * @param {String} dimension 'x' or 'y'
	 * @param {Integer} width or height
	 * @return {Mixed} x or y movement, false if bad input
	 */
	var get_coordinate = function (input_str, dimension, movement) {

		movement = (movement + 200) + 'px';

		// x-dimension
		if (dimension === 'x') {

			// anywhere to the left
			if (input_str === 'topleft' || input_str === 'left' || input_str === 'bottomleft') {

				return '-' + movement;

			// anywhere to the right
			} else if (input_str === 'topright' || input_str === 'right' || input_str === 'bottomright') {

				return movement;

			// in the middle
			} else {

				return '0';

			}

		// y-dimension
		} else if (dimension === 'y') {

			// anywhere at the top
			if (input_str === 'topleft' || input_str === 'top' || input_str === 'topright') {

				return '-' + movement;

			// anywhere at the bottom
			} else if (input_str === 'bottomleft' || input_str === 'bottom' || input_str === 'bottomright') {

				return movement;

			// anwhere in the middle
			} else {

				return '0';

			}

		// bad input
		} else {

			return false;

		}

	};

	/**
	 * check_animation_command(command)
	 * Checks for a valid animation command
	 * @param {String} command
	 * @return {Boolean} valid
	 */
	var check_animation_command = function (command) {

		// check for each individual command - might be able to micro optimize here
		if (command !== 'fade' &&
			command !== 'top' && 
			command !== 'topright' && 
			command !== 'right' && 
			command !== 'bottomright' && 
			command !== 'bottom' && 
			command !== 'bottomleft' && 
			command !== 'left' && 
			command !== 'topleft' &&
			command !== 'fadetop' && 
			command !== 'fadetopright' && 
			command !== 'faderight' && 
			command !== 'fadebottomright' && 
			command !== 'fadebottom' && 
			command !== 'fadebottomleft' && 
			command !== 'fadeleft' && 
			command !== 'fadetopleft'
			) {

			return false;

		} else {

			return true;

		}

	};

	/**
	 * get_target_css = function (input_str, height, width)
	 * determines the pre, animate, and post CSS for the target (entering) screen, uses default animation if bad input
	 * @param {String} input_str command
	 * @param {Integer} height
	 * @param {Integer} width
	 * @return {Object} pre_css, animate_css, post_css
	 */
	var get_target_css = function (input_str, height, width) {

		// check for valid command or take the default
		if (!check_animation_command(input_str)) {

			input_str = get_default_animation('enter');

		}

		// instantiate the return parts with the shared components of each command
		var post_css = {position: 'absolute', zIndex: '2'},
			pre_css = {display: 'block'},
			animate_css = {};

		// if the first part or the entire command is fade, add the CSS elements for the fade
		if (input_str.substring(0, 4) === 'fade') {

			// opacity goes from 0 to 1
			pre_css.opacity = '0';
			animate_css.opacity = '1';

			// continue with the rest of the command (either a direction or empty)
			input_str = input_str.substring(4);

		}

		// get the x and y movement based on the command
		pre_css.left = get_coordinate(input_str, 'x', width);
		pre_css.top = get_coordinate(input_str, 'y', height);

		// if the screen starts at the top or bottom, it must animate to the middle
		if (pre_css.top !== '0') {

			animate_css.top = '0';

		}

		// if the screen starts at the left or right, it must animate to the middle
		if (pre_css.left !== '0') {

			animate_css.left = '0';

		}

		// return the components
		return {pre_css: pre_css, animate_css: animate_css, post_css: post_css};

	};

	/**
	 * get_current_css = function (input_str, height, width)
	 * determines the pre, animate, and post CSS for the current (exiting) screen, uses default animation if bad input
	 * @param {String} input_str command
	 * @param {Integer} height
	 * @param {Integer} width
	 * @return {Object} pre_css, animate_css, post_css
	 */
	var get_current_css = function (input_str, height, width) {

		// check for valid command or take the default
		if (!check_animation_command(input_str)) {

			input_str = get_default_animation('exit');

		}

		// instantiate the return parts with the shared components of each command
		var post_css = {display: 'none'},
			pre_css = {},
			animate_css = {};

		// if the first part or the entire command is fade, add the CSS elements for the fade
		if (input_str.substring(0, 4) === 'fade') {

			// opacity goes from 1 to 0, then set back to 1 after the animation
			animate_css.opacity = '0';
			post_css.opacity = '1';

			// continue with the rest of the command (either a direction or empty)
			input_str = input_str.substring(4);

		}

		// get the x and y movement based on the command
		animate_css.left = get_coordinate(input_str, 'x', width);
		animate_css.top = get_coordinate(input_str, 'y', height);

		// for fade, put the screen in the back after the animation - before otherwise
		if (animate_css.top === '0' && animate_css.left === '0') {

			post_css.position = 'fixed';
			post_css.zIndex = '1';

		} else {

			pre_css.position = 'fixed';
			pre_css.zIndex = '1';

		}

		// return the components
		return {pre_css: pre_css, animate_css: animate_css, post_css: post_css};

	};

	/**
	 * get_default_animation(type) 
	 * Gets the default animation if preset, defaults it to fade if not set yet
	 * @param {String} type 'enter' or 'exit'
	 * @return {Mixed} default command string, or false if bad input
	 */
	var get_default_animation = function (type) {

		var default_animation;

		// for default enter animation
		if (type === 'enter') {

			default_animation = default_enter_animation;

		// for default exit animation
		} else if (type === 'exit') {
			
			default_animation = default_exit_animation;

		// bad input
		} else {

			return false;

		}

		// if the default has not been set yet or is invalid, set it to 'fade'
		if (!check_animation_command(default_animation)) {

			default_animation = 'fade';
			set_default_animation(type, default_animation);

		}

		return default_animation;

	};

	/**
	 * get_default_time(type) 
	 * Gets the default animation time if preset, defaults it to 500 if not set yet
	 * @param {String} type 'enter' or 'exit'
	 * @return {Mixed} default animation time, or false if bad input
	 */
	var get_default_time = function (type) {

		var default_time;

		// for the enter animation
		if (type === 'enter') {

			default_time = default_enter_time;

		// for the exit animation
		} else if (type === 'exit') {
			
			default_time = default_exit_time;

		// bad input
		} else {

			return false;

		}

		// if the default is not set or invalid, set it to 500
		if (!($.isNumeric(default_time) && Math.floor(default_time) == default_time)) {

			default_time = 500;
			set_default_animation_time(type, default_time);

		}

		return default_time;

	};

	/**
	 * get_default_delay() 
	 * Gets the default delay if preset, defaults to false if not set
	 * @return {Boolean} default delay
	 */
	var get_default_delay = function () {

		// if the default delay is not set or invalid
		if (typeof default_delay !== 'boolean') {

			set_default_animation_delay(false);

		}

		return default_delay;

	};

	/**
	 * set_default_animation(type, command)
	 * Sets the default animation for exiting and entering screens
	 * @param {String} type 'enter' or 'exit'
	 * @param {String} command animation command to set
	 * @return {Boolean} success
	 */
	var set_default_animation = function (type, command) {

		// check for valid command
		if (check_animation_command(command)) {

			// set enter default
			if (type === 'enter') {

				default_enter_animation = command;

			// set exit default
			} else if (type === 'exit') {

				default_exit_animation = command;

			// bad input
			} else {

				return false;

			}

		// bad input
		} else {

			return false;

		}

	};

	/**
	 * set_default_animation_time(type, time)
	 * Sets the default animation time for exiting and entering screens
	 * @param {String} type 'enter' or 'exit'
	 * @param {Integer} time animation time command to set
	 * @return {Boolean} success
	 */
	var set_default_animation_time = function (type, time) {

		// check if input time is valid
		if ($.isNumeric(time) && Math.floor(time) == time) {

			// set enter time default
			if (type === 'enter') {
			
				default_enter_time = parseInt(time);

			// set exit time default
			} else if (type === 'exit') {

				default_exit_time = parseInt(time);

			// bad input
			} else {

				return false;

			}

		// bad input
		} else {

			return false;

		}

	};

	/**
	 * set_default_animation_delay(delay)
	 * Sets the default animation delay
	 * @param {Boolean} delay
	 * @return {Boolean} success
	 */
	var set_default_animation_delay = function (delay) {

		if (typeof delay === 'boolean') {

			default_delay = delay;
			return true;

		// bad input
		} else {

			return false;

		}

	};

	// public functions
	return {init: init, 
			set_default_animation: set_default_animation, 
			set_default_animation_time: set_default_animation_time,
			set_default_animation_delay: set_default_animation_delay};

})();