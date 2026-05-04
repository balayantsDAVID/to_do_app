variable "region" { default = "eu-central-1" }
variable "instance_type" { default = "t3.micro" }
variable "ssh_key_path" {
  description = "Path to your public SSH key"
  default     = "~/.ssh/id_ed25519.pub"
}
variable "project_name" { default = "Generic-ToDo-App" }
