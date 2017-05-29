
var compassImg = null,
    compassNeedle = null,
    compassCTX = null,
    compassDegrees = 0,
    compassDiv = 'compass',
    compassDivWidth = 0,
    compassDivHeight = 0;
function compassClearcompassCanvas() {
    compassDivWidth = $('#' + compassDiv).width();
    compassDivHeight = $('#' + compassDiv).height();
    compassCTX.clearRect(0, 0, compassDivWidth, compassDivHeight);
}
function compassDraw() {
    compassClearcompassCanvas();
    // compassDraw the compass onto the compassCanvas
    compassCTX.drawImage(compassImg, 0, 0);
    // Save the current compassDrawing state
    compassCTX.save();
    // Now move across and down half the
    compassCTX.translate((compassDivWidth/2), (compassDivHeight/2));
    // Rotate around this point
    compassCTX.rotate(compassDegrees * (Math.PI / 180));
    // compassDraw the image back and up
    compassCTX.drawImage(compassNeedle, (compassDivWidth/2)*-1, (compassDivHeight/2)*-1);
    // Restore the previous compassDrawing state
    compassCTX.restore();
    // Increment the angle of the compassNeedle by 5 compassDegrees
    compassDegrees += 5;
}
function compassImgLoaded() {
    // Image loaded event complete.  Start the timer
    setInterval(compassDraw, 100);
}
function Compassinit() {
    // Grab the compass element
    var compassCanvas = document.getElementById(compassDiv);

    // compassCanvas supported?
    if (compassCanvas.getContext('2d')) {
        compassCTX = compassCanvas.getContext('2d');

        // Load the compassNeedle image
        compassNeedle = new Image();
        compassNeedle.src = 'assets/img/needle.png';
        compassNeedle.width = compassDivWidth;
        compassNeedle.height = compassDivHeight;

        // Load the compass image
        compassImg = new Image();
        compassImg.src = 'assets/img/compass.png';
        compassImg.width = compassDivWidth;
        compassImg.height = compassDivHeight;
        compassImg.onload = compassImgLoaded;
    }
}