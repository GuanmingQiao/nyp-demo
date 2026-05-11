output "instance_id" {
  description = "EC2 instance ID — used in GitHub Actions SSM SendCommand"
  value       = aws_instance.web.id
}

output "public_ip" {
  description = "Elastic IP attached to the EC2 instance"
  value       = aws_eip.web.public_ip
}

output "site_url" {
  description = "Public URL of the course website"
  value       = "http://${aws_eip.web.public_ip}"
}

output "s3_bucket_name" {
  description = "S3 bucket for lab handout assets"
  value       = aws_s3_bucket.labs.id
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC — paste into the Actions workflow"
  value       = aws_iam_role.github_actions.arn
}

output "ssm_prefix" {
  description = "SSM Parameter Store path prefix for app config"
  value       = "/${var.project}"
}
