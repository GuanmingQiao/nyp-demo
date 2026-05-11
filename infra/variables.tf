variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-1"
}

variable "aws_profile" {
  description = "AWS CLI profile name"
  type        = string
  default     = "nyp-demo"
}

variable "project" {
  description = "Project slug — used for resource names and SSM prefix"
  type        = string
  default     = "nyp-demo"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "github_repo" {
  description = "GitHub repository in owner/name format, used to scope the OIDC trust policy"
  type        = string
  default     = "GuanmingQiao/nyp-demo"
}
