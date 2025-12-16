terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=4.55.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "4da54369-4d96-441f-b882-9428583467ad"
}

resource "azurerm_resource_group" "app-insights-demo-rg" {
  name     = "${var.app-insights-demo-prefix}-rg"
  location = var.location
}

resource "azurerm_service_plan" "app-insights-demo-asp" {
  name                = "${var.app-insights-demo-prefix}-plan"
  resource_group_name = azurerm_resource_group.app-insights-demo-rg.name
  location            = azurerm_resource_group.app-insights-demo-rg.location
  os_type             = "Linux"
  sku_name            = "F1"
}

resource "azurerm_application_insights" "app-insights-demo-appinsights" {
  name                = "${var.app-insights-demo-prefix}-logs"
  location            = azurerm_resource_group.app-insights-demo-rg.location
  resource_group_name = azurerm_resource_group.app-insights-demo-rg.name
  application_type    = "web"
}

resource "azurerm_linux_web_app" "app-insights-demo-app" {
  name                = "${var.app-insights-demo-prefix}-app"
  resource_group_name = azurerm_resource_group.app-insights-demo-rg.name
  location            = azurerm_resource_group.app-insights-demo-rg.location
  service_plan_id     = azurerm_service_plan.app-insights-demo-asp.id

  site_config {
    application_stack {
      node_version = "22-lts"
    }
    always_on = "false"
  }

  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.app-insights-demo-appinsights.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.app-insights-demo-appinsights.connection_string
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE"   = "false"
  }

  identity {
    type = "SystemAssigned"
  }
}