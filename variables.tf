variable "location" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "East US"
}

variable "app-insights-demo-prefix" {
  type    = string
  default = "app-insights-demo"
}