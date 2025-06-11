

MVP products in 7 days
Plug and play products
AI training from developer POV
Screenplay text editor plugin

TODO:: Courses app:
====================
Fix aws
Add a consulting page and AI training page

Tasks:
=====
Courses app - Move comments into re-useable package similar to recent implementation in blog app
Blog app - Add functionality to share the blog/article to linkedIn

Security:
========
Fix ssh port 22 on AWS as it is opened to all public
Rating collection indexing for rating of 5 stars
Run explain stats of queries with and without indexes in mongo

Courses app:
===========
To test on other laptop:
Click on my-courses on prod env, see the login button is not visible unless you interact with page using cursor/keyboard
Navbar trainer-dashboard link not updated unless page is refreshed in prod
After user signup, click on "become-a-teacher" to see that it redirects to login page instead of "become-a-teacher" page
Fix "Go to course" on prod
Test: Course delete and its assets

Task:
Use hello@whatsnxt.in for mail sending
Payments to trainer for their courses uploaded
Update terms and conditions
Add consulting page
Isolate into packages
Improve performance - web vitals and sentry

TODO:
Enhancement: 
Delete the trainer using Admin login - Trainer can be deleted only when course is not purchased by student, delete interviews, comments made by trainer, course image, course files etc - lock deletion of user from db manually

Backend: Add more categories
Backend: Deploy backend into droplet without removing/chaning the aws deployment flow to reduce the bills

TODO: LOW PRIORITY
After course purchase, go my courses, Click on the course to open slug, see that sidebar still has "add to cart" instead of "go to course" unless refreshed
TODO: Enable teachers to make their interview questions public on their profile or course page
TODO: Quizz and share on social platforms
TODO: Fix the login button and teacher dashboard not showing updated value in prod ( nextjs default cache issue?)

Omlumbide: TODO
Backend:
PR1:
Convert backend project to typescipt:
convert controllers to typescript
convert routes, utils etc to typescript
any other dependent/relevant files found to be converted to typescript (use LLM pieces in the system to aid with the conversion)

Frontend task:
Dynamic height of tiptop editor for overview and description. Description should be expandable
Add placeholder text in tiptop editor for overview and description
Dynamic tool bar for overview and description in tip tap editor

Consistent comment UI every where through out the project using mantine UI: apps/web/app/_component/courses/sections/course-reviews.tsx

Omlumbide:
Remove bootstrap

Backend:
update redis when subcategory name changes - delete the course
when course is deleted, update the category count

Misc:
====
Bulk delete algolia indexes when buik delete occurs on FE apps
Font size in RTE. Refer medium. Use Rem
Check responsiveness
Security check owasp on FE
Docs, architecture update
QA and performance testing
Scaling of BE apps (edited) 
POC using nextjs app as package

