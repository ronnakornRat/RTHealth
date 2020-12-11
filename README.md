# Cybersecurity Analysis in WebRTC
Nelson Leonardo Gonzalez Dantas (ldantas@bu.edu)  
Ronnakorn Rattanakornphan (ronrat@bu.edu)

## Introduction
With the recent growth in need of online communication, particularly live video, we are interested in technology that allow us to securely connect to other people. 

WebRTC is a technology for a direct peer-to-peer real-time communication.
- works as part of the web browser, no need for additional plug-in or 3rd party application
- works with video, voice, and generic data
- supported in most web browsers
- supported by big companies, Apple, Google, Microsoft and Mozilla 
(src: https://webrtc.org/)
## What are we trying to do
- build an video-chat web-application using WebRTC technology
- do security analysis
    - check the package sent, using wireshark
    - simulate some security attacks
- compare it with existing WebRTC 
## How we did it
- for the application part, we build a real-time video chat application using Javascript for frontend, python for backend.
    - the signaling part we use peerJS library https://peerjs.com/
- we also implement Google Oauth with backend authentication to further test our scenario (described below)

## What did we find
### strengths
- the real-time communication channel itself (powered by WebRTC) is very secure. It is as secure as web browser.
    - all communication is encrypted end-to-end
### vulnerabilities
- Vulnerable to XSS (cross site scripting attack): since the WebRTC will just send any kind of data over
    - if the web application allow content change by user input, the developers have to vigorously validate user input.
- Lack of user identity: WebRTC itself does not require any significant user identity/authentication.
    - any one who knows the link to the "meeting" will be able to join in the communication immediately.
    
## Additional comments
- the signaling layer (contact information exchange) relies solely on the develop to implement it. WebRTC do not cover for this part.
    - it will be as secure as developers make it to be.
    
## Scenario for our demo app (RTHealth)
### Product Mission
We intend to make an application that utilise WebRTC technology for telemedicine in order to help facilitate/improve the medical aspects of people life.

### Minimal Product
An application that has 1-1 video chatting and texting(?) capabilities with the options to share the screen and recording the communication session (audio + video)

### Some user stories
Mr. A is a patient with a major depression. He is undergoing a psychotherapy. However, he is living along and is at risk. With RTHealth, he can talk to his therapists without physically traveling to the clinic.
Note: mental problems can be abrupt sometimes and it helps when there’s an actual person listening to your problem
####
Mrs. B, a docter, is currently treating a patient whose symptoms is very difficult to diagnose. She tried the treatment that has the highest chance of curing the symptoms but she would need a quick follow-ups on her patients, in case the administered treatment went wrong. With WebRTC, she can talk to her patient for a quick follow-up.
