$(document).ready(function() {

	$('body').attr('data-ms-current', $('.ms-enter').attr('id'));

	$('.ms-nav-link').on('click', function(e) {
	
		var exit_str = $(this).attr('data-ms-exit'),
			enter_str = $(this).attr('data-ms-enter'),
			target_str = $(this).attr('data-ms-target'),
			body = $("body"),
			current = $('#' + body.attr('data-ms-current')),
			target = $('#' + target_str),
			target_css = $.get_target_css(enter_str);
			
			current.css("position", "fixed").animate($.get_current_animate_css(exit_str));
			target.css(target_css.pre_css).animate(target_css.animate_css, 500, function() {
			
				target.css("position", "absolute");
				
			});
			
			body.attr('data-ms-current', target_str);
	
	});

});


$.get_current_animate_css = function (input_str) {

	if (input_str == 'west') {
	
		return {left: "+=-110%"};
		
	} else if (input_str == 'east') {
	
		return {left: "+=110%"};
		
	} else if (input_str == 'south') {
	
		return {top: "+=110%"};
		
	} else if (input_str == 'north') {
	
		return {top: "+=-110%"};
		
	} else if (input_str == 'northwest') {
	
		return {left: "+=-110%", top: "+=-110%"};
		
	} else if (input_str == 'northeast') {
	
		return {left: "+=110%", top: "+=-110%"};
		
	} else if (input_str == 'southeast') {
	
		return {top: "+=110%", left: "+=110%"};
		
	} else if (input_str == 'southwest') {
	
		return {top: "+=110%", left: "+=-110%"};
		
	} else {
	
		return {};
		
	}

}

$.get_target_css = function (input_str) {

	if (input_str == 'west') {
	
		return {animate_css: {left: "+=110%"}, pre_css: {left: '-110%', top: '0%'}};
		
	} else if (input_str == 'east') {
	
		return {animate_css: {left: "+=-110%"}, pre_css: {left: '110%', top: '0%'}};
		
	} else if (input_str == 'south') {
	
		return {animate_css: {top: "+=-110%"}, pre_css: {left: '0%', top: '110%'}};
		
	} else if (input_str == 'north') {
	
		return {animate_css: {top: "+=110%"}, pre_css: {left: '0%', top: '-110%'}};
		
	} else if (input_str == 'northwest') {
	
		return {animate_css: {left: "+=110%", top: "+=110%"}, pre_css: {left: '-110%', top: '-110%'}};
		
	} else if (input_str == 'southeast') {
	
		return {animate_css: {left: "+=-110%", top: "+=-110%"}, pre_css: {left: '110%', top: '110%'}};
		
	} else if (input_str == 'southwest') {
	
		return {animate_css: {top: "+=-110%", left: "+=110%"}, pre_css: {left: '-110%', top: '110%'}};
		
	} else if (input_str == 'northeast') {
	
		return {animate_css: {top: "+=110%", left: "+=-110%"}, pre_css: {left: '110%', top: '-110%'}};
		
	} else {
	
		return {};
		
	}

}