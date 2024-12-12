# FlightTracker-Publication-Validator

1. Rename the folder to have _v0.0.0 if it does not already have a version or it will not be recognized by REDCap.

# Configuration
In the settings for the module there are the following requried fields:
1. Validation Form: this tells the app which survey will be reformatted for the end-user. If you don't know the form's name you can check this by going into the `Record Status Dashboard` and selecting one of the records. The page parameter in the URL is the name for the form.

# How Does It Work?
The PublicationValidator assumes certain formats for forms. A sample format will be included with this repository. It then uses the `redcap_survey_page()` hook to reformat the survey before a user has the chance to complete it.

# Reasoning Behind Survey Formatting
The hidden fields are used to convey data in a way that is easier to access and process when rewriting aspects of the page and collecting necessary data for display.

The hidden linkblue field is there for matching users to their data as all the data from the flighttracker databases need to be pulled and then matched. I am working out if I can just get 1 user's data to make it more lean.

The hidden years are there for me to have an easy way to collect which years I'm working with to filter only publications which occurred after that point and ones which have not yet been chosen.

The fields to hold data are formatted as paragraph boxes rather than multiple choice. This is due to the nature of how multiple choice is treated in redcap. Javascript is used to give the appearance of multiple choice input, but it is then loaded as an array of the citations selected into the paragraph box for easy usage later.