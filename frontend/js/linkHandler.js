// frontend/js/linkHandler.js

console.log("Bouncer arriving for duty! (linkHandler.js has started)");

// This "wrapper" makes sure the page is ready before our script runs.
document.addEventListener('DOMContentLoaded', function() {
    
    console.log("The party has started! (HTML is ready)");

    // The Host finds all the links that need to be protected.
    const protectedLinks = document.querySelectorAll('.protected-link');
    
    // The Bouncer reports how many doors he found.
    console.log(`Bouncer has found ${protectedLinks.length} VIP doors to guard.`);
    
    // A helpful warning if he finds no doors.
    if (protectedLinks.length === 0) {
        console.error("Bouncer Warning: I couldn't find any doors with the '.protected-link' class. Are you sure they are marked correctly in your HTML?");
    }

    // The Host visits each protected link.
    protectedLinks.forEach(link => {
        // He tells each link: "When you are clicked, run this check first."
        link.addEventListener('click', function(event) {
            
            console.log("Guest clicked a protected link! Bouncer is checking...");
            
            // The Host quickly checks the user's wallet for the "VIP Card".
            const userIsLoggedIn = localStorage.getItem('loggedInUser');

            if (!userIsLoggedIn) {
                console.log("Guest has NO INVITATION. Access DENIED.");
                // If there is NO card:
                // 1. He stops the link from working normally.
                event.preventDefault(); 
                
                // 2. He shows a polite message.
                alert("Please log in or create an account to view this service.");
                
                // 3. He redirects the user to the login page.
                window.location.href = 'login.html';
            } else {
                console.log("Guest HAS an invitation. Welcome! The link will now work.");
                // If the user IS logged in, the Host does nothing, and the link works normally.
            }
        });
    });
});


  // script for sidebar when clicking on profile icon

   const userSideBar = document.getElementById('userSideBar');
   let sidebarhidd=true;
   const profileBut = document.getElementById('profileIcon');
   profileBut.addEventListener('click',()=>{
    if(sidebarhidd){
     sidebarhidd=false; 
      userSideBar.style.right=0;
    }
    else{
      sidebarhidd=true;
      userSideBar.style.right='-350px';
    }
    console.log('click')
   })
   


   // TO SHOW WELCOME MESSAGE 
   
//   document.addEventListener("DOMContentLoaded", function () {
//     const user = JSON.parse(localStorage.getItem("loggedInUser"));

//     if (user) {
//         const welcomeMessage = document.getElementById("welcomeMessage");
//         welcomeMessage.innerText = ` ${user.name.toUpperCase()}`;
//     } else {
//        alert("❌ You are not logged in!");
//         window.location.href = "navbarpages/login.html"; // Adjust path if needed
//     }
// });
  
