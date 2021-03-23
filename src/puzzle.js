/* globals Deferred, js */

let loaders = [];
let imgpath = './img';
let imageloadprogress = 0;
let imageloadtotal = 0;

let allimages = [
	{
		name: 'pictures',
		images: ['city.jpg'],
		dir: ''
	}
];

//preload images
function loadFile(src, array, num) {
	console.log('Load file ', src);
	let promise = new Promise((resolve) => {
		let sprite = new Image();
		console.log('promise for ', src);
		sprite.onload = function () {
			console.log('File loaded', src);
			array[num] = sprite;
			imageloadprogress++;
			resolve();
			//document.getElementById('loading').style.width = (imageloadprogress / imageloadtotal) * 100 + '%';
		};
		sprite.src = src;
	});
	return promise;
}

//loop through and call all the preload images
function callAllPreloads(array, dir) {
	for (let z = 0; z < array.length; z++) {
		loaders.push(loadFile(dir + array[z], array, z));
	}
}

for (let im = 0; im < allimages.length; im++) {
	imageloadtotal += allimages[im].images.length;
	callAllPreloads(allimages[im].images, imgpath + allimages[im].dir + '/');
}

function NewPiece(x, y, w, h, solvedx, solvedy, spritex, spritey, rowx, rowy) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.solvedx = solvedx;
	this.solvedy = solvedy;
	this.spritex = spritex;
	this.spritey = spritey;
	this.visible = 1;
	this.solved = 0;
	this.offsetx = -1;
	this.offsety = -1;
	this.rowx = rowx;
	this.rowy = rowy;
}

(function (window, undefined) {
	let js = {
		canvas: 0,
		ctx: 0,
		canvasw: 0,
		canvash: 0,
		canvasTopLeft: 0,
		canvasTopRight: 0,
		canvasBottomLeft: 0,
		canvasBottomRight: 0,
		savedcanvasw: 0,
		savedcanvash: 0,
		idealw: 1, //gets set later based on image size
		idealh: 1,
		canvasmode: 1,
		piececountx: 6, //number of pieces across
		piececounty: 3, //number of pieces down
		puzzle: 0,
		pieces: [],
		solvedpieces: [],
		clickedpiece: -1,
		debug: 0,

		general: {
			init: function () {
				js.canvas = document.getElementById('canvas');
				if (!js.canvas.getContext) {
					document.getElementById('canvas').innerHTML =
						'Your browser does not support canvas. Sorry.';
				} else {
					js.ctx = js.canvas.getContext('2d');
					js.general.initPuzzle();
					this.setupEvents();
					setInterval(js.general.drawPieces, 10);
				}
			},

			initPuzzle: function () {
				js.puzzle = allimages[0].images[0];
				js.idealw = js.puzzle.width;
				js.idealh = js.puzzle.height;
				js.general.initCanvasSize();
				js.savedcanvasw = js.canvasw;
				js.savedcanvash = js.canvash;
				js.piececountx = 6;
				js.piececounty = 3;
				document.getElementById('piecesx').value = js.piececountx;
				document.getElementById('piecesy').value = js.piececounty;
				js.general.createPieces();
			},

			//initialise the size of the canvas based on the ideal aspect ratio and the size of the parent element
			initCanvasSize: function () {
				let parentel = document.getElementById('canvasparent');
				let targetw = parentel.offsetWidth;
				let targeth = parentel.offsetHeight;

				let sizes = js.general.calculateAspectRatio(
					js.idealw,
					js.idealh,
					targetw,
					targeth
				);
				js.canvas.width = js.canvasw = sizes[0];
				js.canvas.height = js.canvash = sizes[1];
				/*
				//resize the canvas to maintain aspect ratio depending on screen size (may result in gaps either side) - we're using this one
				if(js.canvasmode === 1){
				}
				//make canvas always full width, with appropriately scaled height (may go off bottom of page)
				else {
					js.canvas.width = targetw;
					let scaleh = js.general.calculatePercentage(targetw,js.idealw);
					js.canvas.height = (js.idealh / 100) * scaleh;
				}
				*/
			},

			//given a width and height representing an aspect ratio, and the size of the containing thing, return the largest w and h matching that aspect ratio
			calculateAspectRatio: function (idealw, idealh, parentw, parenth) {
				let aspect = Math.floor((parenth / idealh) * idealw);
				let cwidth = Math.min(idealw, parentw);
				let cheight = Math.min(idealh, parenth);
				let w = Math.min(parentw, aspect);
				let h = (w / idealw) * idealh;
				return [w, h];
			},

			//returns the percentage amount that object is of wrapper
			calculatePercentage: function (object, wrapper) {
				return (100 / wrapper) * object;
			},

			clearCanvas: function () {
				js.canvas.width = js.canvas.width; //this is apparently a hack but seems to work
			},

			resizeCanvas: function () {
				js.general.initCanvasSize();
				let diffx = (js.canvasw / js.savedcanvasw) * 100;
				let diffy = (js.canvash / js.savedcanvash) * 100;
				for (let p = 0; p < js.pieces.length; p++) {
					js.pieces[p].x = (js.pieces[p].x / 100) * diffx;
					js.pieces[p].y = (js.pieces[p].y / 100) * diffy;
					js.pieces[p].w = (js.pieces[p].w / 100) * diffx;
					js.pieces[p].h = (js.pieces[p].h / 100) * diffy;
					js.pieces[p].solvedx = (js.pieces[p].solvedx / 100) * diffx;
					js.pieces[p].solvedy = (js.pieces[p].solvedy / 100) * diffy;
				}
				for (p = 0; p < js.solvedpieces.length; p++) {
					js.solvedpieces[p].x = (js.solvedpieces[p].x / 100) * diffx;
					js.solvedpieces[p].y = (js.solvedpieces[p].y / 100) * diffy;
					js.solvedpieces[p].w = (js.solvedpieces[p].w / 100) * diffx;
					js.solvedpieces[p].h = (js.solvedpieces[p].h / 100) * diffy;
					js.solvedpieces[p].solvedx =
						(js.solvedpieces[p].solvedx / 100) * diffx;
					js.solvedpieces[p].solvedy =
						(js.solvedpieces[p].solvedy / 100) * diffy;
				}
				js.savedcanvasw = js.canvasw;
				js.savedcanvash = js.canvash;
			},

			resetPuzzle: function () {
				document.getElementById('options').className = 'optionswrapper';
				document.getElementById('body').className = '';
				js.general.initPuzzle();
			},

			randomNumber: function (min, max) {
				return Math.random() * (max - min) + min;
			},

			//click events
			setupEvents: function () {
				let ondown =
					document.ontouchstart !== null ? 'mousedown' : 'touchstart';
				js.canvas.addEventListener(
					ondown,
					function (e) {
						let clicked = js.general.clickDown(e);
						js.general.clickPiece(clicked[0], clicked[1]);
					},
					false
				);

				let onup = document.ontouchstart !== null ? 'mouseup' : 'touchend';
				js.canvas.addEventListener(
					onup,
					function (e) {
						js.general.releasePiece();
					},
					false
				);

				let onmove = document.ontouchstart !== null ? 'mousemove' : 'touchmove';
				js.canvas.addEventListener(
					onmove,
					function (e) {
						if (js.clickedpiece !== -1) {
							js.general.movePiece(e);
						}
					},
					false
				);

				let onupdate =
					document.ontouchstart !== null ? 'mousedown' : 'touchstart';
				document.getElementById('updatePuzzle').addEventListener(
					onupdate,
					function (e) {
						js.general.updateSettings();
					},
					false
				);

				let showoptions =
					document.ontouchstart !== null ? 'mousedown' : 'touchstart';
				document.getElementById('showoptions').addEventListener(
					showoptions,
					function (e) {
						document.getElementById('options').className =
							'optionswrapper shown';
					},
					false
				);
				let hideoptions =
					document.ontouchstart !== null ? 'mousedown' : 'touchstart';
				document.getElementById('hideoptions').addEventListener(
					hideoptions,
					function (e) {
						document.getElementById('options').className = 'optionswrapper';
					},
					false
				);
				let reset = document.ontouchstart !== null ? 'mousedown' : 'touchstart';
				document.getElementById('resetPuzzle').addEventListener(
					reset,
					function (e) {
						js.general.resetPuzzle();
					},
					false
				);
			},

			//find where on the canvas the mouse/touch is
			clickDown: function (e) {
				let rect = js.canvas.getBoundingClientRect();
				let x = e.clientX - rect.left;
				let y = e.clientY - rect.top;
				if (typeof e.changedTouches !== 'undefined') {
					x = e.changedTouches[0].pageX - rect.left;
					y = e.changedTouches[0].pageY - rect.top;
				}
				return [x, y];
			},

			//identify which piece has been clicked on
			clickPiece: function (x, y) {
				for (let i = js.pieces.length - 1; i >= 0; i--) {
					if (js.general.checkCollision(js.pieces[i], x, y)) {
						js.clickedpiece = i;
						js.general.hideAllPieces();
						js.pieces[i].visible = 1;
						js.pieces[i].offsetx = x - js.pieces[i].x;
						js.pieces[i].offsety = y - js.pieces[i].y;
						break;
					}
				}
			},

			//let go of the current piece
			releasePiece: function () {
				if (js.clickedpiece !== -1) {
					for (let p = 0; p < js.pieces.length; p++) {
						js.pieces[p].visible = 1;
					}
					js.pieces[js.clickedpiece].offsetx = 0;
					js.pieces[js.clickedpiece].offsety = 0;
					let solved = js.general.checkSolved(js.pieces[js.clickedpiece]);

					if (!solved) {
						//move selected piece to the end of the array - makes last touched piece always be on top
						let tmp = js.pieces[js.clickedpiece];
						js.pieces.splice(js.clickedpiece, 1);
						js.pieces.push(tmp);
					}

					js.clickedpiece = -1;

					if (js.pieces.length === 0) {
						document.getElementById('body').className = 'solved';
					}
				}
			},

			//once selected, move a piece with the mouse
			movePiece: function (e) {
				let movement = js.general.clickDown(e);
				let thispiece = js.pieces[js.clickedpiece];
				let posx = movement[0] - thispiece.offsetx;
				let posy = movement[1] - thispiece.offsety;
				// limit the movement to within the canvas frame
				let x = Math.min(Math.max(0, posx), js.canvasw - thispiece.w);
				let y = Math.min(Math.max(0, posy), js.canvash - thispiece.h);
				thispiece.x = x;
				thispiece.y = y;
			},

			//once finished moving a piece, check to see if it is in place
			checkSolved: function (thispiece) {
				let solved = 0;
				let newx = thispiece.x;
				let newy = thispiece.y;
				let sx = thispiece.solvedx;
				let sy = thispiece.solvedy;

				let tolerance = 20;

				//if the piece is solved
				if (
					Math.abs(newx - sx) <= tolerance &&
					Math.abs(newy - sy) <= tolerance
				) {
					solved = 1;
					thispiece.x = sx;
					thispiece.y = sy;
					thispiece.solved = 1;

					let tmp = thispiece;
					//remove the piece from the array of pieces and add to the solved array
					//means we can always draw the solved pieces first, beneath the unsolved
					js.pieces.splice(js.clickedpiece, 1);
					js.solvedpieces.push(tmp);
				}
				return solved;
			},

			checkCollision: function (obj, x, y) {
				if (!obj.solved) {
					//rule out any possible collisions, remembering that all y numbers are inverted on canvas
					//y is below obj bottom edge
					if (y > obj.y + obj.h) {
						return 0;
					}
					//y is above top edge
					if (y < obj.y) {
						return 0;
					}
					//x is beyond right edge
					if (x > obj.x + obj.w) {
						return 0;
					}
					//x is less than left edge
					if (x < obj.x) {
						return 0;
					}
					return 1; //collision
				} else {
					return 0;
				}
			},

			//update the puzzle based on entered values when 'update' is clicked
			updateSettings: function () {
				let elAcross = document.getElementById('piecesx');
				let elDown = document.getElementById('piecesy');

				let across = Math.min(20, elAcross.value);
				let down = Math.min(20, elDown.value);

				let file = document.getElementById('fileupload').files[0];

				if (typeof file !== 'undefined') {
					let reader = new FileReader();
					reader.onload = function () {
						let img = new Image();
						img.src = reader.result;
						img.onload = function () {
							js.puzzle = img;
							js.piececountx = across;
							js.piececounty = down;
							//fixme this is a repetition of some of the lines in init - could be more efficient
							js.idealw = js.puzzle.width;
							js.idealh = js.puzzle.height;
							js.general.initCanvasSize();
							js.savedcanvasw = js.canvasw;
							js.savedcanvash = js.canvash;
							js.general.createPieces();
						};
					};
					reader.readAsDataURL(file);
				} else {
					js.piececountx = across;
					js.piececounty = down;
					js.general.createPieces();
				}
				elAcross.value = across;
				elDown.value = down;
				document.getElementById('body').className = '';
				document.getElementById('options').className = 'optionswrapper';
			},

			hideAllPieces: function () {
				for (let p = 0; p < js.pieces.length; p++) {
					js.pieces[p].visible = 0;
				}
			},

			//create all the pieces of the puzzle
			createPieces: function () {
				js.pieces = [];
				js.solvedpieces = [];
				let w = js.canvasw / js.piececountx;
				let h = js.canvash / js.piececounty;

				//try to distribute the pieces within the middle of the puzzle, so we can work on the edges first
				let rangeminx = (js.canvasw / 100) * 10;
				let rangemaxx = ((js.canvasw - w) / 100) * 90;
				let rangeminy = (js.canvash / 100) * 10;
				let rangemaxy = ((js.canvash - h) / 100) * 90;

				for (let y = 0; y < js.piececounty; y++) {
					for (let x = 0; x < js.piececountx; x++) {
						let piecex = js.general.randomNumber(rangeminx, rangemaxx);
						let piecey = js.general.randomNumber(rangeminy, rangemaxy);
						if (js.debug) {
							//if in debug mode, start the puzzle completed
							piecex = w * x;
							piecey = h * y;
						}
						let solvedx = w * x;
						let solvedy = h * y;
						let spritex = 0;
						let spritey = 0;

						let newpiece = new NewPiece(
							piecex,
							piecey,
							w,
							h,
							solvedx,
							solvedy,
							spritex,
							spritey,
							x,
							y
						);
						js.pieces.push(newpiece);
					}
				}
			},

			//this seems to be returning false if the number is odd
			isEven: function (n) {
				return n % 2 == 0;
			},

			drawPieces: function () {
				js.general.clearCanvas();
				let piececount = js.solvedpieces.length;
				for (let p = 0; p < piececount; p++) {
					js.general.drawPiece(js.solvedpieces[p]);
				}
				piececount = js.pieces.length;
				for (let q = 0; q < piececount; q++) {
					js.general.drawPiece(js.pieces[q]);
				}
			},

			//edge is either 0,1,2,3 - corresponding to top, right, bottom, left, arccounterClockwise decides if tab or blank, ie. in or out
			drawTabOrBlank: function (obj, edge, arccounterClockwise) {
				let arcradius = Math.min(obj.h / 4, obj.w / 4);
				let arcx = 0;
				let arcy = 0;
				let arcstartAngle = 0;
				let arcendAngle = 0;
				switch (edge) {
					case 0:
						arcx = obj.x + obj.w / 2;
						arcy = obj.y;
						arcstartAngle = 1 * Math.PI;
						arcendAngle = 0 * Math.PI;
						break;
					case 1:
						arcx = obj.x + obj.w;
						arcy = obj.y + obj.h / 2;
						arcstartAngle = 1.5 * Math.PI;
						arcendAngle = 0.5 * Math.PI;
						break;
					case 2:
						arcx = obj.x + obj.w / 2;
						arcy = obj.y + obj.h;
						arcstartAngle = 0 * Math.PI;
						arcendAngle = 1 * Math.PI;
						break;
					case 3:
						arcx = obj.x;
						arcy = obj.y + obj.h / 2;
						arcstartAngle = 0.5 * Math.PI;
						arcendAngle = 1.5 * Math.PI;
						break;
					default:
						break;
				}
				js.ctx.arc(
					arcx,
					arcy,
					arcradius,
					arcstartAngle,
					arcendAngle,
					arccounterClockwise
				);
			},

			drawPiece: function (obj) {
				let arcx = 0;
				let arcy = 0;
				let arcradius = 0;
				let arcstartAngle = 0;
				let arcendAngle = 0;
				let arccounterClockwise = true;

				let puzzleWEven = js.general.isEven(js.piececountx);
				let puzzleHEven = js.general.isEven(js.piececounty);

				let pieceXEven = js.general.isEven(obj.rowx);
				let pieceYEven = js.general.isEven(obj.rowy);

				js.ctx.save();
				if (obj.solved) {
					js.ctx.lineWidth = 0;
					js.ctx.strokeStyle = 'rgba(0,0,0,0)';
				} else {
					js.ctx.lineWidth = 2;
					js.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
				}

				if (!obj.visible) {
					js.ctx.globalAlpha = 0.1;
				}

				js.ctx.beginPath();
				js.ctx.moveTo(obj.x, obj.y); //top left corner

				//deal with top edge
				if (obj.rowy > 0) {
					if (pieceYEven) {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 0, 1); //draw a sticky bit out, top edge
						} else {
							js.general.drawTabOrBlank(obj, 0, 0); //draw a sticky bit in, top edge
						}
					} else {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 0, 0); //draw a sticky bit in, top edge
						} else {
							js.general.drawTabOrBlank(obj, 0, 1); //draw a sticky bit out, top edge
						}
					}
				}

				js.ctx.lineTo(obj.x + obj.w, obj.y); //top right corner

				//deal with right edge
				if (obj.rowx < js.piececountx - 1) {
					if (pieceYEven) {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 1, 0); //draw a sticky bit in, right edge
						} else {
							js.general.drawTabOrBlank(obj, 1, 1); //draw a sticky bit out, right edge
						}
					} else {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 1, 1); //draw a sticky bit out, right edge
						} else {
							js.general.drawTabOrBlank(obj, 1, 0); //draw a sticky bit in, right edge
						}
					}
				}

				js.ctx.lineTo(obj.x + obj.w, obj.y + obj.h); //bottom right corner

				//deal with bottom edge
				if (obj.rowy < js.piececounty - 1) {
					if (pieceYEven) {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 2, 1); //draw a sticky bit out, bottom edge
						} else {
							js.general.drawTabOrBlank(obj, 2, 0); //draw a sticky bit in, bottom edge
						}
					} else {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 2, 0); //draw a sticky bit in, bottom edge
						} else {
							js.general.drawTabOrBlank(obj, 2, 1); //draw a sticky bit out, bottom edge
						}
					}
				}

				js.ctx.lineTo(obj.x, obj.y + obj.h); //bottom left corner

				//deal with left edge
				if (obj.rowx > 0) {
					if (pieceYEven) {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 3, 0); //draw a sticky bit in, left edge
						} else {
							js.general.drawTabOrBlank(obj, 3, 1); //draw a sticky bit out, left edge
						}
					} else {
						if (pieceXEven) {
							js.general.drawTabOrBlank(obj, 3, 1); //draw a sticky bit out, left edge
						} else {
							js.general.drawTabOrBlank(obj, 3, 0); //draw a sticky bit in, left edge
						}
					}
				}

				js.ctx.lineTo(obj.x, obj.y); //top left corner - back to origin
				js.ctx.closePath();

				js.ctx.clip();
				js.ctx.drawImage(
					js.puzzle,
					0 - obj.solvedx + obj.x,
					0 - obj.solvedy + obj.y,
					js.canvasw,
					js.canvash
				);
				js.ctx.stroke();
				js.ctx.restore();
			}
		}
	};
	window.js = js;
})(window);

// window.onload = function () {
console.log('loaders', loaders);
Promise.all(loaders).then(function () {
	console.log('All loaders');
	js.general.init();
	//js.general.addClass(document.getElementById('loading'),'fadeout');
});

let resize;
window.addEventListener('resize', function (event) {
	clearTimeout(resize);
	resize = setTimeout(js.general.resizeCanvas, 200);
});
// };
