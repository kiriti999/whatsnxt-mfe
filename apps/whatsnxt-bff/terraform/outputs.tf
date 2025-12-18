output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.whatsnxt_alb.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.whatsnxt_alb.arn
}

output "alb_zone_id" {
  description = "ALB Zone ID"
  value       = aws_lb.whatsnxt_alb.zone_id
}

output "listener_arn" {
  description = "HTTPS Listener ARN"
  value       = aws_lb_listener.https_listener.arn
}

output "target_group_arn" {
  description = "Main target group ARN"
  value       = aws_lb_target_group.whatsnxt_app_tg.arn
}

output "alb_security_group_id" {
  description = "ALB Security Group ID"
  value       = aws_security_group.alb_sg.id
}

output "ec2_security_group_id" {
  description = "EC2 Security Group ID"
  value       = aws_security_group.ec2_sg.id
}

output "iam_instance_profile_name" {
  description = "IAM Instance Profile Name"
  value       = aws_iam_instance_profile.ec2_instance_profile.name
}

# EC2 Instance Outputs
output "public_ip" {
  description = "EC2 instance public IP"
  value       = module.ec2_instance.public_ip
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2_instance.id
}

output "ssh_private_key" {
  description = "SSH private key file path"
  value       = local_file.private_key.filename
}

output "ssh_connect_string" {
  description = "SSH connection string"
  value       = "ssh -i ${local_file.private_key.filename} ec2-user@${module.ec2_instance.public_ip}"
}

output "app_version_string" {
  description = "Application version being deployed"
  value       = var.env_name == "dev" ? var.dev_image_version : var.prod_image_version
}

# SNS Topic
output "sns_topic_arn" {
  description = "SNS topic ARN for notifications"
  value       = aws_sns_topic.notification_topic.arn
}