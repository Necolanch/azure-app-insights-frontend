output "web_app_url" {
  description = "URL of the Hello World App Service"
  value       = azurerm_linux_web_app.app-insights-demo-app.default_hostname
}

output "app_insights_key" {
  description = "Instrumentation Key for Application Insights"
  value       = azurerm_application_insights.app-insights-demo-appinsights.instrumentation_key
  sensitive = true
}

output "app_insights_connection_string" {
  description = "Connection String for Application Insights"
  value       = azurerm_application_insights.app-insights-demo-appinsights.connection_string
  sensitive = true
}