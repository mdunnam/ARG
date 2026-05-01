<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="robots" content="noindex, nofollow" />
<title>Member Profile &mdash; RestWell Patient Support Community</title>
<link rel="stylesheet" type="text/css" href="style.css" />
<script type="text/javascript">
(function () {
  if (sessionStorage.getItem('rwl_auth') !== '1') {
    window.location.replace('index.html');
    return;
  }

  /**
   * Routes to a specific member profile or the full member list,
   * based on query string params ?mode=viewprofile&u=username.
   */
  window.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var mode = params.get('mode');
    var u    = params.get('u');

    if (mode === 'viewprofile' && u) {
      // Hide member list, show specific profile
      document.getElementById('memberlist-view').style.display = 'none';
      var profile = document.getElementById('profile-' + u);
      if (profile) {
        profile.style.display = 'block';
        var name = profile.getAttribute('data-username') || u;
        document.title = name + ' \u2014 Member Profile \u2014 RestWell';
        document.getElementById('breadcrumb-current').innerHTML = 'Profile: ' + name;
      } else {
        document.getElementById('profile-notfound').style.display = 'block';
        document.getElementById('breadcrumb-current').innerHTML = 'Profile not found';
      }
    } else {
      // Show member list
      document.getElementById('memberlist-view').style.display = 'block';
      document.getElementById('breadcrumb-current').innerHTML = 'Member List';
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
    <a href="board.html">Forum Index</a> &raquo; <span id="breadcrumb-current">Members</span>
  </div>

  <div class="spacer"></div>

  <!-- ═══════════════════════════════════════════════════════════
       Member list view (default)
  ════════════════════════════════════════════════════════════ -->
  <div id="memberlist-view" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="5" class="catbg">Registered Members</td>
      </tr>
      <tr>
        <th style="width:160px;">Username</th>
        <th>Joined</th>
        <th style="text-align:center;">Posts</th>
        <th>Last Visit</th>
        <th>Location</th>
      </tr>
      <tr class="row1">
        <td><a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></td>
        <td>Mar 01, 2009</td>
        <td style="text-align:center;">14</td>
        <td>Sep 20, 2014</td>
        <td>&mdash;</td>
      </tr>
      <tr class="row2">
        <td><a href="memberlist.php?mode=viewprofile&amp;u=david_n">david_n</a></td>
        <td>Nov 05, 2009</td>
        <td style="text-align:center;">18</td>
        <td>Mar 20, 2015</td>
        <td>Wexler area</td>
      </tr>
      <tr class="row1">
        <td><a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></td>
        <td>Mar 22, 2010</td>
        <td style="text-align:center;">31</td>
        <td>Mar 14, 2015</td>
        <td>Harrow County</td>
      </tr>
      <tr class="row2">
        <td><a href="memberlist.php?mode=viewprofile&amp;u=lortiz">lortiz</a></td>
        <td>Apr 02, 2010</td>
        <td style="text-align:center;">47</td>
        <td><strong>Nov 04, 2019</strong></td>
        <td>Harrow County, GA</td>
      </tr>
      <tr class="row1">
        <td><a href="memberlist.php?mode=viewprofile&amp;u=jfranks">jfranks</a></td>
        <td>Jan 12, 2010</td>
        <td style="text-align:center;">14</td>
        <td>Apr 02, 2015</td>
        <td>&mdash;</td>
      </tr>
      <tr class="row2">
        <td><a href="memberlist.php?mode=viewprofile&amp;u=p_holloway">p_holloway</a></td>
        <td>Sep 14, 2011</td>
        <td style="text-align:center;">23</td>
        <td>Mar 12, 2015</td>
        <td>Harrow County</td>
      </tr>
      <tr class="row1">
        <td><a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></td>
        <td>Jun 07, 2012</td>
        <td style="text-align:center;">9</td>
        <td>Jan 08, 2015</td>
        <td>&mdash;</td>
      </tr>
    </table>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile not found
  ════════════════════════════════════════════════════════════ -->
  <div id="profile-notfound" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr class="row1">
        <td style="padding:12px;">The requested member profile could not be found. <a href="memberlist.php">Return to member list.</a></td>
      </tr>
    </table>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile: lortiz
  ════════════════════════════════════════════════════════════ -->
  <!-- user_account: lortiz | account_suspended: true | suspension_date: 2019-11-05 | reason: protocol_review | authorized_by: sys_admin -->
  <div id="profile-lortiz" class="profile-wrap" data-username="lortiz" style="display:none;">
    <div class="profile-head">Member Profile: lortiz</div>
    <div class="profile-body">
      <div class="profile-field"><span class="profile-label">Username:</span> <span class="profile-value">lortiz</span></div>
      <div class="profile-field"><span class="profile-label">Registered:</span> <span class="profile-value">April 2, 2010</span></div>
      <div class="profile-field"><span class="profile-label">Total posts:</span> <span class="profile-value">47</span></div>
      <div class="profile-field"><span class="profile-label">Last visit:</span> <span class="profile-value"><strong>November 4, 2019</strong></span></div>
      <div class="profile-field"><span class="profile-label">Location:</span> <span class="profile-value">Harrow County, GA</span></div>
      <div class="profile-field"><span class="profile-label">Occupation:</span> <span class="profile-value">Sleep Technician (former)</span></div>
      <div class="profile-field"><span class="profile-label">About:</span>
        <span class="profile-value">Former sleep technician at Somnatek Sleep Health Center. I joined this forum in 2010 to provide general support to former patients where I can. I cannot discuss study protocols or individual participant records in public threads. For records questions please contact Dorsal Health Holdings.</span>
      </div>
      <div class="profile-field"><span class="profile-label">Signature:</span>
        <span class="profile-value muted">L. Ortiz &mdash; Somnatek Sleep Health Center (2009&ndash;2014)</span>
      </div>
      <div style="margin-top:12px; text-align:right;">
        <a href="memberlist.php">&laquo; Back to member list</a>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile: margaret_h
  ════════════════════════════════════════════════════════════ -->
  <div id="profile-margaret_h" class="profile-wrap" data-username="margaret_h" style="display:none;">
    <div class="profile-head">Member Profile: margaret_h</div>
    <div class="profile-body">
      <div class="profile-field"><span class="profile-label">Username:</span> <span class="profile-value">margaret_h</span></div>
      <div class="profile-field"><span class="profile-label">Registered:</span> <span class="profile-value">March 22, 2010</span></div>
      <div class="profile-field"><span class="profile-label">Total posts:</span> <span class="profile-value">31</span></div>
      <div class="profile-field"><span class="profile-label">Last visit:</span> <span class="profile-value">March 14, 2015</span></div>
      <div class="profile-field"><span class="profile-label">Location:</span> <span class="profile-value">Harrow County</span></div>
      <div class="profile-field"><span class="profile-label">About:</span>
        <span class="profile-value">Former Somnatek patient. Enrolled in the longitudinal sleep study 2010 to 2012. If you're trying to get your records, calling Dorsal directly works better than email &mdash; email response time was several weeks for me. My study reference number if it helps anyone: SHC-INT-2009-07.</span>
      </div>
      <div style="margin-top:12px; text-align:right;">
        <a href="memberlist.php">&laquo; Back to member list</a>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile: david_n
  ════════════════════════════════════════════════════════════ -->
  <div id="profile-david_n" class="profile-wrap" data-username="david_n" style="display:none;">
    <div class="profile-head">Member Profile: david_n</div>
    <div class="profile-body">
      <div class="profile-field"><span class="profile-label">Username:</span> <span class="profile-value">david_n</span></div>
      <div class="profile-field"><span class="profile-label">Registered:</span> <span class="profile-value">November 5, 2009</span></div>
      <div class="profile-field"><span class="profile-label">Total posts:</span> <span class="profile-value">18</span></div>
      <div class="profile-field"><span class="profile-label">Last visit:</span> <span class="profile-value">March 20, 2015</span></div>
      <div class="profile-field"><span class="profile-label">Location:</span> <span class="profile-value">Wexler area</span></div>
      <div class="profile-field"><span class="profile-label">About:</span>
        <span class="profile-value">Protocol 7A participant 2009 to 2011. My study reference number was SHC-CST-2008-11. Based near Wexler University. Most of the study coordinators were from the university department. Happy to compare notes with other participants.</span>
      </div>
      <div style="margin-top:12px; text-align:right;">
        <a href="memberlist.php">&laquo; Back to member list</a>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile: jfranks
  ════════════════════════════════════════════════════════════ -->
  <div id="profile-jfranks" class="profile-wrap" data-username="jfranks" style="display:none;">
    <div class="profile-head">Member Profile: jfranks</div>
    <div class="profile-body">
      <div class="profile-field"><span class="profile-label">Username:</span> <span class="profile-value">jfranks</span></div>
      <div class="profile-field"><span class="profile-label">Registered:</span> <span class="profile-value">January 12, 2010</span></div>
      <div class="profile-field"><span class="profile-label">Total posts:</span> <span class="profile-value">14</span></div>
      <div class="profile-field"><span class="profile-label">Last visit:</span> <span class="profile-value">April 2, 2015</span></div>
      <div class="profile-field"><span class="profile-label">Occupation:</span> <span class="profile-value">Retired</span></div>
      <div class="profile-field"><span class="profile-label">About:</span>
        <span class="profile-value">Retired. Did the sleep study at Somnatek from 2010 to 2012. Mostly here for the CPAP support sections but also in the Protocol 7A group. Study ref: SHC-CPL-2010-14.</span>
      </div>
      <div style="margin-top:12px; text-align:right;">
        <a href="memberlist.php">&laquo; Back to member list</a>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile: p_holloway
  ════════════════════════════════════════════════════════════ -->
  <div id="profile-p_holloway" class="profile-wrap" data-username="p_holloway" style="display:none;">
    <div class="profile-head">Member Profile: p_holloway</div>
    <div class="profile-body">
      <div class="profile-field"><span class="profile-label">Username:</span> <span class="profile-value">p_holloway</span></div>
      <div class="profile-field"><span class="profile-label">Registered:</span> <span class="profile-value">September 14, 2011</span></div>
      <div class="profile-field"><span class="profile-label">Total posts:</span> <span class="profile-value">23</span></div>
      <div class="profile-field"><span class="profile-label">Last visit:</span> <span class="profile-value">March 12, 2015</span></div>
      <div class="profile-field"><span class="profile-label">Location:</span> <span class="profile-value">Harrow County</span></div>
      <div class="profile-field"><span class="profile-label">About:</span>
        <span class="profile-value">Protocol 7A participant 2011 to 2013. Trying to get my complete records from Dorsal Health Holdings. Study reference: SHC-SHG-2009-18. If you're a former Somnatek patient and have questions about the records transfer process, feel free to message me.</span>
      </div>
      <div style="margin-top:12px; text-align:right;">
        <a href="memberlist.php">&laquo; Back to member list</a>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile: r_castello
  ════════════════════════════════════════════════════════════ -->
  <div id="profile-r_castello" class="profile-wrap" data-username="r_castello" style="display:none;">
    <div class="profile-head">Member Profile: r_castello</div>
    <div class="profile-body">
      <div class="profile-field"><span class="profile-label">Username:</span> <span class="profile-value">r_castello</span></div>
      <div class="profile-field"><span class="profile-label">Registered:</span> <span class="profile-value">June 7, 2012</span></div>
      <div class="profile-field"><span class="profile-label">Total posts:</span> <span class="profile-value">9</span></div>
      <div class="profile-field"><span class="profile-label">Last visit:</span> <span class="profile-value">January 8, 2015</span></div>
      <div class="profile-field"><span class="profile-label">About:</span>
        <span class="profile-value">Enrolled in Somnatek Protocol 7A from June 2012 through August 2013. One of the later participants in the active study period. Study reference SHC-IAR-2011-31. Records from Dorsal arrived but were incomplete.</span>
      </div>
      <div style="margin-top:12px; text-align:right;">
        <a href="memberlist.php">&laquo; Back to member list</a>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       Profile: rwl_admin
  ════════════════════════════════════════════════════════════ -->
  <div id="profile-rwl_admin" class="profile-wrap" data-username="rwl_admin" style="display:none;">
    <div class="profile-head">Member Profile: rwl_admin</div>
    <div class="profile-body">
      <div class="profile-field"><span class="profile-label">Username:</span> <span class="profile-value">rwl_admin</span></div>
      <div class="profile-field"><span class="profile-label">Registered:</span> <span class="profile-value">March 1, 2009</span></div>
      <div class="profile-field"><span class="profile-label">Total posts:</span> <span class="profile-value">14</span></div>
      <div class="profile-field"><span class="profile-label">Last visit:</span> <span class="profile-value">September 20, 2014</span></div>
      <div class="profile-field"><span class="profile-label">About:</span>
        <span class="profile-value">Site administrator. This account is used for moderation and announcements only. For questions about site access, use the contact form.</span>
      </div>
      <div style="margin-top:12px; text-align:right;">
        <a href="memberlist.php">&laquo; Back to member list</a>
      </div>
    </div>
  </div>

  <div id="page-footer">
    RestWellBoard v2.0.22 &nbsp;&bull;&nbsp; &copy; 2009&ndash;2014 RestWell Patient Support Community &nbsp;&bull;&nbsp; Archive mode &mdash; read only
  </div>

</div>
</body>
</html>
