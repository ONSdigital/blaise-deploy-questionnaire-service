# Deploy Questionnaire Service

[![codecov](https://codecov.io/gh/ONSdigital/blaise-deploy-questionnaire-service/branch/main/graph/badge.svg)](https://codecov.io/gh/ONSdigital/blaise-deploy-questionnaire-service)
[![CI status](https://github.com/ONSdigital/blaise-deploy-questionnaire-service/workflows/Test%20coverage%20report/badge.svg)](https://github.com/ONSdigital/blaise-deploy-questionnaire-service/workflows/Test%20coverage%20report/badge.svg)
<img src="https://img.shields.io/github/release/ONSdigital/blaise-deploy-questionnaire-service.svg?style=flat-square" alt="Nisra Case Mover release verison">
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/ONSdigital/blaise-deploy-questionnaire-service.svg)](https://github.com/ONSdigital/blaise-deploy-questionnaire-service/pulls)
[![Github last commit](https://img.shields.io/github/last-commit/ONSdigital/blaise-deploy-questionnaire-service.svg)](https://github.com/ONSdigital/blaise-deploy-questionnaire-service/commits)
[![Github contributors](https://img.shields.io/github/contributors/ONSdigital/blaise-deploy-questionnaire-service.svg)](https://github.com/ONSdigital/blaise-deploy-questionnaire-service/graphs/contributors)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/ONSdigital/blaise-deploy-questionnaire-service.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/ONSdigital/blaise-deploy-questionnaire-service/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/ONSdigital/blaise-deploy-questionnaire-service.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/ONSdigital/blaise-deploy-questionnaire-service/alerts/)

Service for uploading Instrument/Questionnaire files to Blaise.

This is done by uploading the Instrument/Questionnaire package to a GCP Bucket then sending a request to
the [Blaise Rest API](https://github.com/ONSdigital/blaise-api-rest) to install it onto Blaise.

This project is a React application which when built is rendered by a Node.js express server. The Node.js handles the
file being uploaded from the client and uploads the file to a GCP bucket using
the [@google-cloud/storage module](https://www.npmjs.com/package/@google-cloud/storage).

![Diagram of Deploy Questionnaire Service setup](.github/Diagram.png)

### Setup

#### Prerequisites

To run Blaise Deploy Questionnaire Service locally, you'll need to have [Node installed](https://nodejs.org/en/), as
well as [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable).

To have the list of instruments load on the page, you'll need to
have [Blaise Rest API](https://github.com/ONSdigital/blaise-api-rest) running locally (On a Windows machine), or you
can [create an Identity-Aware Proxy (IAP) tunnel](https://cloud.google.com/sdk/gcloud/reference/compute/start-iap-tunnel) from a GCP Compute
Instance running the rest API in a sandbox. An example command to connect to the rest api VM on local port `5011`:

```shell
sudo gcloud compute start-iap-tunnel restapi-1 80 --local-host-port=localhost:5011 --zone europe-west2-a
```

#### Setup locally steps

Clone the Repo

```shell script
git clone https://github.com/ONSdigital/blaise-deploy-questionnaire-service.git
```

Create a new .env file and add the following variables.

| Variable       | Description                                                                                                                                                                                                                                                                           | Var Example               |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|
| PORT           | **Optional
variable**, specify the Port for express server to run on. If not passed in this is set as 5000 by default. <br><br>It's best not to set this as the react project will try and use the variable as well and conflict. By default React project locally runs on port 3000. | 5009                      |
| BLAISE_API_URL | Url that the [Blaise Rest API](https://github.com/ONSdigital/blaise-api-rest) is running on to send calls to.                                                                                                                                                                         | localhost:90              |
| PROJECT_ID     | GCP Project ID                                                                                                                                                                                                                                                                        | ons-blaise-dev-matt55     |
| BUCKET_NAME    | GCP Bucket name for the instrument file to be put in                                                                                                                                                                                                                                  | ons-blaise-dev-matt55-dqs |
| SERVER_PARK    | Name of Blaise Server Park                                                                                                                                                                                                                                                            | gusty                     |
| BIMS_API_URL   | Url that the [BIMS Service](https://github.com/ONSdigital/blaise-instrument-metadata-service) is running on to send calls to set and get the live date.                                                                                                                               | localhost:5011            |
| BIMS_CLIENT_ID | GCP IAP ID for the [BIMS Service](https://github.com/ONSdigital/blaise-instrument-metadata-service)                                                                                                                                                                                   | randomKey0112             |

The .env file should be setup as below

```.env
BLAISE_API_URL='localhost:90'
PROJECT_ID='ons-blaise-dev-matt55'             
BUCKET_NAME='ons-blaise-dev-matt55-dqs'
SERVER_PARK=gusty
BIMS_API_URL=localhost:5011
BIMS_CLIENT_ID=randomKey0778
```

Install required modules

```shell script
yarn
```

##### Local access to GCP Bucket

To get the service working locally with a remote GCP Bucket, you need
to [obtain a JSON service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys), this
will need to be a service account with create and list permissions to the specified bucket. Save the service account key
as  `keys.json` and place in the root of the project. Providing the NODE_ENV is not production, then the GCP storage
config (Found at `server/storage/config.js`) will attempt to use this file.  **DO NOT COMMIT THIS FILE**

##### Run commands

The following run commands are available, these are all setup in the `package.json` under `scripts`.

| Command             | Description                                                                                                                                                                              |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `yarn server`       | Starts the complied express server (Used by App Engine to start the server), Note: The server will need to be complied and the React Project will need to be built first.                |
| `yarn start-server` | Complies Typescript and starts the express server, Note: For the website to be rendered the React Project will need to be built.                                                         |
| `yarn start-react`  | Starts react project in local development setup with quick reloading on making changes. Note: For instruments to be shown the server needs to be running.                                |
| `yarn build-react`  | Compiles build project ready to be served by express. The build in outputted to the the `build` directory which express points to with the var `buildFolder` in `server/server.js`.      |
| `yarn test`         | Runs all tests for server and React Components and outputs coverage statistics.                                                                                                          |
| `gcp-build`         | [App Engine custom build step](https://cloud.google.com/appengine/docs/standard/nodejs/running-custom-build-step) which builds the react application and complies the TypeScript server. |

##### Simple setup for local development

Setup express project to be call Blaise Instrument Checker. By default, will be running on PORT 5000.

```shell script
yarn start-server
```

Next, to make sure the React project make requests to the Express server make sure the proxy option is set to the right
port in the 'package.json'

```.json
"proxy": "http://localhost:5000",
```

Run the React project for local development. By default, this will be running on PORT 3000

```shell script
yarn start-server
```

To test express sever serving the React project, you need to compile the React project, then you can see it running
at [http://localhost:5000/](http://localhost:5000/)

```shell script
yarn build-react
```

### Tests

The [Jest testing framework](https://jestjs.io/en/) has been setup in this project, all tests currently reside in
the `tests` directory. This currently only running tests on the health check endpoint, haven't got the hang of mocking
Axios yet.

To run all tests run

```shell script
yarn test
```

Other test command can be seen in the Run Commands section above.

Deploying to app engine

To deploy the locally edited service to app engine in your environment, you can run trigger the cloudbuild trigger with
the following line, changing the environment variables as needed.

```.shell
gcloud builds submit --substitutions=_PROJECT_ID=ons-blaise-v2-dev-matt56,_BLAISE_API_URL=/,_BUCKET_NAME=ons-blaise-dev-matt56-survey-bucket-44,_SERVER_PARK=gusty
```

### Dockerfile

You can run this service in a container, the Dockerfile is setup to:

- Update and upgrade the Docker container image.
- Setup Yarn and the required dependencies.
- Run the tests, the build will fail if the tests fail.
- Build the React project for serving by express
- Run Yarn Start on startup

Copyright (c) 2021 Crown Copyright (Government Digital Service)
