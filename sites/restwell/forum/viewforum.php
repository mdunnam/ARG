<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="robots" content="noindex, nofollow" />
<title>Forum &mdash; RestWell Patient Support Community</title>
<link rel="stylesheet" type="text/css" href="style.css" />
<script type="text/javascript">
(function () {
  if (sessionStorage.getItem('rwl_auth') !== '1') {
    window.location.replace('index.html');
    return;
  }

  /** Routes the page to show the correct forum board based on ?f= query param. */
  window.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var f = params.get('f') || '1';

    document.querySelectorAll('.forum-container').forEach(function (el) {
      el.style.display = 'none';
    });

    var target = document.getElementById('forum-' + f);
    if (target) {
      target.style.display = 'block';
      var title = target.getAttribute('data-title');
      if (title) {
        document.title = title + ' &mdash; RestWell Patient Support Community';
        document.getElementById('breadcrumb-current').innerHTML = title;
      }
    } else {
      document.getElementById('forum-notfound').style.display = 'block';
      document.getElementById('breadcrumb-current').innerHTML = 'Board not found';
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
    <a href="board.html">Forum Index</a> &raquo; <span id="breadcrumb-current">Board</span>
  </div>

  <div class="spacer"></div>

  <!-- ═══════════════════════════════════════════════════════════
       f=1: General Support
  ════════════════════════════════════════════════════════════ -->
  <div id="forum-1" class="forum-container" data-title="General Support" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="5" class="catbg">General Support</td>
      </tr>
      <tr>
        <th class="topic-icon">&nbsp;</th>
        <th style="width:100%;">Topic</th>
        <th class="topic-stats">Replies</th>
        <th class="topic-stats">Views</th>
        <th class="topic-lastpost">Last Post</th>
      </tr>
      <tr class="row1">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=8">Clinic closed &mdash; what do we do now?</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
        </td>
        <td class="topic-stats">4</td>
        <td class="topic-stats">87</td>
        <td class="topic-lastpost">Oct 12, 2014<br />by <a href="memberlist.php?mode=viewprofile&amp;u=p_holloway">p_holloway</a></td>
      </tr>
      <tr class="row2">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=31">Records request &mdash; Dorsal Health Holdings</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=jfranks">jfranks</a></div>
        </td>
        <td class="topic-stats">2</td>
        <td class="topic-stats">41</td>
        <td class="topic-lastpost">Jan 08, 2015<br />by <a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></td>
      </tr>
      <tr class="row1">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=6">New patient introductions</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></div>
        </td>
        <td class="topic-stats">7</td>
        <td class="topic-stats">203</td>
        <td class="topic-lastpost">Mar 04, 2013<br />by <a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></td>
      </tr>
      <tr class="row2">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=7">Finding a new sleep specialist after Somnatek</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=david_n">david_n</a></div>
        </td>
        <td class="topic-stats">3</td>
        <td class="topic-stats">55</td>
        <td class="topic-lastpost">Nov 15, 2014<br />by <a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></td>
      </tr>
    </table>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       f=2: Study Participants — Protocol 7A
  ════════════════════════════════════════════════════════════ -->
  <div id="forum-2" class="forum-container" data-title="Study Participants &#8212; Protocol 7A" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="5" class="catbg">Study Participants &mdash; Protocol 7A</td>
      </tr>
      <tr>
        <th class="topic-icon">&nbsp;</th>
        <th style="width:100%;">Topic</th>
        <th class="topic-stats">Replies</th>
        <th class="topic-stats">Views</th>
        <th class="topic-lastpost">Last Post</th>
      </tr>
      <tr class="row2">
        <td class="topic-icon"><span class="topic-locked">&#128274;</span></td>
        <td>
          <div class="topic-title"><span class="muted">Re: active recall &mdash; for anyone with a VIS number</span></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=L.O.2019">L.O.2019</a> &mdash; <em>Thread archived pending review</em></div>
        </td>
        <td class="topic-stats">0</td>
        <td class="topic-stats">&mdash;</td>
        <td class="topic-lastpost">&mdash;</td>
      </tr>
      <tr class="row1">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=14">Is anyone else still getting the alerts?</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=p_holloway">p_holloway</a></div>
        </td>
        <td class="topic-stats">5</td>
        <td class="topic-stats">312</td>
        <td class="topic-lastpost"><strong>Nov 04, 2019</strong><br />by <a href="memberlist.php?mode=viewprofile&amp;u=lortiz">lortiz</a></td>
      </tr>
      <tr class="row2">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=42">EEC scores &mdash; does anyone know what these mean?</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
        </td>
        <td class="topic-stats">4</td>
        <td class="topic-stats">148</td>
        <td class="topic-lastpost">Sep 22, 2013<br />by <a href="memberlist.php?mode=viewprofile&amp;u=lortiz">lortiz</a></td>
      </tr>
      <tr class="row1">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=23">The same hallway</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=david_n">david_n</a></div>
        </td>
        <td class="topic-stats">3</td>
        <td class="topic-stats">94</td>
        <td class="topic-lastpost">Jul 01, 2013<br />by <a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></td>
      </tr>
    </table>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       f=3: Equipment & CPAP
  ════════════════════════════════════════════════════════════ -->
  <div id="forum-3" class="forum-container" data-title="Equipment &amp; CPAP Support" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="5" class="catbg">Equipment &amp; CPAP Support</td>
      </tr>
      <tr>
        <th class="topic-icon">&nbsp;</th>
        <th style="width:100%;">Topic</th>
        <th class="topic-stats">Replies</th>
        <th class="topic-stats">Views</th>
        <th class="topic-lastpost">Last Post</th>
      </tr>
      <tr class="row1">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=11">CPAP settings after study participation</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></div>
        </td>
        <td class="topic-stats">2</td>
        <td class="topic-stats">62</td>
        <td class="topic-lastpost">Nov 09, 2014<br />by <a href="memberlist.php?mode=viewprofile&amp;u=r_castello">r_castello</a></td>
      </tr>
      <tr class="row2">
        <td class="topic-icon">&#9654;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=9">Mask fitting questions</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=margaret_h">margaret_h</a></div>
        </td>
        <td class="topic-stats">5</td>
        <td class="topic-stats">114</td>
        <td class="topic-lastpost">Aug 17, 2013<br />by <a href="memberlist.php?mode=viewprofile&amp;u=jfranks">jfranks</a></td>
      </tr>
    </table>
  </div>

  <!-- ═══════════════════════════════════════════════════════════
       f=4: Announcements
  ════════════════════════════════════════════════════════════ -->
  <div id="forum-4" class="forum-container" data-title="Announcements" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="5" class="catbg">Announcements</td>
      </tr>
      <tr>
        <th class="topic-icon">&nbsp;</th>
        <th style="width:100%;">Topic</th>
        <th class="topic-stats">Replies</th>
        <th class="topic-stats">Views</th>
        <th class="topic-lastpost">Last Post</th>
      </tr>
      <tr class="rowann">
        <td class="topic-icon">&#9733;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=3">Update: Somnatek Sleep Health Center closure</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a> &mdash; <em>Announcement</em></div>
        </td>
        <td class="topic-stats">0</td>
        <td class="topic-stats">204</td>
        <td class="topic-lastpost">Sep 20, 2014<br />by <a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></td>
      </tr>
      <tr class="rowann">
        <td class="topic-icon">&#9733;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=2">Forum rules and posting guidelines</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a> &mdash; <em>Announcement</em></div>
        </td>
        <td class="topic-stats">0</td>
        <td class="topic-stats">87</td>
        <td class="topic-lastpost">Mar 01, 2009<br />by <a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></td>
      </tr>
      <tr class="rowann">
        <td class="topic-icon">&#9733;</td>
        <td>
          <div class="topic-title"><a href="viewtopic.php?t=1">Welcome to RestWell Support Community</a></div>
          <div class="topic-meta">by <a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a> &mdash; <em>Announcement</em></div>
        </td>
        <td class="topic-stats">0</td>
        <td class="topic-stats">312</td>
        <td class="topic-lastpost">Mar 01, 2009<br />by <a href="memberlist.php?mode=viewprofile&amp;u=rwl_admin">rwl_admin</a></td>
      </tr>
    </table>
  </div>

  <!-- Not found fallback -->
  <div id="forum-notfound" style="display:none;">
    <table class="forumline" cellspacing="0" cellpadding="0">
      <tr class="row1">
        <td style="padding:12px;">The requested forum board could not be found. <a href="board.html">Return to forum index.</a></td>
      </tr>
    </table>
  </div>

  <div id="page-footer">
    RestWellBoard v2.0.22 &nbsp;&bull;&nbsp; &copy; 2009&ndash;2014 RestWell Patient Support Community &nbsp;&bull;&nbsp; Archive mode &mdash; read only
  </div>

</div>
</body>
</html>
