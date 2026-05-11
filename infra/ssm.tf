locals {
  ssm_prefix = "/${var.project}"

  # Initial values — Terraform seeds these once.
  # The sync-config GitHub Actions workflow updates them on config/ changes.
  # lifecycle.ignore_changes below ensures Terraform never overwrites CI/CD updates.
  app_config = {
    announcement = "Welcome to Cloud Computing! Lab 1 is now available on the resources page."
    currentWeek  = "1"
    semester     = "Semester 1, AY2025/26"
    environment  = "production"
    deployedAt   = "pending"
    commitSha    = "pending"
  }
}

resource "aws_ssm_parameter" "config" {
  for_each = local.app_config

  name  = "${local.ssm_prefix}/${each.key}"
  type  = "String"
  value = each.value
  tags  = local.tags

  lifecycle {
    # Don't overwrite values that CI/CD has updated
    ignore_changes = [value]
  }
}
