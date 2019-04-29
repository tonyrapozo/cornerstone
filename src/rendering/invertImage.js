export function invertImage (image) {
    if (image === undefined) {
      throw new Error('invertImage: image parameter must not be undefined');
    }
  
    const image = enabledElement.image;
  
    if (image === undefined) {
      throw new Error('renderColorImage: image must be loaded before it can be drawn');
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
  
    let renderCanvas;
  
    if (enabledElement.options && enabledElement.options.renderer &&
      enabledElement.options.renderer.toLowerCase() === 'webgl') {
      // If this enabled element has the option set for WebGL, we should
      // User it as our renderer.
      renderCanvas = webGL.renderer.render(enabledElement);
    } else {
      // If no options are set we will retrieve the renderCanvas through the
      // Normal Canvas rendering path
      renderCanvas = getRenderCanvas(enabledElement, image, invalidated);
    }
  
    const sx = enabledElement.viewport.displayedArea.tlhc.x - 1;
    const sy = enabledElement.viewport.displayedArea.tlhc.y - 1;
    const width = enabledElement.viewport.displayedArea.brhc.x - sx;
    const height = enabledElement.viewport.displayedArea.brhc.y - sy;
  
    context.drawImage(renderCanvas, sx, sy, width, height, 0, 0, width, height);
  
    enabledElement.renderingTools = saveLastRendered(enabledElement);
  }