/* Author: Kyle Tranfaglia 
   This file handles the image lightbox to enlarge the profile image and the back to top hover button
   Last Updated: 04/22/24
*/

// Create a div element to serve as the lightbox
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
document.body.appendChild(lightbox);

// Select all elements with the class 'profile' and iterate over them
const images = document.querySelectorAll('.profile');
images.forEach(function(image) {
// Add click event listener to each image
image.addEventListener('click', function() {
    lightbox.classList.add('active');  // Activate the lightbox by adding the 'active' class
    
    // Create an img element to display the clicked image
    const img = document.createElement('img');
    img.src = image.src;
    
    // Remove any existing child elements from the lightbox
    while (lightbox.firstChild) {
    lightbox.removeChild(lightbox.firstChild);
    }

    lightbox.appendChild(img);  // Append the clicked image to the lightbox
});
});

// Add click event listener to the lightbox itself
lightbox.addEventListener('click', function(event) {
// Check if the click target is the lightbox itself, if not, return
if (event.target !== event.currentTarget) return;

lightbox.classList.remove('active');  // Deactivate the lightbox by removing the 'active' class
});

// Listen for and handle the scroll event
window.onscroll = function scrollFunction() {
    // Check if the scroll position is greater than 250 pixels from the top
    if (document.body.scrollTop > 250 || document.documentElement.scrollTop > 250) {
        document.querySelector(".hovering_button").classList.add("show");  // Add the "show" class to the hovering button
    } else {
        document.querySelector(".hovering_button").classList.remove("show");  // Remove the "show" class from the hovering button
    }
}

// Listens for a click event on the hovering button
document.querySelector('.hovering_button').addEventListener('click', function() {
    // When the hovering button is clicked, smoothly scroll the page back to the top
    window.scrollTo({
        top: 0, 
        behavior: 'smooth'
    });
});