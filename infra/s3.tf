resource "aws_s3_bucket" "labs" {
  # Account ID suffix ensures the name is globally unique
  bucket = "${var.project}-labs-${data.aws_caller_identity.current.account_id}"
  tags   = local.tags
}

resource "aws_s3_bucket_versioning" "labs" {
  bucket = aws_s3_bucket.labs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "labs" {
  bucket = aws_s3_bucket.labs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "labs" {
  bucket                  = aws_s3_bucket.labs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
