variable "region" {
  description = "The region where the cloudwatch logs are created"
}

variable "cluster" {
  description = "Name of the Fargate cluster"
}

variable "imageversion" {
  description = "The version of the image to deploy to this environment"
}

variable "environment" {
  description = "Name of the environment this fargate environment hosts"
}

variable "ecs_api_cpu" {
  description = "Nr of vCPUs to assign to the API task"
  default     = 256
}

variable "ecs_api_memory" {
  description = "Memory (GB) to assign to the API task"
  default     = 512
}
variable "ssm_securestrings" {
  description = "The SSM parameters to add to the task's environment as secure parameters"
}

variable "ssm_strings" {
  description = "The SSM parameters to add to the task's environment as normal parameters"
}

variable "ssm_dbhost" {
  description = "ARN to the SSM parameter holding the dbhost value"
}

variable "ssm_db" {
  description = "ARN to the SSM parameter holding the db value"
}

variable "ssm_dbuser" {
  description = "ARN to the SSM parameter holding the dbuser value"
}

variable "ssm_dbpassword" {
  description = "ARN to the SSM parameter holding the dbpassword value"
}


variable "api_desired_count" {
  description = "The desired number of API containers to run"
  default     = 1
}

variable "sg_rds_access" {
  description = "The security group that grants access to the RDS instance for these containers"
}

variable "subnet_ids" {
  description = "The subnet IDs where these tasks can run"
}

variable "vpc" {
  description = "The VPC to install the target group for the containers in"
}

variable "route53_zone_name" {
  description = "The zone in which to create a hostname to this environment"
}

variable "hostname" {
  description = "The hostname to register for this environment"
}

variable "alb" {
  description = "The ALB for this environment"
}

variable "alb_listener" {
  description = "The ALB listener in which to create a rule for directing traffic to these containers"
}
