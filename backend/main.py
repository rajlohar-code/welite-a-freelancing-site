# backend/main.py

# --- PART 1: HIRING OUR WORKERS (Imports) ---
# We need a few new tools for handling files and folders.
import os
from werkzeug.utils import secure_filename
# The rest are our usual tools.
from flask import Flask, request, jsonify  , send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import bcrypt

# --- PART 2: SETTING UP THE KITCHEN ---
app = Flask(__name__)
CORS(app)

# THE FIX: We now use the GPS to create a perfect, absolute address for our refrigerator.
# This will ALWAYS point to the 'uploads' folder inside your 'backend' folder.
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# The Address to Our Storeroom (Your connection string is perfect)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:raj%40mysql@localhost/welite_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# --- PART 3: THE BLUEPRINTS FOR OUR STOREROOM SHELVES ---

# --- PART 3: THE BLUEPRINTS FOR OUR STOREROOM SHELVES ---

# --- IMPORTANT UPGRADE to the User Blueprint ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    address = db.Column(db.String(255))
    pincode = db.Column(db.String(20))
    role = db.Column(db.String(20), nullable=False, default='client')
    # This is a magic link that connects a User to their WorkerProfile.
    # The 'lazy="joined"' part is an efficiency trick.
    worker_profile = db.relationship('WorkerProfile', backref='user', uselist=False, lazy='joined')

    # --- UPGRADED "Session Ticket" Helper ---
    # --- THIS IS THE CORRECTED "Session Ticket" Helper ---
    def to_dict(self):
        data = {
            "id": self.id, "name": self.name, "email": self.email,
            "address": self.address, "pincode": self.pincode, "role": self.role,
            "skill":None
        }
        # NEW RULE: If the user is a 'worker' AND they have a profile...
        if self.role == 'worker' and self.worker_profile:
            # ...add their unique username to the ticket!
            data['username'] = self.worker_profile.username
            data['skill']=self.worker_profile.skill
        
        # This is the fix: We always return the data.
        return data

class WorkerProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    skill = db.Column(db.String(100))
    location = db.Column(db.String(100))
    bio = db.Column(db.Text)
    profile_picture_url = db.Column(db.String(255))
    price = db.Column(db.String(50)) 
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)

# --- UPGRADED BLUEPRINT for the "Jobs" shelf ---
class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    problem_description = db.Column(db.Text, nullable=False)
    # --- NEW: Every job now has a status! ---
    # When a new job is created, its status will automatically be "Pending".
    status = db.Column(db.String(50), nullable=False, default='Pending')
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    worker_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    client = db.relationship('User', foreign_keys=[client_id])
    worker = db.relationship('User', foreign_keys=[worker_id])


# --- BRAND NEW BLUEPRINT for the "Locations" shelf ---
class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    def to_dict(self):
        return {"id": self.id, "name": self.name}

# --- BRAND NEW BLUEPRINT for the "Skills" shelf ---
class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    def to_dict(self):
        return {"id": self.id, "name": self.name}    
# --- PART 4: THE RECIPES FOR OUR CHEF ---

# --- BRAND NEW, IMPORTANT RECIPE: SERVING PHOTOS ---
# This is a special recipe that lets the browser securely access photos from our 'uploads' folder.
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


 # NEW RULE: If the user is a 'worker' AND they have a profile...
 


# --- PART 4: THE RECIPES FOR OUR CHEF ---

# Your existing recipes for signup and login are perfect. They stay here.
@app.route('/api/signup/client', methods=['POST'])
def signup_client():
     # The first line of the recipe: Print a message to the terminal so we know an order arrived.
    print("\n--- A new order has arrived at the /api/signup/client counter! ---")
    try:
        # Step 1: The Chef receives the order slip (JSON data) from the JavaScript.
        data = request.get_json()
        print("Order slip data:", data)
        
        # Step 2: The Chef checks his master record book to see if this email is already there.
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            # If he finds the email, he rejects the order and sends an error message back.
            print("REJECTED: Email already exists.")
            return jsonify({"error": "An account with this email already exists."}), 400

        # Step 3: The Chef takes the password and puts it in the secret code machine.
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Step 4: The Chef prepares all the information for the new user, using our User blueprint.
        new_user = User(
            name=data['name'],
            email=data['email'],
            password_hash=hashed_password,
            address=data['address'],
            pincode=data['pincode'],
            role='client' 
        )

        # Step 5: The Chef takes the new information and saves it permanently in the storeroom.
        db.session.add(new_user)
        db.session.commit() # This is the final "save" command.

        # Step 6: The Chef sends a success message back to the JavaScript.
        print("SUCCESS: New user was saved to the database.")
        return jsonify({"message": "Client account created successfully!"}), 201

    except Exception as e:
        # This is a safety net. If any step above has an error, we will see it clearly.
        print(f"\n--- KITCHEN ERROR --- \n {e} \n--------------------")
        return jsonify({"error": "An internal server error occurred."}), 500

# --- NEW RECIPE FOR LOGIN ---


# This is the recipe for the "/api/login" counter.
# In backend/main.py, find and REPLACE your existing login function with this one.

# --- NEW, CORRECTED RECIPE FOR LOGIN ---

# --- REPLACE YOUR OLD LOGIN RECIPE WITH THIS FINAL, CORRECTED ONE ---
# ... (all your other code is here, it is perfect)

# --- REPLACE YOUR OLD LOGIN RECIPE WITH THIS NEW, SMART ONE ---
@app.route('/api/login', methods=['POST'])
def login():
    print("\n--- A login request has arrived at the /api/login counter! ---")
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        print(f"Chef is checking credentials for: {email}")

        # The Chef finds the user in his master record book.
        user = User.query.filter_by(email=email).first()

        # He checks the password.
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            print(f"SUCCESS: Password for {email} is correct.")
            
            # --- THIS IS THE FINAL, CRUCIAL FIX ---
            # Instead of making a card by hand, the Chef will now use
            # our smart, official "Card Printer" function, user.to_dict().
            # This printer KNOWS to add the username if the user is a worker.
            user_data_to_send = user.to_dict()

            print("CHEF IS SENDING THIS PERFECT VIP CARD:", user_data_to_send)
            
            return jsonify({
                "success": True,
                "user": user_data_to_send 
            })
        else:
            # If the login fails...
            print(f"FAILURE: Incorrect email or password for {email}.")
            return jsonify({"success": False, "error": "Incorrect email or password."})

    except Exception as e:
        print(f"\n--- KITCHEN ERROR --- \n {e} \n--------------------")
        return jsonify({"error": "An internal server error occurred."}), 500

# ... (the rest of your file is perfect)



# --- BRAND NEW RECIPE: UPGRADE A CLIENT TO A WORKER ---
@app.route('/api/user/upgrade-to-worker', methods=['POST'])
def upgrade_to_worker():
    # A message so we know the order arrived at the right counter.
    print("\n--- A worker upgrade order has arrived! ---")
    try:
        # Step 1: The Chef gets all the info from the special delivery tray.
        # The text info is in 'request.form', the file is in 'request.files'.
        email = request.form['email']
        username = request.form['username']
        skill = request.form['skill']
        area = request.form['area']
        bio = request.form['bio']
        print(f"Chef is upgrading user with email: {email}")

        # Step 2: The Chef finds the existing user in his master record book.
        user_to_upgrade = User.query.filter_by(email=email).first()
        if not user_to_upgrade:
            print(f"FAILURE: Could not find user with email {email}.")
            return jsonify({"success": False, "error": "User not found. Please log in again."}), 404

        # Step 3: The Chef does the UNIQUE username check for the new worker profile.
        existing_profile = WorkerProfile.query.filter_by(username=username).first()
        if existing_profile:
            print(f"FAILURE: The username '{username}' is already taken.")
            return jsonify({"success": False, "error": "This username is already taken. Please choose another one."}), 400

        # Step 4: The Chef handles the profile picture from the refrigerator.
        profile_pic_path = None # Start with no picture.
        if 'profilePic' in request.files:
            file = request.files['profilePic']
            if file.filename != '':
                # He creates a safe and unique name for the photo file (e.g., user_1_photo.jpg).
                filename = secure_filename(f"user_{user_to_upgrade.id}_{file.filename}")
                # He saves the photo to our 'uploads' folder.
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                # He writes down the ADDRESS of the photo to save in the record book.
                profile_pic_path = f"uploads/{filename}"
                print(f"SUCCESS: Profile picture saved at {profile_pic_path}")

        # Step 5: The Chef creates the new "Professional License" for the user.
        new_profile = WorkerProfile(
            user_id=user_to_upgrade.id, # This is the magic link!
            username=username,
            skill=skill,
            location=area,
            bio=bio,
            profile_picture_url=profile_pic_path
        )
        # He also updates the user's main status from "client" to "worker".
        user_to_upgrade.role = 'worker'

        # Step 6: The Chef saves all the new information permanently in the storeroom.
        db.session.add(new_profile)
        db.session.commit()

        print(f"SUCCESS: User {email} has been upgraded to a worker.")
        return jsonify({"success": True, "message": "You are now a Welite Worker!"})

    except Exception as e:
        print(f"\n--- KITCHEN ERROR --- \n {e} \n--------------------")
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500


# --- BRAND NEW RECIPE: GET A WORKER'S FULL PROFILE ---
# This recipe is for fetching all the details needed for the profile page.
@app.route('/api/worker/profile/<username>', methods=['GET','POST'])
def get_worker_profile(username):
    # A message so we know the order arrived at the right counter.
    print(f"\n--- A request for worker profile '{username}' has arrived! ---")
    try:
        # Step 1: The Chef finds the worker's professional license by their unique username.
        profile = WorkerProfile.query.filter_by(username=username).first()

        # If no profile is found, it's an error.
        if not profile:
            print(f"FAILURE: Profile for username '{username}' not found.")
            return jsonify({"success": False, "error": "Profile not found."}), 404

        # Step 2: The license is linked to a user. The Chef gets the user's basic info.
        user = User.query.get(profile.user_id)

        # Step 3: The Chef combines all the information into one big, neat package.
        full_profile_data = {
            "name": user.name,
            "email": user.email,
            "username": profile.username,
            "skill": profile.skill,
            "location": profile.location,
            "bio": profile.bio,
            "profile_picture_url": profile.profile_picture_url,
            "price": profile.price
        }
        
        print(f"SUCCESS: Found and sending back full profile for '{username}'.")
        # Step 4: He sends the full package back to the JavaScript.
        return jsonify({"success": True, "profile": full_profile_data})

    except Exception as e:
        print(f"\n--- KITCHEN ERROR --- \n {e} \n--------------------")
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500
    
# --- BRAND NEW RECIPE: UPDATE A WORKER'S PROFILE ---
@app.route('/api/worker/profile/update', methods=['POST'])
def update_worker_profile():
    try:
        username = request.form['username']
        profile_to_update = WorkerProfile.query.filter_by(username=username).first()
        if not profile_to_update:
            return jsonify({"success": False, "error": "Profile to update not found."}), 404

        # Update all the text fields
        profile_to_update.bio = request.form['bio']
        profile_to_update.skill = request.form['skill']
        profile_to_update.location = request.form['location']
        profile_to_update.price = request.form['price']

        db.session.commit()
        return jsonify({"success": True, "message": "Profile updated successfully!"})

    except Exception as e:
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500
    
# its upgrade for skill nd location finding in welite 15
@app.route('/api/workers', methods=['GET'])
def get_workers():
    print("\n--- A request to find workers has arrived! ---")
    try:
        skill_filter = request.args.get('skill')
        # NEW: The Chef now also checks for a location note.
        location_filter = request.args.get('location')

        query = db.session.query(
            WorkerProfile.username, WorkerProfile.skill, WorkerProfile.location,
            WorkerProfile.profile_picture_url, User.name
        ).join(User, WorkerProfile.user_id == User.id)

        if skill_filter:
            # This is a cool trick for case-insensitive search in the database
            query = query.filter(WorkerProfile.skill.ilike(f"%{skill_filter}%"))
        
        if location_filter:
            # The same trick for location
            query = query.filter(WorkerProfile.location.ilike(f"%{location_filter}%"))

        all_workers = query.all()
        workers_list = [
            { "username": w.username, "skill": w.skill, "location": w.location, "profile_picture_url": w.profile_picture_url, "name": w.name }
            for w in all_workers
        ]
        return jsonify({"success": True, "workers": workers_list})

    except Exception as e:
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500
    

@app.route('/api/search', methods=['GET'])
def universal_search():
    # The Chef gets the search term from the "?q=" part of the URL.
    query_term = request.args.get('q', '').lower() # .lower() makes it case-insensitive
    print(f"\n--- A universal search for '{query_term}' has arrived! ---")

    if not query_term:
        return jsonify({"type": "not_found", "message": "Please enter a search term."})

    # Rule 1: Is it a username?
    # We search the WorkerProfile table for an exact, case-insensitive match.
    profile = WorkerProfile.query.filter(db.func.lower(WorkerProfile.username) == query_term).first()
    if profile:
        print("Search Result: Found a USERNAME.")
        return jsonify({"type": "profile", "value": profile.username})

    # Rule 2: Is it a skill?
    skill = Skill.query.filter(db.func.lower(Skill.name) == query_term).first()
    if skill:
        print("Search Result: Found a SKILL.")
        return jsonify({"type": "skill", "value": skill.name})

    # Rule 3: Is it a location?
    location = Location.query.filter(db.func.lower(Location.name) == query_term).first()
    if location:
        print("Search Result: Found a LOCATION.")
        return jsonify({"type": "location", "value": location.name})

    # If we find nothing...
    print("Search Result: Found nothing.")
    return jsonify({"type": "not_found", "message": "No match found."})

@app.route('/api/worker/jobs/<worker_username>', methods=['GET'])
def get_worker_jobs(worker_username):
  try:
    worker_profile = WorkerProfile.query.filter_by(username=worker_username).first()
    if not worker_profile:
        return jsonify({"success": False, "error": "Worker not found."}), 404
    
    jobs = Job.query.filter_by(worker_id=worker_profile.user_id).all()
    
    jobs_list = [
        {
            "id": job.id, # <-- UPGRADE: We now send the unique job ID.
            "problem": job.problem_description,
            "status": job.status, # <-- UPGRADE: We now send the current status.
            "client_name": job.client.name,
            "client_email": job.client.email,
            "client_id": job.client.id # <-- UPGRADE: We send the client's ID too.
        } for job in jobs
    ]
    return jsonify({"success": True, "jobs": jobs_list})
        
  except Exception as e:
        print(f"\n--- KITCHEN ERROR --- \n {e} \n--------------------")
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500

# --- BRAND NEW RECIPE: A CLIENT POSTS A NEW JOB ---
@app.route('/api/jobs/post', methods=['POST'])
def post_job():
    print("\n--- A new job posting has arrived! ---")
    try:
        data = request.get_json()
        client_email = data['client_email']
        worker_username = data['worker_username']
        problem = data['problem']

        # The Chef finds both the client and the worker in the record books.
        client = User.query.filter_by(email=client_email).first()
        worker_profile = WorkerProfile.query.filter_by(username=worker_username).first()

        if not client or not worker_profile:
            return jsonify({"success": False, "error": "Client or worker not found."}), 404

        # He creates a new Job file.
        new_job = Job(
            problem_description=problem,
            client_id=client.id, # Link to the client.
            worker_id=worker_profile.user_id # Link to the worker.
        )
        
        # He saves the new job permanently.
        db.session.add(new_job)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Job posted successfully!"})

    except Exception as e:
        print(f"\n--- KITCHEN ERROR --- \n {e} \n--------------------")
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500
    


# --- BRAND NEW "HEAD OFFICE" RECIPES ---

# Recipe to get all users for the admin dashboard
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    users_list = [user.to_dict() for user in users]
    return jsonify({"success": True, "users": users_list})

# Recipe to get all available locations
@app.route('/api/locations', methods=['GET'])
def get_locations():
    locations = Location.query.all()
    return jsonify([loc.to_dict() for loc in locations])

# Recipe for the admin to add a new location
@app.route('/api/locations/add', methods=['POST'])
def add_location():
    data = request.get_json()
    new_loc = Location(name=data['name'])
    db.session.add(new_loc)
    db.session.commit()
    return jsonify({"success": True, "message": "Location added successfully!"})

# Recipe to get all available skills
@app.route('/api/skills', methods=['GET'])
def get_skills():
    skills = Skill.query.all()
    return jsonify([skill.to_dict() for skill in skills])

# Recipe for the admin to add a new skill
@app.route('/api/skills/add', methods=['POST'])
def add_skill():
    data = request.get_json()
    new_skill = Skill(name=data['name'])
    db.session.add(new_skill)
    db.session.commit()
    return jsonify({"success": True, "message": "Skill added successfully!"})    

# In backend/main.py, under the "HEAD OFFICE" recipes

# --- BRAND NEW RECIPE: DELETE A USER ---
# In backend/main.py, replace your delete_user recipe with this one

# --- FINAL, CORRECTED RECIPE: DELETE A USER ---
@app.route('/api/admin/users/delete/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    print(f"\n--- A request to DELETE user with ID: {user_id} has arrived! ---")
    try:
        # Step 1: The Chef finds the user in the master record book.
        user_to_delete = User.query.get(user_id)

        if not user_to_delete:
            return jsonify({"success": False, "error": "User not found."}), 404

        # --- THIS IS THE NEW, CRUCIAL STEP ---
        # Step 2: The Chef first finds and deletes all "Rent Agreements" (Jobs)
        # connected to this user, to keep the database clean.
        print(f"Finding and deleting all jobs connected to user {user_id}...")
        # Case A: Delete all jobs where this user was the WORKER.
        Job.query.filter_by(worker_id=user_id).delete()
        # Case B: Delete all jobs where this user was the CLIENT.
        Job.query.filter_by(client_id=user_id).delete()
        
        # Step 3: If the user is a 'worker', delete their "VIP License" (WorkerProfile).
        if user_to_delete.worker_profile:
            print(f"This user is a worker. Deleting their worker profile...")
            db.session.delete(user_to_delete.worker_profile)
        
        # Step 4: Now that all the connections are safely removed, delete the main user file.
        print(f"Deleting the main user record for {user_id}...")
        db.session.delete(user_to_delete)
        
        # Step 5: He saves all these changes permanently.
        db.session.commit()
        
        print(f"SUCCESS: User {user_id} and all their data has been deleted.")
        return jsonify({"success": True, "message": "User deleted successfully."})

    except Exception as e:
        print(f"\n--- KITCHEN ERROR --- \n {e} \n--------------------")
        # If something goes wrong, this is a safety net to undo any partial changes.
        db.session.rollback()
        return jsonify({"success": False, "error": "An internal server error occurred."}), 500
    

# --- BRAND NEW RECIPE: A WORKER ACCEPTS A JOB ---
@app.route('/api/jobs/accept/<int:job_id>', methods=['POST'])
def accept_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404
    
    job.status = 'Accepted'
    db.session.commit()
    return jsonify({"success": True, "message": "Job accepted!"})

# --- UPGRADED RECIPE: A WORKER REJECTS A JOB ---
# This recipe no longer deletes. It now updates the status to "Rejected".
# We change the method to 'POST' because we are UPDATING data, not deleting it.
@app.route('/api/jobs/reject/<int:job_id>', methods=['POST'])
def reject_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404
    
    # THE FIX: We change the status instead of deleting.
    job.status = 'Rejected'
    db.session.commit()
    return jsonify({"success": True, "message": "Job has been rejected."})

# --- BRAND NEW RECIPE: A CLIENT CANCELS A JOB ---
@app.route('/api/jobs/cancel/<int:job_id>', methods=['DELETE'])
def cancel_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404
    
    # --- IMPORTANT SAFETY RULE ---
    # The client can ONLY cancel if the job is still "Pending".
    if job.status != 'Pending':
        return jsonify({"success": False, "error": "Cannot cancel a job that has already been accepted."}), 400

    db.session.delete(job)
    db.session.commit()
    return jsonify({"success": True, "message": "Job cancelled and deleted."})

# --- BRAND NEW RECIPE: THE FINAL "CLEAR" BUTTON ---
# This recipe is for permanently deleting a job after it's finished.
@app.route('/api/jobs/delete/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404

    # The Chef now permanently deletes the job from the storeroom.
    db.session.delete(job)
    db.session.commit()
    return jsonify({"success": True, "message": "Job has been cleared from your board."})

# --- PART 5: STARTING THE RESTAURANT ---
if __name__ == '__main__':
    with app.app_context():
        # This command will now create BOTH the 'user' and the 'worker_profile' tables.
        db.create_all() 
    app.run(debug=True)

