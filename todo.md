On Labs page:
http://localhost:3001/lab/693a91e4b84c01813477e170

Show an option to enable diagram test like a toggle button
The toggle button should show the playground of diagram with shapes

Questions type test are enabled by default. Instructor can create questions of MCQ, Text etc

These Questions type test along with Diagrams test can be a paginated lab altogether
So each lab page should have option to create new page
Each new page should have option to create new question and option to create the diagram test by enabling the toggle button

Each page should be saved to db before moving to next page as draft

Final page should have option to publish

Implementation plan:

1. Lets do it like a step form
2. Each step should have option to create new question and option to create the diagram test by enabling the toggle button and ability to create new step if required to create more questions and diagram test
3. Each step should be saved to db before moving to next step as draft
4. Final step should have option to publish

Categories:
1. Each Architecture Type will have its own related shapes
2. All the common shapes should be isolated into a separate file or a shared package
3. Specific shapes should be isolated into a separate file based on the architecture type

Follow solid princiiples and max cyclomatic complexity of 5