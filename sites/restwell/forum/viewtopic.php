<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="robots" content="noindex, nofollow" />
<title>Topic &mdash; RestWell Patient Support Community</title>
<link rel="stylesheet" type="text/css" href="style.css" />
<script type="text/javascript">
(function () {
  if (sessionStorage.getItem('rwl_auth') !== '1') {
    window.location.replace('index.html');
    return;
  }

  /** Routes the page to show the correct thread based on ?t= query param. */
  window.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var t = params.get('t') || '8';

    document.querySelectorAll('.topic-container').forEach(function (el) {
      el.style.display = 'none';
    });

    var target = document.getElementById('topic-' + t);
    if (target) {
      target.style.display = 'block';
      var title = target.getAttribute('data-title');
      if (title) {
        document.title = title + ' \u2014 RestWell Patient Support Community';
        document.getElementById('breadcrumb-board').innerHTML = target.getAttribute('data-board-link') || 'Board';
        document.getElementById('breadcrumb-current').innerHTML = title;
      }
    } else {
      document.getElementById('topic-notfound').style.display = 'block';
      document.getElementById('breadcrumb-board').innerHTML = 'Board';
      document.getElementById('breadcrumb-current').innerHTML = 'Topic not found';
    }
  });
}());
</script>
</head>
<body>
<div id="page-wrap">

  <div id="site-header">
    <div class="site-title">RestWell Patient Support Community</div>
    <div class="site-subtitle">Sleep health support for patients and caregivers &mdash; Established 2009</div>
  </div>

  <div id="nav-bar">
    <a href="board.html">Forum Index</a>
    <a href="memberlist.php">Member List</a>
    <a href="index.html" onclick="sessionStorage.removeItem('rwl_auth')">Log out</a>
  </div>

  <div id="breadcrumb">
    <a href="board.html">Forum Index</a> &raquo;
    <span id="breadcrumb-board">Board</span> &raquo;
    <span id="breadcrumb-current">Topic</span>
  </div>

  <div class="spacer"></div>

  <!-- ═══════════════════════════════════════════════════════════
       Not found
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-notfound" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr class="row1">
        <td style="padding:12px;">The requested topic could not be found. <a href="board.html">Return to forum index.</a></td>
      </tr>
    </table>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=1: Welcome to RestWell
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-1" class="topic-container"
       data-title="Welcome to RestWell Support Community"
       data-board-link="&lt;a href='viewforum.php?f=4'&gt;Announcements&lt;/a&gt;"
       style="display:none;">
    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">Welcome to RestWell Support Community</span>
          <span class="post-meta">Posted: March 1, 2009 &nbsp; Views: 312</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></div>
          <div class="author-rank">Administrator</div>
          <div class="author-stats">Posts: 14<br />Joined: Mar 2009</div>
        </td>
        <td class="post-body">
          <p>Welcome to the RestWell Patient Support Community.</p>
          <p>This forum was established in March 2009 to provide a space for patients undergoing sleep studies or receiving sleep treatment to connect with others, ask questions, and share experiences. We are not affiliated with any specific clinic or treatment provider.</p>
          <p>All members are encouraged to review the <a href="viewtopic.php?t=2">forum rules</a> before posting. Please keep all discussions respectful and remember that nothing discussed here constitutes medical advice.</p>
          <p>We hope you find this community helpful.</p>
          <div class="post-sig">rwl_admin &mdash; RestWell Patient Support Community</div>
        </td>
      </tr>
    </table>
    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=2: Forum rules
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-2" class="topic-container"
       data-title="Forum rules and posting guidelines"
       data-board-link="&lt;a href='viewforum.php?f=4'&gt;Announcements&lt;/a&gt;"
       style="display:none;">
    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">Forum rules and posting guidelines</span>
          <span class="post-meta">Posted: March 1, 2009 &nbsp; Views: 87</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></div>
          <div class="author-rank">Administrator</div>
          <div class="author-stats">Posts: 14<br />Joined: Mar 2009</div>
        </td>
        <td class="post-body">
          <p><strong>RestWell Community Guidelines</strong></p>
          <p>1. No medical advice. Members should not give or request specific medical advice. Consult a qualified provider for all medical questions.</p>
          <p>2. Be respectful. Personal attacks, harassment, and deliberately misleading information are not permitted.</p>
          <p>3. Protect your privacy. Do not share personal medical information, full names, or contact details in public posts.</p>
          <p>4. Study discussions. Members may discuss their experiences in clinical research programs in general terms. Do not post or request confidential study materials, protocol documents, or individual participant records.</p>
          <p>5. Moderation. Posts that violate these guidelines will be removed. Accounts may be suspended at moderator discretion.</p>
          <p>These guidelines apply to all sections of the forum.</p>
          <div class="post-sig">rwl_admin &mdash; RestWell Patient Support Community</div>
        </td>
      </tr>
    </table>
    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=3: Somnatek closure announcement
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-3" class="topic-container"
       data-title="Update: Somnatek Sleep Health Center closure"
       data-board-link="&lt;a href='viewforum.php?f=4'&gt;Announcements&lt;/a&gt;"
       style="display:none;">
    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">Update: Somnatek Sleep Health Center closure</span>
          <span class="post-meta">Posted: September 20, 2014 &nbsp; Views: 204</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></div>
          <div class="author-rank">Administrator</div>
          <div class="author-stats">Posts: 14<br />Joined: Mar 2009</div>
        </td>
        <td class="post-body">
          <p>We have received several questions about the closure of Somnatek Sleep Health Center, which ceased operations on September 18, 2014.</p>
          <p>Patient records and ongoing care responsibilities have been transferred to <strong>Dorsal Health Holdings LLC</strong>. Former patients requiring records or referrals should contact Dorsal directly. Contact information was included in the closure notice mailed to active patients in July 2014. The notice is also available at <a href="http://www.somnatek.org/closure-notice.html">somnatek.org/closure-notice.html</a>.</p>
          <p>This forum will remain available as an archival resource. New member registrations have been suspended. Existing members may continue to post.</p>
          <p>We understand this is a difficult transition for many patients, particularly those who were involved in long-term programs. If you have questions that cannot be addressed through Dorsal, please use the contact form below.</p>
          <div class="post-sig">rwl_admin &mdash; RestWell Patient Support Community</div>
        </td>
      </tr>
    </table>
    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=8: Clinic closed — what do we do now?
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-8" class="topic-container"
       data-title="Clinic closed &#8212; what do we do now?"
       data-board-link="&lt;a href='viewforum.php?f=1'&gt;General Support&lt;/a&gt;"
       style="display:none;">

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">Clinic closed &mdash; what do we do now?</span>
          <span class="post-meta">Posted: September 22, 2014 &nbsp; Views: 87</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 31<br />Joined: Mar 2010</div>
        </td>
        <td class="post-body">
          <p>I got the closure notice in July but I assumed they would make arrangements. Now the number is disconnected and the email bounces. I have a follow-up appointment that was scheduled for October and I have no idea what to do about it.</p>
          <p>I've read the notice on the website and it says to contact Dorsal Health Holdings for records. Has anyone actually gotten through to them?</p>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="post-foot">
          Reply #1 &nbsp;&mdash;&nbsp; david_n &nbsp;&mdash;&nbsp; September 24, 2014
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=david_n">david_n</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 18<br />Joined: Nov 2009</div>
        </td>
        <td class="post-body">
          <p>I called Dorsal yesterday. Got a general intake line. They confirmed they have the records from Somnatek but said it would be 4-6 weeks to process a records request. They gave me a case number.</p>
          <p>For ongoing care they said I'd need to find a new sleep medicine provider and Dorsal would send my records directly. They were not helpful about research study follow-up specifically. I got the impression they don't know much about the study programs.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=jfranks">jfranks</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 14<br />Joined: Jan 2010</div>
        </td>
        <td class="post-body">
          <p>Same experience. They took my info and said the same 4-6 week window. I mentioned the Protocol 7A study and there was a pause and then the person said they'd make a note on my file. They did not say what kind of note.</p>
          <p>I found a new sleep specialist in the area through my regular doctor. Recommend starting that process now rather than waiting.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 31<br />Joined: Mar 2010</div>
        </td>
        <td class="post-body">
          <p>Update: I got through to Dorsal and submitted my records request. They confirmed they have patient files from Somnatek. No specific timeline for the study-related materials.</p>
          <p>My new doctor says she can work from whatever records I receive. I'll post again if anything useful comes back.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=p_holloway">p_holloway</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 23<br />Joined: Sep 2011</div>
        </td>
        <td class="post-body">
          <p>I submitted the records request. Still waiting. I'm not seeing a new doctor yet.</p>
          <p>I'm still having the same sleep experiences I was having during the study. Not different. The same ones. I don't know if that's expected or not. Nobody has told me whether to be concerned. My records request is still pending so I can't ask my old doctor because there is no old doctor anymore.</p>
        </td>
      </tr>
    </table>

    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=11: CPAP settings after study participation
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-11" class="topic-container"
       data-title="CPAP settings after study participation"
       data-board-link="&lt;a href='viewforum.php?f=3'&gt;Equipment &amp;amp; CPAP Support&lt;/a&gt;"
       style="display:none;">

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">CPAP settings after study participation</span>
          <span class="post-meta">Posted: November 4, 2014 &nbsp; Views: 62</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 9<br />Joined: Jun 2012</div>
        </td>
        <td class="post-body">
          <p>My CPAP was set during my Somnatek study participation. The settings were adjusted several times during the study. Now that the clinic is closed I'm not sure if the current settings are still appropriate or if I need to get a new titration study done.</p>
          <p>My pressure is set at 10.5 cm/H2O. Compliance is good (96% over the last 90 days). I don't have a new sleep doctor yet.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=lortiz">lortiz</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 47<br />Joined: Apr 2010</div>
        </td>
        <td class="post-body">
          <p>Good compliance at your current settings is a reasonable sign that the titration is still appropriate for you. In general, CPAP settings don't need to be changed frequently if your symptoms are controlled and your compliance data looks good.</p>
          <p>That said, it's worth establishing care with a new sleep medicine provider who can review your overnight data and order a new study if needed. Most providers will accept records from a previous clinic as a starting point. Dorsal can provide a summary of your titration history from the study records.</p>
          <p>I can't give you a specific pressure recommendation. Your new doctor will need to make that judgment.</p>
          <div class="post-sig">L. Ortiz &mdash; former sleep technician, Somnatek Sleep Health Center (2009&ndash;2014)</div>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 9<br />Joined: Jun 2012</div>
        </td>
        <td class="post-body">
          <p>Thank you. I've started the records request process with Dorsal. I'll find a new provider in the meantime.</p>
        </td>
      </tr>
    </table>

    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=14: Is anyone else still getting the alerts?
  ════════════════════════════════════════════════════════════ -->
  <!-- thread flagged for administrative review 2019-11-05. lortiz account suspended same date. -->
  <div id="topic-14" class="topic-container"
       data-title="Is anyone else still getting the alerts?"
       data-board-link="&lt;a href='viewforum.php?f=2'&gt;Study Participants &amp;mdash; Protocol 7A&lt;/a&gt;"
       style="display:none;">

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">Is anyone else still getting the alerts?</span>
          <span class="post-meta">Posted: March 12, 2015 &nbsp; Views: 312</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=p_holloway">p_holloway</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 23<br />Joined: Sep 2011</div>
        </td>
        <td class="post-body">
          <p>I completed my participation in the Protocol 7A longitudinal study at Somnatek in August 2013. The clinic closed in September 2014. I've been trying to figure out if what I'm experiencing now is expected or whether it's something I should report to someone, except I'm not sure who I would report it to at this point.</p>
          <p>Since the study ended, I've been having very consistent sleep patterns. More consistent than before the study started. The consistency itself isn't what concerns me. What concerns me is that the patterns are identical to what was documented during the sessions. Not similar. Identical. Same environment. Same details. Same room. Same direction the hallway goes.</p>
          <p>I submitted a records request through Dorsal six months ago. The records came back. Pages from one of the documents were missing. The pages that were returned don't explain the scoring methodology.</p>
          <p>Has anyone else in the protocol group experienced something like this? Specifically: the environment hasn't stopped. After the study. After the clinic closed. Still the same one.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 31<br />Joined: Mar 2010</div>
        </td>
        <td class="post-body">
          <p>Yes. I completed in 2012 and it hasn't changed. I thought it was just how my sleep had reset after the monitoring period. My new doctor says my sleep architecture is "very regular" and flagged it as a positive outcome. She didn't have anything else to say about the specific content.</p>
          <p>The incomplete records happened to me as well. I got most of the intake forms and the PSG summaries. Some of the later session notes were not included. I've followed up twice with Dorsal. The second time they said the file was complete as received.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=david_n">david_n</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 18<br />Joined: Nov 2009</div>
        </td>
        <td class="post-body">
          <p>Same. The study technician — I think her name was Ortiz — told me at my final session that some participants experience what she called "extended environmental retention." She said it was consistent with a positive study outcome. I didn't ask what it meant at the time.</p>
          <p>I've had the same environment since month three of the study. I stopped documenting it because nothing changes. Hallway. Blue door on the left. Room at the end. I haven't tried to go into the room since the study ended.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=jfranks">jfranks</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 14<br />Joined: Jan 2010</div>
        </td>
        <td class="post-body">
          <p>I've had something similar but it's less frequent than it was during the study. I had the same room. The number on the door. I've seen it in the last few months, less than during the active sessions.</p>
          <p>I'm not sure if that's better or not. I don't have a frame of reference for what's expected post-study. None of the paperwork I received from Dorsal covers this.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 9<br />Joined: Jun 2012</div>
        </td>
        <td class="post-body">
          <p>Coming back to this thread. I had a follow-up with a new sleep specialist last week. She reviewed my PSG data from the study period and noted that my overnight readings show what she described as "unusual but stable environmental consistency indicators." She didn't explain what that meant. I asked. She said she'd consult with a colleague and follow up. She hasn't followed up.</p>
          <p>I also looked up Protocol 7A on Wexler University's research registry. The study was removed from the registry. There's no reference to it on their current research pages. I emailed the department. I haven't received a reply.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=lortiz">lortiz</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 47<br />Joined: Apr 2010</div>
        </td>
        <td class="post-body">
          <p>I'm still monitoring participant accounts. If any of you receive a formal recall notice, please respond to it through the portal. The study has not &mdash;</p>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="post-foot">
          November 4, 2019 &nbsp;&mdash;&nbsp; Last post in this thread
        </td>
      </tr>
    </table>

    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=23: The same hallway
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-23" class="topic-container"
       data-title="The same hallway"
       data-board-link="&lt;a href='viewforum.php?f=2'&gt;Study Participants &amp;mdash; Protocol 7A&lt;/a&gt;"
       style="display:none;">

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">The same hallway</span>
          <span class="post-meta">Posted: June 15, 2013 &nbsp; Views: 94</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=david_n">david_n</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 18<br />Joined: Nov 2009</div>
        </td>
        <td class="post-body">
          <p>I'm currently in month nine of the Protocol 7A study at Somnatek. I want to ask something but I don't know how to phrase it without it sounding unusual, so I'll just describe it directly.</p>
          <p>In my study sessions, I consistently report a specific environment. The technician refers to it as "the indexed space." There is a hallway. The hallway bends to the left. There is a blue door on the left side of the hallway. I have reported this same configuration in every session since month three. The technician marks it on the checklist and moves on. She has not commented on it other than to confirm that I'm describing the same environment as previous sessions.</p>
          <p>I know there are other Protocol 7A participants in this community. I'm not asking whether this is normal. I want to know whether it's the same hallway.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 31<br />Joined: Mar 2010</div>
        </td>
        <td class="post-body">
          <p>Yes. Same hallway. I've been in the study since January. I described it to the technician at session eight and she made a note and moved on without comment.</p>
          <p>Blue door on the left side, yes. I've described it using those exact words in at least three sessions.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=p_holloway">p_holloway</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 23<br />Joined: Sep 2011</div>
        </td>
        <td class="post-body">
          <p>Same. The hall always bends left. The blue door is on the left. I have not tried to open it. The technician's checklist at my session ten review included a question about the blue door specifically. I answered yes. She noted it and continued.</p>
          <p>I asked after session ten whether the question about the blue door was standard. She said it was part of the environmental consistency evaluation and that my responses indicated I was familiarized with the indexed space. I don't know what that means.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 9<br />Joined: Jun 2012</div>
        </td>
        <td class="post-body">
          <p>I'm a more recent participant, month four. I reported the same environment at session three. My session notes describe it as an initial access confirmation. I don't know what that means.</p>
          <p>I've stopped trying to figure out what room is at the end of the hallway.</p>
        </td>
      </tr>
    </table>

    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=31: Records request — Dorsal Health Holdings
  ════════════════════════════════════════════════════════════ -->
  <div id="topic-31" class="topic-container"
       data-title="Records request &#8212; Dorsal Health Holdings"
       data-board-link="&lt;a href='viewforum.php?f=1'&gt;General Support&lt;/a&gt;"
       style="display:none;">

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">Records request &mdash; Dorsal Health Holdings</span>
          <span class="post-meta">Posted: December 1, 2014 &nbsp; Views: 41</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=jfranks">jfranks</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 14<br />Joined: Jan 2010</div>
        </td>
        <td class="post-body">
          <p>For anyone still trying to get records from the closure, here's what worked for me. Call the Dorsal intake line directly rather than using the email. Email response time is several weeks. Phone call got me a case number same day.</p>
          <p>You'll need: full name, date of birth, last treatment date at Somnatek, and the name of the treating physician. For study participants they'll also ask for your study reference number if you have it.</p>
          <p>Timeline for me was about five weeks from case creation to records delivery.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 31<br />Joined: Mar 2010</div>
        </td>
        <td class="post-body">
          <p>Confirming the phone-call approach works. Took me closer to six weeks but the records did arrive. They included the PSG summaries, intake forms, and most of the session notes.</p>
          <p>I say most because a few things were missing. The technician assessment forms for my later sessions (from 2012) were not included. When I called to follow up, Dorsal said the file was complete as received from Somnatek. They couldn't tell me whether the missing items were never transferred or were part of the original file.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 9<br />Joined: Jun 2012</div>
        </td>
        <td class="post-body">
          <p>My records arrived last week. I got the standard clinical forms and most of the session documentation. One document in the set was incomplete. It came with a note that said pages 3-4 of the document had a retrieval error and could not be included. It referenced a block read error. The document was described in the cover sheet as an internal administrative file.</p>
          <p>I called Dorsal about it. They said to contact the clinic directly for the full document. The clinic is closed. I don't know what else to do about it.</p>
        </td>
      </tr>
    </table>

    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       t=42: EEC scores — does anyone know what these mean?
  ════════════════════════════════════════════════════════════ -->
  <!-- note: this thread was flagged for protocol review 2013-09-25. lortiz account notified. -->
  <div id="topic-42" class="topic-container"
       data-title="EEC scores &#8212; does anyone know what these mean?"
       data-board-link="&lt;a href='viewforum.php?f=2'&gt;Study Participants &amp;mdash; Protocol 7A&lt;/a&gt;"
       style="display:none;">

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="2" class="post-head">
          <span class="post-subject">EEC scores &mdash; does anyone know what these mean?</span>
          <span class="post-meta">Posted: September 8, 2013 &nbsp; Views: 148</span>
        </td>
      </tr>
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 31<br />Joined: Mar 2010</div>
        </td>
        <td class="post-body">
          <p>I was given a printed copy of my session summary after my last study visit. The summary includes a row called "EEC" with scores listed by session. Mine started at 2/5 in session one and went up steadily. By session fourteen I was at 5/5, and the notes say the score was consistent for the remaining sessions.</p>
          <p>The technician couldn't explain it when I asked. She said it was an internal assessment metric. The printed materials I was given don't define it. I've looked it up and can't find anything about an "EEC" score in relation to sleep studies.</p>
          <p>Does anyone else have these on their summary? Does anyone know what it stands for or what the scoring criteria are?</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=p_holloway">p_holloway</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 23<br />Joined: Sep 2011</div>
        </td>
        <td class="post-body">
          <p>I have it on my summary too. Mine reached 5/5 by session fifteen. It stayed there for all remaining sessions.</p>
          <p>I also asked at the time and was told it was an internal metric. My session notes from that session have a margin note that says "EC-004 review complete." I don't know what that refers to.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=lortiz">lortiz</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 47<br />Joined: Apr 2010</div>
        </td>
        <td class="post-body">
          <p>I can't discuss specific study assessment methods or scoring criteria in a public forum. That's true for all internal protocol materials. I'm not in a position to explain what the scores mean or how they're derived.</p>
          <p>If you have questions about your study records, the appropriate channel is your treating physician or, after the study period, Dorsal Health Holdings for the record transfer.</p>
          <div class="post-sig">L. Ortiz &mdash; former sleep technician, Somnatek Sleep Health Center (2009&ndash;2014)</div>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=jfranks">jfranks</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 14<br />Joined: Jan 2010</div>
        </td>
        <td class="post-body">
          <p>Mine went up to 5/5 also. Reached it around session twelve I think. I don't have the summary in front of me.</p>
          <p>I assumed it was a compliance metric. Like whether I was following study instructions. Seeing that everyone else who has replied also reached 5/5 makes me think it's measuring something specific that multiple participants are doing, or experiencing, the same way.</p>
        </td>
      </tr>
    </table>

    <table class="post-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="post-author">
          <div class="author-name"><a href="memberlist.php?mode=viewprofile&amp;u=lortiz">lortiz</a></div>
          <div class="author-rank">Member</div>
          <div class="author-stats">Posts: 47<br />Joined: Apr 2010</div>
        </td>
        <td class="post-body">
          <p>The scores indicate successful environmental familiarization.</p>
          <div class="post-sig">L. Ortiz &mdash; former sleep technician, Somnatek Sleep Health Center (2009&ndash;2014)</div>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="post-foot">
          September 22, 2013 &nbsp;&mdash;&nbsp; Last post in this thread
        </td>
      </tr>
    </table>

    <div class="reply-notice">This forum is in archive mode. New posts are not accepted.</div>
  </div>

  <div id="page-footer">
    RestWellBoard v2.0.22 &nbsp;&bull;&nbsp; &copy; 2009&ndash;2014 RestWell Patient Support Community &nbsp;&bull;&nbsp; Archive mode &mdash; read only
  </div>

</div>
</body>
</html>
