# Cloudflare Challenge

Link to Cloudflare Page: https://cloudflare-9h5.pages.dev/

This is a simple React Application with a Cloudflare Page Functions. The React application uses @unicef/react-org-chart
to visually represent the Organization Data from the challenge, while the functions implement the API's.


## Reflection

This is a relatively small project, so there's not much to say. As I was working, I couldn't help but compare 
Cloudflare to AWS, Workers and functions to things like AWS Lambdas. While at a super abstract level there are
some similarities, I soon learned that they are more different then similar.

Moreover, For the challenge, there were 3 maindesign decisions I had reconciled.


### 1. Worker-KV for Organization Data

Inituitively, I wanted to add a key-value pair per record from the provided organization data csv.

The benefit is that inserts, writes, and updates are relatively straigh forwards. However, creating an organizational
chart would require many reads. At least O(n) reads if, say, a GUI stored the entire organziation in the browser.

Since I'm on the free tier, and I don't know how the autograder works, nor how many reads I'd burn through testing,
I decided to store the organization data as a single key value pair.


### 2. How to implement the OrgChart

The question here was whether or not to read the entire Organization Data into the browser or not. Since I'm on the
free tier I decided to read all the data into the browser and transform it to work with the @unicef/react-org-chart
library.

However, I did test an implementation where I asynchronously fetch employees as the user expands a node. This is alot
more efficient on the browser, but comes at a cost of greater reads. However, I do believe this latter approach is
superior. Depending on how big an organization is, what kind of data is stored per employee and existing API's, the 
data could realistically become too much for some old computers.

This is opposed to my previous experience at Numerix, where I had to create expandable tables to handle millions financial instruments.


### 3. Page Functions or Worker

I thought they were different, but really Pages Functions "are" Workers with their handlers having different names (i.e. onRequest vs fetch).
The Page Functions also have the file-system based routing like Next.js.

The Page Function provides some nice quality of life benefits. Mainly, I can keep the function with my front-end and have those functions piggyback
on the hosted builds, rollbacks and more.
