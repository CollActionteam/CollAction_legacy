﻿// This file is used by Code Analysis to maintain SuppressMessage
// attributes that are applied to this crowdaction.
// Crowdaction-level suppressions either have no target or are given
// a specific target and scoped to a namespace, type, member, etc.

using System;
using System.Diagnostics.CodeAnalysis;

[assembly:CLSCompliant(false)]
[assembly: SuppressMessage("Design", "CA1062:Validate arguments of public methods", Justification = "Test project")]
[assembly: SuppressMessage("Globalization", "CA1303:Do not pass literals as localized parameters", Justification = "Test project")]
[assembly: SuppressMessage("Usage", "CA1816:Dispose methods should call SuppressFinalize", Justification = "Test project")]
[assembly: SuppressMessage("Design", "CA1063:Implement IDisposable Correctly", Justification = "Test project")]
[assembly: SuppressMessage("Reliability", "CA2007:Consider calling ConfigureAwait on the awaited task", Justification = "Not needed in test project")]
[assembly: SuppressMessage("Security", "CA5394: Do not use insecure randomness", Justification = "We're not using randomness for security")]
