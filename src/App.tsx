import * as React from 'react';
import { Container } from '@chakra-ui/react';
import "./puzzle.js"
export default function App() {
	return (
		<Container h="100vh" d="flex" alignItems="center" justifyContent="center">
			<div className="canvaswrapper" id="canvasparent">
    <canvas id="canvas" className="canvas"></canvas>
  </div>

  <div className="optionstrigger" id="showoptions"><img src="static/img/cog.svg"/></div>

  <div id="options" className="optionswrapper">
    <div className="mask" id="hideoptions"></div>
    <div className="options">
      <h1>Jigsaw options</h1>

      <div className="inputwrap">
        <label htmlFor="piecesx">
          Number of pieces across:
        </label>
        <input type="number" id="piecesx" className="forminput"/>
      </div>

      <div className="inputwrap">
        <label htmlFor="piecesy">
          Number of pieces down:
        </label>
        <input type="number" id="piecesy" className="forminput"/>
      </div>

      <div className="inputwrap">
        <label htmlFor="fileupload">
          Jigsaw image to use:
        </label>
        <input type="file" id="fileupload" className="fileinput"/>
      </div>

      <div className="btnwrapper">
        <button type="submit" id="updatePuzzle" className="btn btn-primary">Use these settings</button>
        <button type="submit" id="resetPuzzle" className="btn btn-secondary">Reset</button>
      </div>

      <div className="aboutlink">
        <a href="https://www.custarddoughnuts.co.uk/article/2017/3/9/javascript-jigsaw-puzzle">About</a>
      </div>
    </div>
  </div>

		</Container>
	);
}
