﻿using CollAction.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System;
using System.ComponentModel.DataAnnotations;

namespace CollAction.ValidationAttributes
{
    public sealed class FrontendUrlAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return ValidationResult.Success!; // null should be handled with [Required]
            }
            else if (!validationContext.GetRequiredService<IWebHostEnvironment>().IsProduction())
            {
                return ValidationResult.Success!; // We only check this stuff in a production environment
            }

            Uri publicAddressUri = validationContext.GetRequiredService<IOptions<SiteOptions>>().Value.PublicUrl;
            try
            {
                if (value is not string)
                {
                    return new ValidationResult("Given URL is not a string");
                }
                Uri givenAddressUri = new((string)value);
                return givenAddressUri.Host == publicAddressUri.Host && givenAddressUri.Scheme == publicAddressUri.Scheme && givenAddressUri.Port == publicAddressUri.Port ?
                           ValidationResult.Success! :
                           new ValidationResult($"This URL isn't allowed: '{givenAddressUri}', '{publicAddressUri}");
            }
            catch (UriFormatException e)
            {
                return new ValidationResult($"{e.Message}: '{value}', '{publicAddressUri}'");
            }
        }
    }
}
