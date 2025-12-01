**Project Description:**
This project proposes the development of a web-based IT Asset Management (ITAM) system designed to efficiently track the lifecycle of a mid-sized organization’s IT assets from deployment to retirement. Without a unified ITAM system, many such organizations face issues like security risks and data inconsistencies in the management of hardware, software, licenses, and cloud resources. To address these challenges and provide proactive solutions, our system will offer a variety of useful features, including centralized asset tracking, audit logging, QR code scanning, role-based access control, and reporting dashboards.

**Tools:**
This application is deployed on Vercel. It was programmed with Javascript, React, Tailwind and utilizes Supabase for backend functions like storage and authentication. For scanning QR Codes we use the "html5-qrcode" library and for creating them we use the "qrcode" library. 

**Usage:**
In order to use our application you need to be issued login credentials. Once you get them, you visit https://fall25-gvsu-capstone-group3.vercel.app and login. Once in, you'll have access to the QR Code scanner and the following screens

  * **Dashboard:** This is the home screen with summary information regarding the company's assets and software utilization.
  * **Assets:** This page is where assets can be added to the system. They are assigned to users and departments from this screen. There are also edit and delete functions if mistakes are    made. 
  * **Software:** Software licenses are created and added on this page. Once you add a software, you can add licenses to the available pool and then assign and unassign them from users. Edits and deletes are allowed.
  * **Procurement:** This page is where users keep track of POs. POs are created and then after creation you can add PO lines. The system automatically totls the quanity ordered by the cost to get a total PO cost. Edit and delete functions are available.
  * **Users:** New users are created on this page. They are assigned a name, email, department and General or Manager status.
  * **Departments:** Where new departments are created, edited, and deleted.
  * **Maintenence:** Tickets created from the support page show up and are managered here. Users can add status updates that are viewable by clicking the ticket.
  * **Support:** Support tickets are crearted from here. Users need to add which asset needs support, a title, description, status, and priority. 
