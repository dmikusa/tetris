# Project Principles

These are the rules for developing on this project.

## Testing

1. All code should include test coverage and tests should pass before work is complete.
2. Do not move onto the next story until you have confirmed work is complete.

## Source Control

1. The project uses git for source control.
2. Each story should be implemented and submitted on a branch to Github as a pull request.
3. New stories should always start on a new branch taken from HEAD.

## Project Management

1. The project has a list of stories in the TODO.md file.
2. When finished with a story, you may take a new story from that list. Update the document that this story is "IP", in progress, when you start. Mark it as "X", finished, when done and PR is merged.

## Coding Style

1. When generating code, only generate the minimum amount of code required to complete the problem. Do not generate unnecessary abstractions.

## Project Architecture

1. The code should follow the MVC pattern. The model will be state for the project. The view will display and handle the state. The controller will be the business logic to drive the application.
