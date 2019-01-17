# api-recording

## Overview

This is part of the Workplace Intelligence Platform, which provides organisations with real-time insights on how their staff are using their workspaces, in order to inform how the space can be improved and property costs can be reduced. 

This API stores and provides access to the raw location data (mobile device recordings), which the Space Usage Analyst service retrieves, analyses and produces the insights. 

## Technical overview

The API is written in Node, running on an Express server, with a Mongo database that stores the raw location data. 

The app is wired up using a dependency injection container that automatically reads each module's dependencies and then initialises the module with those dependencies. The container then stores that module so that it can be passed to other modules that depend on it. 

BDD tests are written using Chai and run in Mocha, using Supertest to call endpoints.

The service is secured using OAUTH 3rd party service. 

Continuous integration enabled via Codeship, which runs all tests. Separate branches for test environment (test) and production environment (master). 

## How to download and run

To download, 'git clone https://github.com/simon-norman/api-recording.git'

Run 'npm install' to install all dependencies, then 'npm run start' to run locally. 

## How to run tests

Run 'npm run unit-test'.




