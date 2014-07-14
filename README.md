Multi-Screen.js v1.2.2
===============

A simple, lightweight, and easy to use jQuery plugin which turns a single page into a collection of screens with animated navigation.

## Usage disclaimer

As per the MIT License, this software is free to use and edit by anyone for any purpose. If you use this plugin, please drop me a line and let me know what you used it for (www.ian-devries.com/?page=contact). Comments, notes for improvement, and ideas for new features are also always welcome.

## Setting up your page
- Divide up the `<body>` of your HTML into `<div>` elements, giving them all the `ms-container` class (the plugin needs at least two to run), and build each screen inside. 
- Give the element you want as your default screen the class `ms-default`. If no default is specified, the top `ms-container` will be used, and if more than one default is found the top `ms-default` will be used.
- To facilitate navigation between screens, each one requires a unique `id` attribute.

``` html
<body>
    <div id="screen1" class="ms-container ms-default">
        <!-- screen1 content -->
    </div>
    <div id="screen2" class="ms-container">
        <!-- screen2 content -->
    </div>
</body>
```

## Build Navigation
To switch from one screen to another, simply give the class `ms-nav-link` to anything you can click on, and specify which screen to swap in for the current one by setting the target equal to its `id`. To define settings for the animation, the plugin recognizes the following attributes, and more specific attributes override less specific ones:
- `data-ms-target`: (REQUIRED) the target screen, must be the `id` of another screen
- `data-ms-animaton`: enter and exit animation, must be a valid animation command (see below)
- `data-ms-enter-animation`: enter animation, must be a valid animation command (see below)
- `data-ms-exit-animation`: exit animation, mist be a valid animation command (see below)
- `data-ms-time`: enter and exit animation time in milliseconds, must be a valid integer greater than 0
- `data-ms-enter-time`: enter animation time in milliseconds, must be a valid integer greater than 0
- `data-ms-exit-time`: exit animation time in milliseconds, must be a valid integer greater than 0
- `data-ms-scroll-time`: time in milliseconds spent scrolling up before animating if the page is not at the top , must be a valid integer greater than 0 (if 0 is input, the screen will snap to the top instead of scrolling)
- `data-ms-distance`: horizontal and vertical starting distance between the edge of the entering and exiting screens, must be a valid integer (can be negative)
- `data-ms-vertical-distance`: vertical starting distance between the edge of the entering and exiting screens, must be a valid integer (can be negative)
- `data-ms-horizontal-distance`: horizontal starting distance between the edge of the entering and exiting screens, must be a valid integer (can be negative)
- `data-ms-delay`: wait for the exit animation to finish before starting the enter animation (synchronous vs. asynchronous), must be `true` or `false`

### Example links

``` html
<!-- default animations -->
<a class="ms-nav-link" data-ms-target="welcome" href="javascript:void(0)">link</a>
 
<!-- specific animations -->
<a class="ms-nav-link" data-ms-target="welcome" data-ms-animation="fadeleft" data-ms-vertical-distance="0" href="javascript:void(0)">link</a>
<a class="ms-nav-link" data-ms-target="welcome" data-ms-exit-time="700" data-ms-enter-time="300" href="javascript:void(0)">link</a>
<a class="ms-nav-link" data-ms-target="welcome" data-ms-delay="true" href="javascript:void(0)">link</a>
```

### Valid animation commands
- `fade`
- `top`
- `topright`
- `right`
- `bottomright`
- `bottom`
- `bottomleft`
- `left`
- `topleft`
- `fadetop`
- `fadetopright`
- `faderight`
- `fadebottomright`
- `fadebottom`
- `fadebottomleft`
- `fadeleft`
- `fadetopleft`

## Navigating within your own JavaScript code
You can also navigate between screens within your own custom JavaScript code using the `switch_screens` function, or use the `get_current_screen` function to get the `id` of the current screen:

- `MultiScreen.switch_screens(Object options)` Navigates from the current screen to a target specified in the options;
    - `options` contains the target screen (REQUIRED) and animation commands (OPTIONAL) (see below);
    - Returns `true` if the animation was succesfully started, `false` if not.
- `MultiScreen.get_current_screen()`;
    - Returns the id of the current screen.

To specify the animation you want, the function recognizes the following properties in the `options` object:

``` js
var options = {	
    target_id:                  // id of the target screen (REQUIRED)
    animation_command:          // must be a valid animation command
	enter_animation_command:    // must be a valid animation command
	exit_animation_command:     // must be a valid animation command
	animation_time:             // milliseconds, must be an integer greater than 0
	enter_animation_time:       // milliseconds, must be an integer greater than 0
	exit_animation_time:        // milliseconds, must be an integer greater than 0
	scroll_time:                // milliseconds, must be an integer greater than 0
	delay:                      // must be a boolean
	distance:                   // pixels, must be an integer (can be negative)
	vertical_distance:          // pixels, must be an integer (can be negative), overrides distance
	horizontal_distance:        // pixels, must be an integer (can be negative), overrides distance
	chain_animation_options:    // options object for chaining navigations (see below)
}
```

### Chaining animations

The `options` object passed into the `switch_screens` function accepts another `options` object in the `chain_animations_options` property. After the animation finishes, the `switch_screens` function will be called again recursively with this object if specified to allow chained animations. See below for an example.

### Example manual navigation code

The JavaScript code below will take the input from a textbox with the id `screen-input` and try to navigate to the given screen when a user clicks on a button with the id `navigate` (with the default animation settings). If the animation was not initiated (because the screen does not exist, or an animation is already in progress) it will alert with an error:

``` js
$('#navigate').click(function() {

   if (!MultiScreen.switch_screens({target_id: $('#screen-input').val()})) {
   
        alert('Navigation failed!');
   
   }

});
```

When a link with the id `leap-over-center` is clicked, the JavaScript code below will use the default animation settings to navigate to the screen with the id `right-screen` but pass over the screen with the id `center-screen` first:

``` js
$('#leap-over-center').click(function() {

   MultiScreen.switch_screens({target_id: 'center-screen', chain_animation_options: {target_id: 'right_screen'}})) {
   
});
```

## Installation
- Download the latest version and extract the Multi-Screen JS and CSS files.
- Link the JS and CSS files in the `<head>` of your page (or copy and paste the styles into your own stylesheet).
- Call the `MultiScreen.init()` function in your JavaScript code (or do it like the example below).

``` html
<head>
        <!-- latest jQuery -->
        <script type="text/javascript" src="http://code.jquery.com/jquery-latest.pack.js"></script>

        <!-- link the css and js scripts -->
        <link href="multi-screen-css.css" type="text/css" rel="stylesheet"/>
        <script type="text/javascript" src="multi-screen.js"></script>
        
        <!-- run the plugin -->
        <script type="text/javascript">$(document).ready(function() { MultiScreen.init(); });</script>
</head>
```

## Setting default values
Multi-Screen.js makes it easy to change the defaults for the animations, their times, the starting distance between the entering and exiting screens, and whether the animations should occur synchronously or asynchronously. The functions below each return a boolean (`true` if default was succesfully changed or `false` if not).

- `MultiScreen.set_default_animation(String command, String type)` Sets the default animation;
    - `command` must be a valid animation command;
    - `type` must be 'enter' or 'exit' (OPTIONAL).
- `MultiScreen.set_default_time(Number time, String type)` Sets the default animation time in milliseconds;
    - `time` must be a valid integer greater than 0;
    - `type` must be 'enter' or 'exit' or 'scroll' (OPTIONAL).
- `MultiScreen.set_default_distance(Number distance, String dimension)` Sets the default starting distance between the edge of the entering and exiting screens in pixels;
    - `distance` must be a valid integer (can be negative);
    - `dimension` must be 'vertical' or 'horizontal' (OPTIONAL).
- `MultiScreen.set_default_delay(Boolean delay)` Sets the default delay between the enter and exit animations;
    - `delay` must be a boolean.
- `MultiScreen.set_defaults(Object options)` Sets the defaults by property;
    - `options` must be an object containing a value for each property to set (see below).

You can also set the defaults by passing an object with properties into the `init' function when initializing the plugin:
- `MultiScreen.init(Object options)` Initializes the plugin; 
    - `options` must be an object containing a value for each property to set (see below) (OPTIONAL).

### Using an object to set the defaults

The plugin recognizes the following properties to set the defaults when passed in through an object:

``` js
var options = {
    default_animation:              // must be a valid animation command
    default_enter_animation:        // must be a valid animation command, overrides default_animation
    default_exit_animation:         // must be a valid animation command, overrides default_animation
    default_time:                   // milliseconds, must be an integer greater than 0
    default_scroll_time:            // milliseconds, must be an integer greater than or equal to 0
    default_enter_time:             // milliseconds, must be an integer greater than 0, overrides default_time
    default_exit_time:              // milliseconds, must be an integer greater than 0, overrides default_time
    default_distance:               // pixels, must be an integer (can be negative)
    default_vertical_distance:      // pixels, must be an integer (can be negative), overrides default_distance
    default_horizontal_distance:    // pixels, must be an integer (can be negative), overrides default_distance
    default_delay:                  // must be a boolean
}
```

### Initial defaults

- default animation: `fade`
- default animation time: `500`
- default scroll time: `200`
- default distance: `200`
- default delay: `false`
