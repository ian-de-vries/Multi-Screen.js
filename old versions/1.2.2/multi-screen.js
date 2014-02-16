$(document).ready(function() {

	$.multi_screen.init();

});


$.multi_screen = new Object();

$.multi_screen.init = function() {

	// all multi-screen.js screens
	var screens = $('div.ms-container');

	// run plugin only if at least two screens
	if (screens.length > 1) {

		var default_screen = $('div.ms-container.ms-default');
		
		// if no default screen specified, use the top container
		if (default_screen.length == 0) {
			
			$(screens[0]).toggleClass('ms-default');
			default_screen = $(screens[0]);
			console.warn('Multi-Screen.js - no default screen specified, top ms-container assumed');
			
		} else if (default_screen.length > 1) {

			default_screen = $(default_screen[0]);
			$('div.ms-default').not('div.ms-default:first').toggleClass('ms-default');
			console.warn('Multi-Screen.js - more than one default screen specified, top .ms-default assumed');

		}

		this.current_screen = default_screen;
		this.store_screens(screens);
		this.lock_navigation = false;
		this.switch_screen();
		
	} else {
	
		console.warn('Multi-Screen.js - zero or one screen(s) found, plugin disabled');
	
	}

}

// attach on-click event to all .ms-nav-links which takes the target screen and transition attributes and performs the switch
$.multi_screen.switch_screen = function() {

	$('.ms-nav-link').click(function(node) {
		
		// only do something if not already busy
		if ($.multi_screen.lock_navigation === false) {
		
			// lock screen switching until current switch is finished
			$.multi_screen.lock_navigation = true;
	
			var link = $(node.target);
				exit_str = link.attr('data-ms-exit'),
				enter_str = link.attr('data-ms-enter'),
				exit_time_str = link.attr('data-ms-exit-time'),
				enter_time_str = link.attr('data-ms-enter-time'),
				delay = link.attr('data-ms-delay');
				target = $.multi_screen.get_target_screen(link.attr('data-ms-target'));
				current = $.multi_screen.current_screen;
				
			// only do something if the target exists and is not equal to the current screen	
			if (target !== false && target[0] !== current[0]) {
			
				// store the switched in target as the current screen
				$.multi_screen.current_screen = target;
			
				var target_css = $.multi_screen.get_target_css(enter_str);
				var current_css = $.multi_screen.get_current_css(exit_str);
				
				// if a delay is specified, run the target animation inside the complete function of the current animation, outside otherwise
				if (typeof delay != 'undefined' && delay.toLowerCase() == 'true') {
				
					current.css(current_css.pre_css).animate(current_css.animate_css, $.multi_screen.get_switch_time(exit_time_str), function() {
					
						current.css(current_css.post_css);
						
						target.css(target_css.pre_css).animate(target_css.animate_css, $.multi_screen.get_switch_time(enter_time_str), function() {
					
							target.css(target_css.post_css);
							$.multi_screen.lock_navigation = false;
							
						});
					
					});
					
				} else {
				
					current.css(current_css.pre_css).animate(current_css.animate_css, $.multi_screen.get_switch_time(exit_time_str), function() {
					
						current.css(current_css.post_css);
					
					});
					
					target.css(target_css.pre_css).animate(target_css.animate_css, $.multi_screen.get_switch_time(enter_time_str), function() {
					
						target.css(target_css.post_css);
						$.multi_screen.lock_navigation = false;
						
					});
				
				}
				
			} else {
			
				console.warn('Multi-Screen.js - target is undefined or equal to current screen');
				$.multi_screen.lock_navigation = false;
				
			}
			
		}
	
	});

}

// determines the pre, animate, and post CSS for the target (entering) screen, defaults to west
$.multi_screen.get_target_css = function (input_str) {

	if (input_str == 'fade') {
	
		return {animate_css: {opacity: '1'}, pre_css: {display: 'block', opacity: '0', left: '0%', top: '0%'}, post_css: {position: 'absolute', zIndex: '2'}};
	
	} else if (input_str == 'east') {
	
		return {animate_css: {left: '+=-110%'}, pre_css: {display: 'block', left: '110%', top: '0%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	} else if (input_str == 'south') {
	
		return {animate_css: {top: '+=-110%'}, pre_css: {display: 'block', left: '0%', top: '110%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	} else if (input_str == 'north') {
	
		return {animate_css: {top: '+=110%'}, pre_css: {display: 'block', left: '0%', top: '-110%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	} else if (input_str == 'northwest') {
	
		return {animate_css: {left: '+=110%', top: '+=110%'}, pre_css: {display: 'block', left: '-110%', top: '-110%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	} else if (input_str == 'southeast') {
	
		return {animate_css: {left: '+=-110%', top: '+=-110%'}, pre_css: {display: 'block', left: '110%', top: '110%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	} else if (input_str == 'southwest') {
	
		return {animate_css: {top: '+=-110%', left: '+=110%'}, pre_css: {display: 'block', left: '-110%', top: '110%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	} else if (input_str == 'northeast') {
	
		return {animate_css: {top: '+=110%', left: '+=-110%'}, pre_css: {display: 'block', left: '110%', top: '-110%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	// west, or default	
	} else {
	
		if (typeof input_str != 'undefined' && input_str.length > 0 && input_str != 'west') {
		
			console.warn('Multi-Screen.js - enter direction invalid, default assumed (west)');
			
		}
	
		return {animate_css: {left: '+=110%'}, pre_css: {display: 'block', left: '-110%', top: '0%'}, post_css: {position: 'absolute', zIndex: '2'}};
		
	}

}

// determines the pre, animate, and post CSS for the current (exiting) screen, defaults to west
$.multi_screen.get_current_css = function (input_str) {

	if (input_str == 'fade') {
	
		return {animate_css: {opacity: '0'}, pre_css: {}, post_css: {display: 'none', opacity: '1', position: 'fixed', zIndex: '2'}};
	
	} else if (input_str == 'east') {
	
		return {animate_css: {left: '+=110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	} else if (input_str == 'south') {
	
		return {animate_css: {top: '+=110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	} else if (input_str == 'north') {
	
		return {animate_css: {top: '+=-110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	} else if (input_str == 'northwest') {
	
		return {animate_css: {left: '+=-110%', top: '+=-110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	} else if (input_str == 'northeast') {
	
		return {animate_css: {left: '+=110%', top: '+=-110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	} else if (input_str == 'southeast') {
	
		return {animate_css: {top: '+=110%', left: '+=110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	} else if (input_str == 'southwest') {
	
		return {animate_css: {top: '+=110%', left: '+=-110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	// west, or default	
	} else {
	
		if (typeof input_str != 'undefined' && input_str.length > 0 && input_str != 'west') {
		
			console.warn('Multi-Screen.js - exit direction invalid, default assumed (west)');
			
		}
	
		return {animate_css: {left: '+=-110%'}, pre_css: {position: 'fixed', zIndex: '1'}, post_css: {display: 'none'}};
		
	}

}

// determines the event time of the switching in ms, defaults to 500
$.multi_screen.get_switch_time = function (time_str) {

	if (typeof time_str != 'undefined') {
		
		if ($.isNumeric(time_str) && Math.floor(time_str) == time_str) {
		
			return parseInt(time_str);
		
		} else {
		
			console.warn('Multi-Screen.js - invalid event timing, default assumed (500ms)');
		
		}
			
	}
	
	// default
	return 500;

}

// takes in a jquery selection of the active screens and stores them associatively, indexed by id
$.multi_screen.store_screens = function (screens) {

	this.screens = new Object();

	$(screens).each(function() {
	
		$.multi_screen.screens[$(this).attr('id')] = this;
	
	});

}

// returns jquery object reference of target screen
$.multi_screen.get_target_screen = function (id) {

	// return the screen if the id is not empty and the screen exists, false otherwise
	if (typeof id != 'undefined' && id in this.screens) {
		
		return $(this.screens[id]);
		
	} else {
	
		return false;
	
	}

}