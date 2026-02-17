project(folder)

|

|---Frontend(folder)

|

|---Backend(folder)



      server.js\[npm init -y  --> npm install express nodemon cors ---> (mongodb)---> npm install mongoose]



      config(folder)

       |

       |------db.js

      models(folder)

       |

       |------user.js

      controllers(folder)

       |

       |------userController.js

      routers(folder)

       |

       |-----userRouters.js











#### SCHEMA:

 

##### Admin (College Admin)



Admin controls the entire grievance system.

Admin manages users and oversees all complaints.



**Admin creates:**



* Student
* TPO
* HOD
* Complaint Assignment



**Admin actions:**



* POST – create student / TPO / HOD
* PUT – update user details
* DELETE – delete user
* GET – get all users
* GET – get user by id
* GET – get all complaints
* PUT – assign complaint to authority
* PUT – close unresolved complaint



##### Student



Student is the primary complainant.

Student submits and tracks grievances.



**Student creates:**



Complaint



**Student actions:**



* POST – create complaint
* GET – get my complaints
* GET – get complaint by id
* GET – track complaint status



##### TPO (Training \& Placement Officer)



TPO handles placement-related complaints.



**TPO actions:**



* GET – get all placement complaints
* GET – get complaint by id
* PUT – respond to complaint
* PUT – update complaint status
* PUT – escalate complaint to HOD / Admin



##### HOD (Head of Department)



HOD handles academic and departmental complaints.



**HOD actions:**



* GET – get department complaints
* GET – get complaint by id
* PUT – respond to complaint
* PUT – resolve complaint
* PUT – escalate complaint to Admin



##### Complaint



Complaint stores grievance details and tracking status.



**Complaint fields:**



* studentId
* category
* subject
* description
* assignedTo
* status
* response
* createdAt
* updatedAt



**Complaint actions:**



* POST – submit complaint
* GET – get complaint details
* PUT – update status
* PUT – add response
* PUT – escalate complaint
* PUT – close complaint



**Notification (Optional)**



Notification informs users about complaint updates.



**Notification actions:**



* POST – send notification
* GET – get user notifications
* PUT – mark notification as read









#### Project Flow



Student registers

→ Student logs in

→ Student submits complaint (exam / academic / placement / server, etc.)

→ System categorizes the complaint

→ System assigns complaint to concerned authority (TPO / HOD / Admin)

→ Authority logs in

→ Authority views assigned complaints

→ Authority responds to complaint

→ Authority resolves or escalates complaint

→ (If escalated) Complaint forwarded to higher authority

→ Higher authority reviews complaint

→ Complaint resolved

→ Admin verifies resolution

→ Complaint closed

→ Student views status and response

→ Complaint history stored

→ Admin monitors and manages all users and complaints

















#### College Grievance System – Postman API Flow



**Base URL:**



http://localhost:5000



**1️⃣ ADMIN FLOW**

1.1 Register Admin (First Time Only)



**API**



POST /api/admin/register





**Headers**



Content-Type: application/json





**Body**



{

&nbsp; "name": "Admin",

&nbsp; "email": "admin@gmail.com",

&nbsp; "password": "admin123"

}





🔹 No token required

🔹 Used only once (initial admin)



**1.2 Login Admin**



**API**



POST /api/admin/login





Body



{

&nbsp; "email": "admin@gmail.com",

&nbsp; "password": "admin123"

}





✅ Response contains:



{

&nbsp; "token": "ADMIN\_JWT\_TOKEN"

}





📌 Save this token → Admin Token



1.3 Create TPO (Admin Only)



API



POST /api/admin/create-tpo





Auth



Bearer Token → ADMIN\_TOKEN





Body



{

&nbsp; "name": "TPO User",

&nbsp; "email": "tpo@gmail.com",

&nbsp; "password": "tpo123"

}



1.4 Create HOD (Admin Only)



API



POST /api/admin/create-hod





Auth



Bearer Token → ADMIN\_TOKEN





Body



{

&nbsp; "name": "HOD User",

&nbsp; "email": "hod@gmail.com",

&nbsp; "password": "hod123"

}



2️⃣ TPO / HOD LOGIN

2.1 Login TPO



API



POST /api/admin/login





Body



{

&nbsp; "email": "tpo@gmail.com",

&nbsp; "password": "tpo123"

}





📌 Save → TPO\_TOKEN



2.2 Login HOD



API



POST /api/admin/login





Body



{

&nbsp; "email": "hod@gmail.com",

&nbsp; "password": "hod123"

}





📌 Save → HOD\_TOKEN



3️⃣ STUDENT (USER) FLOW

3.1 Register Student



API



POST /api/user/register





Body



{

&nbsp; "name": "Student One",

&nbsp; "email": "student@gmail.com",

&nbsp; "password": "student123"

}



3.2 Login Student



API



POST /api/user/login





Body



{

&nbsp; "email": "student@gmail.com",

&nbsp; "password": "student123"

}





📌 Save → STUDENT\_TOKEN



4️⃣ COMPLAINT FLOW

4.1 Student Submits Complaint



API



POST /api/complaints





Auth



Bearer Token → STUDENT\_TOKEN





Body



{

&nbsp; "category": "Placements",

&nbsp; "subject": "No Placements Yet",

&nbsp; "description": "No placement drives conducted till now"

}





✅ Result:



"assignedTo": null,

"status": "OPEN"





✔️ This is correct (Admin assigns later)



4.2 Admin Views All Complaints



API



GET /api/complaints





Auth



Bearer Token → ADMIN\_TOKEN



4.3 Admin Assigns Complaint to HOD / TPO



IMPORTANT: ONLY ADMIN TOKEN



API



PUT /api/complaints/assign





Auth



Bearer Token → ADMIN\_TOKEN





Body



{

&nbsp; "complaintId": "COMPLAINT\_ID",

&nbsp; "assignedTo": "HOD\_OR\_TPO\_USER\_ID"

}





✅ After assignment:



"assignedTo": "HOD\_OR\_TPO\_USER\_ID",

"status": "IN\_PROGRESS"



5️⃣ HOD / TPO ACTIONS

5.1 View Assigned Complaints



API



GET /api/complaints/assigned





Auth



Bearer Token → HOD\_TOKEN or TPO\_TOKEN



5.2 Respond to Complaint



API



PUT /api/complaints/respond/:id





Example:



PUT /api/complaints/respond/69841ac13c188f62dc367b1e





Auth



Bearer Token → HOD\_TOKEN or TPO\_TOKEN





Body



{

&nbsp; "response": "Placement drives will start next month"

}



6️⃣ STUDENT TRACKING

6.1 Track My Complaints



API



GET /api/complaints/my





Auth



Bearer Token → STUDENT\_TOKEN





🔒 Token is mandatory

❌ Without token → Access denied



6.2 View Single Complaint



API



GET /api/complaints/:id





Auth



Bearer Token → STUDENT / HOD / TPO / ADMIN



7️⃣ CLOSE COMPLAINT

7.1 Student or Admin Closes Complaint



API



PUT /api/complaints/close/:id





Auth



Bearer Token → STUDENT\_TOKEN or ADMIN\_TOKEN





✅ Status becomes:



"status": "CLOSED"













