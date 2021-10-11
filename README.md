# wasp-service-template

Template repository for bootstrapping new WASP services. Use this repo as a template in github when creating new `WASP` services. When forked a new pull request will automatically be created in the new repository to apply templating. Before merging you should also give access to the forked repo the `WASP_GITHUB_TOKEN` organisation secret prior to merging. This will allow the release workflow to run successfully on merging.

## What this repo provides

This repo provides:

- basic node.js project structure for a WASP service
- linting with WASP prettier configuration
- open-sourcing materials
- Docker file
- A simple helm chart for the service
- A service with a healthcheck endpoint on `/health`
- Testing apparatus using `mocha`, `chai` and `supertest`
- Github workflows for testing and release

## Environment Variables

`wasp-service-template` is configured primarily using environment variables as follows:

| variable  | required | default | description                                                                          |
| :-------- | :------: | :-----: | :----------------------------------------------------------------------------------- |
| LOG_LEVEL |    N     | `info`  | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`] |
| PORT      |    N     |  `80`   | Port on which the service will listen                                                |
