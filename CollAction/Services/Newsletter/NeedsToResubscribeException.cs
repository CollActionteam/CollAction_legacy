﻿using MailChimp.Net.Core;
using System;

namespace CollAction.Services.Newsletter
{
    public class NeedsToResubscribeException : Exception
    {
        public NeedsToResubscribeException(MailChimpException innerException) : base("User needs to resubscribe", innerException)
        {
        }
    }
}
