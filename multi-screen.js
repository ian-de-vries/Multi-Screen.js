/**
 * Multi-Screen.js v1.2.2
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
	 * default_distance_buffer_top
	 * Default for the distance between the top and bottom anchorpoints of the screens while animating
	 */
	var default_distance_buffer_vertical;

	/**
	 * default_distance_buffer_bottom
	 * Default for the distance between the left and right anchorpoints of the screens while animating
	 */
	var default_distance_buffer_horizontal;

	/**
	 * default_scroll_time
	 * Default for the animation time for scrolling to the top of the page (before the screen switch animation)
	 */
	var default_scroll_time;

	/**
	 * animation_queue
	 * Contains the queue object for chaining animations
	 */
	var animation_queue;

	/**
	 * valid_commands
	 * List of all valid animation commands
	 */
	var valid_commands = [	'fade', 
							'fadetop', 
							'fadetopright', 
							'faderight', 
							'fadebottomright', 
							'fadebottom', 
							'fadebottomleft', 
							'fadeleft', 
							'fadetopleft', 
							'top', 
							'topright', 
							'right', 
							'bottomright', 
							'bottom', 
							'bottomleft', 
							'left', 
							'topleft' ];

	/**
	 * init()
	 * Initializes the plugin
	 * @param {Object} options may contain default settings (optional)
	 */
	var init = function(options) {

		// all multi-screen.js screens
		var ms_screens = $('div.ms-container');

		// run plugin only if at least two screens
		if (ms_screens.length > 1) {

			// check for default screen
			var default_screen = $('div.ms-container.ms-default');
			
			// if no default screen specified
			if (default_screen.length === 0) {
				
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

			// store the default settings if given
			set_defaults(options);

			// open the navigation, activate the links
			lock_navigation = false;
			animation_queue = false;
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

			// grab the node that was clicked on containing all the information
			var link = $(node.target);

			// call the switch function with the animation specifics
			switch_screens({	target_id: link.attr('data-ms-target'),
								animation_command: link.attr('data-ms-animation'), 
								enter_animation_command: link.attr('data-ms-enter-animation'),
								exit_animation_command: link.attr('data-ms-exit-animation'),
								animation_time: link.attr('data-ms-time'),
								enter_animation_time: link.attr('data-ms-enter-time'),
								exit_animation_time: link.attr('data-ms-exit-time'),
								delay: link.attr('data-ms-delay'),
								distance: link.attr('data-ms-distance'),
								vertical_distance: link.attr('data-ms-vertical-distance'),
								horizontal_distance: link.attr('data-ms-horizontal-distance'),
								scroll_time: link.attr('data-ms-scroll-time')});
		
		});

	};

	/**
	 * switch_screens(options)
	 * Public api function to navigate from the current screen to the specified target screen
	 * @param {Object} options contains the parameters for navigation from the current to a target screen (see readme)
	 * @return Boolean animation was succesfully started
	 */
	var switch_screens = function (options) {

		// only do something if not already busy
		if (lock_navigation === false) {

			// lock screen switching until current switch is finished
			lock_navigation = true;

			// get references to the target and the current screens
			var target = (typeof options === 'object' && typeof options.target_id === 'string') ? get_target_screen(options.target_id) : false,
				current = current_screen;

			// only do something if the target exists and is not equal to the current screen	
			if (target !== false && target[0] !== current[0]) {

				// store the switched in target as the current screen
				current_screen = target;

				if (typeof options.chain_animation_options === 'object') {

					animation_queue = options.chain_animation_options;

				}

				// use higher level command if more specific not set
				// if higher level command is undefined it will be defaulted later
				options.exit_animation_command = (typeof options.exit_animation_command === 'undefined') ? options.animation_command : options.exit_animation_command;
				options.enter_animation_command = (typeof options.enter_animation_command === 'undefined') ? options.animation_command : options.enter_animation_command;

				options.exit_animation_time = (typeof options.exit_animation_time === 'undefined') ? options.animation_time : options.exit_animation_time;
				options.enter_animation_time = (typeof options.enter_animation_time === 'undefined') ? options.animation_time : options.enter_animation_time;

				options.vertical_distance = (typeof options.vertical_distance === 'undefined') ? options.distance : options.vertical_distance;
				options.horizontal_distance = (typeof options.horizontal_distance === 'undefined') ? options.distance : options.horizontal_distance;

				// if the page is currently not at the top
				if ($(document).scrollTop() > 0) {

					// scroll it to the top (for smoother screen switch animation)
					$('body').animate({scrollTop: 0}, get_switch_time(options.scroll_time, 'scroll'), function() {

						// then run the animation on completion
						run_animation(	current, 
										target, 
										options.enter_animation_command, 
										options.enter_animation_time, 
										options.exit_animation_command, 
										options.exit_animation_time, 
										options.delay, 
										options.vertical_distance, 
										options.horizontal_distance);

					});

				// at the top already, so animate without scrolling first
				} else {

					run_animation(	current, 
									target, 
									options.enter_animation_command, 
									options.enter_animation_time, 
									options.exit_animation_command, 
									options.exit_animation_time, 
									options.delay, 
									options.vertical_distance, 
									options.horizontal_distance);

				}

				return true;


			// undefined target or equal to current screen
			} else {
			
				lock_navigation = false;
				return false;
				
			}


		// already busy
		} else {

			return false;

		}

	}

	/**
	 * get_switch_time(time_str, type)
	 * Determines the event time of the animated screenswitching in ms
	 * @param {String} time_str
	 * @param {String} type 'enter' or 'exit' or 'scroll'
	 * @return {Integer} switch time
	 */
	var get_switch_time = function (time_str, type) {

		// if the input is valid
		if (check_int(time_str) && time_str >= 0) {
			
			// return int value of input
			return parseInt(time_str);
		
		// invalid input, use default
		} else {
		
			// return default by type if valid
			if (type === 'enter' || type === 'exit' || type === 'scroll') {

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
	 * @param {String} vertical_buffer
	 * @param {String} horizontal_buffer
	 */
	var run_animation = function (current, target, enter_str, enter_time_str, exit_str, exit_time_str, delay, vertical_buffer, horizontal_buffer) {

		// check for valid command or take the default
		enter_str = check_animation_command(enter_str) ? enter_str : get_default_animation('enter');
		exit_str = check_animation_command(exit_str) ? exit_str : get_default_animation('exit');

		var enter_fade = false,
			exit_fade = false;

		// if the first part or the entire command is fade, add the CSS elements for the fade
		// continue with the rest of the command (either a direction or empty)
		if (enter_str.substring(0, 4) === 'fade') {

			enter_fade = true;
			enter_str = enter_str.substring(4);

		}

		if (exit_str.substring(0, 4) === 'fade') {

			exit_fade = true;
			exit_str = exit_str.substring(4);

		}

		// get the starting/ending anchor points
		var movement = get_movement(current.outerHeight(), target.outerHeight(), current.outerWidth(), target.outerHeight(), enter_str, exit_str, vertical_buffer, horizontal_buffer);

		// gather the css to use on the target and current screens in the animation
		var target_css = get_target_css(movement.enter.x, movement.enter.y, enter_fade),
			current_css = get_current_css(movement.exit.x, movement.exit.y, exit_fade);

		// if no delay or an invalid delay was specified, use the default, otherwise make sure it's boolean type
		if (typeof delay !== 'boolean') {

			delay = (typeof delay !== 'string' || (delay.toLowerCase() !== 'true' && delay.toLowerCase() !== 'false')) ? get_default_delay() : (delay.toLowerCase() === 'true');

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

			// check if there is an object in the queue
			if (animation_queue !== false) {

				// reset the queue and call the new animation
				var chain_object = animation_queue;
				animation_queue = false;
				switch_screens(chain_object);

			}
			
		});

	};

	/**
	 * get_movement(current_height, target_height, current_width, target_width, enter_str, exit_str)
	 * Returns the movement to use in the x and y direction
	 * @param {Integer} current_height
	 * @param {Integer} target_height
	 * @param {Integer} current_width
	 * @param {Integer} target_width
	 * @param {String} enter_str enter command
	 * @param {String} exit_str exit command
	 * @param {Integer} vertical_buffer
	 * @param {Integer} horizontal_buffer
	 * @return {Object} x and y movement for both enter and exit
	 */
	var get_movement = function (current_height, target_height, current_width, target_width, enter_str, exit_str, vertical_buffer, horizontal_buffer) {

		vertical_buffer = check_int(vertical_buffer) ? parseInt(vertical_buffer) : get_default_distance_buffer('x');
		horizontal_buffer = check_int(horizontal_buffer) ? parseInt(horizontal_buffer) : get_default_distance_buffer('y');

		// if the screen is entering anywhere from the left, the target width is relevant
		if (enter_str === 'topleft' || enter_str === 'left' || enter_str === 'bottomleft') {

			var x_movement = Math.max(target_width, $(window).width()) + horizontal_buffer;

		} else {

			var x_movement = Math.max(current_width, $(window).width()) + horizontal_buffer;

		}

		// if the screen is entering from the top, the target height is relevant
		if (enter_str === 'topleft' || enter_str === 'top' || enter_str === 'topright') {

			var y_movement = Math.max(target_height, $(window).height()) + vertical_buffer;

		} else {

			var y_movement = Math.max(current_height, $(window).height()) + vertical_buffer;

		}

		return {enter: get_coordinate(x_movement, y_movement, enter_str),
				exit: get_coordinate(x_movement, y_movement, exit_str)}

	};

	/**
	 * get_coordinate(x_movement, y_movement, input_str)
	 * Returns the movement to use in the x and y direction
	 * @param {Integer} x_movement
	 * @param {Integer} y_movement
	 * @param {String} input_str command
	 * @return {Object} x and y movement
	 */
	var get_coordinate = function (x_movement, y_movement, input_str) {

		// anywhere to the left
		if (input_str === 'topleft' || input_str === 'left' || input_str === 'bottomleft') {

			x_movement = '-' + x_movement + 'px';

		// anywhere to the right
		} else if (input_str === 'topright' || input_str === 'right' || input_str === 'bottomright') {

			x_movement = x_movement + 'px';

		// anywhere in the middle
		} else {

			x_movement = '0';

		}

		// anywhere at the top
		if (input_str === 'topleft' || input_str === 'top' || input_str === 'topright') {

			y_movement = '-' + y_movement + 'px';

		// anywhere at the bottom
		} else if (input_str === 'bottomleft' || input_str === 'bottom' || input_str === 'bottomright') {

			y_movement = y_movement + 'px';

		// anwhere in the middle
		} else {

			y_movement = '0';

		}

		return {x: x_movement, y: y_movement};

	}

	/**
	 * check_animation_command(command)
	 * Checks for a valid animation command
	 * @param {String} command
	 * @return {Boolean} valid
	 */
	var check_animation_command = function (command) {

		// check for each individual command - this should be micro optimized
		if (valid_commands.indexOf(command) !== -1) {

			return true;

		} else {

			return false;

		}

	};

	/**
	 * check_int(in)
	 * checks if the incoming string is a valid integer value
	 * @param {Mixed} check
	 * @return {Boolean} it's an integer
	 */
	var check_int = function (check) {

		return ($.isNumeric(check) && Math.floor(check) == check);

	}

	/**
	 * get_target_css(x_movement, y_movement, fade)
	 * determines the pre, animate, and post CSS for the target (entering) screen
	 * @param {String} x_movement
	 * @param {String} y_movement
	 * @param {Boolean} fade
	 * @return {Object} pre_css, animate_css, post_css
	 */
	var get_target_css = function (x_movement, y_movement, fade) {

		// instantiate the return parts with the shared components of each command
		var post_css = {position: 'absolute', zIndex: '2'},
			pre_css = {display: 'block'},
			animate_css = {};

		// if the first part or the entire command is fade, add the CSS elements for the fade
		if (fade === true) {

			// opacity goes from 0 to 1
			pre_css.opacity = '0';
			animate_css.opacity = '1';

		}

		// get the x and y movement based on the command
		pre_css.left = x_movement;
		pre_css.top = y_movement;

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
	 * get_current_css(x_movement, y_movement, fade)
	 * determines the pre, animate, and post CSS for the current (exiting) screen
	 * @param {String} input_str command
	 * @param {Integer} height
	 * @param {Integer} width
	 * @return {Object} pre_css, animate_css, post_css
	 */
	var get_current_css = function (x_movement, y_movement, fade) {

		// instantiate the return parts with the shared components of each command
		var post_css = {display: 'none'},
			pre_css = {},
			animate_css = {};

		// if the first part or the entire command is fade, add the CSS elements for the fade
		if (fade === true) {

			// opacity goes from 1 to 0, then set back to 1 after the animation
			animate_css.opacity = '0';
			post_css.opacity = '1';

		}

		// get the x and y movement based on the command
		animate_css.left = x_movement;
		animate_css.top = y_movement;

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
			set_default_animation(default_animation, type);

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

		// for the exit animation
		} else if (type === 'scroll') {
			
			default_time = default_scroll_time;

		// bad input
		} else {

			return false;

		}

		// if the default is not set or invalid, set it to 500
		if (!check_int(default_time)) {

			default_time = type === 'scroll' ? 200 : 500;
			set_default_time(default_time, type);

		}

		return default_time;

	};

	/**
	 * get_default_distance_buffer(dimension) 
	 * Gets the default distance buffer if preset, defaults it to 200px if not set yet
	 * @param {String} dimension 'x' or 'y'
	 * @return {Mixed} default distance buffer, or false if bad input
	 */
	var get_default_distance_buffer = function (dimension) {

		var default_buffer;

		if (dimension === 'x') {

			default_buffer = default_distance_buffer_horizontal;

		} else if (dimension === 'y') {

			default_buffer = default_distance_buffer_vertical;

		} else {

			return false;

		}

		// if the default is not set or invalid, set it to 200
		if (!check_int(default_buffer)) {

			default_buffer = 200;
			set_default_distance(default_buffer, (dimension === 'x' ? 'horizontal' : 'vertical'));

		}

		return default_buffer;

	};

	/**
	 * get_default_delay() 
	 * Gets the default delay if preset, defaults to false if not set
	 * @return {Boolean} default delay
	 */
	var get_default_delay = function () {

		// if the default delay is not set or invalid
		if (typeof default_delay !== 'boolean') {

			set_default_delay(false);

		}

		return default_delay;

	};

	/**
	 * get_current_screen() 
	 * Gets the id of the current screen
	 * @return {String} id of current screen
	 */
	var get_current_screen = function () {

		return current_screen.attr('id');

	};

	/**
	 * set_default_animation(type, command)
	 * Sets the default animation for exiting and entering screens
	 * @param {String} command animation command to set
	 * @param {String} type 'enter' or 'exit'
	 * @return {Boolean} success
	 */
	var set_default_animation = function (command, type) {

		// check for valid command
		if (check_animation_command(command)) {

			// set enter default
			if (type === 'enter') {

				default_enter_animation = command;

			// set exit default
			} else if (type === 'exit') {

				default_exit_animation = command;

			// no input given, so do both
			} else if (typeof type === 'undefined') {

				default_enter_animation = command;
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
	 * set_default_time(type, time)
	 * Sets the default animation time for exiting and entering screens
	 * @param {Integer} time animation time command to set
	 * @param {String} type 'enter' or 'exit' or 'scroll'
	 * @return {Boolean} success
	 */
	var set_default_time = function (time, type) {

		// check if input time is valid
		if (check_int(time) && (time = parseInt(time)) > 0) {

			// set enter time default
			if (type === 'enter') {
			
				default_enter_time = time;

			// set exit time default
			} else if (type === 'exit') {

				default_exit_time = time;

			// set exit time default
			} else if (type === 'scroll') {

				default_scroll_time = time;

			// no input given, so do both
			} else if (typeof type === 'undefined') {

			 	default_enter_time = time;
				default_exit_time = time;
				default_scroll_time = time;

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
	 * set_default_distance(dimension, distance)
	 * Sets the default distance buffer for exiting and entering screens
	 * @param {Integer} distance in pixels
	 * @param {String} dimension 'horizontal' or 'vertical'
	 * @return {Boolean} success
	 */
	var set_default_distance = function (distance, dimension) {

		// check if input time is valid
		if (check_int(distance)) {

			// set horizontal buffer
			if (dimension === 'horizontal') {
			
				default_distance_buffer_horizontal = parseInt(distance);

			// set vertical buffer
			} else if (dimension === 'vertical') {

				default_distance_buffer_vertical = parseInt(distance);

			// no input given, so do both
			} else if (typeof dimension === 'undefined') {

				distance = parseInt(distance);
				default_distance_buffer_horizontal = distance;
				default_distance_buffer_vertical = distance;


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
	 * set_default_delay(delay)
	 * Sets the default animation delay
	 * @param {Boolean} delay
	 * @return {Boolean} success
	 */
	var set_default_delay = function (delay) {

		if (typeof delay === 'boolean') {

			default_delay = delay;
			return true;

		// bad input
		} else {

			return false;

		}

	};

	/**
	 * set_defaults(options)
	 * Sets the defaults
	 * @param {Object} options
	 * @return {Boolean} success
	 */
	var set_defaults = function (options) {

		// store the default settings if given
		if (typeof options !== 'undefined') {

			var check_bool = true;

			// check for a general animation time
			if (typeof options.default_time !== 'undefined') {

				check_bool = !set_default_time(options.default_time) ? false : check_bool;

			} 

			// check for enter animation time
			if (typeof options.default_enter_time !== 'undefined') {

				check_bool = !set_default_time(options.default_enter_time, 'enter') ? false : check_bool;

			} 

			// check for exit animation time
			if (typeof options.default_exit_time !== 'undefined') {

				check_bool = !set_default_time(options.default_exit_time, 'exit') ? false : check_bool;

			}

			// check for scroll time
			if (typeof options.default_scroll_time !== 'undefined') {

				check_bool = !set_default_time(options.default_scroll_time, 'scroll') ? false : check_bool;

			} 

			// check for animation command
			if (typeof options.default_animation !== 'undefined') {

				check_bool = !set_default_animation(options.default_animation) ? false : check_bool;

			} 

			// check for enter animation command
			if (typeof options.default_enter_animation !== 'undefined') {

				check_bool = !set_default_animation(options.default_enter_animation, 'enter') ? false : check_bool;

			}

			// check for exit animation command
			if (typeof options.default_exit_animation !== 'undefined') {

				check_bool = !set_default_animation(options.default_exit_animation, 'exit') ? false : check_bool;

			}

			// check for delay
			if (typeof options.default_delay !== 'undefined') {

				check_bool = !set_default_delay(options.default_delay) ? false : check_bool;

			}

			// check for distance
			if (typeof options.default_distance !== 'undefined') {

				check_bool = !set_default_distance(options.default_distance) ? false : check_bool;

			}

			// check for vertical distance
			if (typeof options.default_vertical_distance !== 'undefined') {

				check_bool = !set_default_distance(options.default_vertical_distance, 'vertical') ? false : check_bool;

			}

			// check for horizontal distance
			if (typeof options.default_vertical_distance !== 'undefined') {

				check_bool = !set_default_distance(options.default_vertical_distance, 'vertical') ? false : check_bool;

			}

			return check_bool;

		// bad input
		} else {

			return false;

		}

	}

	// public functions
	return {	init: init, 
				set_default_animation: set_default_animation, 
				set_default_time: set_default_time,
				set_default_delay: set_default_delay,
				set_default_distance: set_default_distance,
				set_defaults: set_defaults,
				switch_screens: switch_screens,
				get_current_screen: get_current_screen};

})();