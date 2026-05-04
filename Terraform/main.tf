provider "aws" {
  region = "eu-central-1"
}

data "aws_ami" "latest_ubuntu" {
  owners      = ["099720109477"]
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

resource "aws_eip" "static_ip_for_ToDo_app" {
  instance = aws_instance.myToDoApp.id
  tags = {
    Name  = "EIP_For_ToDo_App"
    Owner = "David Balayants"
  }
}

resource "aws_key_pair" "ssh_key" {
  key_name   = "${var.project_name}-key"
  public_key = file(var.ssh_key_path)
}

resource "aws_instance" "myToDoApp" {
  ami           = data.aws_ami.latest_ubuntu.id
  instance_type = "t3.micro"
  key_name      = aws_key_pair.ssh_key.key_name
  subnet_id     = aws_subnet.subnet_for_ToDo.id

  tags = {
    Name    = var.project_name
    Owner   = "David Balayants"
    Project = "ToDoApp"
  }

  vpc_security_group_ids = [aws_security_group.SG_for_ToDo_App.id]

  lifecycle {
    create_before_destroy = true
  }
  depends_on = [aws_internet_gateway.IGTW_for_ToDo]

}

resource "aws_security_group" "SG_for_ToDo_App" {
  name        = "Security Group For ToDo"
  description = "SSH+HTTP"
  tags = {
    Name = "SSH+HTTP_FOR_TODO"
  }

  dynamic "ingress" {
    for_each = ["80", "22"]
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  vpc_id = aws_vpc.vpc_for_ToDo.id
}

resource "aws_vpc" "vpc_for_ToDo" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "VPC for ToDo"
  }

}

resource "aws_internet_gateway" "IGTW_for_ToDo" {
  vpc_id = aws_vpc.vpc_for_ToDo.id
  tags = {
    Name = "IGTW for ToDo"
  }
}

resource "aws_subnet" "subnet_for_ToDo" {
  vpc_id     = aws_vpc.vpc_for_ToDo.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "Public Subnet For ToDo"
  }

}

resource "aws_route_table" "RT_for_public_subnet" {
  vpc_id = aws_vpc.vpc_for_ToDo.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.IGTW_for_ToDo.id
  }

  tags = {
    Name = "RT for ToDO"
  }
}

resource "aws_route_table_association" "name" {
  subnet_id      = aws_subnet.subnet_for_ToDo.id
  route_table_id = aws_route_table.RT_for_public_subnet.id
}

resource "local_file" "ansible_inventory" {
  content  = <<-EOT
[webserver]
${aws_eip.static_ip_for_ToDo_app.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${replace(var.ssh_key_path, ".pub", "")}
EOT
  filename = "../ansible/hosts"
}

resource "null_resource" "ansible_trigger" {
  depends_on = [aws_eip.static_ip_for_ToDo_app, local_file.ansible_inventory]

  provisioner "local-exec" {
    command = <<EOT
      sleep 30;
      ansible-playbook ../ansible/playbook.yml
    EOT
  }
}
