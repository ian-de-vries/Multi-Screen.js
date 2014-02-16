$(document).ready(function() {

	$.multi_screen.init();

});


$.multi_screen = new Object();

$.multi_screen.init = function() {

	var default_screen = $('.ms-default');
	
	if (default_screen.length == 0) {
		
		console.warn('Multi-Screen.js - no default screen specified, top ms-container assumed');
		$('.ms-container:first').toggleClass('ms-default');
		default_screen = $('.ms-default');
		
	}

	this.current_screen = default_screen;
	this.switch_screen();

}

$.multi_screen.switch_screen = function() {

	$('.ms-nav-link').click(function(e) {
	
		var link = $(e.target);
			exit_str = link.attr('data-ms-exit'),
			enter_str = link.attr('data-ms-enter'),
			target_str = link.attr('data-ms-target'),
			target = $('#' + target_str);
			
		if (target.length == 1 && target[0] !== $.multi_screen.current_screen[0]) {
		
			var target_css = $.multi_screen.get_target_css(enter_str);
			
			$.multi_screen.current_screen.css('position', 'fixed').animate($.multi_screen.get_current_animate_css(exit_str));
			target.css(target_css.pre_css).animate(target_css.animate_css, 500, function() {
			
				target.css('position', 'absolute');
				
			});
			
			$.multi_screen.current_screen = target;
			
		} else {
		
			console.warn('Multi-Screen.js - target is undefined or equal to current screen');
			
		}
	
	});

}

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