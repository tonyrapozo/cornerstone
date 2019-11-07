import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import { renderColorImage } from './renderColorImage.js';
import { invertImage } from './invertImage';
import saveLastRendered from './saveLastRendered.js';
/**
 * API function to draw a standard web image (PNG, JPG) to an enabledImage
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof rendering
 */
export function renderWebImage(enabledElement, invalidated) {
  if (enabledElement === undefined) {
    throw new Error('renderWebImage: enabledElement parameter must not be undefined');
  }

  const image = enabledElement.image;

  if (image === undefined) {
    throw new Error('renderWebImage: image must be loaded before it can be drawn');
  }

  // Get the canvas context and reset the transform
  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  // Clear the canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);

  // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  context.imageSmoothingEnabled = !enabledElement.viewport.pixelReplication;
  context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

  // Save the canvas context state and apply the viewport properties
  setToPixelCoordinateSystem(enabledElement, context);

  const sx = enabledElement.viewport.displayedArea.tlhc.x - 1;
  const sy = enabledElement.viewport.displayedArea.tlhc.y - 1;
  const width = enabledElement.viewport.displayedArea.brhc.x - sx;
  const height = enabledElement.viewport.displayedArea.brhc.y - sy;

  var imageRendered = image.getImage();

  try {
    if (imageRendered.width < enabledElement.viewport.displayedArea.brhc.x || 
        imageRendered.height < enabledElement.viewport.displayedArea.brhc.y) {
      var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

      oc.width = enabledElement.viewport.displayedArea.brhc.x;
      oc.height = enabledElement.viewport.displayedArea.brhc.y;

      octx.drawImage(imageRendered, 0, 0, oc.width, oc.height);
      context.drawImage(oc, 0, 0, width, height, 0, 0, width, height);
    } else {
      context.drawImage(imageRendered, sx, sy, width, height, 0, 0, width, height);
    }
  } catch (exception) {
    context.drawImage(imageRendered, sx, sy, imageRendered.width, imageRendered.height, 0, 0, imageRendered.width, imageRendered.height);
  }

  if (enabledElement.viewport.invert) {
    var imgData = context.getImageData(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);
    var data = imgData.data;

    for (var i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }

    context.putImageData(imgData, 0, 0);
  }

  enabledElement.renderingTools = saveLastRendered(enabledElement);
}