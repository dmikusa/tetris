# Technical Plan

This is the technical stack for the Tetris game.

1. This game must run in a browser. It will not have a server-side component, so it just runs in the browser.

2. We need to have a CI/CD pipeline. This should minimally start with a job that runs when a PR is submitted and executes the tests. This will use Github Actions.

3. We are going to use Phaser.js as the framework for the game. The project should be created from their React + Typescript template project which can be found here: [https://github.com/phaserjs/template-react-ts].

4. Whenever possible, make as much use of Phaser.js as possible. Use the Context7 MCP server to fetch up-to-date docs whenever referencing the Phaser.js documentation.

5. Use Typescript. Make sure that you run `tsc` and confirm that there are no type errors before committing a project.

6. For tests, we are going to use vitest & React Testing Library. Please also ensure that test coverage is set up. We want to shoot for at least 80% test coverage.

7. Please set up ESLint & Prettier with the project. Follow best practices and recommendations with the configuration of these two tools.

8. The project will use NPM for dependency management and package installation.

9. The project needs an NPM script that will build the project and produce a set of HTML, Images, CSS, and Javascript that can be deployed to a static file server or run directly from the filesystem.

10. The screen layout should be fluid and should work on both large screens and small screens where possible.
