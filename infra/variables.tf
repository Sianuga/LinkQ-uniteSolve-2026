variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "nexus"
}

variable "ec2_instance_type" {
  description = "EC2 instance type for backend"
  type        = string
  default     = "t3.micro" # Free tier eligible
}

variable "ec2_key_name" {
  description = "Name of an existing EC2 key pair for SSH access"
  type        = string
}

variable "ssh_cidr" {
  description = "CIDR block allowed to SSH into EC2 (your IP)"
  type        = string
  default     = "0.0.0.0/0" # Restrict this in production
}
