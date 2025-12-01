**Project Description:**
This project proposes the development of a web-based IT Asset Management (ITAM) system designed to efficiently track the lifecycle of a mid-sized organization’s IT assets from deployment to retirement. Without a unified ITAM system, many such organizations face issues like security risks and data inconsistencies in the management of hardware, software, licenses, and cloud resources. To address these challenges and provide proactive solutions, our system will offer a variety of useful features, including centralized asset tracking, audit logging, QR code scanning, role-based access control, and reporting dashboards.

**Tools:**
This application is deployed on Vercel. It was programmed with Javascript, React, Tailwind and utilizes Supabase for backend functions like storage and authentication. For scanning QR Codes we use the "html5-qrcode" library and for creating them we use the "qrcode" library. 

**Usage:**
In order to use our application you need to be issued login credentials. Once you get them, you visit https://fall25-gvsu-capstone-group3.vercel.app and login. Once in, you'll have access to the QR Code scanner and the following screens

  * **Dashboard:** This is the home screen with summary information regarding the company's assets and software utilization.
    <img width="2418" height="1488" alt="image" src="https://github.com/user-attachments/assets/1a38bbe3-fc7e-4f8d-82ab-1cf20d1b60b2" />
  
  * **Assets:** This page is where assets can be added to the system. They are assigned to users and departments from this screen. There are also edit and delete functions if mistakes are    made.
    <img width="2419" height="708" alt="image" src="https://github.com/user-attachments/assets/9aac666b-40bc-4368-8225-dd4fc8ded1ef" />

  * **Software:** Software licenses are created and added on this page. Once you add a software, you can add licenses to the available pool and then assign and unassign them from users. Edits and deletes are allowed.
    <img width="2411" height="589" alt="image" src="https://github.com/user-attachments/assets/f9919efb-0fd7-4cfd-8c15-ab76c00870a8" />

  * **Procurement:** This page is where users keep track of POs. POs are created and then after creation you can add PO lines. The system automatically totls the quanity ordered by the cost to get a total PO cost. Edit and delete functions are available.
    <img width="2418" height="503" alt="image" src="https://github.com/user-attachments/assets/14dfd7d5-9bc8-4414-92d8-da56e348be90" />

  * **Users:** New users are created on this page. They are assigned a name, email, department and General or Manager status.
    <img width="2387" height="1499" alt="image" src="https://github.com/user-attachments/assets/ddb00fd3-d0e7-4fcb-9850-54c55266a7e0" />

  * **Departments:** Where new departments are created, edited, and deleted.
    <img width="2419" height="961" alt="image" src="https://github.com/user-attachments/assets/fedf535b-327a-4291-bf67-e1e84e022ee1" />

  * **Maintenence:** Tickets created from the support page show up and are managered here. Users can add status updates that are viewable by clicking the ticket.
    <img width="2401" height="665" alt="image" src="https://github.com/user-attachments/assets/9c5eadee-7c28-419f-a0ed-20483713e868" />

  * **Support:** Support tickets are crearted from here. Users need to add which asset needs support, a title, description, status, and priority.
    <img width="2415" height="1200" alt="image" src="https://github.com/user-attachments/assets/04e1ccd4-6b32-42dc-bc96-040ec4f99740" />

**QR Code Scanner:**
The QR code scanner is the only feature allowed on mobile and tablet views and is used to scan QR codes generate by this application. Any other code will display an error.
<img width="288" height="109" alt="image" src="https://github.com/user-attachments/assets/3fdba99d-3cd1-48f8-b7c4-76fb65fc3745" />
<img width="883" height="1271" alt="image" src="https://github.com/user-attachments/assets/b0ee6fc7-e3a2-4ec0-909e-6888d974e47e" />
<img width="862" height="1160" alt="image" src="https://github.com/user-attachments/assets/8b4c2e6d-143f-4e68-8dc9-ff9f9391523b" />


**Contributions:**
Ryan: Code development
Brenden: Project Management/Documents (poster and sprint slides for example)
Quadri: Feature testing
Evan: Database management
