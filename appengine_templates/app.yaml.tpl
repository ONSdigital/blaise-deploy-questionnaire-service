service: dqs-ui
runtime: nodejs20

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
  CREATE_DONOR_CASES_CLOUD_FUNCTION_URL: _CREATE_DONOR_CASES_CLOUD_FUNCTION_URL
  REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL: _REISSUE_NEW_DONOR_CASE_CLOUD_FUNCTION_URL

automatic_scaling:
  min_instances: _MIN_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
