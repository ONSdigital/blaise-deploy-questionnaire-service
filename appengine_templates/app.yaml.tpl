service: dqs-ui
runtime: nodejs16

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  BLAISE_API_URL: _BLAISE_API_URL
  PROJECT_ID: _PROJECT_ID
  BUCKET_NAME: _BUCKET_NAME
  SERVER_PARK: _SERVER_PARK
  BIMS_API_URL: _BIMS_API_URL
  BIMS_CLIENT_ID: _BIMS_CLIENT_ID
  BUS_API_URL: _BUS_API_URL
  BUS_CLIENT_ID: _BUS_CLIENT_ID
  SESSION_TIMEOUT: _SESSION_TIMEOUT
  SESSION_SECRET: _SESSION_SECRET
  ROLES: _ROLES

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10 #@ if 'prod' in env.PROJECT_ID and 'preprod' not in env.PROJECT_ID
basic_scaling:
  idle_timeout: 10m
  max_instances: 5 #@ else

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
