terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.0.0"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = "whatsnxt"
}

# VPC Module
module "vpc" {
  source             = "terraform-aws-modules/vpc/aws"
  version            = "~> 5.5"
  name               = "vpc"
  cidr               = var.vpc_cidr
  azs                = ["ap-south-1a", "ap-south-1b"]
  private_subnets    = ["10.0.3.0/24", "10.0.4.0/24"]
  public_subnets     = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = false
  tags = {
    Name = "whatsnxt-vpc"
  }
}

# Security Group for ALB
resource "aws_security_group" "alb_sg" {
  name        = "whatsnxt-alb-sg-${var.env_name}"
  description = "Security group for ALB"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "whatsnxt-alb-sg"
    Environment = var.env_name
  }
}

# Security Group for EC2 instances
resource "aws_security_group" "ec2_sg" {
  name        = "whatsnxt-ec2-sg-${var.env_name}"
  description = "Allow traffic"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 3333
    to_port     = 3333
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 4444
    to_port     = 4444
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 4445
    to_port     = 4445
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 8081
    to_port     = 8082
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 6380
    to_port     = 6380
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "whatsnxt-ec2-sg"
    Environment = var.env_name
  }
}

# Application Load Balancer
resource "aws_lb" "whatsnxt_alb" {
  name               = "whatsnxt-lb-${var.env_name}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = false
  
  tags = {
    Name        = "whatsnxt-alb"
    Environment = var.env_name
  }
}

# Target Group for the application
resource "aws_lb_target_group" "whatsnxt_app_tg" {
  name     = "whatsnxt-tg-${var.env_name}"
  port     = 4444
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  
  health_check {
    enabled             = true
    interval            = 30
    path                = "/api/v1/course/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200"
  }
  
  tags = {
    Name        = "whatsnxt-app-tg"
    Environment = var.env_name
  }
}

# Optional: Additional health check target group
resource "aws_lb_target_group" "api_health_check" {
  count    = var.create_health_check ? 1 : 0
  name     = "whatsnxt-api-health"
  port     = 4444
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "API Health Check Target Group"
    Environment = var.env_name
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https_listener" {
  load_balancer_arn = aws_lb.whatsnxt_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.acm_ssl_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.whatsnxt_app_tg.arn
  }
  
  tags = {
    Name        = "whatsnxt-https-listener"
    Environment = var.env_name
  }
}

# HTTP Listener (optional - for redirect to HTTPS)
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.whatsnxt_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
  
  tags = {
    Name        = "whatsnxt-http-listener"
    Environment = var.env_name
  }
}

# SSL Certificate attachment
resource "aws_lb_listener_certificate" "whatsnxt_cert" {
  listener_arn    = aws_lb_listener.https_listener.arn
  certificate_arn = var.acm_ssl_arn
}

# API subdomain routing (Priority 100 - highest priority)
resource "aws_lb_listener_rule" "api_subdomain_routing" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.whatsnxt_app_tg.arn
  }

  condition {
    host_header {
      values = ["api.whatsnxt.in"]
    }
  }

  condition {
    http_header {
      http_header_name  = "Origin"
      values            = [
        "https://whatsnxt.in",
        "https://www.whatsnxt.in"
      ]
    }
  }

  tags = {
    Name        = "API Subdomain Routing"
    Environment = var.env_name
    Purpose     = "Route API subdomain to backend with CORS validation"
  }
}

# API path-based routing for apex domain (Priority 101)
resource "aws_lb_listener_rule" "api_path_routing" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 101

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.whatsnxt_app_tg.arn
  }

  condition {
    host_header {
      values = ["whatsnxt.in", "www.whatsnxt.in"]
    }
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  condition {
    http_header {
      http_header_name  = "Origin"
      values            = [
        "https://whatsnxt.in",
        "https://www.whatsnxt.in"
      ]
    }
  }

  tags = {
    Name        = "API Path Routing"
    Environment = var.env_name
    Purpose     = "Route API paths to backend with CORS validation"
  }
}

# Service identifier routing (Lower priority)
resource "aws_lb_listener_rule" "service_identifier_routing" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 110

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.whatsnxt_app_tg.arn
  }

  condition {
    http_header {
      http_header_name  = "X-Service-Identifier"
      values            = ["whatsnxt.in"]
    }
  }

  tags = {
    Name        = "Service Identifier Routing"
    Environment = var.env_name
    Purpose     = "Route based on service identifier header"
  }
}

# IAM Role for EC2 instances
resource "aws_iam_role" "ec2_role" {
  name = "whatsnxt-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name        = "whatsnxt-ec2-role"
    Environment = var.env_name
  }
}

# IAM Policy for EC2 role
resource "aws_iam_role_policy" "ec2_role_policy" {
  name = "whatsnxt-admin-policy"
  role = aws_iam_role.ec2_role.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = "*",
        Effect   = "Allow",
        Resource = "*",
      },
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "whatsnxt-ec2-instance-profile"
  role = aws_iam_role.ec2_role.name
  
  tags = {
    Name        = "whatsnxt-ec2-instance-profile"
    Environment = var.env_name
  }
}

# Key pair generation
resource "tls_private_key" "ed25519_key" {
  algorithm = "ED25519"
}

resource "aws_key_pair" "key_pair" {
  key_name   = var.key_pair_name
  public_key = tls_private_key.ed25519_key.public_key_openssh
  
  tags = {
    Name        = var.key_pair_name
    Environment = var.env_name
  }
}

resource "local_file" "private_key" {
  content  = tls_private_key.ed25519_key.private_key_openssh
  filename = pathexpand("~/.ssh/${var.private_key}")
  provisioner "local-exec" {
    command = "chmod 600 ${self.filename}"
  }
}

# EC2 Instance
module "ec2_instance" {
  source                      = "terraform-aws-modules/ec2-instance/aws"
  associate_public_ip_address = true
  ami                         = var.ami
  name                        = var.instance_name
  instance_type               = var.instance_type
  subnet_id                   = module.vpc.public_subnets[0]
  key_name                    = aws_key_pair.key_pair.key_name
  monitoring                  = true
  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  
  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    yum install -y jq
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
  EOF

  iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name

  tags = {
    Terraform   = "true"
    Environment = var.env_name
    Name        = var.instance_name
  }
}

# Target group attachment
resource "aws_lb_target_group_attachment" "whatsnxt_target" {
  target_group_arn = aws_lb_target_group.whatsnxt_app_tg.arn
  target_id        = module.ec2_instance.id
  port             = 4444
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "whatsnxt_prod_logs" {
  name              = "whatsnxt-prod-logs-group"
  retention_in_days = 30
  
  tags = {
    Environment = "prod"
    Application = "whatsnxt"
  }
}

resource "aws_cloudwatch_log_group" "whatsnxt_dev_logs" {
  name              = "whatsnxt-dev-logs-group"
  retention_in_days = 30
  
  tags = {
    Environment = "dev"
    Application = "whatsnxt"
  }
}

# SNS Topic for notifications
resource "aws_sns_topic" "notification_topic" {
  name = "whatsnxt-notification-topic"
  
  tags = {
    Environment = var.env_name
    Application = "whatsnxt"
  }
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.notification_topic.arn
  protocol  = "email"
  endpoint  = var.sns_email
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "alb_health_check_alarm" {
  alarm_name          = "whatsnxt-ALBHealthCheckAlarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  alarm_description   = "Alarm when ALB health check condition is met"
  alarm_actions       = []
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 1
  dimensions = {
    LoadBalancerName = aws_lb.whatsnxt_alb.arn
  }

  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Environment = var.env_name
    Application = "whatsnxt"
  }
}

resource "aws_cloudwatch_metric_alarm" "ec2_cpu_utilization_alarm" {
  alarm_name          = "whatsnxt-EC2CPUUtilizationAlarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  alarm_description   = "Alarm when EC2 CPU utilization condition is met"
  alarm_actions       = []
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  dimensions = {
    InstanceId = module.ec2_instance.id
  }

  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Environment = var.env_name
    Application = "whatsnxt"
  }
}

resource "aws_cloudwatch_composite_alarm" "whatsnxt_alarm" {
  alarm_name        = "whatsnxt-ServerDownAlarm"
  alarm_description = "Whatsnxt Alarm when both ALB health check and EC2 CPU utilization conditions are met"
  alarm_actions     = [aws_sns_topic.notification_topic.arn]
  alarm_rule        = "ALARM(${aws_cloudwatch_metric_alarm.alb_health_check_alarm.alarm_name}) AND ALARM(${aws_cloudwatch_metric_alarm.ec2_cpu_utilization_alarm.alarm_name})"

  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Environment = var.env_name
    Application = "whatsnxt"
  }
}

# Provisioning resources
resource "null_resource" "boot_finished" {
  provisioner "remote-exec" {
    inline = [
      "while [ ! -f /var/lib/cloud/instance/boot-finished ]; do echo 'Waiting for cloud-init...'; sleep 5; done",
    ]
    connection {
      type        = "ssh"
      host        = module.ec2_instance.public_ip
      user        = "ec2-user"
      private_key = tls_private_key.ed25519_key.private_key_openssh
    }
  }
}

resource "null_resource" "node_provisioner" {
  depends_on = [null_resource.boot_finished]
  triggers = {
    instance_id = module.ec2_instance.id
  }
  connection {
    host        = module.ec2_instance.public_ip
    user        = "ec2-user"
    type        = "ssh"
    private_key = local_file.private_key.content
  }
}

resource "null_resource" "image_updater" {
  depends_on = [null_resource.node_provisioner, null_resource.boot_finished]
  triggers = {
    image_version = var.env_name == "dev" ? var.dev_image_version : var.prod_image_version
    test          = "v2"
  }
  connection {
    host        = module.ec2_instance.public_ip
    user        = "ec2-user"
    type        = "ssh"
    private_key = local_file.private_key.content
  }
  provisioner "file" {
    source      = "run-image.sh"
    destination = "run-image.sh"
  }
  provisioner "file" {
    source      = "../.env.${var.env_name}"
    destination = ".env.${var.env_name}"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x run-image.sh",
      "if [ \"${var.env_name}\" == \"dev\" ]; then",
      "  ./run-image.sh \"${var.dev_image_version}\" \"${var.port}\" \"${var.redis_port}\" \"${var.redis_commander_port}\"",
      "else",
      "  ./run-image.sh \"${var.prod_image_version}\" \"${var.port}\" \"${var.redis_port}\" \"${var.redis_commander_port}\"",
      "fi"
    ]
  }
}