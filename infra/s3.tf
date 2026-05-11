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

# ── Lab handout PDFs ─────────────────────────────────────────────────────────
# Source files live in infra/assets/. To add or update a handout:
#   1. Drop/replace the PDF in infra/assets/
#   2. Run `terraform apply` — etag detects changes and re-uploads only what changed

locals {
  lab_ids = toset(["1", "2", "3", "4", "5"])
}

resource "aws_s3_object" "lab_handout" {
  for_each = local.lab_ids

  bucket       = aws_s3_bucket.labs.id
  key          = "labs/lab-${each.key}.pdf"
  source       = "${path.module}/assets/lab-${each.key}.pdf"
  content_type = "application/pdf"
  etag         = filemd5("${path.module}/assets/lab-${each.key}.pdf")

  tags = local.tags
}
