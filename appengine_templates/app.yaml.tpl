service: dqs-ui
runtime: nodejs12

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  BLAISE_API_URL: _BLAISE_API_URL
  PROJECT_ID: _PROJECT_ID
  BUCKET_NAME: _BUCKET_NAME

basic_scaling:
  idle_timeout: 60s
  max_instances: 10
