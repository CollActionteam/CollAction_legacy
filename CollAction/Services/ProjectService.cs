﻿using CollAction.Data;
using CollAction.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Web;

namespace CollAction.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;
        private readonly ProjectEmailOptions _projectEmailOptions;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly ILogger<ProjectService> _logger;
        private readonly IStringLocalizer<ProjectService> _stringLocalizer;

        public ProjectService(ApplicationDbContext context, IEmailSender emailSender, IOptions<ProjectEmailOptions> projectEmailOptions, ILogger<ProjectService> logger, IStringLocalizer<ProjectService> stringLocalizer, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _projectEmailOptions = projectEmailOptions.Value;
            _userManager = userManager;
            _emailSender = emailSender;
            _logger = logger;
            _stringLocalizer = stringLocalizer;
        }

        public async Task<Project> GetProjectById(int id)
        {
            return await _context.Projects.SingleOrDefaultAsync(p => p.Id == id);
        }

        public async Task<bool> AddParticipant(string userId, int projectId)
        {
            Project project = await GetProjectById(projectId);
            if (project == null || !project.IsActive)
            {
                return false;
            }

            var participant = new ProjectParticipant
            {
                UserId = userId,
                ProjectId = projectId,
                SubscribedToProjectEmails = true,
                UnsubscribeToken = Guid.NewGuid()
            };

            try
            {
                _context.Add(participant);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return false;
            }

            return true;
        }

        public async Task<ProjectParticipant> GetParticipant(string userId, int projectId)
        {
            return await _context.ProjectParticipants.SingleOrDefaultAsync(p => p.ProjectId == projectId && p.UserId == userId);
        }

        public async Task<IEnumerable<FindProjectsViewModel>> FindProjects(Expression<Func<Project, bool>> filter)
        {
            return await _context.Projects
                .Where(filter)
                .Include(p => p.Category)
                .Include(p => p.Location)
                .Include(p => p.BannerImage)
                .Include(p => p.DescriptiveImage)
                .Include(p => p.DescriptionVideoLink)
                .Include(p => p.Owner)
                .Include(p => p.Tags).ThenInclude(t => t.Tag)
                .GroupJoin(_context.ProjectParticipants,
                    project => project.Id,
                    participants => participants.ProjectId,
                    (project, participantsGroup) => new FindProjectsViewModel(_stringLocalizer)
                    {
                        ProjectId = project.Id,
                        ProjectName = project.Name,
                        ProjectProposal = project.Proposal,
                        CategoryName = project.Category.Name,
                        CategoryColorHex = project.Category.ColorHex,
                        LocationName = project.Location.Name,
                        BannerImagePath = project.BannerImage != null ? project.BannerImage.Filepath : $"/images/default_banners/{project.Category.Name}.jpg",
                        BannerImageDescription = project.BannerImage.Description,
                        Target = project.Target,
                        Participants = project.Participants.Sum(participant => participant.User.RepresentsNumberParticipants) + project.AnonymousUserParticipants,
                        Remaining = project.RemainingTime,
                        DescriptiveImagePath = project.DescriptiveImage.Filepath,
                        DescriptiveImageDescription = project.DescriptiveImage.Description,
                        Status = project.Status,
                        Start = project.Start,
                        End = project.End
                    })
                .ToListAsync();
        }

        public async Task<IEnumerable<DisplayProjectViewModel>> GetProjectDisplayViewModels(Expression<Func<Project, bool>> filter)
        {
            return await _context.Projects
                .Where(filter)
                .Include(p => p.Category)
                .Include(p => p.Location)
                .Include(p => p.BannerImage)
                .Include(p => p.DescriptiveImage)
                .Include(p => p.DescriptionVideoLink)
                .Include(p => p.Owner)
                .Include(p => p.Tags).ThenInclude(t => t.Tag)
                .GroupJoin(_context.ProjectParticipants,
                    project => project.Id,
                    participants => participants.ProjectId,
                    (project, participantsGroup) => new DisplayProjectViewModel
                    {
                        Project = project,
                        Participants = participantsGroup.Sum(p => p.User.RepresentsNumberParticipants) + project.AnonymousUserParticipants
                    })
                .ToListAsync();
        }

        public async Task<string> GenerateParticipantsDataExport(int projectId)
        {
            Project project = await _context
                .Projects
                .Where(p => p.Id == projectId)
                .Include(p => p.Participants).ThenInclude(p => p.User)
                .Include(p => p.Owner)
                .FirstOrDefaultAsync();
            if (project == null)
                return null;
            else
                return string.Join("\r\n", GetParticipantsCsv(project));
        }

        public bool CanSendProjectEmail(Project project)
            => project.NumberProjectEmailsSend < _projectEmailOptions.MaxNumberProjectEmails && project.End + _projectEmailOptions.TimeEmailAllowedAfterProjectEnd > DateTime.UtcNow;

        public int NumberEmailsAllowedToSend(Project project)
            => _projectEmailOptions.MaxNumberProjectEmails - project.NumberProjectEmailsSend;

        public DateTime CanSendEmailsUntil(Project project)
            => project.End + _projectEmailOptions.TimeEmailAllowedAfterProjectEnd;

        public async Task SendProjectEmail(Project project, string subject, string message, HttpRequest request, IUrlHelper helper)
        {
            if (CanSendProjectEmail(project))
            {
                IEnumerable<ProjectParticipant> participants =
                    await _context.ProjectParticipants
                                  .Include(part => part.User)
                                  .Where(part => part.ProjectId == project.Id && part.SubscribedToProjectEmails)
                                  .ToListAsync();

                _logger.LogInformation("sending project email for '{0}' on {1} to {2} users", project.Name, subject, participants.Count());

                string baseUrl = $"{request.Scheme}://{request.Host}{request.PathBase}";
                foreach (ProjectParticipant participant in participants)
                {
                    string unsubscribeLink = $"{baseUrl}{helper.Action("ChangeSubscriptionFromToken", "Projects", new { UserId = participant.UserId, ProjectId = project.Id, UnsubscribeToken = participant.UnsubscribeToken })}";
                    string userMessage = $"{HttpUtility.HtmlEncode(message)}<br><a href=\"{unsubscribeLink}\">Unsubscribe</a>";
                    userMessage.Replace("{firstname}", participant.User.FirstName);
                    userMessage.Replace("{lastname}", participant.User.LastName);
                    _emailSender.SendEmail(participant.User.Email, subject, userMessage);
                }

                IList<ApplicationUser> adminUsers = await _userManager.GetUsersInRoleAsync(Constants.AdminRole);
                foreach (ApplicationUser admin in adminUsers)
                {
                    string adminMessage = HttpUtility.HtmlEncode(message);
                    adminMessage.Replace("{firstname}", admin.FirstName);
                    adminMessage.Replace("{lastname}", admin.LastName);
                    _emailSender.SendEmail(admin.Email, subject, adminMessage);
                }

                project.NumberProjectEmailsSend += 1;
                await _context.SaveChangesAsync();

                _logger.LogInformation("done sending project email for '{0}' on {1} to {2} users", project.Name, subject, participants.Count());
            }
            else
                throw new InvalidOperationException("unable to send project e-mails, limit exceeded");
        }

        private IEnumerable<string> GetParticipantsCsv(Project project)
        {
            yield return "first-name;last-name;email";
            yield return GetParticipantCsvLine(project.Owner);
            foreach (ProjectParticipant participant in project.Participants)
                yield return GetParticipantCsvLine(participant.User);
        }

        private string GetParticipantCsvLine(ApplicationUser user)
            => $"{EscapeCsv(user?.FirstName)};{EscapeCsv(user?.LastName)};{EscapeCsv(user?.Email)}";

        private string EscapeCsv(string str)
            => $"\"{str?.Replace("\"", "\"\"")}\"";
    }
}