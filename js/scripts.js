$(document).ready(function() {

	/////////////////////////////////////////////////////////
	// VARIABLES ////////////////////////////////////////////
	/////////////////////////////////////////////////////////

	var currX = new Array();
	var currY = new Array();
	var prevX = 0;
	var prevY = 0;
	var mouseTolerance = 2;
	var stop = false;
	var copyText = $("div#button p").html();
	
	var buttonHtml = $("div#button").html();
	var fallbackButtonHtml = '<div id="link-fallback"><p>Share link</p><input type="text" name="url" value=""></input></div>';

	var randomMethod;
	var randomColor1;
	var randomColor2;
	var randomSize;
	var randomDirection;
	var randomOperators;
	//var randomDivision;
	//var layerCounter;
	
	var urlRoot = "http://lab.juremartinec.net/patternator/";
	var urlVars = getVarsFromUrl();

	var background = new Array();
	var backgroundSize;
	
	var cssShown = false;
	
	var operators = [add, subtract, multiply]
	
	/////////////////////////////////////////////////////////



	// INITIALISATION ///////////////////////////////////////

	// check for flash
	flash = swfobject.hasFlashPlayerVersion("9.0.0");

	// if pattern in url
	if(urlVars.length == 6) {
			
		// put interface to working state
		$("div#content").children().hide();
		showInterface();
		prevX = 1;
		prevX = 1;
		
		// get variables from url
		randomMethod = parseInt(urlVars["method"]);
		randomColor1 = urlVars["color1"];
		randomColor2 = urlVars["color2"]
		randomSize = urlVars["size"];
		randomDirection = parseInt(urlVars["direction"]);
		randomOperators = urlVars["operators"].split(",");
		
		// set pattern
		generatePattern();
		setPatternCSS();
		stopRandomising();
		
		generateUrlQuery();

	}
	else {
		// put interface to initial state
		$("div#share").fadeTo(0,0);
		$("div#content p").hide();
		$("div#HUD").children().not("div#share").hide();
		$("p#explore").show();
	}
			
	// MOUSE ACTIONS ////////////////////////////////////////
	
	// when mouse moves
	$("body").mousemove(function(event) {
		
		fireMovement();

	});

	// prevent scrolling and _something I can't remember_ effect
	document.ontouchmove = function(event){
		event.preventDefault();
		fireMovement();
	}
		

	// on click
	$("div.pattern").click(function(event) {
	
		event.preventDefault();
		
		// if css displayed
		if( cssShown == false ) {
			
			// if randomisation stopped
			if(stop) { continueRandomising(); }
			// if randomisation active
			else { stopRandomising(); }
			
			setPatternCSS(randomMethod);
			
			// get pattern url
			generateUrlQuery();
						
			// IF HAS FLASH
			if ( flash = true ) {
				$("div#button").attr('data-clipboard-text', urlRoot+urlQuery);
			}
			// IF NO FLASH
			else {
				$("div#button").html(buttonHtml);
			}

		}
		// if css hidden
		else {
			
			hideCSS();
			
		}
		
		return false;
				
	});	
	
	if(flash == false) {
		$("div#button").hover(
			function(){
				$("div#button").addClass("zeroclipboard-is-hover");
			},
			function(){
				$("div#button").removeClass("zeroclipboard-is-hover");
			}
		);
	}

	// on button click (possible only when no flash detected, otherwise ZeroClipboard overlays a div)
	$("div#button").click(function() {
		
		$("div#button").addClass("copied").html(fallbackButtonHtml);
		$("div#button p").addClass("copied");
		$("div#button input").val(urlRoot+urlQuery);
		$("div#button input").focus().select();


	});;

	
	
	// CLIPBOARD ////////////////////////////////////////////

	var clip = new ZeroClipboard( $("div#button"), {
		moviePath: "./images/ZeroClipboard.swf"
	});
		
	clip.on( 'complete', function(client, args) {
		//this.style.display = 'none'; // "this" is the element that was clicked
		$("div#button p").html("Link copied. Now share!").addClass("copied");
		$("div#button").addClass("copied");
		//alert("Copied text to clipboard: " + args.text );
	});

/*
	clip.on( 'load', function(client) {
		//alert( "movie is loaded" );
	});

	clip.on( 'mouseover', function(client) {
		// alert("mouse over");
	});
	
	clip.on( 'mouseout', function(client) {
		// alert("mouse out");
	});
*/


	// CSS CODE DISPLAY /////////////////////////////////////
	
    $("p#css-show a").click( function(event) {
    
    	event.preventDefault();
    	
    	showCSS();

    });
    
    $("p#css-hide a").click( function(event) {
    
    	event.preventDefault();
    	
    	hideCSS();
    	
    });




	/////////////////////////////////////////////////////////
	// FUNCTIONS ////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	
	function fireMovement() {
	
		// if first mouse move
		if(prevX == 0 && prevY == 0) {
			showInterface();
		}
		
		// get mouse location
		currX.push(event.pageX);
		currY.push(event.pageY);
		
		if(typeof currX[2]  != 'undefined') {
				
			// check tolerance for X-axis
			if( Math.abs(prevX-currX[2]) > mouseTolerance ) {
			
				// if moved left
				if(prevX > currX[2]) {
					change("pattern", "left");
				}
				// if moved right
				else if(prevX < currX[2]) {
					change("pattern", "right");
				}
				
				// mark position where move detected
				prevX = currX[2];
							
			}
			
			currX = []
		}
			
		if(typeof currY[2] != 'undefined') {
			
			// check tolerance for Y-axis
			if( Math.abs(prevY-currY[2]) > mouseTolerance ) {
				
				// if moved up
				if(prevY > currY[2]) {
					change("color", "up");
				}
				// if moved down
				else if(prevY < currY[2]) {
					change("color", "down");
				}
	
				// mark position where move detected
				prevY = currY[2];
	
			}
			
			currY = []			
		}				

	}
	
	function showInterface() {
		// show interface elements
		$("div.pattern").show();
		$("div#content div#HUD, div#content p, div#share").not("p.css-link").fadeTo(1000,1);
		$("p#explore").hide();
	}

	function continueRandomising() {
		stop = false;
		$("div.pattern").css('cursor','pointer');
		$("div#button").animate({ height: 'toggle', width: 'toggle',  opacity: '0.25' }, 60).removeClass().html(buttonHtml);
		$("div#button p").hide();
		$("p#css-show").fadeOut(60);
	}
	
	function stopRandomising() {
		stop = true;
		$("div.pattern").css('cursor','default');
		$("div#button").animate({ height: 'toggle', width: 'toggle', opacity: '1' }, 20);
		$("div#button p").show();
		
		if( $("p#css-hide").is(':visible') == false ) {
			$("p#css-show").fadeIn(30);
		}
	}

	function showCSS() {
	
		cssShown = true;
		
    	stopRandomising();

	    $("div#content").animate({ left: '-85%', right: '85%' }, 300);
	    $("div#css").animate({ left: '15%' }, 300);	

	    $("p#css-show").fadeOut(150);
	    $("p#css-hide").fadeIn(150);
   		//$("div#content div#HUD").fadeOut(300);

	    $("div.pattern").css('cursor','pointer');

	}
	
	function hideCSS() {
	
		cssShown = false;
		
    	stopRandomising();

	    $("div#content").animate({ left: '0', right: '0' }, 300);
	    $("div#css").animate({ left: '100%' }, 300);	

	    $("p#css-hide").fadeOut(150);
	    $("p#css-show").fadeIn(150);
		$("div#content div#HUD").fadeIn(1000);	    

	    $("div.pattern").css('cursor','auto');
		
	}
	
	// EVOKE CHANGES
	function change(what, mouseDirection) {
		
		// if not stopped
		if(stop == false) {
		
			if(what == "pattern") {
				
				randomMethod = randomNumber(0,2,0);
				
				// randomise size
				randomSize = randomNumber(0.5,5,1);
				
				// randomise direction and round by 15
				randomDirection = randomNumber(-360,360,0);
				
				// randomise which operator to choose when calulating angles
				randomOperators = [randomNumber(0,2,0),randomNumber(0,2,0),randomNumber(0,2,0),randomNumber(0,2,0),randomNumber(0,2,0),randomNumber(0,2,0)];

				// randomise position
				//randomDivision = randomNumber(2,6,0);
				
				//
				//layerCounter = randomNumber(1,4,0);
				
			}
			else if(what == "color") {
				
				var red1 = randomNumber(0, 255, 0);
				var green1 = randomNumber(0, 255, 0);
				var blue1 = randomNumber(0, 255, 0);
				var alpha1 = randomNumber(0.01, 1, 2);

				var red2 = randomNumber(0, 255, 0);
				var green2 = randomNumber(0, 255, 0);
				var blue2 = randomNumber(0, 255, 0);
				var alpha2 = randomNumber(0.01, 1, 2);
			
				randomColor1 = "rgba(" + red1 + "," + green1 + "," + blue1 + "," + alpha1 + ")";
				randomColor2 = "rgba(" + red2 + "," + green2 + "," + blue2 + "," + alpha2 + ")";
			
			}
			
			// set pattern
			generatePattern();
			
		}

	}
	
	function generatePattern() {
	
		// empty parameters
		background = [];
		backgroundSize = "";

/*	
		var directions = ["-45","-135", "-225", "45"];
		
		for(i=1; i<=layerCounter; i++) {
			
			// first background constructor
			layer = "linear-gradient("+directions[i-1]*randomDirection+"deg, ";
						
			unit = 100/randomDivision;
			
			j=1;
			
			for(j=1; j<randomDivision-1; j++) {
				if(j%2 == randomMethod) {
					layer += "transparent "+(j*unit)+"%, "+randomColor1+" "+(j*unit)+"%, ";
				}
				else {
					layer += randomColor1+" "+(j*unit)+"%, transparent "+(j*unit)+"%, ";
				}
			}
			
			if(randomDivision % 2 == randomMethod) {
				layer += randomColor1+" "+(j*unit)+"%, transparent "+(j*unit)+"%) 0 0";
			}
			else {
				layer += "transparent "+(j*unit)+"%, "+randomColor1+" "+(j*unit)+"%) "+(randomSize/2)+"em "+((0-randomSize/layerCounter-1))+"em ";
			}
			
			background.push(layer);
			
		}
		
		background.push(randomColor2);

		backgroundSize = randomSize+"em "+(randomSize*2)+"em";

*/

		// select proper pattern
		switch(randomMethod) {
		
			case 0:
			
				background.push("linear-gradient("+operators[randomOperators[0]](-25,randomDirection)+"deg, transparent 75%, "+randomColor1+" 75%) 0 0");
				background.push("linear-gradient("+operators[randomOperators[1]](-155,randomDirection)+"deg, transparent 75%, "+randomColor1+" 75%) 0 0");
				background.push("linear-gradient("+operators[randomOperators[2]](-25,randomDirection)+"deg, transparent 75%, "+randomColor1+" 75%) "+(randomSize/2)+"em "+(0-randomSize)+"em");
				background.push("linear-gradient("+operators[randomOperators[3]](-155,randomDirection)+"deg, transparent 75%, "+randomColor1+" 75%) "+(randomSize/2)+"em "+(0-randomSize)+"em");
				background.push(randomColor2);
				
				backgroundSize = randomSize+"em "+(randomSize*2)+"em";
				
				break;
								
			case 1:
			
				background.push("linear-gradient("+operators[randomOperators[0]](-45,randomDirection)+"deg, "+randomColor1+" 25%, transparent 25%) "+((0-randomSize)/2)+"em 0");
				background.push("linear-gradient("+operators[randomOperators[1]](-135,randomDirection)+"deg, "+randomColor1+" 25%, transparent 25%) "+((0-randomSize)/2)+"em 0");
				background.push("linear-gradient("+operators[randomOperators[2]](-225,randomDirection)+"deg, "+randomColor1+" 25%, transparent 25%)");
				background.push("linear-gradient("+operators[randomOperators[3]](45,randomDirection)+"deg, "+randomColor1+" 25%, transparent 25%)");
				background.push(randomColor2);
				
				backgroundSize = randomSize+"em "+randomSize+"em";
				
				break;

			case 2:
						
				background.push("linear-gradient("+operators[randomOperators[0]](45,randomDirection)+"deg, "+randomColor1+" 12.5%, transparent 12.5%, transparent 37.5%, "+randomColor1+" 37.5%, "+randomColor1+" 62.5%, transparent 62.5%, transparent 87.5%, "+randomColor1+" 87.5%)");
				background.push(randomColor2);
				
				backgroundSize = randomSize+"em "+randomSize+"em";

				break;
								
			case 3:
			
				// PROBAJ RADIAL GRADIENT, poprav randomMethod na 3
				
				break;

		}
				
		// apply pattern as div layers	
		var i = 1;
		$("div.pattern").each( function() {
		
			// reset div css
			$(this).css('background','');
			$(this).css('background-size','');
			
			// if something to apply
			if(i <= background.length) {
				// apply new div css
				$(this).css('background', background[background.length-i]);
				$(this).css('background-size', backgroundSize);
				i++;
			}
			else {
				// break
				return;
			}
		});
				
	}
	
	
	// clipboard css generator
	function setPatternCSS() {
	
		var css;
		
		// go through all background attributes
		for(var i=0; i < background.length; i++) {
			
			// if first background attribute
			if(i==0) {
				css = "background: <br>"+background[0]+", <br>";
			}
			// if last attribute
			else if(i == background.length-1 ) {
				css += background[i]+"; <br><br>background-size: "+backgroundSize+";";
			}
			// if middle attributes
			else {
				css += background[i]+", <br>";
			}
		}
		
		$("div#css").html(css);
		
	}
		
	// Read a page's GET URL variables and return them as an associative array.
	function getVarsFromUrl()
	{
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	}
	
	// generate pattern url
	function generateUrlQuery() {
		
		urlQuery = "?method="+randomMethod+"&color1="+randomColor1+"&color2="+randomColor2+"&size="+randomSize+"&direction="+randomDirection+"&operators="+randomOperators[0]+","+randomOperators[1]+","+randomOperators[2]+","+randomOperators[3]+","+randomOperators[4]+","+randomOperators[5];
		
	}
	
	function randomNumber(min,max,dec) {
	
		// get random number
		var num = Math.random();

		// put in defined range
		num = num * (max - min) + min;
		
		// get defined decimal points -> decimal => 1, 2, 3 = 0.1, 0.01, 0.001
		num = Math.round( num * Math.pow(10, dec) )/Math.pow(10, dec);
		
		// return number
    	return num;
    	
	}
	
	function randomBoolean() {
    	
    	if( Math.random() >= 0.5 ) {
	    	return true;
    	}
    	else {
	    	return false;
    	}
    }
	
	function add(a,b) { return a+b; }
	function subtract(a,b) { return a-b; }
	function multiply(a,b) { return a*b; }
	
});