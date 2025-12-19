# terraform.tfvars
# Environment Configuration
env_name = "prod"

# EC2 Configuration
instance_type = "t2.micro"
instance_name = "main-webserver"

# Application Configuration
dev_image_version = "whatsnxt:dev-v1"
prod_image_version = "prod-v4.361"
port = "4444"
redis_port = "6379"
redis_commander_port = "8081"

# Monitoring Configuration
sns_email = "kiriti.k999@gmail.com"
create_health_check = false

# Key Pair Configuration
key_pair_name = "whatsnxt"
private_key = "whatsnxt"
