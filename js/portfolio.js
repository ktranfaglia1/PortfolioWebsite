/* Author: Kyle Tranfaglia 
   This file handles the slideshow slide incrementation and looping 
   Last Updated: 04/29/24
*/

// Wait for the DOM content to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function() {
    const wrapper = document.querySelector('.slide_wrapper');  // Select the wrapper element containing the slides
    const slides = document.querySelectorAll('.slide');  // Select all slide elements
    let currentIndex = 0;  // Initialize a variable to keep track of the current slide index

    // Function to move to the next slide
    function moveNext() {
        currentIndex++;  // Increment the current slide index
        // If the index exceeds the number of slides, reset it to 0 to loop back to the beginning
        if (currentIndex >= slides.length) {
        currentIndex = 0;
        }
        wrapper.style.marginLeft = -currentIndex * 1200  + 'px';  // Calculate the new position of the wrapper based on the current slide index
    }

    setInterval(moveNext, 4000);  // Set an interval to call the moveNext function every 4000 milliseconds (4 seconds)
});