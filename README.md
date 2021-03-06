## Simple Image Upload Example 
_Azure Discovery Day - Vienna (26.3.2019)_

The purpose of this repository is to provide the sample code used in the "Modern Applications" session to illustrate how Microsoft Azure can help you in aspiring to the 10 properties of a modern, cloud-native, application. 

You will find a distinct wiki page for each of those properties, illustrating the core of each property and how Microsoft Azure can be used to support or achieve it. 

On the [Wiki](https://github.com/phwecker/2019-azure-dd-vienna-public/wiki/00.-Introduction) you can find accompaning documentation on the differen aspects being covered. The content will materialize, piece by piece, starting **April 2019**, so depending on when you access this repo it might be complete or still work in progress. 

**Prerequisites**

In order to follow along with the code in this example, you will need to have

- NodeJS (>= 8) installed
- docker installed
- Azure Storage Account - BLOB Storage provisioned
- Azure BLOB Storage Container created
- Azure BLOB Storage Connect Strin at hand
- Azure Cognitive Service - Vision provisioned
- Azure Vision Service Access Key at hand

You can also find an ARM template and Azure CLI script for creating the Storage Account and the Vision Service in your Azure subscription in the _azureResources_ ZIP file. It contains all you need to create the resources, ARM template, CLI and PowerShell scripts.  

Once you have all that, you need to provide the necessary values in the index.js file of the application. 

**DISCLAIMER** -- Any code provided in this example is for _illustration purposes only_ and used at your own risk. 
