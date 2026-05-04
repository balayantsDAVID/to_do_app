output "myToDoApp_public_ip" {
  value       = aws_eip.static_ip_for_ToDo_app.public_ip
  description = "This is Public IP Address of ToDo App"
}
