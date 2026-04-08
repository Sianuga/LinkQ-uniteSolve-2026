output "frontend_url" {
  description = "CloudFront URL for the frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "backend_url" {
  description = "Backend API URL (EC2 public IP)"
  value       = "http://${aws_instance.backend.public_ip}:8000"
}

output "ec2_public_ip" {
  description = "EC2 public IP for SSH and GitHub Actions"
  value       = aws_instance.backend.public_ip
}

output "ecr_repository_url" {
  description = "ECR repository URL for backend images"
  value       = aws_ecr_repository.backend.repository_url
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend deployment"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = aws_cloudfront_distribution.frontend.id
}

output "github_secrets_summary" {
  description = "Values to set as GitHub repository secrets"
  value       = <<-EOT
    ┌─────────────────────────────────────────────────────────────┐
    │  Set these as GitHub repository secrets:                    │
    │                                                             │
    │  AWS_ACCESS_KEY_ID      = <your deployer IAM key>          │
    │  AWS_SECRET_ACCESS_KEY  = <your deployer IAM secret>       │
    │  AWS_REGION             = ${var.aws_region}
    │  EC2_HOST               = ${aws_instance.backend.public_ip}
    │  EC2_SSH_KEY            = <contents of your .pem file>     │
    │  ECR_URL                = ${aws_ecr_repository.backend.repository_url}
    │  S3_BUCKET              = ${aws_s3_bucket.frontend.id}
    │  CLOUDFRONT_DIST_ID     = ${aws_cloudfront_distribution.frontend.id}
    └─────────────────────────────────────────────────────────────┘
  EOT
}
