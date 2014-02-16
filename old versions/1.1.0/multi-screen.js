$(document).ready(function() {

	$.multi_screen.init();

});


$.multi_screen = new Object();

$.multi_screen.init = function() {

	if ($('.ms-container').length > 0) {

		var default_screen = $('.ms-default');
		
		if (default_screen.length == 0) {
			
			$('.ms-container:first').toggleClass('ms-default');
			default_screen = $('.ms-default');
			console.warn('Multi-Screen.js - no default screen specified, top ms-container assumed');
			
		}

		this.current_screen = default_screen;
		this.switch_screen();
		
	} else {
	
		console.warn('Multi-Screen.js - no .ms-container found, plugin disabled');
	
	}

}

$.multi_screen.switch_screen = function() {

	$('.ms-nav-link').click(function(node) {
	
		var link = $(node.target);
			exit_str = link.attr('data-ms-exit'),
			enter_str = link.attr('data-ms-enter'),
			target_str = link.attr('data-ms-target'),
			exit_time_str = link.attr('data-ms-exit-time'),
			enter_time_str = link.attr('data-ms-enter-time'),
			target = $('#' + target_str);
			
		if (typeof target != 'undefined' && target.length == 1 && target[0] !== $.multi_screen.current_screen[0]) {
		
			var target_css = $.multi_screen.get_target_css(enter_str);
			
			$.multi_screen.current_screen.css({position: 'fixed', zIndex: '1'}).animate($.multi_screen.get_current_animate_css(exit_str), $.multi_screen.get_switch_time(exit_time_str));
			target.css(target_css.pre_css).animate(target_css.animate_css, $.multi_screen.get_switch_time(enter_time_str), function() {
			
				target.css({position: 'absolute', zIndex: '2'});
				
			});
			
			$.multi_screen.current_screen = target;
			
		} else {
		
			console.warn('Multi-Screen.js - target is undefined or equal to current screen');
			
		}
	
	});

}

// Here's how the logic works:
// -- pre_css will position the screen in the corner or side of origin, animate_css is the inverse such that pre_css + animate_css equates to left and top at zero
$.multi_screen.get_target_css = function(input_str) {

	if (input_str == 'east') {
	
		return {animate_css: {left: '+=-110%'}, pre_css: {left: '110%', top: '0%'}};
		
	} else if (input_str == 'south') {
	
		return {animate_css: {top: '+=-110%'}, pre_css: {left: '0%', top: '110%'}};
		
	} else if (input_str == 'north') {
	
		return {animate_css: {top: '+=110%'}, pre_css: {left: '0%', top: '-110%'}};
		
	} else if (input_str == 'northwest') {
	
		return {animate_css: {left: '+=110%', top: '+=110%'}, pre_css: {left: '-110%', top: '-110%'}};
		
	} else if (input_str == 'southeast') {
	
		return {animate_css: {left: '+=-110%', top: '+=-110%'}, pre_css: {left: '110%', top: '110%'}};
		
	} else if (input_str == 'southwest') {
	
		return {animate_css: {top: '+=-110%', left: '+=110%'}, pre_css: {left: '-110%', top: '110%'}};
		
	} else if (input_str == 'northeast') {
	
		return {animate_css: {top: '+=110%', left: '+=-110%'}, pre_css: {left: '110%', top: '-110%'}};
		
	// west, or default	
	} else {
	
		if (typeof input_str != 'undefined' && input_str.length > 0 && input_str != 'west') {
		
			console.warn('Multi-Screen.js - enter direction invalid, default assumed (west)');
			
		}
	
		return {animate_css: {left: '+=110%'}, pre_css: {left: '-110%', top: '0%'}};
		
	}

}

// Here's how the logic works:
// -- screens can safely "hide" (with position fixed) to the right (east) regardless of their width and height, since their z-index is lower than the current screen
$.multi_screen.get_current_animate_css = function (input_str) {

	if (input_str == 'east') {
	
		return {left: '+=110%'};
		
	} else if (input_str == 'south') {
	
		return {top: '+=110%'};
		
	} else if (input_str == 'north') {
	
		return {top: '+=-110%'};
		
	} else if (input_str == 'northwest') {
	
		return {left: '+=-110%', top: '+=-110%'};
		
	} else if (input_str == 'northeast') {
	
		return {left: '+=110%', top: '+=-110%'};
		
	} else if (input_str == 'southeast') {
	
		return {top: '+=110%', left: '+=110%'};
		
	} else if (input_str == 'southwest') {
	
		return {top: '+=110%', left: '+=-110%'};
		
	// west, or default	
	} else {
	
		if (typeof input_str != 'undefined' && input_str.length > 0 && input_str != 'west') {
		
			console.warn('Multi-Screen.js - exit direction invalid, default assumed (west)');
			
		}
	
		return {left: '+=-110%'};
		
	}

}

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