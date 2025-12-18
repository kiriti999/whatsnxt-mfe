variable "region" {
  type        = string
  default     = "ap-south-1"
  description = "AWS region"
}

variable "availability_zone" {
  type        = string
  default     = "ap-south-1a"
  description = "AWS availability zone"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR block"
}

variable "acm_ssl_arn" {
  type        = string
  default     = "arn:aws:acm:ap-south-1:886436939122:certificate/fec87df2-4ae6-4ebe-bc08-c243e8209136"
  description = "ACM SSL certificate ARN"
}

variable "elb_health_target" {
  type        = string
  default     = "HTTP:4444/health"
  description = "ELB health check target"
}

variable "env_name" {
  type        = string
  description = "Environment name (dev/prod)"
}

variable "create_health_check" {
  type        = bool
  default     = false
  description = "Create additional health check target group"
}

# EC2 Instance Variables
variable "ami" {
  type        = string
  default     = "ami-0770726357cfe8240"
  description = "AMI ID for EC2 instance"
}

variable "instance_type" {
  type        = string
  default     = "t2.micro"
  description = "EC2 instance type"
}

variable "instance_name" {
  type        = string
  default     = "whatsnxt"
  description = "Name of the EC2 instance"
}

variable "key_pair_name" {
  type        = string
  default     = "whatsnxt"
  description = "Name of the AWS key pair"
}

variable "private_key" {
  type        = string
  default     = "whatsnxt"
  description = "Private key file name"
}

# Application Variables
variable "prod_image_version" {
  type        = string
  default     = "whatsnxt:latest"
  description = "Production Docker image version"
}

variable "dev_image_version" {
  type        = string
  description = "Development Docker image version"
}

variable "port" {
  type        = string
  description = "Application port"
}

variable "redis_port" {
  type        = string
  description = "Redis port"
}

variable "redis_commander_port" {
  type        = string
  description = "Redis commander port"
}

# Notification Variables
variable "sns_email" {
  type        = string
  default     = "kiriti.k999@gmail.com"
  description = "Email for SNS notifications"
}

# Legacy compatibility (if needed)
variable "load_balancer_arn" {
  type        = string
  default     = ""
  description = "Legacy load balancer listener ARN (not needed in unified setup)"
}