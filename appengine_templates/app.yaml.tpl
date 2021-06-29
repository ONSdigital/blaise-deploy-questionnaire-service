service: dqs-ui
runtime: nodejs14

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  BLAISE_API_URL: _BLAISE_API_URL
  PROJECT_ID: _PROJECT_ID
  BUCKET_NAME: _BUCKET_NAME
  SERVER_PARK: _SERVER_PARK
  BIMS_API_URL: _BIMS_API_URL
  BIMS_CLIENT_ID: _BIMS_CLIENT_ID

basic_scaling:
  idle_timeout: 10m
  max_instances: 10

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
