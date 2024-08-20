# hobbitify
## Our team
Neeor -> Front-end developer and designer
Micah -> Back-end developer and AI-Designer
We both helped each other out with some things, and we both worked on the pitch deck.
## Inspiration
We got inspired in terms of design from a company called buildspace. Their simplistic look inspired us (Since we both aren't the best at design) and got us to create the look & feel that we did.

## What it does
Our app turns whatever hobby / skill you want to learn / foster into an interactive skill tree.
## How we built it
We use claude 3.5 for our backend, and with a specific prompt that we engineered. The prompt gets claude to create a JSON formatted tree, which is then put on our frontend server and handled accordingly. 
For the backend we ran a flask server looking for POST requests, which is what our front end sends. The POST req contains data which is then inputted into the prompt, allowing for us to properly get a response from claude.
On the AI side, the prompt we used was a system prompt, and the actual user prompt was from the post req.
Then on the front-end, we take the JSON returned from the post request (It is cleaned up before being sent), and we handle that visually so the user can have a good experience.
## Challenges we ran into
We ended up struggling to actually connect the front-end and the back-end. This was because the backend (Which runs on flask) was looking for a GET request not a POST request. We fixed it and got it working at like 1am

How center a div?!

## Accomplishments that we're proud of
Huge props to neeor, this guy learnt all the frontend stuff in less than 24 hrs (HTML, CSS, JS)
Micah had no experience with actually connecting front end / backend.
We figured it out and we are proud of it.
## What we learned
We learnt how to do frontend ( I had a bit of experience, neeor was completely new)
How to run flask servers.
Prompt engineering.
## What's next for Hobbitify
This was similar to a project we were going to actively pursue which was an RPG-style app for habit tracking and productivity. So going forward we will use our backend for that :)
