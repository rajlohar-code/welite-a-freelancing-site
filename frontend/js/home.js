 
  // frontend/js/home.js

// This is a special "wrapper".
// It tells the browser: "Hey, please wait until the entire HTML page is loaded and ready
// before you try to run any of this code."
// This is very important. It prevents errors.
document.addEventListener('DOMContentLoaded', function() {
    
    // Your beautiful code is inside here.
    const menubuttons = document.querySelectorAll('.menubuttons');
    const menucontentdisplay = document.querySelector('.menuContentPlaceholder');

    // This part is perfect. You are visiting each button one by one.
    menubuttons.forEach((button) => {
        // And you are telling each button: "When you are clicked, do this..."
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.id; // Get the name of the button, e.g., "Assembly"
            console.log("Button clicked:", id); // This is good for testing!

            if (id) {
                // --- THE ONLY CHANGE IS HERE ---
                // This is the new, correct address.
                // It assumes your 'menucontent' folder is in the main 'frontend' folder,
                // right next to your index.html file.
                const filePath = `menucontent/${id}.html`;
                
                fetch(filePath)
                    .then(res => {
                        if (!res.ok) {
                            // If the file is not found, this will help us debug.
                            throw new Error(`File not found: ${filePath}`);
                        }
                        return res.text();
                    })
                    .then(data => {
                        // Put the content of the file into our placeholder box.
                        menucontentdisplay.innerHTML = data;
                    })
                    .catch(error => {
                        // If there is any problem, show it in the console.
                        console.error("Error fetching content:", error);
                        menucontentdisplay.innerHTML = `<p style="color:red;">Sorry, could not load this section.</p>`;
                    });
            }
        });
    });
});